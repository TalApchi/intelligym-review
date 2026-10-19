// Header, navigation, footer and the review banner, shared by every page.
// Copy comes from content/site.js.

import { SITE } from "../../content/site.js";
import { esc, REVIEW, reviewNote } from "./ui.js";

export function header(page) {
  const links = SITE.nav.map((n) =>
    `<li><a class="nav__link${n.page === page ? " is-current" : ""}" href="${n.href}"${n.page === page ? ' aria-current="page"' : ""}>${esc(n.label)}</a></li>`).join("");
  return `
    ${REVIEW ? `<div class="review-banner" role="note"><strong>Review version</strong> ${esc(SITE.reviewBanner)}</div>` : ""}
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="site-header__inner">
        <a class="site-logo" href="index.html" aria-label="${esc(SITE.name)} home">
          <img src="assets/brand/soccer-iq-logo-on-dark.svg" alt="${esc(SITE.name)}" width="146" height="30">
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
          <span class="nav-toggle__bars" aria-hidden="true"></span><span class="sr-only">Menu</span>
        </button>
        <nav class="nav" id="site-nav" aria-label="Main">
          <ul class="nav__list">${links}</ul>
          <a class="btn btn--primary btn--sm nav__play" href="play.html">Play</a>
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
          <img src="assets/brand/soccer-iq-logo-on-dark.svg" alt="${esc(SITE.name)}" width="146" height="30">
          <p>${esc(SITE.description)}</p>
          <p class="footer__disclosure">${esc(SITE.disclosure.short)} <a href="about.html#relationship">What this means</a></p>
        </div>
        ${cols}
      </div>
      <div class="site-footer__base">
        <p>${esc(SITE.footer.note)}</p>
        <p>${esc(SITE.copyright)}</p>
      </div>
      ${reviewNote(SITE.disclosure.reviewNote)}
    </footer>`;
}

export function mountShell(page) {
  document.body.insertAdjacentHTML("afterbegin", header(page));
  document.body.insertAdjacentHTML("beforeend", footer());
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      toggle.focus();
    }
  });
}
