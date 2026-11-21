// Foshorde — UI Controller

const tauriInvoke = (cmd, args = {}) => {
  const inv = window.__TAURI__?.core?.invoke;
  if (!inv) throw new Error("Tauri not available");
  return inv(cmd, args);
};

// =============================================
// SVG Icons
// =============================================
const ICONS = {
  discord: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.004 2C6.48 2 2 6.48 2 12c0 1.96.57 3.79 1.55 5.34L2 22l4.81-1.51A9.957 9.957 0 0 0 12.004 22C17.524 22 22 17.52 22 12s-4.476-10-9.996-10zm5.83 14.28c-.24.68-1.22 1.3-1.74 1.38-.49.07-1.12.1-3.26-.79-2.73-1.13-4.49-3.92-4.63-4.1-.14-.19-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.55-.34.73-.34.19 0 .37 0 .54.01.18.01.42-.07.65.49.24.58.82 2 .89 2.15.07.15.12.33.02.53-.1.19-.15.31-.3.49-.15.17-.31.39-.45.52-.15.15-.31.31-.13.62.18.31.79 1.3 1.7 2.11 1.17 1.04 2.15 1.37 2.46 1.52.31.15.49.13.67-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.7-.15.28.11 1.77.83 2.08.98.31.15.52.23.6.36.08.13.08.77-.16 1.45z"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/></svg>`,
  compact: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  default: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
};

function getPresetIconInfo(name, iconKey) {
  if (iconKey && ICONS[iconKey]) {
    return { key: iconKey, svg: ICONS[iconKey] };
  }
  const l = name.toLowerCase();
  if (l.includes("discord"))  return { key: "discord", svg: ICONS.discord };
  if (l.includes("what") || l.includes("wa")) return { key: "whatsapp", svg: ICONS.whatsapp };
  if (l.includes("tele") || l.includes("tg")) return { key: "telegram", svg: ICONS.telegram };
  if (l.includes("compact") || l.includes("small") || l.includes("opt")) return { key: "compact", svg: ICONS.compact };
  return { key: "default", svg: ICONS.default };
}

// =============================================
// Default Presets
// =============================================
const DEFAULT_PRESETS = [
  { id: 1, name: "Discord",  mode: "fixed",   val: 10, icon: "discord"  },
  { id: 2, name: "WhatsApp", mode: "fixed",   val: 16, icon: "whatsapp" },
  { id: 3, name: "Telegram", mode: "fixed",   val: 50, icon: "telegram" },
  { id: 4, name: "Compact",  mode: "percent", val: 25, icon: "compact"  },
];

// =============================================
// State
// =============================================
let filesQueue     = [];
let isProcessing   = false;
let selectedTarget = null;
let presets        = [];
let outputDir      = "";

function loadPresets() {
  try {
    const r = localStorage.getItem("foshorde_presets_v3");
    if (r) {
      const parsed = JSON.parse(r);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_PRESETS));
}
function savePresets() {
  localStorage.setItem("foshorde_presets_v3", JSON.stringify(presets));
}

// =============================================
// DOM Elements
// =============================================
const dropRow        = document.getElementById("drop-row");
const dropEmpty      = document.getElementById("drop-empty");
const dropLoaded     = document.getElementById("drop-loaded");
const fileCountBadge = document.getElementById("file-count-badge");
const fileNameEl     = document.getElementById("file-name");
const fileOrigSize   = document.getElementById("file-orig-size");

const presetGrid     = document.getElementById("preset-grid");

const szInput        = document.getElementById("sz-input");
const szOutput       = document.getElementById("sz-output");
const szRatio        = document.getElementById("sz-ratio");

const customSlider   = document.getElementById("custom-slider");
const customPct      = document.getElementById("custom-pct");
const sliderUseBtn   = document.getElementById("slider-use-btn");

const queueBadge     = document.getElementById("queue-badge");
const btnStart       = document.getElementById("btn-start-action");
const startLabel     = document.getElementById("start-btn-label");

