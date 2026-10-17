// Passing window: "Through ball", the playground version (the scored one is challenge 5,
// through/play.js, which still uses the earlier move generator until this version is
// approved). Authored situations played out by the role-based simulation (through/sim.js):
// a demonstration, a practice try, then three different situations, each with a slow-motion
// replay and a "what if you'd passed here" timeline. "Play again" picks three more,
// avoiding the ones just seen.

import { THROUGH_SITUATIONS } from "../through/situations.js";
import { fixedMove, pickRounds, explainSim } from "../through/sim.js";
import { MISSED, BALL_SPEED, PLAYER_SPEED } from "../through/logic.js";
import { setupMove, playMove, markResult } from "../through/view.js";
import { timeline } from "../through/timeline.js";

const ROUNDS = 3;
const SLOW = 0.5; // replay speed
const HISTORY_KEY = "ig.through.history";
const STATUS = { through: "Through", intercepted: "Cut out", covered: "Space closed", short: "To feet, not in behind", missed: "Missed" };
const statusOf = (res) => STATUS[res === "missed" ? "missed" : res.kind];
const sentence = (m, res) => (res === "missed" ? MISSED : explainSim(m, res));
// The demonstration and practice look the same every time (fixed seed, a fair variant).
const fixed = (use, seed) => fixedMove(THROUGH_SITUATIONS, use, seed);

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {}; } catch { return {}; }
}
function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch { /* not saved; fine */ }
}

export default {
  id: "through",
  group: "Passing window",
  version: "D",
  name: "Through ball",
  instruction: "You have the ball. Watch the ringed runner and the defenders, and press Pass when you want to release it. The ball always travels at the same speed and is played into the space ahead of the runner. Each situation is different: who has the ball, who runs, and how their defence is set up.",
  tests: "whether players can time a through ball against a defence that reacts to the run: each defender has a job (marking, covering, pressing the ball, holding a zone), and the window comes out of those jobs. Situations and defensive behaviour are drafts for Omri's review.",
  mount(api) {
    let keyHandler = null;
    const unbindKey = () => { if (keyHandler) window.removeEventListener("keydown", keyHandler); keyHandler = null; };
    let rounds = [];

    const setup = (m) => setupMove(api.newBoard(), m);

    // Plays the move; live when release is null (Pass button or space bar).
    async function animate(g, view, opts = {}) {
      const play = playMove(view, { ...opts, alive: () => api.live(g) });
      if (opts.live) {
        const pass = () => { if (play.pass()) { api.action(null); unbindKey(); } };
        api.action("Pass", pass);
        keyHandler = (e) => { if (e.code === "Space" && !e.repeat) { e.preventDefault(); pass(); } };
        window.addEventListener("keydown", keyHandler);
      }
      const out = await play.done;
      unbindKey();
      api.action(null);
      return out;
    }

    async function demo() {
      unbindKey();
      const g = api.begin();
      const m = fixed("demo", 3);
      const view = setup(m);
      const release = m.window.start + m.window.length / 2;
      api.status(`Demonstration: ${m.title}. Watch the ringed runner.`);
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
      api.explain(`${m.about} Every player moves at the same top speed (${PLAYER_SPEED} m/s) and the ball always travels at ${BALL_SPEED} m/s, to where the runner will be when it arrives. Too early and the runner is still in front of their marker, or someone is in the lane; too late and a covering defender or the keeper gets there.`);
      api.done({ replay: demo, next: practice, labels: { replay: "Watch again", next: "Practice" } });
    }

    const practice = () => live(fixed("practice", 5), "practice");

    // Three different situations, widest window first.
    function newRounds() {
      const out = pickRounds(THROUGH_SITUATIONS, loadHistory(), ROUNDS);
      saveHistory(out.history);
      rounds = out.moves;
      return live(rounds[0], "play", 0);
    }
    const nextAfter = (mode, i) => (mode === "practice" ? newRounds : i < rounds.length - 1 ? () => live(rounds[i + 1], "play", i + 1) : newRounds);
    const nextLabel = (mode, i) => (mode === "practice" ? "Start" : i < rounds.length - 1 ? "Next situation" : "Play again");

    async function live(m, mode, i = 0) {
      unbindKey();
      const g = api.begin();
      const view = setup(m);
      const head = mode === "practice" ? "Practice (unscored)" : `Situation ${i + 1} of ${rounds.length}`;
      api.status(`${head}: ${m.title}`);
      api.explain(`${m.about} Press Pass when you want to release it.`);
      const res = await animate(g, view, { live: true });
      if (!res) return;
      markResult(view, res);
      api.status(`${head}: ${statusOf(res)}`);
      api.explain(sentence(m, res));
      const tl = timeline(m, res === "missed" ? null : res.tr, (t) => replayIt(m, res, mode, i, t));
      api.slot().append(tl.el);
      api.done({
        replay: () => replayIt(m, res, mode, i),
        retry: () => live(m, mode, i),
        next: nextAfter(mode, i),
        labels: { next: nextLabel(mode, i) },
      });
    }

    // Slow motion from a little before the release, with the playhead running along the
    // timeline. `release` is your own pass, or a "what if" moment picked on the timeline.
    async function replayIt(m, res, mode, i, release = res === "missed" ? null : res.tr) {
      unbindKey();
      const g = api.begin();
      const view = setup(m);
      const yours = res === "missed" ? null : res.tr;
      const whatIf = release !== yours;
      const tl = timeline(m, yours, (t) => replayIt(m, res, mode, i, t));
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
        replay: () => replayIt(m, res, mode, i, release),
        retry: () => live(m, mode, i),
        next: nextAfter(mode, i),
        labels: { next: nextLabel(mode, i) },
      });
    }

    // First visit: an empty pitch and a Start button, then the demonstration.
    api.begin();
    api.newBoard();
    api.ready(demo);
    return () => { unbindKey(); api.stop(); };
  },
};
