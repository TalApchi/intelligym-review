// Entry point: builds the landing pitch and runs the challenge flow.
//
// Which screen comes next is decided by Tal's nextScreen() (flow.js).
// This file keeps the current screen and each challenge's result, and asks
// screens.js to draw. The URL hash only separates landing (no hash) from the
// challenge (#challenge), so the browser Back button leaves the challenge.

import * as scene from "./scene.js";
import { buildPitch, startAmbientMotion } from "./pitch.js";
import { nextScreen } from "./flow.js";
import { PLAN } from "./config.js";
import { renderScreen } from "./screens.js";
import { BUILD } from "./build.js";

const landing = document.getElementById("screen-landing");
const game = document.getElementById("screen-game");

// Review demo only: quiet links to the coach review page and the prototype playground,
// outside the player flow.
if (BUILD.review) {
  for (const [href, text] of [["review.html", "Coach review: draft tactical scenarios"], ["playground.html", "Prototype playground: new challenge ideas"]]) {
    const link = Object.assign(document.createElement("a"), { className: "footnote__review", href, textContent: text });
    landing.querySelector(".footnote")?.append(link);
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
  return true;
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
  const onLanding = current.name === "landing";
  landing.hidden = !onLanding;
  game.hidden = onLanding;
  if (onLanding) {
    game.replaceChildren();
  } else {
    cleanup = renderScreen(game, current, { plan: PLAN, results, dispatch, skip });
  }
  window.scrollTo(0, 0);
  // Move keyboard / screen-reader focus to the new screen's heading.
  const heading = (onLanding ? landing : game).querySelector("h1, h2");
  if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
}

function onHash() {
  const inChallenge = location.hash === "#challenge";
  if (inChallenge && current.name === "landing") {
    dispatch("start");
  } else if (!inChallenge && current.name !== "landing") {
    // "Start over" on results is the flow's restart; Back mid-challenge abandons it.
    if (!step("restart")) current = { name: "landing" };
    render();
  }
}

const pitchSvg = document.getElementById("pitch");
const handles = buildPitch(pitchSvg, scene);
startAmbientMotion(handles, pitchSvg.closest(".stage-card"));

window.addEventListener("hashchange", onHash);
onHash();