const overlayQueue   = document.getElementById("overlay-queue");
const overlaySets    = document.getElementById("overlay-settings");
const queueDragHead  = document.getElementById("queue-drag-head");
const settingsDragHead = document.getElementById("settings-drag-head");

const queueList      = document.getElementById("queue-items-container");
const btnClearQ      = document.getElementById("btn-clear-queue");
const selEncoder     = document.getElementById("setting-encoder");
const statusFfmpeg     = document.getElementById("status-ffmpeg");
const statusGpu        = document.getElementById("status-gpu");
const btnOutFolder     = document.getElementById("btn-out-folder");
const btnOpenOutFolder = document.getElementById("btn-open-out-folder");
const outFolderLabel   = document.getElementById("out-folder-label");

const settingsPresetList = document.getElementById("settings-preset-list");
const newPresetName  = document.getElementById("new-preset-name");
const newPresetVal   = document.getElementById("new-preset-val");
const newModePct     = document.getElementById("new-mode-pct");
const newModeMb      = document.getElementById("new-mode-mb");
const btnAddPreset   = document.getElementById("btn-add-preset");
const btnResetAll    = document.getElementById("btn-reset-all");

// =============================================
// Window Controls
// =============================================
document.getElementById("btn-win-minimize").addEventListener("click", () =>
  tauriInvoke("minimize_window").catch(() => {})
);
document.getElementById("btn-win-close").addEventListener("click", () =>
  tauriInvoke("close_window").catch(() => {})
);
document.getElementById("titlebar").addEventListener("mousedown", (e) => {
  if (e.target.closest(".win-btn")) return;
  tauriInvoke("start_drag").catch(() => {});
});

// =============================================
// Movable Floating Dialogs (Settings & Queue)
// =============================================
function makeDraggable(dialogEl, handleEl) {
  let isDragging = false;
  let startX = 0, startY = 0;
  let initLeft = 0, initTop = 0;

  handleEl.addEventListener("mousedown", (e) => {
    if (e.target.closest("button") || e.target.closest("input")) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = dialogEl.getBoundingClientRect();
    initLeft = rect.left;
    initTop = rect.top;
    document.body.style.userSelect = "none";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const maxLeft = Math.max(5, window.innerWidth - dialogEl.offsetWidth - 5);
    const maxTop  = Math.max(36, window.innerHeight - dialogEl.offsetHeight - 5);
    const newLeft = Math.max(5, Math.min(maxLeft, initLeft + dx));
    const newTop  = Math.max(36, Math.min(maxTop, initTop + dy));

    dialogEl.style.left = `${newLeft}px`;
    dialogEl.style.top  = `${newTop}px`;
    dialogEl.style.right = "auto";
    dialogEl.style.bottom = "auto";
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = "";
    }
  });
}

makeDraggable(overlaySets, settingsDragHead);
makeDraggable(overlayQueue, queueDragHead);

// =============================================
// System Info
// =============================================
async function initSystem() {
  try {
    const sys = await tauriInvoke("get_system_info");
    statusFfmpeg.textContent = sys.ffmpeg_source === "PATH" ? "System PATH" : sys.ffmpeg_source;
    statusGpu.textContent    = sys.encoder.label;
  } catch {
    statusFfmpeg.textContent = "bin\\";
    statusGpu.textContent    = "CPU (libx265)";
  }
}

