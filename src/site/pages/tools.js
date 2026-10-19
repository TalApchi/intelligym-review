// Training tools page: profiles, then the comparison table (#compare).

import { TOOLS, COMPARE, COMPARE_ROWS, TOOLS_REVIEW_NOTES } from "../../../content/tools.js";
import { SITE } from "../../../content/site.js";
import { esc, ext, source, reviewNote, badge, shown, section, fmtDate, REVIEW } from "../ui.js";

const cellSource = (src) => (src?.url ? `<a class="cell__src" href="${esc(src.url)}" target="_blank" rel="noopener" title="${esc(src.label)}">source<span class="sr-only">: ${esc(src.label)} (opens in a new tab)</span></a>` : "");

function profile(t) {
  const links = t.links.map((l) => (l.href
    ? `<a class="btn btn--primary btn--sm" href="${esc(l.href)}">${esc(l.label)}</a>`
    : ext(l.url, l.label, "btn btn--ghost btn--sm"))).join("");
  const facts = ["format", "football", "hardware", "pricing"].map((k) => {
    const row = COMPARE_ROWS.find((r) => r.key === k);
    return `<div><dt>${esc(row.label)}</dt><dd>${esc(t.compare[k].text)}</dd></div>`;
  }).join("");
  return `
    <article class="tool${t.featured ? " tool--featured" : ""}" id="${t.id}">
      <header class="tool__head">
        ${t.featured ? `<p class="tool__flag">Featured partner</p>` : ""}
        <h3 class="tool__name">${esc(t.name)}</h3>
        <p class="tool__company">${esc(t.company)}</p>
      </header>
      <p>${esc(t.summary)}</p>
      <dl class="facts">${facts}</dl>
      <p class="tool__rel">${esc(t.relationship)}</p>
      <div class="cta-row">${links}</div>
      <details class="sources">
        <summary>Sources, checked ${fmtDate(t.checked)}</summary>
        <ul>${t.sources.map((src) => `<li>${ext(src.url, src.label)}</li>`).join("")}</ul>
      </details>
      ${badge(t.status)}
      ${reviewNote(t.reviewNote)}
    </article>`;
}

function table(tools) {
  const head = tools.map((t) => `<th scope="col">${t.featured ? `<a href="intelligym.html">${esc(t.name)}</a>` : esc(t.name)}</th>`).join("");
  const rows = COMPARE_ROWS.map((r) => `
    <tr>
      <th scope="row">${esc(r.label)}</th>
      ${tools.map((t) => {
        const c = t.compare[r.key] || { text: "Not published" };
        return `<td>${esc(c.text)} ${cellSource(c.source)}${reviewNote(c.reviewNote)}</td>`;
      }).join("")}
    </tr>`).join("");
  return `
    <div class="table-wrap" role="region" aria-labelledby="compare-title" tabindex="0">
      <table class="compare">
        <caption class="sr-only">Training tools compared on ${COMPARE_ROWS.length} points</caption>
        <thead><tr><td></td>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="table-hint">On a phone, swipe the table sideways to see every tool.</p>`;
}

export function render(main) {
  const tools = TOOLS.filter(shown);
  main.innerHTML = `
    <header class="page-head">
      <p class="kicker">Training tools</p>
      <h1 class="display display--lg">Tools that train game intelligence</h1>
      <p class="lede">Some tools train reading the game away from the pitch. Here is what each one is, what you need, what it costs and what evidence it cites, from the companies' own pages.</p>
      <div class="cta-row">
        <a class="btn btn--ghost" href="#compare">Jump to the comparison</a>
      </div>
      <p class="disclosure">${esc(SITE.disclosure.short)} <a href="about.html#relationship">How we work with IntelliGym</a></p>
      ${reviewNote(SITE.disclosure.reviewNote)}
    </header>

    ${section("profiles", "The tools", `<div class="tools">${tools.map(profile).join("")}</div>`)}

    <section class="sec" id="compare">
      <h2 class="sec__title" id="compare-title">${esc(COMPARE.title)}</h2>
      <p class="sec__lede">${esc(COMPARE.intro)} Checked ${fmtDate(COMPARE.checked)}.</p>
      ${table(tools)}
      <p class="small">Evidence notes describe what each company cites. None of it is about the Soccer IQ challenges. <a href="knowledge.html#claims">How to read a training claim</a></p>
    </section>

    ${REVIEW ? section("", "", TOOLS_REVIEW_NOTES.map(reviewNote).join("")) : ""}

    <section class="final-cta">
      <h2 class="display display--md">See where you stand first</h2>
      <p>Five free challenges in your browser. No account.</p>
      <a class="btn btn--primary" href="play.html">Start the challenges</a>
    </section>`;
}
