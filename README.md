<p align="center">
  <a href="https://github.com/Acid-hastam/Foshorde">
    <img src="icons/png-transparent/foshorde-128x128.png" alt="Foshorde Logo" width="100" height="100">
  </a>
  <br>
  <h1 align="center">Foshorde (فشرده)</h1>
  <p align="center">
    <strong>Minimal. Fast. Efficient.</strong>
    <br>
    <em>A modern, high-performance Windows video compressor powered by Tauri v2, Rust, and FFmpeg with full hardware acceleration.</em>
  </p>
</p>

<p align="center">
  <a href="https://github.com/Acid-hastam/Foshorde/releases"><img src="https://img.shields.io/badge/version-1.4.0-8BEA55?style=flat-square" alt="Version 1.4.0"></a>
  <img src="https://img.shields.io/badge/platform-Windows%20x64-8BEA55?style=flat-square" alt="Windows x64">
  <img src="https://img.shields.io/badge/framework-Tauri%20v2-8BEA55?style=flat-square" alt="Tauri v2">
  <img src="https://img.shields.io/badge/backend-Rust%202024-8BEA55?style=flat-square" alt="Rust 2024">
  <img src="https://img.shields.io/badge/codec-H.265%20%2F%20HEVC-8BEA55?style=flat-square" alt="H.265 / HEVC">
  <img src="https://img.shields.io/badge/acceleration-GPU%20Decode%20%2B%20Encode-8BEA55?style=flat-square" alt="GPU Accelerated">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-8BEA55?style=flat-square" alt="MIT License"></a>
</p>

---

## 🌟 Overview

**Foshorde (فشرده)** is a lightweight, blazing-fast desktop video compressor designed specifically for Windows. Engineered from the ground up with **Tauri v2** and **Rust**, it combines a clean dark-mode interface with the power of **FFmpeg** and full hardware acceleration (AMD AMF, NVIDIA NVENC, Intel QSV).

Whether shrinking gigabyte recordings down to share on Discord, Telegram, or WhatsApp, or preparing high-quality videos for YouTube, Foshorde achieves dramatic size reduction while preserving HDR colors and crystal-clear audio fidelity.

---

## ⚡ Highlights in v1.4.0

- 🚀 **Full Hardware Acceleration (Decode + Encode):** Enables `-hwaccel auto` decoding alongside dedicated GPU encoders (AMD AMF, NVIDIA NVENC, Intel QSV) for lightning-fast conversions with minimal CPU overhead.
- 📦 **Compact Standalone Binary (`Foshorde.exe`):** Single portable executable weighing only **~5.2 MB** with custom embedded brand icons and zero external runtime dependencies.
- 🖥️ **Dual-View Adaptive Workspace:**
  - **Fullscreen Drop Zone:** Minimalist drag-and-drop landing page with instant multi-file batch support and slide-up transitions.
  - **Interactive Editor:** Real-time size calculator, origin file metadata inspector, and fluid responsive controls.
- 🎯 **Preset Management & Drag Reordering:**
  - Default presets for popular platforms (**YouTube**, **Telegram 50 MB**, **WhatsApp 16 MB**, **Discord 10 MB**, **10%**, **25%**, **50%**).
  - Drag-and-drop handles to reorder presets to your preference.
  - **Custom Preset Modal:** Create custom presets by percentage (`%`) or fixed size (`MB`) with name validation and duplicate prevention.
  - Interactive custom slider (1% to 99%) with real-time output size calculation.
- 📋 **Batch Queue & Live Progress:** Multi-item compression queue, live encoding speed (e.g. `3.8x`), estimated time remaining (ETA), process cancellation, and one-click source reveal in File Explorer.
- 🌐 **Resilient In-App FFmpeg Downloader:**
  - Automatic first-launch detection with built-in multi-mirror download ladder (domestic Picofile mirror, GitHub proxies, BtbN, and Gyan Essentials).
  - Checksum and zip integrity verification with automatic fallback.
  - Silent, automatic registration of `bin/` to Windows User `PATH`.
  - In-app **Update FFmpeg Core** button in settings.
- 📁 **Smart Output Management:** Persistent destination folder selection with instant one-click reveal in Windows File Explorer.
- 🌈 **HDR10 & 10-Bit Color Fidelity:** Automatic FFprobe stream inspection preserves HDR metadata and high bit-depth color gamuts with universal Apple/Web `hvc1` codec tagging.

---

## 🎨 Brand & Iconography

Foshorde features a custom brand identity designed for modern dark-themed operating systems:

| Dark Mode Icon | Transparent Icon | Executable Icon |
| :---: | :---: | :---: |
| <img src="icons/png-dark/foshorde-dark-64x64.png" width="64" height="64" alt="Dark Icon"> | <img src="icons/png-transparent/foshorde-64x64.png" width="64" height="64" alt="Transparent Icon"> | <img src="icons/png-dark/foshorde-dark-32x32.png" width="32" height="32" alt="App Icon"> |
| `icons/png-dark/` | `icons/png-transparent/` | `icons/foshorde.ico` |

---

## 🎬 Supported Formats & Codecs