// =============================================
// Preset Grid Rendering (Main Workspace)
// =============================================
function renderPresetGrid() {
  presetGrid.innerHTML = presets.map((p) => {
    const valStr = p.mode === "percent" ? `${p.val}%` : `${p.val} MB`;
    const active = selectedTarget?.presetId === p.id ? "active" : "";
    const iconInfo = getPresetIconInfo(p.name, p.icon);

    return `
    <div class="preset-card ${active}" data-id="${p.id}" title="${p.name} (${valStr})">
      <div class="pc-icon-wrap ${iconInfo.key}">
        ${iconInfo.svg}
      </div>
      <div class="pc-info">
        <span class="pc-name">${p.name}</span>
        <span class="pc-val">${valStr}</span>
      </div>
    </div>`;
  }).join("");

  presetGrid.querySelectorAll(".preset-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = parseInt(card.dataset.id, 10);
      const p  = presets.find((x) => x.id === id);
      if (!p) return;
      selectedTarget = {
        presetId: p.id,
        mode: p.mode,
        val: p.val,
        label: p.mode === "percent" ? `${p.val}%` : `${p.val} MB`,
      };
      sliderUseBtn.classList.remove("active-custom");
      renderPresetGrid();
      updateSizeDisplay();
      updateStartBtn();
    });
  });
}

// =============================================
// Preset Reordering & Management in Settings
// =============================================
let activeDraggedRow = null;

function renderSettingsPresets() {
  settingsPresetList.innerHTML = presets.map((p, idx) => {
    const valStr = p.mode === "percent" ? `${p.val}%` : `${p.val} MB`;
    const iconInfo = getPresetIconInfo(p.name, p.icon);

    return `
    <div class="settings-preset-row" data-index="${idx}" data-id="${p.id}">
      <span class="spr-handle" title="Drag to reorder">⋮⋮</span>
      <span class="spr-icon" style="color: ${getIconColor(iconInfo.key)}">
        ${iconInfo.svg}
      </span>
      <span class="spr-name">${p.name}</span>
      <span class="spr-val">${valStr}</span>
      <button class="spr-del" data-id="${p.id}" title="Delete">✕</button>
    </div>`;
  }).join("");

  // Delete listener
  settingsPresetList.querySelectorAll(".spr-del").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id, 10);
      presets = presets.filter((p) => p.id !== id);
      if (selectedTarget?.presetId === id) {
        selectedTarget = presets[0]
          ? {
              presetId: presets[0].id,
              mode: presets[0].mode,
              val: presets[0].val,
              label: presets[0].mode === "percent" ? `${presets[0].val}%` : `${presets[0].val} MB`,
            }
          : null;
      }
      savePresets();
      renderPresetGrid();
      renderSettingsPresets();
      updateSizeDisplay();
      updateStartBtn();
    });
  });
}

