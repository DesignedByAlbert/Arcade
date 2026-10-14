/* INSERT COIN: the coin jumps, then the secret room opens (habitacion.html) */
(() => {
  const b = document.getElementById("insertCoin"); if (!b) return;
  const go = () => { location.href = "habitacion.html"; };
  b.addEventListener("click", () => {
    const r = b.querySelector(".coin").getBoundingClientRect();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !Element.prototype.animate) { go(); return; }
    const c = document.createElement("i"); c.className = "coin-drop"; c.style.left = r.left + "px"; c.style.top = r.top + "px"; document.body.appendChild(c);
    c.animate([{ transform: "translateY(0) scaleX(1)" }, { transform: "translateY(-40px) scaleX(.2)" }, { transform: "translateY(-60px) scaleX(1)" }, { transform: "translateY(10px) scaleX(.2)", opacity: 0 }], { duration: 650, easing: "cubic-bezier(.3,0,.6,1)" }).onfinish = go;
  });
})();
