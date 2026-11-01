// Draws each challenge-flow screen into the game container.
// Which screen to show is decided by nextScreen() in flow.js (via main.js);
// this file only turns a screen object into markup and wires its buttons.

import { CHALLENGES, SPOT, TRACK, DECIDE, SCAN, THROUGH, TIERS, maxPoints } from "./config.js";
import { tierFor } from "./tiers.js";
import { hasSeen } from "./seen.js";
import { observation, nextSkills } from "./results-logic.js";
import { SKILLS } from "../content/skills.js";
import { playSpot } from "./spot/play.js";
import { playTrack } from "./track/play.js";
import { playDecide, MOVE_KEY } from "./decide/play.js";
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
      <span class="progress__label">${plan.id === "short" ? `Short test <span aria-hidden="true">·</span> ` : ""}${index + 1} of ${plan.challenges.length} <span aria-hidden="true">·</span> ${CHALLENGES[id].title}</span>
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

// A looping mini demo: two dots pulse red, then everyone moves and swaps places.
const TRACK_DEMO = `
  <svg class="demo demo--track" viewBox="0 0 120 84" aria-hidden="true">
    <rect class="demo__grass" x="0" y="0" width="120" height="84" rx="6"/>
    <path class="demo__lines" d="M6 6 H114 V78 H6 Z M38 6 V24 H82 V6 M6 78 H114"/>
    <g class="demo__run demo__run--1"><circle class="demo__home" cx="26" cy="30" r="4.2"/><circle class="demo__mark" cx="26" cy="30" r="7.5"/></g>
    <g class="demo__run demo__run--2"><circle class="demo__home" cx="60" cy="54" r="4.2"/></g>
    <g class="demo__run demo__run--3"><circle class="demo__home" cx="92" cy="28" r="4.2"/><circle class="demo__mark" cx="92" cy="28" r="7.5"/></g>
    <g class="demo__run demo__run--4"><circle class="demo__home" cx="40" cy="62" r="4.2"/></g>
    <g class="demo__run demo__run--5"><circle class="demo__home" cx="78" cy="66" r="4.2"/></g>
    <g class="demo__run demo__run--6"><circle class="demo__home" cx="56" cy="22" r="4.2"/></g>
  </svg>`;

