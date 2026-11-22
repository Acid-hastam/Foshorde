// Foshorde — UI Controller

const tauriInvoke = (cmd, args = {}) => {
  const inv = window.__TAURI__?.core?.invoke;
  if (!inv) return Promise.reject(new Error("Tauri not available"));
  return inv(cmd, args);
};

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOutExpo = (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k));

// =============================================
// Icons (monochrome, inherit currentColor)
// =============================================
const ICONS = {
  discord: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.004 2C6.48 2 2 6.48 2 12c0 1.96.57 3.79 1.55 5.34L2 22l4.81-1.51A9.957 9.957 0 0 0 12.004 22C17.524 22 22 17.52 22 12s-4.476-10-9.996-10zm5.83 14.28c-.24.68-1.22 1.3-1.74 1.38-.49.07-1.12.1-3.26-.79-2.73-1.13-4.49-3.92-4.63-4.1-.14-.19-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.55-.34.73-.34.19 0 .37 0 .54.01.18.01.42-.07.65.49.24.58.82 2 .89 2.15.07.15.12.33.02.53-.1.19-.15.31-.3.49-.15.17-.31.39-.45.52-.15.15-.31.31-.13.62.18.31.79 1.3 1.7 2.11 1.17 1.04 2.15 1.37 2.46 1.52.31.15.49.13.67-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.7-.15.28.11 1.77.83 2.08.98.31.15.52.23.6.36.08.13.08.77-.16 1.45z"/></svg>`,
  telegram: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  compact: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7"/></svg>`,
  custom: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 8h10M18 8h2M4 16h2M10 16h10"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/></svg>`,
  default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>`,
};

function getPresetIconInfo(name, iconKey) {
  if (iconKey && ICONS[iconKey]) return { key: iconKey, svg: ICONS[iconKey] };
  const l = (name || "").toLowerCase();
  if (l.includes("discord")) return { key: "discord", svg: ICONS.discord };
  if (l.includes("what") || l.includes("wa")) return { key: "whatsapp", svg: ICONS.whatsapp };
  if (l.includes("tele") || l.includes("tg")) return { key: "telegram", svg: ICONS.telegram };
  if (l.includes("you") || l.includes("yt")) return { key: "youtube", svg: ICONS.youtube };
  if (l.includes("compact") || l.includes("small") || l.includes("opt")) return { key: "compact", svg: ICONS.compact };
  return { key: "default", svg: ICONS.default };
}

// =============================================
// Formatting
// =============================================
function sizeParts(mb) {
  if (!isFinite(mb) || mb <= 0) return { v: "0", u: "MB" };
  if (mb >= 1024) return { v: (mb / 1024).toFixed(2), u: "GB" };
  if (mb >= 100) return { v: Math.round(mb).toString(), u: "MB" };
  return { v: mb.toFixed(1), u: "MB" };
}
const sizeHTML = (mb) => { const p = sizeParts(mb); return `${p.v}<span class="u">${p.u}</span>`; };
const sizeText = (mb) => { const p = sizeParts(mb); return `${p.v} ${p.u}`; };
function fmtDuration(s) {
  if (!s || s <= 0) return "";
  s = Math.round(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
}
const targetLabel = (t) => (t.mode === "percent" ? `${t.val}%` : `${t.val} MB`);

// Tween a number, cancelling any previous tween on the same key
const tweens = new Map();
function tween(key, from, to, dur, onUpdate, ease = easeOutExpo) {
  if (tweens.has(key)) cancelAnimationFrame(tweens.get(key));
  const t0 = performance.now();
  const step = (t) => {
    const k = clamp((t - t0) / dur, 0, 1);
    onUpdate(from + (to - from) * ease(k));
    if (k < 1) tweens.set(key, requestAnimationFrame(step));
    else tweens.delete(key);
  };
  tweens.set(key, requestAnimationFrame(step));
}

// =============================================
// Toasts
// =============================================
const toastContainer = $("toast-container");
function showToast(msg, type = "danger", duration = 2800) {
  if ([...toastContainer.children].some((c) => c.dataset.msg === msg)) return;
  while (toastContainer.children.length >= 2) toastContainer.firstChild.remove();
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.dataset.msg = msg;
  t.innerHTML = `<span class="toast-dot"></span><span>${esc(msg)}</span>`;
  toastContainer.appendChild(t);
  setTimeout(() => {
    t.classList.add("out");
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// =============================================
// Ambient particle field
// =============================================
const fx = (() => {
  const cv = $("fx");
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  let mode = "idle";
  let speed = 1;
  const focus = { x: 0, y: 0 };
  const P = [];
  const sparks = [];
  const COUNT = 90;
  let dotRGB = "200,212,255", streakRGB = "143,176,255", alphaMul = 1, style = "drift";

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!focus.x) { focus.x = W / 2; focus.y = H / 2; }
  }

  function seed(p, edge) {
    p.z = Math.random();
    if (edge && mode === "compress") {
      const side = Math.random() < 0.5 ? -1 : 1;
      p.x = side < 0 ? -8 - Math.random() * 60 : W + 8 + Math.random() * 60;
      p.y = focus.y + (Math.random() - 0.5) * H * 1.2;
      p.vx = 0; p.vy = 0;
    } else if (edge) {
      const a = Math.random() * Math.PI * 2;
      const R = Math.hypot(W, H) / 2 + 20;
      p.x = W / 2 + Math.cos(a) * R;
      p.y = H / 2 + Math.sin(a) * R;
      p.vx = 0; p.vy = 0;
    } else {
      p.x = Math.random() * W;
      p.y = Math.random() * H;
      p.vx = (Math.random() - 0.5) * 0.15;
      p.vy = (Math.random() - 0.5) * 0.15;
    }
    return p;
  }

  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    ctx.clearRect(0, 0, W, H);

    for (const p of P) {
      const dx = focus.x - p.x, dy = focus.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      if (mode === "compress") {
        const ax = Math.sign(dx) * (0.04 + 0.22 * p.z) * speed;
        p.vx = p.vx * 0.965 + ax;
        p.vy = p.vy * 0.9 + dy * 0.0022;
        if (Math.abs(dx) < 46 && Math.abs(dy) < 60) seed(p, true);
      } else if (mode === "attract") {
        const f = 0.32 * (0.35 + p.z);
        p.vx = p.vx * 0.93 + (dx / d) * f;
        p.vy = p.vy * 0.93 + (dy / d) * f;
        if (d < 50) seed(p, true);
      } else if (style === "rain") {
        // falling code rain
        p.vx *= 0.9;
        p.vy += (0.8 + p.z * 3.2 - p.vy) * 0.05;
        if (p.y > H + 10) { p.y = -10 - Math.random() * 40; p.x = Math.random() * W; }
      } else if (style === "rise") {
        // slow bubbles drifting up with a sway
        p.vy += (-0.25 - p.z * 0.6 - p.vy) * 0.03;
        p.vx = Math.sin((p.y + p.z * 500) * 0.015) * 0.3;
        if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
      } else if (style === "warp") {
        // hyperspace: stars stream out of the centre
        const ox = p.x - W / 2, oy = p.y - H / 2;
        const d0 = Math.hypot(ox, oy) || 1;
        const sp = 0.05 + d0 * 0.012 * (0.3 + p.z);
        p.vx += ((ox / d0) * sp - p.vx) * 0.1;
        p.vy += ((oy / d0) * sp - p.vy) * 0.1;
        if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) {
          p.x = W / 2 + (Math.random() - 0.5) * 80;
          p.y = H / 2 + (Math.random() - 0.5) * 80;
          p.vx = p.vy = 0;
        }
      } else {
        p.vx = p.vx * 0.97 + (Math.random() - 0.5) * 0.012;
        p.vy = p.vy * 0.97 + (Math.random() - 0.5) * 0.012 - 0.0015;
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      }
      p.x += p.vx;
      p.y += p.vy;

      const v = Math.hypot(p.vx, p.vy);
      if (mode === "idle" && style === "rise") {
        ctx.strokeStyle = `rgba(${dotRGB},${(0.12 + 0.3 * p.z) * alphaMul})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5 + p.z * 3.5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (v > 1.1) {
        const k = 3.2 + p.z * 3;
        const a = (0.1 + 0.45 * p.z) * clamp(v / 6, 0.3, 1);
        ctx.strokeStyle = `rgba(${streakRGB},${a * alphaMul})`;
        ctx.lineWidth = 0.6 + p.z;
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * k, p.y - p.vy * k);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(${dotRGB},${(0.06 + 0.22 * p.z) * alphaMul})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.4 + p.z * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy;
      s.vx *= 0.94; s.vy *= 0.94; s.vy += 0.03;
      s.life -= 0.014;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.strokeStyle = s.c.replace("A", (s.life * 0.9).toFixed(3));
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(s.x - s.vx * 3, s.y - s.vy * 3);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }
  }

  window.addEventListener("resize", resize);
  resize();
  for (let i = 0; i < COUNT; i++) P.push(seed({}, false));
  requestAnimationFrame(frame);

  return {
    refresh() {
      const cs = getComputedStyle(document.body);
      dotRGB = cs.getPropertyValue("--fx-dot").trim() || dotRGB;
      streakRGB = cs.getPropertyValue("--fx-streak").trim() || streakRGB;
      alphaMul = parseFloat(cs.getPropertyValue("--fx-alpha")) || 0;
      style = cs.getPropertyValue("--fx-style").trim() || "drift";
    },
    setMode(m) { mode = m; },
    getMode() { return mode; },
    setFocusEl(el) {
      if (!el) { focus.x = W / 2; focus.y = H / 2; return; }
      const r = el.getBoundingClientRect();
      if (r.width) { focus.x = r.left + r.width / 2; focus.y = r.top + r.height / 2; }
    },
    setSpeed(s) { speed = s; },
    burst(x, y, n = 80) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 1.5 + Math.random() * 6;
        sparks.push({
          x, y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          life: 0.6 + Math.random() * 0.5,
          c: Math.random() < 0.7 ? `rgba(${streakRGB},A)` : `rgba(${dotRGB},A)`,
        });
      }
    },
  };
})();

