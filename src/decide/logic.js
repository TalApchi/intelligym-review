// "Tactical choice": the rules, with no DOM. Pure functions, tested in
// site/tests/decide.test.mjs. The scenarios themselves (and their PROVISIONAL
// rankings) live in scenarios.js.

const RANKS = ["best", "reasonable", "poor"];

// The scenarios the game may use. Drafts only when allowed (never in a production build).
export function usableScenarios(scenarios, cfg) {
  return scenarios.filter((s) => s.approved || cfg.allowDrafts);
}

function shuffled(list, rng) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Picks `n` scenario ids for one play, at random, without repeats.
// `history` is what this browser has seen: { seen: ids shown in the current round of the
// pool, last: ids of the previous play }. Unseen scenarios come first. Once the pool runs
// out it starts over, but never with the previous play's scenarios or a repeat within a play.
// Returns { ids, history } with the history to save. `rng` returns 0..1 (Math.random in the game).
export function pickScenarios(poolIds, history, n, rng) {
  const pool = [...new Set(poolIds)];
  const seen = new Set((history?.seen || []).filter((id) => pool.includes(id)));
  const last = new Set((history?.last || []).filter((id) => pool.includes(id)));
  const ids = shuffled(pool.filter((id) => !seen.has(id)), rng).slice(0, n);
  let nextSeen = [...seen, ...ids];
  if (ids.length < n) {
    // Pool exhausted: start a new round. Avoid the previous play first, then allow it if the pool is tiny.
    const fresh = shuffled(pool.filter((id) => !ids.includes(id) && !last.has(id)), rng);
    const fallback = shuffled(pool.filter((id) => !ids.includes(id) && last.has(id)), rng);
    ids.push(...[...fresh, ...fallback].slice(0, n - ids.length));
    nextSeen = [...ids];
  }
  return { ids, history: { seen: nextSeen, last: ids } };
}

// Checks a scenario's data. Returns a list of problems (empty = fine).
export function checkScenario(s) {
  const problems = [];
  const players = [...s.home, ...s.away];
  const ids = new Set(players.map((p) => p.id));
  if (ids.size !== players.length) problems.push("duplicate player id");
  if (!s.home.some((p) => p.id === s.carrier)) problems.push("carrier is not one of our players");
  if (s.options.length < 3 || s.options.length > 4) problems.push(`${s.options.length} options (need 3–4)`);
  const bests = s.options.filter((o) => o.rank === "best").length;
  if (bests < 1) problems.push("needs a suggested (best) option");
  if (bests > 1 && !s.open) problems.push("more than one suggested option needs an `open` note saying why");
  if (!s.reasoning) problems.push("missing reasoning");
  for (const c of s.cues || []) if (!ids.has(c.id)) problems.push(`cue for unknown player ${c.id}`);
  for (const o of s.options) {
    if (!RANKS.includes(o.rank)) problems.push(`${o.id}: unknown rank ${o.rank}`);
    if (!o.note || !o.label || !o.result) problems.push(`${o.id}: missing label, note or result`);
    if (!o.ball || o.ball.length < 2) problems.push(`${o.id}: ball path needs 2+ points`);
    for (const id of Object.keys(o.moves || {})) if (!ids.has(id)) problems.push(`${o.id}: moves unknown player ${id}`);
  }
  for (const p of players) {
    if (p.x < 0 || p.x > 68 || p.y < 0 || p.y > 52.5) problems.push(`${p.id} is off the pitch`);
  }
  return problems;
}

const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2); // ease-in-out

// Point at fraction u (0..1) along a polyline, by distance.
function along(points, u) {
  const seg = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const d = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    seg.push(d); total += d;
  }
  let left = u * total;
  for (let i = 0; i < seg.length; i++) {
    if (left <= seg[i] || i === seg.length - 1) {
      const t = seg[i] ? Math.min(left / seg[i], 1) : 1;
      const a = points[i], b = points[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    left -= seg[i];
  }
  return points[points.length - 1];
}

// The outcome animation at progress u (0..1): player positions and the ball.
// `lift` is the ball's height as a share of its peak (0 on the ground), for lofted passes.
export function outcomeAt(scenario, option, u) {
  const k = ease(Math.min(Math.max(u, 0), 1));
  const players = {};
  for (const p of [...scenario.home, ...scenario.away]) {
    const to = option.moves?.[p.id];
    players[p.id] = to ? { x: p.x + (to.x - p.x) * k, y: p.y + (to.y - p.y) * k } : { x: p.x, y: p.y };
  }
  const ball = along(option.ball, k);
  const lift = option.lofted ? Math.sin(Math.PI * k) : 0;
  return { players, ball: { ...ball, lift } };
}

// Where the preview arrow points for an option: the end of the ball's path.
export function previewTarget(option) {
  return option.ball[option.ball.length - 1];
}

// The best option of a scenario (its PROVISIONAL best until approved).
export function bestOption(scenario) {
  return scenario.options.find((o) => o.rank === "best");
}

// Every suggested option: more than one when the picture doesn't settle it (scenario.open).
export function bestOptions(scenario) {
  return scenario.options.filter((o) => o.rank === "best");
}

// Challenge points, 0 to 100: the average of each situation's points.
export function scoreDecide(ranks, cfg) {
  if (ranks.length === 0) return 0;
  const sum = ranks.reduce((n, r) => n + cfg.points[r], 0);
  return Math.round(sum / ranks.length);
}
