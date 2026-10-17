// "Through ball" (challenge 5, and the playground): the rules, no DOM. Tested in
// site/tests/through.test.mjs.
//
// A developing move on a populated half pitch. One teammate, the runner, makes a run in
// behind while the defence reacts: their midfielder screens the lane early on and then
// steps out, the runner's marker tracks the run from inside, a covering centre-back slides
// across and the keeper comes out once the runner gets close. You choose WHEN to pass.
//
// Movement is deliberately uniform: every player who moves does so at the same speed
// (PLAYER_SPEED, measured along the path, so a long run takes longer rather than going
// faster), along smooth paths, easing in and out over RAMP seconds. No bursts.
// The ball always travels at BALL_SPEED and is aimed where the runner WILL be when it
// arrives (leading them into space), so timing is the whole decision.
//
// Everything is a pure function of time t (seconds since the move started), so the game,
// the replay and the "what if you passed here" timeline all compute the same outcome.

import { seededRng } from "../spot/logic.js";
import { positionAt } from "../track/logic.js";

export const BALL_SPEED = 14;    // m/s, every pass
export const PLAYER_SPEED = 6;   // m/s, every moving player, runner included
export const RAMP = 0.45;        // s to reach full speed from standing, and to stop again
// A defender touches the ball when the ball's centre comes within REACH of theirs. On the board
// a player disc has a 1.8 m radius and the ball 0.9 m, so 2.9 m means "the shapes touch".
export const REACH = 2.9;
export const KEEPER_REACH = 3.4; // hands: a little further than a defender's foot
export const STEP = 1 / 120;     // s, simulation step
export const COVERED = 2.6;      // m: a defender this close to where the ball meets the runner wins it

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
const clamp01 = (u) => Math.min(1, Math.max(0, u));
const between = (rng, lo, hi) => lo + (hi - lo) * rng();

// A player who leaves at t0 and follows `points` (smoothed into a curve when there are more
// than two) at PLAYER_SPEED, easing in and out, then stays. Returns { at(t), t0, t1, length }.
export function route(points, t0) {
  const line = points.length > 2 ? Array.from({ length: 61 }, (_, i) => positionAt(points, i / 60)) : points;
  const cum = [0];
  for (let i = 1; i < line.length; i++) cum.push(cum[i - 1] + dist(line[i - 1], line[i]));
  const L = cum[cum.length - 1];
  const acc = PLAYER_SPEED / RAMP;
  // distance travelled after tau seconds: trapezoid speed profile (triangle if the move is short)
  let T, s;
  if (L >= PLAYER_SPEED * RAMP) {
    T = L / PLAYER_SPEED + RAMP;
    s = (tau) => tau < RAMP ? acc * tau * tau / 2 : tau < T - RAMP ? PLAYER_SPEED * RAMP / 2 + PLAYER_SPEED * (tau - RAMP) : L - acc * (T - tau) ** 2 / 2;
  } else {
    const half = Math.sqrt(L / acc);
    T = 2 * half;
    s = (tau) => tau < half ? acc * tau * tau / 2 : L - acc * (T - tau) ** 2 / 2;
  }
  const at = (t) => {
    const tau = Math.min(Math.max(t - t0, 0), T);
    const d = L ? s(tau) : 0;
    let lo = 1, hi = cum.length - 1; // first i with cum[i] >= d
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < d) lo = mid + 1; else hi = mid; }
    const i = lo;
    const seg = cum[i] - cum[i - 1] || 1;
    return lerp(line[i - 1], line[i], clamp01((d - cum[i - 1]) / seg));
  };
  return { at, t0, t1: t0 + T, length: L };
}

// Progression: how wide the window may be (seconds) in practice and in rounds 1, 2, 3.
export const COVER = [2.4, 3.2]; // s after the run starts that the cover reacts (tuned for fair windows)
export const WINDOWS = { practice: [0.75, 1.8], 0: [0.7, 1.4], 1: [0.55, 1.1], 2: [0.4, 0.85] };

