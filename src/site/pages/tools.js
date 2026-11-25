// Training tools page: one profile per provider (same structure for all), then the comparison
// table (#compare). Both use ORDER.tools in content/tools.js (IntelliGym first). A provider's
// yellow offer ticket (coupon or "CHECK FOR DEALS") comes from offers.js.

import { TOOLS, COMPARE, COMPARE_ROWS, TOOLS_REVIEW_NOTES, toolsFor } from "../../../content/tools.js";
import { liveOffersFor } from "../../../content/offers.js";
import { offerView, mountOffers } from "../offer.js";
import { esc, ext, reviewNote, shown, section, pageHead, finalCta, REVIEW } from "../ui.js";

export const title = "Soccer Training Tools Comparison | Soccer IQ";
export const description = "A side-by-side comparison of soccer game-intelligence training tools: what each one is, the equipment you need, price, trial and refund terms, and the evidence each provider cites.";

const PROFILE_FACTS = ["format", "soccer", "hardware", "pricing"];

// A provider's offer (content/offers.js, drawn by ../offer.js): the yellow ticket, either the
// coupon for a confirmed code or the "CHECK FOR DEALS" ticket linking to the provider's official
// site. Only live offers are drawn, in the review and public builds alike.
const offersFor = (t) => liveOffersFor(t.id);
const shortName = (t) => t.sortName || t.name;

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

// For tools that measure rather than train decisions (PlayerMaker): what it measures (fact),
// how the data can help (our explanation, labelled as such), what it can't tell you, evidence.
// Shared with the Knowledge hub so the wording is the same in both places.
export const READING_ROWS = [
  ["measures", "What it measures"],
  ["use", "How the data can help (our view)"],
  ["limits", "What it can't tell you"],
  ["evidence", "Evidence on decisions"],
];

function readingTheGame(t) {
  const r = t.readingTheGame;
  if (!r) return "";
  return `
      <section class="tool__read" aria-label="${esc(t.name)} and reading the game">
        <h4 class="tool__read-title">How it connects to reading the game</h4>
        <dl class="facts">${READING_ROWS.filter(([k]) => r[k]).map(([k, label]) => `<div><dt>${esc(label)}</dt><dd>${esc(r[k])}</dd></div>`).join("")}</dl>
      </section>`;
}

function profile(t) {
  const facts = PROFILE_FACTS.map((k) => {
    const row = COMPARE_ROWS.find((r) => r.key === k);
    return `<div><dt>${esc(row.label)}</dt><dd>${cellText(t.compare[k])}</dd></div>`;
  }).join("");
  const offers = offersFor(t).map((o) => offerView(o, shortName(t))).join("");
  return `
    <article class="tool" id="${t.id}" aria-labelledby="${t.id}-name">
      <header class="tool__head">
        <h3 class="h-sub tool__name" id="${t.id}-name">${esc(t.name)}</h3>
        ${t.identity ? `<p class="tool__identity">${esc(t.identity)}</p>` : ""}
        <p class="tool__company">${esc(t.company)}</p>
      </header>
      <p>${esc(t.summary)}</p>
      <dl class="facts">${facts}</dl>
      ${readingTheGame(t)}
      <p class="tool__more"><a href="#compare">Sessions, evidence, trial and refund terms in the comparison</a></p>
      ${offers}
      <div class="cta-row">${t.links.map((l) => ext(l.url, l.label, "btn btn--ghost btn--sm")).join("")}</div>
      ${termsToConfirm(t)}
      ${reviewNote(t.reviewNote)}
    </article>`;
}

// A cell's text, escaped, with any phrases listed in `strong` emphasised (provider-approved wording).
export function cellText(c) {
  let html = esc(c.text);
  for (const p of c.strong || []) html = html.split(esc(p)).join(`<strong>${esc(p)}</strong>`);
  return html;
}

function table(tools) {
  const head = tools.map((t) => `<th scope="col"><a href="#${t.id}">${esc(t.name)}</a></th>`).join("");
  const rows = COMPARE_ROWS.map((r) => `
    <tr>
      <th scope="row">${esc(r.label)}</th>
      ${tools.map((t) => {
        const c = t.compare[r.key] || { text: "Not published" };
        const offer = r.key === "offers" ? offersFor(t).map((o) => offerView(o, shortName(t), { compact: true })).join("") : "";
        return `<td>${cellText(c)}${offer}${reviewNote(c.reviewNote)}</td>`;
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
  const tools = toolsFor("tools", TOOLS.filter(shown));
  return `
    ${pageHead("Training tools", "Soccer Training Tools Comparison", "Tools that train, or help you review, how you play: what each one is, what you need, what it costs and what evidence it cites, from each provider's own pages.",
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

export function mount(main) {
  mountOffers(main);
}

export const structuredData = () => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Soccer Training Tools Comparison",
  itemListElement: toolsFor("tools", TOOLS.filter(shown)).map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, url: t.website })),
});