// Live drag and drop reordering on the preset list
function initPresetListDrag() {
  settingsPresetList.addEventListener("mousedown", (e) => {
    if (e.target.closest("button") || e.target.closest("input")) return;
    const row = e.target.closest(".settings-preset-row");
    if (!row) return;

    e.preventDefault();
    activeDraggedRow = row;
    activeDraggedRow.classList.add("sorting-active");

    const onMouseMove = (moveEvent) => {
      if (!activeDraggedRow) return;

      // Crucial: temporarily disable pointer events on the dragged element
      // so document.elementFromPoint detects the target row underneath the mouse!
      activeDraggedRow.style.pointerEvents = "none";
      const elemBelow = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      activeDraggedRow.style.pointerEvents = "";

      const targetRow = elemBelow?.closest(".settings-preset-row");
      if (targetRow && targetRow !== activeDraggedRow && targetRow.parentElement === settingsPresetList) {
        const rect = targetRow.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (moveEvent.clientY < midY) {
          settingsPresetList.insertBefore(activeDraggedRow, targetRow);
        } else {
          settingsPresetList.insertBefore(activeDraggedRow, targetRow.nextSibling);
        }
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      if (!activeDraggedRow) return;
      activeDraggedRow.classList.remove("sorting-active");
      activeDraggedRow = null;

      // Extract new order from the DOM
      const newOrderIds = Array.from(settingsPresetList.querySelectorAll(".settings-preset-row"))
        .map((r) => parseInt(r.dataset.id, 10));

      const reordered = [];
      newOrderIds.forEach((id) => {
        const p = presets.find((item) => item.id === id);
        if (p) reordered.push(p);
      });

      presets = reordered;
      savePresets();
      renderPresetGrid();
      renderSettingsPresets();
      updateSizeDisplay();
      updateStartBtn();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  });
}

function getIconColor(key) {
  if (key === "discord")  return "#5865F2";
  if (key === "whatsapp") return "#25D366";
  if (key === "telegram") return "#229ED9";
  if (key === "compact")  return "#4f7cff";
  return "var(--accent)";
}

// Add preset
newModePct.addEventListener("click", () => {
  newModePct.classList.add("active");
  newModeMb.classList.remove("active");
  newPresetVal.max = 99;
});
newModeMb.addEventListener("click", () => {
  newModeMb.classList.add("active");
  newModePct.classList.remove("active");
  newPresetVal.max = 9999;
});

btnAddPreset.addEventListener("click", () => {
  const name = newPresetName.value.trim();
  const val  = parseInt(newPresetVal.value, 10);
  const mode = newModePct.classList.contains("active") ? "percent" : "fixed";
  if (!name || isNaN(val) || val < 1) return;

  const iconInfo = getPresetIconInfo(name, null);
  presets.push({ id: Date.now(), name, mode, val, icon: iconInfo.key });
  newPresetName.value = "";
  savePresets();
  renderPresetGrid();
  renderSettingsPresets();
});

const encoderTrigger = document.getElementById("encoder-trigger");
const encoderOptions = document.getElementById("encoder-options");
const encoderSelectedLabel = document.getElementById("encoder-selected-label");

if (encoderTrigger && encoderOptions) {
  encoderTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = encoderOptions.style.display === "block";
    encoderOptions.style.display = isOpen ? "none" : "block";
    encoderTrigger.classList.toggle("open", !isOpen);
  });

  encoderOptions.querySelectorAll(".custom-option").forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      const val = opt.dataset.value;
      selEncoder.value = val;
      encoderSelectedLabel.textContent = opt.textContent;
      encoderOptions.querySelectorAll(".custom-option").forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
      encoderOptions.style.display = "none";
      encoderTrigger.classList.remove("open");
    });
  });

  window.addEventListener("click", (e) => {
    if (!e.target.closest("#custom-encoder-select")) {
      encoderOptions.style.display = "none";
      encoderTrigger.classList.remove("open");
    }
  });
}

// Reset All Settings button
btnResetAll.addEventListener("click", () => {
  // 1. Reset Presets to defaults
  presets = JSON.parse(JSON.stringify(DEFAULT_PRESETS));
  savePresets();

  // 2. Reset Encoder
  selEncoder.value = "auto";
  if (encoderSelectedLabel) encoderSelectedLabel.textContent = "Auto (Hardware GPU)";
  if (encoderOptions) {
    encoderOptions.querySelectorAll(".custom-option").forEach((o) => {
      o.classList.toggle("selected", o.dataset.value === "auto");
    });
  }

  // 3. Reset Output Folder
  outputDir = "";
  try { localStorage.removeItem("foshorde_output_dir"); } catch {}
  updateOutputFolderUI("");

  // 4. Reset Slider
  customSlider.value = 25;
  customPct.textContent = "25%";
  sliderUseBtn.classList.remove("active-custom");

  // 5. Select default preset
  selectedTarget = {
    presetId: presets[0].id,
    mode: presets[0].mode,
    val: presets[0].val,
    label: presets[0].mode === "percent" ? `${presets[0].val}%` : `${presets[0].val} MB`,
  };

  renderPresetGrid();
  renderSettingsPresets();
  updateSizeDisplay();
  updateStartBtn();

  // Feedback animation on button
  btnResetAll.textContent = "✓ Settings Reset";
  btnResetAll.style.color = "var(--green)";
  btnResetAll.style.borderColor = "var(--green)";
  setTimeout(() => {
    btnResetAll.textContent = "↺ Reset All Settings";
    btnResetAll.style.color = "";
    btnResetAll.style.borderColor = "";
  }, 1600);
});

