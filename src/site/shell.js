// Header, navigation, footer and the review banner, shared by every page.
// Copy comes from content/site.js. The build writes this markup into each page (prerender);
// mountShell() adds it in the browser only if it is missing (local preview), then wires the menu.

import { SITE } from "../../content/site.js";
import { esc, REVIEW } from "./ui.js";

const logoImg = (cls = "") =>
  `<img class="${cls}" src="${SITE.logo.onDark}" alt="${esc(SITE.logo.alt)}" width="${SITE.logo.width}" height="${SITE.logo.height}">`;

export function header(page) {
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
          <a class="btn btn--cta btn--sm header-cta" href="${cta.href}"${cta.page === page ? ' aria-current="page"' : ""}>${esc(cta.label)}</a>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
            <span class="nav-toggle__bars" aria-hidden="true"></span><span class="sr-only">Menu</span>
          </button>
        </div>
        <nav class="nav" id="site-nav" aria-label="Main">
          <ul class="nav__list">${links}</ul>
        </nav>
      </div>
    </header>`;
}

export function footer() {
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
    document.body.insertAdjacentHTML("beforeend", footer());
  }
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const set = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { set(false); toggle.focus(); }
  });
}
