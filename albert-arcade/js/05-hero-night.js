/*! Night details for the hero. Standalone, no dependencies.
 *  1. Pointing at the tall building in the skyline makes a "zzz" float up and fade out, as if its sleeper turned over.
 *  2. Pointing at the moon makes it flash.
 *
 *  Usage:
 *    <script src="assets/hero/night.js" defer></script>
 *  The skyline is the element matching cfg.skyline (default ".skyline"), drawn with assets/skyline.png
 *  at the element height. To change the defaults, add data-manual to the script tag and call
 *  NightDetails.init({ ... }) yourself.
 */
(() => {
  "use strict";

  // Top of the buildings in each column of skyline.png (-1 = no building in that column)
  const TOPS = [70,70,70,70,70,70,70,63,70,70,70,70,70,70,70,70,70,70,70,70,70,98,98,98,98,98,98,98,98,98,98,98,98,98,98,98,98,98,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,38,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,91,-1,-1,-1,-1,-1,-1,-1,-1,79,79,79,79,79,79,79,79,79,79,79,79,79,79,79,79,79,79,79,79,79,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,72,72,72,72,72,65,72,72,72,72,72,72,72,72,72,72,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,88,88,88,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,68,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,75,75,75,75,75,68,75,75,75,75,75,75,75,75,75,75,-1,-1,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,69,84,84,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,74,74,73,73,73,73,73,73,73,73,73,73,73,73,73,73,73,73,73,73,73,73,73,74,74,74,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,79,79,79,79,79,79,79,79,79,79,79,79,79,79,79,79,-1,72,72,72,72,72,72,65,72,72,72,72,72,72,72,72,72,72,72,72,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,89,48,48,48,48,48,41,48,48,48,48,48,48,48,48,48,48,-1,-1,-1,-1,-1,-1];
  const IMG_W = 420, IMG_H = 110;

  const DEFAULTS = {
    skyline: ".skyline",
    moon: ".moon",
    zzzMs: 2600,        // duration of the zzz animation
    chance: 0.45,       // chance that entering a building makes it mumble
    cooldown: 3500,     // ms between two zzz
    flashCooldown: 1200
  };

  let instance = null;

  function init(options) {
    if (instance) return instance;
    const cfg = Object.assign({}, DEFAULTS, options || {});
    const sky = document.querySelector(cfg.skyline);
    const moon = document.querySelector(cfg.moon);
    const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

    const style = document.createElement("style");
    style.textContent = `
.sk-person{position:absolute;z-index:6;pointer-events:none;line-height:0;transform:translate(-50%,0);animation:skRise 2.6s ease-in-out forwards}
@keyframes skRise{0%{opacity:0;transform:translate(-50%,14px)}18%{opacity:1;transform:translate(-50%,0)}78%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,14px)}}
.sk-zzz{position:absolute;z-index:7;pointer-events:none;display:flex;flex-direction:column;align-items:center;font-family:var(--f-pixel,ui-monospace,monospace);font-weight:700;font-size:10px;line-height:1;color:#fff7b2;text-shadow:2px 2px 0 #000;transform:translate(-50%,0);animation:skZzz ${cfg.zzzMs}ms ease-out forwards}
.sk-zzz b{font-weight:700;opacity:0;animation:skLetter 1.2s steps(2) infinite}
.sk-zzz b:nth-child(2){animation-delay:.25s}.sk-zzz b:nth-child(3){animation-delay:.5s}
@keyframes skLetter{0%{opacity:0}40%,100%{opacity:1}}
@keyframes skZzz{0%{opacity:0;transform:translate(-50%,6px) scale(.8)}15%{opacity:1}50%{transform:translate(calc(-50% + var(--dx,0px) * .5),-17px) scale(1)}70%{opacity:.8}100%{opacity:0;transform:translate(calc(-50% + var(--dx,0px)),-34px) scale(1.1)}}
.moon{pointer-events:auto;cursor:pointer}
.moon.flash{animation:moonFlash .9s ease-out}
@keyframes moonFlash{0%{filter:none;transform:scale(1)}30%{filter:brightness(1.2) drop-shadow(0 0 10px rgba(255,247,178,.55));transform:scale(1.03)}100%{filter:none;transform:scale(1)}}`;
    document.head.appendChild(style);

    // ---- sleeper ----
    let lastWake = -Infinity, insideBuilding = false;
    const live = new Set();

    // Building column under a screen point, or -1. Each repeated copy of the skyline image is checked.
    function columnAt(r, px, py) {
      const scale = r.height / IMG_H, tileW = IMG_W * scale;
      const posX = getComputedStyle(sky).backgroundPositionX;
      const off = posX.endsWith("%") ? (r.width - tileW) * parseFloat(posX) / 100 : parseFloat(posX) || 0;
      const originX = off - Math.ceil(off / tileW) * tileW;
      const x = px - r.left - originX, y = py - r.top;
      if (x < 0) return null;
      const k = Math.floor(x / tileW), local = x - k * tileW;
      const col = Math.floor(local / scale);
      if (col < 0 || col >= IMG_W || TOPS[col] < 0) return null;
      const top = TOPS[col] * scale;
      if (y < top || y > r.height) return null;
      return { x: originX + k * tileW + col * scale + scale / 2, top: top };
    }

    // A tiny pixel sleeper rises above the roof, the zzz floats up from it, then it sinks back down
    const PERSON=["..HHHH..",".HHHHHH.","HHSSSSHH","HSKSSKSH","HSSSSSSH","BBBBBBBB","BBBBBBBB"];
    const PAL={H:"#6b3e1e",S:"#f2c9a0",K:"#1a1230",B:"#d958ee"};
    const personSVG = "<svg viewBox=\"0 0 8 7\" width=\"16\" height=\"14\" shape-rendering=\"crispEdges\" aria-hidden=\"true\">" +
      PERSON.map((row,y)=>[...row].map((c,x)=>c==="."?"":"<rect x=\""+x+"\" y=\""+y+"\" width=\"1\" height=\"1\" fill=\""+PAL[c]+"\"/>").join("")).join("") + "</svg>";

    function zzz(hit) {
      const person = document.createElement("span");
      person.className = "sk-person";
      person.setAttribute("aria-hidden", "true");
      person.innerHTML = personSVG;
      person.style.left = hit.x + "px";
      person.style.top = hit.top + "px";
      sky.appendChild(person);
      const el = document.createElement("span");
      el.className = "sk-zzz";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = "<b>z</b><b>z</b><b>z</b>";
      el.style.left = hit.x + "px";
      el.style.top = (hit.top - 22) + "px";
      el.style.setProperty("--dx", (Math.random() * 28 - 14).toFixed(1) + "px");   // random sideways drift
      sky.appendChild(el);
      live.add(el); live.add(person);
      person.addEventListener("animationend", () => { person.remove(); live.delete(person); }, { once: true });
      el.addEventListener("animationend", () => { el.remove(); live.delete(el); }, { once: true });
    }

    // Any building can wake: entering one has a random chance to make it mumble zzz
    function checkBuilding(px, py) {
      if (!sky) return;
      const r = sky.getBoundingClientRect();
      const hit = columnAt(r, px, py);
      if (hit && !insideBuilding) {
        insideBuilding = true;
        if (Math.random() < cfg.chance && performance.now() - lastWake > cfg.cooldown) {
          lastWake = performance.now();
          if (!reduceMQ.matches) zzz(hit);
        }
      } else if (!hit) {
        insideBuilding = false;
      }
    }

    // ---- moon ----
    let flashing = false, lastFlash = 0;
    function flash() {
      if (!moon || reduceMQ.matches || flashing || performance.now() - lastFlash < cfg.flashCooldown) return;
      flashing = true; lastFlash = performance.now();
      moon.classList.add("flash");
      moon.addEventListener("animationend", () => { moon.classList.remove("flash"); flashing = false; }, { once: true });
    }
    if (moon) moon.addEventListener("pointerenter", flash);

    window.addEventListener("pointermove", (e) => checkBuilding(e.clientX, e.clientY), { passive: true });

    instance = {
      destroy() {
        live.forEach((el) => el.remove());
        style.remove();
        instance = null;
      }
    };
    return instance;
  }

  window.NightDetails = { init };

  const me = document.currentScript;
  if (!me || !me.hasAttribute("data-manual")) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init());
    else init();
  }
})();
