// "Passing window: Through ball", the rules (no DOM). Tested in site/tests/playground.test.mjs.
//
// A developing move on a populated half pitch. You carry the ball forward slowly; one
// teammate, the runner, makes a run in behind; defenders react at the same time: their
// midfielder screens the lane early on, the runner's marker chases, a covering centre-back
// slides across, and the keeper comes out once the runner gets close. You choose WHEN to
// pass. The ball always travels at BALL_SPEED and is aimed where the runner WILL be when
// it arrives (leading them into space), so timing is the whole decision.
//
// Everything is a pure function of time t (seconds since the move started), so the game,
// the replay and the "what if you passed here" timeline all compute the same outcome.

import { BALL_SPEED, REACH, seededRng } from "./logic.js";
import { positionAt } from "../track/logic.js";

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
const clamp01 = (u) => Math.min(1, Math.max(0, u));
const smooth = (u) => { const k = clamp01(u); return k * k * (3 - 2 * k); };
const between = (rng, lo, hi) => lo + (hi - lo) * rng();

export const KEEPER_REACH = 3.4; // hands: a little further than a defender's foot
export const STEP = 1 / 120;     // s, simulation step
export const COVERED = 2.6;      // m: a defender this close to where the ball meets the runner wins it

// A player who moves from `a` to `b` between t0 and t1, easing in and out, then stays.
const move = (a, b, t0, t1) => (t) => lerp(a, b, smooth((t - t0) / (t1 - t0)));
// Several moves one after another: [[point, time], ...]
const keyframes = (frames) => (t) => {
  if (t <= frames[0][1]) return frames[0][0];
  for (let i = 1; i < frames.length; i++) {
    if (t <= frames[i][1]) return lerp(frames[i - 1][0], frames[i][0], smooth((t - frames[i - 1][1]) / (frames[i][1] - frames[i - 1][1])));
  }
  return frames[frames.length - 1][0];
};

