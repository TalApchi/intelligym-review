// "Through ball" (challenge 5): runs the challenge on screen.
// A short demonstration (an automatic pass), one practice try (unscored, fewer defenders),
// then THROUGH.rounds scored rounds, each with a narrower window. In every try you press
// Pass (or the space bar) when you choose; the ball is played into the space ahead of the
// runner at one constant speed. After each try: what happened and why, a timeline of when
// the pass was on, and a slow-motion replay (tap the timeline for "what if you'd passed here").

import { THROUGH } from "../config.js";
import { makeMove, explainPass, scorePass, scoreThrough, MISSED, BALL_SPEED, PLAYER_SPEED } from "./logic.js";
import { setupMove, playMove, markResult } from "./view.js";
import { timeline } from "./timeline.js";
import { buildBoard, drawBall } from "../board.js";

const LABEL = { through: "Through", intercepted: "Cut out", covered: "Space closed", missed: "Missed" };
const sentence = (m, res) => (res === "missed" ? MISSED : explainPass(m, res));

// The verdict for a scored try: Through, Just early / Just late (close), Too early / Too late.
function verdictOf(m, res, score) {
  if (res === "missed") return "Missed";
  if (score.kind === "through") return "Through";
  const early = res.tr < m.window.start;
  return score.kind === "close" ? (early ? "Just early" : "Just late") : (early ? "Too early" : "Too late");
}

/**
 * Mounts the challenge into `root` and starts the demonstration.
 * Calls onDone(result) after the last round, in the shape screens.js shows.
 * Returns a cleanup function that stops the animation and the key listener.
 */
export function playThrough(root, { onDone }) {
  root.innerHTML = `
    <div class="play" data-phase="demo">
      <div class="play__board board-card"><svg class="board" aria-label="Pitch seen from above"></svg></div>
      <section class="play__panel">
        <div class="play__meta">
          <span class="play__round"></span>
          <span class="play__phase"></span>
        </div>
        <h2 class="play__prompt" aria-live="polite"></h2>
        <button class="btn btn--primary play__pass" type="button" hidden>Pass</button>
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
  };
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
    const tl = timeline(m, yours, (t) => replay(m, res, t, after));
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
    after(tl, whatIf ? `${sentence(m, out)} The dashed line is that moment; the red line is your pass.` : null);
    ui.prompt.textContent = whatIf ? `If you'd passed then: ${LABEL[out.kind]}` : ui.prompt.textContent;
  }

  // ---- 1. Demonstration ----
  async function demo() {
    const m = makeMove(THROUGH.demoSeed, { practice: true });
    const view = fresh(m);
    ui.round.textContent = "Demonstration";
    ui.phase.textContent = "Watch";
    ui.prompt.textContent = "Watch the ringed runner.";
    ui.play.dataset.phase = "demo";
    const release = m.window.start + m.window.length / 2;
    const res = await play(view, {
      release,
      onTime: (t, r) => {
        if (r && t >= r.tr && t < r.t) ui.prompt.textContent = "Pass! Into the space ahead of the runner.";
        else if (r && t >= r.t) ui.prompt.textContent = "Through.";
      },
    });
    if (!res) return;
    markResult(view, res);
    panel({
      headline: "The ball goes into space",
      verdict: "Demonstration",
      line: `Every player moves at the same steady speed (${PLAYER_SPEED} m/s), and the ball always travels at ${BALL_SPEED} m/s, aimed where the runner will be when it arrives. The dashed circle is where the runner was when the ball was played. Pass too early and a defender is in the way; too late and the cover gets there.`,
      replay: demo,
      next: ["Practice try (unscored)", practice],
    });
  }

  // ---- 2. Practice (unscored) ----
  async function practice() {
    const m = makeMove(THROUGH.practiceSeed, { practice: true });
    const view = fresh(m);
    ui.round.textContent = "Practice";
    ui.phase.textContent = "Unscored";
    ui.prompt.textContent = "Press Pass when you want to release it.";
    ui.play.dataset.phase = "live";
    const res = await play(view, { live: true });
    if (!res) return;
    markResult(view, res);
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
    show(timeline(m, res === "missed" ? null : res.tr, (t) => replay(m, res, t, show)));
  }

  // ---- 3. Scored rounds ----
  const pts = [];
  const rows = [];
  async function round(i) {
    const last = i === THROUGH.rounds - 1;
    const m = makeMove(1 + Math.floor(Math.random() * 1e6), { level: Math.min(i, 2) });
    const view = fresh(m);
    ui.round.textContent = `Round ${i + 1} of ${THROUGH.rounds}`;
    ui.phase.textContent = i === 0 ? "Scored" : "Tighter window";
    ui.prompt.textContent = "Press Pass when you want to release it.";
    ui.play.dataset.phase = "live";
    const res = await play(view, { live: true });
    if (!res) return;
    markResult(view, res);
    const score = scorePass(m, res, THROUGH);
    const verdict = verdictOf(m, res, score);
    pts.push(score.pts);
    rows.push({ ok: score.kind === "through", label: `Round ${i + 1}`, line: `${verdict}. ${sentence(m, res).replace(/^(Through|Too early|Too late|Missed)\. /, "")}`, aside: `${score.pts} pts` });
    const show = (tl, extra) => panel({
      headline: verdict,
      verdict: `Round ${i + 1}`,
      pts: `${score.pts} pts`,
      line: extra ?? sentence(m, res),
      tl,
      replay: () => replay(m, res, res === "missed" ? null : res.tr, show),
      next: last ? ["See your points", finish] : [`Round ${i + 2}`, () => round(i + 1)],
    });
    show(timeline(m, res === "missed" ? null : res.tr, (t) => replay(m, res, t, show)));
  }

  function finish() {
    current?.stop();
    const through = rows.filter((r) => r.ok).length;
    onDone({
      points: scoreThrough(pts),
      tally: `${through} of ${THROUGH.rounds} through`,
      sub: `${through} of your ${THROUGH.rounds} passes got through. A pass just outside the window scores half.`,
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
