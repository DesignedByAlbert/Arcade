/*! Pixel Stars: the stars of a section light up as the pointer passes near them and fade over a short trail.
 *  Standalone, no dependencies. Works on the existing star elements (<i> inside a container), so the
 *  stars keep their own twinkle animation.
 *
 *  Usage:
 *    <script src="assets/stars/stars.js" defer></script>
 *  The container is found with data-stars on the section, or the element with id "stars" inside the hero.
 *  To change the defaults, add data-manual to the script tag and call PixelStars.init({ ... }) yourself.
 */
(() => {
  "use strict";

  const DEFAULTS = {
    container: "#hero #stars",  // element holding the star <i> elements
    radius: 90,                 // px around the pointer that can light a star
    trail: 1000,                // ms for a lit star to fade out
    jitter: 0.25,               // random variation in brightness, 0 to 1
    delayChance: 0.15           // share of stars that light up a moment later
  };

  let instance = null;

  function init(options) {
    if (instance) return instance;
    const cfg = Object.assign({}, DEFAULTS, options || {});
    const container = document.querySelector(cfg.container);
    if (!container) return null;
    const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const still = () => reduceMQ.matches;

    let stars = [], cx = [], cy = [], heat = [], shown = [];
    let delayed = [];
    let running = false, raf = 0, last = 0;

    // Star centres relative to the container. Read once per resize, not per frame.
    function measure() {
      stars = Array.from(container.querySelectorAll("i"));
      cx = stars.map((s) => s.offsetLeft + s.offsetWidth / 2);
      cy = stars.map((s) => s.offsetTop + s.offsetHeight / 2);
      heat = new Array(stars.length).fill(0);
      shown = new Array(stars.length).fill(0);
      delayed = [];
      stars.forEach((s) => s.style.removeProperty("--lit"));
    }

    function light(i, v, now) {
      v *= 1 - cfg.jitter * Math.random();
      if (Math.random() < cfg.delayChance) delayed.push({ i, v, at: now + Math.random() * 250 });
      else if (v > heat[i]) heat[i] = v;
    }

    function paint(px, py, now) {
      if (still()) return;
      const box = container.getBoundingClientRect();
      const x = px - box.left, y = py - box.top;
      // only react when the pointer is over the container
      if (x < 0 || y < 0 || x > box.width || y > box.height) return;
      for (let i = 0; i < stars.length; i++) {
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

    // Writes only the --lit property, which the CSS turns into scale and glow
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
        const v = Math.round(heat[i] * 100) / 100;
        if (v !== shown[i]) {
          shown[i] = v;
          stars[i].style.setProperty("--lit", v);
        }
      }
      if (!any) {
        running = false;
        cancelAnimationFrame(raf);
      }
    }

    window.addEventListener("pointermove", (e) => paint(e.clientX, e.clientY, performance.now()), { passive: true });
    window.addEventListener("pointerdown", (e) => paint(e.clientX, e.clientY, performance.now()), { passive: true });
    window.addEventListener("resize", () => { measure(); }, { passive: true });
    reduceMQ.addEventListener?.("change", () => { measure(); });

    // Lit stars grow and glow. Specificity from the container selector beats the page star style.
    const style = document.createElement("style");
    style.textContent = `${cfg.container} i{transform:scale(calc(1 + var(--lit,0) * 1.8));box-shadow:0 0 calc(6px + var(--lit,0) * 16px) #fff7b2}`;
    document.head.appendChild(style);

    measure();
    instance = {
      isRunning: () => running,
      destroy() {
        cancelAnimationFrame(raf);
        running = false;
        style.remove();
        instance = null;
      }
    };
    return instance;
  }

  window.PixelStars = { init };

  const me = document.currentScript;
  if (!me || !me.hasAttribute("data-manual")) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init());
    else init();
  }
})();
