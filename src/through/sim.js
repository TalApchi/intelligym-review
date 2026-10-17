// "Through ball", version 2: authored situations played out by a small simulation.
// No DOM; tested in site/tests/through.test.mjs.
//
// Each situation (situations.js) sets out a starting picture: you on the ball, the runner
// and their path, the other attackers' movements, and each defender with a JOB:
//   marker  stays goal-side of one attacker, reacting a beat late (`react` seconds). Follows
//           a check up to `follow` metres and holds the line (drops at most `drop` metres)
//           rather than backing off for ever; once the attacker gets past them, needs TURN
//           seconds to turn round, then chases. `chase`: starts behind and chasing (tracking
//           a run from deep)
//   cover   holds their place in the back line, shifts with the ball, and drops across to
//           get goal-side of any attacker who gets in behind the line in their zone and
//           is not still marked (a marker who has been beaten no longer counts)
//   press   closes the ball carrier down, stopping a few metres away (jockeying)
//   zone    holds a midfield position, shifting with the ball and shading towards an
//           attacker who comes close
//   keeper  stays on the line and comes off it towards an attacker who gets close
// The defenders read the attackers' positions; the window for a pass comes out of those
// jobs, nothing is placed to make one.
//
// Everyone has the same top speed (PLAYER_SPEED) and the same acceleration (top speed in
// RAMP seconds), so nobody bursts or turns on the spot; players slow down only to stop.
// The simulation runs once per situation in fixed steps; at(t) reads the stored frames, so
// the game, the replay and the "what if" timeline all see the same move. Defenders do not
// react to the ball once it is played (a simplification; the pass is short in time).

import { PLAYER_SPEED, RAMP, REACH, KEEPER_REACH, windowOf } from "./logic.js";
import { seededRng } from "../spot/logic.js";
import { pickScenarios } from "../decide/logic.js";

export const DT = 1 / 60;
export const TURN = 0.5; // s a beaten defender needs to turn and face their own goal
// A defender running back towards their own goal has their back to the ball: they can only
// stop a pass that runs straight into them (the ball touching their body), not reach for it.
export const BACK_REACH = 1.8;
const ACC = PLAYER_SPEED / RAMP;
export const TURN_ACC = 7; // m/s², the most sideways acceleration anyone uses to change direction
const GOAL = { x: 34, y: 0.5 };
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const unit = (a, b) => { const d = dist(a, b) || 1; return { x: (b.x - a.x) / d, y: (b.y - a.y) / d }; };
const add = (a, v, k = 1) => ({ x: a.x + v.x * k, y: a.y + v.y * k });
const lerp = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// One step of movement towards `target`: accelerate at most ACC, never faster than
// PLAYER_SPEED, and brake in time to stop on the target.
function steer(e, target, arrive = true) {
  const d = dist(e.p, target);
  const want = d < 0.05 ? 0 : arrive ? Math.min(PLAYER_SPEED, Math.sqrt(2 * ACC * 0.85 * d)) : PLAYER_SPEED;
  const dir = d < 0.05 ? { x: 0, y: 0 } : unit(e.p, target);
  let dvx = dir.x * want - e.v.x, dvy = dir.y * want - e.v.y;
  // turning (the part of the change across the direction of travel) is gentler than
  // speeding up or braking, so nobody changes direction abruptly while moving
  const s0 = Math.hypot(e.v.x, e.v.y);
  if (s0 > 0.5) {
    const ux = e.v.x / s0, uy = e.v.y / s0;
    const along = dvx * ux + dvy * uy;
    let ax = dvx - along * ux, ay = dvy - along * uy;
    const across = Math.hypot(ax, ay), limT = TURN_ACC * DT;
    if (across > limT) { ax *= limT / across; ay *= limT / across; }
    dvx = along * ux + ax; dvy = along * uy + ay;
  }
  const dv = Math.hypot(dvx, dvy), lim = ACC * DT;
  if (dv > lim) { dvx *= lim / dv; dvy *= lim / dv; }
  e.v = { x: e.v.x + dvx, y: e.v.y + dvy };
  const s = Math.hypot(e.v.x, e.v.y);
  if (s > PLAYER_SPEED) e.v = { x: e.v.x * PLAYER_SPEED / s, y: e.v.y * PLAYER_SPEED / s };
  e.p = add(e.p, e.v, DT);
}

