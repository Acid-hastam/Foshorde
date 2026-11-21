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
  youtube: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  compact: `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  default: `<img src="icons/png-transparent/foshorde-32x32.png" width="18" height="18" style="display:block; object-fit:contain; pointer-events:none;" alt="Foshorde" />`
};

function getPresetIconInfo(name, iconKey) {
  if (iconKey && ICONS[iconKey]) {
    return { key: iconKey, svg: ICONS[iconKey] };
  }
  const l = (name || "").toLowerCase();
  if (l.includes("discord"))  return { key: "discord", svg: ICONS.discord };
  if (l.includes("what") || l.includes("wa")) return { key: "whatsapp", svg: ICONS.whatsapp };
  if (l.includes("tele") || l.includes("tg")) return { key: "telegram", svg: ICONS.telegram };
  if (l.includes("you") || l.includes("yt"))  return { key: "youtube", svg: ICONS.youtube };
  if (l.includes("compact") || l.includes("small") || l.includes("opt")) return { key: "compact", svg: ICONS.compact };
  return { key: "default", svg: ICONS.default };
}

// =============================================
// Video Format Support & Toast Notifications
// =============================================
const SUPPORTED_VIDEO_EXTS = new Set([
  "mp4", "mkv", "mov", "avi", "webm", "flv", "ts", "m4v", "wmv",
  "mts", "m2ts", "vob", "ogv", "3gp", "3g2", "f4v", "m2v", "mpg", "mpeg", "asf", "rm", "rmvb"
]);

const toastContainer = document.getElementById("toast-container");
function showToast(msg, type = "danger", duration = 2800) {
  if (!toastContainer) return;
  // Deduplicate: prevent stacking identical messages (e.g. multi-file drops)
  if (Array.from(toastContainer.children).some((c) => c.textContent.includes(msg))) {
    return;
  }
  while (toastContainer.children.length >= 2) {
    toastContainer.removeChild(toastContainer.firstChild);
  }

  const t = document.createElement("div");
  t.className = `toast ${type}`;
  const icon = type === "success" ? "✓" : "⚠";
  t.innerHTML = `<span class="toast-icon" style="font-weight:700;">${icon}</span><span>${msg}</span>`;
  toastContainer.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateY(-10px) scale(0.95)";
    t.style.transition = "all 0.22s ease";
    setTimeout(() => t.remove(), 220);
  }, duration);
}

// =============================================
// Default Presets
// =============================================
const DEFAULT_PRESETS = [
  { id: 1, name: "Discord",  mode: "fixed",   val: 10,  icon: "discord"  },
  { id: 2, name: "WhatsApp", mode: "fixed",   val: 16,  icon: "whatsapp" },
  { id: 3, name: "Telegram", mode: "fixed",   val: 50,  icon: "telegram" },
  { id: 4, name: "YouTube",  mode: "fixed",   val: 100, icon: "youtube"  },
  { id: 5, name: "Compact",  mode: "percent", val: 25,  icon: "compact"  },
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
    const r = localStorage.getItem("foshorde_presets_v4") || localStorage.getItem("foshorde_presets_v3");
    if (r) {
      const parsed = JSON.parse(r);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (!parsed.some((p) => (p.name || "").toLowerCase().includes("youtube"))) {
          parsed.splice(3, 0, { id: 4, name: "YouTube", mode: "fixed", val: 100, icon: "youtube" });
        }
        parsed.forEach((p) => {
          if (p.mode === "percent" && p.val > 99) p.val = 99;
        });
        return parsed;
      }
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_PRESETS));
}
function savePresets() {
  localStorage.setItem("foshorde_presets_v4", JSON.stringify(presets));
}

// =============================================
// DOM Elements
// =============================================
const dropView       = document.getElementById("drop-view");
const dropCard       = document.getElementById("drop-card");
const dropBrowseLink = document.getElementById("drop-browse-link");
const editorView     = document.getElementById("editor-view");

const dropBarChange  = document.getElementById("drop-bar-change");
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

const btnResetAll    = document.getElementById("btn-reset-all");
const btnUpdateFfmpeg = document.getElementById("btn-update-ffmpeg");

const overlayAddPreset    = document.getElementById("overlay-add-preset");
const addPresetDragHead   = document.getElementById("add-preset-drag-head");
const btnToggleAddPreset  = document.getElementById("btn-toggle-add-preset");
const addPresetName       = document.getElementById("add-preset-name");
const addModePct          = document.getElementById("add-mode-pct");
const addModeMb           = document.getElementById("add-mode-mb");
const addPresetVal        = document.getElementById("add-preset-val");
const btnConfirmAddPreset = document.getElementById("btn-confirm-add-preset");

const appFooter        = document.getElementById("app-footer");
const addPresetError   = document.getElementById("add-preset-error");
const btnStepperMinus  = document.getElementById("btn-stepper-minus");
const btnStepperPlus   = document.getElementById("btn-stepper-plus");
const addPresetUnit    = document.getElementById("add-preset-unit");
const panelLeft        = document.getElementById("panel-left");
const glowTop          = document.getElementById("glow-presets-top");
const glowBottom       = document.getElementById("glow-presets-bottom");

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
// Movable Floating Dialogs (Settings, Queue, Add Preset)
// Clamped inside window boundaries so they never get cut off!
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

    // Strict inside-window boundaries so dialog is never cut off
    const pad = 6;
    const maxLeft = Math.max(pad, window.innerWidth - dialogEl.offsetWidth - pad);
    const maxTop  = Math.max(36, window.innerHeight - dialogEl.offsetHeight - pad);
    const newLeft = Math.max(pad, Math.min(maxLeft, initLeft + dx));
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
if (overlayAddPreset && addPresetDragHead) {
  makeDraggable(overlayAddPreset, addPresetDragHead);
}

// =============================================
// Add Preset Dialog Controls & Stepper
// =============================================
let addPresetTargetMode = "percent";

btnStepperMinus?.addEventListener("click", () => {
  if (!addPresetVal) return;
  let val = parseInt(addPresetVal.value, 10) || 10;
  const step = addPresetTargetMode === "percent" ? 5 : 5;
  val = Math.max(1, val - step);
  addPresetVal.value = val;
});

btnStepperPlus?.addEventListener("click", () => {
  if (!addPresetVal) return;
  let val = parseInt(addPresetVal.value, 10) || 10;
  const max = addPresetTargetMode === "percent" ? 99 : 9999;
  const step = addPresetTargetMode === "percent" ? 5 : 5;
  val = Math.min(max, val + step);
  addPresetVal.value = val;
});

if (addModePct && addModeMb) {
  addModePct.addEventListener("click", () => {
    addPresetTargetMode = "percent";
    addModePct.classList.add("active");
    addModeMb.classList.remove("active");
    if (addPresetUnit) addPresetUnit.textContent = "%";
    if (addPresetVal) {
      addPresetVal.max = 99;
      if (parseInt(addPresetVal.value, 10) > 99) addPresetVal.value = 99;
    }
  });

  addModeMb.addEventListener("click", () => {
    addPresetTargetMode = "fixed";
    addModeMb.classList.add("active");
    addModePct.classList.remove("active");
    if (addPresetUnit) addPresetUnit.textContent = "MB";
    if (addPresetVal) {
      addPresetVal.max = 9999;
      if (parseInt(addPresetVal.value, 10) < 1) addPresetVal.value = 10;
    }
  });
}

addPresetVal?.addEventListener("input", () => {
  if (addPresetTargetMode === "percent") {
    let val = parseInt(addPresetVal.value, 10);
    if (!isNaN(val)) {
      if (val > 99) addPresetVal.value = 99;
      else if (val < 1 && addPresetVal.value.length > 1) addPresetVal.value = 1;
    }
  }
});

addPresetVal?.addEventListener("blur", () => {
  if (addPresetTargetMode === "percent") {
    let val = parseInt(addPresetVal.value, 10);
    if (isNaN(val) || val < 1) addPresetVal.value = 1;
    else if (val > 99) addPresetVal.value = 99;
  }
});

addPresetName?.addEventListener("input", () => {
  addPresetName.classList.remove("has-error");
  if (addPresetError) addPresetError.style.display = "none";
});

addPresetName?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    btnConfirmAddPreset?.click();
  }
});

btnToggleAddPreset?.addEventListener("click", () => {
  if (overlayAddPreset.style.display === "flex") {
    closeOverlay(overlayAddPreset);
  } else {
    if (addPresetError) addPresetError.style.display = "none";
    addPresetName?.classList.remove("has-error");
    openOverlay(overlayAddPreset);
    addPresetName?.focus();
  }
});

btnConfirmAddPreset?.addEventListener("click", () => {
  const name = addPresetName?.value?.trim() || "";
  if (!name) {
    if (addPresetError) {
      addPresetError.textContent = "Please enter a preset name";
      addPresetError.style.display = "block";
    }
    addPresetName?.classList.add("has-error");
    addPresetName?.focus();
    return;
  }

  // Prevent duplicate names (English message)
  const isDuplicate = presets.some((p) => p.name.trim().toLowerCase() === name.toLowerCase());
  if (isDuplicate) {
    if (addPresetError) {
      addPresetError.textContent = "Preset name already exists!";
      addPresetError.style.display = "block";
    }
    addPresetName?.classList.add("has-error");
    addPresetName?.focus();
    return;
  }

  let num = parseFloat(addPresetVal?.value) || (addPresetTargetMode === "percent" ? 25 : 10);
  if (addPresetTargetMode === "percent") {
    num = Math.min(99, Math.max(1, Math.round(num)));
  } else {
    num = Math.max(1, Math.round(num));
  }
  const iconInfo = getPresetIconInfo(name);

  const newPreset = {
    id: Date.now(),
    name,
    mode: addPresetTargetMode,
    val: num,
    icon: iconInfo.key
  };

  presets.push(newPreset);
  savePresets();

  selectedTarget = {
    presetId: newPreset.id,
    mode: newPreset.mode,
    val: newPreset.val,
    label: newPreset.mode === "percent" ? `${newPreset.val}%` : `${newPreset.val} MB`
  };

  if (addPresetName) addPresetName.value = "";
  if (addPresetVal) addPresetVal.value = addPresetTargetMode === "percent" ? 25 : 10;

  closeOverlay(overlayAddPreset);
  renderPresetGrid();
  updateSizeDisplay();
  updateStartBtn();
  showToast(`Preset "${name}" added ✓`, "success", 2000);
});

// Overscroll Edge Glow (Fixed: independent timeouts, only wheel at edge, never glowing opposite direction)
let glowTimeoutTop = null;
let glowTimeoutBottom = null;

function triggerGlow(type) {
  if (!panelLeft) return;
  const hasScroll = panelLeft.scrollHeight > panelLeft.clientHeight + 4;
  if (!hasScroll) return;

  if (type === "top") {
    if (glowBottom) glowBottom.classList.remove("active");
    clearTimeout(glowTimeoutBottom);

    if (glowTop) {
      glowTop.classList.add("active");
      clearTimeout(glowTimeoutTop);
      glowTimeoutTop = setTimeout(() => {
        glowTop.classList.remove("active");
      }, 350);
    }
  } else if (type === "bottom") {
    if (glowTop) glowTop.classList.remove("active");
    clearTimeout(glowTimeoutTop);

    if (glowBottom) {
      glowBottom.classList.add("active");
      clearTimeout(glowTimeoutBottom);
      glowTimeoutBottom = setTimeout(() => {
        glowBottom.classList.remove("active");
      }, 350);
    }
  }
}

if (panelLeft) {
  panelLeft.addEventListener("wheel", (e) => {
    const hasScroll = panelLeft.scrollHeight > panelLeft.clientHeight + 4;
    if (!hasScroll) return;

    if (e.deltaY < 0 && panelLeft.scrollTop <= 0) {
      triggerGlow("top");
    } else if (e.deltaY > 0 && panelLeft.scrollTop + panelLeft.clientHeight >= panelLeft.scrollHeight - 2) {
      triggerGlow("bottom");
    }
  }, { passive: true });
}

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
// Preset Grid Rendering + Mouse Drag Reorder (Point 5: Swap Only + Spring Animation)
// =============================================
let activeDragCard = null;
let dragStartX = 0;
let dragStartY = 0;
let isDraggingCard = false;
let justFinishedDrag = false;

function setupPresetCardMouseDrag(card) {
  card.addEventListener("mousedown", (e) => {
    // If clicked on delete button or anything inside it, don't drag
    if (e.target.closest(".btn-del-preset")) return;
    if (e.button !== 0) return; // Left mouse button only

    activeDragCard = card;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    isDraggingCard = false;

    const onMouseMove = (moveEvt) => {
      if (!activeDragCard) return;
      const dx = moveEvt.clientX - dragStartX;
      const dy = moveEvt.clientY - dragStartY;

      if (!isDraggingCard && Math.hypot(dx, dy) > 4) {
        isDraggingCard = true;
        activeDragCard.classList.add("dragging");
        document.body.style.userSelect = "none";
        document.body.style.cursor = "grabbing";
      }

      if (isDraggingCard) {
        // Find what element is currently under the cursor
        const elemUnder = document.elementFromPoint(moveEvt.clientX, moveEvt.clientY);
        const targetCard = elemUnder?.closest(".preset-card");

        // Clear previous drag-target highlight
        presetGrid.querySelectorAll(".preset-card").forEach((c) => {
          if (c !== targetCard) c.classList.remove("drag-target");
        });

        if (targetCard && targetCard !== activeDragCard && targetCard.parentNode === presetGrid) {
          targetCard.classList.add("drag-target");
        }
      }
    };

    const onMouseUp = (upEvt) => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      if (isDraggingCard && activeDragCard) {
        activeDragCard.classList.remove("dragging");
        document.body.style.userSelect = "";
        document.body.style.cursor = "";

        // Check if there is a target card to swap with
        const elemUnder = document.elementFromPoint(upEvt.clientX, upEvt.clientY);
        let targetCard = elemUnder?.closest(".preset-card");
        if (!targetCard || targetCard === activeDragCard || targetCard.parentNode !== presetGrid) {
          targetCard = presetGrid.querySelector(".preset-card.drag-target");
        }

        // Remove highlights
        presetGrid.querySelectorAll(".preset-card").forEach((c) => c.classList.remove("drag-target"));

        if (targetCard && targetCard !== activeDragCard && targetCard.parentNode === presetGrid) {
          const idA = parseInt(activeDragCard.dataset.id, 10);
          const idB = parseInt(targetCard.dataset.id, 10);

          const rectA = activeDragCard.getBoundingClientRect();
          const rectB = targetCard.getBoundingClientRect();

          const idxA = presets.findIndex((p) => p.id === idA);
          const idxB = presets.findIndex((p) => p.id === idB);

          if (idxA !== -1 && idxB !== -1) {
            // Swap in presets array (other presets untouched)
            const tmp = presets[idxA];
            presets[idxA] = presets[idxB];
            presets[idxB] = tmp;
            savePresets();

            // Re-render
            renderPresetGrid();

            // FLIP Animation between swapped cards
            const newCardA = presetGrid.querySelector(`.preset-card[data-id="${idA}"]`);
            const newCardB = presetGrid.querySelector(`.preset-card[data-id="${idB}"]`);

            if (newCardA && newCardB) {
              const newRectA = newCardA.getBoundingClientRect();
              const newRectB = newCardB.getBoundingClientRect();

              const dxA = rectA.left - newRectA.left;
              const dyA = rectA.top - newRectA.top;
              const dxB = rectB.left - newRectB.left;
              const dyB = rectB.top - newRectB.top;

              // Invert
              newCardA.style.transition = "none";
              newCardA.style.transform = `translate(${dxA}px, ${dyA}px) scale(1.05)`;
              newCardA.style.zIndex = "25";

              newCardB.style.transition = "none";
              newCardB.style.transform = `translate(${dxB}px, ${dyB}px) scale(0.95)`;
              newCardB.style.zIndex = "20";

              // Force reflow
              void newCardA.offsetWidth;

              // Play animation to final positions with spring bounce
              newCardA.style.transition = "transform 0.42s cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 0.42s ease";
              newCardB.style.transition = "transform 0.42s cubic-bezier(0.34, 1.45, 0.64, 1), box-shadow 0.42s ease";
              newCardA.style.transform = "translate(0, 0) scale(1)";
              newCardB.style.transform = "translate(0, 0) scale(1)";
              newCardA.classList.add("just-swapped");
              newCardB.classList.add("just-swapped");

              setTimeout(() => {
                if (newCardA) {
                  newCardA.style.transition = "";
                  newCardA.style.transform = "";
                  newCardA.style.zIndex = "";
                  newCardA.classList.remove("just-swapped");
                }
                if (newCardB) {
                  newCardB.style.transition = "";
                  newCardB.style.transform = "";
                  newCardB.style.zIndex = "";
                  newCardB.classList.remove("just-swapped");
                }
              }, 450);
            }
          }
        }

        justFinishedDrag = true;
        setTimeout(() => {
          justFinishedDrag = false;
        }, 100);
      } else {
        presetGrid.querySelectorAll(".preset-card").forEach((c) => c.classList.remove("drag-target"));
      }

      activeDragCard = null;
      isDraggingCard = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  });
}

function renderPresetGrid() {
  if (!presets || !presets.length) {
    presets = JSON.parse(JSON.stringify(DEFAULT_PRESETS));
    savePresets();
  }

  presetGrid.innerHTML = presets.map((p) => {
    const valStr = p.mode === "percent" ? `${p.val}%` : `${p.val} MB`;
    const active = selectedTarget?.presetId === p.id ? "active" : "";
    const iconInfo = getPresetIconInfo(p.name, p.icon);
    const canDelete = presets.length > 1;

    return `
    <div class="preset-card ${active}" data-id="${p.id}" title="${p.name} (${valStr})">
      <div class="pc-icon-wrap ${iconInfo.key}">
        ${iconInfo.svg}
      </div>
      <div class="pc-info">
        <span class="pc-name">${p.name}</span>
        <span class="pc-val">${valStr}</span>
      </div>
      ${canDelete ? `<button class="btn-del-preset" data-id="${p.id}" title="Delete ${p.name}">✕</button>` : ""}
    </div>`;
  }).join("");

  presetGrid.querySelectorAll(".preset-card").forEach((card) => {
    // Attach mouse-based drag reorder
    setupPresetCardMouseDrag(card);

    // Click to select preset
    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-del-preset")) return;
      if (justFinishedDrag) return;

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

      if (isTargetExceeding(selectedTarget, filesQueue)) {
        showToast("Output size cannot be larger than the selected video!", "danger", 3200);
      }
    });
  });

  // Delete preset button handling
  presetGrid.querySelectorAll(".btn-del-preset").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id, 10);
      presets = presets.filter((p) => p.id !== id);
      savePresets();

      if (selectedTarget?.presetId === id) {
        if (presets[0]) {
          selectedTarget = {
            presetId: presets[0].id,
            mode: presets[0].mode,
            val: presets[0].val,
            label: presets[0].mode === "percent" ? `${presets[0].val}%` : `${presets[0].val} MB`,
          };
        } else {
          selectedTarget = null;
        }
      }

      renderPresetGrid();
      updateSizeDisplay();
      updateStartBtn();
    });
  });
}

// Encoder dropdown
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

// Update FFmpeg Core button
btnUpdateFfmpeg?.addEventListener("click", () => {
  closeOverlay(overlaySets);
  checkFFmpegSetup(true);
});

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
  updateSizeDisplay();
  updateStartBtn();

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
// Size Display & Target Validation
// =============================================
function isTargetExceeding(target, queue) {
  if (!target || !queue || !queue.length) return false;
  if (target.mode === "percent") {
    return target.val >= 100;
  }
  return queue.some((f) => target.val >= f.size_mb);
}

function updateSizeDisplay() {
  if (filesQueue.length === 0) {
    szInput.textContent  = "—";
    szOutput.textContent = "—";
    szOutput.className   = "size-val accent";
    szRatio.style.display = "none";
    szRatio.className    = "size-ratio";
    szRatio.textContent  = "";
    return;
  }

  const totalMb = filesQueue.reduce((s, f) => s + f.size_mb, 0);
  szInput.textContent = `${totalMb.toFixed(1)} MB`;

  if (!selectedTarget) {
    szOutput.textContent = "—";
    szOutput.className   = "size-val accent";
    szRatio.style.display = "none";
    szRatio.className    = "size-ratio";
    szRatio.textContent  = "";
    return;
  }

  const doneFiles = filesQueue.filter((f) => f.status === "done" && f.finalSizeMb != null);
  if (doneFiles.length > 0) {
    const actualMb = doneFiles.reduce((s, f) => s + f.finalSizeMb, 0);
    const pct = ((actualMb / totalMb) * 100).toFixed(0);
    szOutput.textContent = `${actualMb.toFixed(1)} MB`;
    szOutput.className   = "size-val green";
    szRatio.className    = "size-ratio";
    szRatio.textContent  = `${pct}% of original`;
    szRatio.style.display = "block";
  } else {
    let estMb;
    if (selectedTarget.mode === "percent") {
      estMb = totalMb * (selectedTarget.val / 100);
    } else {
      estMb = selectedTarget.val * filesQueue.length;
    }

    const exceeds = isTargetExceeding(selectedTarget, filesQueue);
    szOutput.textContent = `~${estMb.toFixed(1)} MB`;

    if (exceeds) {
      szOutput.className   = "size-val danger";
      szRatio.className    = "size-ratio danger";
      szRatio.textContent  = "⚠ Output exceeds original video";
      szRatio.style.display = "block";
    } else {
      szOutput.className   = "size-val accent";
      szRatio.className    = "size-ratio";
      const pct = Math.min(100, Math.max(1, ((estMb / totalMb) * 100))).toFixed(0);
      szRatio.textContent  = `~${pct}% of original`;
      szRatio.style.display = "block";
    }
  }
}

// =============================================
// Custom Slider
// =============================================
customSlider.addEventListener("input", () => {
  const v = Math.min(99, Math.max(1, parseInt(customSlider.value, 10)));
  customPct.textContent = `${v}%`;
  if (sliderUseBtn.classList.contains("active-custom")) {
    selectedTarget = { presetId: null, mode: "percent", val: v, label: `${v}% (custom)` };
    updateSizeDisplay();
    updateStartBtn();
  }
});

sliderUseBtn.addEventListener("click", () => {
  const v = Math.min(99, Math.max(1, parseInt(customSlider.value, 10)));
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
  const iconWrap = document.getElementById("out-folder-icon");
  if (folder) {
    btnOutFolder?.classList.add("custom-set");
    btnOutFolder?.classList.remove("custom-active");
    if (iconWrap) {
      iconWrap.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>`;
    }
    outFolderLabel.textContent = "Output Set";
    btnOutFolder.title = folder;
  } else {
    btnOutFolder?.classList.remove("custom-set");
    btnOutFolder?.classList.remove("custom-active");
    if (iconWrap) {
      iconWrap.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
    }
    outFolderLabel.textContent = "foshorde-output";
    btnOutFolder.title = "Default: foshorde-output in project directory";
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
// File Drop & Selection Logic (Deduplicated & Race-Condition Free)
// =============================================
const pendingFiles = new Set();

async function addFile(filePath, doRefresh = true) {
  if (!filePath || typeof filePath !== "string") return;
  const normalized = filePath.trim();
  if (filesQueue.some((f) => f.path === normalized) || pendingFiles.has(normalized)) {
    return;
  }

  // Validate video format
  const ext = normalized.split(".").pop()?.toLowerCase();
  if (!ext || !SUPPORTED_VIDEO_EXTS.has(ext)) {
    showToast("Only video files are supported!", "danger");
    return;
  }

  pendingFiles.add(normalized);
  try {
    const meta = await tauriInvoke("probe_video", { filePath: normalized });
    if (!filesQueue.some((f) => f.path === normalized)) {
      filesQueue.push({
        ...meta,
        status: "pending",
        progress: 0,
        speed: "",
        eta: "",
        outputPath: null,
        finalSizeMb: null,
      });
      if (doRefresh) refreshUI();
    }
  } catch (err) {
    console.warn("Probe warning, adding with default metadata:", err);
    if (!filesQueue.some((f) => f.path === normalized)) {
      const filename = normalized.replace(/\\/g, "/").split("/").pop() || "video";
      filesQueue.push({
        path: normalized,
        filename,
        size_mb: 10.0,
        duration_secs: 0.0,
        audio_bitrate_kbps: 128,
        is_hdr: false,
        is_10bit: false,
        status: "pending",
        progress: 0,
        speed: "",
        eta: "",
        outputPath: null,
        finalSizeMb: null,
      });
      if (doRefresh) refreshUI();
    }
  } finally {
    pendingFiles.delete(normalized);
  }
}

async function addFiles(paths) {
  if (!paths || !paths.length) return;
  for (const p of paths) {
    await addFile(p, false);
  }
  refreshUI();
}

// Click anywhere on drop view (or browse link) to open file dialog
dropView?.addEventListener("click", async () => {
  if (isProcessing) return;
  try {
    const paths = await tauriInvoke("select_video_files");
    if (paths?.length) {
      await addFiles(paths);
    }
  } catch {}
});

// Add button in compact drop bar
dropBarChange?.addEventListener("click", async (e) => {
  e.stopPropagation();
  if (isProcessing) return;
  try {
    const paths = await tauriInvoke("select_video_files");
    if (paths?.length) {
      await addFiles(paths);
    }
  } catch {}
});

// Drag and drop event listeners
window.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropCard?.classList.add("dragover");
});
window.addEventListener("dragleave", (e) => {
  if (e.clientX <= 0 || e.clientY <= 0) {
    dropCard?.classList.remove("dragover");
  }
});
window.addEventListener("drop", async (e) => {
  e.preventDefault();
  dropCard?.classList.remove("dragover");
  if (e.dataTransfer?.files?.length) {
    const paths = Array.from(e.dataTransfer.files).map((f) => f.path).filter(Boolean);
    await addFiles(paths);
  }
});

