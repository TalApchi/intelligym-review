// Training tools page: one profile per provider (same structure for all, alphabetical),
// then the comparison table (#compare). A provider's coupon button comes from offers.js.

import { TOOLS, COMPARE, COMPARE_ROWS, TOOLS_REVIEW_NOTES, toolsInOrder } from "../../../content/tools.js";
import { OFFERS, offerIsLive } from "../../../content/offers.js";
import { esc, ext, reviewNote, shown, section, pageHead, finalCta, REVIEW } from "../ui.js";

export const title = "Soccer training tools compared: BlazePod, Be Your Best, IntelliGym, NeuroTracker, Rezzil | Soccer IQ";
export const description = "A side-by-side comparison of soccer game-intelligence training tools: what each one is, the equipment you need, price, trial and refund terms, and the evidence each provider cites.";

const PROFILE_FACTS = ["format", "soccer", "hardware", "pricing"];

// The coupon, drawn as a ticket. `compact` is the small version in the comparison table;
// both read the same entry in offers.js. Live (a link) once the offer has a URL; until then
// an inactive button in the review build, and nothing at all in the public build.
const TICKET_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5V14a2 2 0 0 0 0-4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 6.5v11" stroke="currentColor" stroke-width="1.6" stroke-dasharray="1.6 2.2"/><path d="m13 14.5 4-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="13.3" cy="10" r="1" fill="currentColor"/><circle cx="16.7" cy="14" r="1" fill="currentColor"/></svg>`;

export function couponButton(offer, { compact = false } = {}) {
  const live = offerIsLive(offer);
  if (!live && !REVIEW) return "";
  const details = [
    offer.discount && ["Discount", offer.discount],
    offer.code && ["Code", offer.code],
    offer.eligibility && ["Who can use it", offer.eligibility],
    offer.region && ["Region", offer.region],
    offer.expires && ["Ends", offer.expires],
  ].filter(Boolean);
  const cls = `coupon__btn${compact ? " coupon__btn--compact" : ""}`;
  const ticket = `<span class="coupon__ticket"><span class="coupon__stub">${TICKET_ICON}</span><span class="coupon__label">${esc(compact ? offer.buttonShort || offer.button : offer.button)}${compact && offer.buttonShort ? `<span class="sr-only"> (${esc(offer.button)})</span>` : ""}</span></span>`;
  const control = live
    ? `<a class="${cls}" href="${esc(offer.url)}" target="_blank" rel="noopener">${ticket}<span class="sr-only"> (opens IntelliGym's site in a new tab)</span></a>`
    : `<button class="${cls}" type="button" disabled aria-disabled="true">${ticket}</button>`;
  return `
    <div class="coupon${compact ? " coupon--compact" : ""}">
      ${control}
      ${live && !compact && details.length ? `<dl class="coupon__details">${details.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
    </div>`;
}

const offersFor = (t) => OFFERS.filter((o) => o.provider === t.id && o.visible !== false);

function termsToConfirm(t) {
  if (!REVIEW || !t.termsToConfirm?.length) return "";
  return `
    <details class="terms-confirm">
      <summary><span class="review-note__tag">Review</span> Terms to confirm (${t.termsToConfirm.length}): official pages disagree</summary>
      ${t.termsToConfirm.map((x) => `
        <div class="ttc">
          <h4>${esc(x.topic)}</h4>
          <ul>${x.versions.map((v) => `<li><strong>${esc(v.text)}</strong> <span class="small">· ${esc(v.note)} · ${ext(v.source.url, "page")}</span></li>`).join("")}</ul>
        </div>`).join("")}
    </details>`;
}

function profile(t) {
  const facts = PROFILE_FACTS.map((k) => {
    const row = COMPARE_ROWS.find((r) => r.key === k);
    return `<div><dt>${esc(row.label)}</dt><dd>${esc(t.compare[k].text)}</dd></div>`;
  }).join("");
  const offers = offersFor(t).map((o) => couponButton(o)).join("");
  return `
    <article class="tool" id="${t.id}" aria-labelledby="${t.id}-name">
      <header class="tool__head">
        <h3 class="h-sub tool__name" id="${t.id}-name">${esc(t.name)}</h3>
        ${t.identity ? `<p class="tool__identity">${esc(t.identity)}</p>` : ""}
        <p class="tool__company">${esc(t.company)}</p>
      </header>
      <p>${esc(t.summary)}</p>
      <dl class="facts">${facts}</dl>
      <p class="tool__more"><a href="#compare">Sessions, evidence, trial and refund terms in the comparison</a></p>
      ${offers}
      <div class="cta-row">${t.links.map((l) => ext(l.url, l.label, "btn btn--ghost btn--sm")).join("")}</div>
      ${termsToConfirm(t)}
      ${reviewNote(t.reviewNote)}
    </article>`;
}

function table(tools) {
  const head = tools.map((t) => `<th scope="col"><a href="#${t.id}">${esc(t.name)}</a></th>`).join("");
  const rows = COMPARE_ROWS.map((r) => `
    <tr>
      <th scope="row">${esc(r.label)}</th>
      ${tools.map((t) => {
        const c = t.compare[r.key] || { text: "Not published" };
        const coupon = r.key === "offers" ? offersFor(t).map((o) => couponButton(o, { compact: true })).join("") : "";
        return `<td>${esc(c.text)}${coupon}${reviewNote(c.reviewNote)}</td>`;
      }).join("")}
    </tr>`).join("");
  return `
    <div class="table-wrap" role="region" aria-labelledby="compare-title" tabindex="0">
      <table class="compare">
        <caption class="sr-only">${tools.length} soccer training tools compared on ${COMPARE_ROWS.length} points</caption>
        <thead><tr><td></td>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="table-hint">On a phone, swipe the table sideways to see every tool.</p>`;
}

export function view() {
  const tools = toolsInOrder(TOOLS.filter(shown));
  return `
    ${pageHead("Training tools", "Soccer training tools compared", "Tools that train reading the game away from regular practice: what each one is, what you need, what it costs and what evidence it cites, from each provider's own pages.",
      `<div class="cta-row"><a class="btn btn--ghost" href="#compare">Jump to the comparison</a></div>`)}

    ${section("profiles", "The tools", `<div class="tools">${tools.map(profile).join("")}</div>`)}

    <section class="sec" id="compare" aria-labelledby="compare-title">
      <h2 class="sec__title" id="compare-title">${esc(COMPARE.title)}</h2>
      <p class="sec__lede">${esc(COMPARE.intro)}</p>
      ${table(tools)}
      <p class="small">Evidence notes describe what each provider cites. None of it is about the Soccer IQ challenges. <a href="knowledge.html#claims">How to read a training claim</a>.</p>
    </section>

    ${REVIEW ? section("", "", TOOLS_REVIEW_NOTES.map(reviewNote).join("")) : ""}

    ${finalCta("See where you stand first", "Five free challenges in your browser. No account.", { label: "TEST YOURSELF", href: "play.html" })}`;
}

export const structuredData = () => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Soccer training tools compared",
  itemListElement: toolsInOrder(TOOLS.filter(shown)).map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: t.website })),
});