// Builds a move from a seed. `side` +1 = the runner attacks the right channel, -1 the left.
export function makeMove(seed, { practice = false } = {}) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const rng = seededRng(seed * 6151 + attempt);
    const side = rng() < 0.5 ? -1 : 1;
    const X = (dx) => 34 + side * dx; // mirror helper: dx measured towards the runner's side
    const P = (dx, y) => ({ x: X(dx), y });

    // The runner: a short check towards the ball, then a curved sprint in behind.
    const runnerRole = "winger";
    const start = P(between(rng, 16, 19), between(rng, 23, 26));
    const check = { x: start.x + side * -1, y: start.y + 1.6 };
    const end = P(between(rng, 6, 9), between(rng, 4, 6));
    const bend = lerp(start, end, 0.45);
    const mid = { x: bend.x + side * between(rng, 1.5, 3), y: bend.y };
    const tCheck = between(rng, 0.7, 1.1);     // the check towards the ball
    const tGo = tCheck + between(rng, 0.2, 0.5); // the burst starts
    const runSpeed = between(rng, 6.6, 7.4);
    const pts = [check, mid, end];
    const runLen = dist(check, mid) + dist(mid, end);
    const tEnd = tGo + runLen / runSpeed;
    const runnerAt = (t) => {
      if (t <= tCheck) return lerp(start, check, smooth(t / tCheck));
      if (t <= tGo) return check;
      if (t <= tEnd) return positionAt(pts, (t - tGo) / (tEnd - tGo));
      return lerp(end, { x: end.x - side * 1.5, y: Math.max(2.5, end.y - 2) }, smooth((t - tEnd) / 1.2)); // slows as the chance dies
    };

    // You: carrying the ball forward at a jog.
    const you0 = P(-between(rng, 2, 5), between(rng, 40, 42));
    const youAt = move(you0, { x: you0.x + side * 1, y: you0.y - 6 }, 0, 6.5);

    // Their screening midfielder: starts in the lane, then steps out to press you.
    const screen0 = lerp(you0, start, between(rng, 0.42, 0.55));
    const screenLeave = between(rng, 0.9, 1.5);
    const screenAt = move(screen0, { x: you0.x - side * 6.5, y: you0.y - 9 }, screenLeave, screenLeave + 1.3); // steps across to the far side of you

    // The runner's marker: goal-side at first, then chasing with a lag.
    const lag = between(rng, 0.38, 0.55);
    const markerOffset = { x: side * -0.8, y: -4.2 };
    const markerAt = (t) => {
      const r = runnerAt(Math.max(0, t - (t > tGo ? lag : 0)));
      const ahead = { x: r.x + markerOffset.x, y: r.y + markerOffset.y };
      if (t <= tGo) return ahead;
      // once beaten, the marker trails behind the runner instead of in front
      const k = smooth((t - tGo) / (lag * 2.5));
      return { x: ahead.x, y: ahead.y + (4.2 + 1.0) * k };
    };

    // The covering centre-back slides across into the space the runner is heading for.
    const cover0 = P(between(rng, -1, 2), between(rng, 18, 20));
    const coverGo = tGo + between(rng, 1.1, 1.5);
    const coverTo = lerp(end, { x: 34, y: end.y }, 0.4);
    const coverAt = move(cover0, { x: coverTo.x, y: coverTo.y + 2.2 }, coverGo, coverGo + between(rng, 1.7, 2.1));

    // The keeper comes off the line when the runner gets close.
    const keeper0 = { x: 34, y: 2.2 };
    const keeperAt = (t) => {
      const r = runnerAt(t);
      const k = smooth((16 - r.y) / 10); // starts coming out when the runner is 16 m from goal
      return lerp(keeper0, lerp(keeper0, r, 0.42), k);
    };

    // The rest of the back line and midfield shift with the play.
    const other = [
      { id: "a-cb2", role: "centre-back", at: move(P(-8, 19), P(-4, 13), tGo, tGo + 2.4) },
      { id: "a-fb2", role: "full back", at: move(P(-19, 21), P(-14, 16), tGo, tGo + 2.6) },
      { id: "a-cm2", role: "central midfielder", at: move(P(-10, 32), P(-6, 33.5), 0.4, 2.4) },
      { id: "a-wm", role: "wide midfielder", at: move(P(17, 34), P(13, 31), 0.2, 2.2) },
    ];
    const defenders = [
      { id: "a-screen", role: "central midfielder", at: screenAt },
      { id: "a-marker", role: "full back", at: markerAt },
      { id: "a-cover", role: "centre-back", at: coverAt },
      { id: "a-gk", role: "goalkeeper", at: keeperAt, reach: KEEPER_REACH },
      ...other,
    ];

    const teammates = [
      { id: "st2", role: "striker", at: move(P(-4, 24), P(-6, 13), tGo + 0.2, tGo + 2.6) },
      { id: "fw", role: "far winger", at: move(P(-18, 26), P(-15, 17), 0.6, 3.6) },
      { id: "cm", role: "central midfielder", at: move(P(-12, 43), P(-10, 37), 0.3, 3.3) },
      { id: "fb", role: "full back", at: move(P(20, 44), P(21, 37), 0.5, 3.5) },
      { id: "am", role: "attacking midfielder", at: move(P(10, 31), P(8, 25), 0.6, 3.0) },
    ];

    const m = {
      seed, side, runnerRole, practice, tGo, tEnd, timeLimit: tEnd + 1.4,
      youAt, runnerAt, defenders, teammates,
    };
    if (practice) m.defenders = m.defenders.filter((d) => !["a-cb2", "a-fb2", "a-cm2", "a-wm"].includes(d.id)); // fewer bodies to read
    const w = windowOf(m);
    const okSpread = !hasCrowding(m);
    // One window, not at the very start, with real "too early" and "too late" stretches around it.
    const fair = w.segments === 1 && w.start >= 0.8 && w.late && w.length >= (practice ? 0.7 : 0.45) && w.length <= (practice ? 1.6 : 1.1);
    if (okSpread && fair) return { ...m, window: w };
  }
  throw new Error("no through-ball move for seed " + seed);
}

// Players must not start on top of each other.
function hasCrowding(m) {
  const at0 = [m.youAt(0), m.runnerAt(0), ...m.defenders.map((d) => d.at(0)), ...m.teammates.map((p) => p.at(0))];
  for (let i = 0; i < at0.length; i++) for (let j = i + 1; j < at0.length; j++) if (dist(at0[i], at0[j]) < 4) return true;
  return at0.some((p) => p.x < 2 || p.x > 66 || p.y < 1.5 || p.y > 51);
}

