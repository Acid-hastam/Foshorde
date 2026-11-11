# Foshorde

A colorful Windows `.bat` video compressor built on ffmpeg. Give it a target size in MB and it compresses your videos to H.265 (HEVC) at about that size.

## Features
- Target size in MB (default 35), audio is copied untouched
- Auto-detects your GPU: NVIDIA (`hevc_nvenc`), AMD (`hevc_amf`), Intel (`hevc_qsv`), falls back to CPU (`libx265`)
- HDR and 10-bit videos are encoded on the CPU
- Re-encodes once with a corrected bitrate if the result misses the target size
- Progress bars for the current file and for all files together
- Safe: the original is only deleted after a successful, smaller, valid output
- Color themes: acid, dracula, nord, monokai, catppuccin, murphy

## Install
1. Download or clone this repository.
2. Run `Foshorde.bat`. If ffmpeg is missing it offers to download it into `bin\`.

## Usage
**Double-click** `Foshorde.bat` in a folder with videos: Enter compresses everything to the default size, a number sets another size, `R` asks per file, `T` changes theme, `Q` quits. Compressed files go to `feshorde-shod\` and originals are replaced.

**From any folder** (after the first run adds Foshorde to your PATH; open a new terminal):
```
foshorde kon        compress every video here (default size)
foshorde kon 50     ... to 50 MB
foshorde update     re-register this copy of Foshorde on PATH
```
Output is saved next to the originals as `name_foshorde.mp4`; originals are never deleted.

## Notes
- Windows 10/11 with ANSI colors (Windows Terminal recommended)
- Files larger than 2 GB are not supported yet (batch integer limit)
- ffmpeg builds are not part of this repository; see their own licenses

## License
MIT
