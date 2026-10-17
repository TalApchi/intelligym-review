// "Scan before receiving": the rules, with no DOM. Pure functions, tested in
// site/tests/scan.test.mjs. Which pass is best in each situation is a DRAFT (situations.js,
// approved: false) until Omri reviews it; the thresholds below are for consistency checks
// and the generated sentences, not football rules.
//
// Coordinates are metres on the attacking half, as everywhere else: y = 0 is the
// opponents' goal line at the top of the screen, y = 52.5 is halfway.

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });

// Distance from point p to the segment a-b, and how far along it (0..1) the nearest point is.
export function toSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, len2 = dx * dx + dy * dy || 1;
  const u = Math.min(1, Math.max(0, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return { d: dist(p, lerp(a, b, u)), u };
}

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

// Draft rank of a target, as each situation sets it: `best`, the others in `ok`, the rest
// riskier. Playing back to the passer ("p") is ranked like any other pass, from that
// situation's picture; there is no general rule about passing back.
export function scanRank(s, id) {
  if (id === s.best) return "best";
  if (s.ok.includes(id)) return "reasonable";
  return "poor";
}

// The sentence shown after a pass: from the picture (or Omri's note), for every target alike.
export function scanFeedback(s, id) {
  return scanNote(s, id);
}

// The teammates a player can pass to: the passer (back where it came from) and the rest.
export const targetsOf = (s) => [s.passer, ...s.home];

// Points for one pass (PROVISIONAL, like Tactical choice): draft best, reasonable, weak.
export const scorePass = (s, id, points) => points[scanRank(s, id)];

// The challenge score: the average of the situations' points, rounded.
export const scoreScan = (pts) => (pts.length ? Math.round(pts.reduce((a, b) => a + b, 0) / pts.length) : 0);
