// Knowledge hub: basics, the evidence each tool cites, how to read claims, our challenges,
// and a sources list collected automatically from every content file.

import { KNOWLEDGE as K } from "../../../content/knowledge.js";
import { INTELLIGYM } from "../../../content/intelligym.js";
import { TOOLS } from "../../../content/tools.js";
import { TIPS, IG_ADVICE } from "../../../content/tips.js";
import { TESTIMONIALS } from "../../../content/testimonials.js";
import { FAQ } from "../../../content/faq.js";
import { esc, ext, source, section, shown, shownTestimonial, fmtDate } from "../ui.js";

// Every source shown anywhere on the site, de-duplicated by URL.
function allSources() {
  const out = new Map();
  const add = (src, label) => {
    if (!src?.url || out.has(src.url)) return;
    out.set(src.url, { url: src.url, label: src.label || label || new URL(src.url).hostname, checked: src.checked });
  };
  INTELLIGYM.facts.forEach((f) => add(f.source));
  INTELLIGYM.research.forEach((r) => r.sources.forEach((s) => add(s)));
  add(INTELLIGYM.plans.source);
  INTELLIGYM.terms.filter(shown).forEach((t) => add(t.source));
  INTELLIGYM.offers.filter(shown).forEach((o) => add(o.source));
  TOOLS.filter(shown).forEach((t) => t.sources.forEach((s) => add(s)));
  TIPS.filter((t) => t.visible !== false).forEach((t) => add(t.source));
  IG_ADVICE.items.forEach((a) => add(a.source));
  FAQ.forEach((g) => g.items.filter(shown).forEach((i) => add(i.source, "IntelliGym FAQ")));
  TESTIMONIALS.filter(shownTestimonial).forEach((t) => add(t.source, "IntelliGym testimonials"));
  return [...out.values()];
}

export function render(main) {
  const tools = TOOLS.filter(shown);
  const evidence = tools.map((t) => `
    <article class="study">
      <h3>${esc(t.name)}</h3>
      <dl class="study__dl">
        <div><dt>What the company cites</dt><dd>${esc(t.compare.evidence.text)}</dd></div>
        <div><dt>Limits</dt><dd>${esc(t.compare.limits.text)}</dd></div>
      </dl>
      ${source(t.compare.limits.source || t.compare.evidence.source)}
      <a class="step__link" href="${t.featured ? "intelligym.html#research" : `tools.html#${t.id}`}">More on ${esc(t.name)} <span aria-hidden="true">→</span></a>
    </article>`).join("");

  const sources = allSources();

  main.innerHTML = `
    <header class="page-head">
      <p class="kicker">Knowledge hub</p>
      <h1 class="display display--lg">${esc(K.title)}</h1>
      <p class="lede">${esc(K.intro)}</p>
    </header>

    <nav class="subnav" aria-label="On this page">
      <a href="#basics">Basics</a><a href="#evidence">Evidence</a><a href="#claims">Reading claims</a><a href="#our-challenges">Our challenges</a><a href="#sources">Sources</a>
    </nav>

    ${section("basics", K.basics.title, `
      <p class="prose">${esc(K.basics.body)}</p>
      <a class="step__link" href="${K.basics.link.href}">${esc(K.basics.link.label)} <span aria-hidden="true">→</span></a>`)}

    ${section("evidence", "What the training tools cite as evidence", `
      <p class="sec__lede">Each company's own evidence, as it describes it, with what we noticed about its limits. This research is about those tools, not about the Soccer IQ challenges.</p>
      <div class="studies">${evidence}</div>
      <h3 class="sub">IntelliGym in more detail</h3>
      <div class="studies">${INTELLIGYM.research.map((r) => `
        <article class="study">
          <h3>${esc(r.title)}</h3>
          <dl class="study__dl">
            <div><dt>What was done</dt><dd>${esc(r.what)}</dd></div>
            <div><dt>What was reported</dt><dd>${esc(r.result)}</dd></div>
            <div><dt>Limits</dt><dd>${esc(r.limits)}</dd></div>
          </dl>
          ${r.sources.map((s) => source(s)).join("")}
        </article>`).join("")}</div>`)}

    ${section("claims", K.readingClaims.title, `
      <ol class="claims">${K.readingClaims.points.map((p) => `<li><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join("")}</ol>`)}

    ${section("our-challenges", K.ourChallenges.title, `
      <p class="prose">${esc(K.ourChallenges.body)}</p>
      <a class="btn btn--primary" href="play.html">Play the challenges</a>`)}

    ${section("sources", "Sources", `
      <p class="sec__lede">Every outside page this site quotes or summarises, with the date we last checked it.</p>
      <ul class="source-list">${sources.map((s) => `<li>${ext(s.url, s.label)}${s.checked ? ` <span class="src__date">checked ${fmtDate(s.checked)}</span>` : ""}</li>`).join("")}</ul>`)}`;
}
