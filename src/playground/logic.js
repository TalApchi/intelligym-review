// Prototype playground: the rules, with no DOM. Pure functions, tested in
// site/tests/playground.test.mjs. These are EXPERIMENTS for Tal to compare, not approved
// designs: nothing here is scored, and none of it is part of the main experience.
// The through-ball prototype's move lives in through.js.
//
// Coordinates are metres on the attacking half, as everywhere else: y = 0 is the
// opponents' goal line at the top of the screen, y = 52.5 is halfway.

import { seededRng } from "../spot/logic.js";

export { seededRng };

export const BALL_SPEED = 14;   // m/s, the same for every pass in every prototype

// A defender touches the ball when the ball's centre comes within REACH of theirs. On the board
// a player disc has a 1.8 m radius and the ball 0.9 m, so REACH = 2.9 means "the shapes touch,
// give or take a toe".
export const REACH = 2.9;

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });

// Distance from point p to the segment a-b, and how far along it (0..1) the nearest point is.
export function toSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, len2 = dx * dx + dy * dy || 1;
  const u = Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return { d: dist(p, lerp(a, b, u)), u };
}

// ---------- Passing ----------

// Where a pass released at `release` (s) is at time t: a constant-speed straight line.
export function ballAt(from, to, release, t) {
  const T = dist(from, to) / BALL_SPEED;
  const u = Math.min(1, Math.max(0, (t - release) / T));
  return lerp(from, to, u);
}

// Plays a pass against moving defenders. `defenders` is [{ id, at(t) -> {x, y} }].
// Returns whether it got through, where and when a defender touched it, and the closest
// any defender came (used to explain the outcome in metres).
export function simulatePass(from, to, release, defenders, step = 1 / 240) {
  const T = dist(from, to) / BALL_SPEED;
  let closest = { d: Infinity, id: null, t: release, ball: from, defender: null };
  for (let t = release; t <= release + T + 1e-9; t += step) {
    const ball = ballAt(from, to, release, t);
    for (const def of defenders) {
      const q = def.at(t);
      const d = dist(ball, q);
      if (d < closest.d) closest = { d, id: def.id, t, ball, defender: q };
      if (d < REACH) return { through: false, t, at: ball, by: def.id, closest, flight: T };
    }
  }
  return { through: true, t: release + T, at: to, by: null, closest, flight: T };
}

// ---------- Scan before receiving: authored situations (scan-situations.js) ----------

const ROLE = (o) => `their ${o.role}`;

// What a pass from you to target `t` meets in situation `s`: the nearest opponent to the
// target, and the opponent closest to the passing lane (ignoring the last few metres,
// where a nearby opponent counts as marking rather than blocking the lane).
export function assessTarget(s, t) {
  const len = dist(s.you, t);
  let near = { d: Infinity, o: null }, lane = { d: Infinity, o: null };
  for (const o of s.away) {
    const d = dist(o, t);
    if (d < near.d) near = { d, o };
    const seg = toSegment(o, s.you, t);
    if (seg.u > 0.08 && seg.u * len < len - 3.5 && seg.d < lane.d) lane = { d: seg.d, o };
  }
  return { near: near.d, nearOpp: near.o, lane: lane.d, laneOpp: lane.o, len };
}

// The draft thresholds the situations are written to (PROVISIONAL, for consistency checks
// and the generated sentences, not a football rule): blocked lane < 2.2 m, marked < 5 m,
// open = nearest 7 m+ and lane 3 m+.
export const SCAN_RULE = { lane: 2.2, marked: 5, openNear: 7, openLane: 3 };

export function scanState(s, t) {
  const a = assessTarget(s, t);
  if (a.lane < SCAN_RULE.lane) return { kind: "lane", a };
  if (a.near < SCAN_RULE.marked) return { kind: "marked", a };
  if (a.near >= SCAN_RULE.openNear && a.lane >= SCAN_RULE.openLane) return { kind: "open", a };
  return { kind: "tight", a };
}

// One factual sentence about a target, from the picture (Omri can replace it via `notes`).
export function scanNote(s, id) {
  if (s.notes?.[id]) return s.notes[id];
  const t = id === s.passer.id ? s.passer : s.home.find((m) => m.id === id);
  const { kind, a } = scanState(s, t);
  const m = (d) => `${Math.round(d)} m`;
  if (kind === "lane") return `${cap(ROLE(a.laneOpp))} was standing in the passing lane.`;
  if (kind === "marked") return `${cap(ROLE(a.nearOpp))} was ${m(a.near)} away, close enough to step in.`;
  if (kind === "tight") return a.lane < SCAN_RULE.openLane
    ? `Possible, but ${ROLE(a.laneOpp)} was close to the passing lane.`
    : `Possible, but ${ROLE(a.nearOpp)} was ${m(a.near)} away.`;
  return `Open: the nearest opponent was ${m(a.near)} away and the lane was clear.`;
}
const cap = (t) => t[0].toUpperCase() + t.slice(1);

// Draft rank of a target. Playing back to the passer is always possible and usually safe,
// so unless a situation makes it the best, it counts as reasonable.
export function scanRank(s, id) {
  if (id === s.best) return "best";
  if (s.ok.includes(id) || id === s.passer.id) return "reasonable";
  return "poor";
}

// The sentence shown after a pass: generated from the picture, except back to the passer.
export function scanFeedback(s, id) {
  if (s.notes?.[id]) return s.notes[id];
  if (id === s.passer.id && id !== s.best) return "Safe: it goes back to where the ball came from, but the chance to play forward is gone.";
  return scanNote(s, id);
}