// Cursor spotlight
window.addEventListener("mousemove", (e) => {
  document.documentElement.style.setProperty("--mx", `${e.clientX}px`);
  document.documentElement.style.setProperty("--my", `${e.clientY}px`);
}, { passive: true });

// =============================================
// Rolling digits
// =============================================
function makeRoller(el) {
  const strip = "0123456789".split("").map((d) => `<i>${d}</i>`).join("");
  el.innerHTML = [0, 1, 2].map(() => `<span class="dg"><span class="strip">${strip}</span></span>`).join("");
  const cols = [...el.querySelectorAll(".dg")];
  let last = -1;
  return {
    set(v) {
      v = clamp(Math.floor(v), 0, 100);
      if (v === last) return;
      last = v;
      const digits = [v >= 100 ? 1 : null, v >= 10 ? Math.floor(v / 10) % 10 : null, v % 10];
      digits.forEach((d, i) => {
        cols[i].classList.toggle("off", d === null);
        cols[i].firstChild.style.transform = `translateY(${-(d ?? 0) * 10}%)`;
      });
    },
  };
}

// =============================================
// Default Presets & State
// =============================================
const DEFAULT_PRESETS = [
  { id: 1, name: "Discord",  mode: "fixed",   val: 10,  icon: "discord"  },
  { id: 2, name: "WhatsApp", mode: "fixed",   val: 16,  icon: "whatsapp" },
  { id: 3, name: "Telegram", mode: "fixed",   val: 50,  icon: "telegram" },
  { id: 4, name: "YouTube",  mode: "fixed",   val: 100, icon: "youtube"  },
  { id: 5, name: "Compact",  mode: "percent", val: 25,  icon: "compact"  },
];

let filesQueue     = [];
let isProcessing   = false;
let selectedTarget = null;
let presets        = [];
let outputDir      = "";
let encoderChoice  = "auto";
let currentView    = null;

function loadPresets() {
  try {
    const r = localStorage.getItem("foshorde_presets_v4") || localStorage.getItem("foshorde_presets_v3");
    if (r) {
      const parsed = JSON.parse(r);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (!parsed.some((p) => (p.name || "").toLowerCase().includes("youtube"))) {
          parsed.splice(3, 0, { id: 4, name: "YouTube", mode: "fixed", val: 100, icon: "youtube" });
        }
        parsed.forEach((p) => { if (p.mode === "percent" && p.val > 99) p.val = 99; });
        return parsed;
      }
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULT_PRESETS));
}
function savePresets() {
  try { localStorage.setItem("foshorde_presets_v4", JSON.stringify(presets)); } catch {}
}
function loadEncoder() {
  try { return localStorage.getItem("foshorde_encoder") || "auto"; } catch { return "auto"; }
}
function presetTarget(p) {
  return { presetId: p.id, mode: p.mode, val: p.val, label: targetLabel(p) };
}

// =============================================
// DOM
// =============================================
const views = {
  drop: $("view-drop"),
  edit: $("view-edit"),
  run:  $("view-run"),
  done: $("view-done"),
};
const dropZone      = $("drop-zone");
const fileNameEl    = $("file-name");
const fileSubEl     = $("file-sub");
const szInput       = $("sz-input");
const szOutput      = $("sz-output");
const szRatio       = $("sz-ratio");
const meter         = $("meter");
const meterFill     = $("meter-fill");
const presetGrid    = $("preset-grid");
const presetsScroll = $("presets-scroll");
const chipIndicator = $("chip-indicator");
const customRow     = $("custom-row");
const customSlider  = $("custom-slider");
const customPct     = $("custom-pct");
const queueBadge    = $("queue-badge");
const btnStart      = $("btn-start-action");
const startLabel    = $("start-btn-label");
const btnOutFolder  = $("btn-out-folder");
const outFolderLabel = $("out-folder-label");
const drawer        = $("drawer");
const scrim         = $("scrim");
const queueList     = $("queue-items-container");
const runRoller     = makeRoller($("run-roller"));
const runFill       = $("run-fill");
const runFile       = $("run-file");
const runMeta       = $("run-meta");
const runDots       = $("run-dots");

// Stagger indices for entrance animations
Object.values(views).forEach((v) => v.querySelectorAll("[data-s]").forEach((el, i) => el.style.setProperty("--i", i)));
document.querySelectorAll(".panel").forEach((p) => p.querySelectorAll("[data-p]").forEach((el, i) => el.style.setProperty("--i", i)));