// =============================================
// Size Display
// =============================================
function updateSizeDisplay() {
  if (filesQueue.length === 0) {
    szInput.textContent  = "—";
    szOutput.textContent = "—";
    szOutput.className   = "size-val accent";
    szRatio.style.display = "none";
    szRatio.textContent  = "";
    return;
  }

  const totalMb = filesQueue.reduce((s, f) => s + f.size_mb, 0);
  szInput.textContent = `${totalMb.toFixed(1)} MB`;

  if (!selectedTarget) {
    szOutput.textContent = "—";
    szOutput.className   = "size-val accent";
    szRatio.style.display = "none";
    szRatio.textContent  = "";
    return;
  }

  // Done files check
  const doneFiles = filesQueue.filter((f) => f.status === "done" && f.finalSizeMb != null);
  if (doneFiles.length > 0) {
    const actualMb = doneFiles.reduce((s, f) => s + f.finalSizeMb, 0);
    const pct = ((actualMb / totalMb) * 100).toFixed(0);
    szOutput.textContent = `${actualMb.toFixed(1)} MB`;
    szOutput.className   = "size-val green";
    szRatio.textContent  = `${pct}% of original`;
    szRatio.style.display = "block";
  } else {
    let estMb;
    if (selectedTarget.mode === "percent") {
      estMb = totalMb * (selectedTarget.val / 100);
    } else {
      estMb = selectedTarget.val * filesQueue.length;
    }
    szOutput.textContent = `~${estMb.toFixed(1)} MB`;
    szOutput.className   = "size-val accent";
    const pct = Math.min(100, Math.max(1, ((estMb / totalMb) * 100))).toFixed(0);
    szRatio.textContent  = `~${pct}% of original`;
    szRatio.style.display = "block";
  }
}

// =============================================
// Custom Slider
// =============================================
customSlider.addEventListener("input", () => {
  customPct.textContent = `${customSlider.value}%`;
  if (sliderUseBtn.classList.contains("active-custom")) {
    const v = parseInt(customSlider.value, 10);
    selectedTarget = { presetId: null, mode: "percent", val: v, label: `${v}% (custom)` };
    updateSizeDisplay();
    updateStartBtn();
  }
});

sliderUseBtn.addEventListener("click", () => {
  const v = parseInt(customSlider.value, 10);
  selectedTarget = { presetId: null, mode: "percent", val: v, label: `${v}% (custom)` };
  sliderUseBtn.classList.add("active-custom");
  renderPresetGrid();
  updateSizeDisplay();
  updateStartBtn();
});

// =============================================
// Output Folder
// =============================================
function updateOutputFolderUI(folder) {
  if (folder) {
    const parts = folder.replace(/\\/g, "/").split("/");
    const leaf = parts[parts.length - 1] || "foshorde-output";
    outFolderLabel.textContent = leaf;
    outFolderLabel.title = folder;
    btnOutFolder?.classList.add("custom-active");
  } else {
    outFolderLabel.textContent = "foshorde-output";
    outFolderLabel.title = "Default: foshorde-output in project directory";
    btnOutFolder?.classList.remove("custom-active");
  }
}

function loadOutputDir() {
  try {
    const saved = localStorage.getItem("foshorde_output_dir");
    if (saved) {
      outputDir = saved;
      updateOutputFolderUI(saved);
      return;
    }
  } catch {}
  outputDir = "";
  updateOutputFolderUI("");
}

btnOutFolder?.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    const folder = await tauriInvoke("select_output_folder");
    if (folder) {
      let cleanFolder = folder.replace(/\\/g, "/").replace(/\/+$/, "");
      if (!cleanFolder.toLowerCase().endsWith("foshorde-output")) {
        cleanFolder = cleanFolder + "/foshorde-output";
      }
      outputDir = cleanFolder;
      try { localStorage.setItem("foshorde_output_dir", cleanFolder); } catch {}
      updateOutputFolderUI(cleanFolder);
    }
  } catch (err) {
    console.error("select_output_folder error:", err);
  }
});