// Builds a move from a seed. `side` +1 = the runner attacks the right channel, -1 the left.
// `level` 0..2 narrows the window round by round; `practice` removes four defenders.
export function makeMove(seed, { practice = false, level = 0 } = {}) {
  const [wMin, wMax] = WINDOWS[practice ? "practice" : level];
  for (let attempt = 0; attempt < 400; attempt++) {
    const rng = seededRng(seed * 6151 + attempt * 31 + level * 7);
    const side = rng() < 0.5 ? -1 : 1;
    const X = (dx) => 34 + side * dx; // mirror helper: dx measured towards the runner's side
    const P = (dx, y) => ({ x: X(dx), y });
    const go = (pts, t0) => route(pts, t0).at;

    // The runner: a curved run in behind, from wide to the space beside the far post.
    const runnerRole = "winger";
    const start = P(between(rng, 17, 20), between(rng, 25, 28));
    const end = P(between(rng, 6, 9), between(rng, 5, 7));
    const bend = lerp(start, end, 0.45);
    const mid = { x: bend.x + side * between(rng, 1.5, 3), y: bend.y };
    // The run starts after a random build-up, so the right moment can't be learned by the clock.
    const delay = between(rng, 0, 1.8);
    const tGo = delay + between(rng, 0.5, 0.9);
    const run = route([start, mid, end], tGo);
    const runnerAt = run.at;
    const tEnd = run.t1;

    // You: a few touches forward, then you hold it.
    const you0 = P(-between(rng, 2, 5), between(rng, 40, 42));
    const youAt = go([you0, { x: you0.x + side * 1, y: you0.y - 4 }], delay + 0.2);

    // Their screening midfielder: starts in the lane, then steps across to press you
    // from the inside, which opens the lane.
    const screen0 = lerp(you0, start, between(rng, 0.3, 0.4));
    const screenAt = go([screen0, { x: you0.x - side * between(rng, 3, 4), y: you0.y - between(rng, 2.5, 4) }], delay + between(rng, 0.3, 0.7));

    // The runner's marker: inside and a little goal-side, tracking the run a beat late.
    const inside = between(rng, 2.6, 3.4);
    const markerStart = { x: start.x - side * inside, y: start.y - 2.4 };
    const markerEnd = { x: end.x - side * between(rng, 3.8, 5), y: end.y + between(rng, 1.5, 3) };
    const markerAt = go([markerStart, { x: mid.x - side * inside, y: mid.y }, markerEnd], tGo + between(rng, 0.25, 0.55));

    // The covering centre-back slides across into the space the runner is heading for.
    const cover0 = P(between(rng, -1, 2), between(rng, 17, 19));
    const coverTo = { x: lerp(end, { x: 34, y: end.y }, 0.35).x, y: end.y + between(rng, 2, 3.5) };
    const coverAt = go([cover0, coverTo], tGo + between(rng, COVER[0], COVER[1]));

    // The keeper comes off the line when the runner gets within 16 m of goal.
    const keeper0 = { x: 34, y: 2.2 };
    let tK = tGo;
    while (runnerAt(tK).y > 16 && tK < tEnd) tK += 0.05;
    const keeperAt = go([keeper0, lerp(keeper0, end, 0.45)], tK);

    // The rest of the back line and midfield shift with the play.
    const other = [
      { id: "a-cb2", role: "centre-back", at: go([P(-8, 18), P(-5, 13)], tGo + 0.3) },
      { id: "a-fb2", role: "full back", at: go([P(-19, 21), P(-15, 16)], tGo + 0.2) },
      { id: "a-cm2", role: "central midfielder", at: go([P(-11, 32), P(-7, 33.5)], 0.4) },
      { id: "a-wm", role: "wide midfielder", at: go([P(18, 35), P(14, 31)], 0.2) },
    ];
    const defenders = [
      { id: "a-screen", role: "central midfielder", at: screenAt },
      { id: "a-marker", role: "full back", at: markerAt },
      { id: "a-cover", role: "centre-back", at: coverAt },
      { id: "a-gk", role: "goalkeeper", at: keeperAt, reach: KEEPER_REACH },
      ...other,
    ];

    const teammates = [
      { id: "st2", role: "striker", at: go([P(-4, 24), P(-6, 14)], tGo + 0.2) },
      { id: "fw", role: "far winger", at: go([P(-18, 27), P(-15, 18)], 0.6) },
      { id: "cm", role: "central midfielder", at: go([P(-12, 44), P(-10, 38)], 0.3) },
      { id: "fb", role: "full back", at: go([P(21, 45), P(21, 38)], 0.5) },
      { id: "am", role: "attacking midfielder", at: go([P(10, 32), P(8, 26)], 0.6) },
    ];

    const m = {
      seed, side, runnerRole, practice, level, tGo, tEnd, timeLimit: tEnd + 1.2,
      youAt, runnerAt, defenders, teammates,
    };
    if (practice) m.defenders = m.defenders.filter((d) => !["a-cb2", "a-fb2", "a-cm2", "a-wm"].includes(d.id)); // fewer bodies to read
    if (hasCrowding(m)) continue;
    const w = windowOf(m);
    // One window, not at the very start, with real "too early" and "too late" stretches around it.
    const fair = w.segments === 1 && w.start >= 0.8 && w.early && w.late && w.length >= wMin && w.length <= wMax;
    if (fair) return { ...m, window: w };
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
export const ballStart = (m, t) => (m.ballStartAt ? m.ballStartAt(t) : (({ x, y }) => ({ x: x + 1.2, y: y - 1.2 }))(m.youAt(t)));

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
      if (dist(b, d.at(t)) < (d.reachAt?.(t) ?? d.reach ?? REACH)) return { kind: "intercepted", by: d, t, at: b, from, to, tr, ta, ballAtT };
    }
  }
  const near = m.defenders.reduce((best, d) => { const q = dist(d.at(ta), to); return q < best.d ? { d: q, def: d } : best; }, { d: Infinity, def: null });
  if (near.d < COVERED) return { kind: "covered", by: near.def, t: ta, at: to, from, to, tr, ta, ballAtT, clear: near.d };
  // version 2 moves (sim.js): a ball played before the run started, or that meets the runner
  // still in front of their marker, went to feet, not in behind
  const front = m.inFront?.(to, ta, tr);
  if (front) return { kind: "short", by: front, t: ta, at: to, from, to, tr, ta, ballAtT, clear: near.d };
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
    if (when === "early") return `Too early. ${cap(their(result.by))} was still between you and the runner's path, so the ball ran into them.`;
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

// Points for one round: through 100; a pass that just missed the window (within
// `close` seconds of it) 50; anything else 0. PROVISIONAL scoring, like the rest.
export function scorePass(m, res, cfg) {
  if (res === "missed") return { kind: "missed", pts: cfg.points.miss };
  if (res.kind === "through") return { kind: "through", pts: cfg.points.through };
  const w = m.window;
  const off = res.tr < w.start ? w.start - res.tr : res.tr - w.end;
  return off <= cfg.close ? { kind: "close", pts: cfg.points.close, off } : { kind: "miss", pts: cfg.points.miss, off };
}

// The challenge score: the average of the rounds' points, rounded.
export const scoreThrough = (pts) => (pts.length ? Math.round(pts.reduce((a, b) => a + b, 0) / pts.length) : 0);
