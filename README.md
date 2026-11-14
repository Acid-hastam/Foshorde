# Foshorde

<p align="center">
  <strong>Minimal. Fast. Efficient.</strong><br>
  A Windows video compressor powered by FFmpeg.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.3.0-8BEA55?style=flat-square" alt="Version 1.3.0">
  <img src="https://img.shields.io/badge/platform-Windows-8BEA55?style=flat-square" alt="Windows">
  <img src="https://img.shields.io/badge/codec-H.265%20%2F%20HEVC-8BEA55?style=flat-square" alt="H.265 / HEVC">
  <img src="https://img.shields.io/badge/license-MIT-8BEA55?style=flat-square" alt="MIT License">
</p>

Foshorde compresses videos with H.265 (HEVC) to a target file size. It detects your GPU encoder (NVIDIA NVENC, AMD AMF, Intel Quick Sync), falls back to the CPU when needed, and has both an interactive mode and a command line.

## Features

- Target output size in MB (default **35 MB**, changeable in Options)
- Automatic GPU encoder detection, CPU `libx265` fallback
- HDR and 10-bit sources use the CPU 10-bit path
- Audio is copied, subtitles become MP4-compatible `mov_text`
- Automatic retry ladder when an encode fails, and a size-correction retry
- Output is verified before anything is replaced
- Options menu: theme, default size, encoder, keep originals, updates
- Settings and theme are stored outside the program folder and **survive updates**
- Built-in updater that also updates the themes
- Six themes: Acid, Dracula, Nord, Monokai, Catppuccin, Murphy

## Supported formats

`MP4` `MKV` `AVI` `MOV` `WMV` `FLV` `WEBM` `M4V` `TS` - output is always MP4 (H.265).

## Installation

1. Download or clone this repository.
2. Run `Foshorde.bat`.
3. If FFmpeg is missing, Foshorde offers to download it into `bin\`.

Requires Windows 10 or 11. A GPU is optional.

## Usage

Put `Foshorde.bat` in the folder with your videos and run it.

| Input | Action |
| --- | --- |
| `Enter` | Compress all videos to the default size |
| Number | Compress all videos to this size (MB) |
| `R` | Review files one by one |
| `O` | Options |
| `Q` | Quit |

### Review mode

| Input | Action |
| --- | --- |
| `Enter` / `Y` | Compress this file |
| `N` | Skip this file |
| `A` | Compress this and all remaining files |
| `Q` | Stop |
| Number | New target size for this file |

### Options

Theme, default size, encoder (`auto`, `nvenc`, `amf`, `qsv`, `cpu`), keep originals (yes/no), check for updates, open the output folder.

## Command line

On first run Foshorde adds itself to your user PATH. Open a **new** terminal afterwards.

```bat
foshorde kon              Compress videos in the current folder
foshorde kon 50           Target about 50 MB per video
foshorde kon discord      Presets: discord (10 MB), whatsapp (16 MB), mail (25 MB)
foshorde update           Download the latest version
foshorde version          Show the installed version
foshorde path             Register this copy on PATH
```

`kon` saves `<name>_foshorde.mp4` next to each source and never deletes anything. Files that already have a matching output are skipped, and `_foshorde` files are not processed again.

## Target size

The video bitrate is calculated from the target size, duration and audio bitrate. If the first result misses the target, Foshorde re-encodes once with a corrected bitrate. Very small targets are limited by the minimum video bitrate.

## Output and file safety

- Interactive mode writes to `feshorde-shod\`; `kon` writes next to the originals.
- By default, interactive mode **deletes the original after a verified successful compression** (that is where the space saving comes from). Turn on **Keep originals** in Options to keep them.
- Failed or suspicious encodes never touch the original.

## Settings and updating

Your choices are saved in `%LOCALAPPDATA%\Foshorde\` (`settings.cfg`, `theme.cfg`). Updating replaces the program and the themes with the new versions but never changes your settings or selected theme. The `bin\` and output folders are kept.

## Limitations

- File names containing `!`, `%` or `^` are skipped. Rename them first.
- Only the first video stream is used.
- HDR/10-bit inputs use the CPU, which is slower.

## License

MIT - see [LICENSE](LICENSE).
