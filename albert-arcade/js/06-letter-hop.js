/*! Letter hop: each letter of the big hero name hops up a few pixels, in steps, when the pointer passes over it.
 *  Standalone, no dependencies.
 *
 *  Usage:
 *    <script src="assets/hero/letter-hop.js" defer></script>
 *  The name is the element matching cfg.name (default ".hero-new .name"). Its letters are wrapped in
 *  <i class="px-letter"> so each one can move on its own. The name keeps its text for screen readers.
 *  With prefers-reduced-motion nothing moves.
 */
(() => {
  "use strict";

  const DEFAULTS = {
    name: ".hero-new .name",
    lift: 6,        // px a letter rises
    duration: 160   // ms of the hop
  };

  let instance = null;

  function init(options) {
    if (instance) return instance;
    const cfg = Object.assign({}, DEFAULTS, options || {});
    const name = document.querySelector(cfg.name);
    if (!name) return null;

    name.setAttribute("aria-label", Array.from(name.querySelectorAll(".a, .g")).map((el) => el.textContent).join(" "));
    name.querySelectorAll(".a, .g").forEach((part) => {
      const text = part.textContent;
      part.textContent = "";
      for (const ch of text) {
        const i = document.createElement("i");
        i.className = "px-letter";
        i.setAttribute("aria-hidden", "true");
        i.textContent = ch;
        part.appendChild(i);
      }
    });

    const style = document.createElement("style");
    style.textContent = `
${cfg.name}{pointer-events:auto}
.px-letter{display:inline-block;font-style:normal}
.px-letter:hover{animation:pxHop ${cfg.duration}ms steps(2,end) 1}
@keyframes pxHop{0%{transform:translateY(0)}50%{transform:translateY(-${cfg.lift}px)}100%{transform:translateY(0)}}
@media (prefers-reduced-motion: reduce){.px-letter:hover{animation:none}}`;
    document.head.appendChild(style);

    instance = { destroy() { style.remove(); instance = null; } };
    return instance;
  }

  window.LetterHop = { init };

  const me = document.currentScript;
  if (!me || !me.hasAttribute("data-manual")) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init());
    else init();
  }
})();
