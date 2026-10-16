// Passing window, version B: "Close gate".
// Two defenders just in front of you sway in and out, so the gap between them opens and
// closes. The ball reaches the gap in about a quarter of a second, so what you see when you
// pass is nearly what the ball meets: there is no ball speed to learn. The skill left is
// reading whether the gap is opening or closing, and whether it is drifting off your line.

import { makeGateRound, simulatePass, explainGate, gateCrossing, ballAt, BALL_SPEED } from "./logic.js";
import { drawPlayers, markPlayer, placePlayers, placeBall } from "../board.js";
import { newSeed, onTap, el, overlay, label } from "./common.js";

const SLOW = 0.35;

export default {
  id: "pass-gate",
  group: "Passing window",
  version: "B",
  name: "Close gate",
  instruction: "Pass through the gap to your teammate. The ball reaches the gap almost at once, so watch whether the gap is opening or closing.",
  tests: "whether taking ball speed out of the problem makes the timing feel fair. The gap is right in front of you, so the outcome depends on reading the gap, and a slow replay shows how wide it was when the ball arrived.",
  mount(api) {
    let untap = null;

    function setup(round) {
      const board = api.newBoard();
      el("line", { x1: round.you.x, y1: round.you.y, x2: round.mate.x, y2: round.mate.y, class: "pg-lane" }, board.cues);
      drawPlayers(board, [
        { id: "you", role: "you", x: round.you.x, y: round.you.y, team: "home" },
        { id: "mate", role: "teammate", x: round.mate.x, y: round.mate.y, team: "home" },
        ...round.defenders.map((d) => ({ id: d.id, role: "defender", ...d.at(0), team: "away" })),
      ]);
      markPlayer(board, "you", "is-carrier");
      placeBall(board, round.you);
      return board;
    }
    const placeDefenders = (board, round, t) => placePlayers(board, Object.fromEntries(round.defenders.map((d) => [d.id, d.at(t)])));

    async function play(seed) {
      untap?.();
      const g = api.begin();
      const round = makeGateRound(seed);
      const board = setup(round);
      api.status("Pass when you think it gets through.");
      let release = null;
      const pass = () => { if (release === null) release = -1; };
      api.action("Pass", pass);
      untap = onTap(board, () => [{ id: "mate", ...round.mate }], 5, pass);
      const key = (e) => { if (e.key === " " || e.key === "Enter") { if (document.activeElement?.tagName !== "BUTTON") e.preventDefault(); pass(); } };
      window.addEventListener("keydown", key);
      let t = 0;
      const ok = await api.run(g, Infinity, (ms) => {
        t = ms / 1000;
        placeDefenders(board, round, t);
        if (release === -1) { release = t; return "stop"; }
      });
      window.removeEventListener("keydown", key);
      untap?.(); untap = null;
      if (!ok) return;
      api.action(null);
      const result = simulatePass(round.you, round.mate, release, round.defenders);
      await flight(g, board, round, release, result, 1);
    }

    // Draws the gap between the two defenders as a measured bracket, at time t.
    function bracket(layer, round, t) {
      const [l, r] = round.defenders.map((d) => d.at(t));
      const y = round.gateY - 3.2; // just beyond the gap, clear of you
      layer.replaceChildren();
      el("line", { x1: l.x + 1.8, y1: y, x2: r.x - 1.8, y2: y, class: "pg-measure" }, layer);
      for (const x of [l.x + 1.8, r.x - 1.8]) el("line", { x1: x, y1: y - 0.7, x2: x, y2: y + 0.7, class: "pg-measure" }, layer);
      label(layer, (l.x + r.x) / 2, y - 1.2, `${Math.max(0, round.gapAt(t)).toFixed(1)} m`);
    }

    async function flight(g, board, round, release, result, speed, from = release) {
      const end = result.t;
      const notes = overlay(board);
      const tc = Math.min(result.t, gateCrossing(round, release)); // the same moment the explanation uses
      const ok = await api.run(g, ((end - from) / speed) * 1000 + 300, (ms) => {
        const t = Math.min(end, from + (ms / 1000) * speed);
        placeDefenders(board, round, t);
        placeBall(board, t >= release ? ballAt(round.you, round.mate, release, t) : round.you);
        if (speed < 1) bracket(notes, round, Math.min(t, tc)); // the gap, frozen as the ball reaches it
      });
      if (!ok) return;
      bracket(notes, round, Math.min(end, tc));
      if (!result.through) markPlayer(board, result.by, "is-wrong");
      else markPlayer(board, "mate", "is-found");
      api.status(result.through ? "Through" : "Cut out");
      api.explain(explainGate(round, release, result));
      api.done({
        replay: () => replayIt(round, release, result),
        retry: () => play(round.seed),
        next: () => play(newSeed()),
      });
    }

    async function replayIt(round, release, result) {
      const g = api.begin();
      const board = setup(round);
      api.status("Replay, slowed down");
      flight(g, board, round, release, result, SLOW, Math.max(0, release - 0.8));
    }

    // First try: an empty pitch and a Start button, so the scan or the movement isn't missed.
    api.begin();
    api.newBoard();
    api.ready(() => play(newSeed()));
    return () => { untap?.(); api.stop(); };
  },
};
