// Prototype playground: the rules, with no DOM. Pure functions, tested in
// site/tests/playground.test.mjs. These are EXPERIMENTS for Tal to compare, not approved
// designs: nothing here is scored, and none of it is part of the main experience.
//
// Coordinates are metres on the attacking half, as everywhere else: y = 0 is the
// opponents' goal line at the top of the screen, y = 52.5 is halfway.

import { seededRng } from "../spot/logic.js";

export { seededRng };

export const BALL_SPEED = 14;   // m/s, the same for every pass in every prototype
// A defender touches the ball when the ball's centre comes within REACH of theirs. On the board
// a player disc has a 1.8 m radius and the ball 0.9 m, so REACH = 2.9 means "the shapes touch,
// give or take a toe". Explanations quote the space between the shapes (EDGE), which is what
// the player can see.
export const REACH = 2.9;
const EDGE = 1.8 + 0.9;
export const BEAT = 0.5;        // s, one mark on the "Same clock" prototype's lanes

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
const between = (rng, lo, hi) => lo + (hi - lo) * rng();

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

// Share of release times over `span` seconds that get through: used to check a
// situation is neither trivial nor impossible.
export function openShare(from, to, defenders, span, samples = 120) {
  let ok = 0;
  for (let i = 0; i < samples; i++) if (simulatePass(from, to, (span * i) / samples, defenders, 1 / 120).through) ok++;
  return ok / samples;
}

// A defender shuttling at constant speed between two points (a triangle wave).
export function shuttle(a, b, speed, phase) {
  const len = dist(a, b);
  return (t) => {
    const u = ((t * speed) / len + phase) % 2;
    return lerp(a, b, u < 1 ? u : 2 - u);
  };
}

// Prototype "Same clock": you, a teammate up the pitch, and 1–2 defenders shuttling
// across the lane on visible rails. Both the lane and the rails carry a mark every BEAT
// seconds (ball marks far apart, defender marks close together), so the player can
// compare "beats to get there" without knowing the ball's speed in m/s.
export function makeClockRound(seed) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const rng = seededRng(seed * 7919 + attempt);
    const you = { x: between(rng, 28, 40), y: between(rng, 44, 47) };
    const mate = { x: between(rng, 20, 48), y: between(rng, 12, 19) };
    const count = rng() < 0.5 ? 1 : 2;
    const rails = [];
    const fractions = count === 1 ? [between(rng, 0.4, 0.62)] : [between(rng, 0.3, 0.42), between(rng, 0.6, 0.72)];
    for (let i = 0; i < count; i++) {
      const c = lerp(you, mate, fractions[i]);
      const half = between(rng, 6, 9);
      const off = between(rng, -2, 2); // the rail is not always centred on the lane
      const a = { x: c.x - half + off, y: c.y }, b = { x: c.x + half + off, y: c.y };
      rails.push({ id: `d${i + 1}`, a, b, speed: between(rng, 3.5, 5.2), phase: rng() * 2 });
    }
    const defenders = rails.map((r) => ({ id: r.id, at: shuttle(r.a, r.b, r.speed, r.phase) }));
    const share = openShare(you, mate, defenders, 8);
    const inside = rails.every((r) => r.a.x > 3 && r.b.x < 65);
    if (inside && share > 0.22 && share < 0.62) return { seed, you, mate, rails, defenders };
  }
  throw new Error("no clock round for seed " + seed);
}

// Marks every BEAT seconds along a path travelled at `speed` m/s, starting from `from`.
export function beatMarks(from, to, speed) {
  const len = dist(from, to), step = speed * BEAT, marks = [];
  for (let s = step; s < len - 0.5; s += step) marks.push(lerp(from, to, s / len));
  return marks;
}

// Explains a "Same clock" pass in beats and in the space between the shapes.
export function explainClock(round, release, result) {
  const beats = (t) => ((t - release) / BEAT).toFixed(1);
  if (result.through) {
    const miss = Math.max(0, result.closest.d - EDGE);
    return `Through. The ball needed ${beats(result.t)} marks to reach your teammate, and no defender got closer than ${miss.toFixed(1)} m to it.`;
  }
  // Compare, in marks, the ball's time to the crossing point with the defender's time to
  // get within touching distance of it.
  const rail = round.rails.find((r) => r.id === result.by);
  const at = round.defenders.find((d) => d.id === result.by).at;
  const c = lerp(round.you, round.mate, (round.you.y - rail.a.y) / (round.you.y - round.mate.y));
  const ballMarks = dist(round.you, c) / BALL_SPEED / BEAT;
  let t = release;
  while (dist(at(t), c) > REACH && t < release + 10) t += 1 / 120;
  const theirMarks = (t - release) / BEAT;
  if (theirMarks < ballMarks - 0.1) {
    return `Cut out. The ball needed ${ballMarks.toFixed(1)} marks to reach that defender's line, and the defender needed only ${theirMarks.toFixed(1)} to get there.`;
  }
  return `Cut out. ${beats(result.t)} marks after you passed, the defender reached the ball's path just as the ball got there.`;
}

