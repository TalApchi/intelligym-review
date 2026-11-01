// The Light / Dark control in the header. The theme itself is applied in <head> by
// src/theme.js (before the page paints); this only renders the button and saves the choice.

export const THEME_KEY = "siq.theme";

const SUN = `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.6" fill="currentColor"/><path d="M10 1.8v2.4M10 15.8v2.4M1.8 10h2.4M15.8 10h2.4M4.2 4.2l1.7 1.7M14.1 14.1l1.7 1.7M4.2 15.8l1.7-1.7M14.1 5.9l1.7-1.7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const MOON = `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.6 12.9A6.6 6.6 0 0 1 7.1 4.4a6.6 6.6 0 1 0 8.5 8.5Z" fill="currentColor"/></svg>`;

export const currentTheme = () => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");

// Markup: one button. Its label says what pressing it does.
export const themeToggle = (where = "bar") => `
  <button class="theme-toggle theme-toggle--${where}" type="button" data-theme-toggle>
    <span class="theme-toggle__icon theme-toggle__icon--to-light">${SUN}</span>
    <span class="theme-toggle__icon theme-toggle__icon--to-dark">${MOON}</span>
    <span class="theme-toggle__text"></span>
  </button>`;

function label(btn) {
  const next = currentTheme() === "light" ? "dark" : "light";
  btn.setAttribute("aria-label", `Switch to ${next} theme`);
  btn.title = `Switch to ${next} theme`;
  btn.querySelector(".theme-toggle__text").textContent = next === "light" ? "Light" : "Dark";
}

export function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#f4f7fa" : "#0b1018");
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* not remembered; fine */ }
  document.querySelectorAll("[data-theme-toggle]").forEach(label);
}

export function wireThemeToggles(root = document) {
  root.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    label(btn);
    btn.addEventListener("click", () => setTheme(currentTheme() === "light" ? "dark" : "light"));
  });
  // The OS setting or another tab can change the theme: keep the labels right.
  new MutationObserver(() => root.querySelectorAll("[data-theme-toggle]").forEach(label))
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
