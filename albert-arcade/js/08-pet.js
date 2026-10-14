/*! Pixel Pet: a small pixel-art companion that walks to the part of the page you point at and says a line about it.
 *  Standalone, no dependencies.
 *
 *  Usage:
 *    <script src="assets/pet/pet.js" defer></script>
 *    <section data-agent="One line.|Another line." data-agent-es="Una frase.|Otra frase.">
 *
 *  Lines are separated by "|" and one is picked at random (never the same as the last one).
 *  data-agent-<lang> is used when <html lang> matches that language; data-agent is the fallback.
 *  To change the defaults, add data-manual to the script tag and call PixelPet.init({ ... }) yourself.
 */
(() => {
  "use strict";

  const CFG = {
    scale: 3,        // screen px per sprite px (24 px sprite = 72 px on screen)
    speed: 280,      // walking speed in px/s, constant
    turn: 9,         // max heading change in rad/s: how smoothly it turns when the target moves
    hoverMs: 350,    // the cursor has to rest this long before the pet moves
    typeMs: 28,      // ms per typed letter
    leaveMs: 700,    // grace period after the cursor leaves before going back home
    idleMin: 12000,  // idle behaviour after this many ms without interaction...
    idleMax: 20000   // ...up to this many
  };

  const SIZE = 24;
  // 0 clear, 1 outline, 2 body, 3 shade, 4 light, 5 glint, 6 pink button, 7 yellow, 8 cyan
  const PAL = ["", "#0b0716", "#d958ee", "#9a2fb8", "#ffb3f5", "#ffffff", "#ff7aa8", "#ffe500", "#19a3ec"];

  // Builds one 24x24 frame as a grid of palette indices: a little game controller with eyes and legs. Pure function, no DOM.
  function frameGrid(f) {
    const g = Array.from({ length: SIZE }, () => new Array(SIZE).fill(0));
    const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < SIZE && y < SIZE) g[y][x] = c; };
    const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); };
    const oy = 0;

    // body: wide controller with two grips, raised arms when cheering
    const inShape = (x, y) => {
      const y2 = y - oy;
      if (x >= 3 && x <= 20 && y2 >= 6 && y2 <= 12) return true;
      const grip = (cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y2 - cy) / ry) ** 2 <= 1;
      if (grip(6.5, 13.5, 4.2, 5.8) || grip(16.5, 13.5, 4.2, 5.8)) return true;
      return !!f.arms && (x <= 1 || x >= 22) && y2 >= 3 && y2 <= 5;
    };
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
      if (!inShape(x, y)) continue;
      const u = (x - 11.5) / 10 + (y - oy - 10.5) / 6;
      g[y][x] = u > 0.7 ? 3 : u < -0.9 ? 4 : 2;
    }
    // outline: every empty pixel touching the shape
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
      if (g[y][x]) continue;
      let touch = false;
      for (let dy = -1; dy <= 1 && !touch; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE && g[ny][nx] >= 2 && g[ny][nx] <= 4) { touch = true; break; }
      }
      if (touch) g[y][x] = 1;
    }

    // eyes: 2x2 with a glint, or a line when blinking
    const ey = 8 + oy;
    for (const ex of [9, 13]) {
      if (f.blink || f.sit) rect(ex, ey + 1, ex + 1, ey + 1, 1);   // closed eyes when blinking or dozing
      else { rect(ex, ey, ex + 1, ey + 1, 1); set(ex, ey, 5); }
    }
    // d-pad on the left, buttons on the right
    const dy0 = 9 + oy;
    set(6, dy0 - 1, 1); set(5, dy0, 1); set(6, dy0, 1); set(7, dy0, 1); set(6, dy0 + 1, 1);
    set(17, 8 + oy, 7); set(19, 9 + oy, 8); set(17, 10 + oy, 6);
    // mouth, open when talking
    const my = 12 + oy;
    if (f.mouth === "open") rect(11, my, 12, my + 1, 1);
    else rect(11, my, 12, my, 1);

    // legs: a lifted leg moves up one pixel, which makes the walk cycle readable
    if (f.lf) rect(6, 18, 7, 20, 7); else rect(6, 19, 7, 21, 7);
    if (f.rf) rect(15, 18, 16, 20, 7); else rect(15, 19, 16, 21, 7);
    return g;
  }

  // Animation states. ms = time per frame (0 = static). bob = hop in sprite px.
  const ANIM = {
    idle:  { ms: 650, frames: [{}, {}, {}, { blink: 1 }] },
    walk:  { ms: 110, frames: [{ lf: 1 }, {}, { rf: 1 }, {}] },
    talk:  { ms: 140, frames: [{ mouth: "open" }, {}] },
    cheer: { ms: 220, frames: [{ arms: "up", mouth: "open", bob: -2 }, { arms: "up", blink: 1 }] },
    sit:   { ms: 900, frames: [{ sit: 1 }, { sit: 1, blink: 1 }] }
  };

  const UI = {
    en: { hide: "Hide pet", show: "Show pet" },
    es: { hide: "Ocultar mascota", show: "Mostrar mascota" },
    ca: { hide: "Amaga la mascota", show: "Mostra la mascota" }
  };
  const IDLE = {
    en: ["Nice view from here.", "Still here! Keep scrolling.", "I love how chunky these pixels are.", "Psst... try hovering a cartridge."],
    es: ["Buenas vistas desde aquí.", "¡Sigo aquí! Sigue bajando.", "Me encantan estos píxeles tan gordos.", "Psst... prueba a pasar el ratón por un cartucho."],
    ca: ["Bones vistes des d'aquí.", "Encara sóc aquí! Continua baixant.", "M'encanten aquests píxels tan gruixuts.", "Psst... prova de passar el ratolí per un cartutx."]
  };

  const el = (tag, cls) => { const n = document.createElement(tag); n.className = cls; return n; };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const langKey = () => { const l = (document.documentElement.lang || "en").slice(0, 2).toLowerCase(); return UI[l] ? l : "en"; };

  const CSS = `
.px-pet{position:fixed;left:0;top:0;width:72px;height:72px;pointer-events:none;z-index:25;will-change:transform}
.px-pet[hidden]{display:none!important}
.px-pet-body{position:absolute;left:0;top:0;width:72px;height:72px;image-rendering:pixelated;image-rendering:crisp-edges}
.px-pet-bubble{position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);width:max-content;max-width:min(260px,70vw);
  padding:10px 14px;background:#eef0ea;color:#0b0716;border:0;border-radius:6px;box-shadow:0 2px 0 rgba(0,0,0,.35);text-align:left;
  font:600 15px/1.45 "Baloo 2","Trebuchet MS",system-ui,sans-serif;letter-spacing:0;text-transform:none}
.px-pet-bubble[hidden]{display:none}
.px-pet-bubble.is-left{left:0;transform:none}
.px-pet-bubble.is-right{left:auto;right:0;transform:none}
.px-pet-bubble.is-side-right{left:calc(100% + 12px);right:auto;bottom:auto;top:50%;transform:translateY(-50%)}
.px-pet-bubble.is-side-left{left:auto;right:calc(100% + 12px);bottom:auto;top:50%;transform:translateY(-50%)}
.px-pet-bubble::after{content:"";position:absolute;top:100%;left:50%;margin-left:-6px;border:6px solid transparent;border-top-color:#eef0ea}
.px-pet-bubble.is-left::after{left:36px}
.px-pet-bubble.is-right::after{left:auto;right:36px;margin-left:0;margin-right:-6px}
.px-pet-bubble.is-side-right::after{top:50%;left:-12px;margin:-6px 0 0 0;border-top-color:transparent;border-bottom-color:transparent;border-left-color:transparent;border-right-color:#eef0ea}
.px-pet-bubble.is-side-left::after{top:50%;left:auto;right:-12px;margin:-6px 0 0 0;border-top-color:transparent;border-bottom-color:transparent;border-right-color:transparent;border-left-color:#eef0ea}
.px-pet-toggle{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:26;padding:6px 10px;
  background:#120e28;color:#fff;border:2px solid #3b3a77;border-radius:6px;box-shadow:3px 3px 0 #000;font:600 12px/1 system-ui,sans-serif;cursor:pointer}
.px-pet-toggle:focus-visible{outline:3px solid #ffe500;outline-offset:3px}
@media (prefers-reduced-motion: reduce){ .px-pet-body{transition:none} }
`;

  let instance = null;

  function init(options) {
    if (instance) return instance;
    const cfg = Object.assign({}, CFG, options || {});
    const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touchMQ = window.matchMedia("(hover: none)");
    const reduce = () => reduceMQ.matches;
    const S = SIZE * cfg.scale;
    const pad = 12;

    // ---- DOM (CSS injected once, so the component is a single file) ----
    const style = el("style", "");
    style.textContent = CSS;
    document.head.appendChild(style);

    const root = el("div", "px-pet");
    root.setAttribute("aria-hidden", "true");
    const bubble = el("div", "px-pet-bubble");
    bubble.hidden = true;
    const text = document.createElement("span");
    bubble.appendChild(text);
    const body = el("canvas", "px-pet-body");
    body.width = body.height = SIZE;
    const ctx = body.getContext("2d");
    root.append(bubble, body);

    const toggle = el("button", "px-pet-toggle");
    toggle.type = "button";
    document.body.append(root, toggle);

    // One canvas per frame, prebuilt, so each animation step is a single drawImage
    const sheets = {};
    for (const name in ANIM) sheets[name] = ANIM[name].frames.map((f) => {
      const c = document.createElement("canvas");
      c.width = c.height = SIZE;
      const cc = c.getContext("2d");
      const g = frameGrid(f);
      for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
        if (g[y][x]) { cc.fillStyle = PAL[g[y][x]]; cc.fillRect(x, y, 1, 1); }
      }
      return c;
    });

    // ---- state ----
    let x = 0, y = 0, px = NaN, py = NaN;   // current position (viewport px, top-left of the pet)
    let tx = 0, ty = 0, arrived = true;     // walking target
    let heading = 0, facing = 1;
    let goalEl = null;                      // element the pet is currently serving
    let hoverEl = null, hoverTimer = 0, homeTimer = 0;
    let pending = null, lastLine = "";
    let speaking = false, cheering = false, sitting = false;
    let anim = { name: "idle", i: 0, t: 0 };
    let typeTimer = 0, hideTimer = 0;
    let enabled = true;
    let raf = 0, last = 0, nextIdle = 0;
    let scrollDirty = false, faceDirty = false;
    const ground = document.querySelector(".ground");   // the hero street the pet walks along
    let nextStroll = 0, speedNow = cfg.speed;
    let pointerX = null, pointerT = 0;   // last pointer position, to follow it along the street
    let bodyTransform = "";

    // Resting spot: bottom left, standing on the street when the hero street is on screen
    const home = () => {
      if (ground) {
        const gr = ground.getBoundingClientRect();
        if (gr.bottom > 0 && gr.top < innerHeight) return { x: pad, y: Math.min(gr.top - S + 6, innerHeight - S - 4) };
      }
      return { x: pad, y: innerHeight - S - pad };
    };
    const idleDelay = () => cfg.idleMin + Math.random() * (cfg.idleMax - cfg.idleMin);

    // ---- where to stand: beside the visible part of an element, or null if it's off screen ----
    function spotFor(node) {
      // sections: stand on the title, above it or beside it, so the pet rests next to the heading
      const hd = node.querySelector("h2");
      if (hd) {
        const hr = hd.getBoundingClientRect();
        if (hr.bottom > 0 && hr.top < innerHeight && hr.height > 0) {
          const minX = pad, maxX = innerWidth - S - pad, maxY = innerHeight - S - pad;
          if (hr.top - S - 6 >= pad) return { x: clamp(hr.left + hr.width / 2 - S / 2, minX, maxX), y: hr.top - S - 6 };
          if (hr.left - S - 12 >= minX) return { x: hr.left - S - 12, y: clamp(hr.top, pad, maxY) };
        }
      }
      const r = node.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return null;
      const top = Math.max(r.top, 0), bottom = Math.min(r.bottom, innerHeight);
      const left = Math.max(r.left, 0), right = Math.min(r.right, innerWidth);
      const minX = pad, maxX = innerWidth - S - pad, maxY = innerHeight - S - pad;
      const y = clamp((top + bottom) / 2 - S / 2, pad, maxY);
      let x;
      if (r.width < 200 && r.top >= S + pad + 8) {           // small element (a cartridge): stand just above it
        return { x: clamp((left + right) / 2 - S / 2, minX, maxX), y: r.top - S - 8 };
      }
      if (left - S - 12 >= minX) x = left - S - 12;          // left of the element
      else if (right + 12 <= maxX) x = right + 12;           // right of it
      else x = clamp(left + 12, minX, maxX);                 // inside it, if it fills the width
      return { x, y };
    }

    function goTo(p) {
      if (reduce()) p = home();                              // reduced motion: stay in the corner
      speedNow = cfg.speed;
      tx = p.x; ty = p.y;
      if (Math.abs(tx - x) < 1 && Math.abs(ty - y) < 1) { x = tx; y = ty; arrive(); }
      else arrived = false;
    }

    // ---- lines ----
    function linesFor(node) {
      const lang = langKey();
      const raw = node.getAttribute("data-agent-" + lang) || node.getAttribute("data-agent");
      return raw ? raw.split("|").map((s) => s.trim()).filter(Boolean) : [];
    }
    function pick(list) {
      if (!list.length) return null;
      const pool = list.length > 1 ? list.filter((s) => s !== lastLine) : list;
      lastLine = pool[Math.floor(Math.random() * pool.length)];
      return lastLine;
    }

    // ---- speech bubble (typewriter) ----
    function placeBubble() {
      const above = y - bubble.offsetHeight - 14 >= 0;          // room over the pet?
      const side = !above;
      bubble.classList.toggle("is-side-right", side && x < innerWidth / 2);
      bubble.classList.toggle("is-side-left", side && x >= innerWidth / 2);
      bubble.classList.toggle("is-left", above && x < 150);
      bubble.classList.toggle("is-right", above && x > innerWidth - 150);
    }
    function say(line) {
      clearTimeout(typeTimer); clearTimeout(hideTimer);
      speaking = true;
      bubble.hidden = false;
      placeBubble();
      let i = 0;
      const finish = () => {
        speaking = false;
        hideTimer = setTimeout(hideBubble, 2600 + line.length * 45);
      };
      const step = () => {
        text.textContent = line.slice(0, ++i);
        if (i < line.length) typeTimer = setTimeout(step, cfg.typeMs);
        else finish();
      };
      if (reduce()) { text.textContent = line; finish(); }
      else step();
    }
    function hideBubble() {
      clearTimeout(typeTimer); clearTimeout(hideTimer);
      speaking = false;
      bubble.hidden = true;
      text.textContent = "";
    }

    // ---- engaging with an element ----
    function engage(node) {
      const lines = linesFor(node);
      const spot = spotFor(node);
      if (!lines.length || !spot) return;
      clearTimeout(homeTimer);
      sitting = false; cheering = false;
      goalEl = node;
      pending = pick(lines);
      goTo(spot);                       // speaks on arrival, or right away if already there
      speedNow = cfg.speed * 1.25;      // leaving the street: a bit faster
    }
    function arrive() {
      arrived = true;
      if (pending && goalEl) { const line = pending; pending = null; say(line); }
    }
    function release() {               // cursor left the element
      hideBubble();
      pending = null;
      clearTimeout(homeTimer);
      homeTimer = setTimeout(goHome, cfg.leaveMs);
    }
    function goHome() {
      goalEl = null; pending = null;
      hideBubble();
      goTo(home());
    }
    // Keeps the pet on screen when its element scrolls away
    function refreshGoal() {
      if (goalEl) {
        const s = spotFor(goalEl);
        if (s) goTo(s);
        else goHome();
      } else {
        goTo(home());
      }
    }

    // ---- per-frame movement: constant speed, turns smoothly, eases in near the target ----
    function walk(dt) {
      const dx = tx - x, dy = ty - y, dist = Math.hypot(dx, dy);
      if (dist < 0.5) { x = tx; y = ty; if (!arrived) arrive(); return false; }
      const want = Math.atan2(dy, dx);
      const diff = Math.atan2(Math.sin(want - heading), Math.cos(want - heading));
      const maxTurn = cfg.turn * dt;
      heading += clamp(diff, -maxTurn, maxTurn);
      let v = speedNow * Math.max(0.35, Math.cos(diff));   // slows a little while it's still turning
      if (dist < 40) v = Math.max(40, dist * 4);            // eases in at the end
      const step = Math.min(dist, v * dt);
      x += Math.cos(heading) * step;
      y += Math.sin(heading) * step;
      const c = Math.cos(heading);
      if (Math.abs(c) > 0.2) { const f = c < 0 ? -1 : 1; if (f !== facing) { facing = f; faceDirty = true; } }
      return true;
    }

    function pickState(moving) {
      if (cheering) return "cheer";
      if (moving) return "walk";
      if (speaking) return "talk";
      if (goalEl && arrived) return "sit";                  // arrived at a section: stay still
      return sitting ? "sit" : "idle";
    }
    function setState(name) {
      if (anim.name === name) return;
      anim = { name, i: 0, t: last };
      draw();
    }
    function draw() {
      const f = ANIM[anim.name].frames[anim.i];
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.drawImage(sheets[anim.name][anim.i], 0, 0);
      const t = `translate3d(0,${(f.bob || 0) * cfg.scale}px,0) scaleX(${facing})`;
      if (t !== bodyTransform) { body.style.transform = t; bodyTransform = t; }
    }
    function animate(now) {
      const A = ANIM[anim.name];
      if (!A.ms || reduce()) return;
      if (now - anim.t >= A.ms) {
        anim.t = now;
        anim.i = (anim.i + 1) % A.frames.length;
        draw();
      }
    }

    // ---- idle behaviour when nobody is interacting ----
    function idleCheck(now) {
      if (!enabled || goalEl || hoverEl || !arrived || speaking || cheering || sitting) return;
      if (now < nextIdle) return;
      nextIdle = now + idleDelay();
      const r = Math.random();
      if (r < 0.35 && !reduce()) {
        sitting = true;
        setTimeout(() => { sitting = false; }, 5000);
      } else if (r < 0.6 && !reduce()) {
        facing = -facing; bodyTransform = ""; draw();
        setTimeout(() => { facing = -facing; bodyTransform = ""; draw(); }, 800);
      } else {
        const lang = langKey();
        const line = pick(IDLE[lang] || IDLE.en);
        say(line);
      }
    }
    function markActive() { nextIdle = performance.now() + idleDelay(); }

    // Stroll: while the hero street is on screen and nothing is being served, walk left and right along it
    function stroll(now) {
      if (!enabled || !ground || reduce() || goalEl || hoverEl || speaking || cheering || sitting) return;
      const gr = ground.getBoundingClientRect();
      if (gr.bottom < 0 || gr.top > innerHeight) return;            // street not on screen
      const ny = Math.min(gr.top - S + 6, innerHeight - S - 4);     // feet (sprite row 21 of 24) on the top edge of the street
      const maxX = Math.max(pad, innerWidth - S - pad);
      if (pointerX !== null && now - pointerT < 3000) {
        // follow the pointer along the street
        const nx = clamp(pointerX - S / 2, pad, maxX);
        speedNow = cfg.speed;
        if (Math.abs(nx - tx) > 2 || Math.abs(ny - ty) > 2) { tx = nx; ty = ny; arrived = false; }
        return;
      }
      if (!arrived && now < nextStroll) return;
      const nx = pad + Math.random() * Math.max(0, maxX - pad);
      const dist = Math.hypot(nx - x, ny - y);
      speedNow = cfg.speed * 0.5;
      tx = nx; ty = ny; arrived = false;
      nextStroll = now + (dist / speedNow) * 1000 + 1200 + Math.random() * 2200;
    }

    // ---- main loop: only transform and sprite-frame writes, no layout reads ----
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (scrollDirty) { scrollDirty = false; refreshGoal(); }
      stroll(now);
      const moving = !arrived && walk(dt);
      idleCheck(now);
      setState(pickState(moving));
      animate(now);
      if (faceDirty) { faceDirty = false; draw(); }
      if (x !== px || y !== py) {
        root.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        px = x; py = y;
      }
    }

    // ---- events ----
    document.addEventListener("pointerover", (e) => {
      if (!enabled || (e.pointerType && e.pointerType !== "mouse") || !e.target.closest) return;
      const node = e.target.closest("[data-agent]:not(#hero)");
      if (node === hoverEl) return;
      const prev = hoverEl;
      hoverEl = node;
      clearTimeout(hoverTimer);
      if (prev && goalEl === prev) release();
      if (node) hoverTimer = setTimeout(() => { if (hoverEl === node) engage(node); }, cfg.hoverMs);
    }, { passive: true });

    // touch: a tap on an element is the "hover"
    document.addEventListener("pointerup", (e) => {
      if (!enabled || e.pointerType !== "touch" || !e.target.closest) return;
      const node = e.target.closest("[data-agent]");
      markActive();
      if (node) engage(node);
    }, { passive: true });

    // a click on the element the pet is serving makes it celebrate
    document.addEventListener("click", (e) => {
      markActive();
      if (goalEl && arrived && e.target.closest && goalEl.contains(e.target)) {
        cheering = true;
        setTimeout(() => { cheering = false; }, 1400);
      }
    });

    document.addEventListener("pointermove", markActive, { passive: true });
    window.addEventListener("pointermove", (e) => { pointerX = e.clientX; pointerT = performance.now(); }, { passive: true });
    document.addEventListener("keydown", markActive, { passive: true });
    window.addEventListener("scroll", () => { scrollDirty = true; markActive(); }, { passive: true });
    window.addEventListener("resize", () => { scrollDirty = true; }, { passive: true });
    reduceMQ.addEventListener?.("change", () => { goTo(home()); });

    // On touch screens, a section that comes into view gets the pet's attention
    if (touchMQ.matches && "IntersectionObserver" in window) {
      let lastAuto = 0;
      const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && performance.now() - lastAuto > 2500 && enabled) {
            lastAuto = performance.now();
            engage(entry.target);
          }
        }
      }, { threshold: [0.5] });
      document.querySelectorAll("section[data-agent]").forEach((s) => io.observe(s));
    }

    // ---- enable / disable (remembered per viewer) ----
    function refreshLabel() { toggle.textContent = enabled ? UI[langKey()].hide : UI[langKey()].show; }
    function setEnabled(on) {
      enabled = on;
      root.hidden = !on;
      if (on) {
        const h = home(); x = h.x; y = h.y; px = py = NaN; tx = x; ty = y; arrived = true;   // NaN forces the first transform write
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
        clearTimeout(homeTimer); clearTimeout(hoverTimer);
        goalEl = null; hoverEl = null; hideBubble();
      }
      refreshLabel();
      try { localStorage.setItem("px-pet-off", on ? "" : "1"); } catch (e) { /* storage blocked: fine */ }
    }
    toggle.addEventListener("click", () => setEnabled(!enabled));
    new MutationObserver(refreshLabel).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    // ---- start ----
    let off = false;
    try { off = localStorage.getItem("px-pet-off") === "1"; } catch (e) { /* storage blocked: fine */ }
    const h = home();
    x = tx = h.x; y = ty = h.y; px = py = NaN;   // NaN forces the first transform write
    draw();
    nextIdle = performance.now() + idleDelay();
    last = performance.now();
    if (off) setEnabled(false);
    else { refreshLabel(); raf = requestAnimationFrame(frame); }

    instance = { enabled: () => enabled, setEnabled };
    return instance;
  }

  window.PixelPet = { init, _frameGrid: frameGrid, SIZE };

  const me = document.currentScript;
  if (!me || !me.hasAttribute("data-manual")) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init());
    else init();
  }
})();