// Prototype "Close gate": two defenders just in front of you sway in and out, so the gap
// between them opens and closes. The ball reaches the gap in about a quarter of a second,
// so what you see when you pass is nearly what the ball meets: no speed to learn.
export function makeGateRound(seed) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const rng = seededRng(seed * 104729 + attempt);
    const you = { x: 34, y: 45 };
    const mate = { x: between(rng, 29, 39), y: between(rng, 16, 22) };
    const gateY = between(rng, 38.6, 39.6); // 5.5–6.5 m in front of you: the ball gets there in under half a second
    const cx = 34 + (mate.x - 34) * ((you.y - gateY) / (you.y - mate.y)); // where the lane crosses the gate
    const w1 = between(rng, 1.4, 2.2), w2 = between(rng, 2.6, 3.6), p1 = rng() * 6.3, p2 = rng() * 6.3;
    const ws = between(rng, 0.7, 1.1), ps = rng() * 6.3;
    const base = between(rng, 2.6, 3.4), amp1 = between(rng, 1.8, 2.4), amp2 = between(rng, 0.6, 1.0), sway = between(rng, 0.8, 1.4);
    const gap = (t) => Math.max(0.3, base + amp1 * Math.sin(w1 * t + p1) + amp2 * Math.sin(w2 * t + p2));
    const centre = (t) => cx + sway * Math.sin(ws * t + ps);
    const left = (t) => ({ x: centre(t) - gap(t) / 2 - 1.8, y: gateY + 0.6 * Math.sin(w2 * t + p1) });
    const right = (t) => ({ x: centre(t) + gap(t) / 2 + 1.8, y: gateY - 0.6 * Math.sin(w2 * t + p1) });
    // gap(t) is the space between the two discs' edges (each disc is 1.8 m), not centre to centre
    const defenders = [{ id: "dl", at: left }, { id: "dr", at: right }];
    const share = openShare(you, mate, defenders, 8);
    if (share > 0.25 && share < 0.6) return { seed, you, mate, gateY, defenders, gapAt: (t) => dist(left(t), right(t)) - 3.6 };
  }
  throw new Error("no gate round for seed " + seed);
}

// When the ball crosses the gate line, released at `release`.
export function gateCrossing(round, release) {
  const d = round.you.y - round.gateY, total = round.you.y - round.mate.y;
  return release + (dist(round.you, round.mate) * (d / total)) / BALL_SPEED;
}

export function explainGate(round, release, result) {
  // The moment that matters: the ball reaching the gap, or touching a defender, whichever came first.
  const tc = result.through ? gateCrossing(round, release) : Math.min(result.t, gateCrossing(round, release));
  const gapNow = Math.max(0, round.gapAt(release)), gapThen = Math.max(0, round.gapAt(tc));
  const need = 2 * REACH - 3.6; // space between the two discs the ball needs to slip through untouched
  const then = `${gapThen.toFixed(1)} m when the ball got there (${gapNow.toFixed(1)} m when you passed)`;
  if (result.through) return `Through. The gap was ${then}.`;
  if (gapThen < need + 0.3) return `Cut out. The gap was ${then}. The ball needs about ${need.toFixed(1)} m to slip through untouched.`;
  return `Cut out. The gap was ${then}, wide enough, but it had drifted off your line, so a defender got a foot to it.`;
}

// ---------- Scanning ----------

const spaced = (p, others, min) => others.every((q) => dist(p, q) >= min);
const onPitch = (p, m = 3) => p.x >= m && p.x <= 68 - m && p.y >= m && p.y <= 52.5 - m;

