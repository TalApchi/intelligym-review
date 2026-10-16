// Small drawing and input helpers shared by the four prototypes.

import { playerAt } from "../board.js";
import { el } from "../pitch.js";

export const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
export const lerp = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const newSeed = () => 1 + Math.floor(Math.random() * 1e6);

// Taps (and clicks) on the board, resolved to the nearest of `targets` within `hitRadius` m.
// Returns a function that removes the listener.
export function onTap(board, targets, hitRadius, cb) {
  const handler = (e) => {
    const id = playerAt(board, targets(), e.clientX, e.clientY, hitRadius);
    if (id) cb(id);
  };
  board.svg.addEventListener("pointerup", handler);
  return () => board.svg.removeEventListener("pointerup", handler);
}

// A layer above everything else on the board, for notes drawn by a prototype.
export function overlay(board, cls = "pg-overlay") {
  return el("g", { class: cls }, board.svg);
}

export function label(parent, x, y, text, cls = "pg-label") {
  const t = el("text", { x, y, class: cls }, parent);
  t.textContent = text;
  return t;
}

export { el };