| Category | Specifications |
| :--- | :--- |
| **Input Containers** | `MP4`, `MKV`, `MOV`, `AVI`, `WEBM`, `FLV`, `TS`, `M4V`, `WMV`, `MTS`, `M2TS`, `VOB`, `OGV`, `3GP` |
| **Video Output Codec** | `H.265 / HEVC` (Tagged `hvc1` for seamless Windows, macOS, iOS, Android, and Web playback) |
| **Audio Processing** | Smart Passthrough (`copy`) or high-fidelity AAC transcoding (up to 128 kbps) |
| **HDR & Color Gamut** | Full preservation of HDR10 (`smpte2084`, `arib-std-b67`) and 10-bit color spaces |
| **Containers Output** | Universal standard `.mp4` container |

---

## 🏎️ Hardware Acceleration Matrix

Foshorde automatically detects and prioritizes hardware encoders on your system:

| Platform / Vendor | Encoder | Pipeline Preset | Features |
| :--- | :--- | :--- | :--- |
| **NVIDIA GeForce / RTX** | `hevc_nvenc` | `p5` / `p4` VBR | Dual-pass NVENC hardware encoding |
| **AMD Radeon** | `hevc_amf` | `quality` VBR Peak | Low-latency AMF hardware acceleration |
| **Intel Arc / UHD / Iris** | `hevc_qsv` | `slower` | Quick Sync Video GPU encoding |
| **Universal Fallback** | `libx265` | `fast` | Multithreaded software CPU encoding |

*You can always switch encoders manually in **Settings (⚙️)**.*

---

## 🚀 Quick Start

1. **Download:** Get the latest portable release (`Foshorde.exe`) from the [Releases](https://github.com/Acid-hastam/Foshorde/releases) page.
2. **Launch:** Run `Foshorde.exe`. On first launch, if FFmpeg is not found on your system, Foshorde will automatically download and set up the optimized core.
3. **Add Videos:** Drag and drop one or multiple video files into the window, or click anywhere on the drop zone to browse.
4. **Select Target or Preset:**
   - Click a quick preset (**YouTube**, **Discord 10 MB**, **WhatsApp 16 MB**, **Telegram 50 MB**, **Compact 25%**).
   - Or adjust the **Custom Slider** to any percentage between 1% and 99%.
   - Or click **+ Add Preset** to save your own target presets.
5. **Set Output Destination (Optional):** Click the folder button in the footer to choose a custom output directory.
6. **Compress:** Hit **Compress** and watch live progress with real-time speed and ETA.

---

## 🛠️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Foshorde Desktop UI                  │
│       Tauri v2 + HTML5 / CSS3 / Vanilla JavaScript     │
└───────────────────────────┬────────────────────────────┘
                            │ Tauri IPC Commands & Events
┌───────────────────────────▼────────────────────────────┐
│                    Rust Core Engine                    │
│   • Multi-probe Video Inspector (FFprobe)              │
│   • Encoder Detection (NVENC / AMF / QSV / CPU)        │
│   • Process & Queue Lifecycle Manager (std::process)   │
│   • Background Multi-mirror Core Downloader            │
│   • Windows User PATH Auto-Registrar                   │
└───────────────────────────┬────────────────────────────┘
                            │ Subprocess Pipe
┌───────────────────────────▼────────────────────────────┐
│                FFmpeg & Hardware Decoders              │
│   [-hwaccel auto] ──▶ GPU Decode ──▶ GPU Encode (H.265)│
│                        │                               │
│                        ▼                               │
│            Optimized Universal MP4 Output              │
│                  (foshorde-output\)                    │
└────────────────────────────────────────────────────────┘
```

---

## 💻 Building from Source

### Prerequisites

- [Rust](https://rustup.rs/) (edition 2024 / stable toolchain)
- [Node.js](https://nodejs.org/) (v18+)
- [C++ Build Tools for Visual Studio](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

### Build Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Acid-hastam/Foshorde.git
   cd Foshorde
   ```

2. **Install frontend dependencies:**
   ```bash
   cd foshorde-gui
   npm install
   ```

3. **Build the release executable:**
   ```bash
   npm run tauri build -- --no-bundle
   ```
   Or using Cargo directly:
   ```bash
   cargo build --manifest-path src-tauri/Cargo.toml --release
   ```

The compiled standalone executable will be located in `foshorde-gui/src-tauri/target/release/foshorde-gui.exe`.

---

## 📂 Project Structure

```
Foshorde/
├── Foshorde.exe            # Precompiled standalone desktop app (~5.2 MB)
├── icons/                  # Complete brand iconography (ICO, ICNS, PNG, SVG)
│   ├── png-dark/           # Dark mode icons (16x16 up to 1024x1024)
│   ├── png-transparent/    # Transparent background icons
│   └── foshorde.ico        # Multi-resolution Windows executable icon
├── bin/                    # Local FFmpeg & FFprobe binaries (auto-managed)
│   ├── ffmpeg.exe
│   └── ffprobe.exe
├── foshorde-gui/           # Tauri v2 application source
│   ├── package.json        # Frontend scripts and Tauri CLI tooling
│   ├── src/                # GUI Frontend (HTML, CSS, JS)
│   │   ├── index.html      # Main application markup & dialogs
│   │   ├── styles.css      # Dark mode styling & animations
│   │   └── main.js         # State management & event handling
│   └── src-tauri/          # Rust backend
│       ├── Cargo.toml      # Rust dependencies & metadata
│       ├── tauri.conf.json # Tauri configuration & window settings
│       └── src/
│           ├── lib.rs      # Core commands, encoder probe, downloader
│           └── main.rs     # Application entrypoint
├── foshorde-output/        # Default output directory for compressed videos
├── LICENSE                 # MIT License
└── README.md               # Documentation
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for complete details.
