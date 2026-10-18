// "Tracking runners": the rules, with no DOM. Pure functions, tested in
// site/tests/track.test.mjs. Movement is a pure function of time, like the landing:
// positionAt(path, progress) always gives the same answer for the same input.

import { PITCH } from "../scene.js";

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function inBounds(p, margin) {
  return p.x >= margin && p.x <= PITCH.width - margin && p.y >= margin && p.y <= PITCH.depth - margin;
}

function randomSpot(cfg, rng) {
  const m = cfg.edgeMargin;
  return { x: m + rng() * (PITCH.width - 2 * m), y: m + rng() * (PITCH.depth - 2 * m) };
}

// Spots that are all at least `cfg.spacing` apart.
function spacedSpots(n, cfg, rng) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const spots = [];
    for (let tries = 0; spots.length < n && tries < 2000; tries++) {
      const s = randomSpot(cfg, rng);
      if (spots.every((o) => dist(o, s) >= cfg.spacing)) spots.push(s);
    }
    if (spots.length === n) return spots;
  }
  throw new Error("Tracking runners: could not space the players. Lower TRACK.spacing.");
}

// One run: `legs` steps of equal length from `start`, turning at most ~100° each time
// so it reads as a run, not a jitter. Total length = speed x time.
function randomRun(start, length, cfg, rng) {
  const step = length / cfg.legs;
  for (let attempt = 0; attempt < 400; attempt++) {
    const points = [start];
    let heading = rng() * Math.PI * 2;
    let ok = true;
    for (let i = 0; i < cfg.legs; i++) {
      heading += (rng() * 2 - 1) * 1.75;
      const last = points[points.length - 1];
      const next = { x: last.x + Math.cos(heading) * step, y: last.y + Math.sin(heading) * step };
      if (!inBounds(next, cfg.edgeMargin)) { ok = false; break; }
      points.push(next);
    }
    if (ok) return points;
  }
  return null;
}

// Smooth position along a run at progress u (0..1), Catmull-Rom through the turning points.
// Each leg has the same length and the same share of time, so the speed is steady.
export function positionAt(points, u) {
  const legs = points.length - 1;
  const f = Math.min(Math.max(u, 0), 1) * legs;
  const i = Math.min(Math.floor(f), legs - 1);
  const t = f - i;
  const p0 = points[Math.max(i - 1, 0)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(i + 2, legs)];
  const cr = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  return { x: cr(p0.x, p1.x, p2.x, p3.x), y: cr(p0.y, p1.y, p2.y, p3.y) };
}

// Builds one round: players with their runs, and which of them are the targets.
// Round index 0 is the base speed; each later round is `speedUp` faster.
export function makeRound(cfg, roundIndex, rng = Math.random) {
  const speed = cfg.speed * (1 + cfg.speedUp * roundIndex);
  const length = speed * (cfg.moveMs / 1000);
  for (let attempt = 0; attempt < 200; attempt++) {
    const starts = spacedSpots(cfg.players, cfg, rng);
    const runs = starts.map((s) => randomRun(s, length, cfg, rng));
    if (runs.some((r) => r === null)) continue;
    const ends = runs.map((r) => r[r.length - 1]);
    const spaced = ends.every((a, i) => ends.every((b, j) => j <= i || dist(a, b) >= cfg.spacing));
    if (!spaced) continue;
    const ids = runs.map((_, i) => `t${i + 1}`);
    const shuffled = [...ids];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return {
      speed,
      targets: shuffled.slice(0, cfg.targets),
      players: runs.map((points, i) => ({ id: ids[i], team: "home", role: `teammate ${i + 1}`, points })),
    };
  }
  throw new Error("Tracking runners: no valid round found. Check TRACK settings.");
}

// Where everyone is at progress u (0..1): { id: {x, y} }.
export function positionsAt(round, u) {
  return Object.fromEntries(round.players.map((p) => [p.id, positionAt(p.points, u)]));
}

// Did this player pass within `distance` of anyone else while moving?
export function crossedPaths(round, id, distance, samples = 160) {
  const me = round.players.find((p) => p.id === id);
  for (let k = 1; k < samples; k++) {
    const u = k / samples;
    const a = positionAt(me.points, u);
    for (const p of round.players) {
      if (p.id !== id && dist(a, positionAt(p.points, u)) < distance) return true;
    }
  }
  return false;
}

// Grades one round's picks.
export function gradeRound(round, picks, cfg) {
  const found = picks.filter((id) => round.targets.includes(id));
  const wrong = picks.filter((id) => !round.targets.includes(id));
  const missed = round.targets.filter((id) => !picks.includes(id));
  const lostInCrossing = missed.filter((id) => crossedPaths(round, id, cfg.crossDistance)).length;
  return { found, wrong, missed, lostInCrossing };
}

const WORDS = ["none", "one", "two", "three", "four", "five"];
const word = (n) => WORDS[n] ?? String(n);

// The one feedback sentence after a round. Only says "crossed paths" when it happened.
export function feedbackLine(grade, fast) {
  const total = grade.found.length + grade.missed.length;
  const held = total === 2 ? "both" : `all ${word(total)}`;
  if (grade.missed.length === 0) return fast ? `You held ${held}, even at speed.` : `You held ${held}.`;
  const lost = grade.missed.length === 1 ? "Lost one" : grade.missed.length === 2 && total === 2 ? "Lost both" : `Lost ${word(grade.missed.length)}`;
  if (grade.lostInCrossing === grade.missed.length) {
    return `${lost} where ${grade.missed.length === 1 ? "they" : "they each"} crossed paths with a teammate.`;
  }
  if (grade.lostInCrossing > 0) return `${lost}. ${grade.lostInCrossing === 1 ? "One of them" : "Some of them"} crossed paths with a teammate.`;
  return `${lost} on an open run, with nobody close by.`;
}

// Challenge points, 0 to 100: each target found is worth an equal share.
export function scoreTrack(grades) {
  const found = grades.reduce((n, g) => n + g.found.length, 0);
  const total = grades.reduce((n, g) => n + g.found.length + g.missed.length, 0);
  return total ? Math.round((100 * found) / total) : 0;
}
