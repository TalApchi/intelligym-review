// Home page: the guided journey (play → results → learn → explore training).

import { HOME } from "../../../content/home.js";
import { SKILLS, WHY } from "../../../content/skills.js";
import { TOOLS } from "../../../content/tools.js";
import { TESTIMONIALS } from "../../../content/testimonials.js";
import { SITE } from "../../../content/site.js";
import { esc, button, shown, shownTestimonial, testimonialCard, section } from "../ui.js";
import { loadLastResult } from "../store.js";
import * as scene from "../../scene.js";
import { buildPitch, startAmbientMotion } from "../../pitch.js";

export function render(main) {
  const h = HOME.hero;
  const last = loadLastResult();
  const steps = HOME.journey.map((s, i) => {
    let extra = "";
    if (i === 1 && last) extra = `<p class="step__mine">Your last result: <strong>${last.total}</strong> / ${last.available} points</p>`;
    return `
      <li class="step">
        <span class="step__n" aria-hidden="true">${s.n}</span>
        <div class="step__body">
          <h3 class="step__title">${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
          ${extra}
          <a class="step__link" href="${s.cta.href}">${esc(s.cta.label)} <span aria-hidden="true">→</span></a>
        </div>
      </li>`;
  }).join("");

  const tools = TOOLS.filter(shown).map((t) => `
    <a class="tool-tile${t.featured ? " is-featured" : ""}" href="${t.featured ? "intelligym.html" : `tools.html#${t.id}`}">
      ${t.featured ? `<span class="tag tag--partner">Featured partner</span>` : ""}
      <span class="tool-tile__name">${esc(t.name)}</span>
      <span class="tool-tile__format">${esc(t.formatShort)}</span>
    </a>`).join("");

  const quotes = TESTIMONIALS.filter((t) => t.featured && shownTestimonial(t));

  main.innerHTML = `
    <div class="journey">
      <aside class="journey__lead">
        <p class="kicker">${esc(h.kicker)}</p>
        <h1 class="display">${h.title.map((l, i) => `<span${i === h.title.length - 1 ? ' class="hl"' : ""}>${esc(l)}</span>`).join(" ")}</h1>
        <p class="lede">${esc(h.lede)}</p>
        <div class="cta-row">${button(h.primary)}${button(h.secondary, "ghost")}</div>
        <p class="meta">${esc(h.meta)}</p>
        <div class="stage-card stage-card--mini" aria-hidden="true"><div class="stage-card__camera"><svg class="pitch" id="pitch" xmlns="http://www.w3.org/2000/svg"></svg></div></div>
      </aside>
      <ol class="journey__steps">${steps}</ol>
    </div>

    ${section("why", WHY.title, `
      <p class="sec__lede">${esc(WHY.body)}</p>
      <ul class="skill-chips">${SKILLS.map((s) => `<li><a href="learn.html#${s.id}"><strong>${esc(s.name)}</strong><span>${esc(s.line)}</span></a></li>`).join("")}</ul>
      <div class="why-points">${WHY.points.map((p) => `<div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join("")}</div>`)}

    ${section("tools", HOME.toolsTeaser.title, `
      <p class="sec__lede">${esc(HOME.toolsTeaser.text)}</p>
      <div class="tool-tiles">${tools}</div>
      <p class="disclosure">${esc(SITE.disclosure.short)} <a href="about.html#relationship">What this means</a></p>
      ${button(HOME.toolsTeaser.cta, "ghost")}`)}

    ${quotes.length ? section("voices", HOME.testimonialsTeaser.title, `
      <p class="sec__lede">${esc(HOME.testimonialsTeaser.note)}</p>
      <div class="quotes">${quotes.map(testimonialCard).join("")}</div>
      ${button(HOME.testimonialsTeaser.cta, "ghost")}`) : ""}

    <section class="final-cta">
      <h2 class="display display--md">${esc(HOME.finalCta.title)}</h2>
      <p>${esc(HOME.finalCta.text)}</p>
      ${button(HOME.finalCta.cta)}
    </section>`;

  const svg = main.querySelector("#pitch");
  const handles = buildPitch(svg, scene);
  startAmbientMotion(handles, svg.closest(".stage-card"));
}
