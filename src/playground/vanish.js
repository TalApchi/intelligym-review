// Scan before receiving: "Opponents vanish".
// Scan the picture; then the opponents disappear while your teammates stay on screen.
// Tap the teammate you'd pass to. Every possible answer stays visible, but which one is
// best depends on where the opponents were. Situations come from scan/situations.js
// (PROVISIONAL, pending Omri) and don't repeat in this browser until all have been played.
// The scored version is challenge 4 (scan/play.js).

import { SCAN_SITUATIONS } from "../scan/situations.js";
import { scanState, scanRank, scanFeedback, toSegment } from "../scan/logic.js";
import { BALL_SPEED, REACH } from "../through/logic.js";
import { pickScenarios } from "../decide/logic.js";
import { drawPlayers, markPlayer, placePlayers, placeBall, setTappable, clearMarks, showArrow } from "../board.js";
import { ease, lerp, dist, onTap } from "./common.js";

const SCAN_MS = 2000;
const FADE_MS = 450;
const HISTORY_KEY = "ig.scan.history";

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch { return {}; }
}
function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch { /* not saved; fine */ }
}
// The next situation this browser hasn't seen (the pool starts over once all are played).
function nextSituation() {
  const { ids, history } = pickScenarios(SCAN_SITUATIONS.map((s) => s.id), loadHistory(), 1, Math.random);
  saveHistory(history);
  return SCAN_SITUATIONS.find((s) => s.id === ids[0]);
}

const RANK_LABEL = { best: "Draft best", reasonable: "Reasonable", poor: "Weak option" };
const targetsOf = (s) => [s.passer, ...s.home];
const name = (s, id) => (id === s.passer.id ? `back to the ${s.passer.role}` : `the ${targetsOf(s).find((m) => m.id === id).role}`);

export default {
  id: "scan",
  group: "Scan before receiving",
  version: "A",
  name: "Opponents vanish",
  instruction: "Look at the whole picture while you can. When the opponents disappear and the ball reaches you, tap the teammate you'd pass to.",
  tests: "whether players remember where the opponents were when every teammate they could pick is still on screen. The teammates' layout alone doesn't give the answer away. Draft rankings, pending Omri's review.",
  mount(api) {
    let untap = null;
    const keys = [];
    const unbind = () => { untap?.(); untap = null; for (const [n, f] of keys.splice(0)) n.removeEventListener("keydown", f); };

    function setup(s) {
      const board = api.newBoard();
      drawPlayers(board, [
        { id: "you", role: "you", x: s.you.x, y: s.you.y, team: "home" },
        { ...s.passer, role: `${s.passer.role} passing to you`, team: "home" },
        ...s.home.map((m) => ({ ...m, team: "home" })),
        ...s.away.map((o) => ({ ...o, team: "away" })),
      ]);
      markPlayer(board, "you", "is-carrier");
      placeBall(board, { x: s.passer.x + 1.4, y: s.passer.y - 1.4 });
      return board;
    }
    const opponents = (board, s, on) => { for (const o of s.away) markPlayer(board, o.id, "is-gone", !on); };

    async function play(s) {
      unbind();
      const g = api.begin();
      const board = setup(s);
      api.status("Look: where are their players?");
      if (!(await api.run(g, SCAN_MS, (t) => api.timer(t / SCAN_MS)))) return;
      api.timer(null);
      opponents(board, s, false);
      // The ball comes to you while the opponents are gone.
      api.status("Here's the ball…");
      const from = { x: s.passer.x + 1.4, y: s.passer.y - 1.4 }, to = { x: s.you.x + 1.2, y: s.you.y + 1.2 };
      const ms = (dist(from, to) / BALL_SPEED) * 1000 + FADE_MS;
      if (!(await api.run(g, ms, (t) => placeBall(board, lerp(from, to, ease(Math.min(1, t / ms))))))) return;
      api.status("Tap the teammate you'd pass to.");
      setTappable(board, true);
      const pick = (id) => { unbind(); outcome(g, s, board, id); };
      untap = onTap(board, () => targetsOf(s), 3.6, pick);
      for (const m of targetsOf(s)) {
        const n = board.nodes.get(m.id);
        const f = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(m.id); } };
        n.addEventListener("keydown", f);
        keys.push([n, f]);
      }
    }

    // The pass plays out with the opponents back on screen, then the draft verdict.
    async function outcome(g, s, board, id, replay = false) {
      setTappable(board, false);
      const m = targetsOf(s).find((x) => x.id === id);
      const { kind, a } = scanState(s, m);
      opponents(board, s, true);
      markPlayer(board, id, "is-pick");
      api.status(replay ? "Replay" : "");
      const from = { x: s.you.x + 1.2, y: s.you.y - 1.2 };
      // A pass into a blocked lane stops where it meets the opponent.
      const end = kind === "lane" ? lerp(from, m, Math.max(0, toSegment(a.laneOpp, from, m).u - REACH / dist(from, m))) : m;
      showArrow(board, s.you, m);
      const presser = kind === "marked" || kind === "tight" ? a.nearOpp : null;
      const ms = (dist(from, end) / BALL_SPEED) * 1000 * (replay ? 1.6 : 1);
      const ok = await api.run(g, ms + 500, (t) => {
        placeBall(board, lerp(from, end, Math.min(1, t / ms)));
        // the nearest opponent steps towards the receiver, stopping short of the disc
        if (presser) placePlayers(board, { [presser.id]: lerp(presser, lerp(presser, m, Math.max(0, 1 - 4 / dist(presser, m))), ease(Math.min(1, t / (ms + 500)))) });
      });
      if (!ok) return;
      clearMarks(board);
      const rank = scanRank(s, id);
      if (rank !== "best") markPlayer(board, s.best, "is-answer");
      markPlayer(board, id, rank === "best" ? "is-found" : rank === "poor" ? "is-wrong" : "is-pick");
      api.status(`${RANK_LABEL[rank]} (provisional)`);
      const best = rank === "best" ? "" : ` Draft best: ${name(s, s.best)}, circled.`;
      api.explain(`${scanFeedback(s, id)}${best} Why (draft): ${s.reasoning}`);
      api.done({
        replay: () => replayIt(s, id),
        retry: () => play(s),
        next: () => play(nextSituation()),
      });
    }

    // Replay: the scan picture again (with the opponents), then the same pass.
    async function replayIt(s, id) {
      unbind();
      const g = api.begin();
      const board = setup(s);
      api.status("Replay: this is what the scan showed.");
      placeBall(board, { x: s.you.x + 1.2, y: s.you.y - 1.2 });
      if (!(await api.run(g, SCAN_MS, () => {}))) return;
      outcome(g, s, board, id, true);
    }

    // First try: an empty pitch and a Start button, so the scan isn't missed.
    api.begin();
    api.newBoard();
    api.ready(() => play(nextSituation()));
    return () => { unbind(); api.stop(); };
  },
};