// Drag frame (shown when dragging files over a non-drop view)
const dropFrame = document.createElement("div");
dropFrame.className = "drop-frame";
document.body.appendChild(dropFrame);

// =============================================
// View manager
// =============================================
function setView(name) {
  if (currentView === name) return;
  const next = views[name];
  const prev = currentView && views[currentView];
  if (prev) {
    clearTimeout(prev._t);
    prev.classList.remove("on", "enter");
    prev.classList.add("leave");
    prev._t = setTimeout(() => prev.classList.remove("leave"), 300);
  }
  clearTimeout(next._t);
  next.classList.remove("leave", "enter");
  next.classList.add("on");
  void next.offsetWidth;
  next.classList.add("enter");
  currentView = name;
  document.body.dataset.view = name;

  if (name === "edit") requestAnimationFrame(() => updateIndicator(true));
  if (name === "run") {
    fx.setMode("compress");
    requestAnimationFrame(() => fx.setFocusEl($("press-logo")));
  } else if (!document.body.classList.contains("dragging")) {
    fx.setMode("idle");
  }
}

// =============================================
// Window controls
// =============================================
$("btn-win-minimize").addEventListener("click", () => tauriInvoke("minimize_window").catch(() => {}));
$("btn-win-close").addEventListener("click", () => tauriInvoke("close_window").catch(() => {}));
const appWindow = () => window.__TAURI__?.window?.getCurrentWindow?.();
const toggleMaximize = () => appWindow()?.toggleMaximize().catch(() => {});
$("btn-win-maximize").addEventListener("click", toggleMaximize);
$("titlebar").addEventListener("mousedown", (e) => {
  if (e.button !== 0 || e.target.closest("button")) return;
  if (e.detail === 2) { toggleMaximize(); return; }
  tauriInvoke("start_drag").catch(() => {});
});

// Edge handles: the window is undecorated, so resizing is driven from here
const RESIZE_DIRS = { n: "North", s: "South", e: "East", w: "West", ne: "NorthEast", nw: "NorthWest", se: "SouthEast", sw: "SouthWest" };
Object.entries(RESIZE_DIRS).forEach(([k, dir]) => {
  const h = document.createElement("div");
  h.className = `rz rz-${k}`;
  h.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    appWindow()?.startResizeDragging(dir).catch(() => {});
  });
  document.body.appendChild(h);
});
async function syncMaximized() {
  try { document.body.classList.toggle("maxed", !!(await appWindow()?.isMaximized())); } catch {}
}
window.addEventListener("resize", syncMaximized);

// =============================================
// Presets: render, indicator, select, reorder, delete
// =============================================
let customActive = false;
let justFinishedDrag = false;

function chipHTML(p, i, animate) {
  const icon = getPresetIconInfo(p.name, p.icon);
  const active = !customActive && selectedTarget?.presetId === p.id ? "active" : "";
  const canDelete = presets.length > 1;
  return `
    <div class="chip ${active} ${animate ? "enter" : ""}" data-id="${p.id}" style="--ci:${i}" title="${esc(p.name)} · ${targetLabel(p)}">
      <span class="chip-ico">${icon.svg}</span>
      <span class="chip-name">${esc(p.name)}</span>
      <span class="chip-val">${targetLabel(p)}</span>
      ${canDelete ? `<span class="chip-x" data-del="${p.id}" title="Delete">${ICONS.x}</span>` : ""}
    </div>`;
}

function renderPresetGrid(opts = {}) {
  if (!presets || !presets.length) {
    presets = JSON.parse(JSON.stringify(DEFAULT_PRESETS));
    savePresets();
  }
  const animateAll = !!opts.animate;
  const n = presets.length;
  presetGrid.innerHTML =
    presets.map((p, i) => chipHTML(p, i, animateAll || opts.newId === p.id)).join("") +
    `<div class="chip ${customActive ? "active" : ""} ${animateAll ? "enter" : ""}" data-custom style="--ci:${n}" title="Custom percentage">
       <span class="chip-ico">${ICONS.custom}</span>
       <span class="chip-name">Custom</span>
       <span class="chip-val" id="chip-custom-val">${customSlider.value}%</span>
     </div>
     <div class="chip add ${animateAll ? "enter" : ""}" data-add style="--ci:${n + 1}" title="New preset">${ICONS.plus}</div>`;

  presetGrid.querySelectorAll(".chip[data-id]").forEach((chip) => {
    setupChipDrag(chip);
    chip.addEventListener("click", (e) => {
      if (justFinishedDrag) return;
      const del = e.target.closest("[data-del]");
      if (del) { e.stopPropagation(); deletePreset(parseInt(del.dataset.del, 10), chip); return; }
      const p = presets.find((x) => x.id === parseInt(chip.dataset.id, 10));
      if (!p) return;
      customActive = false;
      selectedTarget = presetTarget(p);
      onTargetChanged();
      if (isTargetExceeding(selectedTarget, filesQueue)) {
        showToast("That target is bigger than the video", "danger", 3000);
      }
    });
  });

  presetGrid.querySelector("[data-custom]").addEventListener("click", () => {
    customActive = true;
    const v = clamp(parseInt(customSlider.value, 10), 1, 99);
    selectedTarget = { presetId: null, mode: "percent", val: v, label: `${v}%` };
    onTargetChanged();
  });
  presetGrid.querySelector("[data-add]").addEventListener("click", () => openPanel("preset"));

  customRow.classList.toggle("open", customActive);
  updateIndicator();
}

function updateIndicator(instant) {
  const active = presetGrid.querySelector(".chip.active");
  if (!active || !active.offsetWidth) {
    chipIndicator.style.opacity = "0";
    return;
  }
  const x = presetGrid.offsetLeft + active.offsetLeft;
  const y = presetGrid.offsetTop + active.offsetTop;
  if (instant) chipIndicator.style.transition = "none";
  chipIndicator.style.opacity = "1";
  chipIndicator.style.width = `${active.offsetWidth}px`;
  chipIndicator.style.transform = `translate(${x}px, ${y}px)`;
  if (instant) { void chipIndicator.offsetWidth; chipIndicator.style.transition = ""; }

  // keep active chip in view when the list grows past two rows
  const top = y - 6, bottom = y + active.offsetHeight + 6;
  const st = presetsScroll.scrollTop, sh = presetsScroll.clientHeight;
  if (top < st) presetsScroll.scrollTo({ top, behavior: "smooth" });
  else if (bottom > st + sh) presetsScroll.scrollTo({ top: bottom - sh, behavior: "smooth" });
}

function onTargetChanged() {
  presetGrid.querySelectorAll(".chip").forEach((c) => {
    const isActive = c.hasAttribute("data-custom")
      ? customActive
      : !customActive && c.dataset.id && selectedTarget?.presetId === parseInt(c.dataset.id, 10);
    c.classList.toggle("active", !!isActive);
  });
  customRow.classList.toggle("open", customActive);
  updateIndicator();
  updateSizeDisplay();
  updateStartBtn();
  renderQueue();
}

function deletePreset(id, chip) {
  chip.classList.add("out");
  setTimeout(() => {
    presets = presets.filter((p) => p.id !== id);
    savePresets();
    if (selectedTarget?.presetId === id) {
      selectedTarget = presets[0] ? presetTarget(presets[0]) : null;
    }
    renderPresetGrid();
    updateSizeDisplay();
    updateStartBtn();
  }, 260);
}

