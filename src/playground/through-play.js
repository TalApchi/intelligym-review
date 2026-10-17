// Passing window: "Through ball". The screen for the move in through.js.
//
// You carry the ball on a populated half pitch. One teammate, ringed and labelled "Runner",
// makes a run in behind while the defence reacts. Press Pass (or the space bar) when you
// want to release it: the ball always travels at the same speed and is aimed where the
// runner is going, so the only decision is WHEN. The replay runs in slow motion with a
// timeline of every release moment, and tapping the timeline shows what that pass would
// have done.
//
// Order: a short demonstration (an automatic pass), one practice try (unscored, fewer
// defenders), then new situations.

import { makeMove, passAt, ballStart, explainPass, MISSED } from "./through.js";
import { BALL_SPEED } from "./logic.js";
import { drawPlayers, markPlayer, placePlayers, placeBall, clearMarks, showArrow, BOARD_R } from "../board.js";
import { newSeed, overlay, label, el } from "./common.js";

const DEMO_SEED = 7;
const PRACTICE_SEED = 1;
const AFTER = 0.35;     // s the picture keeps running after the ball arrives or is cut out
const SLOW = 0.5;       // replay speed

const STATUS = { through: "Through", intercepted: "Cut out", covered: "Space closed", missed: "Missed" };

