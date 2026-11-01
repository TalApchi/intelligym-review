// Entry point for the challenge pages: play.html (the full test) and short-test.html (the
// short campaign test). <body data-plan="short"> picks the short plan; anything else is full.
//
// Which screen comes next is decided by Tal's nextScreen() (flow.js), for either plan.
// This file keeps the current screen and each challenge's result, and asks screens.js to draw.
// Full test: opening play.html, from any TEST YOURSELF link, goes straight to the first
// challenge's instructions (Tal, 2026-10-20); "landing" is only the flow's starting state.
// Short test: the page shows its own short introduction first; its TEST YOURSELF button starts
// the flow. Its result is saved under its own key and never touches the full test's result.

import { nextScreen } from "./flow.js";
import { PLANS, CHALLENGES } from "./config.js";
import { renderScreen, summarize } from "./screens.js";
import { saveLastResult, saveShortResult } from "./site/store.js";
import { markSeen } from "./seen.js";
import { emit, EVENTS, withCampaign, campaignParams } from "./events.js";
import { BUILD } from "./build.js";

const PLAN = document.body.dataset.plan === "short" ? PLANS.short : PLANS.full;
const SHORT = PLAN.id === "short";
const game = document.getElementById("screen-game");
const intro = document.getElementById("short-intro"); // short-test.html only

// Review demo only: quiet links to the coach review page and the prototype playground,
// outside the player flow.
if (BUILD.review && !SHORT) {
  for (const [href, text] of [["review.html", "Coach review: draft tactical scenarios"], ["playground.html", "Prototype playground: new challenge ideas"]]) {
    const link = Object.assign(document.createElement("a"), { className: "footnote__review", href, textContent: text });
    document.getElementById("play-footnote")?.append(link);
  }
}

// The way into the full test from the short results: a normal full run, campaign
// parameters carried along, and a marker so the full test can report where it came from.
const fullTestHref = withCampaign("play.html", { from: "short" });

let current = { name: "landing" };
let results = []; // results[index] = what challenge `index` reported when it finished
let cleanup = null;

// Moves the flow one step without drawing. Returns true if the screen changed.
function step(event, payload) {
  const next = nextScreen(current, event, PLAN);
  if (next === current) return false;
  if (event === "done") finished(current.index, payload);
  if (event === "start") results = [];
  current = next;
  if (current.name === "results") saveResult();
  return true;
}

function finished(index, payload) {
  results[index] = payload;
  const id = PLAN.challenges[index];
  if (payload?.skipped) return;
  if (SHORT) emit(EVENTS.shortTask, { task: id, position: index + 1, points: payload.points });
  else markSeen(id); // the full test only: a returning player may skip the example next time
}

// Keeps the finished run in this browser: the full test for the "Your results" page,
// the short test in its own slot.
function saveResult() {
  const { played, total, available, tier } = summarize(PLAN, results);
  const rows = played.map(({ id, result }) => ({
    id,
    title: CHALLENGES[id].title,
    points: result && !result.skipped ? result.points : null,
    tally: result && !result.skipped ? result.tally : "",
    provisional: Boolean(result?.provisional),
  }));
  if (SHORT) {
    saveShortResult({ total, available, rows });
    emit(EVENTS.shortComplete, { total, available });
  } else {
    saveLastResult({ total, available, tier, rows });
  }
}

function dispatch(event, payload) {
  if (step(event, payload)) render();
}

// Placeholder challenges: walk ready -> done -> continue in one go.
function skip() {
  step("ready");
  step("done", { skipped: true });
  step("continue");
  render();
}

function render() {
  if (cleanup) { cleanup(); cleanup = null; }
  cleanup = renderScreen(game, current, { plan: PLAN, results, dispatch, skip, fullTestHref });
  window.scrollTo(0, 0);
  // Move keyboard / screen-reader focus to the new screen's heading.
  const heading = game.querySelector("h1, h2");
  if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
}

// From the flow's starting state straight into the first challenge's instructions.
// "Play again" / "Replay the short test" on the results screen restarts the same way.
function begin() {
  current = { name: "landing" };
  step("start");
  if (SHORT) emit(EVENTS.shortStart);
  if (intro) intro.hidden = true;
  game.hidden = false;
  render();
}

game.addEventListener("click", (e) => {
  if (e.target.closest("[data-action=restart]")) { e.preventDefault(); begin(); }
  if (e.target.closest("[data-action=full-test]")) emit(EVENTS.fullCta);
});

if (SHORT) {
  // The short introduction is already on the page; its button starts the test.
  game.hidden = true;
  campaignParams(); // keep any utm_* values from the campaign link for this session
  intro?.querySelector("[data-action=start]")?.addEventListener("click", (e) => { e.preventDefault(); begin(); });
} else {
  const q = new URLSearchParams(location.search);
  if (q.get("from") === "short") {
    emit(EVENTS.fullFromShort);
    q.delete("from"); // a reload or a shared link is an ordinary full test
    history.replaceState(null, "", `${location.pathname}${q.toString() ? `?${q}` : ""}${location.hash}`);
  }
  begin();
}