// Reads stored frames as a function of time.
function track(frames) {
  return (t) => {
    const f = clamp(t / DT, 0, frames.length - 1);
    const i = Math.floor(f);
    return i >= frames.length - 1 ? frames[frames.length - 1] : lerp(frames[i], frames[i + 1], f - i);
  };
}

// Mirrors a situation to the other side of the pitch, and nudges every starting position
// and start time a little, so a situation never plays out identically twice.
function variant(sit, seed) {
  const rng = seededRng(seed);
  const side = rng() < 0.5 ? 1 : -1;
  const j = (m) => (rng() - 0.5) * 2 * m;
  const X = (x) => (side === 1 ? x : 68 - x);
  const P = ([x, y], m = 0.7) => ({ x: clamp(X(x) + j(m), 2, 66), y: clamp(y + j(m), 1.5, 51) });
  const W = (w) => ({ ...P(w, 0.6), stop: w[2] === "stop" });
  const T = (t) => Math.max(0, t + j(0.15));
  const you = { from: P(sit.you.from), path: (sit.you.path || []).map(W), go: T(sit.you.go ?? 0.2) };
  const runnerFrom = P(sit.runner.from);
  const runner = { ...sit.runner, from: runnerFrom, path: sit.runner.path.map(W), go: T(sit.runner.go) };
  const mates = sit.mates.map((m) => ({ ...m, from: P(m.from), path: (m.path || []).map(W), go: T(m.go ?? 0.5) }));
  return {
    side, you, runner, mates,
    // a marker keeps their authored distance from the attacker they mark
    defenders: sit.defenders.map((d) => {
      const a = d.job === "marker" && (d.mark === "runner" ? sit.runner : sit.mates.find((m) => m.id === d.mark));
      if (!a) return { ...d, from: P(d.at) };
      const i = d.mark === "runner" ? -1 : sit.mates.indexOf(a);
      const af = i < 0 ? runnerFrom : mates[i].from;
      return { ...d, from: { x: af.x + side * (d.at[0] - a.from[0]) + j(0.3), y: af.y + (d.at[1] - a.from[1]) + j(0.3) } };
    }),
  };
}