export default {
  id: "through",
  group: "Passing window",
  version: "C",
  name: "Through ball",
  instruction: "You have the ball. Watch the ringed runner and the defenders, and press Pass when you want to release it. The ball always travels at the same speed and is played into the space ahead of the runner.",
  tests: "whether players can time a through ball against a moving defence: too early runs into a defender, too late lets the cover get across. There is no cue for the right moment; the replay shows when it was on.",
  mount(api) {
    let keyHandler = null;
    const unbindKey = () => { if (keyHandler) window.removeEventListener("keydown", keyHandler); keyHandler = null; };

    function setup(m) {
      const board = api.newBoard();
      const at = (f) => f(0);
      drawPlayers(board, [
        { id: "you", role: "you, on the ball", ...at(m.youAt), team: "home" },
        { id: "runner", role: `${m.runnerRole}, the runner`, ...at(m.runnerAt), team: "home" },
        ...m.teammates.map((p) => ({ id: p.id, role: p.role, ...at(p.at), team: "home" })),
        ...m.defenders.map((d) => ({ id: d.id, role: d.role, ...at(d.at), team: "away" })),
      ]);
      markPlayer(board, "you", "is-carrier");
      markPlayer(board, "runner", "is-target");
      const notes = overlay(board);
      const tag = label(notes, 0, 0, "Runner", "pg-label pg-runner");
      return { board, notes, tag };
    }

    // Everyone where they are at time t, the ball included.
    function draw(view, m, t, res) {
      const { board, tag } = view;
      const pos = { you: m.youAt(t), runner: m.runnerAt(t) };
      for (const p of m.teammates) pos[p.id] = p.at(t);
      for (const d of m.defenders) pos[d.id] = d.at(t);
      placePlayers(board, pos);
      tag.setAttribute("x", pos.runner.x.toFixed(2));
      tag.setAttribute("y", (pos.runner.y - BOARD_R - 1.4).toFixed(2));
      let ball;
      if (!res || t < res.tr) ball = ballStart(m, t);
      else if (t <= res.t) ball = res.ballAtT(t);
      else {
        // after the moment of truth the ball goes with whoever got it
        const who = res.kind === "through" ? pos.runner : pos[res.by.id];
        ball = { x: who.x + 0.6, y: who.y - BOARD_R + 0.2 };
      }
      placeBall(board, ball);
    }

    // The moment the ball is released: the aim line, and a ghost where the runner was.
    function showRelease(view, m, res) {
      showArrow(view.board, res.from, res.to, "board-plan", 1, 0.8);
      const r = m.runnerAt(res.tr);
      el("circle", { cx: r.x, cy: r.y, r: BOARD_R, class: "board-ghost" }, view.board.marks);
    }

    function markResult(view, res) {
      if (!res) return;
      if (res.kind === "through") markPlayer(view.board, "runner", "is-found");
      else markPlayer(view.board, res.by.id, "is-wrong");
    }

    // Plays the move. Live: Pass (button or space) releases the ball. Scripted (demo,
    // replay, what-if): the ball is released at `release`. Resolves with the pass result,
    // "missed", or false when interrupted.
    function animate(g, view, m, { release = null, speed = 1, from = 0, live = false, onTime } = {}) {
      let res = release === null ? null : passAt(m, release);
      let shown = false;
      if (live) {
        let now = 0;
        const pass = () => {
          if (res) return;
          res = passAt(m, now);
          api.action(null);
          unbindKey();
        };
        api.action("Pass", pass);
        keyHandler = (e) => { if (e.code === "Space" && !e.repeat) { e.preventDefault(); pass(); } };
        window.addEventListener("keydown", keyHandler);
        onTime = ((f) => (t) => { now = t; f?.(t); })(onTime);
      }
      let outcome = null;
      return api.run(g, Infinity, (ms) => {
        const t = from + (ms / 1000) * speed;
        onTime?.(t, res);
        if (res && !shown && t >= res.tr) { shown = true; showRelease(view, m, res); }
        draw(view, m, t, res && t >= res.tr ? res : null);
        if (res && t >= res.t + AFTER) { outcome = res; return "stop"; }
        if (!res && t >= m.timeLimit) { outcome = "missed"; return "stop"; }
      }).then((ok) => { unbindKey(); api.action(null); return ok ? outcome : false; });
    }

    // The timeline under the board: when a pass would have worked, and when you passed.
    // Tapping it plays "what if you passed here".
    function timeline(m, release, onPick) {
      const w = m.window, T = m.timeLimit;
      const box = document.createElement("div");
      box.className = "pg-tl";
      const pct = (t) => `${(Math.min(T, Math.max(0, t)) / T) * 100}%`;
      const bar = document.createElement("div");
      bar.className = "pg-tl__bar";
      bar.setAttribute("role", "slider");
      bar.setAttribute("aria-label", "Release moment: tap to see what a pass then would have done");
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", T.toFixed(1));
      bar.tabIndex = 0;
      // runs of the same result
      let i = 0;
      while (i < w.samples.length) {
        let j = i;
        const ok = w.samples[i].kind === "through";
        while (j + 1 < w.samples.length && (w.samples[j + 1].kind === "through") === ok) j++;
        const seg = document.createElement("span");
        seg.className = `pg-tl__seg ${ok ? "is-on" : "is-off"}`;
        seg.style.left = pct(w.samples[i].t);
        seg.style.width = `calc(${pct(w.samples[j].t + w.step)} - ${pct(w.samples[i].t)})`;
        bar.append(seg);
        i = j + 1;
      }
      const probe = document.createElement("span");
      probe.className = "pg-tl__probe";
      probe.hidden = true;
      const you = document.createElement("span");
      you.className = "pg-tl__you";
      you.hidden = release === null;
      if (release !== null) you.style.left = pct(release);
      const head = document.createElement("span");
      head.className = "pg-tl__head";
      bar.append(probe, you, head);
      const legend = document.createElement("div");
      legend.className = "pg-tl__legend";
      legend.innerHTML = `<span style="left:${pct(w.start / 2)}">Too early</span><span class="is-on" style="left:${pct((w.start + w.end) / 2)}">On</span><span style="left:${pct((w.end + T) / 2)}">Too late</span>`;
      const hint = document.createElement("p");
      hint.className = "pg-tl__hint";
      hint.textContent = release === null
        ? "You didn't pass. Tap the bar to try any moment."
        : "Your pass is the red line. Tap anywhere on the bar to see what a pass at that moment would have done.";
      const pick = (clientX) => {
        const r = bar.getBoundingClientRect();
        onPick(Math.min(T - 0.05, Math.max(0, ((clientX - r.left) / r.width) * T)));
      };
      bar.addEventListener("pointerup", (e) => pick(e.clientX));
      let kbT = release ?? w.start;
      bar.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Enter") return;
        e.preventDefault();
        if (e.key !== "Enter") kbT = Math.min(T - 0.05, Math.max(0, kbT + (e.key === "ArrowRight" ? 0.1 : -0.1)));
        onPick(kbT);
      });
      box.append(bar, legend, hint);
      return {
        el: box,
        playhead(t) { head.style.left = pct(t); head.hidden = t === null; },
        probe(t) { probe.hidden = false; probe.style.left = pct(t); },
      };
    }

    // ---- the sequence: demo → practice → situations ----

    async function demo() {
      unbindKey();
      const g = api.begin();
      const m = makeMove(DEMO_SEED, { practice: true });
      const view = setup(m);
      const release = m.window.start + m.window.length / 2;
      api.status("Demonstration: watch the ringed runner.");
      const res = await animate(g, view, m, {
        release,
        onTime: (t, r) => {
          if (r && t >= r.tr && t < r.t) api.status("Pass! Aimed at the space ahead of the runner, not at the runner.");
          else if (r && t >= r.t) api.status("Through.");
        },
      });
      if (!res) return;
      markResult(view, res);
      api.status("Demonstration");
      api.explain(`The ball always travels at the same speed (${BALL_SPEED} m/s), and it goes where the runner will be when it arrives (the dashed circle is where they were at the release). Too early and a defender is still in the way; too late and the cover gets across. Your turn: one practice try with fewer defenders.`);
      api.done({ replay: demo, next: practice, labels: { replay: "Watch again", next: "Practice" } });
    }

    async function practice() { await live(makeMove(PRACTICE_SEED, { practice: true }), "practice"); }
    async function situation(seed = newSeed()) { await live(makeMove(seed), "play"); }

    async function live(m, mode) {
      unbindKey();
      const g = api.begin();
      const view = setup(m);
      api.status(mode === "practice" ? "Practice (unscored): press Pass when you want to release it." : "Press Pass when you want to release it.");
      const res = await animate(g, view, m, { live: true });
      if (!res) return;
      result(g, view, m, res, mode);
    }

    function result(g, view, m, res, mode) {
      markResult(view, res === "missed" ? null : res);
      api.status(`${mode === "practice" ? "Practice: " : ""}${STATUS[res === "missed" ? "missed" : res.kind]}`);
      api.explain(res === "missed" ? MISSED : explainPass(m, res));
      const tl = timeline(m, res === "missed" ? null : res.tr, (t) => whatIf(m, t, res, mode));
      api.slot().append(tl.el);
      tl.playhead(null);
      const next = mode === "practice"
        ? { next: () => situation(), labels: { next: "Start" } }
        : { next: () => situation() };
      api.done({
        replay: () => replayIt(m, res, mode),
        retry: () => (mode === "practice" ? practice() : live(makeMove(m.seed), mode)),
        ...next,
      });
    }

    // Slow motion from a little before the release, with the playhead running along the
    // timeline. `release` is your own pass, or a "what if" moment picked on the timeline.
    async function replayIt(m, res, mode, release = res === "missed" ? null : res.tr, title = "Replay (slow motion)") {
      unbindKey();
      const g = api.begin();
      const view = setup(m);
      const yours = res === "missed" ? null : res.tr;
      const tl = timeline(m, yours, (t) => whatIf(m, t, res, mode));
      if (release !== yours) tl.probe(release);
      api.slot().append(tl.el);
      api.status(title);
      const from = Math.max(0, (release ?? m.window.start) - 1.5);
      const out = await animate(g, view, m, { release, speed: SLOW, from, onTime: (t) => tl.playhead(t) });
      if (!out) return;
      tl.playhead(null);
      markResult(view, out === "missed" ? null : out);
      const sentence = out === "missed" ? MISSED : explainPass(m, out);
      api.status(release === yours ? `Replay: ${STATUS[out === "missed" ? "missed" : out.kind]}` : `If you'd passed then: ${STATUS[out.kind]}`);
      api.explain(release === yours ? sentence : `${sentence} The dashed line on the timeline is that moment; the red line is your pass.`);
      api.done({
        replay: () => replayIt(m, res, mode, release, title),
        retry: () => (mode === "practice" ? practice() : live(makeMove(m.seed), mode)),
        next: () => situation(),
        labels: mode === "practice" ? { next: "Start" } : {},
      });
    }

    function whatIf(m, t, res, mode) {
      replayIt(m, res, mode, t, "What if you'd passed here? (slow motion)");
    }

    // First visit: an empty pitch and a Start button, then the demonstration.
    api.begin();
    api.newBoard();
    api.ready(demo);
    return () => { unbindKey(); api.stop(); };
  },
};
