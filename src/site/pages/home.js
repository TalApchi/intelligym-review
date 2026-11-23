// Home page. One job: get visitors to take the test. Hero with the main button, a short
// guided journey (play → results → learn → explore training), the five skills, a closing button.

import { HOME } from "../../../content/home.js";
import { SKILLS } from "../../../content/skills.js";
import { SITE } from "../../../content/site.js";
import { esc, button, finalCta } from "../ui.js";
import { loadLastResult } from "../store.js";
import { PLANS, maxPoints } from "../../config.js";

export const title = "Soccer IQ | Test how well you read the game";
export const description = "Five short soccer challenges on scanning, awareness, decisions and timing. Free, no account. Then learn how to train game intelligence.";

// The hero picture: Tal's approved image, used as supplied (original in brand/hero/), in
// optimized sizes made from it (assets/hero/). Above the fold, so it is never lazy-loaded.
const HERO_WIDTHS = [480, 720, 960, 1200, 1448];
const srcset = (ext) => HERO_WIDTHS.map((w) => `${HOME.hero.visual.base}-${w}.${ext} ${w}w`).join(", ");
const HERO_SIZES = "(min-width: 1240px) 660px, (min-width: 960px) 54vw, (max-width: 959px) and (max-height: 800px) 340px, min(720px, 100vw)";

// The information strip under the headline: real numbers about the full test that
// TEST YOURSELF opens, read from the game's own plan (config.js), so it can never drift.
function infoStrip() {
  const n = PLANS.full.challenges.length, pts = maxPoints(PLANS.full);
  const cell = (v, l) => `<span class="info-strip__cell"><span class="info-strip__v">${v}</span><span class="info-strip__l">${esc(l)}</span></span>`;
  return `<p class="info-strip">${cell(n, HOME.hero.strip.challenges)}<span class="sr-only"> / </span>${cell(pts, HOME.hero.strip.points)}</p>`;
}

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
        ${infoStrip()}
        <p class="lede">${esc(h.lede)}</p>
        <div class="cta-row">${button(h.primary)}</div>
        <p class="meta">${esc(h.meta)}${h.short ? ` <span aria-hidden="true">·</span> <a class="meta__link" href="${h.short.href}">${esc(h.short.label)}</a>` : ""}</p>
      </div>
      <div class="hero-home__stage">
        <figure class="hero-visual">
          <picture>
            <source type="image/webp" srcset="${srcset("webp")}" sizes="${HERO_SIZES}">
            <img class="hero-visual__img" src="${h.visual.src}" srcset="${srcset("jpg")}" sizes="${HERO_SIZES}"
              width="${h.visual.width}" height="${h.visual.height}" alt="${esc(h.visual.alt)}" fetchpriority="high" decoding="async">
          </picture>
          <span class="hero-scan" aria-hidden="true"><span class="hero-scan__spot"></span></span>
        </figure>
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
}

// Structured data for this page (written into <head> by the build).
export const structuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  description: SITE.description,
});