btnOpenOutFolder?.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    await tauriInvoke("open_folder", { folderPath: outputDir || "" });
  } catch (err) {
    console.error("open_folder error:", err);
  }
});

// =============================================
// File Drop & Selection
// =============================================
async function addFile(filePath) {
  if (filesQueue.some((f) => f.path === filePath)) return;
  try {
    const meta = await tauriInvoke("probe_video", { filePath });
    filesQueue.push({
      ...meta,
      status: "pending",
      progress: 0,
      speed: "",
      eta: "",
      outputPath: null,
      finalSizeMb: null,
    });
    refreshUI();
  } catch (err) {
    console.error("Probe error:", filePath, err);
  }
}

dropRow.addEventListener("click", async () => {
  if (isProcessing) return;
  try {
    const paths = await tauriInvoke("select_video_files");
    if (paths?.length) {
      for (const p of paths) await addFile(p);
    }
  } catch {}
});

window.addEventListener("dragover",  (e) => { e.preventDefault(); dropRow.classList.add("dragover"); });
window.addEventListener("dragleave", (e) => { if (e.clientX <= 0 || e.clientY <= 0) dropRow.classList.remove("dragover"); });
window.addEventListener("drop",      (e) => { e.preventDefault(); dropRow.classList.remove("dragover"); });

// =============================================
// Overlays Toggle
// =============================================
function openOverlay(el) {
  el.style.display = "flex";
}
function closeOverlay(el) {
  el.style.display = "none";
}

document.querySelectorAll(".btn-close-overlay").forEach((btn) => {
  btn.addEventListener("click", () => {
    closeOverlay(document.getElementById(btn.dataset.close));
  });
});

document.getElementById("btn-toggle-queue").addEventListener("click", () => {
  if (overlayQueue.style.display === "flex") {
    closeOverlay(overlayQueue);
  } else {
    openOverlay(overlayQueue);
  }
});

document.getElementById("btn-toggle-settings").addEventListener("click", () => {
  if (overlaySets.style.display === "flex") {
    closeOverlay(overlaySets);
  } else {
    renderSettingsPresets();
    initSystem();
    openOverlay(overlaySets);
  }
});

btnClearQ.addEventListener("click", () => {
  if (!isProcessing) {
    filesQueue = [];
    refreshUI();
  }
});

// =============================================
// UI Refresh
// =============================================
function refreshUI() {
  const count = filesQueue.length;

  if (count === 0) {
    dropEmpty.style.display  = "flex";
    dropLoaded.style.display = "none";
    queueBadge.style.display = "none";
  } else {
    dropEmpty.style.display  = "none";
    dropLoaded.style.display = "flex";
    fileCountBadge.textContent = `${count} file${count > 1 ? "s" : ""}`;

    if (count === 1) {
      fileNameEl.textContent   = filesQueue[0].filename;
      fileOrigSize.textContent = `${filesQueue[0].size_mb.toFixed(1)} MB`;
    } else {
      fileNameEl.textContent   = `${count} videos`;
      const tot = filesQueue.reduce((s, f) => s + f.size_mb, 0);
      fileOrigSize.textContent = `${tot.toFixed(0)} MB`;
    }

    queueBadge.textContent   = count;
    queueBadge.style.display = "block";
  }

  updateSizeDisplay();
  updateStartBtn();
  renderQueue();
}

function updateStartBtn() {
  if (isProcessing) {
    btnStart.disabled = false;
    btnStart.classList.add("cancel");
    return;
  }
  btnStart.classList.remove("cancel");

  if (filesQueue.length === 0) {
    btnStart.disabled = true;
    startLabel.textContent = "Drop a video";
  } else if (!selectedTarget) {
    btnStart.disabled = true;
    startLabel.textContent = "Pick a target";
  } else {
    btnStart.disabled = false;
    startLabel.textContent = `Compress · ${selectedTarget.label}`;
  }
}

