use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::Mutex;
use tauri::Emitter;

static ACTIVE_PID: Mutex<Option<u32>> = Mutex::new(None);

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VideoInfo {
    pub path: String,
    pub filename: String,
    pub size_mb: f64,
    pub duration_secs: f64,
    pub audio_bitrate_kbps: u32,
    pub is_hdr: bool,
    pub is_10bit: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EncoderInfo {
    pub encoder: String,
    pub label: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemInfo {
    pub ffmpeg_path: String,
    pub ffmpeg_source: String,
    pub ffprobe_path: String,
    pub ffprobe_source: String,
    pub encoder: EncoderInfo,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProgressPayload {
    pub path: String,
    pub progress: f64,
    pub speed: String,
    pub eta: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CompressionResult {
    pub output_path: String,
    pub output_size_mb: f64,
    pub compression_ratio_pct: f64,
}

fn get_bin_path(binary: &str) -> (PathBuf, String) {
    let bin_name = if cfg!(target_os = "windows") {
        format!("{}.exe", binary)
    } else {
        binary.to_string()
    };

    if let Some(path_var) = std::env::var_os("PATH") {
        for dir in std::env::split_paths(&path_var) {
            let candidate = dir.join(&bin_name);
            if candidate.is_file() {
                return (candidate, "PATH".to_string());
            }
        }
    }

    if let Ok(current_exe) = std::env::current_exe() {
        if let Some(exe_dir) = current_exe.parent() {
            let candidate = exe_dir.join(&bin_name);
            if candidate.is_file() {
                return (candidate, "Exe Folder".to_string());
            }
            let candidate_bin = exe_dir.join("bin").join(&bin_name);
            if candidate_bin.is_file() {
                return (candidate_bin, "Local bin".to_string());
            }
            let parent_bin = exe_dir.join("..").join("bin").join(&bin_name);
            if parent_bin.is_file() {
                return (parent_bin, "Parent bin".to_string());
            }
            let root_bin = exe_dir.join("..").join("..").join("bin").join(&bin_name);
            if root_bin.is_file() {
                return (root_bin, "Root bin".to_string());
            }
        }
    }

    let local_direct = Path::new("bin").join(&bin_name);
    if local_direct.is_file() {
        return (local_direct, "Working dir bin".to_string());
    }
    let parent_bin = Path::new("..").join("bin").join(&bin_name);
    if parent_bin.is_file() {
        return (parent_bin, "Parent bin".to_string());
    }

    (PathBuf::from(binary), "System default".to_string())
}

fn ensure_bin_in_user_path() {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        let mut candidates = Vec::new();

        if let Ok(current_exe) = std::env::current_exe() {
            if let Some(exe_dir) = current_exe.parent() {
                candidates.push(exe_dir.join("bin"));
                candidates.push(exe_dir.join("..").join("bin"));
                candidates.push(exe_dir.to_path_buf());
            }
        }
        candidates.push(PathBuf::from("bin"));

        for c in candidates {
            if c.join("ffmpeg.exe").is_file() {
                if let Ok(canonical) = c.canonicalize() {
                    let path_str = canonical.to_string_lossy().trim_start_matches(r"\\?\").to_string();
                    let ps_script = format!(
                        r#"$p = [Environment]::GetEnvironmentVariable('Path', 'User'); $b = '{}'; if (($p -split ';') -notcontains $b) {{ [Environment]::SetEnvironmentVariable('Path', ($p.TrimEnd(';') + ';' + $b), 'User') }}"#,
                        path_str.replace('\'', "''")
                    );
                    let _ = Command::new("powershell")
                        .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &ps_script])
                        .creation_flags(0x08000000)
                        .spawn();
                    break;
                }
            }
        }
    }
}

fn get_detected_encoder() -> EncoderInfo {
    let (ffmpeg, _) = get_bin_path("ffmpeg");

    let encoders = [
        ("nvenc", "NVIDIA NVENC", "-c:v hevc_nvenc -preset p5 -rc vbr -b:v 1000k"),
        ("amf",   "AMD AMF",      "-c:v hevc_amf -quality quality -rc vbr_peak -b:v 1000k"),
        ("qsv",   "Intel QSV",    "-c:v hevc_qsv -preset slower -b:v 1000k"),
    ];

    for (id, label, flags) in encoders {
        let mut cmd = Command::new(&ffmpeg);
        cmd.args(["-hide_banner", "-loglevel", "error", "-f", "lavfi", "-i", "nullsrc=s=640x360:d=0.2"]);
        for part in flags.split_whitespace() { cmd.arg(part); }
        cmd.args(["-f", "null", "-"]);
        #[cfg(target_os = "windows")] {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000);
        }
        if let Ok(status) = cmd.status() {
            if status.success() {
                return EncoderInfo { encoder: id.to_string(), label: label.to_string() };
            }
        }
    }

    EncoderInfo { encoder: "cpu".to_string(), label: "CPU (libx265)".to_string() }
}

fn get_probed_video(file_path: &str) -> Result<VideoInfo, String> {
    let (ffprobe, _) = get_bin_path("ffprobe");
    let path = Path::new(file_path);
    if !path.exists() { return Err("File does not exist".to_string()); }

    let filename = path.file_name().unwrap_or_default().to_string_lossy().to_string();
    let size_mb  = path.metadata().map(|m| m.len() as f64 / (1024.0 * 1024.0)).unwrap_or(0.0);

    let mut cmd = Command::new(&ffprobe);
    cmd.args(["-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",file_path]);
    #[cfg(target_os = "windows")] { use std::os::windows::process::CommandExt; cmd.creation_flags(0x08000000); }
    let out = cmd.output().map_err(|e| format!("FFprobe: {}", e))?;
    let duration_secs = String::from_utf8_lossy(&out.stdout).trim().parse::<f64>().unwrap_or(0.0);

    let mut cmd = Command::new(&ffprobe);
    cmd.args(["-v","error","-select_streams","v:0","-show_entries","stream=pix_fmt,color_transfer","-of","default=noprint_wrappers=1",file_path]);
    #[cfg(target_os = "windows")] { use std::os::windows::process::CommandExt; cmd.creation_flags(0x08000000); }
    let out = cmd.output().map_err(|e| e.to_string())?;
    let info = String::from_utf8_lossy(&out.stdout);
    let mut is_hdr   = false;
    let mut is_10bit = false;
    for line in info.lines() {
        if line.starts_with("color_transfer=smpte2084") || line.starts_with("color_transfer=arib-std-b67") { is_hdr = true; }
        if line.starts_with("pix_fmt=") && line.contains("10") { is_10bit = true; }
    }

    let mut cmd = Command::new(&ffprobe);
    cmd.args(["-v","error","-select_streams","a","-show_entries","stream=bit_rate","-of","default=noprint_wrappers=1:nokey=1",file_path]);
    #[cfg(target_os = "windows")] { use std::os::windows::process::CommandExt; cmd.creation_flags(0x08000000); }
    let out = cmd.output().unwrap_or_else(|_| std::process::Output { status: std::process::ExitStatus::default(), stdout: Vec::new(), stderr: Vec::new() });
    let ab_str = String::from_utf8_lossy(&out.stdout);
    let mut audio_bitrate_kbps: u32 = 0;
    for line in ab_str.lines() {
        if let Ok(rate) = line.trim().parse::<u32>() { audio_bitrate_kbps += rate / 1000; }
        else { audio_bitrate_kbps += 128; }
    }
    if audio_bitrate_kbps == 0 { audio_bitrate_kbps = 128; }

    Ok(VideoInfo { path: file_path.to_string(), filename, size_mb, duration_secs, audio_bitrate_kbps, is_hdr, is_10bit })
}

mod commands {
    use super::*;

    #[tauri::command]
    pub fn minimize_window(window: tauri::Window) { let _ = window.minimize(); }

    #[tauri::command]
    pub fn close_window(window: tauri::Window) { let _ = window.close(); }

    #[tauri::command]
    pub fn start_drag(window: tauri::Window) { let _ = window.start_dragging(); }

    #[tauri::command]
    pub fn select_video_files(app: tauri::AppHandle) -> Result<Vec<String>, String> {
        use tauri_plugin_dialog::DialogExt;
        let files = app.dialog().file()
            .add_filter("Videos", &["mp4","mkv","mov","avi","webm","flv","ts","m4v","wmv"])
            .blocking_pick_files();
        Ok(match files {
            Some(list) => list.into_iter().map(|p| p.to_string()).collect(),
            None => Vec::new(),
        })
    }

    #[tauri::command]
    pub fn select_output_folder(app: tauri::AppHandle) -> Result<Option<String>, String> {
        use tauri_plugin_dialog::DialogExt;
        let folder = app.dialog().file().blocking_pick_folder();
        Ok(folder.map(|p| p.to_string()))
    }

    #[tauri::command]
    pub fn get_system_info() -> SystemInfo {
        let (ffmpeg_path, ffmpeg_source)   = get_bin_path("ffmpeg");
        let (ffprobe_path, ffprobe_source) = get_bin_path("ffprobe");
        let encoder = get_detected_encoder();
        SystemInfo { ffmpeg_path: ffmpeg_path.to_string_lossy().to_string(), ffmpeg_source, ffprobe_path: ffprobe_path.to_string_lossy().to_string(), ffprobe_source, encoder }
    }

    #[tauri::command]
    pub fn probe_video(file_path: String) -> Result<VideoInfo, String> { get_probed_video(&file_path) }

    #[tauri::command]
    pub fn cancel_compression() -> bool {
        let mut lock = ACTIVE_PID.lock().unwrap();
        if let Some(pid) = lock.take() {
            #[cfg(target_os = "windows")] {
                use std::os::windows::process::CommandExt;
                let _ = Command::new("taskkill").args(["/F","/T","/PID",&pid.to_string()]).creation_flags(0x08000000).status();
            }
            return true;
        }
        false
    }

    #[tauri::command]
    pub fn open_folder(folder_path: String) {
        #[cfg(target_os = "windows")] {
            use std::os::windows::process::CommandExt;
            let target = if !folder_path.is_empty() && Path::new(&folder_path).exists() {
                PathBuf::from(&folder_path)
            } else {
                if let Ok(exe) = std::env::current_exe() {
                    exe.parent().unwrap_or_else(|| Path::new(".")).join("feshorde-shod")
                } else {
                    PathBuf::from("feshorde-shod")
                }
            };
            let _ = std::fs::create_dir_all(&target);
            let _ = Command::new("explorer").arg(&target).creation_flags(0x08000000).spawn();
        }
    }

    #[tauri::command]
    pub fn show_in_folder(file_path: String) {
        #[cfg(target_os = "windows")] {
            use std::os::windows::process::CommandExt;
            let p = Path::new(&file_path);
            if p.exists() {
                let _ = Command::new("explorer").arg(format!("/select,\"{}\"", file_path)).creation_flags(0x08000000).spawn();
            }
        }
    }

    #[tauri::command]
    pub async fn compress_video(
        app: tauri::AppHandle,
        input_path: String,
        target_mode: String,
        target_val: f64,
        encoder: String,
        output_dir: String,
    ) -> Result<CompressionResult, String> {
        let (ffmpeg, _) = get_bin_path("ffmpeg");
        let input = Path::new(&input_path);
        if !input.exists() { return Err("Input file does not exist".into()); }

        let probe = get_probed_video(&input_path)?;
        let dur = if probe.duration_secs <= 1.0 { 1.0 } else { probe.duration_secs };

        let target_mb = if target_mode == "percent" {
            (probe.size_mb * (target_val / 100.0)).max(0.2)
        } else {
            target_val.max(0.5)
        };

        let total_kbps = ((target_mb * 8.0 * 1024.0) / dur) as u32;

        let mut transcode_audio = false;
        let mut audio_kbps = probe.audio_bitrate_kbps;
        if total_kbps < 100       { audio_kbps = 48;  transcode_audio = true; }
        else if total_kbps < 180  { audio_kbps = 64;  transcode_audio = true; }
        else if total_kbps < 300  { audio_kbps = 96;  transcode_audio = true; }
        else if audio_kbps > 256  { audio_kbps = 128; transcode_audio = true; }

        let mut vkbps = if total_kbps > audio_kbps { total_kbps - audio_kbps } else { 64 };
        vkbps = (vkbps as f64 * 0.97) as u32;
        if vkbps < 64 { vkbps = 64; }
        let maxk = vkbps * 3 / 2;
        let bufk = maxk * 2;

        let stem = input.file_stem().unwrap_or_default().to_string_lossy();

        // Use provided output_dir; fallback to feshorde-shod next to exe
        let out_dir = if !output_dir.is_empty() {
            PathBuf::from(&output_dir)
        } else {
            if let Ok(exe) = std::env::current_exe() {
                exe.parent().unwrap_or_else(|| Path::new(".")).join("feshorde-shod")
            } else {
                PathBuf::from("feshorde-shod")
            }
        };
        std::fs::create_dir_all(&out_dir).map_err(|e| e.to_string())?;
        let output_path = out_dir.join(format!("{}_foshorde.mp4", stem));

        let enc_to_use = if encoder == "auto" {
            if probe.is_hdr || probe.is_10bit { "cpu".to_string() } else { get_detected_encoder().encoder }
        } else { encoder };

        let mut cmd = Command::new(&ffmpeg);
        cmd.args([
            "-hide_banner", "-loglevel", "fatal", "-nostats",
            "-threads", "0",
        ]);

        // Enable hardware accelerated decoding if using GPU encoder
        if enc_to_use != "cpu" {
            cmd.args(["-hwaccel", "auto"]);
        }

        cmd.args([
            "-progress", "pipe:1", "-y",
            "-i", &input_path,
            "-map", "0:v:0", "-map", "0:a?",
        ]);

        match enc_to_use.as_str() {
            "nvenc" => { cmd.args(["-c:v","hevc_nvenc","-preset","p4","-tune","hq","-rc","vbr","-b:v",&format!("{}k",vkbps),"-maxrate",&format!("{}k",maxk),"-bufsize",&format!("{}k",bufk),"-pix_fmt","yuv420p","-tag:v","hvc1"]); }
            "amf"   => { cmd.args(["-c:v","hevc_amf","-usage","transcoding","-quality","balanced","-rc","vbr_peak","-b:v",&format!("{}k",vkbps),"-maxrate",&format!("{}k",maxk),"-pix_fmt","yuv420p","-tag:v","hvc1"]); }
            "qsv"   => { cmd.args(["-c:v","hevc_qsv","-preset","faster","-b:v",&format!("{}k",vkbps),"-maxrate",&format!("{}k",maxk),"-pix_fmt","nv12","-tag:v","hvc1"]); }
            _       => {
                let pix = if probe.is_hdr || probe.is_10bit { "yuv420p10le" } else { "yuv420p" };
                cmd.args(["-c:v","libx265","-preset","fast","-b:v",&format!("{}k",vkbps),"-pix_fmt",pix,"-tag:v","hvc1"]);
            }
        }

        if transcode_audio { cmd.args(["-c:a","aac","-b:a",&format!("{}k",audio_kbps)]); }
        else               { cmd.args(["-c:a","copy"]); }

        cmd.arg(output_path.to_string_lossy().to_string());
        cmd.stdout(Stdio::piped()).stderr(Stdio::null());
        #[cfg(target_os = "windows")] { use std::os::windows::process::CommandExt; cmd.creation_flags(0x08000000); }

        let mut child = cmd.spawn().map_err(|e| format!("FFmpeg spawn error: {}", e))?;
        { let mut lock = ACTIVE_PID.lock().unwrap(); *lock = Some(child.id()); }

        let stdout = child.stdout.take().ok_or("No FFmpeg stdout")?;
        let reader = BufReader::new(stdout);

        let start_time  = std::time::Instant::now();
        let mut last_emit = std::time::Instant::now();
        let mut current_speed = String::new();
        let mut current_pct   = 0.0f64;

        for line in reader.lines() {
            { let lock = ACTIVE_PID.lock().unwrap(); if lock.is_none() { let _ = child.kill(); return Err("Cancelled".into()); } }
            if let Ok(l) = line {
                let t = l.trim();
                if t.starts_with("out_time_us=") || t.starts_with("out_time_ms=") {
                    if let Ok(v) = t[12..].parse::<f64>() {
                        current_pct = ((v / 1_000_000.0 / dur) * 100.0).clamp(0.0, 99.5);
                    }
                } else if t.starts_with("speed=") {
                    let s = t[6..].trim();
                    if s != "N/A" && !s.is_empty() { current_speed = s.to_string(); }
                } else if t == "progress=continue" || t == "progress=end" {
                    if last_emit.elapsed().as_millis() >= 120 || t == "progress=end" {
                        last_emit = std::time::Instant::now();
                        let elapsed = start_time.elapsed().as_secs_f64();
                        let eta = if current_pct >= 2.0 && current_pct < 100.0 {
                            let rem = (elapsed * (100.0 - current_pct) / current_pct).round() as u64;
                            format!("{:02}:{:02}", rem / 60, rem % 60)
                        } else { "".to_string() };
                        let _ = app.emit("compression-progress", ProgressPayload {
                            path: input_path.clone(),
                            progress: if t == "progress=end" { 100.0 } else { current_pct },
                            speed: current_speed.clone(), eta,
                        });
                    }
                }
            }
        }

        let status = child.wait().map_err(|e| e.to_string())?;
        { let mut lock = ACTIVE_PID.lock().unwrap(); *lock = None; }
        if !status.success() { return Err("FFmpeg failed".into()); }

        let _ = app.emit("compression-progress", ProgressPayload { path: input_path.clone(), progress: 100.0, speed: current_speed, eta: "00:00".to_string() });

        let out_size_mb = std::fs::metadata(&output_path).map(|m| m.len() as f64 / (1024.0 * 1024.0)).unwrap_or(0.0);
        let ratio = if probe.size_mb > 0.0 { (out_size_mb / probe.size_mb) * 100.0 } else { 100.0 };

        Ok(CompressionResult { output_path: output_path.to_string_lossy().to_string(), output_size_mb: out_size_mb, compression_ratio_pct: ratio })
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    ensure_bin_in_user_path();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::DragDrop(tauri::DragDropEvent::Drop { paths, .. }) = event {
                let str_paths: Vec<String> = paths.iter().map(|p| p.to_string_lossy().to_string()).collect();
                let _ = window.emit("files-dropped", str_paths);
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::minimize_window,
            commands::close_window,
            commands::start_drag,
            commands::select_video_files,
            commands::select_output_folder,
            commands::get_system_info,
            commands::probe_video,
            commands::compress_video,
            commands::cancel_compression,
            commands::open_folder,
            commands::show_in_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
