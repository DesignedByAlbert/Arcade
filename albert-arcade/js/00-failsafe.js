/* Safety net: if anything goes wrong while loading, never leave the screen covered by the loader */
(function () {
  function free() {
    var b = document.getElementById("boot"); if (b) b.remove();
    document.documentElement.style.overflow = "";
  }
  setTimeout(free, 7000);
  window.addEventListener("error", function () { setTimeout(free, 300); });
})();
