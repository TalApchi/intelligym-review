// Entry point for play.html: runs the challenge flow.
//
// Which screen comes next is decided by Tal's nextScreen() (flow.js).
// This file keeps the current screen and each challenge's result, and asks
// screens.js to draw. There is no landing screen any more (Tal, 2026-10-20):
// opening play.html, from any TEST YOURSELF link, goes straight to the first
// challenge's instructions, and "landing" is only the flow's starting state.

import { nextScreen } from "./flow.js";
import { PLAN } from "./config.js";
import { renderScreen, summarize } from "./screens.js";
import { CHALLENGES } from "./config.js";
import { saveLastResult } from "./site/store.js";
import { BUILD } from "./build.js";

const game = document.getElementById("screen-game");

// Review demo only: quiet links to the coach review page and the prototype playground,
// outside the player flow.
if (BUILD.review) {
  for (const [href, text] of [["review.html", "Coach review: draft tactical scenarios"], ["playground.html", "Prototype playground: new challenge ideas"]]) {
    const link = Object.assign(document.createElement("a"), { className: "footnote__review", href, textContent: text });
    document.getElementById("play-footnote")?.append(link);
  }
}

let current = { name: "landing" };
let results = []; // results[index] = what challenge `index` reported when it finished
let cleanup = null;

// Moves the flow one step without drawing. Returns true if the screen changed.
function step(event, payload) {
  const next = nextScreen(current, event, PLAN);
  if (next === current) return false;
  if (event === "done") results[current.index] = payload;
  if (event === "start") results = [];
  current = next;
  if (current.name === "results") saveResult();
  return true;
}

// Keeps the finished run in this browser for the "Your results" page (store.js).
function saveResult() {
  const { played, total, available, tier } = summarize(PLAN, results);
  saveLastResult({
    total, available, tier,
    rows: played.map(({ id, result }) => ({
      id,
      title: CHALLENGES[id].title,
      points: result && !result.skipped ? result.points : null,
      tally: result && !result.skipped ? result.tally : "",
      provisional: Boolean(result?.provisional),
    })),
  });
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
  cleanup = renderScreen(game, current, { plan: PLAN, results, dispatch, skip });
  window.scrollTo(0, 0);
  // Move keyboard / screen-reader focus to the new screen's heading.
  const heading = game.querySelector("h1, h2");
  if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
}

// From the flow's starting state straight into the first challenge's instructions.
// "Play again" on the results screen restarts the same way.
function begin() {
  current = { name: "landing" };
  step("start");
  render();
}

game.addEventListener("click", (e) => {
  if (e.target.closest("[data-action=restart]")) { e.preventDefault(); begin(); }
});

begin();
