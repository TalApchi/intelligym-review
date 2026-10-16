// Scan before receiving, version B: "Tunnel view".
// You have your back to goal and a teammate is about to pass to you. Look around; then
// fog covers everything except a small circle around you, and three arrows on the pitch
// offer your first touch. Opponents running at you start outside the circle, so only the
// scan tells you which way is open.

import { makeTunnelRound, touchTarget, tunnelSpace, explainTunnel, TOUCHES, TUNNEL_R, BALL_SPEED } from "./logic.js";
import { drawPlayers, markPlayer, placePlayers, placeBall, showCues, clearCues, BOARD_R } from "../board.js";
import { ease, lerp, dist, newSeed, el, overlay, label } from "./common.js";

const SCAN_MS = 1800;
const CLOSE_MS = 600;
const TOUCH_MS = 1000;

export default {
  id: "scan-tunnel",
  group: "Scan before receiving",
  version: "B",
  name: "Tunnel view",
  instruction: "Look around before the ball arrives: where is the pressure coming from? Then choose your first touch by tapping one of the arrows.",
  tests: "whether the scan is used to read where pressure is coming from, rather than who to pass to. The choice is your first touch, made with arrows on the pitch that stay visible in the fog.",
  mount(api) {
    function setup(round) {
      const board = api.newBoard();
      drawPlayers(board, [
        { id: "you", role: "you", x: round.you.x, y: round.you.y, team: "home" },
        { id: "passer", role: "teammate passing to you", x: round.passer.x, y: round.passer.y, team: "home" },
        ...round.home.map((m) => ({ ...m, role: "teammate", team: "home" })),
        ...round.away.map((o) => ({ ...o, role: "opponent", team: "away" })),
      ]);
      markPlayer(board, "you", "is-carrier");
      showCues(board, round.away.map((o) => ({ from: o, to: o.run, team: "away" })));
      placeBall(board, { x: round.passer.x, y: round.passer.y - 2 });
      // Fog: a dark sheet with a round hole around you. Drawn above the players and the ball.
      const id = `fog-${round.seed}`;
      const mask = el("mask", { id }, board.svg.querySelector("defs"));
      el("rect", { x: -10, y: -10, width: 90, height: 75, fill: "#fff" }, mask);
      const hole = el("circle", { cx: round.you.x, cy: round.you.y, r: 60, fill: "#000" }, mask);
      const fog = el("rect", { x: -10, y: -10, width: 90, height: 75, class: "pg-fog", mask: `url(#${id})` }, board.svg);
      fog.style.opacity = "0";
      const ring = el("circle", { cx: round.you.x, cy: round.you.y, r: TUNNEL_R, class: "pg-fog-ring" }, board.svg);
      ring.style.opacity = "0";
      const arrows = overlay(board, "pg-touches");
      return { board, fog, hole, ring, arrows };
    }

    function drawArrows(round, view, onPick) {
      view.arrows.replaceChildren();
      for (const dir of Object.keys(TOUCHES)) {
        const to = touchTarget(round, dir);
        const ux = (to.x - round.you.x) / dist(round.you, to), uy = (to.y - round.you.y) / dist(round.you, to);
        const g = el("g", { class: "pg-touch", role: "button", tabindex: "0", "aria-label": TOUCHES[dir].label, "data-dir": dir }, view.arrows);
        const x1 = round.you.x + ux * (BOARD_R + 0.8), y1 = round.you.y + uy * (BOARD_R + 0.8);
        el("line", { x1, y1, x2: to.x, y2: to.y, class: "pg-touch__hit" }, g);
        el("line", { x1, y1, x2: to.x - ux * 0.6, y2: to.y - uy * 0.6, class: "pg-touch__shaft", "marker-end": "url(#board-arrow-red)" }, g);
        el("circle", { cx: to.x, cy: to.y, r: 1.4, class: "pg-touch__end" }, g);
        const pick = (e) => { e.preventDefault(); onPick(dir); };
        g.addEventListener("click", pick);
        g.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") pick(e); });
      }
    }

    async function play(seed) {
      const g = api.begin();
      const round = makeTunnelRound(seed);
      const view = setup(round);
      api.status("Look around: where is the pressure coming from?");
      if (!(await api.run(g, SCAN_MS, (t) => api.timer(t / SCAN_MS)))) return;
      api.timer(null);
      // The fog closes in while the ball travels to you.
      api.status("Here's the ball…");
      const from = { x: round.passer.x, y: round.passer.y - 2 }, to = { x: round.you.x, y: round.you.y + 2.6 };
      const ms = Math.max(CLOSE_MS, (dist(from, to) / BALL_SPEED) * 1000);
      const closed = await api.run(g, ms, (t) => {
        const u = Math.min(1, t / CLOSE_MS);
        view.fog.style.opacity = String(Math.min(1, u * 1.4));
        view.hole.setAttribute("r", (60 + (TUNNEL_R - 60) * ease(u)).toFixed(2));
        view.ring.style.opacity = String(u);
        placeBall(view.board, lerp(from, to, Math.min(1, t / ms)));
      });
      if (!closed) return;
      clearCues(view.board);
      api.status("Your first touch: tap an arrow.");
      drawArrows(round, view, (dir) => outcome(g, round, view, dir));
    }

    // Fog lifts; you take the touch while the opponents run on. Then the explanation.
    async function outcome(g, round, view, dir, replay = false) {
      view.arrows.querySelectorAll(".pg-touch").forEach((a) => a.classList.toggle("is-picked", a.dataset.dir === dir));
      view.arrows.querySelectorAll(".pg-touch").forEach((a) => a.replaceWith(a.cloneNode(true))); // no second pick
      const target = touchTarget(round, dir);
      const ballFrom = { x: round.you.x, y: round.you.y + 2.6 };
      api.status(replay ? "Replay" : "");
      const ok = await api.run(g, TOUCH_MS * (replay ? 1.6 : 1), (t) => {
        const u = ease(Math.min(1, t / (TOUCH_MS * (replay ? 1.6 : 1))));
        view.fog.style.opacity = String(1 - Math.min(1, u * 2));
        view.ring.style.opacity = String(1 - Math.min(1, u * 2));
        const pos = { you: lerp(round.you, target, u) };
        for (const o of round.away) pos[o.id] = lerp(o, o.run, u);
        placePlayers(view.board, pos);
        placeBall(view.board, lerp(ballFrom, { x: target.x + 1.2, y: target.y - 1.2 }, u));
      });
      if (!ok) return;
      view.arrows.classList.add("is-done");
      // Show the nearest opponent after the touch, with the distance.
      const near = round.away.reduce((a, o) => (dist(o.run, target) < dist(a.run, target) ? o : a));
      const notes = overlay(view.board);
      el("line", { x1: target.x, y1: target.y, x2: near.run.x, y2: near.run.y, class: "pg-measure" }, notes);
      const mx = (target.x + near.run.x) / 2, my = (target.y + near.run.y) / 2, dd = dist(target, near.run) || 1;
      label(notes, mx + ((near.run.y - target.y) / dd) * 3, my - ((near.run.x - target.x) / dd) * 3 + 0.8, `${dd.toFixed(0)} m`); // beside the line, not on a player
      const best = Object.entries(tunnelSpace(round)).sort((a, b) => b[1] - a[1])[0][0];
      view.arrows.querySelectorAll(".pg-touch").forEach((a) => a.classList.toggle("is-best", a.dataset.dir === best && best !== dir));
      api.status(dir === best ? "Space" : "Closed down");
      api.explain(dir === best ? explainTunnel(round, dir) : `${explainTunnel(round, dir)} The open touch is circled.`);
      api.done({ replay: () => replayIt(round, dir), retry: () => play(round.seed), next: () => play(newSeed()) });
    }

    async function replayIt(round, dir) {
      const g = api.begin();
      const view = setup(round);
      api.status("Replay: this is what the scan showed.");
      placeBall(view.board, { x: round.you.x, y: round.you.y + 2.6 });
      drawArrows(round, view, () => {});
      if (!(await api.run(g, SCAN_MS, () => {}))) return;
      clearCues(view.board);
      outcome(g, round, view, dir, true);
    }

    // First try: an empty pitch and a Start button, so the scan or the movement isn't missed.
    api.begin();
    api.newBoard();
    api.ready(() => play(newSeed()));
    return () => api.stop();
  },
};
