// Home page. One job: get visitors to take the test. Hero with the main button, a short
// guided journey (play → results → learn → explore training), the five skills, a closing button.

import { HOME } from "../../../content/home.js";
import { SKILLS } from "../../../content/skills.js";
import { SITE } from "../../../content/site.js";
import { esc, button, finalCta } from "../ui.js";
import { loadLastResult } from "../store.js";
import * as scene from "../../scene.js";
import { buildPitch, startAmbientMotion } from "../../pitch.js";

export const title = "Soccer IQ | Test how well you read the game";
export const description = "Five short soccer challenges on scanning, awareness, decisions and timing. Free, no account. Then learn how to train game intelligence.";

export function view() {
  const h = HOME.hero;
  const steps = HOME.journey.map((s) => `
    <li class="step">
      <span class="step__n" aria-hidden="true">${esc(s.n)}</span>
      <div class="step__body">
        <h3 class="step__title"><a href="${s.cta.href}">${esc(s.title)}</a></h3>
        <p>${esc(s.text)}</p>
      </div>
    </li>`).join("");

  return `
    <section class="hero-home" aria-labelledby="home-title">
      <div class="hero-home__copy">
        <p class="kicker">${esc(h.kicker)}</p>
        <h1 class="h-hero" id="home-title">${h.title.map((l, i) => `<span${i === h.title.length - 1 ? ' class="hl"' : ""}>${esc(l)}</span>`).join(" ")}</h1>
        <p class="lede">${esc(h.lede)}</p>
        <div class="cta-row">${button(h.primary)}</div>
        <p class="meta">${esc(h.meta)}</p>
      </div>
      <div class="hero-home__stage" aria-hidden="true">
        <div class="stage-card stage-card--hero">
          <div class="stage-card__hud"><span class="hud-chip"><span class="hud-dot"></span>Live read</span><span class="hud-chip hud-chip--ghost">Your ball</span></div>
          <div class="stage-card__camera"><svg class="pitch" id="pitch" xmlns="http://www.w3.org/2000/svg"></svg></div>
          <ul class="stage-card__legend"><li><span class="key key--home"></span>Your team</li><li><span class="key key--opp"></span>Opponent</li><li><span class="key key--read"></span>The read</li></ul>
        </div>
      </div>
    </section>

    <section class="journey" aria-labelledby="journey-title">
      <h2 class="label" id="journey-title">How it works</h2>
      <ol class="journey__steps">${steps}</ol>
      <p class="step__mine" id="last-result" hidden></p>
    </section>

    <section class="sec sec--tight sec--quiet" aria-labelledby="skills-title">
      <h2 class="h-section" id="skills-title">${esc(HOME.skillsTitle)}</h2>
      <ul class="skill-chips">${SKILLS.map((s) => `<li><a href="learn.html#${s.id}"><strong>${esc(s.name)}</strong><span>${esc(s.line)}</span></a></li>`).join("")}</ul>
    </section>

    ${finalCta(HOME.finalCta.title, HOME.finalCta.text, HOME.finalCta.cta)}`;
}

export function mount(main) {
  const last = loadLastResult();
  const el = main.querySelector("#last-result");
  if (last && el) {
    el.innerHTML = `Your last result: <strong>${last.total}</strong> / ${last.available} points. <a href="results.html">See the breakdown</a>`;
    el.hidden = false;
  }
  const svg = main.querySelector("#pitch");
  if (svg && !svg.childElementCount) {
    const handles = buildPitch(svg, scene);
    startAmbientMotion(handles, svg.closest(".stage-card"));
  }
}

// Structured data for this page (written into <head> by the build).
export const structuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  description: SITE.description,
});
