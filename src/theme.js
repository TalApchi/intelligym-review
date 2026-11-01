// Theme: runs in <head> as a plain (blocking) script before the page paints, so there is no
// flash of the wrong theme. Kept tiny and dependency-free on purpose.
// 1. An explicit choice made with the Light / Dark control (localStorage "siq.theme") wins.
// 2. Otherwise the operating-system preference (prefers-color-scheme), followed live.
// The control itself is in src/site/theme-toggle.js.
(function () {
  var KEY = "siq.theme";
  var media = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
  function stored() { try { var t = localStorage.getItem(KEY); return t === "light" || t === "dark" ? t : null; } catch (e) { return null; } }
  function apply(t) {
    document.documentElement.setAttribute("data-theme", t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#f4f7fa" : "#0b1018");
  }
  apply(stored() || (media && media.matches ? "light" : "dark"));
  if (media && media.addEventListener) media.addEventListener("change", function (e) { if (!stored()) apply(e.matches ? "light" : "dark"); });
  // Another tab changed the choice: follow it.
  window.addEventListener("storage", function (e) { if (e.key === KEY && (e.newValue === "light" || e.newValue === "dark")) apply(e.newValue); });
})();
