// "Opponents vanish" (challenge 4): runs the situations on screen.
// Each situation: the ball is played to you; look at the whole picture while it travels ->
// the opponents disappear -> the ball arrives -> tap the teammate you'd pass to -> the pass
// plays out with the opponents back -> provisional verdict, points and the draft reasoning.
// The look time gets shorter each situation. Rankings are DRAFTS pending Omri's approval;
// this screen always says so.

import { SCAN } from "../config.js";
import { SCAN_SITUATIONS } from "./situations.js";
import { scanState, scanRank, scanFeedback, toSegment, targetsOf, scorePass, scoreScan } from "./logic.js";
import { pickScenarios } from "../decide/logic.js";
import { BALL_SPEED, REACH } from "../through/logic.js";
import { buildBoard, drawPlayers, markPlayer, placePlayers, placeBall, setTappable, clearMarks, showArrow, drawBall, playerAt } from "../board.js";

const VERDICT = { best: "Best option", reasonable: "Reasonable option", poor: "Weak option" };
const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
const lerp = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Situations this build may show (drafts only in the review demo and local preview).
export const usableSituations = (cfg = SCAN) => SCAN_SITUATIONS.filter((s) => s.approved || cfg.allowDrafts);

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(SCAN.historyKey)) || {}; } catch { return {}; }
}
function saveHistory(history) {
  try { localStorage.setItem(SCAN.historyKey, JSON.stringify(history)); } catch { /* not saved; fine */ }
}
// One situation per look time, not seen recently in this browser.
function chooseSituations() {
  const pool = usableSituations();
  const { ids, history } = pickScenarios(pool.map((s) => s.id), loadHistory(), SCAN.lookMs.length, Math.random);
  saveHistory(history);
  return ids.map((id) => pool.find((s) => s.id === id));
}

const name = (s, id) => (id === s.passer.id ? `back to the ${s.passer.role}` : `the ${targetsOf(s).find((m) => m.id === id).role}`);

/**
 * Mounts the challenge into `root` and starts situation 1.
 * Calls onDone(result) after the last situation, in the shape screens.js shows.
 * Returns a cleanup function that stops the animation and the tap listeners.
 */
