# Foshorde

<p align="center">
  <strong>Minimal. Fast. Efficient.</strong><br>
  A Windows video compressor powered by FFmpeg.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.2.0-8BEA55?style=flat-square" alt="Version 1.2.0">
  <img src="https://img.shields.io/badge/platform-Windows-8BEA55?style=flat-square" alt="Windows">
  <img src="https://img.shields.io/badge/codec-H.265%20%2F%20HEVC-8BEA55?style=flat-square" alt="H.265 / HEVC">
  <img src="https://img.shields.io/badge/license-MIT-8BEA55?style=flat-square" alt="MIT License">
</p>

Foshorde is a Windows video compressor that uses H.265 (HEVC) to target a chosen output file size. It detects available hardware encoders, falls back to CPU encoding when needed, and includes an interactive mode and a command-line workflow.

## Features

- Choose a target output size in MB
- Default target size: **35 MB**
- Automatic GPU encoder detection: NVIDIA NVENC, AMD AMF, and Intel Quick Sync
- CPU encoding fallback with `libx265`
- HDR and 10-bit sources are processed through the CPU 10-bit encoding path
- Audio tracks are copied instead of re-encoded
- Subtitle streams are included when present and converted to MP4-compatible `mov_text`
- Automatic retry ladder when an encode fails
- Bitrate estimation and correction retry when the output misses the target
- Progress display and a final per-file summary
- Built-in updater and parallel downloads
- Six color themes: Acid, Dracula, Nord, Monokai, Catppuccin, and Murphy

## Supported formats

Foshorde scans for these video file extensions:

`MP4` · `MKV` · `AVI` · `MOV` · `WMV` · `FLV` · `WEBM` · `M4V` · `TS`

Output is encoded as MP4 using H.265 (HEVC).

## Installation

1. Download or clone this repository.
2. Run `Foshorde.bat`.
3. If FFmpeg or FFprobe is missing, Foshorde can download them into `bin\`.

Foshorde requires Windows 10 or 11. A supported GPU is optional; CPU encoding is available as a fallback.

## Usage

Place `Foshorde.bat` in the folder containing your videos, then run it.

The start screen accepts:

| Key / input | Action |
| --- | --- |
| `Enter` | Compress all detected videos using the default target size (35 MB) |
| Number | Set a custom target size in MB for the batch |
| `R` | Review files one by one and choose what to do |
| `T` | Change the color theme |
| `U` | Check for and install an available update |
| `Q` | Quit |

### Review files one by one

After pressing `R`, each file can be handled separately:

| Key / input | Action |
| --- | --- |
| `Enter` or `Y` | Compress this file |
| `N` | Skip this file |
| `A` | Compress this and all remaining files without asking again |
| `T` | Change theme and return to the current file |
| `Q` | Stop processing the remaining files |
| Number | Change the target size for the current file |

## Command line

On the first run, Foshorde registers its command on your user PATH. Open a **new** terminal window after registration.

```bat
foshorde kon        Compress videos in the current folder
foshorde kon 50     Target approximately 50 MB per video
foshorde update     Download the latest version
foshorde version    Show the installed version
foshorde path       Register this copy on PATH
```

The `kon` command saves each result beside its source file with the `_foshorde.mp4` suffix. Original files are kept. If a matching output file already exists, that input is skipped.

## Target size

Foshorde estimates the video bitrate from the selected target size, duration, and audio bitrate. The interface displays an estimated output size and a **±15% target range**. Actual size can vary depending on the source and encoding constraints; very low target sizes may be limited by the minimum video bitrate.

## Output and file safety

- Interactive mode saves results in the `feshorde-shod\` folder.
- Command-line mode (`foshorde kon`) saves results next to the originals as `*_foshorde.mp4`.
- Temporary files are used during encoding.
- The new output is checked before it is accepted; failed encodes leave the original untouched.
- Foshorde does not delete the original source videos.

## Notes and limitations

- File names containing `!`, `%`, or `^` are currently skipped by the file scanner. Rename those files before processing.
- The first video stream is selected. Audio streams are mapped and copied; subtitle streams are mapped when present and converted to `mov_text`.
- HDR and 10-bit inputs use the CPU encoding path, which can take longer than supported GPU encoding.
- GPU encoding speed and availability depend on your graphics card, driver, and FFmpeg build.

## Updating

Foshorde checks GitHub for updates once a day. When an update is available, press `U` on the start screen or run:

```bat
foshorde update
```

The updater keeps your `theme.cfg`, `bin\` folder, and output folder. Settings manually changed inside `Foshorde.bat` return to the new version's defaults after updating.

## License

Foshorde is released under the [MIT License](LICENSE).
