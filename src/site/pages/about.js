// About page, including #relationship (how Soccer IQ relates to IntelliGym) and #contact.

import { ABOUT } from "../../../content/about.js";
import { SITE } from "../../../content/site.js";
import { esc, section, reviewNote } from "../ui.js";

export function render(main) {
  const c = ABOUT.contact;
  main.innerHTML = `
    <header class="page-head">
      <p class="kicker">About</p>
      <h1 class="display display--lg">${esc(ABOUT.title)}</h1>
      <p class="lede">${esc(ABOUT.intro)}</p>
    </header>

    ${ABOUT.sections.map((s) => section("", s.title, `<p class="prose">${esc(s.body)}</p>`)).join("")}

    ${section("relationship", "Soccer IQ and IntelliGym", `
      <p class="prose">${esc(SITE.disclosure.long)}</p>
      <p><a class="step__link" href="intelligym.html">The IntelliGym page <span aria-hidden="true">→</span></a></p>
      ${reviewNote(SITE.disclosure.reviewNote)}`)}

    ${c.body || c.reviewNote ? section("contact", c.title, `${c.body ? `<p class="prose">${c.body}</p>` : ""}${reviewNote(c.reviewNote)}`) : ""}

    <p class="small credits">${esc(ABOUT.credits)}</p>`;
}
