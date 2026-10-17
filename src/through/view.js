// "Through ball" on the board: draws a move at any moment and plays it, live or scripted.
// Shared by challenge 5 (through/play.js) and the playground (playground/through-play.js).

import { passAt, ballStart } from "./logic.js";
import { drawPlayers, markPlayer, placePlayers, placeBall, showArrow, BOARD_R } from "../board.js";
import { el } from "../pitch.js";

// Draws everyone at t = 0: you (red ring), the runner (chalk ring and a "Runner" label).
export function setupMove(board, m) {
  const at = (f) => f(0);
  drawPlayers(board, [
    { id: "you", role: "you, on the ball", ...at(m.youAt), team: "home" },
    { id: "runner", role: `${m.runnerRole}, the runner`, ...at(m.runnerAt), team: "home" },
    ...m.teammates.map((p) => ({ id: p.id, role: p.role, ...at(p.at), team: "home" })),
    ...m.defenders.map((d) => ({ id: d.id, role: d.role, ...at(d.at), team: "away" })),
  ]);
  markPlayer(board, "you", "is-carrier");
  markPlayer(board, "runner", "is-target");
  board.svg.classList.add("tb");
  const notes = el("g", { class: "tb-notes" }, board.svg);
  const tag = el("text", { x: 0, y: 0, class: "tb-runner" }, notes);
  tag.textContent = "Runner";
  const view = { board, m, tag };
  drawAt(view, 0, null);
  return view;
}

// Everyone where they are at time t, the ball included. `res` is the pass, once released.
export function drawAt(view, t, res) {
  const { board, m, tag } = view;
  const pos = { you: m.youAt(t), runner: m.runnerAt(t) };
  for (const p of m.teammates) pos[p.id] = p.at(t);
  for (const d of m.defenders) pos[d.id] = d.at(t);
  placePlayers(board, pos);
  tag.setAttribute("x", pos.runner.x.toFixed(2));
  tag.setAttribute("y", (pos.runner.y - BOARD_R - 1.4).toFixed(2));
  let ball;
  if (!res || t < res.tr) ball = ballStart(m, t);
  else if (t <= res.t) ball = res.ballAtT(t);
  else {
    // after the moment of truth the ball goes with whoever got it
    const who = res.kind === "through" ? pos.runner : pos[res.by.id];
    ball = { x: who.x + 0.6, y: who.y - BOARD_R + 0.2 };
  }
  placeBall(board, ball);
}

// The moment the ball is released: the aim line, and a dashed ghost where the runner was.
export function showRelease(view, res) {
  showArrow(view.board, res.from, res.to, "board-plan", 1, 0.8);
  const r = view.m.runnerAt(res.tr);
  el("circle", { cx: r.x, cy: r.y, r: BOARD_R, class: "board-ghost" }, view.board.marks);
}

export function markResult(view, res) {
  if (!res || res === "missed") return;
  if (res.kind === "through") markPlayer(view.board, "runner", "is-found");
  else markPlayer(view.board, res.by.id, "is-wrong");
}

export const AFTER = 0.35; // s the picture keeps running after the ball arrives or is cut out

// Plays the move from time `from` at `speed` (1 = real time).
// Scripted: the ball is released at `release` (a number). Live: release = null, and the
// caller's pass() releases it at the current moment. `alive()` false stops it.
// Returns { pass, done } where done resolves with the pass result, "missed", or false.
export function playMove(view, { release = null, speed = 1, from = 0, onTime, alive = () => true } = {}) {
  const m = view.m;
  let res = release === null ? null : passAt(m, release);
  let shown = false, now = from, raf = 0;
  const done = new Promise((resolve) => {
    const start = performance.now();
    const tick = (clock) => {
      if (!alive()) return resolve(false);
      now = from + ((clock - start) / 1000) * speed;
      onTime?.(now, res);
      if (res && !shown && now >= res.tr) { shown = true; showRelease(view, res); }
      drawAt(view, now, res && now >= res.tr ? res : null);
      if (res && now >= res.t + AFTER) return resolve(res);
      if (!res && now >= m.timeLimit) return resolve("missed");
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  });
  return {
    pass() { if (!res && now < m.timeLimit) res = passAt(m, now); return res; },
    stop() { cancelAnimationFrame(raf); },
    done,
  };
}
