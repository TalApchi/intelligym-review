// "Through ball" (challenge 5): runs the challenge on screen.
// A short demonstration (an automatic pass), one practice try (unscored, fewer defenders),
// then THROUGH.rounds scored rounds: different authored situations (through/situations.js,
// played out by through/sim.js), widest window first, not repeated in a play and avoiding
// the ones seen last time in this browser. In every try you press
// Pass (or the space bar) when you choose; the ball is played into the space ahead of the
// runner at one constant speed. After each try: what happened and why, a timeline of when
// the pass was on, and a slow-motion replay (tap the timeline for "what if you'd passed here").

import { THROUGH } from "../config.js";
import { scorePass, scoreThrough, MISSED, BALL_SPEED, PLAYER_SPEED } from "./logic.js";
import { THROUGH_SITUATIONS } from "./situations.js";
import { fixedMove, pickRounds, explainSim } from "./sim.js";
import { setupMove, playMove, markResult, showOffside } from "./view.js";
import { timeline } from "./timeline.js";
import { buildBoard, drawBall, bringIntoView } from "../board.js";

const LABEL = { through: "Through", intercepted: "Cut out", covered: "Space closed", short: "To feet, not in behind", offside: "Offside", missed: "Missed" };
const sentence = (m, res) => (res === "missed" ? MISSED : explainSim(m, res));

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(THROUGH.historyKey)) || {}; } catch { return {}; }
}
function saveHistory(history) {
  try { localStorage.setItem(THROUGH.historyKey, JSON.stringify(history)); } catch { /* not saved; fine */ }
}

// The verdict for a scored try: Through, Just early / Just late (close), Too early / Too late.
function verdictOf(m, res, score) {
  if (res === "missed") return "Missed";
  if (score.kind === "through") return "Through";
  const early = res.tr < m.window.start;
  if (res.kind === "offside") return score.kind === "close" ? "Just late: offside" : "Too late: offside";
  return score.kind === "close" ? (early ? "Just early" : "Just late") : (early ? "Too early" : "Too late");
}

/**
 * Mounts the challenge into `root` and starts the demonstration.
 * Calls onDone(result) after the last round, in the shape screens.js shows.
 * Returns a cleanup function that stops the animation and the key listener.
 */
