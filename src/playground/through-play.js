// Passing window: "Through ball", the playground version (the scored one is challenge 5,
// through/play.js). Same move, same view: a demonstration, a practice try, then new
// situations, with a slow-motion replay and a "what if you'd passed here" timeline.

import { makeMove, explainPass, MISSED, BALL_SPEED, PLAYER_SPEED } from "../through/logic.js";
import { setupMove, playMove, markResult } from "../through/view.js";
import { timeline } from "../through/timeline.js";
import { newSeed } from "./common.js";

const DEMO_SEED = 7;
const PRACTICE_SEED = 1;
const SLOW = 0.5; // replay speed
const STATUS = { through: "Through", intercepted: "Cut out", covered: "Space closed", missed: "Missed" };
const statusOf = (res) => STATUS[res === "missed" ? "missed" : res.kind];
const sentence = (m, res) => (res === "missed" ? MISSED : explainPass(m, res));

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

    const setup = (m) => setupMove(api.newBoard(), m);

    // Plays the move; live when release is null (Pass button or space bar).
    async function animate(g, view, opts = {}) {
      const play = playMove(view, { ...opts, alive: () => api.live(g) });
      if (opts.release === undefined || opts.release === null) {
        if (opts.live) {
          const pass = () => { if (play.pass()) { api.action(null); unbindKey(); } };
          api.action("Pass", pass);
          keyHandler = (e) => { if (e.code === "Space" && !e.repeat) { e.preventDefault(); pass(); } };
          window.addEventListener("keydown", keyHandler);
        }
      }
      const out = await play.done;
      unbindKey();
      api.action(null);
      return out;
    }

    async function demo() {
      unbindKey();
      const g = api.begin();
      const m = makeMove(DEMO_SEED, { practice: true });
      const view = setup(m);
      const release = m.window.start + m.window.length / 2;
      api.status("Demonstration: watch the ringed runner.");
      const res = await animate(g, view, {
        release,
        onTime: (t, r) => {
          if (r && t >= r.tr && t < r.t) api.status("Pass! Aimed at the space ahead of the runner.");
          else if (r && t >= r.t) api.status("Through.");
        },
      });
      if (!res) return;
      markResult(view, res);
      api.status("Demonstration");
      api.explain(`Every player moves at the same speed (${PLAYER_SPEED} m/s) and the ball always travels at ${BALL_SPEED} m/s. It goes where the runner will be when it arrives (the dashed circle is where they were at the release). Too early and a defender is still in the way; too late and the cover gets across. Your turn: one practice try with fewer defenders.`);
      api.done({ replay: demo, next: practice, labels: { replay: "Watch again", next: "Practice" } });
    }

    const practice = () => live(makeMove(PRACTICE_SEED, { practice: true }), "practice");
    const situation = (seed = newSeed()) => live(makeMove(seed), "play");
    const again = (m, mode) => (mode === "practice" ? practice() : live(m, mode));

    async function live(m, mode) {
      unbindKey();
      const g = api.begin();
      const view = setup(m);
      api.status(mode === "practice" ? "Practice (unscored): press Pass when you want to release it." : "Press Pass when you want to release it.");
      const res = await animate(g, view, { live: true });
      if (!res) return;
      markResult(view, res);
      api.status(`${mode === "practice" ? "Practice: " : ""}${statusOf(res)}`);
      api.explain(sentence(m, res));
      const tl = timeline(m, res === "missed" ? null : res.tr, (t) => replayIt(m, res, mode, t));
      api.slot().append(tl.el);
      api.done({
        replay: () => replayIt(m, res, mode),
        retry: () => again(m, mode),
        next: () => situation(),
        labels: mode === "practice" ? { next: "Start" } : {},
      });
    }

    // Slow motion from a little before the release, with the playhead running along the
    // timeline. `release` is your own pass, or a "what if" moment picked on the timeline.
    async function replayIt(m, res, mode, release = res === "missed" ? null : res.tr) {
      unbindKey();
      const g = api.begin();
      const view = setup(m);
      const yours = res === "missed" ? null : res.tr;
      const whatIf = release !== yours;
      const tl = timeline(m, yours, (t) => replayIt(m, res, mode, t));
      if (whatIf) tl.probe(release);
      api.slot().append(tl.el);
      api.status(whatIf ? "What if you'd passed here? (slow motion)" : "Replay (slow motion)");
      const from = Math.max(0, (release ?? m.window.start) - 1.5);
      const out = await animate(g, view, { release, speed: SLOW, from, onTime: (t) => tl.playhead(t) });
      if (!out) return;
      tl.playhead(null);
      markResult(view, out);
      api.status(whatIf ? `If you'd passed then: ${statusOf(out)}` : `Replay: ${statusOf(out)}`);
      api.explain(whatIf ? `${sentence(m, out)} The dashed line on the timeline is that moment; the red line is your pass.` : sentence(m, out));
      api.done({
        replay: () => replayIt(m, res, mode, release),
        retry: () => again(m, mode),
        next: () => situation(),
        labels: mode === "practice" ? { next: "Start" } : {},
      });
    }

    // First visit: an empty pitch and a Start button, then the demonstration.
    api.begin();
    api.newBoard();
    api.ready(demo);
    return () => { unbindKey(); api.stop(); };
  },
};
