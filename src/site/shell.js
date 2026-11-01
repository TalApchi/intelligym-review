// Header, navigation, footer and the review banner, shared by every page.
// Copy comes from content/site.js. The build writes this markup into each page (prerender);
// mountShell() adds it in the browser only if it is missing (local preview), then wires the menu.

import { SITE } from "../../content/site.js";
import { esc, REVIEW } from "./ui.js";
import { themeToggle, wireThemeToggles } from "./theme-toggle.js";

// Omri's logo in both supplied versions: white lettering for the dark theme, black for the
// light theme. CSS shows the one that matches (site.css, .logo--on-dark / .logo--on-light).
// (The hidden one is display: none, so assistive technology reads only the visible one.)
const logoImg = () => ["onDark", "onLight"].map((v) =>
  `<img class="logo--${v === "onDark" ? "on-dark" : "on-light"}" src="${SITE.logo[v]}" alt="${esc(SITE.logo.alt)}" width="${SITE.logo.width}" height="${SITE.logo.height}">`).join("");

// The short campaign test (short-test.html) has a focused page: logo and theme control only,
// no navigation, so its one main action stays the only call to action.
const FOCUSED = new Set(["short"]);

export function header(page) {
  if (FOCUSED.has(page)) {
    return `
    ${REVIEW ? `<div class="review-banner" role="note"><strong>Review version.</strong> ${esc(SITE.reviewBanner.replace(/^Review version\.\s*/, ""))}</div>` : ""}
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-header site-header--focused">
      <div class="site-header__inner">
        <a class="site-logo" href="index.html" aria-label="${esc(SITE.name)} home">${logoImg()}</a>
        <div class="site-header__actions">${themeToggle()}</div>
      </div>
    </header>`;
  }
  const links = SITE.nav.map((n) =>
    `<li><a class="nav__link${n.page === page ? " is-current" : ""}" href="${n.href}"${n.page === page ? ' aria-current="page"' : ""}>${esc(n.label)}</a></li>`).join("");
  const cta = SITE.cta;
  return `
    ${REVIEW ? `<div class="review-banner" role="note"><strong>Review version.</strong> ${esc(SITE.reviewBanner.replace(/^Review version\.\s*/, ""))}</div>` : ""}
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="site-header__inner">
        <a class="site-logo" href="index.html" aria-label="${esc(SITE.name)} home">${logoImg()}</a>
        <div class="site-header__actions">
          ${themeToggle()}
          <a class="btn btn--cta btn--sm header-cta" href="${cta.href}"${cta.page === page ? ' aria-current="page"' : ""}>${esc(cta.label)}</a>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
            <span class="nav-toggle__bars" aria-hidden="true"></span><span class="sr-only">Menu</span>
          </button>
        </div>
        <nav class="nav" id="site-nav" aria-label="Main">
          <ul class="nav__list">${links}</ul>
          <div class="nav__theme">${themeToggle("menu")}</div>
        </nav>
      </div>
    </header>`;
}

export function footer(page) {
  if (FOCUSED.has(page)) {
    return `
    <footer class="site-footer site-footer--focused">
      <div class="site-footer__base">
        <p>${esc(SITE.footer.note)}</p>
        <p>${esc(SITE.copyright)}</p>
      </div>
    </footer>`;
  }
  const cols = SITE.footer.columns.map((c) => `
    <div class="footer__col">
      <h2 class="footer__title">${esc(c.title)}</h2>
      <ul>${c.links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join("")}</ul>
    </div>`).join("");
  return `
    <footer class="site-footer">
      <div class="site-footer__inner">
        <div class="footer__brand">
          ${logoImg()}
          <p>${esc(SITE.description)}</p>
        </div>
        ${cols}
      </div>
      <div class="site-footer__base">
        <p>${esc(SITE.footer.note)}</p>
        <p>${esc(SITE.copyright)}</p>
      </div>
    </footer>`;
}

export function mountShell(page) {
  if (!document.querySelector(".site-header")) {
    document.body.insertAdjacentHTML("afterbegin", header(page));
    document.body.insertAdjacentHTML("beforeend", footer(page));
  }
  wireThemeToggles();
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  const set = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { set(false); toggle.focus(); }
  });
}
