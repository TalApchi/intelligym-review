// "Spot the change": runs the rounds on screen.
// Each round: study the picture -> blank pitch -> one player has moved -> tap them -> replay.
// The rules (who moves, where, scoring, wording) are in logic.js; this file only does timing and DOM.

import { SPOT } from "../config.js";
import { FORMATIONS } from "./formations.js";
import { makeRounds, feedbackLine, scoreSpot } from "./logic.js";
import { buildBoard, drawPlayers, setTappable, playerAt, markPlayer, showMove, clearMarks } from "../board.js";

const PHASE = {
  study: { label: "Look", prompt: "Remember the picture" },
  hide: { label: "Wait", prompt: "One player is moving…" },
  answer: { label: "Your move", prompt: "Who moved? Tap them." },
};

/**
 * Mounts the challenge into `root` and starts round 1.
 * Calls onDone(result) after the last round, in the shape screens.js shows:
 *   { points, tally, sub, rows: [{ ok, label, line, aside }] }
 * Returns a cleanup function that stops every timer (used when the visitor leaves).
 */
export function playSpot(root, { onDone }) {
  root.innerHTML = `
    <div class="play" data-phase="study">
      <div class="play__board board-card"><svg class="board" aria-label="Pitch seen from above"></svg></div>
      <section class="play__panel">
        <div class="play__meta">
          <span class="play__round"></span>
          <span class="play__phase"></span>
        </div>
        <h2 class="play__prompt" aria-live="polite"></h2>
        <div class="timer" aria-hidden="true"><div class="timer__fill"></div></div>
        <div class="play__result" hidden>
          <p class="play__line"></p>
          <p class="play__time"></p>
          <button class="btn btn--primary play__next" type="button"></button>
        </div>
      </section>
    </div>`;

  const $ = (sel) => root.querySelector(sel);
  const ui = {
    play: $(".play"), round: $(".play__round"), phase: $(".play__phase"), prompt: $(".play__prompt"),
    fill: $(".timer__fill"), result: $(".play__result"), line: $(".play__line"),
    time: $(".play__time"), next: $(".play__next"),
  };
  const board = buildBoard($(".board"));
  const rounds = makeRounds(FORMATIONS, SPOT);
  const answers = [];

  // Everything that can fire later is tracked here, so cleanup can stop it all.
  let alive = true;
  const timers = new Set();
  let raf = 0;
  let pickHandler = null;

  const wait = (ms) => new Promise((resolve) => {
    const t = setTimeout(() => { timers.delete(t); if (alive) resolve(); }, ms);
    timers.add(t);
  });

  // The timer bar is driven from JavaScript (not CSS animation) because it carries
  // information: it must still count down for visitors with reduced motion.
  function runTimer(ms) {
    cancelAnimationFrame(raf);
    const start = performance.now();
    const tick = (now) => {
      const left = Math.max(0, 1 - (now - start) / ms);
      ui.fill.style.transform = `scaleX(${left.toFixed(4)})`;
      if (left > 0 && alive) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function setPhase(name) {
    ui.play.dataset.phase = name;
    if (PHASE[name]) {
      ui.phase.textContent = PHASE[name].label;
      ui.prompt.textContent = PHASE[name].prompt;
    }
  }

  // Resolves with the tapped player's id, or null when time runs out.
  function waitForPick(round, ms) {
    return new Promise((resolve) => {
      const finish = (id) => {
        if (!pickHandler) return;
        board.svg.removeEventListener("pointerdown", pickHandler.pointer);
        board.svg.removeEventListener("keydown", pickHandler.key);
        pickHandler = null;
        timers.delete(timeout); clearTimeout(timeout);
        if (alive) resolve(id);
      };
      const pointer = (e) => {
        const id = playerAt(board, round.after, e.clientX, e.clientY, SPOT.hitRadius);
        if (id) { e.preventDefault(); finish(id); }
      };
      const key = (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        const id = e.target.closest?.(".bp")?.dataset.id;
        if (id) { e.preventDefault(); finish(id); }
      };
      const timeout = setTimeout(() => finish(null), ms);
      timers.add(timeout);
      pickHandler = { pointer, key };
      board.svg.addEventListener("pointerdown", pointer);
      board.svg.addEventListener("keydown", key);
    });
  }

  const waitForNext = () => new Promise((resolve) => {
    ui.next.addEventListener("click", () => alive && resolve(), { once: true });
  });

  async function run() {
    for (let i = 0; i < rounds.length; i++) {
      const round = rounds[i];
      const last = i === rounds.length - 1;
      ui.round.textContent = `Round ${i + 1} of ${rounds.length}`;
      ui.result.hidden = true;
      clearMarks(board);

      // 1. Study the picture
      drawPlayers(board, round.before);
      setPhase("study");
      runTimer(SPOT.studyMs);
      await wait(SPOT.studyMs);

      // 2. Blank pitch
      setPhase("hide");
      ui.fill.style.transform = "scaleX(0)";
      await wait(SPOT.hideMs);

      // 3. The changed picture: tap who moved
      drawPlayers(board, round.after);
      setPhase("answer");
      setTappable(board, true);
      runTimer(SPOT.answerMs);
      const shownAt = performance.now();
      const picked = await waitForPick(round, SPOT.answerMs);
      const timeMs = picked ? performance.now() - shownAt : null;
      cancelAnimationFrame(raf);
      setTappable(board, false);
      const correct = picked === round.moverId;
      answers.push({ correct, picked, timeMs, moverId: round.moverId, line: feedbackLine(round, picked) });

      // 4. Replay: ghost + arrow on the mover, the visitor's pick ringed
      setPhase("reveal");
      ui.phase.textContent = correct ? "Spotted" : picked ? "Missed" : "Time's up";
      ui.prompt.textContent = correct ? "Spotted it." : picked ? "Not that one." : "Out of time.";
      showMove(board, round.from, round.to);
      markPlayer(board, round.moverId, "is-answer");
      if (picked) markPlayer(board, picked, "is-pick");
      ui.line.textContent = answers[i].line;
      ui.time.textContent = timeMs === null ? "No answer" : `Answered in ${(timeMs / 1000).toFixed(1)} s`;
      ui.next.textContent = last ? "See your points" : "Next round";
      ui.result.hidden = false;
      ui.next.focus({ preventScroll: true });
      await waitForNext();
    }
    const spotted = answers.filter((a) => a.correct).length;
    onDone({
      points: scoreSpot(answers),
      tally: `${spotted} of ${answers.length} spotted`,
      sub: `You spotted ${spotted} of ${answers.length} changes. Time is shown, not scored.`,
      rows: answers.map((a, i) => ({
        ok: a.correct,
        label: `Round ${i + 1}`,
        line: a.line,
        aside: a.timeMs === null ? "no answer" : `${(a.timeMs / 1000).toFixed(1)} s`,
      })),
    });
  }

  run();

  return () => {
    alive = false;
    for (const t of timers) clearTimeout(t);
    cancelAnimationFrame(raf);
    if (pickHandler) {
      board.svg.removeEventListener("pointerdown", pickHandler.pointer);
      board.svg.removeEventListener("keydown", pickHandler.key);
    }
  };
}
