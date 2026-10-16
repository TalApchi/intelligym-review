// Scan before receiving, version A: "Opponents vanish".
// Scan the picture; then the opponents disappear while your teammates stay on screen.
// Tap the teammate you'd pass to. Every possible answer stays visible, but which one
// is right depends on what you saw.

import { makeVanishRound, vanishVerdict, toSegment, BALL_SPEED, REACH } from "./logic.js";
import { drawPlayers, markPlayer, placePlayers, placeBall, setTappable, clearMarks, showArrow } from "../board.js";
import { ease, lerp, dist, newSeed, onTap } from "./common.js";

const SCAN_MS = 2200;
const FADE_MS = 450;

export default {
  id: "scan-vanish",
  group: "Scan before receiving",
  version: "A",
  name: "Opponents vanish",
  instruction: "Look at the picture while you can. When the opponents disappear, tap the teammate who was free.",
  tests: "whether players remember who was marked when every teammate they could pick is still on screen. Nothing has to be guessed: you always tap a player you can see.",
  mount(api) {
    let untap = null;

    function setup(round) {
      const board = api.newBoard();
      drawPlayers(board, [
        { id: "you", role: "you", x: round.you.x, y: round.you.y, team: "home" },
        { id: "passer", role: "teammate passing to you", x: round.passer.x, y: round.passer.y, team: "home" },
        ...round.home.map((m) => ({ ...m, role: "teammate", team: "home" })),
        ...round.away.map((o) => ({ ...o, role: "opponent", team: "away" })),
      ]);
      markPlayer(board, "you", "is-carrier");
      placeBall(board, { x: round.passer.x + 1.4, y: round.passer.y - 1.4 });
      return board;
    }
    const opponents = (board, on) => {
      for (const [id, g] of board.nodes) if (id.startsWith("o")) g.classList.toggle("is-gone", !on);
    };

    // The scan: the full picture for SCAN_MS, then the opponents fade out.
    async function scan(g, board) {
      api.status("Look: who is free?");
      if (!(await api.run(g, SCAN_MS, (t) => api.timer(t / SCAN_MS)))) return false;
      api.timer(null);
      opponents(board, false);
      return true;
    }

    async function play(seed) {
      untap?.();
      const g = api.begin();
      const round = makeVanishRound(seed);
      const board = setup(round);
      if (!(await scan(g, board))) return;
      // The ball comes to you while the opponents are gone.
      api.status("Here's the ball…");
      const from = { x: round.passer.x + 1.4, y: round.passer.y - 1.4 }, to = { x: round.you.x + 1.4, y: round.you.y + 1.4 };
      const ms = (dist(from, to) / BALL_SPEED) * 1000 + FADE_MS;
      if (!(await api.run(g, ms, (t) => placeBall(board, lerp(from, to, ease(Math.min(1, t / ms))))))) return;
      api.status("Tap the teammate you'd pass to.");
      setTappable(board, true);
      const targets = () => round.home;
      untap = onTap(board, targets, 4.5, (id) => { untap(); untap = null; outcome(g, round, board, id); });
      // keyboard: Enter or Space on a focused teammate
      for (const m of round.home) board.nodes.get(m.id).addEventListener("keydown", (e) => {
        if ((e.key === "Enter" || e.key === " ") && untap) { e.preventDefault(); untap(); untap = null; outcome(g, round, board, m.id); }
      });
    }

    // The pass plays out with the opponents back on screen, then the explanation.
    async function outcome(g, round, board, id, replay = false) {
      setTappable(board, false);
      const m = round.home.find((x) => x.id === id);
      const v = vanishVerdict(round, m);
      opponents(board, true);
      markPlayer(board, id, "is-pick");
      api.status(replay ? "Replay" : "");
      const from = { x: round.you.x + 1.4, y: round.you.y - 1.4 };
      // A cut-out pass stops where it meets the opponent in the lane.
      const end = v.kind === "lane" ? lerp(from, m, Math.max(0, toSegment(v.by, from, m).u - REACH / dist(from, m))) : m;
      showArrow(board, round.you, m);
      const marker = round.away.reduce((a, o) => (dist(o, m) < dist(a, m) ? o : a));
      const ms = (dist(from, end) / BALL_SPEED) * 1000 * (replay ? 1.6 : 1);
      const ok = await api.run(g, ms + 500, (t) => {
        const u = Math.min(1, t / ms);
        placeBall(board, lerp(from, end, u));
        if (v.kind === "marked") placePlayers(board, { [marker.id]: lerp(marker, lerp(marker, m, 0.28), ease(Math.min(1, t / (ms + 500)))) }); // steps in, stays clear of the disc
        if (v.kind === "lane") placePlayers(board, { [v.by.id]: v.by });
      });
      if (!ok) return;
      clearMarks(board);
      const free = round.home.find((x) => x.kind === "free");
      if (free.id !== id) markPlayer(board, free.id, "is-answer");
      markPlayer(board, id, v.kind === "free" ? "is-found" : "is-wrong");
      api.status(v.kind === "free" ? "Free" : v.kind === "lane" ? "Cut out" : "Under pressure");
      api.explain(v.kind === "free" ? v.text : `${v.text} The free teammate is circled.`);
      api.done({
        replay: () => replayIt(round, id),
        retry: () => play(round.seed),
        next: () => play(newSeed()),
      });
    }

    // Replay: the scan picture again (with the opponents), then the same pass.
    async function replayIt(round, id) {
      untap?.(); untap = null;
      const g = api.begin();
      const board = setup(round);
      api.status("Replay: this is what the scan showed.");
      placeBall(board, { x: round.you.x + 1.4, y: round.you.y - 1.4 });
      if (!(await api.run(g, SCAN_MS, () => {}))) return;
      outcome(g, round, board, id, true);
    }

    // First try: an empty pitch and a Start button, so the scan or the movement isn't missed.
    api.begin();
    api.newBoard();
    api.ready(() => play(newSeed()));
    return () => { untap?.(); api.stop(); };
  },
};
