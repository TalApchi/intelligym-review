// "Tracking runners": runs the rounds on screen.
// Each round: three teammates pulse red -> the pulse fades -> everyone runs -> freeze ->
// tap the three you followed -> Confirm -> replay. Rules are in logic.js; this file does timing and DOM.

import { TRACK } from "../config.js";
import { makeRound, positionsAt, gradeRound, feedbackLine, scoreTrack } from "./logic.js";
import { buildBoard, drawPlayers, setTappable, playerAt, markPlayer, placePlayers } from "../board.js";

const PHASE = {
  mark: { label: "Look", prompt: "These three. Lock on." },
  move: { label: "Follow", prompt: "Keep your eyes on them" },
  pick: { label: "Your move", prompt: "Tap the three you followed" },
};

/**
 * Mounts the challenge into `root` and starts round 1.
 * Calls onDone(result) after the last round, in the shape screens.js shows.
 * Returns a cleanup function that stops every timer and animation.
 */
export function playTrack(root, { onDone }) {
  root.innerHTML = `
    <div class="play" data-phase="mark">
      <div class="play__board board-card"><svg class="board" aria-label="Pitch seen from above"></svg></div>
      <section class="play__panel">
        <div class="play__meta">
          <span class="play__round"></span>
          <span class="play__phase"></span>
        </div>
        <h2 class="play__prompt" aria-live="polite"></h2>
        <div class="timer" aria-hidden="true"><div class="timer__fill"></div></div>
        <div class="play__picker" hidden>
          <p class="play__count" aria-live="polite"></p>
          <button class="btn btn--primary play__confirm" type="button" hidden>Confirm</button>
        </div>
        <div class="play__result" hidden>
          <p class="play__line"></p>
          <p class="play__time"></p>
          <p class="play__key"><span>✓ followed</span><span>◌ missed</span><span>✕ not one of them</span></p>
          <button class="btn btn--primary play__next" type="button"></button>
        </div>
      </section>
    </div>`;

  const $ = (sel) => root.querySelector(sel);
  const ui = {
    play: $(".play"), round: $(".play__round"), phase: $(".play__phase"), prompt: $(".play__prompt"),
    fill: $(".timer__fill"), picker: $(".play__picker"), count: $(".play__count"), confirm: $(".play__confirm"),
    result: $(".play__result"), line: $(".play__line"), time: $(".play__time"), next: $(".play__next"),
    key: $(".play__key"),
  };
  const board = buildBoard($(".board"));
  const grades = [];
  const rows = [];

  let alive = true;
  const timers = new Set();
  let raf = 0;
  let detach = null; // removes the current round's tap listeners

  const wait = (ms) => new Promise((resolve) => {
    const t = setTimeout(() => { timers.delete(t); if (alive) resolve(); }, ms);
    timers.add(t);
  });

  function setPhase(name) {
    ui.play.dataset.phase = name;
    if (PHASE[name]) {
      ui.phase.textContent = PHASE[name].label;
      ui.prompt.textContent = PHASE[name].prompt;
    }
  }

  function timerBar(ms) {
    const start = performance.now();
    const tick = (now) => {
      const left = Math.max(0, 1 - (now - start) / ms);
      ui.fill.style.transform = `scaleX(${left.toFixed(4)})`;
      if (left > 0 && alive) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  // Everyone runs for moveMs. Position is computed from elapsed time on every frame,
  // so a slow phone drops frames but never slows the runs down.
  function runAll(round) {
    return new Promise((resolve) => {
      const start = performance.now();
      const tick = (now) => {
        if (!alive) return;
        const u = Math.min(1, (now - start) / TRACK.moveMs);
        placePlayers(board, positionsAt(round, u));
        ui.fill.style.transform = `scaleX(${(1 - u).toFixed(4)})`;
        if (u < 1) raf = requestAnimationFrame(tick);
        else resolve();
      };
      raf = requestAnimationFrame(tick);
    });
  }

  // Tap to pick, tap again to drop. Confirm shows once exactly `targets` are picked.
  function pickThree(round) {
    return new Promise((resolve) => {
      const picks = [];
      const final = round.players.map((p) => ({ id: p.id, ...positionsAt(round, 1)[p.id] }));
      const update = () => {
        const n = picks.length;
        ui.count.textContent = n === TRACK.targets ? `${n} of ${TRACK.targets} picked. Confirm, or tap one to change.` : `${n} of ${TRACK.targets} picked`;
        ui.confirm.hidden = n !== TRACK.targets;
      };
      const toggle = (id) => {
        const i = picks.indexOf(id);
        if (i >= 0) picks.splice(i, 1);
        else if (picks.length < TRACK.targets) picks.push(id);
        else return; // already three: drop one first
        markPlayer(board, id, "is-pick", i < 0);
        update();
      };
      const pointer = (e) => {
        const id = playerAt(board, final, e.clientX, e.clientY, TRACK.hitRadius);
        if (id) { e.preventDefault(); toggle(id); }
      };
      const key = (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        const id = e.target.closest?.(".bp")?.dataset.id;
        if (id) { e.preventDefault(); toggle(id); }
      };
      const confirm = () => { if (picks.length === TRACK.targets) { detach(); if (alive) resolve([...picks]); } };
      board.svg.addEventListener("pointerdown", pointer);
      board.svg.addEventListener("keydown", key);
      ui.confirm.addEventListener("click", confirm);
      detach = () => {
        board.svg.removeEventListener("pointerdown", pointer);
        board.svg.removeEventListener("keydown", key);
        ui.confirm.removeEventListener("click", confirm);
        detach = null;
      };
      update();
    });
  }

  const waitForNext = () => new Promise((resolve) => {
    ui.next.addEventListener("click", () => alive && resolve(), { once: true });
  });

  async function run() {
    for (let i = 0; i < TRACK.rounds; i++) {
      const round = makeRound(TRACK, i);
      const last = i === TRACK.rounds - 1;
      const fast = i > 0;
      ui.round.textContent = `Round ${i + 1} of ${TRACK.rounds}${fast ? " · faster" : ""}`;
      ui.result.hidden = true;
      ui.picker.hidden = true;
      ui.play.classList.remove("is-revealed");

      // 1. Mark the three targets
      drawPlayers(board, round.players.map((p) => ({ ...p, ...positionsAt(round, 0)[p.id] })));
      setPhase("mark");
      for (const id of round.targets) markPlayer(board, id, "is-target");
      timerBar(TRACK.markMs);
      await wait(TRACK.markMs);
      for (const id of round.targets) markPlayer(board, id, "is-target", false);
      await wait(TRACK.fadeMs);

      // 2. Everyone runs
      setPhase("move");
      await runAll(round);

      // 3. Freeze and pick three
      setPhase("pick");
      setTappable(board, true);
      ui.picker.hidden = false;
      const shownAt = performance.now();
      const picks = await pickThree(round);
      const timeMs = performance.now() - shownAt;
      setTappable(board, false);
      ui.picker.hidden = true;

      // 4. Replay on the frozen picture
      const grade = gradeRound(round, picks, TRACK);
      grades.push(grade);
      const line = feedbackLine(grade, fast);
      for (const p of round.players) {
        const target = round.targets.includes(p.id), picked = picks.includes(p.id);
        markPlayer(board, p.id, "is-pick", false);
        if (target && picked) { markPlayer(board, p.id, "is-found"); markPlayer(board, p.id, "is-pick"); }
        else if (target) markPlayer(board, p.id, "is-missed");
        else if (picked) { markPlayer(board, p.id, "is-wrong"); markPlayer(board, p.id, "is-pick"); }
        else markPlayer(board, p.id, "is-dim");
      }
      const found = grade.found.length;
      setPhase("reveal");
      ui.play.classList.add("is-revealed");
      ui.phase.textContent = `${found} of ${TRACK.targets}`;
      ui.prompt.textContent = found === TRACK.targets ? "All tracked." : found === 0 ? "Lost them." : `${found} of ${TRACK.targets} tracked.`;
      ui.line.textContent = line;
      ui.time.textContent = `Picked in ${(timeMs / 1000).toFixed(1)} s`;
      ui.key.hidden = found === TRACK.targets;
      ui.next.textContent = last ? "See your points" : "Next round · faster";
      ui.result.hidden = false;
      ui.next.focus({ preventScroll: true });
      rows.push({ ok: found === TRACK.targets, label: `Round ${i + 1}${fast ? " · faster" : ""}`, line, aside: `${found} of ${TRACK.targets}` });
      await waitForNext();
    }
    const found = grades.reduce((n, g) => n + g.found.length, 0);
    const total = TRACK.targets * TRACK.rounds;
    onDone({
      points: scoreTrack(grades),
      tally: `${found} of ${total} tracked`,
      sub: `You tracked ${found} of ${total} runners. Time is shown, not scored.`,
      rows,
    });
  }

  run();

  return () => {
    alive = false;
    for (const t of timers) clearTimeout(t);
    cancelAnimationFrame(raf);
    if (detach) detach();
  };
}
