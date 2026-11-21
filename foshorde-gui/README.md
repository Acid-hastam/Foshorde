# Foshorde GUI (Desktop App)

Modern desktop interface for Foshorde built with **Rust** and **Tauri v2**.

## Architecture

- **Backend:** Rust (`src-tauri/src/lib.rs`)
  - Auto hardware encoder probe (NVENC, AMF, QSV, CPU)
  - Native video metadata probe (FFprobe via system PATH)
  - Native Windows drag-and-drop event listener (`WindowEvent::DragDrop`)
  - Real-time FFmpeg progress parser and streaming events (`compression-progress`)
  - Native file picker dialogs (`tauri-plugin-dialog`)
  - Background process cancellation (`taskkill` via active PID)
- **Frontend:** Vanilla HTML5, CSS3, and JavaScript (`src/`)
  - 6 classic themes: Acid, Dracula, Nord, Monokai, Catppuccin, Murphy
  - Percentage-based sizing mode (1% - 90%) and Fixed MB sizing mode
  - Persistent user preferences via `localStorage`
  - Zero-bundler architecture for direct, resilient Edge WebView2 execution

## Building

From the root project directory, run:
```bat
build.bat
```
Or inside `foshorde-gui`:
```cmd
npx tauri build --no-bundle
```
The compiled executable is placed at `C:\Record\Foshorde\Foshorde.exe`.