// Plays a situation out. Returns the move in the shape logic.js reads (youAt, runnerAt,
// defenders[{ id, role, job, at, reach }], teammates, timeLimit) plus `window`.
export function simulate(sit, seed = 1) {
  const v = variant(sit, seed);
  const attackers = [
    { id: "you", role: "you", ...v.you },
    { id: "runner", role: v.runner.role, ...v.runner },
    ...v.mates,
  ].map((a) => ({ ...a, p: { ...a.from }, v: { x: 0, y: 0 }, i: 0, frames: [] }));
  // a marker who `chase`s starts behind their attacker (tracking a run from deep), so is
  // chasing from the first moment
  const defenders = v.defenders.map((d) => ({ ...d, p: { ...d.from }, v: { x: 0, y: 0 }, frames: [], base: { ...d.from }, beatenAt: d.chase ? -TURN : undefined }));
  const byId = Object.fromEntries(attackers.map((a) => [a.id, a]));
  const runner = byId.runner;
  // how long to run: until the runner has finished and stopped, plus a little
  const total = sit.duration ?? 7;
  const steps = Math.round(total / DT);
  const lagged = (a, k, react) => a.frames[Math.max(0, k - Math.round(react / DT))] ?? a.p;

  for (let k = 0; k <= steps; k++) {
    const t = k * DT;
    for (const a of attackers) a.frames.push({ ...a.p });
    for (const d of defenders) d.frames.push({ ...d.p });
    // attackers follow their paths after `go`
    for (const a of attackers) {
      if (t < a.go || a.i >= a.path.length) { if (Math.hypot(a.v.x, a.v.y) > 0.01) steer(a, a.p); continue; }
      const w = a.path[a.i], last = a.i === a.path.length - 1;
      steer(a, w, w.stop || last);
      const d = dist(a.p, w);
      if (!last && ((!w.stop && d < 2) || (w.stop && d < 0.4))) a.i++;
      if (last && d < 0.3) a.i++;
    }
    const ball = byId.you.p;
    for (const d of defenders) {
      const react = d.react ?? 0.35;
      let target = d.base;
      if (d.job === "marker") {
        // Goal-side of their attacker while the attacker is in front of them (following a
        // check only a few metres up the pitch); once the attacker gets level and runs in
        // behind, they turn and chase.
        const a = lagged(byId[d.mark], k, react);
        if (d.beatenAt === undefined && a.y < d.p.y - 0.5) d.beatenAt = t;
        if (d.beatenAt === undefined) {
          const g = add(a, unit(a, GOAL), d.goalSide ?? 2);
          target = { x: g.x, y: clamp(g.y, d.base.y - (d.drop ?? 2), d.base.y + (d.follow ?? 6)) };
        } else if (t - d.beatenAt < TURN) target = d.p; // turning round to face their own goal
        else target = a;
      } else if (d.job === "cover") {
        const shifted = { x: d.base.x + 0.25 * (ball.x - 34), y: d.base.y };
        target = shifted;
        let best = 0;
        for (const at of attackers) {
          if (at.id === "you") continue;
          // an attacker whose marker is still goal-side of them is that marker's job
          if (defenders.some((o) => o.job === "marker" && o.mark === at.id && o.beatenAt === undefined)) continue;
          const a = lagged(at, k, react);
          if (Math.abs(a.x - shifted.x) > (d.zone ?? 14)) continue;
          const w = clamp((d.base.y + 2 - a.y) / 5, 0, 1);
          if (w > best) { best = w; target = lerp(shifted, add(a, unit(a, GOAL), 2.5), w); }
        }
      } else if (d.job === "press") {
        const c = lagged(byId.you, k, d.react ?? 0.15); // watching the ball closely
        // closes down along the line from where they started, so the side they come from
        // stays shut and the other side stays open
        if (dist(d.base, c) < (d.range ?? 16)) target = add(c, unit(c, d.base), d.distance ?? 4);
      } else if (d.job === "zone") {
        target = { x: d.base.x + 0.35 * (ball.x - 34), y: d.base.y };
        for (const at of attackers) {
          if (at.id === "you") continue;
          const a = lagged(at, k, react);
          if (dist(a, d.base) < (d.shade ?? 7)) { target = lerp(target, a, 0.3); break; }
        }
      } else if (d.job === "keeper") {
        let near = null;
        for (const at of attackers) {
          if (at.id === "you") continue;
          const a = lagged(at, k, react);
          if (a.y < 20 && Math.abs(a.x - 34) < 24 && (!near || a.y < near.y)) near = a;
        }
        target = near ? add(GOAL, unit(GOAL, near), clamp((20 - near.y) * 0.35 + 2, 2, 8)) : d.base;
      }
      steer(d, target, true);
    }
  }

  const at = (e) => track(e.frames);
  const outs = defenders.map((d) => ({
    id: d.id, role: d.role, job: d.job, mark: d.mark, at: at(d),
    ...(d.job === "keeper" ? { reach: KEEPER_REACH } : {}),
    ...(d.beatenAt !== undefined ? { beatenAt: Math.max(0, d.beatenAt), reachAt: (t) => (t >= d.beatenAt ? BACK_REACH : REACH) } : {}),
  }));
  // the defender(s) the runner has to get behind: `behind` if the situation names them, else
  // the runner's marker (unless chasing from behind), else the back line
  const markers = outs.filter((d, i) => defenders[i].job === "marker" && defenders[i].mark === "runner" && !defenders[i].chase);
  const line = sit.behind ? outs.filter((d) => sit.behind.includes(d.id))
    : markers.length ? markers : outs.filter((d) => d.job === "marker" || d.job === "cover");
  const near = sit.behind || markers.length ? Infinity : 12; // a back line counts only near the ball
  const m = {
    id: sit.id, title: sit.title, about: sit.about, side: v.side, seed, runnerRole: sit.runner.role,
    youAt: at(byId.you), runnerAt: at(runner),
    // the ball sits at your feet on the side you'd pass to (towards the runner)
    ballStartAt: (t) => { const y = at(byId.you)(t), r = at(runner)(t); return add(y, unit(y, r), 1.5); },
    teammates: attackers.filter((a) => a.id !== "you" && a.id !== "runner").map((a) => ({ id: a.id, role: a.role, at: at(a) })),
    defenders: outs,
    runFrom: v.runner.go,
    inFront: (to, ta, tr) => (tr < v.runner.go
      ? line.reduce((a, d) => (!a || dist(d.at(ta), to) < dist(a.at(ta), to) ? d : a), null)
      : line.find((d) => to.y > d.at(ta).y - 0.5 && Math.abs(to.x - d.at(ta).x) < near) ?? null),
    timeLimit: sit.timeLimit ?? total - 0.5,
    practice: !!sit.practice,
  };
  return { ...m, window: windowOf(m) };
}

