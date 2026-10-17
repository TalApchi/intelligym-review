// Draws each challenge-flow screen into the game container.
// Which screen to show is decided by nextScreen() in flow.js (via main.js);
// this file only turns a screen object into markup and wires its buttons.

import { CHALLENGES, SPOT, TRACK, DECIDE, SCAN, THROUGH, TIERS } from "./config.js";
import { tierFor } from "./tiers.js";
import { playSpot } from "./spot/play.js";
import { playTrack } from "./track/play.js";
import { playDecide } from "./decide/play.js";
import { SCENARIOS } from "./decide/scenarios.js";
import { usableScenarios } from "./decide/logic.js";
import { playScan, usableSituations } from "./scan/play.js";
import { playThrough } from "./through/play.js";

// challenge id -> runner. Each runner calls onDone({ points, tally, sub, rows }).
const PLAYERS = { spot: playSpot, track: playTrack, decide: playDecide, scan: playScan, through: playThrough };

const arrow = `<svg class="btn__arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function progress(plan, index) {
  const id = plan.challenges[index];
  const dots = plan.challenges
    .map((_, i) => `<span class="progress__dot${i < index ? " is-done" : i === index ? " is-now" : ""}"></span>`)
    .join("");
  return `
    <div class="progress">
      <span class="progress__dots" aria-hidden="true">${dots}</span>
      <span class="progress__label">${index + 1} of ${plan.challenges.length} <span aria-hidden="true">·</span> ${CHALLENGES[id].title}</span>
    </div>`;
}

// A looping mini demo: dots appear, vanish, come back with one moved, and that one gets tapped.
const SPOT_DEMO = `
  <svg class="demo" viewBox="0 0 120 84" aria-hidden="true">
    <rect class="demo__grass" x="0" y="0" width="120" height="84" rx="6"/>
    <path class="demo__lines" d="M6 6 H114 V78 H6 Z M38 6 V24 H82 V6 M6 78 H114"/>
    <g class="demo__players">
      <circle class="demo__opp" cx="30" cy="22" r="4.2"/>
      <circle class="demo__opp" cx="60" cy="18" r="4.2"/>
      <circle class="demo__opp" cx="86" cy="26" r="4.2"/>
      <circle class="demo__home" cx="22" cy="48" r="4.2"/>
      <circle class="demo__home" cx="50" cy="40" r="4.2"/>
      <circle class="demo__home" cx="96" cy="52" r="4.2"/>
      <g class="demo__mover"><circle class="demo__home" cx="66" cy="62" r="4.2"/><circle class="demo__tap" cx="66" cy="62" r="7.5"/></g>
    </g>
  </svg>`;

// A looping mini demo: three dots pulse red, then everyone moves and swaps places.
const TRACK_DEMO = `
  <svg class="demo demo--track" viewBox="0 0 120 84" aria-hidden="true">
    <rect class="demo__grass" x="0" y="0" width="120" height="84" rx="6"/>
    <path class="demo__lines" d="M6 6 H114 V78 H6 Z M38 6 V24 H82 V6 M6 78 H114"/>
    <g class="demo__run demo__run--1"><circle class="demo__home" cx="26" cy="30" r="4.2"/><circle class="demo__mark" cx="26" cy="30" r="7.5"/></g>
    <g class="demo__run demo__run--2"><circle class="demo__home" cx="60" cy="54" r="4.2"/></g>
    <g class="demo__run demo__run--3"><circle class="demo__home" cx="92" cy="28" r="4.2"/><circle class="demo__mark" cx="92" cy="28" r="7.5"/></g>
    <g class="demo__run demo__run--4"><circle class="demo__home" cx="40" cy="62" r="4.2"/></g>
    <g class="demo__run demo__run--5"><circle class="demo__home" cx="78" cy="66" r="4.2"/><circle class="demo__mark" cx="78" cy="66" r="7.5"/></g>
    <g class="demo__run demo__run--6"><circle class="demo__home" cx="56" cy="22" r="4.2"/></g>
  </svg>`;

// A still picture: you on the ball (red ring) with three dashed options, one of them chosen.
const DECIDE_DEMO = `
  <svg class="demo demo--decide" viewBox="0 0 120 84" aria-hidden="true">
    <rect class="demo__grass" x="0" y="0" width="120" height="84" rx="6"/>
    <path class="demo__lines" d="M6 6 H114 V78 H6 Z M38 6 V24 H82 V6 M6 78 H114"/>
    <circle class="demo__opp" cx="50" cy="28" r="4.2"/>
    <circle class="demo__opp" cx="70" cy="26" r="4.2"/>
    <circle class="demo__opp" cx="34" cy="44" r="4.2"/>
    <circle class="demo__home" cx="60" cy="18" r="4.2"/>
    <circle class="demo__home" cx="98" cy="36" r="4.2"/>
    <circle class="demo__home" cx="22" cy="30" r="4.2"/>
    <path class="demo__option" d="M56 56 L60 25"/>
    <path class="demo__option" d="M54 58 L28 34"/>
    <path class="demo__option demo__option--pick" d="M62 56 L92 39"/>
    <circle class="demo__home" cx="58" cy="60" r="4.2"/>
    <circle class="demo__mark demo__mark--still" cx="58" cy="60" r="7.5"/>
  </svg>`;

// A looping mini demo: the opponents fade away, the teammates stay, one of them gets tapped.
const SCAN_DEMO = `
  <svg class="demo demo--scan" viewBox="0 0 120 84" aria-hidden="true">
    <rect class="demo__grass" x="0" y="0" width="120" height="84" rx="6"/>
    <path class="demo__lines" d="M6 6 H114 V78 H6 Z M38 6 V24 H82 V6 M6 78 H114"/>
    <g class="demo__vanish">
      <circle class="demo__opp" cx="30" cy="26" r="4.2"/>
      <circle class="demo__opp" cx="58" cy="34" r="4.2"/>
      <circle class="demo__opp" cx="80" cy="20" r="4.2"/>
      <circle class="demo__opp" cx="42" cy="50" r="4.2"/>
    </g>
    <circle class="demo__home" cx="24" cy="36" r="4.2"/>
    <circle class="demo__home" cx="64" cy="22" r="4.2"/>
    <circle class="demo__home" cx="98" cy="40" r="4.2"/>
    <circle class="demo__home" cx="50" cy="62" r="4.2"/>
    <circle class="demo__mark demo__mark--still" cx="50" cy="62" r="7.5"/>
    <circle class="demo__tap demo__tap--scan" cx="98" cy="40" r="7.5"/>
  </svg>`;

// A looping mini demo: the runner curves in behind, then the pass goes into the space ahead.
const THROUGH_DEMO = `
  <svg class="demo demo--through" viewBox="0 0 120 84" aria-hidden="true">
    <rect class="demo__grass" x="0" y="0" width="120" height="84" rx="6"/>
    <path class="demo__lines" d="M6 6 H114 V78 H6 Z M38 6 V24 H82 V6 M6 78 H114"/>
    <circle class="demo__opp" cx="58" cy="44" r="4.2"/>
    <circle class="demo__opp" cx="76" cy="34" r="4.2"/>
    <circle class="demo__opp" cx="54" cy="22" r="4.2"/>
    <circle class="demo__home" cx="30" cy="40" r="4.2"/>
    <path class="demo__option" d="M94 46 Q 96 26 78 14"/>
    <path class="demo__option demo__option--pick demo__lead" d="M52 64 L76 16"/>
    <g class="demo__runner"><circle class="demo__home" cx="94" cy="46" r="4.2"/><circle class="demo__ring" cx="94" cy="46" r="7"/></g>
    <circle class="demo__home" cx="50" cy="66" r="4.2"/>
    <circle class="demo__mark demo__mark--still" cx="50" cy="66" r="7.5"/>
  </svg>`;

const DEMOS = { spot: SPOT_DEMO, track: TRACK_DEMO, decide: DECIDE_DEMO, scan: SCAN_DEMO, through: THROUGH_DEMO };

const FACTS = {
  spot: [`${SPOT.rounds} rounds`, `${SPOT.studyMs / 1000} s to look`, `${SPOT.answerMs / 1000} s to answer`],
  track: [`${TRACK.rounds} rounds`, `${TRACK.targets} to follow`, `${TRACK.moveMs / 1000} s of running`, "Round 2 is faster"],
  decide: [`${DECIDE.situations} situations`, "No clock", "Draft scenarios"],
  scan: [`${SCAN.lookMs.length} situations`, `${SCAN.lookMs.map((ms) => ms / 1000).join(" / ")} s to look`, "Draft situations"],
  through: ["A demonstration first", "1 practice try, unscored", `${THROUGH.rounds} scored rounds`, "The window gets tighter"],
};

// Tactical choice can only run with scenarios it is allowed to show.
// Opponents vanish likewise needs situations (drafts only in the review demo and local preview).
const playable = (id) => CHALLENGES[id].built
  && (id !== "decide" || usableScenarios(SCENARIOS, DECIDE).length > 0)
  && (id !== "scan" || usableSituations().length > 0);

function intro(screen, ctx) {
  const id = ctx.plan.challenges[screen.index];
  const c = CHALLENGES[id];

  if (!playable(id)) {
    return {
      html: `
        ${progress(ctx.plan, screen.index)}
        <section class="intro intro--pending">
          <div class="temp-card">
            <p class="temp-card__flag">Temporary screen</p>
            <h2 class="temp-card__title">${c.title}</h2>
            <p class="temp-card__body">${c.built ? "There are no approved situations to show yet, so this challenge scores nothing." : "This challenge isn't built yet, so it scores nothing."} Skip it to keep going.</p>
            <button class="btn btn--ghost" type="button" data-action="skip">Skip for now ${arrow}</button>
          </div>
        </section>`,
    };
  }

  const facts = FACTS[id] ?? [];
  return {
    html: `
      ${progress(ctx.plan, screen.index)}
      <section class="intro">
        <div class="intro__demo board-card">${DEMOS[id] ?? ""}</div>
        <div class="intro__copy">
          <p class="kicker">Challenge ${screen.index + 1}</p>
          <h2 class="intro__title">${c.title}</h2>
          <p class="intro__text">${c.instruction}</p>
          <ul class="intro__facts">${facts.map((f) => `<li>${f}</li>`).join("")}</ul>
          ${id === "decide" || id === "scan" ? `<p class="intro__draft"><span class="draft-badge">Provisional</span> The situations, rankings and explanations are drafts until Omri approves them.</p>` : ""}
          <button class="btn btn--primary" type="button" data-event="ready">Ready ${arrow}</button>
        </div>
      </section>`,
  };
}

function play(screen, ctx) {
  const id = ctx.plan.challenges[screen.index];
  return {
    html: `${progress(ctx.plan, screen.index)}<div class="play-mount"></div>`,
    mount: (root) => PLAYERS[id](root.querySelector(".play-mount"), {
      onDone: (result) => ctx.dispatch("done", result),
    }),
  };
}

function feedback(screen, ctx) {
  const id = ctx.plan.challenges[screen.index];
  const result = ctx.results[screen.index];
  const last = screen.index === ctx.plan.challenges.length - 1;
  const rows = result.rows.map((r) => `
    <li class="summary__row ${r.ok ? "is-right" : "is-miss"}">
      <span class="summary__mark" aria-hidden="true">${r.ok ? "✓" : "–"}</span>
      <span class="summary__round">${r.label}</span>
      <span class="summary__line">${r.line}</span>
      <span class="summary__time">${r.aside}</span>
    </li>`).join("");

  return {
    html: `
      ${progress(ctx.plan, screen.index)}
      <section class="summary">
        <p class="kicker">${CHALLENGES[id].title} · done</p>
        <h2 class="summary__score"><span class="summary__points">${result.points}</span><span class="summary__of">/ 100 points</span></h2>
        <p class="summary__sub">${result.sub}</p>
        <ol class="summary__rows">${rows}</ol>
        <button class="btn btn--primary" type="button" data-event="continue">${last ? "See results" : "Next challenge"} ${arrow}</button>
      </section>`,
  };
}

function results(_screen, ctx) {
  const played = ctx.plan.challenges.map((id, i) => ({ id, result: ctx.results[i] }));
  const scored = played.filter((p) => p.result && !p.result.skipped);
  const total = scored.reduce((sum, p) => sum + p.result.points, 0);
  const available = scored.length * 100;
  const tier = available ? tierFor(total / available, TIERS) : TIERS[0].name;

  const rows = played.map(({ id, result }) => {
    const title = CHALLENGES[id].title;
    if (!result || result.skipped) {
      return `<li class="results__row is-pending"><span class="results__name">${title}</span><span class="results__flag">Not played</span></li>`;
    }
    const flag = result.provisional ? ` <span class="draft-badge draft-badge--small">Provisional</span>` : "";
    return `<li class="results__row"><span class="results__name">${title}<small>${result.tally}${flag}</small></span><span class="results__pts">${result.points}<small>/100</small></span></li>`;
  }).join("");

  return {
    html: `
      <section class="results">
        <p class="kicker">Your results</p>
        <h2 class="results__tier">${tier}</h2>
        <p class="results__total"><strong>${total}</strong> challenge points out of ${available} available</p>
        <ul class="results__rows">${rows}</ul>
        <p class="results__note">Points describe how you did in these challenges, nothing more. Tier names are game settings, not a rating of ability.${provisionalNote(played)}</p>
        <div class="temp-card temp-card--inline">
          <p class="temp-card__flag">Temporary</p>
          <p class="temp-card__body">The product section goes here. Its wording needs Omri's approval first.</p>
        </div>
        <a class="btn btn--ghost" href="#">Start over</a>
      </section>`,
  };
}

// Which challenges' points are provisional (their rankings are drafts pending Omri).
function provisionalNote(played) {
  const names = played.filter((p) => p.result?.provisional).map((p) => CHALLENGES[p.id].title);
  if (!names.length) return "";
  const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];
  return ` ${list} points are provisional: their situations and rankings are drafts until Omri approves them.`;
}

const SCREENS = { intro, play, feedback, results };

/**
 * Renders `screen` into `root`. `ctx` = { plan, results, dispatch, skip }.
 * Returns a cleanup function (or null) to run before the next screen.
 */
export function renderScreen(root, screen, ctx) {
  const view = SCREENS[screen.name](screen, ctx);
  root.innerHTML = `<div class="game game--${screen.name}">${view.html}</div>`;
  root.querySelectorAll("[data-event]").forEach((b) => b.addEventListener("click", () => ctx.dispatch(b.dataset.event)));
  root.querySelector('[data-action="skip"]')?.addEventListener("click", ctx.skip);
  return view.mount ? view.mount(root) : null;
}
