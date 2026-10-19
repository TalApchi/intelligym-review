// IntelliGym page: product, research, plans and prices, offers, terms, testimonials.
// All copy and commercial details come from content/intelligym.js and content/testimonials.js.

import { INTELLIGYM as IG } from "../../../content/intelligym.js";
import { TESTIMONIALS } from "../../../content/testimonials.js";
import { SITE } from "../../../content/site.js";
import { esc, ext, source, reviewNote, badge, shown, shownTestimonial, testimonialCard, section, fmtDate, REVIEW } from "../ui.js";

function research(r) {
  return `
    <article class="study">
      <h3>${esc(r.title)}</h3>
      <dl class="study__dl">
        <div><dt>What was done</dt><dd>${esc(r.what)}</dd></div>
        <div><dt>What was reported</dt><dd>${esc(r.result)}</dd></div>
        <div><dt>Limits</dt><dd>${esc(r.limits)}</dd></div>
      </dl>
      ${r.sources.map((s) => source(s)).join("")}
    </article>`;
}

function plans() {
  const groups = IG.plans.groups.map((g) => {
    const rows = g.rows.filter(shown);
    if (!rows.length) return "";
    return `
      <div class="plan-group">
        <h3>${esc(g.title)}</h3>
        <div class="table-wrap" role="region" aria-label="${esc(g.title)} prices" tabindex="0">
          <table class="prices">
            <thead><tr><th scope="col">Plan</th><th scope="col">Price</th><th scope="col">Billing</th><th scope="col">Note</th></tr></thead>
            <tbody>${rows.map((r) => `
              <tr>
                <th scope="row">${esc(r.plan)} ${badge(r.status)}</th>
                <td>${esc(r.price)}</td>
                <td>${esc(r.billing)}${r.total ? `<br><span class="small">${esc(r.total)}</span>` : ""}</td>
                <td>${esc(r.label || "")}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
        ${reviewNote(g.reviewNote)}
      </div>`;
  }).join("");
  return `
    <p class="sec__lede">${esc(IG.plans.note)}</p>
    ${groups}
    ${source(IG.plans.source, "Prices from")}
    ${REVIEW ? `<p class="small">Region: ${esc(IG.plans.region)}. Currency: ${esc(IG.plans.currency)}.</p>` : ""}`;
}

function offers() {
  // A pending offer is shown publicly as "pending" (never with a code or terms), so visitors
  // know one is planned without reading it as a promise. Offers marked "to-confirm" stay review-only.
  const visible = (o) => o.visible !== false && (o.status !== "to-confirm" || REVIEW);
  return IG.offers.filter(visible).map((o) => {
    const meta = [
      o.appliesTo && ["Applies to", o.appliesTo],
      o.eligibility && ["Who can use it", o.eligibility],
      o.region && ["Region", o.region],
      o.expires && ["Ends", o.expires],
      o.code && o.status === "verified" && ["Code", o.code],
    ].filter(Boolean);
    return `
      <article class="offer${o.status === "pending" ? " offer--pending" : ""}">
        <h3>${esc(o.title)} ${badge(o.status)}</h3>
        <p>${esc(o.text)}</p>
        ${meta.length ? `<dl class="offer__meta">${meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
        ${o.source ? source(o.source) : ""}
        ${reviewNote(o.reviewNote)}
      </article>`;
  }).join("");
}

function termsToConfirm() {
  if (!REVIEW || !IG.termsToConfirm.length) return "";
  const items = IG.termsToConfirm.map((t) => `
    <div class="ttc">
      <h4>${esc(t.topic)}</h4>
      <ul>${t.versions.map((v) => `<li><strong>${esc(v.text)}</strong><span class="small"> · ${esc(v.note)}</span>${source(v.source)}</li>`).join("")}</ul>
    </div>`).join("");
  return `
    <details class="terms-confirm">
      <summary><span class="review-note__tag">Review</span> Terms to confirm (${IG.termsToConfirm.length}) <span class="small">Official pages disagree. Not shown in the public build.</span></summary>
      ${items}
    </details>`;
}

export function render(main) {
  const quotes = TESTIMONIALS.filter(shownTestimonial);
  const buy = IG.purchaseLinks.filter(shown);

  main.innerHTML = `
    <header class="page-head">
      <p class="kicker"><a href="tools.html">Training tools</a> / Featured partner</p>
      <h1 class="display display--lg">${esc(IG.name)}</h1>
      <p class="lede">${esc(IG.summary)}</p>
      <div class="cta-row">
        ${buy.filter((l) => l.primary).map((l) => ext(l.url, l.label, "btn btn--primary")).join("")}
        <a class="btn btn--ghost" href="#plans">Plans and prices</a>
      </div>
      <p class="disclosure">${esc(SITE.disclosure.long)} <a href="about.html#relationship">More</a></p>
      ${reviewNote(SITE.disclosure.reviewNote)}
    </header>

    <nav class="subnav" aria-label="On this page">
      <a href="#product">Product</a><a href="#research">Research</a><a href="#plans">Plans</a><a href="#offers">Offers</a><a href="#terms">Terms</a>${quotes.length ? `<a href="#testimonials">Testimonials</a>` : ""}
    </nav>

    ${section("product", "What it is", `
      <dl class="facts facts--grid">${IG.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}${source(f.source)}</dd></div>`).join("")}</dl>
      <p class="small">Made by ${esc(IG.company)}. ${ext(IG.website, "Official website")}</p>`)}

    ${section("research", "The research IntelliGym cites", `
      <p class="sec__lede">This is research about IntelliGym. It does not show anything about the Soccer IQ challenges, which are separate games and not a validated assessment.</p>
      <div class="studies">${IG.research.map(research).join("")}</div>
      ${REVIEW ? IG.reviewNotes.map(reviewNote).join("") : ""}`)}

    ${section("plans", "Plans and prices", plans())}

    ${section("offers", "Offers", `<div class="offers">${offers()}</div>`)}

    ${section("terms", "Purchase terms", `
      <ul class="ticks">${IG.terms.filter(shown).map((t) => `<li>${esc(t.text)}${source(t.source)}</li>`).join("")}</ul>
      <p class="small">Other terms, such as free trials, annual-plan guarantees and renewal, are not consistent across IntelliGym's pages. Check the current terms on IntelliGym's site before you buy.</p>
      ${termsToConfirm()}
      <h3 class="sub">Where to buy</h3>
      <p class="small">Soccer IQ does not sell IntelliGym. These links go to IntelliGym's own pages.</p>
      <ul class="buy">${buy.map((l) => `<li>${ext(l.url, l.label, l.primary ? "btn btn--primary btn--sm" : "btn btn--ghost btn--sm")}${reviewNote(l.reviewNote)}</li>`).join("")}</ul>`)}

    ${quotes.length ? section("testimonials", "What coaches and players say about IntelliGym", `
      <p class="sec__lede">Published by IntelliGym about its own product. These people are talking about IntelliGym, not about Soccer IQ or our challenges.</p>
      <div class="quotes">${quotes.map(testimonialCard).join("")}</div>`) : ""}

    <section class="final-cta">
      <h2 class="display display--md">Compare it with other tools</h2>
      <p>See IntelliGym next to VR and screen-based alternatives.</p>
      <a class="btn btn--primary" href="tools.html#compare">Open the comparison</a>
    </section>`;
}
