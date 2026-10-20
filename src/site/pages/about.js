// About page: the site name, a short intro, then short sections.

import { ABOUT } from "../../../content/about.js";
import { SITE } from "../../../content/site.js";
import { OFFERS, offerIsLive } from "../../../content/offers.js";
import { esc, html, section, reviewNote, REVIEW } from "../ui.js";

export const title = "About Soccer IQ";
export const description = "Soccer IQ is a soccer game-intelligence website: five challenges, training tips and a comparison of soccer training tools.";

export function view() {
  const c = ABOUT.contact;
  const offers = OFFERS.filter((o) => o.visible !== false && o.about && (offerIsLive(o) || REVIEW));
  return `
    <header class="page-head">
      <p class="kicker">About</p>
      <h1 class="h-page">${esc(ABOUT.title)}</h1>
      <p class="lede">${esc(ABOUT.intro)}</p>
    </header>

    ${ABOUT.sections.map((s) => section("", s.title, `<p class="prose">${esc(s.body)}</p>`)).join("")}

    ${offers.length ? section("coupons", "Coupons", offers.map((o) => `<p class="prose">${html(o.about)}</p>`).join("")) : ""}

    ${c.body || (REVIEW && c.reviewNote) ? section("contact", c.title, `${c.body ? `<p class="prose">${c.body}</p>` : ""}${reviewNote(c.reviewNote)}`) : ""}

    <p class="small credits">${esc(ABOUT.credits)}</p>`;
}

export const structuredData = () => ({
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: `About ${SITE.name}`,
  description,
});