// =============================================
// Overlays Toggle
// =============================================
function openOverlay(el) {
  if (el) el.style.display = "flex";
}
function closeOverlay(el) {
  if (el) el.style.display = "none";
}
function closeAllOverlays() {
  closeOverlay(overlayQueue);
  closeOverlay(overlaySets);
  closeOverlay(overlayAddPreset);
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
    initSystem();
    openOverlay(overlaySets);
  }
});

btnClearQ.addEventListener("click", () => {
  if (!isProcessing) {
    filesQueue = [];
    closeOverlay(overlayQueue);
    refreshUI();
  }
});

// =============================================
// UI Refresh
// =============================================
function refreshUI() {
  const count = filesQueue.length;

  if (count === 0) {
    closeOverlay(overlayQueue);
    const wasDropHidden = !dropView || dropView.style.display === "none";
    if (dropView) {
      dropView.style.display = "flex";
      if (wasDropHidden) {
        dropView.classList.remove("anim-slide-up");
        void dropView.offsetWidth; // force reflow for animation
        dropView.classList.add("anim-slide-up");
      }
    }
    if (editorView) editorView.style.display = "none";
    if (appFooter)  appFooter.style.display = "none";
    queueBadge.style.display = "none";
  } else {
    const wasEditorHidden = !editorView || editorView.style.display === "none";
    if (dropView) dropView.style.display = "none";
    if (editorView) {
      editorView.style.display = "flex";
      if (wasEditorHidden) {
        editorView.classList.remove("anim-slide-up");
        void editorView.offsetWidth;
        editorView.classList.add("anim-slide-up");
      }
    }
    if (appFooter) {
      const wasFooterHidden = !appFooter || appFooter.style.display === "none";
      appFooter.style.display = "flex";
      if (wasFooterHidden) {
        appFooter.classList.remove("anim-slide-up");
        void appFooter.offsetWidth;
        appFooter.classList.add("anim-slide-up");
      }
    }

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

  renderPresetGrid();
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
  } else if (isTargetExceeding(selectedTarget, filesQueue)) {
    btnStart.disabled = true;
    startLabel.textContent = "Output exceeds original";
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
    const targetMb = !selectedTarget ? 0
      : selectedTarget.mode === "percent"
        ? Math.max(0.1, f.size_mb * (selectedTarget.val / 100))
        : selectedTarget.val;
    const target = !selectedTarget ? "—"
      : selectedTarget.mode === "percent"
        ? `~${targetMb.toFixed(1)} MB`
        : `${selectedTarget.val} MB`;

    const isExceed = selectedTarget && targetMb >= f.size_mb;
    const targetStyle = isExceed ? "color:var(--danger);font-weight:700" : "";
    const targetDisplay = isExceed ? `${target} ⚠` : target;

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
        <span class="queue-item-target" style="${targetStyle}">${targetDisplay}</span>
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

  if (isTargetExceeding(selectedTarget, filesQueue)) {
    showToast("Output size cannot be larger than the selected video!", "danger", 3500);
    return;
  }

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

      if (res.output_size_mb >= filesQueue[i].size_mb) {
        filesQueue[i].status      = "error";
        filesQueue[i].outputPath  = res.output_path;
        filesQueue[i].finalSizeMb = res.output_size_mb;
        showToast("Output size is larger than the original video!", "danger", 4000);
      } else {
        filesQueue[i].status      = "done";
        filesQueue[i].outputPath  = res.output_path;
        filesQueue[i].finalSizeMb = res.output_size_mb;
        filesQueue[i].progress    = 100;
      }
    } catch (err) {
      filesQueue[i].status = isProcessing ? "error" : "cancelled";
      const errMsg = typeof err === "string" ? err : "Compression failed";
      showToast(errMsg, "danger", 3500);
    }

    renderQueue();
    updateSizeDisplay();
  }

  isProcessing = false;
  updateStartBtn();
  renderQueue();
  updateSizeDisplay();

  // Point 2 & 9: Close extra windows (Queue, Settings, Add Preset) and clear queue on completion
  const anyDone = filesQueue.some((f) => f.status === "done");
  const allFinished = filesQueue.length > 0 && filesQueue.every((f) => f.status === "done" || f.status === "cancelled");
  if (allFinished && anyDone) {
    showToast("Compression completed successfully ✓", "success", 2500);
    closeAllOverlays();
    setTimeout(() => {
      if (!isProcessing) {
        filesQueue = [];
        closeAllOverlays();
        refreshUI();
      }
    }, 1200);
  }
});