// A situation that plays fairly: one window, with "too early" before it and "too late"
// after it. Tries a few variants of the same situation (mirror, nudges) and keeps the
// first fair one; returns null if none is.
export function playable(sit, seed) {
  for (let k = 0; k < 12; k++) {
    const m = simulate(sit, seed * 97 + k);
    const w = m.window;
    if (w.segments >= 1 && w.length >= 0.3 && w.early && w.late && w.start >= 0.8) return m;
  }
  return null;
}

// The demonstration or practice situation (`use`), the same fair variant for everyone.
export function fixedMove(all, use, seed) {
  const s = all.find((x) => x.use === use);
  return playable(s, seed) ?? simulate(s, seed);
}

// Situations for the scored rounds: everything not kept for the demonstration or practice.
export const roundSituations = (all) => all.filter((s) => !s.use);

// Picks `n` different situations for one play, avoiding ones seen recently (history as in
// pickScenarios), plays each out with a fresh seed, and orders them from the widest window
// to the narrowest, so the rounds get harder. Returns { moves, history }.
export function pickRounds(all, history, n, rng = Math.random) {
  const pool = roundSituations(all);
  const picked = pickScenarios(pool.map((s) => s.id), history, n, rng);
  const moves = picked.ids.map((id) => {
    const sit = pool.find((s) => s.id === id);
    const seed = 1 + Math.floor(rng() * 1e6);
    return playable(sit, seed) ?? simulate(sit, seed);
  });
  moves.sort((a, b) => b.window.length - a.window.length);
  return { moves, history: picked.history };
}

// What happened and why, from the job of the defender involved. One or two sentences.
const cap = (t) => t[0].toUpperCase() + t.slice(1);
export function explainSim(m, res) {
  const w = m.window;
  const runner = `your ${m.runnerRole}`;
  const their = (d) => (d.job === "keeper" ? "the goalkeeper" : `their ${d.role}`);
  const early = w.start !== null && res.tr < w.start;
  const late = w.start !== null && res.tr >= w.end;
  const when = early ? "Too early. " : late ? "Too late. " : "";
  if (res.kind === "through") return `Through. The ball met ${runner} in space, ${Math.max(0, res.clear - 1.8).toFixed(0)} m clear of the nearest defender.`;
  const d = res.by;
  if (res.kind === "short") {
    return res.tr < m.runFrom
      ? `Too early. ${cap(runner)} hadn't started the run, so ${their(d)} was still goal-side and stepped in.`
      : `Too early. ${cap(runner)} was still in front of ${their(d)}, so the ball went to feet, not in behind, and ${their(d)} stepped in.`;
  }
  if (res.kind === "covered") {
    return early ? `Too early. ${cap(their(d))} was still with ${runner} when the ball arrived.` : `${when}${cap(their(d))} reached the spot as the ball arrived: the space had closed.`;
  }
  // intercepted
  if (d.job === "keeper") return `${when}${cap(runner)} was close to goal by the time the ball arrived, and the keeper came out and claimed it.`;
  if (d.job === "press") return `${when}${cap(their(d))}, closing you down, was in the way of the pass.`;
  if (d.job === "cover") return `${when}${cap(their(d))} had dropped across to cover the space behind and cut it out.`;
  if (d.job === "zone") return `${when}${cap(their(d))} was holding their position in the passing lane.`;
  if (d.job === "marker" && d.mark !== "runner") {
    const mate = m.teammates.find((p) => p.id === d.mark);
    return `${when}${cap(their(d))}, marking your ${mate ? mate.role : "teammate"}, was in the passing lane.`;
  }
  // the runner's own marker
  if (d.beatenAt !== undefined && res.t >= d.beatenAt) return `${when}${cap(their(d))} had turned and got back into the path of the ball.`;
  return `${when}${cap(their(d))} was still goal-side of ${runner}, between the ball and the space.`;
}
