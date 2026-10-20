// Knowledge hub: basics, the evidence each provider cites (same format for every provider),
// how to read claims, our challenges, and a reading list of the research the providers cite.

import { KNOWLEDGE as K } from "../../../content/knowledge.js";
import { TOOLS, toolsInOrder } from "../../../content/tools.js";
import { esc, ext, section, shown, pageHead, button } from "../ui.js";

export const title = "Soccer game intelligence: what it is and what the evidence says | Soccer IQ";
export const description = "What soccer game intelligence (soccer IQ) is, the research each training-tool provider cites and its limits, and how to read a training claim.";

export function view() {
  const tools = toolsInOrder(TOOLS.filter(shown));
  const evidence = tools.map((t) => `
    <article class="study">
      <h3 class="h-sub">${esc(t.name)}</h3>
      <dl class="study__dl">
        <div><dt>What the provider cites</dt><dd>${esc(t.compare.evidence.text)}</dd></div>
        <div><dt>Limits</dt><dd>${esc(t.compare.limits.text)}</dd></div>
      </dl>
      <a class="text-link" href="tools.html#${t.id}">${esc(t.name)} in the tools comparison <span aria-hidden="true">→</span></a>
    </article>`).join("");

  const reading = tools.filter((t) => t.research?.length).map((t) => `
    <li><strong>${esc(t.name)}</strong>
      <ul>${t.research.map((r) => `<li>${ext(r.url, r.label)}</li>`).join("")}</ul>
    </li>`).join("");

  return `
    ${pageHead("Knowledge hub", K.title, K.intro)}

    <nav class="subnav" aria-label="On this page">
      <a href="#basics">Basics</a><a href="#evidence">Evidence</a><a href="#claims">Reading claims</a><a href="#our-challenges">Our challenges</a><a href="#research">Research cited</a>
    </nav>

    ${section("basics", K.basics.title, `
      <p class="prose">${esc(K.basics.body)}</p>
      <a class="text-link" href="${K.basics.link.href}">${esc(K.basics.link.label)} <span aria-hidden="true">→</span></a>`)}

    ${section("evidence", "What the training tools cite as evidence", `
      <p class="sec__lede">Each provider's own evidence, as it describes it, with what we noticed about its limits. This research is about those tools, not about the Soccer IQ challenges.</p>
      <div class="studies">${evidence}</div>`)}

    ${section("claims", K.readingClaims.title, `
      <ol class="claims">${K.readingClaims.points.map((p) => `<li><h3 class="h-sub">${esc(p.title)}</h3><p>${esc(p.text)}</p></li>`).join("")}</ol>`)}

    ${section("our-challenges", K.ourChallenges.title, `
      <p class="prose">${esc(K.ourChallenges.body)}</p>
      <div class="cta-row">${button({ label: "Test yourself", href: "play.html" })}</div>`)}

    ${section("research", "Research cited by the providers", `
      <p class="sec__lede">The studies and reports each provider points to, so you can read them yourself.</p>
      <ul class="reading">${reading}</ul>`)}`;
}
