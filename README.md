# Foshorde

A colorful Windows `.bat` video compressor built on ffmpeg. Give it a target size in MB and it compresses your videos to H.265 (HEVC) at about that size.

## Features
- Target size in MB (default 35); audio is copied untouched when possible
- Auto-detects your GPU: NVIDIA (`hevc_nvenc`), AMD (`hevc_amf`), Intel (`hevc_qsv`), falls back to CPU (`libx265`)
- HDR and 10-bit videos are encoded on the CPU
- Re-encodes once with a corrected bitrate if the result misses the target size
- Automatic retry ladder if an encode fails: without subtitles, then audio as AAC, then on the CPU
- Works with files of any realistic size (no 2 GB limit)
- Progress bars for the current file and for all files together
- Safe: the original is only deleted after a successful, smaller, valid output that was moved into place
- Fast downloads: ffmpeg and updates are fetched over several parallel connections (falls back to curl automatically)
- Built-in updater that pulls the latest version from GitHub
- Color themes: acid, dracula, nord, monokai, catppuccin, murphy

## Install
1. Download or clone this repository.
2. Run `Foshorde.bat`. If ffmpeg is missing it offers to download it into `bin\`.

## Usage
**Double-click** `Foshorde.bat` in a folder with videos: Enter compresses everything to the default size, a number sets another size, `R` asks per file, `T` changes theme, `U` updates, `Q` quits. Compressed files go to `feshorde-shod\` and originals are replaced.

**From any folder** (after the first run adds Foshorde to your PATH; open a new terminal):
```
foshorde kon        compress every video here (default size)
foshorde kon 50     ... to 50 MB
foshorde update     download the latest version from GitHub and replace this install
foshorde version    show the installed version
foshorde path       re-register this copy of Foshorde on PATH
```
Output of `kon` is saved next to the originals as `name_foshorde.mp4`; originals are never deleted.

## Updating
Foshorde checks `version.txt` on GitHub once a day (set `check_updates=0` in `Foshorde.bat` to turn that off). When a newer version exists the start screen shows it; press `U` (or run `foshorde update`) to install it.

The updater downloads the repository zip over HTTPS, waits for Foshorde to close, and copies the new files over the old ones. It keeps your `theme.cfg`, the `bin\` folder and the output folder. Settings you edited at the top of `Foshorde.bat` are reset to the defaults of the new version.

### Publishing a new version (maintainer)
1. Change the code and commit.
2. Raise the number in `version.txt` (for example `1.1.0` to `1.2.0`).
3. Push to the branch set in `Foshorde.bat` (`gh_branch`, default `main`).

Users with an older `version.txt` will be offered the update. The GitHub account, repository and branch are set by `gh_user`, `gh_repo` and `gh_branch` at the top of `Foshorde.bat`.

## Downloads
ffmpeg and updates are downloaded with up to 8 parallel connections, which helps a lot when a server limits the speed of each single connection. If the server does not support ranged requests, the file is too small, or a part fails, Foshorde falls back to a normal `curl` download.

Change `dl_conn` at the top of `Foshorde.bat` (2-16 connections, `1` = single normal download). If downloads stay slow, download `ffmpeg.exe` and `ffprobe.exe` yourself and put them in `bin\`.

## Notes
- Windows 10/11 with ANSI colors (Windows Terminal recommended)
- File names that contain `!`, `%` or `^` cannot be handled safely by batch files; they are skipped with a warning
- If `foshorde` is not found after the first run, open a NEW terminal. To force the PATH registration again run `Foshorde.bat path`; it reports an error with details if it fails
- `foshorde path` only removes old copies of Foshorde from your PATH. Your original PATH is saved once in `%LOCALAPPDATA%\Foshorde\path-backup.txt`
- ffmpeg builds are not part of this repository; see their own licenses

## License
MIT