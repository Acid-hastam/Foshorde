# Foshorde (فشرده)

<p align="center">
  <strong>Minimal. Fast. Efficient.</strong><br>
  A modern, high-performance Windows video compressor powered by Tauri v2, Rust, and FFmpeg with full hardware acceleration.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.4.0-8BEA55?style=flat-square" alt="Version 1.4.0">
  <img src="https://img.shields.io/badge/platform-Windows%20x64-8BEA55?style=flat-square" alt="Windows x64">
  <img src="https://img.shields.io/badge/framework-Tauri%20v2-8BEA55?style=flat-square" alt="Tauri v2">
  <img src="https://img.shields.io/badge/backend-Rust%202024-8BEA55?style=flat-square" alt="Rust 2024">
  <img src="https://img.shields.io/badge/codec-H.265%20%2F%20HEVC-8BEA55?style=flat-square" alt="H.265 / HEVC">
  <img src="https://img.shields.io/badge/acceleration-GPU%20Decode%20%2B%20Encode-8BEA55?style=flat-square" alt="GPU Accelerated">
  <img src="https://img.shields.io/badge/license-MIT-8BEA55?style=flat-square" alt="MIT License">
</p>

---

## Highlights in v1.4.0

- 🚀 **Full Hardware Acceleration (Decode + Encode):** Enables `-hwaccel auto` alongside GPU encoders (AMD AMF, NVIDIA NVENC, Intel QSV) for ultra-fast, high-framerate processing with minimal CPU usage.
- ⚡ **Optimized Codec Presets:** Tuned AMF (`balanced`), NVENC (`p4`), and CPU (`fast`) pipelines for maximum speed without sacrificing visual fidelity.
- 🎯 **Percentage (%) & Fixed MB Sizing Modes:** Compress videos relative to their source size (e.g., 5%, 10%, 25%, 50%) or hit target sizes tailored for platforms like Discord (10 MB), WhatsApp (16 MB), and Telegram (50 MB).
- 📦 **Compact Standalone Desktop App (`Foshorde.exe`):** Built with Tauri v2 and Rust, weighing only ~4.7 MB with instant startup and smooth frameless window animations.
- 🔄 **Automatic PATH Registration:** On first launch, automatically ensures FFmpeg and FFprobe are connected to your Windows User PATH for system-wide availability.
- 📁 **Smart Output Management:** Customize and persist output directories across sessions, with one-click direct access to reveal compressed videos in File Explorer.
- 📊 **Real-time Metrics & Queue Control:** Live progress bars, encoding speed (e.g., `3.2x`), time remaining (ETA), and safe process cancellation.
- 🖐️ **Native Drag & Drop:** Drop multiple video files directly into the window from File Explorer to process batches seamlessly.

---

## Supported Formats

| Category | Formats |
| :--- | :--- |
| **Input Containers** | `MP4`, `MKV`, `MOV`, `AVI`, `WEBM`, `FLV`, `TS`, `M4V`, `WMV` |
| **Video Codec Output** | `H.265 / HEVC` (Tagged `hvc1` for universal Windows / Apple / Web compatibility) |
| **Audio Processing** | Smart Passthrough (`copy`) or Transcoding to AAC (up to 128 kbps) |
| **HDR & 10-Bit Support** | Automatically detects HDR10 / 10-bit color spaces and preserves color fidelity |

---

## Quick Start

1. **Launch:** Run `Foshorde.exe`.
2. **Add Videos:** Drag and drop your video files into the top drop zone, or click to open the file picker.
3. **Select Preset or Target:**
   - Choose a quick preset: **Discord (10 MB)**, **WhatsApp (16 MB)**, **Telegram (50 MB)**, or **Compact (25%)**.
   - Or drag the **Custom Slider** to dial in any exact percentage (1% to 99%).
4. **Choose Output Folder:**
   - Default output folder is `foshorde-output\`.
   - Click the folder button in the footer to select a custom destination (saved automatically).
   - Click the icon next to it anytime to open the output folder in Windows Explorer.
5. **Start:** Click **Compress** to begin. You can track live progress and cancel at any time.

---

## Architecture & Workflow

```
[ Input Video ] ──▶ [ FFprobe Metadata Inspection ]
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
      Hardware GPU Decode         Hardware / CPU Encoder
      (-hwaccel auto)             (AMF / NVENC / QSV / libx265)
               │                         │
               └────────────┬────────────┘
                            ▼
              [ Real-time Tauri Event Stream ] ──▶ Live Progress & Speed UI
                            ▼
       [ Optimized H.265 MP4 Output ] (foshorde-output\)
```

---

## Building from Source

### Prerequisites
- [Rust](https://rustup.rs/) (edition 2024 / stable toolchain)
- [Node.js](https://nodejs.org/) (v18+)

### Build Commands
To compile the standalone GUI executable:
```bat
build.bat
```
Or build directly through Tauri CLI:
```bash
cd foshorde-gui
npx tauri build --no-bundle
```
The optimized executable will be located at `foshorde-gui/src-tauri/target/release/foshorde-gui.exe` and copied to the root as `Foshorde.exe`.

---

## Project Structure

```
Foshorde/
├── Foshorde.exe            # Standalone GUI application (~4.7 MB)
├── build.bat               # 1-click build script
├── version.txt             # Version identifier (1.4.0)
├── bin/                    # FFmpeg & FFprobe binaries
│   ├── ffmpeg.exe
│   └── ffprobe.exe
├── foshorde-gui/           # Tauri v2 + Rust frontend/backend source
│   ├── src/                # HTML5, CSS3, JavaScript UI
│   └── src-tauri/          # Rust backend, window handlers & FFmpeg manager
└── foshorde-output/        # Output directory for compressed videos
```

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