function setupChipDrag(chip) {
  chip.addEventListener("mousedown", (e) => {
    if (e.button !== 0 || e.target.closest("[data-del]")) return;
    const sx = e.clientX, sy = e.clientY;
    let dragging = false;

    const move = (ev) => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 5) {
        dragging = true;
        chip.classList.add("dragging");
        document.body.style.cursor = "grabbing";
      }
      if (!dragging) return;
      const target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(".chip[data-id]");
      presetGrid.querySelectorAll(".chip").forEach((c) => c.classList.toggle("drag-target", c === target && c !== chip));
    };

    const up = (ev) => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      if (!dragging) return;
      chip.classList.remove("dragging");
      document.body.style.cursor = "";
      let target = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(".chip[data-id]");
      if (!target || target === chip) target = presetGrid.querySelector(".chip.drag-target");
      presetGrid.querySelectorAll(".chip").forEach((c) => c.classList.remove("drag-target"));

      if (target && target !== chip) swapChips(chip, target);
      justFinishedDrag = true;
      setTimeout(() => (justFinishedDrag = false), 100);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  });
}

function swapChips(a, b) {
  const idA = parseInt(a.dataset.id, 10), idB = parseInt(b.dataset.id, 10);
  const ia = presets.findIndex((p) => p.id === idA), ib = presets.findIndex((p) => p.id === idB);
  if (ia < 0 || ib < 0) return;
  const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
  [presets[ia], presets[ib]] = [presets[ib], presets[ia]];
  savePresets();
  renderPresetGrid();

  const na = presetGrid.querySelector(`.chip[data-id="${idA}"]`);
  const nb = presetGrid.querySelector(`.chip[data-id="${idB}"]`);
  [[na, ra, 1.06], [nb, rb, 0.94]].forEach(([el, r, s]) => {
    if (!el) return;
    const nr = el.getBoundingClientRect();
    el.style.transition = "none";
    el.style.transform = `translate(${r.left - nr.left}px, ${r.top - nr.top}px) scale(${s})`;
    el.classList.add("just-swapped");
    void el.offsetWidth;
    el.style.transition = "transform .5s cubic-bezier(.34,1.56,.64,1)";
    el.style.transform = "";
    setTimeout(() => { el.style.transition = ""; el.classList.remove("just-swapped"); }, 520);
  });
}


// =============================================
// Custom slider
// =============================================
function paintSlider() {
  const v = clamp(parseInt(customSlider.value, 10), 1, 99);
  customSlider.style.setProperty("--p", `${((v - 1) / 98) * 100}%`);
  customPct.textContent = `${v}%`;
  const cv = $("chip-custom-val");
  if (cv) cv.textContent = `${v}%`;
  return v;
}
customSlider.addEventListener("input", () => {
  const v = paintSlider();
  if (customActive) {
    selectedTarget = { presetId: null, mode: "percent", val: v, label: `${v}%` };
    updateSizeDisplay(true);
    updateStartBtn();
    updateIndicator();
  }
});

// =============================================
// Size display (hero)
// =============================================
const hero = { inMb: 0, outMb: 0, exceeded: false };

function isTargetExceeding(target, queue) {
  if (!target || !queue || !queue.length) return false;
  if (target.mode === "percent") return target.val >= 100;
  return queue.some((f) => target.val >= f.size_mb);
}

function estimateOutput() {
  const totalMb = filesQueue.reduce((s, f) => s + f.size_mb, 0);
  if (!selectedTarget) return { totalMb, estMb: 0 };
  const estMb = selectedTarget.mode === "percent"
    ? totalMb * (selectedTarget.val / 100)
    : selectedTarget.val * filesQueue.length;
  return { totalMb, estMb };
}

function updateSizeDisplay(fast) {
  if (!filesQueue.length) {
    szInput.textContent = "—";
    szOutput.textContent = "—";
    meterFill.style.width = "0%";
    szRatio.innerHTML = "&nbsp;";
    hero.inMb = hero.outMb = 0;
    return;
  }
  const { totalMb, estMb } = estimateOutput();
  const dur = fast ? 250 : 900;

  tween("in", hero.inMb, totalMb, dur, (v) => (szInput.innerHTML = sizeHTML(v)));
  hero.inMb = totalMb;

  if (!selectedTarget) {
    szOutput.textContent = "—";
    meterFill.style.width = "0%";
    szRatio.innerHTML = "Pick a target below";
    return;
  }

  const exceeds = isTargetExceeding(selectedTarget, filesQueue);
  tween("out", hero.outMb, estMb, dur, (v) => (szOutput.innerHTML = sizeHTML(v)));
  if (!fast && Math.abs(hero.outMb - estMb) > 0.01) {
    szOutput.classList.remove("pop");
    void szOutput.offsetWidth;
    szOutput.classList.add("pop");
  }
  hero.outMb = estMb;

  szOutput.classList.toggle("danger", exceeds);
  meter.classList.toggle("danger", exceeds);
  szRatio.classList.toggle("danger", exceeds);
  if (exceeds && !hero.exceeded) {
    meter.classList.remove("shake");
    void meter.offsetWidth;
    meter.classList.add("shake");
  }
  hero.exceeded = exceeds;

  const ratio = clamp(estMb / totalMb, 0, 1);
  meterFill.style.width = `${exceeds ? 100 : Math.max(1.5, ratio * 100)}%`;

  if (exceeds) {
    szRatio.innerHTML = `<span>Target is larger than the source</span>`;
  } else {
    const smaller = Math.round((1 - ratio) * 100);
    let right = "";
    if (filesQueue.length === 1 && filesQueue[0].duration_secs > 1) {
      const kbps = (estMb * 8 * 1024) / filesQueue[0].duration_secs;
      right = kbps >= 1000 ? `≈ ${(kbps / 1000).toFixed(1)} Mbps` : `≈ ${Math.round(kbps)} kbps`;
    } else if (filesQueue.length > 1 && selectedTarget.mode === "fixed") {
      right = `${selectedTarget.val} MB each`;
    }
    szRatio.innerHTML = `<span><b>${smaller}%</b> smaller</span><span>${right}</span>`;
  }
}

// =============================================
// Output folder
// =============================================
function updateOutputFolderUI(folder) {
  if (folder) {
    btnOutFolder.classList.add("custom-set");
    const parts = folder.replace(/\\/g, "/").split("/").filter(Boolean);
    outFolderLabel.textContent = parts.slice(-2).join(" / ");
    btnOutFolder.title = folder;
  } else {
    btnOutFolder.classList.remove("custom-set");
    outFolderLabel.textContent = "foshorde-output";
    btnOutFolder.title = "Default: foshorde-output next to the app. Click to change.";
  }
}
function loadOutputDir() {
  try {
    const saved = localStorage.getItem("foshorde_output_dir");
    if (saved) { outputDir = saved; updateOutputFolderUI(saved); return; }
  } catch {}
  outputDir = "";
  updateOutputFolderUI("");
}
btnOutFolder.addEventListener("click", async () => {
  try {
    const folder = await tauriInvoke("select_output_folder");
    if (folder) {
      let clean = folder.replace(/\\/g, "/").replace(/\/+$/, "");
      if (!clean.toLowerCase().endsWith("foshorde-output")) clean += "/foshorde-output";
      outputDir = clean;
      try { localStorage.setItem("foshorde_output_dir", clean); } catch {}
      updateOutputFolderUI(clean);
    }
  } catch (err) { console.error("select_output_folder error:", err); }
});
$("btn-open-out-folder").addEventListener("click", () => {
  tauriInvoke("open_folder", { folderPath: outputDir || "" }).catch((err) => console.error(err));
});

