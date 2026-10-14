/*! Coin rain for the reward panel. When access is granted, pixel coins fall from the top of the screen and

 *  pile up across the bottom third. They stay until the panel closes, then fade out.

 *  Standalone, no dependencies.

 *

 *  Usage:

 *    <script src="assets/egg/coins.js" defer></script>

 *  The coins are drawn on the element matching cfg.panel (default "#egg"). They start when the element

 *  matching cfg.trigger (default "#eggBox") gets the class cfg.triggerClass (default "secret"), and stop

 *  when that class is removed. To change the defaults, add data-manual to the script tag and call

 *  PixelCoins.init({ ... }) yourself.

 */

(() => {

  "use strict";



  const DEFAULTS = {

    panel: "#egg",

    trigger: "#eggBox",

    triggerClass: "secret",

    coins: 2800,       // how many coins fall

    spawnMs: 3000,     // time over which they are dropped

    pileShare: 0.38,   // the pile never rises above this share of the screen height

    fade: 500,         // ms of the fade-out when the panel closes

    frontShare: 0.14,  // share of the coins that fall in front of the panel

    cell: 8,           // logical pixel size of the coin art

    scale: 4,          // screen px per logical pixel (a coin is 32 px)
    edgeBoost: 0.6     // extra pile height at the left and right edges, so the sides fill up more

  };



  let instance = null;



  // 8x8 gold coin with outline and shine, painted once

  function coinArt(cell) {

    const c = document.createElement("canvas");

    c.width = c.height = cell;

    const g = c.getContext("2d");

    const R = cell / 2, cx = cell / 2, cy = cell / 2;

    for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) {

      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);

      if (d > R) continue;

      let col = "#ffd84a";

      if (d > R - 1.1) col = "#7a4a00";                             // outline

      else if (x + y < cell * 0.55 && d < R * 0.6) col = "#fff7b2";   // shine

      else if (x + y > cell * 1.35) col = "#e0a800";                 // shade

      g.fillStyle = col; g.fillRect(x, y, 1, 1);

    }

    return c;

  }



  function init(options) {

    if (instance) return instance;

    const cfg = Object.assign({}, DEFAULTS, options || {});

    const panel = document.querySelector(cfg.panel);

    const trigger = document.querySelector(cfg.trigger);

    if (!panel || !trigger) return null;

    const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");



    const canvas = document.createElement("canvas");

    canvas.setAttribute("aria-hidden", "true");

    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;transition:opacity " + cfg.fade + "ms";

    panel.prepend(canvas);

    const ctx = canvas.getContext("2d");

    // a second layer above the box: some coins fall in front of the panel, for depth

    const front = document.createElement("canvas");

    front.setAttribute("aria-hidden", "true");

    front.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;transition:opacity " + cfg.fade + "ms";

    panel.appendChild(front);

    const fctx = front.getContext("2d");

    const art = coinArt(cfg.cell);

    const size = () => cfg.cell * cfg.scale;



    let W = 0, H = 0, dpr = 1, cols = 0, colTop = [], colLimit = [], coins = [], dropped = 0, raf = 0, t0 = 0, last = 0, active = false, fadeTimer = 0;



    function measure() {

      const r = panel.getBoundingClientRect();

      W = r.width; H = r.height;

      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);

      front.width = canvas.width; front.height = canvas.height;

      cols = Math.max(1, Math.ceil(W / size()));

      colTop = new Array(cols).fill(0);   // pile height per column, in px from the bottom
      // the pile may rise higher toward the left and right edges
      // random height per column, a bit more toward the edges; different every time
      colLimit = Array.from({ length: cols }, (_, i) => {
        const edge = Math.abs((i + 0.5) / cols * 2 - 1);
        return H * cfg.pileShare * (0.7 + Math.random() * 0.8) * (1 + cfg.edgeBoost * edge * Math.random());
      });

    }



    // top of a coin resting on the pile in its column, never above the pile limit

    function restY(col) {

      const pile = Math.min(colTop[col], colLimit[col]);

      return H - pile - size();

    }



    function dropCoins(now) {

      if (dropped >= cfg.coins) return;

      const due = Math.min(cfg.coins, Math.floor(((now - t0) / cfg.spawnMs) * cfg.coins));

      while (dropped < due) {

        // drop each coin where the pile is lowest (of 3 random columns), so the pile rises evenly

        let col = Math.floor(Math.random() * cols);

        for (let k = 0; k < 2; k++) { const c2 = Math.floor(Math.random() * cols); if (colTop[c2] / colLimit[c2] < colTop[col] / colLimit[col]) col = c2; }

        coins.push({ col, x: col * size() + Math.random() * 2, y: -size() - Math.random() * 40, vy: 0, landed: false, front: Math.random() < cfg.frontShare });

        dropped++;

      }

    }



    function physics(dt) {

      for (const c of coins) {

        if (c.landed) continue;

        c.vy += 1400 * dt;

        c.y += c.vy * dt;

        const floor = restY(c.col);

        if (c.y >= floor) {

          c.y = floor; c.landed = true;

          colTop[c.col] += size() * 0.45;   // the pile grows where the coin lands
          c.front = false;                  // once landed, the pile sits behind the popup

        }

      }

    }



    function render() {

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      ctx.clearRect(0, 0, W, H);

      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fctx.clearRect(0, 0, W, H);

      const s = size();

      for (const c of coins) (c.front ? fctx : ctx).drawImage(art, Math.round(c.x), Math.round(c.y), s, s);

    }



    // keeps running while coins are still falling; once the pile is complete it stops and stays on screen

    function frame(now) {

      const dt = Math.min(0.033, (now - last) / 1000); last = now;

      dropCoins(now);

      physics(dt);

      render();

      const busy = dropped < cfg.coins || coins.some((c) => !c.landed);

      raf = busy ? requestAnimationFrame(frame) : 0;

    }



    function start() {

      clearTimeout(fadeTimer);

      cancelAnimationFrame(raf);

      if (reduceMQ.matches) return;

      measure();

      coins = []; dropped = 0;

      canvas.style.opacity = "1"; front.style.opacity = "1";

      active = true;

      t0 = performance.now(); last = t0;

      raf = requestAnimationFrame(frame);

    }



    // the panel was closed: fade the pile out and clear it

    function stop() {

      if (!active) return;

      active = false;

      cancelAnimationFrame(raf); raf = 0;

      canvas.style.opacity = "0"; front.style.opacity = "0";

      fadeTimer = setTimeout(() => { ctx.clearRect(0, 0, canvas.width, canvas.height); fctx.clearRect(0, 0, front.width, front.height); coins = []; }, cfg.fade);

    }



    // access granted = the trigger box gets its class; closed = the class goes away

    let wasOn = false;

    new MutationObserver(() => {

      const on = trigger.classList.contains(cfg.triggerClass);

      if (on && !wasOn && !panel.hidden) start();

      if (!on && wasOn) stop();

      wasOn = on;

    }).observe(trigger, { attributes: true, attributeFilter: ["class"] });

    // closing the panel hides it (the trigger class may stay on the box)

    new MutationObserver(() => {

      if (panel.hidden) stop();

      else if (trigger.classList.contains(cfg.triggerClass) && !active) start();

    }).observe(panel, { attributes: true, attributeFilter: ["hidden"] });

    window.addEventListener("resize", () => { if (active) measure(); }, { passive: true });



    instance = {

      start, stop,

      destroy() { cancelAnimationFrame(raf); clearTimeout(fadeTimer); canvas.remove(); front.remove(); instance = null; }

    };

    return instance;

  }



  window.PixelCoins = { init };



  const me = document.currentScript;

  if (!me || !me.hasAttribute("data-manual")) {

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init());

    else init();

  }

})();
