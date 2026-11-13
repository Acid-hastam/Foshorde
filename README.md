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

Foshorde compresses videos to a target file size using H.265 (HEVC). It detects available hardware encoders, adjusts encoding settings when needed, and includes a command-line mode for quick compression.

## Features

- Set a target output size in MB
- Automatic GPU encoder detection: NVIDIA NVENC, AMD AMF, and Intel Quick Sync
- CPU encoding fallback with `libx265`
- HDR and 10-bit video support through CPU encoding
- Automatic retry options when an encode fails
- Bitrate correction when the output misses the target size
- Progress indicators for individual files and the full queue
- Built-in updater and parallel downloads
- Six color themes: Acid, Dracula, Nord, Monokai, Catppuccin, and Murphy

## Installation

1. Download or clone this repository.
2. Run `Foshorde.bat`.
3. If FFmpeg is not installed, Foshorde can download it into `bin\`.

## Usage

Run `Foshorde.bat` in the folder containing your videos.

| Key | Action |
| --- | --- |
| `Enter` | Compress using the default target size |
| Number | Set a custom target size in MB |
| `R` | Choose a target size for each file |
| `T` | Change the color theme |
| `U` | Update Foshorde |
| `Q` | Quit |

### Command line

After the first run registers Foshorde on your PATH, open a new terminal:

```bat
foshorde kon        Compress videos in the current folder
foshorde kon 50     Target approximately 50 MB per video
foshorde update     Download the latest version
foshorde version    Show the installed version
foshorde path       Register this copy on PATH
```

The `kon` command saves compressed videos beside the originals with the `_foshorde.mp4` suffix. It does not delete the originals.

## Output and safety

When using the interactive `Foshorde.bat` mode, output files are placed in `feshorde-shod\`. The original is replaced only after the new file passes validation and is smaller.

## Updating

Foshorde checks GitHub for updates once a day. When an update is available, press `U` on the start screen or run:

```bat
foshorde update
```

The updater keeps your `theme.cfg`, `bin\` folder, and output folder. Settings manually changed inside `Foshorde.bat` return to the new version's defaults after updating.

## Requirements

- Windows 10 or 11
- FFmpeg and FFprobe (Foshorde can download them automatically)
- A supported GPU is optional; CPU encoding is available as a fallback

## License

Foshorde is released under the [MIT License](LICENSE).