// =============================================
// Files: add / browse / drop
// =============================================
const SUPPORTED_VIDEO_EXTS = new Set([
  "mp4", "mkv", "mov", "avi", "webm", "flv", "ts", "m4v", "wmv",
  "mts", "m2ts", "vob", "ogv", "3gp", "3g2", "f4v", "m2v", "mpg", "mpeg", "asf", "rm", "rmvb",
]);
const pendingFiles = new Set();

async function addFile(filePath, doRefresh = true) {
  if (!filePath || typeof filePath !== "string") return;
  const normalized = filePath.trim();
  if (filesQueue.some((f) => f.path === normalized) || pendingFiles.has(normalized)) return;

  const ext = normalized.split(".").pop()?.toLowerCase();
  if (!ext || !SUPPORTED_VIDEO_EXTS.has(ext)) {
    showToast("Only video files are supported");
    return;
  }

  pendingFiles.add(normalized);
  const base = { status: "pending", progress: 0, speed: "", eta: "", outputPath: null, finalSizeMb: null };
  try {
    const meta = await tauriInvoke("probe_video", { filePath: normalized });
    if (!filesQueue.some((f) => f.path === normalized)) filesQueue.push({ ...meta, ...base });
  } catch (err) {
    console.warn("Probe warning, adding with default metadata:", err);
    if (!filesQueue.some((f) => f.path === normalized)) {
      const filename = normalized.replace(/\\/g, "/").split("/").pop() || "video";
      filesQueue.push({
        path: normalized, filename, size_mb: 10.0, duration_secs: 0.0,
        audio_bitrate_kbps: 128, is_hdr: false, is_10bit: false, ...base,
      });
    }
  } finally {
    pendingFiles.delete(normalized);
  }
  if (doRefresh) refreshUI();
}

async function addFiles(paths) {
  if (!paths || !paths.length) return;
  if (currentView === "done" && !isProcessing) filesQueue = [];
  for (const p of paths) await addFile(p, false);
  bumpBadge();
  refreshUI();
}

async function browse() {
  if (isProcessing) return;
  try {
    const paths = await tauriInvoke("select_video_files");
    if (paths?.length) await addFiles(paths);
  } catch {}
}
dropZone.addEventListener("click", browse);
$("drop-bar-change").addEventListener("click", browse);

function setDragging(on) {
  document.body.classList.toggle("dragging", on);
  if (isProcessing) return;
  if (on) {
    if (currentView === "drop") fx.setFocusEl(document.querySelector(".orb"));
    else fx.setFocusEl(null);
    fx.setMode("attract");
  } else {
    fx.setMode("idle");
  }
}

// HTML5 fallback (when native drag-drop is off)
window.addEventListener("dragover", (e) => { e.preventDefault(); if (!document.body.classList.contains("dragging")) setDragging(true); });
window.addEventListener("dragleave", (e) => { if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= innerWidth || e.clientY >= innerHeight) setDragging(false); });
window.addEventListener("drop", async (e) => {
  e.preventDefault();
  setDragging(false);
  const paths = Array.from(e.dataTransfer?.files || []).map((f) => f.path).filter(Boolean);
  if (paths.length) await addFiles(paths);
});

// =============================================
// Drawer (queue / settings / preset)
// =============================================
const panels = {
  theme: $("overlay-theme"),
  queue: $("overlay-queue"),
  settings: $("overlay-settings"),
  preset: $("overlay-add-preset"),
};
const panelButtons = {
  theme: $("btn-toggle-theme"),
  queue: $("btn-toggle-queue"),
  settings: $("btn-toggle-settings"),
};
let openPanelName = null;

function openPanel(name) {
  if (openPanelName === name) { closeDrawer(); return; }
  Object.entries(panels).forEach(([k, el]) => el.classList.toggle("on", k === name));
  Object.entries(panelButtons).forEach(([k, el]) => el.classList.toggle("active", k === name));
  // anchor the card under the button that opened it
  const anchor = panelButtons[name] || panelButtons.settings;
  const r = anchor.getBoundingClientRect();
  const right = Math.max(10, window.innerWidth - r.right - 6);
  const width = drawer.offsetWidth || 264;
  drawer.style.setProperty("--pop-right", `${right}px`);
  drawer.style.setProperty("--pop-origin", `${width - (window.innerWidth - right - (r.left + r.width / 2))}px`);
  drawer.classList.add("on");
  scrim.classList.add("on");
  openPanelName = name;

  if (name === "settings") initSystem();
  if (name === "theme") renderThemeGrid();
  if (name === "queue") renderQueue(true);
  if (name === "preset") {
    $("add-preset-error").classList.remove("on");
    $("add-preset-name").classList.remove("has-error");
    setTimeout(() => $("add-preset-name").focus(), 200);
  }
}
function closeDrawer() {
  drawer.classList.remove("on");
  scrim.classList.remove("on");
  Object.values(panelButtons).forEach((el) => el.classList.remove("active"));
  openPanelName = null;
}
panelButtons.theme.addEventListener("click", () => openPanel("theme"));
panelButtons.queue.addEventListener("click", () => openPanel("queue"));
panelButtons.settings.addEventListener("click", () => openPanel("settings"));
scrim.addEventListener("click", closeDrawer);
document.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeDrawer));
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

// =============================================
// Themes
// =============================================
const THEMES = [
  { id: "void", name: "Void", bg: "#000", fg: "#fff", ac: "#4d7dff" },
  { id: "terminal", name: "Terminal", bg: "#030703", fg: "#b8ffb0", ac: "#6dff5e", font: "Consolas, monospace" },
  { id: "paper", name: "Paper", bg: "#f3efe6", fg: "#161412", ac: "#c2410c", font: "Georgia, serif" },
  { id: "brutal", name: "Brutal", bg: "#f7f2e4", fg: "#111", ac: "#ff5c39", font: "'Arial Black', sans-serif" },
  { id: "glass", name: "Aurora", bg: "linear-gradient(135deg,#5b3cc4,#0b0820 55%,#c2378f)", fg: "#fff", ac: "#7af0ff" },
  { id: "neon", name: "Neon", bg: "linear-gradient(180deg,#0d0221,#3b0f4e)", fg: "#ff2a6d", ac: "#05d9e8" },
];
let currentTheme = "void";

function renderThemeGrid() {
  const grid = $("theme-grid");
  grid.innerHTML = THEMES.map((t) => `
    <button class="theme-tile ${t.id === currentTheme ? "on" : ""}" data-theme-id="${t.id}"
      style="--t-bg:${t.bg};--t-fg:${t.fg};--t-ac:${t.ac};${t.font ? `--t-font:${t.font}` : ""}">
      <span class="tt-prev"><b>Aa</b><i></i></span>
      <span class="tt-name">${t.name}</span>
    </button>`).join("");
  grid.querySelectorAll(".theme-tile").forEach((b) => b.addEventListener("click", () => applyTheme(b.dataset.themeId, true)));
}

