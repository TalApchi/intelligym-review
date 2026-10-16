// "Spot the change": the rules, with no DOM. Everything here is a pure function,
// so it can be tested in Node (site/tests/spot.test.mjs).

import { PITCH } from "../scene.js";

// A small seeded random generator (mulberry32). Same seed, same rounds: handy for tests.
// The game passes Math.random instead, so every play is different.
export function seededRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function inBounds(p, margin) {
  return p.x >= margin && p.x <= PITCH.width - margin && p.y >= margin && p.y <= PITCH.depth - margin;
}

// The selection rules for the moved player's new spot. Returns true when `to` is allowed.
export function isValidMove(players, moverId, to, cfg) {
  const mover = players.find((p) => p.id === moverId);
  const d = dist(mover, to);
  if (d < cfg.moveMin || d > cfg.moveMax) return false;
  if (Math.abs(to.x - mover.x) < cfg.minAxisChange) return false;
  if (Math.abs(to.y - mover.y) < cfg.minAxisChange) return false;
  if (!inBounds(to, cfg.edgeMargin)) return false;
  return players.every((p) => p.id === moverId || dist(p, to) >= cfg.clearance);
}

// Places one formation with a small random nudge. Retries until nobody is crowded.
function placeFormation(formation, cfg, rng) {
  const take = (list, n, team) => list.slice(0, n).map((p) => ({ ...p, team }));
  const base = [...take(formation.home, cfg.homeCount, "home"), ...take(formation.away, cfg.awayCount, "away")];
  for (let attempt = 0; attempt < 50; attempt++) {
    const players = base.map((p) => ({
      ...p,
      x: p.x + (rng() * 2 - 1) * cfg.jitter,
      y: p.y + (rng() * 2 - 1) * cfg.jitter,
    }));
    const crowded = players.some((a, i) => players.some((b, j) => j > i && dist(a, b) < cfg.clearance));
    if (!crowded) return players;
  }
  return base; // the hand-placed spots are always spaced out
}

// Picks who moves and where. Tries random players and directions until the rules pass.
function pickMove(players, cfg, rng) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const mover = players[Math.floor(rng() * players.length)];
    const d = cfg.moveMin + rng() * (cfg.moveMax - cfg.moveMin);
    const angle = rng() * Math.PI * 2;
    const to = { x: mover.x + Math.cos(angle) * d, y: mover.y + Math.sin(angle) * d };
    if (isValidMove(players, mover.id, to, cfg)) return { moverId: mover.id, from: { x: mover.x, y: mover.y }, to };
  }
  throw new Error("Spot the change: no valid move found. Check the formation spacing and SPOT settings.");
}

// Builds all rounds up front: a different formation each round where possible.
export function makeRounds(formations, cfg, rng = Math.random) {
  const order = [...formations];
  for (let i = order.length - 1; i > 0; i--) { // Fisher-Yates shuffle
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const rounds = [];
  for (let i = 0; i < cfg.rounds; i++) {
    const formation = order[i % order.length];
    const before = placeFormation(formation, cfg, rng);
    const move = pickMove(before, cfg, rng);
    const after = before.map((p) => (p.id === move.moverId ? { ...p, ...move.to } : p));
    rounds.push({ formation: formation.id, before, after, ...move });
  }
  return rounds;
}

// Plain-language description of the move, e.g.
//   { who: "their holding midfielder", how: "7 m deeper and wider" }
// Our team attacks up the screen, opponents attack down it.
export function describeMove(player, from, to) {
  const metres = Math.round(dist(from, to));
  const upScreen = to.y < from.y;
  const forward = player.team === "home" ? upScreen : !upScreen;
  const centre = PITCH.width / 2;
  const inside = Math.abs(to.x - centre) < Math.abs(from.x - centre);
  return {
    who: `${player.team === "home" ? "your" : "their"} ${player.role}`,
    how: `${metres} m ${forward ? "forward" : "deeper"} and ${inside ? "inside" : "wider"}`,
  };
}

// The one feedback sentence after a round. `pickedId` is null when time ran out.
export function feedbackLine(round, pickedId) {
  const mover = round.after.find((p) => p.id === round.moverId);
  const { who, how } = describeMove(mover, round.from, round.to);
  if (pickedId === round.moverId) return `Right: ${who} moved ${how}.`;
  if (pickedId === null) return `Time's up. This is who moved: ${who}, ${how}.`;
  return `That one stayed put. This is who moved: ${who}, ${how}.`;
}

// Challenge points, 0 to 100: each round is worth an equal share. Time is not scored.
export function scoreSpot(answers) {
  if (answers.length === 0) return 0;
  const correct = answers.filter((a) => a.correct).length;
  return Math.round((100 * correct) / answers.length);
}