// Where the ball starts when you pass at time t: at your feet.
export const ballStart = (m, t) => { const y = m.youAt(t); return { x: y.x + 1.2, y: y.y - 1.2 }; };

// The pass you'd play at release time tr: aimed where the runner will be when the ball
// gets there (constant ball speed), then checked against every defender on the way.
export function passAt(m, tr) {
  const from = ballStart(m, tr);
  let ta = tr;
  while (dist(m.runnerAt(ta), from) > BALL_SPEED * (ta - tr) && ta < tr + 5) ta += STEP;
  const to = m.runnerAt(ta);
  const flight = ta - tr;
  const ballAtT = (t) => lerp(from, to, clamp01((t - tr) / (flight || 1)));
  for (let t = tr; t <= ta + 1e-9; t += STEP) {
    const b = ballAtT(t);
    for (const d of m.defenders) {
      if (dist(b, d.at(t)) < (d.reach ?? REACH)) return { kind: "intercepted", by: d, t, at: b, from, to, tr, ta, ballAtT };
    }
  }
  const near = m.defenders.reduce((best, d) => { const q = dist(d.at(ta), to); return q < best.d ? { d: q, def: d } : best; }, { d: Infinity, def: null });
  if (near.d < COVERED) return { kind: "covered", by: near.def, t: ta, at: to, from, to, tr, ta, ballAtT, clear: near.d };
  return { kind: "through", t: ta, at: to, from, to, tr, ta, ballAtT, clear: near.d, nearest: near.def };
}

// Samples every release time, so the replay can show when the pass would have worked.
// Returns { samples: [{ t, kind }], start, end, length, early, late } where start/end bound the
// longest stretch of "through" and early/late say whether failures exist before and after it.
export function windowOf(m, step = 0.05) {
  const samples = [];
  for (let t = 0; t <= m.timeLimit + 1e-9; t += step) samples.push({ t, kind: passAt(m, t).kind });
  let best = { start: null, end: null, length: 0 }, cur = null, segments = 0;
  for (const s of samples) {
    if (s.kind === "through") {
      if (cur === null) segments++;
      cur = cur ?? s.t;
      const len = s.t - cur + step;
      if (len > best.length) best = { start: cur, end: s.t + step, length: len };
    } else cur = null;
  }
  const early = best.start !== null && samples.some((s) => s.t < best.start && s.kind !== "through");
  const late = best.end !== null && samples.some((s) => s.t >= best.end && s.kind !== "through");
  return { samples, step, ...best, segments, early, late };
}

const their = (d) => (d.role === "goalkeeper" ? "the goalkeeper" : `their ${d.role}`);

// One or two sentences on what happened and how the timing caused it.
export function explainPass(m, result) {
  const w = m.window;
  const when = result.tr < w.start ? "early" : result.tr >= w.end ? "late" : "in";
  const by = (s) => (w.start === null ? "" : s);
  if (result.kind === "through") {
    return `Through. The ball met the runner in space, ${Math.max(0, result.clear - 1.8).toFixed(0)} m clear of the nearest defender.`;
  }
  if (result.kind === "intercepted") {
    if (result.by.id === "a-gk") return `Too late. The runner was nearly at the keeper by the time the ball arrived, and the keeper came out and claimed it.`;
    if (when === "early" && result.by.id === "a-screen") return `Too early. ${cap(their(result.by))} was still standing in the passing lane.`;
    if (when === "early") return `Too early. The runner hadn't got past ${their(result.by)} yet, so the ball ran into them.`;
    if (when === "late") return `Too late. By the time the ball got there, ${their(result.by)} had got across to cut it out.`;
    return `Cut out by ${their(result.by)}.`;
  }
  if (result.kind === "covered") {
    return when === "early"
      ? `Too early. The ball arrived while ${their(result.by)} was still with the runner.`
      : `Too late. ${cap(their(result.by))} reached the spot as the ball arrived: the space had closed.`;
  }
  return by("No pass.");
}
const cap = (t) => t[0].toUpperCase() + t.slice(1);

// No pass before the run died.
export const MISSED = "Missed. The run was over before you passed, so the chance went.";
