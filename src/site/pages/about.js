// About page: the site name, a short intro, then short sections.

import { ABOUT } from "../../../content/about.js";
import { SITE } from "../../../content/site.js";
import { OFFERS, offerIsLive } from "../../../content/offers.js";
import { esc, section, REVIEW } from "../ui.js";
import { contactForm, mountContactForm } from "../contact.js";

export const title = "About Soccer IQ";
export const description = "Soccer IQ is a soccer game-intelligence website: five challenges, training tips and a comparison of soccer training tools.";

export function view() {
  // General coupon wording, shown while any provider offer is live (always in the review build).
  const coupons = OFFERS.some((o) => o.visible !== false && (offerIsLive(o) || REVIEW));
  // Empty while the contact form is off (SITE.contact): no section, heading or placeholder.
  const form = contactForm(SITE.contact, ABOUT.contact);
  return `
    <header class="page-head">
      <p class="kicker">About</p>
      <h1 class="h-page">${esc(ABOUT.title)}</h1>
      <p class="lede">${esc(ABOUT.intro)}</p>
    </header>

    ${ABOUT.sections.map((s) => section("", s.title, `<p class="prose">${esc(s.body)}</p>`)).join("")}

    ${coupons ? section("coupons", ABOUT.coupons.title, `<p class="prose">${esc(ABOUT.coupons.body)}</p>`) : ""}

    ${form ? section("contact", ABOUT.contact.title, form) : ""}

    <p class="small credits">${esc(ABOUT.credits)}</p>`;
}

export function mount(main) {
  mountContactForm(main, SITE.contact);
}

export const structuredData = () => ({
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: `About ${SITE.name}`,
  description,
});