function applyTheme(id, animate) {
  if (!THEMES.some((t) => t.id === id)) id = "void";
  const swap = () => {
    if (id === "void") delete document.body.dataset.theme;
    else document.body.dataset.theme = id;
    currentTheme = id;
    fx.refresh();
    if (openPanelName === "theme") renderThemeGrid();
    updateIndicator(true);
    // replay the entrance so each theme's choreography shows on switch
    const v = views[currentView];
    if (v) { v.classList.remove("enter"); void v.offsetWidth; v.classList.add("enter"); }
  };
  if (animate && document.startViewTransition) document.startViewTransition(swap);
  else swap();
  try { localStorage.setItem("foshorde_theme", id); } catch {}
}

function cycleTheme(dir) {
  const i = THEMES.findIndex((t) => t.id === currentTheme);
  const next = THEMES[(i + dir + THEMES.length) % THEMES.length];
  applyTheme(next.id, true);
  showToast(next.name, "success", 1100);
}

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && (e.key === "t" || e.key === "T")) {
    e.preventDefault();
    cycleTheme(e.shiftKey ? -1 : 1);
  }
});

// =============================================
// Queue
// =============================================
function bumpBadge() {
  const n = filesQueue.length;
  queueBadge.textContent = n;
  queueBadge.classList.toggle("show", n > 0);
  queueBadge.classList.remove("bump");
  void queueBadge.offsetWidth;
  if (n > 0) queueBadge.classList.add("bump");
}

function renderQueue(animate) {
  if (!filesQueue.length) {
    queueList.innerHTML = `<p class="q-empty">Nothing queued yet.</p>`;
    $("btn-clear-queue").style.visibility = "hidden";
    return;
  }
  $("btn-clear-queue").style.visibility = isProcessing ? "hidden" : "visible";

  queueList.innerHTML = filesQueue.map((f, i) => {
    const targetMb = !selectedTarget ? 0
      : selectedTarget.mode === "percent" ? Math.max(0.1, f.size_mb * (selectedTarget.val / 100)) : selectedTarget.val;
    const exceed = selectedTarget && targetMb >= f.size_mb;
    const st = f.status === "done" && f.finalSizeMb != null ? sizeText(f.finalSizeMb)
      : f.status === "running" ? `${Math.round(f.progress)}%`
      : f.status === "cancelled" ? "Cancelled"
      : f.status === "error" ? "Failed"
      : "";
    return `
      <div class="q-item ${f.status}" style="${animate ? `--i:${i}` : "animation:none"}">
        <div class="q-top">
          <span class="q-name" data-path="${esc(f.path)}" title="Show in Explorer">${esc(f.filename)}</span>
          ${!isProcessing ? `<button class="ico-btn sm" data-rm="${i}" title="Remove">${ICONS.x.replace("<svg", '<svg width="9" height="9"')}</button>` : ""}
        </div>
        <div class="q-meta">
          <span>${sizeText(f.size_mb)}</span><span>→</span>
          <span class="${exceed ? "warn" : ""}">${selectedTarget ? (selectedTarget.mode === "percent" ? "~" : "") + sizeText(targetMb) : "—"}</span>
          <span class="st ${f.status}">${st}</span>
        </div>
        <div class="q-bar"><div id="qbar-${i}" style="width:${f.status === "done" ? 100 : f.progress}%"></div></div>
      </div>`;
  }).join("");

  queueList.querySelectorAll("[data-rm]").forEach((b) => b.addEventListener("click", () => {
    filesQueue.splice(parseInt(b.dataset.rm, 10), 1);
    bumpBadge();
    refreshUI();
  }));
  queueList.querySelectorAll(".q-name").forEach((el) => el.addEventListener("click", () => {
    tauriInvoke("show_in_folder", { filePath: el.dataset.path }).catch(() => {});
  }));
}

$("btn-clear-queue").addEventListener("click", () => {
  if (isProcessing) return;
  filesQueue = [];
  closeDrawer();
  bumpBadge();
  refreshUI();
});

// =============================================
// Settings
// =============================================
const encoderOptions = $("encoder-options");
function setEncoderUI(val) {
  encoderOptions.querySelectorAll(".radio").forEach((r) => r.classList.toggle("selected", r.dataset.value === val));
}
encoderOptions.querySelectorAll(".radio").forEach((r) => r.addEventListener("click", () => {
  encoderChoice = r.dataset.value;
  try { localStorage.setItem("foshorde_encoder", encoderChoice); } catch {}
  setEncoderUI(encoderChoice);
}));

let sysLoaded = false;
async function initSystem() {
  if (sysLoaded) return;
  try {
    const sys = await tauriInvoke("get_system_info");
    $("status-ffmpeg").textContent = sys.ffmpeg_source === "PATH" ? "System PATH" : sys.ffmpeg_source;
    $("status-gpu").textContent = sys.encoder.label;
    sysLoaded = true;
  } catch {
    $("status-ffmpeg").textContent = "bin\\";
    $("status-gpu").textContent = "CPU (libx265)";
  }
}

$("btn-update-ffmpeg").addEventListener("click", () => {
  closeDrawer();
  sysLoaded = false;
  checkFFmpegSetup(true);
});

$("btn-reset-all").addEventListener("click", () => {
  const btn = $("btn-reset-all");
  presets = JSON.parse(JSON.stringify(DEFAULT_PRESETS));
  savePresets();
  encoderChoice = "auto";
  try { localStorage.removeItem("foshorde_encoder"); localStorage.removeItem("foshorde_output_dir"); } catch {}
  setEncoderUI("auto");
  outputDir = "";
  updateOutputFolderUI("");
  customSlider.value = 25;
  paintSlider();
  customActive = false;
  selectedTarget = presetTarget(presets[0]);
  renderPresetGrid({ animate: true });
  updateSizeDisplay();
  updateStartBtn();
  btn.textContent = "Done — reset";
  setTimeout(() => (btn.textContent = "Reset everything"), 1600);
});

// =============================================
// New preset form
// =============================================
let addPresetTargetMode = "percent";
const addName = $("add-preset-name");
const addVal = $("add-preset-val");
const addErr = $("add-preset-error");
const addSeg = $("add-mode");

function setAddMode(mode) {
  addPresetTargetMode = mode;
  addSeg.classList.toggle("mb", mode === "fixed");
  $("add-mode-pct").classList.toggle("active", mode === "percent");
  $("add-mode-mb").classList.toggle("active", mode === "fixed");
  $("add-preset-unit").textContent = mode === "percent" ? "%" : "MB";
  addVal.max = mode === "percent" ? 99 : 9999;
  const v = parseInt(addVal.value, 10) || 0;
  if (mode === "percent" && v > 99) addVal.value = 99;
  if (v < 1) addVal.value = mode === "percent" ? 25 : 10;
}
$("add-mode-pct").addEventListener("click", () => setAddMode("percent"));
$("add-mode-mb").addEventListener("click", () => setAddMode("fixed"));