export function playScan(root, { onDone }) {
  const situations = chooseSituations();

  root.innerHTML = `
    <div class="play" data-phase="look">
      <div class="play__board board-card"><svg class="board" aria-label="Pitch seen from above"></svg></div>
      <section class="play__panel">
        <div class="play__meta">
          <span class="play__round"></span>
          <span class="draft-badge" hidden>Draft situation</span>
        </div>
        <h2 class="play__prompt" aria-live="polite"></h2>
        <div class="timer" aria-hidden="true"><div class="timer__fill"></div></div>
        <div class="play__result" hidden>
          <p class="verdict"><span class="verdict__name"></span><span class="verdict__pts"></span></p>
          <p class="play__line"></p>
          <p class="play__best"></p>
          <p class="play__why"></p>
          <p class="play__provisional">Provisional: this ranking and explanation are drafts until Omri approves them.</p>
          <div class="play__buttons">
            <button class="btn btn--ghost play__replay" type="button">Replay</button>
            <button class="btn btn--primary play__next" type="button"></button>
          </div>
        </div>
      </section>
    </div>`;

  const $ = (sel) => root.querySelector(sel);
  const ui = {
    play: $(".play"), round: $(".play__round"), badge: $(".draft-badge"), prompt: $(".play__prompt"),
    timer: $(".timer"), fill: $(".timer__fill"), result: $(".play__result"),
    verdictName: $(".verdict__name"), verdictPts: $(".verdict__pts"), line: $(".play__line"),
    best: $(".play__best"), why: $(".play__why"), provisional: $(".play__provisional"),
    replay: $(".play__replay"), next: $(".play__next"),
  };
  const board = buildBoard($(".board"));
  drawBall(board);
  const pts = [];
  const rows = [];

  let alive = true;
  let raf = 0;
  let detach = null;

  // Calls frame(elapsedMs) every animation frame for `ms`. Resolves when done (or stopped).
  const run = (ms, frame) => new Promise((resolve) => {
    const start = performance.now();
    const tick = (now) => {
      if (!alive) return;
      const t = Math.min(now - start, ms);
      frame(t);
      if (t >= ms) resolve();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });

  const passerFoot = (s) => ({ x: s.passer.x + 1.4, y: s.passer.y - 1.4 });
  const youFoot = (s) => ({ x: s.you.x + 1.2, y: s.you.y + 1.2 });

  function setup(s) {
    drawPlayers(board, [
      { id: "you", role: "you", ...s.you, team: "home" },
      { ...s.passer, role: `${s.passer.role} passing to you`, team: "home" },
      ...s.home.map((m) => ({ ...m, team: "home" })),
      ...s.away.map((o) => ({ ...o, team: "away" })),
    ]);
    markPlayer(board, "you", "is-carrier");
    clearMarks(board);
  }
  const opponents = (s, on) => { for (const o of s.away) markPlayer(board, o.id, "is-gone", !on); };

  // The look: the ball rolls slowly towards you while the full picture shows; then the
  // opponents fade out and the ball arrives.
  async function look(s, ms) {
    ui.play.dataset.phase = "look";
    ui.timer.hidden = false;
    ui.prompt.textContent = "Look: where are their players?";
    const from = passerFoot(s), to = youFoot(s);
    const mid = lerp(from, to, 0.35);
    await run(ms, (t) => {
      ui.fill.style.transform = `scaleX(${1 - t / ms})`;
      placeBall(board, lerp(from, mid, t / ms));
    });
    ui.timer.hidden = true;
    opponents(s, false);
    ui.prompt.textContent = "Here's the ball…";
    const arrive = (dist(mid, to) / BALL_SPEED) * 1000 + 300;
    await run(arrive, (t) => placeBall(board, lerp(mid, to, ease(t / arrive))));
  }

  // Waits for a tap (or Enter / Space) on a teammate.
  function pick(s) {
    return new Promise((resolve) => {
      ui.play.dataset.phase = "answer";
      ui.prompt.textContent = "Tap the teammate you'd pass to.";
      setTappable(board, true);
      const targets = targetsOf(s);
      const done = (id) => { detach(); detach = null; setTappable(board, false); resolve(id); };
      const onUp = (e) => { const id = playerAt(board, targets, e.clientX, e.clientY, SCAN.hitRadius); if (id) done(id); };
      const keys = targets.map((m) => {
        const n = board.nodes.get(m.id);
        const f = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); done(m.id); } };
        n.addEventListener("keydown", f);
        return [n, f];
      });
      board.svg.addEventListener("pointerup", onUp);
      detach = () => { board.svg.removeEventListener("pointerup", onUp); for (const [n, f] of keys) n.removeEventListener("keydown", f); };
    });
  }

  // The pass plays out with the opponents back on screen.
  async function outcome(s, id, slow = 1) {
    ui.play.dataset.phase = "outcome";
    const m = targetsOf(s).find((x) => x.id === id);
    const { kind, a } = scanState(s, m);
    opponents(s, true);
    markPlayer(board, id, "is-pick");
    const from = { x: s.you.x + 1.2, y: s.you.y - 1.2 };
    // A pass into a blocked lane stops where it meets the opponent.
    const end = kind === "lane" ? lerp(from, m, Math.max(0, toSegment(a.laneOpp, from, m).u - REACH / dist(from, m))) : m;
    showArrow(board, s.you, m);
    const presser = kind === "marked" || kind === "tight" ? a.nearOpp : null;
    const ms = (dist(from, end) / BALL_SPEED) * 1000 * slow;
    await run(ms + 500, (t) => {
      placeBall(board, lerp(from, end, Math.min(1, t / ms)));
      // the nearest opponent steps towards the receiver, stopping short of the disc
      if (presser) placePlayers(board, { [presser.id]: lerp(presser, lerp(presser, m, Math.max(0, 1 - 4 / dist(presser, m))), ease(Math.min(1, t / (ms + 500)))) });
    });
  }

  function reveal(s, id) {
    clearMarks(board);
    const rank = scanRank(s, id);
    if (rank !== "best") markPlayer(board, s.best, "is-answer");
    markPlayer(board, id, rank === "best" ? "is-found" : rank === "poor" ? "is-wrong" : "is-pick");
  }

  const waitForNext = () => new Promise((resolve) => {
    ui.next.addEventListener("click", () => alive && resolve(), { once: true });
  });

  async function start() {
    for (let i = 0; i < situations.length; i++) {
      const s = situations[i];
      const ms = SCAN.lookMs[i];
      const last = i === situations.length - 1;
      ui.round.textContent = `Situation ${i + 1} of ${situations.length} · ${(ms / 1000).toFixed(1)} s to look`;
      ui.badge.hidden = s.approved;
      ui.result.hidden = true;
      setup(s);
      placeBall(board, passerFoot(s));
      await look(s, ms);
      if (!alive) return;
      const id = await pick(s);
      if (!alive) return;
      await outcome(s, id);
      if (!alive) return;
      reveal(s, id);

      const rank = scanRank(s, id);
      const p = scorePass(s, id, SCAN.points);
      pts.push(p);
      const draft = !s.approved;
      ui.play.dataset.phase = "reveal";
      ui.prompt.textContent = id === s.passer.id ? `You played it ${name(s, id)}.` : `You passed to ${name(s, id)}.`;
      ui.verdictName.textContent = `${VERDICT[rank]}${draft ? " (provisional)" : ""}`;
      ui.verdictPts.textContent = `${p} pts`;
      ui.line.textContent = scanFeedback(s, id);
      ui.best.textContent = rank === "best" ? "" : `${draft ? "Draft best" : "Best"}: ${name(s, s.best)} (circled).`;
      ui.best.hidden = rank === "best";
      ui.why.textContent = `${draft ? "Why (draft)" : "Why"}: ${s.reasoning}`;
      ui.provisional.hidden = !draft;
      ui.next.textContent = last ? "See your points" : "Next situation · less time";
      ui.replay.onclick = async () => {
        if (!alive) return;
        ui.result.hidden = true;
        ui.play.dataset.phase = "outcome";
        setup(s);
        ui.prompt.textContent = "Replay: this is what you had to remember.";
        placeBall(board, youFoot(s));
        await run(1800, () => {});
        if (!alive) return;
        await outcome(s, id, 1.6);
        if (!alive) return;
        reveal(s, id);
        ui.play.dataset.phase = "reveal";
        ui.prompt.textContent = "Replay";
        ui.result.hidden = false;
      };
      ui.result.hidden = false;
      ui.next.focus({ preventScroll: true });
      ui.next.scrollIntoView?.({ block: "nearest", behavior: "smooth" }); // short phones
      rows.push({
        ok: rank === "best",
        label: `${s.title}${draft ? " · draft" : ""}`,
        line: `${VERDICT[rank]}: ${scanFeedback(s, id)}`,
        aside: `${p} pts`,
      });
      await waitForNext();
    }
    const bests = rows.filter((r) => r.ok).length;
    onDone({
      points: scoreScan(pts),
      tally: `${bests} of ${pts.length} best passes`,
      sub: `You found the draft best pass in ${bests} of ${pts.length} situations, with less time to look each time. These rankings are provisional until Omri approves them.`,
      rows,
      provisional: situations.some((s) => !s.approved),
    });
  }

  start();

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
    if (detach) detach();
  };
}