// =============================================
// Live Progress Listeners & Native Drop Hooks
// =============================================
function setupEvents() {
  const listen = window.__TAURI__?.event?.listen;
  if (!listen) {
    setTimeout(setupEvents, 100);
    return;
  }

  // Single authoritative files-dropped listener (eliminates duplicate triggers)
  listen("files-dropped", async (e) => {
    dropCard?.classList.remove("dragover");
    const paths = Array.isArray(e.payload) ? e.payload : (e.payload?.paths || []);
    await addFiles(paths);
  });

  listen("tauri://drag-over", () => {
    dropCard?.classList.add("dragover");
  });
  listen("tauri://drag-leave", () => {
    dropCard?.classList.remove("dragover");
  });

  // Compression progress
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
const overlayDl       = document.getElementById("overlay-ffmpeg-download");
const dlFill          = document.getElementById("dl-fill");
const dlStatusText    = document.getElementById("dl-status-text");
const dlPctText       = document.getElementById("dl-pct-text");
const dlMbText        = document.getElementById("dl-mb-text");
const dlSpeedText     = document.getElementById("dl-speed-text");
const btnCloseDlModal = document.getElementById("btn-close-dl-modal");
const dlActions       = document.getElementById("dl-actions");
const btnDlRetry      = document.getElementById("btn-dl-retry");
const btnDlOffline    = document.getElementById("btn-dl-offline");

btnCloseDlModal?.addEventListener("click", () => {
  if (overlayDl) overlayDl.style.display = "none";
});

btnDlOffline?.addEventListener("click", () => {
  if (overlayDl) overlayDl.style.display = "none";
});

btnDlRetry?.addEventListener("click", () => {
  if (dlActions) dlActions.style.display = "none";
  if (dlStatusText) {
    dlStatusText.textContent = "Connecting to server...";
    dlStatusText.style.color = "";
  }
  if (dlFill) dlFill.style.width = "0%";
  if (dlPctText) dlPctText.textContent = "0%";
  checkFFmpegSetup(true);
});

let isDlListening = false;

async function checkFFmpegSetup(force = false) {
  try {
    const ready = await tauriInvoke("is_ffmpeg_ready");
    if (!ready || force) {
      if (overlayDl) overlayDl.style.display = "flex";
      if (dlActions) dlActions.style.display = "none";
      if (dlStatusText) dlStatusText.style.color = "";

      const listen = window.__TAURI__?.event?.listen;
      if (listen && !isDlListening) {
        isDlListening = true;
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
            if (dlActions) dlActions.style.display = "none";
            setTimeout(() => {
              if (overlayDl) overlayDl.style.display = "none";
              initSystem();
            }, 1000);
          } else if (p.stage === "error") {
            if (dlStatusText) {
              dlStatusText.textContent = p.message || "Download failed. Check internet/VPN or add bin/ffmpeg.exe.";
              dlStatusText.style.color = "var(--danger)";
            }
            if (dlActions) dlActions.style.display = "flex";
          }
        });
      }

      await tauriInvoke("download_ffmpeg");
    }
  } catch (err) {
    console.error("FFmpeg setup error:", err);
    if (dlStatusText) {
      dlStatusText.textContent = "FFmpeg setup skipped or offline. You can retry with a VPN or place ffmpeg.exe in bin/.";
      dlStatusText.style.color = "var(--danger)";
    }
    if (dlActions) dlActions.style.display = "flex";
  }
}

// =============================================
// Initialization
// =============================================
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
  updateSizeDisplay();
  setupEvents();
  updateStartBtn();
  refreshUI();
  checkFFmpegSetup();
});