function stepAdd(dir) {
  const max = addPresetTargetMode === "percent" ? 99 : 9999;
  const v = parseInt(addVal.value, 10) || 10;
  addVal.value = clamp(v + dir * 5, 1, max);
}
$("btn-stepper-minus").addEventListener("click", () => stepAdd(-1));
$("btn-stepper-plus").addEventListener("click", () => stepAdd(1));
addVal.addEventListener("blur", () => {
  const max = addPresetTargetMode === "percent" ? 99 : 9999;
  addVal.value = clamp(parseInt(addVal.value, 10) || 1, 1, max);
});
addName.addEventListener("input", () => {
  addName.classList.remove("has-error");
  addErr.classList.remove("on");
});
addName.addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); $("btn-confirm-add-preset").click(); }
});

function addError(msg) {
  addErr.textContent = msg;
  addErr.classList.add("on");
  addName.classList.remove("has-error");
  void addName.offsetWidth;
  addName.classList.add("has-error");
  addName.focus();
}

$("btn-confirm-add-preset").addEventListener("click", () => {
  const name = addName.value.trim();
  if (!name) return addError("Give it a name");
  if (presets.some((p) => p.name.trim().toLowerCase() === name.toLowerCase())) return addError("That name is taken");

  let num = parseFloat(addVal.value) || (addPresetTargetMode === "percent" ? 25 : 10);
  num = addPresetTargetMode === "percent" ? clamp(Math.round(num), 1, 99) : Math.max(1, Math.round(num));
  const p = { id: Date.now(), name, mode: addPresetTargetMode, val: num, icon: getPresetIconInfo(name).key };
  presets.push(p);
  savePresets();
  customActive = false;
  selectedTarget = presetTarget(p);

  addName.value = "";
  addVal.value = addPresetTargetMode === "percent" ? 25 : 10;
  closeDrawer();
  renderPresetGrid({ newId: p.id });
  updateSizeDisplay();
  updateStartBtn();
  showToast(`Preset "${name}" added`, "success", 2000);
});

// =============================================
// UI refresh
// =============================================
function refreshUI() {
  const count = filesQueue.length;
  queueBadge.textContent = count;
  queueBadge.classList.toggle("show", count > 0);
  document.body.classList.toggle("has-files", count > 0);

  if (!isProcessing) {
    if (count === 0) {
      if (openPanelName === "queue") closeDrawer();
      setView("drop");
    } else if (currentView !== "done") {
      const entering = currentView !== "edit";
      setView("edit");
      if (entering) renderPresetGrid({ animate: true });
    }
  }

  if (count === 1) {
    const f = filesQueue[0];
    fileNameEl.textContent = f.filename;
    const bits = [`<span>${sizeText(f.size_mb)}</span>`];
    if (f.duration_secs > 0) bits.push(`<i></i><span>${fmtDuration(f.duration_secs)}</span>`);
    if (f.is_hdr) bits.push(`<span class="tag">HDR</span>`);
    else if (f.is_10bit) bits.push(`<span class="tag">10-BIT</span>`);
    fileSubEl.innerHTML = bits.join("");
  } else if (count > 1) {
    fileNameEl.textContent = `${count} videos`;
    const tot = filesQueue.reduce((s, f) => s + f.size_mb, 0);
    const dur = filesQueue.reduce((s, f) => s + (f.duration_secs || 0), 0);
    fileSubEl.innerHTML = `<span>${sizeText(tot)} total</span>${dur ? `<i></i><span>${fmtDuration(dur)}</span>` : ""}`;
  }

  if (currentView === "edit") updateIndicator();
  updateSizeDisplay();
  updateStartBtn();
  renderQueue();
}

function updateStartBtn() {
  if (!filesQueue.length) {
    btnStart.disabled = true;
    startLabel.textContent = "Drop a video";
  } else if (!selectedTarget) {
    btnStart.disabled = true;
    startLabel.textContent = "Pick a target";
  } else if (isTargetExceeding(selectedTarget, filesQueue)) {
    btnStart.disabled = true;
    startLabel.textContent = "Target too large";
  } else {
    btnStart.disabled = false;
    startLabel.innerHTML = `Compress<small>${esc(selectedTarget.label)}</small>`;
  }
}

// =============================================
// Compression
// =============================================
const run = { shown: 0, target: 0, raf: 0, total: 0, finished: 0 };

function runLoop() {
  run.shown += (run.target - run.shown) * 0.09;
  if (Math.abs(run.target - run.shown) < 0.05) run.shown = run.target;
  runRoller.set(run.shown);
  runFill.style.width = `${run.shown}%`;
  run.raf = requestAnimationFrame(runLoop);
}

function setRunProgress(filePct) {
  run.target = clamp(((run.finished + filePct / 100) / Math.max(1, run.total)) * 100, 0, 100);
}

function renderRunDots(jobs) {
  if (jobs.length < 2) { runDots.innerHTML = ""; return; }
  runDots.innerHTML = jobs.map((f) => `<span class="${f.status === "running" ? "active" : f.status}"></span>`).join("");
}

function parseSpeed(s) {
  const n = parseFloat(String(s || "").replace("x", ""));
  return isFinite(n) ? n : 0;
}

btnStart.addEventListener("click", startCompression);
$("btn-cancel").addEventListener("click", async () => {
  if (!isProcessing) return;
  isProcessing = false;
  runMeta.textContent = "Cancelling…";
  try { await tauriInvoke("cancel_compression"); } catch {}
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && currentView === "edit" && !openPanelName && !btnStart.disabled) startCompression();
});

async function startCompression() {
  if (isProcessing || !filesQueue.length || !selectedTarget) return;
  if (isTargetExceeding(selectedTarget, filesQueue)) {
    showToast("Output can't be larger than the video", "danger", 3500);
    return;
  }

  const jobs = filesQueue.filter((f) => f.status !== "done");
  if (!jobs.length) return;
  jobs.forEach((f) => { f.status = "pending"; f.progress = 0; });

  isProcessing = true;
  closeDrawer();
  run.total = jobs.length;
  run.finished = 0;
  run.shown = 0;
  run.target = 0;
  runRoller.set(0);
  runFill.style.width = "0%";
  runMeta.textContent = "Starting…";
  fx.setSpeed(1);
  setView("run");
  cancelAnimationFrame(run.raf);
  run.raf = requestAnimationFrame(runLoop);

  const target = { ...selectedTarget };

  for (const f of jobs) {
    if (!isProcessing) break;
    f.status = "running";
    f.progress = 0;
    runFile.textContent = jobs.length > 1 ? `${f.filename}  ·  ${run.finished + 1} of ${jobs.length}` : f.filename;
    runMeta.textContent = "Starting…";
    renderRunDots(jobs);
    renderQueue();

    try {
      const res = await tauriInvoke("compress_video", {
        inputPath: f.path,
        targetMode: target.mode,
        targetVal: parseFloat(target.val),
        encoder: encoderChoice,
        outputDir,
      });
      f.outputPath = res.output_path;
      f.finalSizeMb = res.output_size_mb;
      if (res.output_size_mb >= f.size_mb) {
        f.status = "error";
        showToast("Result came out larger than the original", "danger", 4000);
      } else {
        f.status = "done";
        f.progress = 100;
      }
    } catch (err) {
      f.status = isProcessing ? "error" : "cancelled";
      if (isProcessing) showToast(typeof err === "string" ? err : "Compression failed", "danger", 3500);
    }
    if (f.status === "cancelled") break;
    run.finished++;
    setRunProgress(0);
    renderRunDots(jobs);
    renderQueue();
  }

  const wasCancelled = !isProcessing;
  isProcessing = false;
  jobs.forEach((f) => { if (f.status === "running" || (wasCancelled && f.status === "pending")) f.status = "pending"; });

  const doneJobs = jobs.filter((f) => f.status === "done");
  if (wasCancelled || !doneJobs.length) {
    cancelAnimationFrame(run.raf);
    if (wasCancelled) showToast("Cancelled", "danger", 1800);
    setView(filesQueue.length ? "edit" : "drop");
    refreshUI();
    return;
  }

  run.target = 100;
  setTimeout(() => {
    cancelAnimationFrame(run.raf);
    showDone(doneJobs, jobs.length);
  }, 650);
}

