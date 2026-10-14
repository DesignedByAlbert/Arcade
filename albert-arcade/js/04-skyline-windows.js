/*! Skyline windows: the lit windows of the city skyline light up as the pointer passes over them and fade out.
 *  Standalone, no dependencies. The window positions were read once from assets/skyline.png and are stored below,
 *  so the script does not decode the image (browsers block pixel reads on file:// pages).
 *
 *  Usage:
 *    <script src="assets/skyline/windows.js" defer></script>
 *  The element is the one matching cfg.target (default ".skyline"). Its background must be assets/skyline.png
 *  drawn at the element height and repeated horizontally.
 *  To change the defaults, add data-manual to the script tag and call SkylineWindows.init({ ... }) yourself.
 */
(() => {
  "use strict";

  // [x, y, w, h] in skyline.png pixels, one entry per lit window
  const IMG_W = 420, IMG_H = 110;
  const WINDOWS = [[47,43,4,1],[53,43,4,1],[41,48,4,1],[47,48,4,1],[53,48,4,1],[401,53,4,1],[333,55,4,1],[47,58,4,1],[53,58,4,1],[333,60,4,1],[53,63,4,1],[401,63,4,1],[47,68,4,1],[53,68,4,1],[327,70,4,1],[41,73,4,1],[47,73,4,1],[53,73,4,1],[304,73,2,1],[401,73,4,1],[407,73,4,1],[155,74,4,1],[161,74,4,1],[245,74,4,1],[257,74,4,1],[263,74,4,1],[125,77,4,1],[47,78,4,1],[196,78,4,1],[407,78,4,1],[161,79,4,1],[167,79,4,1],[251,79,4,1],[292,79,4,1],[298,79,4,1],[3,80,4,1],[9,80,4,1],[227,80,4,1],[333,80,4,1],[125,82,4,1],[41,83,4,1],[196,83,4,1],[202,83,4,1],[88,84,4,1],[167,84,4,1],[263,84,4,1],[286,84,4,1],[298,84,4,1],[346,84,4,1],[227,85,4,1],[327,85,4,1],[333,85,4,1],[53,88,4,1],[401,88,4,1],[94,89,4,1],[245,89,4,1],[263,89,4,1],[298,89,4,1],[340,89,4,1],[346,89,4,1],[352,89,4,1],[333,90,4,1],[364,92,4,1],[370,92,4,1],[47,93,4,1],[53,93,3,1],[196,93,4,1],[407,93,4,1],[88,94,4,1],[94,94,4,1],[120,94,4,1],[286,94,4,1],[292,94,4,1],[298,94,4,1],[346,94,4,1],[352,94,4,1],[384,94,4,1],[9,95,4,1],[327,95,4,1],[41,98,4,1],[166,98,4,1],[202,98,4,1],[407,98,4,1],[94,99,4,1],[120,99,4,1],[245,99,4,1],[346,99,4,1],[59,101,4,1],[41,103,4,1],[53,103,3,1],[160,103,4,1],[202,103,4,1],[407,103,4,1]];

  const DEFAULTS = {
    target: ".skyline",   // element drawn with the skyline background
    radius: 90,           // px around the pointer that can light a window
    trail: 1000,          // ms for a lit window to fade out
    color: "255,229,0",   // rgb of a lit window
    jitter: 0.25,         // random variation in brightness, 0 to 1
    delayChance: 0.15     // share of windows that light up a moment later
  };

  let instance = null;

  function init(options) {
    if (instance) return instance;
    const cfg = Object.assign({}, DEFAULTS, options || {});
    const el = document.querySelector(cfg.target);
    if (!el) return null;
    const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const still = () => reduceMQ.matches;

    // ---- overlay canvas, covering the skyline box ----
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none";
    el.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    let dpr = 1, boxW = 0, boxH = 0, scale = 1, tileW = 1, tiles = 0, originX = 0;
    let cx = [], cy = [], heat = [];   // one entry per window per tile
    let delayed = [];
    let running = false, raf = 0, last = 0;

    // The background is drawn at the element height, so the image scale is height / IMG_H
    function measure() {
      const r = el.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      boxW = r.width; boxH = r.height;
      canvas.width = Math.round(boxW * dpr);
      canvas.height = Math.round(boxH * dpr);
      scale = boxH / IMG_H;
      tileW = IMG_W * scale;
      // Horizontal start of the repeated image, from the element's background-position-x (e.g. 50% centres it)
      const posX = getComputedStyle(el).backgroundPositionX;
      const off = posX.endsWith("%") ? (boxW - tileW) * parseFloat(posX) / 100 : parseFloat(posX) || 0;
      originX = off - Math.ceil(off / tileW) * tileW;      // leftmost tile start, at or before the left edge
      tiles = Math.ceil((boxW - originX) / tileW);
      cx = []; cy = [];
      for (let k = 0; k < tiles; k++) {
        for (const [x, y, w, h] of WINDOWS) {
          cx.push(originX + k * tileW + (x + w / 2) * scale);
          cy.push((y + h / 2) * scale);
        }
      }
      heat = new Array(cx.length).fill(0);
      delayed = [];
      draw();
    }

    function light(i, v, now) {
      v *= 1 - cfg.jitter * Math.random();
      if (Math.random() < cfg.delayChance) delayed.push({ i, v, at: now + Math.random() * 250 });
      else if (v > heat[i]) heat[i] = v;
    }

    function paint(px, py, now) {
      if (still()) return;
      const r = el.getBoundingClientRect();
      const x = px - r.left, y = py - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return;
      for (let i = 0; i < cx.length; i++) {
        const d = Math.hypot(cx[i] - x, cy[i] - y);
        if (d > cfg.radius) continue;
        light(i, 1 - d / (cfg.radius + 1), now);
      }
      start();
    }

    function start() {
      if (running || still()) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, boxW, boxH);
      for (let k = 0; k < tiles; k++) {
        for (let j = 0; j < WINDOWS.length; j++) {
          const h = heat[k * WINDOWS.length + j];
          if (h <= 0.02) continue;
          const [x, y, w, hh] = WINDOWS[j];
          const X = originX + k * tileW + x * scale, Y = y * scale;
          // soft glow around the lit window, then the window itself
          ctx.fillStyle = "rgba(" + cfg.color + "," + (h * 0.3).toFixed(3) + ")";
          ctx.fillRect(X - 2, Y - 2, w * scale + 4, hh * scale + 4);
          ctx.fillStyle = "rgba(" + cfg.color + "," + h.toFixed(3) + ")";
          ctx.fillRect(X, Y, w * scale, hh * scale);
        }
      }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (let k = delayed.length - 1; k >= 0; k--) {
        const d = delayed[k];
        if (now < d.at) continue;
        if (d.v > heat[d.i]) heat[d.i] = d.v;
        delayed[k] = delayed[delayed.length - 1];
        delayed.pop();
      }
      const f = Math.exp(-dt * 1000 / (cfg.trail / 3));   // ~1% after 3 x trail
      let any = delayed.length > 0;
      for (let i = 0; i < heat.length; i++) {
        if (heat[i] > 0) {
          heat[i] = heat[i] * f < 0.01 ? 0 : heat[i] * f;
          if (heat[i] > 0) any = true;
        }
      }
      draw();
      if (!any) {
        running = false;
        cancelAnimationFrame(raf);
      }
    }

    window.addEventListener("pointermove", (e) => paint(e.clientX, e.clientY, performance.now()), { passive: true });
    window.addEventListener("pointerdown", (e) => paint(e.clientX, e.clientY, performance.now()), { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    reduceMQ.addEventListener?.("change", measure);

    measure();
    instance = {
      isRunning: () => running,
      destroy() {
        cancelAnimationFrame(raf);
        running = false;
        canvas.remove();
        instance = null;
      }
    };
    return instance;
  }

  window.SkylineWindows = { init };

  const me = document.currentScript;
  if (!me || !me.hasAttribute("data-manual")) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init());
    else init();
  }
})();