function renderQueue() {
  if (filesQueue.length === 0) {
    queueList.innerHTML = `<p class="empty-note">No videos in queue.</p>`;
    return;
  }

  queueList.innerHTML = filesQueue.map((f, i) => {
    const target = !selectedTarget ? "—"
      : selectedTarget.mode === "percent"
        ? `~${Math.max(0.1, f.size_mb * (selectedTarget.val / 100)).toFixed(1)} MB`
        : `${selectedTarget.val} MB`;

    const sc = { pending: "var(--muted)", running: "var(--accent)", done: "var(--green)", cancelled: "var(--muted)", error: "var(--danger)" }[f.status] || "var(--muted)";
    const st = f.status === "done" && f.finalSizeMb != null
      ? `✓ ${f.finalSizeMb.toFixed(1)} MB`
      : f.status === "running"
        ? `${f.progress.toFixed(0)}%${f.speed ? " · " + f.speed : ""}`
        : f.status === "cancelled"
          ? "Cancelled"
          : f.status;

    const isDone = f.status === "done" && f.outputPath;
    const nameClass = isDone ? "queue-item-name clickable-file" : "queue-item-name";
    const nameTitle = isDone ? "Click to open file in Explorer" : f.path;

    return `
    <div class="queue-item">
      <div class="queue-item-top">
        <span class="${nameClass}" data-path="${f.outputPath || f.path}" title="${nameTitle}">${f.filename}</span>
        ${!isProcessing ? `<button class="btn-remove-mini" data-idx="${i}">✕</button>` : ""}
      </div>
      <div class="queue-item-meta">
        <span>${f.size_mb.toFixed(1)} MB</span>
        <span>→</span>
        <span class="queue-item-target">${target}</span>
        <span style="margin-left:auto;color:${sc};font-weight:700">${st}</span>
      </div>
      <div class="queue-progress-bar">
        <div class="queue-progress-fill" id="qbar-${i}" style="width:${f.progress}%"></div>
      </div>
    </div>`;
  }).join("");

  document.querySelectorAll(".btn-remove-mini").forEach((btn) => {
    btn.addEventListener("click", () => {
      filesQueue.splice(parseInt(btn.dataset.idx, 10), 1);
      refreshUI();
    });
  });

  queueList.querySelectorAll(".clickable-file").forEach((el) => {
    el.addEventListener("click", () => {
      const p = el.dataset.path;
      if (p) tauriInvoke("show_in_folder", { filePath: p }).catch(() => {});
    });
  });
}

// =============================================
// Compression Execution
// =============================================
btnStart.addEventListener("click", async () => {
  if (isProcessing) {
    try { await tauriInvoke("cancel_compression"); } catch {}
    isProcessing = false;
    updateStartBtn();
    renderQueue();
    return;
  }

  if (!filesQueue.length || !selectedTarget) return;

  isProcessing = true;
  updateStartBtn();
  const encoder = selEncoder?.value || "auto";

  for (let i = 0; i < filesQueue.length; i++) {
    if (filesQueue[i].status === "done") continue;
    if (!isProcessing) break;

    filesQueue[i].status   = "running";
    filesQueue[i].progress = 0;
    renderQueue();

    try {
      const res = await tauriInvoke("compress_video", {
        inputPath: filesQueue[i].path,
        targetMode: selectedTarget.mode,
        targetVal:  parseFloat(selectedTarget.val),
        encoder,
        outputDir,
      });
      filesQueue[i].status      = "done";
      filesQueue[i].outputPath  = res.output_path;
      filesQueue[i].finalSizeMb = res.output_size_mb;
      filesQueue[i].progress    = 100;
    } catch {
      filesQueue[i].status = isProcessing ? "error" : "cancelled";
    }

    renderQueue();
    updateSizeDisplay();
  }

  isProcessing = false;
  updateStartBtn();
  renderQueue();
  updateSizeDisplay();
});

