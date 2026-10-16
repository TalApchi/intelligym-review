// The flat "tactics board" used by the challenges: the same grass, markings and
// colours as the landing pitch, but seen straight from above (no camera tilt),
// so a tap lands exactly where the finger is.

import { PITCH } from "./scene.js";
import { el, drawGrass, drawMarkings } from "./pitch.js";

export const BOARD_R = 1.8; // player disc radius in metres, a little bigger than the landing for tapping

const TEAM_LABEL = { home: "Your", away: "Their" };

export function buildBoard(svg) {
  svg.replaceChildren();
  svg.setAttribute("viewBox", `-2 -3.5 ${PITCH.width + 4} ${PITCH.depth + 5}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const defs = el("defs", {}, svg);
  const arrow = el("marker", { id: "board-arrow", viewBox: "0 0 10 10", refX: "7", refY: "5", markerWidth: "3.2", markerHeight: "3.2", orient: "auto-start-reverse" }, defs);
  el("path", { d: "M0 1 L9 5 L0 9 z", class: "board-arrowhead" }, arrow);
  const red = el("marker", { id: "board-arrow-red", viewBox: "0 0 10 10", refX: "7", refY: "5", markerWidth: "3.2", markerHeight: "3.2", orient: "auto-start-reverse" }, defs);
  el("path", { d: "M0 1 L9 5 L0 9 z", class: "board-arrowhead--red" }, red);
  for (const kind of ["run", "press"]) {
    const m = el("marker", { id: `board-arrow-${kind}`, viewBox: "0 0 10 10", refX: "7", refY: "5", markerWidth: "3.2", markerHeight: "3.2", orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0 1 L9 5 L0 9 z", class: `board-arrowhead--${kind}` }, m);
  }

  drawGrass(PITCH, svg);
  drawMarkings(PITCH, svg);
  const cues = el("g", { class: "board-cues" }, svg);
  const marks = el("g", { class: "board-marks" }, svg);
  const layer = el("g", { class: "board-players" }, svg);
  return { svg, cues, marks, layer, nodes: new Map(), ball: null };
}

// Draws (or redraws) every player at its position. Opponents first, so ours sit on top.
export function drawPlayers(board, players) {
  board.layer.replaceChildren();
  board.nodes.clear();
  const ordered = [...players.filter((p) => p.team === "away"), ...players.filter((p) => p.team === "home")];
  for (const p of ordered) {
    const g = el("g", {
      class: `bp ${p.team}`,
      transform: `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`,
      role: "button",
      "aria-label": `${TEAM_LABEL[p.team]} ${p.role}`,
      "data-id": p.id,
    }, board.layer);
    el("ellipse", { cx: 0.35, cy: 0.6, rx: BOARD_R * 1.05, ry: BOARD_R * 0.8, class: "bp-shadow" }, g);
    el("circle", { r: BOARD_R + 1.15, class: "bp-answer" }, g);
    el("circle", { r: BOARD_R + 1.15, class: "bp-pick" }, g);
    el("circle", { r: BOARD_R + 1.15, class: "bp-target" }, g);
    el("circle", { r: BOARD_R, class: "bp-body" }, g);
    el("circle", { r: BOARD_R, class: "bp-rim" }, g);
    el("path", { d: "M-0.85 0.05 L-0.25 0.65 L0.9 -0.65", class: "bp-glyph bp-check" }, g);
    el("path", { d: "M-0.6 -0.6 L0.6 0.6 M0.6 -0.6 L-0.6 0.6", class: "bp-glyph bp-cross" }, g);
    board.nodes.set(p.id, g);
  }
}

// Turns keyboard focus on or off for the players (on only while answering).
export function setTappable(board, on) {
  board.svg.classList.toggle("is-tappable", on);
  for (const g of board.nodes.values()) {
    if (on) g.setAttribute("tabindex", "0");
    else g.removeAttribute("tabindex");
  }
}

// Which player a tap or click meant: the nearest one within `hitRadius` metres.
// The radius never shrinks below 22 px on screen, so every target is at least 44 px wide.
export function playerAt(board, players, clientX, clientY, hitRadius) {
  const ctm = board.svg.getScreenCTM();
  if (!ctm) return null;
  const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  const pxPerMetre = ctm.a;
  const radius = Math.max(hitRadius, 22 / pxPerMetre);
  let best = null, bestD = Infinity;
  for (const p of players) {
    const d = Math.hypot(p.x - pt.x, p.y - pt.y);
    if (d < bestD) { best = p; bestD = d; }
  }
  return best && bestD <= radius ? best.id : null;
}

export function markPlayer(board, id, cls, on = true) {
  board.nodes.get(id)?.classList.toggle(cls, on);
}

// Moves players without redrawing them (used every animation frame).
// `positions` maps id -> {x, y}.
export function placePlayers(board, positions) {
  for (const [id, q] of Object.entries(positions)) {
    board.nodes.get(id)?.setAttribute("transform", `translate(${q.x.toFixed(2)} ${q.y.toFixed(2)})`);
  }
}

// The replay: a dashed ghost where the player was and an arrow to where they are now.
export function showMove(board, from, to) {
  board.marks.replaceChildren();
  el("circle", { cx: from.x, cy: from.y, r: BOARD_R, class: "board-ghost" }, board.marks);
  const dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const gap = BOARD_R + 0.1, endGap = BOARD_R + 1.3; // ghost edge -> just outside the answer ring
  el("line", {
    x1: from.x + ux * gap, y1: from.y + uy * gap,
    x2: to.x - ux * endGap, y2: to.y - uy * endGap,
    class: "board-move", "marker-end": "url(#board-arrow)",
  }, board.marks);
}

// A dashed arrow from one point to another, e.g. the preview of a chosen pass.
// `cls` picks the style ("board-plan" = red, the visitor's own plan).
export function showArrow(board, from, to, cls = "board-plan", startGap = BOARD_R + 1.4, endGap = 0.8) {
  board.marks.replaceChildren();
  const dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  el("line", {
    x1: from.x + ux * startGap, y1: from.y + uy * startGap,
    x2: to.x - ux * endGap, y2: to.y - uy * endGap,
    class: cls, "marker-end": "url(#board-arrow-red)",
  }, board.marks);
  el("circle", { cx: to.x, cy: to.y, r: 0.9, class: `${cls}-end` }, board.marks);
}

// The ball, drawn above the players. `lift` (0..1) raises it for a lofted pass:
// the ball grows and its shadow drops away.
export function drawBall(board) {
  const g = el("g", { class: "board-ball" }, board.svg);
  const shadow = el("ellipse", { rx: 0.8, ry: 0.5, class: "board-ball__shadow" }, g);
  const ball = el("circle", { r: 0.9, class: "board-ball__ball" }, g);
  board.ball = { g, shadow, ball };
  return board.ball;
}

export function placeBall(board, q) {
  const { shadow, ball } = board.ball;
  const lift = q.lift || 0;
  shadow.setAttribute("cx", q.x.toFixed(2)); shadow.setAttribute("cy", (q.y + 0.5).toFixed(2));
  shadow.setAttribute("opacity", (0.55 - lift * 0.35).toFixed(2));
  ball.setAttribute("cx", q.x.toFixed(2)); ball.setAttribute("cy", (q.y - lift * 3).toFixed(2));
  ball.setAttribute("r", (0.9 + lift * 0.6).toFixed(2));
}

// Movement already under way in a frozen picture: our runs (chalk) and their pressure (slate).
// `cues` is [{ from: {x, y}, to: {x, y}, team: "home" | "away" }]. Stays while the visitor
// previews options (those use the marks layer); clearCues() removes it.
export function showCues(board, cues) {
  board.cues.replaceChildren();
  for (const c of cues) {
    const kind = c.team === "home" ? "run" : "press";
    const dx = c.to.x - c.from.x, dy = c.to.y - c.from.y, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const gap = Math.min(BOARD_R + 0.5, len / 2);
    el("line", {
      x1: c.from.x + ux * gap, y1: c.from.y + uy * gap, x2: c.to.x - ux * 0.3, y2: c.to.y - uy * 0.3,
      class: `board-cue board-cue--${kind}`, "marker-end": `url(#board-arrow-${kind})`,
    }, board.cues);
  }
}

export function clearCues(board) {
  board.cues.replaceChildren();
}

export function clearMarks(board) {
  board.marks.replaceChildren();
}