// Prototype "Opponents vanish": you are about to receive. Four teammates are ahead of you;
// three are covered (an opponent beside them, or standing in the passing lane) and one is
// free. After the scan the opponents disappear and the teammates stay, so you tap a
// teammate you can see, but the answer depends on what you saw.
export function makeVanishRound(seed) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const rng = seededRng(seed * 15485863 + attempt);
    const you = { x: between(rng, 26, 42), y: between(rng, 33, 37) };
    const passer = { x: you.x + between(rng, -6, 6), y: 48 };
    const mates = [];
    for (let k = 0; k < 60 && mates.length < 4; k++) {
      const ang = between(rng, -2.6, -0.55); // ahead of you, from wide left round to wide right
      const r = between(rng, 12, 24);
      const p = { x: you.x + Math.cos(ang) * r, y: you.y + Math.sin(ang) * r * 0.9 };
      if (onPitch(p, 4) && spaced(p, [...mates, you, passer], 9)) mates.push(p);
    }
    if (mates.length < 4) continue;
    const free = Math.floor(rng() * 4);
    const kinds = shuffle(["marked", "marked", "lane"], rng);
    const away = [];
    let k = 0;
    mates.forEach((m, i) => {
      if (i === free) return;
      const kind = kinds[k++];
      m.kind = kind;
      if (kind === "marked") {
        // beside them (not between them and you, which would read as blocking the lane)
        const toYou = Math.atan2(you.y - m.y, you.x - m.x) + (rng() < 0.5 ? -1 : 1) * between(rng, 0.9, 1.5);
        away.push({ x: m.x + Math.cos(toYou) * 4.3, y: m.y + Math.sin(toYou) * 4.3, covers: i });
      } else {
        const p = lerp(you, m, between(rng, 0.45, 0.62));
        away.push({ x: p.x + between(rng, -0.6, 0.6), y: p.y + between(rng, -0.6, 0.6), covers: i });
      }
    });
    mates[free].kind = "free";
    // One more opponent, away from the free teammate and their lane, so counting opponents doesn't help.
    for (let j = 0; j < 40; j++) {
      const p = { x: between(rng, 6, 62), y: between(rng, 6, 30) };
      if (spaced(p, [...mates, ...away, you], 6) && dist(p, mates[free]) > 11 && toSegment(p, you, mates[free]).d > 5) { away.push({ ...p, covers: -1 }); break; }
    }
    const round = {
      seed, you, passer,
      home: mates.map((m, i) => ({ id: `m${i + 1}`, x: m.x, y: m.y, kind: m.kind })),
      away: away.map((a, i) => ({ id: `o${i + 1}`, x: a.x, y: a.y, covers: a.covers })),
    };
    if (checkVanish(round).length === 0) return round;
  }
  throw new Error("no vanish round for seed " + seed);
}

