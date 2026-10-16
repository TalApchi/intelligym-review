// Passing window, version A: "Same clock".
// You, a teammate up the pitch, and one or two defenders shuttling across the lane on
// visible lines. The lane and the defenders' lines carry a mark every half second of
// travel: the ball covers one lane mark per half second, a defender one mark on their line.
// So "the ball needs 3 marks to get there, the defender is 2 marks away" can be read off
// the picture without knowing the ball's speed. Ball speed never changes.

import { makeClockRound, simulatePass, beatMarks, explainClock, ballAt, BALL_SPEED, BEAT } from "./logic.js";
import { drawPlayers, markPlayer, placePlayers, placeBall, setTappable } from "../board.js";
import { newSeed, onTap, el, overlay, label } from "./common.js";

const SLOW = 0.5; // replay speed

export default {
  id: "pass-clock",
  group: "Passing window",
  version: "A",
  name: "Same clock",
  instruction: "Pass to your teammate without a defender cutting it out. Each mark is half a second: the ball moves one mark along its path, a defender one mark along their line.",
  tests: "whether a shared unit of time, drawn on the pitch, lets a first-timer judge the pass without knowing the ball's speed. The marks only measure; they never say when to pass.",
  mount(api) {
    let untap = null;

    function setup(round) {
      const board = api.newBoard();
      // Lines and marks go under the players.
      const g = el("g", { class: "pg-clock" }, board.cues);
      el("line", { x1: round.you.x, y1: round.you.y, x2: round.mate.x, y2: round.mate.y, class: "pg-lane" }, g);
      for (const p of beatMarks(round.you, round.mate, BALL_SPEED)) el("circle", { cx: p.x, cy: p.y, r: 0.55, class: "pg-beat pg-beat--ball" }, g);
      for (const r of round.rails) {
        el("line", { x1: r.a.x, y1: r.a.y, x2: r.b.x, y2: r.b.y, class: "pg-rail" }, g);
        const len = r.b.x - r.a.x, step = r.speed * BEAT;
        for (let s = 0; s <= len + 0.01; s += step) el("line", { x1: r.a.x + s, y1: r.a.y - 0.7, x2: r.a.x + s, y2: r.a.y + 0.7, class: "pg-beat pg-beat--rail" }, g);
      }
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
      const round = makeClockRound(seed);
      const board = setup(round);
      api.status("Pass when you think it gets through.");
      let release = null;
      const pass = () => { if (release === null) release = -1; };
      api.action("Pass", pass);
      untap = onTap(board, () => [{ id: "mate", ...round.mate }], 5, pass);
      const key = (e) => { if (e.key === " " || e.key === "Enter") { if (document.activeElement?.tagName !== "BUTTON") e.preventDefault(); pass(); } };
      window.addEventListener("keydown", key);
      setTappable(board, false);
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

    // The pass from `release` to the end, at `speed` (1 = real time). Pure function of time.
    async function flight(g, board, round, release, result, speed, from = release) {
      const end = result.t;
      const beatLayer = overlay(board);
      const ok = await api.run(g, ((end - from) / speed) * 1000 + 300, (ms) => {
        const t = Math.min(end, from + (ms / 1000) * speed);
        placeDefenders(board, round, t);
        placeBall(board, t >= release ? ballAt(round.you, round.mate, release, t) : round.you);
        if (speed < 1) {
          beatLayer.replaceChildren();
          if (t >= release) {
            const b = ballAt(round.you, round.mate, release, t);
            label(beatLayer, b.x + 2.4, b.y + 0.8, `${((t - release) / BEAT).toFixed(1)} marks`, "pg-label pg-label--beat");
          }
        }
      });
      if (!ok) return;
      if (!result.through) markPlayer(board, result.by, "is-wrong");
      else markPlayer(board, "mate", "is-found");
      api.status(result.through ? "Through" : "Cut out");
      api.explain(explainClock(round, release, result));
      api.done({
        replay: () => replayIt(round, release, result),
        retry: () => play(round.seed),
        next: () => play(newSeed()),
      });
    }

    // Replay: from a second before you passed, at half speed, counting marks.
    async function replayIt(round, release, result) {
      const g = api.begin();
      const board = setup(round);
      api.status("Replay at half speed");
      flight(g, board, round, release, result, SLOW, Math.max(0, release - 1));
    }

    // First try: an empty pitch and a Start button, so the scan or the movement isn't missed.
    api.begin();
    api.newBoard();
    api.ready(() => play(newSeed()));
    return () => { untap?.(); api.stop(); };
  },
};