// A looping two-step explanation of the arrows. Step 1: solid trails with a travelling pulse are
// movement already happening (a teammate's run, an opponent pressing). Step 2: after you pick,
// a teal dashed arrow previews your choice. The choice shown is not the runner, so the run never
// reads as the answer.
const DECIDE_DEMO = `
  <svg class="demo demo--decide" viewBox="0 0 120 84" aria-hidden="true">
    <rect class="demo__grass" x="0" y="0" width="120" height="84" rx="6"/>
    <path class="demo__lines" d="M6 6 H114 V78 H6 Z M38 6 V24 H82 V6 M6 78 H114"/>
    <g class="demo__moving">
      <line class="demo__trail demo__trail--run" x1="96" y1="35" x2="104" y2="17"/>
      <line class="demo__flow demo__flow--run" x1="96" y1="35" x2="104" y2="17" pathLength="10"/>
      <path class="demo__head demo__head--run" d="M101.2 17.8 L104.6 15.6 L105 19.6 Z"/>
      <line class="demo__trail demo__trail--press" x1="37" y1="41" x2="49" y2="51"/>
      <line class="demo__flow demo__flow--press" x1="37" y1="41" x2="49" y2="51" pathLength="10"/>
      <path class="demo__head demo__head--press" d="M47 53.2 L50.6 52.4 L49.2 49 Z"/>
    </g>
    <circle class="demo__opp" cx="66" cy="28" r="4.2"/>
    <circle class="demo__opp" cx="34" cy="38" r="4.2"/>
    <circle class="demo__home" cx="58" cy="18" r="4.2"/>
    <circle class="demo__home" cx="94" cy="39" r="4.2"/>
    <circle class="demo__home" cx="24" cy="24" r="4.2"/>
    <path class="demo__choice" d="M58 53 L58 26"/>
    <circle class="demo__choice-end" cx="58" cy="18" r="7"/>
    <circle class="demo__home" cx="58" cy="60" r="4.2"/>
    <circle class="demo__mark demo__mark--still" cx="58" cy="60" r="7.5"/>
    <text class="demo__caption demo__caption--1" x="60" y="76">Solid: already moving</text>
    <text class="demo__caption demo__caption--2" x="60" y="76">Dashed: your choice</text>
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

// The facts chips under each instruction, for the plan's length of each challenge.
function facts(id, o = {}) {
  const rounds = (n, word = "round") => `${n} ${word}${n === 1 ? "" : "s"}`;
  switch (id) {
    case "spot": return [rounds(o.rounds ?? SPOT.rounds), `${SPOT.studyMs / 1000} s to look`, `${SPOT.answerMs / 1000} s to answer`];
    case "track": { const n = o.rounds ?? TRACK.rounds; return [rounds(n), `${TRACK.targets} to follow`, `${TRACK.moveMs / 1000} s of running`, ...(n > 1 ? ["Round 2 is faster"] : [])]; }
    case "decide": return [rounds(DECIDE.situations, "situation"), "No clock", "Draft scenarios"];
    case "scan": return [rounds(SCAN.lookMs.length, "situation"), `${SCAN.lookMs.map((ms) => ms / 1000).join(" / ")} s to look`, "Draft situations"];
    case "through": return o.practice === false
      ? ["A quick example first", rounds(o.rounds ?? THROUGH.rounds, "scored round")]
      : ["A demonstration first", "1 practice try, unscored", rounds(o.rounds ?? THROUGH.rounds, "scored round"), "A different situation each round"];
    default: return [];
  }
}

// Tactical choice can only run with scenarios it is allowed to show.
// Opponents vanish likewise needs situations (drafts only in the review demo and local preview).
const playable = (id) => CHALLENGES[id].built
  && (id !== "decide" || usableScenarios(SCENARIOS, DECIDE).length > 0)
  && (id !== "scan" || usableSituations().length > 0);

// A returning player (finished this challenge before in the full test) sees the same
// instruction, with the example animation folded away behind "Show the example".
const returning = (ctx, id) => ctx.plan.id === "full" && hasSeen(id);

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

  const seen = returning(ctx, id);
  const draft = id === "decide" || id === "scan";
  return {
    html: `
      ${progress(ctx.plan, screen.index)}
      <section class="intro${seen ? " intro--seen" : ""}">
        <div class="intro__head">
          <h2 class="intro__title">${c.title}</h2>
          <p class="intro__text">${c.instruction}</p>
        </div>
        <div class="intro__demo board-card" ${seen ? "hidden" : ""}>${DEMOS[id] ?? ""}</div>
        <div class="intro__foot">
          <ul class="intro__facts">${facts(id, ctx.plan.options?.[id]).map((f) => `<li>${f}</li>`).join("")}</ul>
          ${id === "decide" ? MOVE_KEY : ""}
          ${draft ? `<p class="intro__draft"><span class="draft-badge">Provisional</span> The situations, ${id === "decide" ? "scores" : "rankings"} and explanations are drafts until Omri approves them.</p>` : ""}
          <div class="intro__actions">
            <button class="btn btn--primary" type="button" data-event="ready">${seen ? "Start" : "Ready"} ${arrow}</button>
            ${seen ? `<button class="btn btn--text intro__show" type="button" aria-expanded="false">Show the example again</button>` : ""}
          </div>
        </div>
      </section>`,
    mount: seen ? (root) => {
      const show = root.querySelector(".intro__show"), demo = root.querySelector(".intro__demo");
      show?.addEventListener("click", () => {
        const open = demo.hidden;
        demo.hidden = !open;
        show.setAttribute("aria-expanded", String(open));
        show.textContent = open ? "Hide the example" : "Show the example again";
      });
      return null;
    } : null,
  };
}

function play(screen, ctx) {
  const id = ctx.plan.challenges[screen.index];
  return {
    html: `${progress(ctx.plan, screen.index)}<div class="play-mount"></div>`,
    mount: (root) => PLAYERS[id](root.querySelector(".play-mount"), {
      onDone: (result) => ctx.dispatch("done", result),
      options: ctx.plan.options?.[id] ?? {},
      returning: returning(ctx, id),
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
  const averaged = result.rows.length > 1 ? " Your challenge score is the average of the rounds." : "";

  return {
    html: `
      ${progress(ctx.plan, screen.index)}
      <section class="summary">
        <p class="kicker">${CHALLENGES[id].title} · done</p>
        <h2 class="summary__score"><span class="summary__points">${result.points}</span><span class="summary__of">/ 100 points</span></h2>
        <p class="summary__sub">${result.sub}${averaged}</p>
        <button class="btn btn--primary summary__next" type="button" data-event="continue">${last ? "See results" : "Next challenge"} ${arrow}</button>
        <details class="summary__details"${result.rows.length > 1 ? "" : " open"}>
          <summary>Round by round</summary>
          <ol class="summary__rows">${rows}</ol>
        </details>
      </section>`,
  };
}

// The run's totals, shared by the results screen and the saved "Your results" page.
export function summarize(plan, resultsByIndex) {
  const played = plan.challenges.map((id, i) => ({ id, result: resultsByIndex[i] }));
  const scored = played.filter((p) => p.result && !p.result.skipped);
  const total = scored.reduce((sum, p) => sum + p.result.points, 0);
  const available = scored.length * 100;
  const tier = available ? tierFor(total / available, TIERS) : TIERS[0].name;
  return { played, total, available, tier };
}

// The results screen, for both plans. The short test's result is labelled as such, out of
// 300, with a clear way into the full test; it never claims to equal the full test's score.
function results(_screen, ctx) {
  const { played, total, available, tier } = summarize(ctx.plan, ctx.results);
  const short = ctx.plan.id === "short";

  const rows = played.map(({ id, result }) => {
    const c = CHALLENGES[id];
    if (!result || result.skipped) {
      return `<li class="results__row is-pending"><span class="results__name">${c.title}<small>${c.measures}</small></span><span class="results__flag">Not played</span></li>`;
    }
    const flag = result.provisional ? ` <span class="draft-badge draft-badge--small">Provisional</span>` : "";
    return `
      <li class="results__row">
        <span class="results__name">${c.title}${flag}<small>${c.measures}</small><small class="results__tally">${result.tally}</small></span>
        <span class="results__pts">${result.points}<small>/100</small></span>
        <span class="results__bar" aria-hidden="true"><span style="width:${Math.max(0, Math.min(100, result.points))}%"></span></span>
      </li>`;
  }).join("");

  const scoredRows = played.filter((p) => p.result && !p.result.skipped).map(({ id, result }) => ({ id, title: CHALLENGES[id].title, points: result.points }));
  const note = observation(scoredRows);
  const skills = nextSkills(scoredRows, SKILLS);
  const tips = skills.length
    ? `<p class="results__tips">Worth a read next: ${skills.map((k) => `<a href="learn.html#${k.id}">${k.name} tips</a>`).join(" and ")}.</p>`
    : `<p class="results__tips">Ideas for practice on the pitch: <a href="learn.html#tips">training tips</a>.</p>`;

  const actions = short
    ? `
        <a class="btn btn--cta results__full" href="${ctx.fullTestHref ?? "play.html"}" data-action="full-test">Take the full test: 5 challenges ${arrow}</a>
        <button class="btn btn--ghost" type="button" data-action="restart">Replay the short test</button>`
    : `
        <a class="btn btn--primary" href="results.html">Your results page ${arrow}</a>
        <a class="btn btn--ghost" href="learn.html">How to improve</a>
        <a class="btn btn--text" href="play.html" data-action="restart">Play again</a>`;

  return {
    html: `
      <section class="results${short ? " results--short" : ""}">
        <p class="kicker">${short ? "Short test · your result" : "Your results"}</p>
        <h2 class="results__total-head"><span class="results__big">${total}</span><span class="results__of"> / ${available} points</span></h2>
        <p class="results__total">${short
          ? "Three challenges, one round each. This short-test score is out of 300 and isn't comparable with the full test's 500."
          : `${tier}<span aria-hidden="true"> · </span>${available === maxPoints(ctx.plan) ? "all five challenges" : `${played.filter((p) => p.result && !p.result.skipped).length} challenges scored`}`}</p>
        ${note ? `<p class="results__observe">${note}</p>` : ""}
        <ul class="results__rows">${rows}</ul>
        ${short ? `<p class="results__invite">The full test adds Tactical choice and Opponents vanish, with a practice try and more rounds per challenge.</p>` : ""}
        <div class="results__next">${actions}</div>
        ${tips}
        <p class="results__note">Points describe how you did in these games, nothing more: not an IQ score, a ranking against other players, or proof of how you play in a match.${short ? "" : " Tier names are game settings."}${provisionalNote(played)}</p>
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
 * Renders `screen` into `root`. `ctx` = { plan, results, dispatch, skip, fullTestHref }.
 * Returns a cleanup function (or null) to run before the next screen.
 */
export function renderScreen(root, screen, ctx) {
  const view = SCREENS[screen.name](screen, ctx);
  const id = screen.index === undefined ? "" : ctx.plan.challenges[screen.index];
  root.innerHTML = `<div class="game game--${screen.name}"${id ? ` data-challenge="${id}"` : ""}>${view.html}</div>`;
  root.querySelectorAll("[data-event]").forEach((b) => b.addEventListener("click", () => ctx.dispatch(b.dataset.event)));
  root.querySelector('[data-action="skip"]')?.addEventListener("click", ctx.skip);
  return view.mount ? view.mount(root) : null;
}