function shuffle(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// What a pass to teammate `m` meets: the nearest opponent to them, and any opponent in the lane.
export function vanishVerdict(round, m) {
  const nearest = Math.min(...round.away.map((o) => dist(o, m)));
  const lane = round.away.map((o) => ({ o, ...toSegment(o, round.you, m) })).filter((x) => x.d < 2.2 && x.u > 0.15 && x.u < 0.9);
  if (lane.length) return { kind: "lane", by: lane[0].o, text: "Cut out. An opponent was standing in that passing lane." };
  if (nearest < 6) return { kind: "marked", text: `Under pressure. An opponent was ${nearest.toFixed(0)} m from them, ready to step in.` };
  return { kind: "free", text: `Free. The nearest opponent was ${nearest.toFixed(0)} m away and the lane was clear.` };
}

// Checks a scan round is fair: exactly one free teammate, the rest really covered, clear picture.
export function checkVanish(round) {
  const problems = [];
  const all = [round.you, round.passer, ...round.home, ...round.away];
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (dist(all[i], all[j]) < 4) problems.push("players closer than 4 m");
  if (!all.every((p) => onPitch(p, 2))) problems.push("player off the pitch");
  const verdicts = round.home.map((m) => vanishVerdict(round, m).kind);
  if (verdicts.filter((v) => v === "free").length !== 1) problems.push(`free teammates: ${verdicts.join(",")}`);
  const free = round.home[verdicts.indexOf("free")];
  if (free && Math.min(...round.away.map((o) => dist(o, free))) < 9) problems.push("free teammate not clearly free");
  round.home.forEach((m, i) => { if (m.kind !== verdicts[i]) problems.push(`${m.id} meant ${m.kind}, reads ${verdicts[i]}`); });
  return problems;
}

// Prototype "Tunnel view": you have your back to goal, receiving from a teammate behind
// you. After the scan, fog covers everything except a small circle around you, and three
// arrows on the pitch give your first touch: up-left, up-right, or back to the passer.
// Opponents start outside the circle and are running at you (dashed arrows during the scan),
// so only the scan tells you which way is open.
export const TOUCHES = {
  left: { dx: -6, dy: -4.5, label: "Turn up the pitch to the left" },
  right: { dx: 6, dy: -4.5, label: "Turn up the pitch to the right" },
  back: { dx: 0, dy: 7, label: "Lay it back to the passer" },
};
export const TUNNEL_R = 8.5; // m, the circle you can still see after the scan
const RUN = 4; // m an opponent covers while you take the touch

export function makeTunnelRound(seed) {
  const answer = ["left", "right", "back"][Math.floor(seededRng(seed)() * 3)]; // chosen first, so all three come up equally
  for (let attempt = 0; attempt < 500; attempt++) {
    const rng = seededRng(seed * 2750159 + attempt);
    const you = { x: between(rng, 24, 44), y: between(rng, 28, 33) };
    const passer = { x: you.x + between(rng, -2, 2), y: you.y + 15 };
    const away = [];
    const add = (ang, r) => {
      const p = { x: you.x + Math.cos(ang) * r, y: you.y + Math.sin(ang) * r };
      if (onPitch(p, 2) && spaced(p, [...away, you, passer], 5)) away.push(p);
    };
    // Pressure comes from the two directions that are NOT the answer.
    const ANG = { left: -2.4, right: -0.74, back: Math.PI / 2 + between(rng, -0.35, 0.35) };
    for (const dir of Object.keys(ANG)) if (dir !== answer) add(ANG[dir] + between(rng, -0.3, 0.3), between(rng, 11, 14));
    // Distractors further away, so the picture isn't just "two dots"
    for (let j = 0; j < 30 && away.length < 5; j++) add(between(rng, -3.1, 0), between(rng, 18, 26));
    const runs = away.map((o) => {
      const d = dist(o, you), ux = (you.x - o.x) / d, uy = (you.y - o.y) / d;
      return { from: o, to: { x: o.x + ux * RUN, y: o.y + uy * RUN } };
    });
    const home = [];
    for (let j = 0; j < 30 && home.length < 3; j++) {
      const p = { x: between(rng, 6, 62), y: between(rng, 8, 24) };
      if (spaced(p, [...away, ...home, passer], 7) && dist(p, you) > TUNNEL_R + 3) home.push(p);
    }
    const round = { seed, you, passer, answer, away: away.map((p, i) => ({ id: `o${i + 1}`, ...p, run: runs[i].to })), home: home.map((p, i) => ({ id: `m${i + 1}`, ...p })) };
    const sp = tunnelSpace(round);
    const sorted = Object.values(sp).sort((a, b) => b - a);
    const best = Object.keys(sp).find((k) => sp[k] === sorted[0]);
    const clear = [...away, you, passer, ...home];
    let ok = best === answer && sorted[0] - sorted[1] >= 3 && sorted[0] >= 6;
    for (let i = 0; i < clear.length && ok; i++) for (let j = i + 1; j < clear.length; j++) if (dist(clear[i], clear[j]) < 4) ok = false;
    // During the scan every opponent stays outside the circle you'll keep, so the fog hides them all.
    if (ok && away.every((o) => dist(o, you) > TUNNEL_R + 1.5)) return round;
  }
  throw new Error("no tunnel round for seed " + seed);
}

// Where each first touch takes you.
export function touchTarget(round, dir) {
  const t = TOUCHES[dir];
  return { x: round.you.x + t.dx, y: round.you.y + t.dy };
}

// Space after each touch: the nearest opponent to where you end up, once they've run on.
export function tunnelSpace(round) {
  const out = {};
  for (const dir of Object.keys(TOUCHES)) {
    const t = touchTarget(round, dir);
    out[dir] = Math.min(...round.away.map((o) => dist(o.run ?? o, t)));
  }
  return out;
}

export function explainTunnel(round, dir) {
  const space = tunnelSpace(round)[dir];
  const best = Math.max(...Object.values(tunnelSpace(round)));
  if (space >= best - 0.01) return `Space. After your touch the nearest opponent was ${space.toFixed(0)} m away.`;
  return `Closed down. You took the ball towards an opponent who was running in: ${space.toFixed(0)} m away after your touch.`;
}