export function playThrough(root, { onDone, options = {}, returning = false }) {
  const ROUNDS = options.rounds ?? THROUGH.rounds;
  const PRACTICE = options.practice !== false; // the short test goes from the example straight to its round
  root.innerHTML = `
    <div class="play" data-phase="demo">
      <section class="play__panel">
        <div class="play__meta">
          <span class="play__round"></span>
          <span class="play__phase"></span>
        </div>
        <h2 class="play__prompt" aria-live="polite"></h2>
        <div class="play__board board-card"><svg class="board" aria-label="Pitch seen from above"></svg></div>
        <button class="btn btn--primary play__pass" type="button" hidden>Pass</button>
        <button class="btn btn--text play__skip" type="button" hidden></button>
        <div class="play__result" hidden>
          <p class="verdict"><span class="verdict__name"></span><span class="verdict__pts"></span></p>
          <p class="play__line"></p>
          <div class="play__tl"></div>
          <div class="play__buttons">
            <button class="btn btn--ghost play__replay" type="button">Replay</button>
            <button class="btn btn--ghost play__again" type="button" hidden></button>
            <button class="btn btn--primary play__next" type="button"></button>
          </div>
        </div>
      </section>
    </div>`;

  const $ = (sel) => root.querySelector(sel);
  const ui = {
    play: $(".play"), round: $(".play__round"), phase: $(".play__phase"), prompt: $(".play__prompt"),
    pass: $(".play__pass"), result: $(".play__result"), verdictName: $(".verdict__name"), verdictPts: $(".verdict__pts"),
    line: $(".play__line"), tl: $(".play__tl"), replay: $(".play__replay"), again: $(".play__again"), next: $(".play__next"),
    skip: $(".play__skip"),
  };
  // A returning player can skip the demonstration and the practice try they've seen before.
  function skipTo(label, fn) {
    ui.skip.hidden = !returning || !label;
    if (label) { ui.skip.textContent = label; ui.skip.onclick = () => { ui.skip.hidden = true; fn(); }; }
  }
  let hinted = false; // the timeline's "tap the bar" hint: shown once, not after every round
  const tlFor = (m, rel, onPick) => { const tl = timeline(m, rel, onPick, !hinted); hinted = true; return tl; };
  const svg = $(".board");
  let alive = true;
  let gen = 0;          // each new animation bumps this; older ones stop
  let current = null;   // the running playMove
  let keyHandler = null;
  const unbindKey = () => { if (keyHandler) window.removeEventListener("keydown", keyHandler); keyHandler = null; };

  function fresh(m) {
    current?.stop();
    unbindKey();
    const board = buildBoard(svg);
    drawBall(board);
    bringIntoView(ui.play);
    return setupMove(board, m);
  }

  // Plays a move. Live (release null): the Pass button and the space bar release the ball.
  function play(view, opts = {}) {
    const g = ++gen;
    ui.result.hidden = true;
    const p = playMove(view, { ...opts, alive: () => alive && g === gen });
    current = p;
    if (opts.live) {
      const pass = () => { if (p.pass()) { ui.pass.hidden = true; unbindKey(); } };
      ui.pass.hidden = false;
      ui.pass.onclick = pass;
      keyHandler = (e) => { if (e.code === "Space" && !e.repeat) { e.preventDefault(); pass(); } };
      window.addEventListener("keydown", keyHandler);
    }
    return p.done.then((out) => { ui.pass.hidden = true; unbindKey(); return out; });
  }

  // Shows the result panel with the buttons given: { replay, again: [label, fn], next: [label, fn] }.
  function panel({ headline, verdict, pts = "", line, tl = null, replay, again = null, next }) {
    ui.prompt.textContent = headline;
    ui.verdictName.textContent = verdict;
    ui.verdictPts.textContent = pts;
    ui.line.textContent = line;
    ui.tl.replaceChildren(...(tl ? [tl.el] : []));
    ui.replay.onclick = replay;
    ui.again.hidden = !again;
    if (again) { ui.again.textContent = again[0]; ui.again.onclick = again[1]; }
    ui.next.textContent = next[0];
    ui.next.onclick = next[1];
    ui.result.hidden = false;
    ui.play.dataset.phase = "reveal";
    ui.next.focus({ preventScroll: true });
    ui.next.scrollIntoView?.({ block: "nearest", behavior: "smooth" }); // short phones
  }

  // Slow motion from a little before the release, the playhead running along the timeline.
  // `release` is the visitor's own pass, or a "what if" moment tapped on the timeline.
  async function replay(m, res, release, after) {
    const yours = res === "missed" ? null : res.tr;
    const whatIf = release !== yours;
    const view = fresh(m);
    const tl = timeline(m, yours, (t) => replay(m, res, t, after), false);
    if (whatIf) tl.probe(release);
    ui.tl.replaceChildren(tl.el);
    ui.result.hidden = true;
    ui.play.dataset.phase = "replay";
    ui.prompt.textContent = whatIf ? "What if you'd passed here? (slow motion)" : "Replay (slow motion)";
    const from = Math.max(0, (release ?? m.window.start) - 1.5);
    const out = await play(view, { release, speed: THROUGH.replaySpeed, from, onTime: (t) => tl.playhead(t) });
    if (!out) return;
    tl.playhead(null);
    markResult(view, out);
    if (out !== "missed" && out.kind === "offside") showOffside(view, out);
    after(tl, whatIf ? `${sentence(m, out)} On the bar, the dashed line is that moment and the solid marker is your pass.` : null);
    ui.prompt.textContent = whatIf ? `If you'd passed then: ${LABEL[out.kind]}` : ui.prompt.textContent;
  }

  const afterDemo = () => (PRACTICE ? practice() : round(0));

  // ---- 1. Demonstration ----
  async function demo() {
    const m = fixedMove(THROUGH_SITUATIONS, "demo", THROUGH.demoSeed);
    const view = fresh(m);
    ui.round.textContent = PRACTICE ? "Demonstration" : "Quick example";
    ui.phase.textContent = "Watch";
    ui.prompt.textContent = "Watch the ringed runner and the pass.";
    ui.play.dataset.phase = "demo";
    skipTo(PRACTICE ? "Skip the demonstration" : "Skip the example", () => { gen++; current?.stop(); afterDemo(); });
    const release = m.window.start + m.window.length / 2;
    const res = await play(view, {
      release,
      onTime: (t, r) => {
        if (r && t >= r.tr && t < r.t) ui.prompt.textContent = "Pass! Into the space ahead of the runner.";
        else if (r && t >= r.t) ui.prompt.textContent = "Through.";
      },
    });
    if (!res) return;
    skipTo(null);
    markResult(view, res);
    panel({
      headline: "Played into space: through",
      verdict: PRACTICE ? "Demonstration" : "Example",
      line: `Released before the runner got past their defensive line, so not offside, and aimed where the runner was going. Everyone runs at the same speed; you only choose when.`,
      replay: demo,
      next: [PRACTICE ? "Practice try (unscored)" : "Your turn: scored round", afterDemo],
    });
  }

  // ---- 2. Practice (unscored) ----
  async function practice() {
    const m = fixedMove(THROUGH_SITUATIONS, "practice", THROUGH.practiceSeed);
    const view = fresh(m);
    ui.round.textContent = "Practice";
    ui.phase.textContent = "Unscored";
    ui.prompt.textContent = `${m.title}: press Pass when it's on.`;
    ui.play.dataset.phase = "live";
    skipTo("Skip the practice", () => { gen++; current?.stop(); round(0); });
    const res = await play(view, { live: true });
    if (!res) return;
    skipTo(null);
    markResult(view, res);
    if (res !== "missed" && res.kind === "offside") showOffside(view, res);
    const show = (tl, extra) => panel({
      headline: `Practice: ${LABEL[res === "missed" ? "missed" : res.kind]}`,
      verdict: "Practice",
      pts: "unscored",
      line: extra ?? sentence(m, res),
      tl,
      replay: () => replay(m, res, res === "missed" ? null : res.tr, show),
      again: ["Practice again", practice],
      next: ["Start round 1", () => round(0)],
    });
    show(tlFor(m, res === "missed" ? null : res.tr, (t) => replay(m, res, t, show)));
  }

  // ---- 3. Scored rounds ----
  const pts = [];
  const rows = [];
  let moves = null; // the play's situations, picked when round 1 starts
  async function round(i) {
    if (!moves) {
      // the short test picks two and plays the one with the wider window (a gentler single round)
      const out = pickRounds(THROUGH_SITUATIONS, loadHistory(), Math.max(ROUNDS, options.pickFrom ?? ROUNDS));
      saveHistory(out.history);
      moves = out.moves.slice(0, ROUNDS);
    }
    const last = i === ROUNDS - 1;
    const m = moves[i];
    const view = fresh(m);
    skipTo(null);
    ui.round.textContent = `Round ${i + 1} of ${ROUNDS}`;
    ui.phase.textContent = "Scored";
    ui.prompt.textContent = `${m.title}: press Pass when it's on.`;
    ui.play.dataset.phase = "live";
    const res = await play(view, { live: true });
    if (!res) return;
    markResult(view, res);
    if (res !== "missed" && res.kind === "offside") showOffside(view, res);
    const score = scorePass(m, res, THROUGH);
    const verdict = verdictOf(m, res, score);
    pts.push(score.pts);
    rows.push({ ok: score.kind === "through", label: `Round ${i + 1} · ${m.title}`, line: `${verdict}. ${sentence(m, res).replace(/^(Through|Too early|Too late|Missed)\. /, "")}`, aside: `${score.pts} pts` });
    const show = (tl, extra) => panel({
      headline: verdict,
      verdict: `Round ${i + 1}`,
      pts: `${score.pts} / 100 this round`,
      line: extra ?? sentence(m, res),
      tl,
      replay: () => replay(m, res, res === "missed" ? null : res.tr, show),
      next: last ? ["See your points", finish] : [`Round ${i + 2}`, () => round(i + 1)],
    });
    show(tlFor(m, res === "missed" ? null : res.tr, (t) => replay(m, res, t, show)));
  }

  function finish() {
    current?.stop();
    const through = rows.filter((r) => r.ok).length;
    onDone({
      points: scoreThrough(pts),
      tally: `${through} of ${ROUNDS} through`,
      sub: `${ROUNDS > 1 ? `${through} of your ${ROUNDS} passes got through.` : through ? "Your pass got through." : "Your pass didn't get through."} A pass just outside the window scores half.`,
      rows,
    });
  }

  demo();

  return () => {
    alive = false;
    current?.stop();
    unbindKey();
  };
}