function showDone(doneJobs, total) {
  const inMb = doneJobs.reduce((s, f) => s + f.size_mb, 0);
  const outMb = doneJobs.reduce((s, f) => s + f.finalSizeMb, 0);
  const saved = Math.round((1 - outMb / inMb) * 100);
  lastOutputs = doneJobs.map((f) => f.outputPath).filter(Boolean);

  $("done-from").textContent = sizeText(inMb);
  $("done-to").textContent = sizeText(outMb);
  const savedEl = $("done-saved");
  savedEl.classList.toggle("warn", doneJobs.length < total);
  savedEl.textContent = doneJobs.length < total
    ? `${doneJobs.length} of ${total} compressed · ${saved}% smaller`
    : `${saved}% smaller${total > 1 ? ` · ${total} videos` : ""}`;
  $("btn-reveal").textContent = lastOutputs.length > 1 ? "Open folder" : "Show file";

  const big = $("done-big");
  big.innerHTML = sizeHTML(inMb);
  setView("done");
  refreshUI();

  setTimeout(() => {
    const r = document.querySelector(".done-check").getBoundingClientRect();
    fx.burst(r.left + r.width / 2, r.top + r.height / 2, 90);
  }, 700);
  setTimeout(() => tween("done", inMb, outMb, 1600, (v) => (big.innerHTML = sizeHTML(v))), 350);
}

let lastOutputs = [];
$("btn-reveal").addEventListener("click", () => {
  if (lastOutputs.length === 1) tauriInvoke("show_in_folder", { filePath: lastOutputs[0] }).catch(() => {});
  else tauriInvoke("open_folder", { folderPath: outputDir || "" }).catch(() => {});
});
$("btn-again").addEventListener("click", () => {
  filesQueue = [];
  bumpBadge();
  setView("drop");
  refreshUI();
});

// =============================================
// Tauri events
// =============================================
function setupEvents() {
  const listen = window.__TAURI__?.event?.listen;
  if (!listen) { setTimeout(setupEvents, 100); return; }

  listen("files-dropped", async (e) => {
    setDragging(false);
    const paths = Array.isArray(e.payload) ? e.payload : (e.payload?.paths || []);
    await addFiles(paths);
  });
  listen("tauri://drag-enter", () => setDragging(true));
  listen("tauri://drag-over", () => { if (!document.body.classList.contains("dragging")) setDragging(true); });
  listen("tauri://drag-leave", () => setDragging(false));
  listen("tauri://drag-drop", () => setDragging(false));

  listen("compression-progress", (e) => {
    const p = e.payload;
    const f = filesQueue.find((x) => x.path === p.path);
    if (!f) return;
    f.progress = p.progress;
    f.speed = p.speed;
    f.eta = p.eta;
    if (!isProcessing) return;

    setRunProgress(p.progress);
    const sp = parseSpeed(p.speed);
    fx.setSpeed(clamp(0.7 + Math.log2(1 + sp) * 0.45, 0.7, 2.6));
    const bits = [];
    if (p.speed) bits.push(p.speed);
    if (p.eta) bits.push(`${p.eta} left`);
    runMeta.innerHTML = bits.length ? bits.map(esc).join("<em>·</em>") : "Encoding…";

    const bar = $(`qbar-${filesQueue.indexOf(f)}`);
    if (bar) bar.style.width = `${p.progress}%`;
  });
}

// =============================================
// FFmpeg setup
// =============================================
const overlayDl = $("overlay-ffmpeg-download");
const dlFill = $("dl-fill");
const dlTrack = dlFill.parentElement;
const dlStatus = $("dl-status-text");
const dlActions = $("dl-actions");

$("btn-close-dl-modal").addEventListener("click", () => overlayDl.classList.remove("on"));
$("btn-dl-offline").addEventListener("click", () => overlayDl.classList.remove("on"));
$("btn-dl-retry").addEventListener("click", () => {
  dlActions.classList.remove("on");
  dlStatus.textContent = "Connecting…";
  dlStatus.classList.remove("err");
  dlFill.style.width = "0%";
  $("dl-pct-text").textContent = "0%";
  checkFFmpegSetup(true);
});

let isDlListening = false;
async function checkFFmpegSetup(force = false) {
  try {
    const ready = await tauriInvoke("is_ffmpeg_ready");
    if (ready && !force) return;
    overlayDl.classList.add("on");
    dlActions.classList.remove("on");
    dlStatus.classList.remove("err");
    dlTrack.classList.add("indet");

    const listen = window.__TAURI__?.event?.listen;
    if (listen && !isDlListening) {
      isDlListening = true;
      listen("ffmpeg-download-progress", (e) => {
        const p = e.payload;
        dlTrack.classList.toggle("indet", p.stage === "connecting" || p.stage === "extracting");
        if (p.percent != null) {
          dlFill.style.width = `${p.percent}%`;
          $("dl-pct-text").textContent = `${Math.round(p.percent)}%`;
        }
        if (p.message) dlStatus.textContent = p.message;
        if (p.downloaded_mb != null && p.total_mb) $("dl-mb-text").textContent = `${p.downloaded_mb.toFixed(1)} / ${p.total_mb.toFixed(1)} MB`;
        if (p.speed) $("dl-speed-text").textContent = p.speed;

        if (p.stage === "done") {
          dlTrack.classList.remove("indet");
          setTimeout(() => { overlayDl.classList.remove("on"); initSystem(); }, 1000);
        } else if (p.stage === "error") {
          dlTrack.classList.remove("indet");
          dlStatus.textContent = p.message || "Download failed. Check your connection or add bin/ffmpeg.exe.";
          dlStatus.classList.add("err");
          dlActions.classList.add("on");
        }
      });
    }
    await tauriInvoke("download_ffmpeg");
  } catch (err) {
    console.error("FFmpeg setup error:", err);
    dlTrack.classList.remove("indet");
    dlStatus.textContent = "Setup skipped or offline. Retry with a VPN, or place ffmpeg.exe in bin/.";
    dlStatus.classList.add("err");
    dlActions.classList.add("on");
  }
}

// =============================================
// Init
// =============================================
window.addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("resize", () => updateIndicator(true));

window.addEventListener("DOMContentLoaded", () => {
  let savedTheme = "void";
  try { savedTheme = localStorage.getItem("foshorde_theme") || "void"; } catch {}
  applyTheme(savedTheme, false);
  loadOutputDir();
  presets = loadPresets();
  encoderChoice = loadEncoder();
  setEncoderUI(encoderChoice);
  if (presets[0]) selectedTarget = presetTarget(presets[0]);
  paintSlider();
  renderPresetGrid();
  setupEvents();
  refreshUI();
  checkFFmpegSetup();
});