// =============================================
// Live Progress Listeners
// =============================================
function setupEvents() {
  const listen = window.__TAURI__?.event?.listen;
  if (!listen) {
    setTimeout(setupEvents, 100);
    return;
  }

  listen("files-dropped", async (e) => {
    for (const p of (e.payload || [])) await addFile(p);
  });

  listen("compression-progress", (e) => {
    const p   = e.payload;
    const idx = filesQueue.findIndex((f) => f.path === p.path);
    if (idx === -1) return;

    filesQueue[idx].progress = p.progress;
    filesQueue[idx].speed    = p.speed;

    if (isProcessing) {
      startLabel.textContent = `${Math.round(p.progress)}% · Cancel`;
    }

    const bar = document.getElementById(`qbar-${idx}`);
    if (bar) bar.style.width = `${p.progress}%`;
  });
}

// =============================================
// FFmpeg Auto-Download on First Setup
// =============================================
const overlayDl      = document.getElementById("overlay-ffmpeg-download");
const dlFill         = document.getElementById("dl-fill");
const dlStatusText   = document.getElementById("dl-status-text");
const dlPctText      = document.getElementById("dl-pct-text");
const dlMbText       = document.getElementById("dl-mb-text");
const dlSpeedText    = document.getElementById("dl-speed-text");
const btnCloseDlModal = document.getElementById("btn-close-dl-modal");

btnCloseDlModal?.addEventListener("click", () => {
  if (overlayDl) overlayDl.style.display = "none";
});

async function checkFFmpegSetup() {
  try {
    const ready = await tauriInvoke("is_ffmpeg_ready");
    if (!ready) {
      if (overlayDl) overlayDl.style.display = "flex";

      const listen = window.__TAURI__?.event?.listen;
      if (listen) {
        listen("ffmpeg-download-progress", (e) => {
          const p = e.payload;
          if (p.percent != null && dlFill) {
            dlFill.style.width = `${p.percent}%`;
            if (dlPctText) dlPctText.textContent = `${Math.round(p.percent)}%`;
          }
          if (p.message && dlStatusText) dlStatusText.textContent = p.message;
          if (p.downloaded_mb != null && p.total_mb != null && dlMbText) {
            dlMbText.textContent = `${p.downloaded_mb.toFixed(1)} / ${p.total_mb.toFixed(1)} MB`;
          }
          if (p.speed && dlSpeedText) dlSpeedText.textContent = p.speed;

          if (p.stage === "done") {
            setTimeout(() => {
              if (overlayDl) overlayDl.style.display = "none";
              initSystem();
            }, 1200);
          } else if (p.stage === "error") {
            if (dlStatusText) {
              dlStatusText.textContent = p.message || "Download failed. Please check network.";
              dlStatusText.style.color = "var(--danger)";
            }
          }
        });
      }

      await tauriInvoke("download_ffmpeg");
    }
  } catch (err) {
    console.error("FFmpeg setup error:", err);
    if (dlStatusText) {
      dlStatusText.textContent = "FFmpeg setup skipped or offline. Add bin/ffmpeg.exe manually.";
    }
  }
}

// =============================================
// Initialization & Global Event Settings
// =============================================
// Disable native browser context menu on right click
window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

window.addEventListener("DOMContentLoaded", () => {
  loadOutputDir();
  presets = loadPresets();
  if (presets[0]) {
    const p = presets[0];
    selectedTarget = {
      presetId: p.id,
      mode: p.mode,
      val: p.val,
      label: p.mode === "percent" ? `${p.val}%` : `${p.val} MB`,
    };
  }
  renderPresetGrid();
  initPresetListDrag();
  updateSizeDisplay();
  setupEvents();
  updateStartBtn();
  checkFFmpegSetup();
});
