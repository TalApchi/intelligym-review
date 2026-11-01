// Game settings. Every ⚙︎ default from docs/02-challenge-plan.md §4 lives here,
// so tuning never means touching logic. Times are in milliseconds, distances in metres.

import { BUILD } from "./build.js";

// The order of challenges. nextScreen() walks through this list.
export const PLAN = { challenges: ["spot", "track", "decide", "scan", "through"] };

// The five challenges. `instruction` is shown above the pitch before each challenge (kept short:
// one or two sentences). `measures` explains in plain language what the challenge's points
// describe on the results screen (games, not a validated measure of the skill).
export const CHALLENGES = {
  spot: {
    title: "Spot the change",
    instruction: "Remember where everyone is. The pitch goes blank and one player moves: tap them.",
    measures: "Noticing what changed in the picture around you.",
    built: true,
  },
  track: {
    title: "Tracking runners",
    instruction: "Two teammates light up. Keep your eyes on them while everyone runs, then tap both.",
    measures: "Keeping track of two moving teammates at once.",
    built: true,
  },
  decide: {
    title: "Tactical choice",
    instruction: "You have the ball. Pick what you'd do, then play it.",
    measures: "How your choice on the ball compares with our draft ranking of the options.",
    built: true,
  },
  scan: {
    title: "Opponents vanish",
    instruction: "Look at the whole picture while the ball comes to you. The opponents disappear: tap the teammate you'd pass to.",
    measures: "How much of the picture you kept in mind when you chose a pass.",
    built: true,
  },
  through: {
    title: "Through ball",
    instruction: "Press Pass (or the space bar) to play the ball into the space ahead of the ringed runner. Too early and a defender is still in the way; too late and it's cut out, or the runner is offside.",
    measures: "Timing a pass into a run: not too early, not too late.",
    built: true,
  },
};

// The two ways to play. `options` changes a challenge's length for that plan only; the
// rules, scoring and the 100-point maximum per challenge stay the same.
//   full   the five-challenge test (500 points), with demonstrations and practice
//   short  the campaign taster (short-test.html): three challenges, one round each (300
//          points). Its result is stored separately and is not comparable with the full test.
export const PLANS = {
  full: { id: "full", label: "Full test", challenges: PLAN.challenges, options: {} },
  short: {
    id: "short",
    label: "Short test",
    challenges: ["spot", "track", "through"],
    options: {
      spot: { rounds: 1 },
      track: { rounds: 1 },
      through: { rounds: 1, practice: false, pickFrom: 2 },
    },
  },
};
export const maxPoints = (plan) => plan.challenges.length * 100;

export const SPOT = {
  rounds: 2,             // ⚙︎ rounds per play
  homeCount: 6,          // ⚙︎ our players on the board
  awayCount: 5,          // ⚙︎ opponents on the board
  studyMs: 3500,         // ⚙︎ how long the picture is shown (was 3000; +0.5 s for a gentler start)
  hideMs: 800,           // ⚙︎ blank pitch between the two pictures
  answerMs: 10000,       // ⚙︎ time to tap the player who moved
  moveMin: 6,            // ⚙︎ shortest move, metres
  moveMax: 9,            // ⚙︎ longest move, metres
  // "Never just along the same line": the move must change BOTH the across
  // and the up/down position by at least this much, so it is never a tiny slide
  // along the player's own line. (Our reading of the rule; adjust if Omri disagrees.)
  minAxisChange: 2,      // ⚙︎ metres
  clearance: 6,          // ⚙︎ the moved player lands at least this far from everyone else (center to center)
  edgeMargin: 3,         // ⚙︎ keep players this far inside the touchlines and goal line
  jitter: 1.5,           // ⚙︎ random nudge to formation spots, so rounds never repeat exactly
  hitRadius: 4.5,        // ⚙︎ a tap within this many metres of a player counts as that player
};

export const TRACK = {
  rounds: 2,             // ⚙︎ rounds per play
  players: 11,           // ⚙︎ identical teammates on the board (no opponents)
  targets: 2,            // ⚙︎ how many to follow (was 3; speeds unchanged so the effect of the count shows on its own)
  markMs: 2500,          // ⚙︎ the red pulse on the targets
  fadeMs: 400,           // ⚙︎ the pulse fading out before everyone moves
  moveMs: 8000,          // ⚙︎ how long everyone moves
  speed: 5,              // ⚙︎ metres per second in round 1 (Tal's playtest: 4 felt too slow, 5 felt right)
  speedUp: 0.2,          // ⚙︎ each later round is this much faster (+20 %: 6 m/s in round 2)
  legs: 4,               // ⚙︎ each run is made of this many straight-ish legs, smoothed into a curve
  spacing: 6,            // ⚙︎ players start and finish at least this far apart (center to center)
  edgeMargin: 4,         // ⚙︎ keep runs this far inside the touchlines and goal line
  crossDistance: 4,      // ⚙︎ a target "crossed paths" with someone if they came this close while moving
  hitRadius: 4.5,        // ⚙︎ a tap within this many metres of a player counts as that player
};

export const DECIDE = {
  situations: 3,         // ⚙︎ situations per play
  // Draft (unapproved) scenarios: only in the review demo and the local preview.
  // Production (src/build.js as committed) uses only scenarios Omri has approved.
  allowDrafts: BUILD.allowDrafts,
  historyKey: "ig.decide.history", // localStorage: which scenarios this browser has seen
  // Each option scores one of these (scenarios.js), ties allowed. The challenge is the average
  // over the situations, so it stays out of 100. Scheme approved by Omri; each scenario's scores are still drafts.
  scale: [100, 75, 50, 25], // ⚙︎
  labels: { 100: "Top option", 75: "Good option", 50: "Fair option", 25: "Riskier option" },
  outcomeMs: 1150,       // ⚙︎ how long the outcome animation plays (was 1600; shorter dead time, same picture)
};

export const SCAN = {
  // Look time per situation, shorter each time (progression). Its length sets how many situations.
  lookMs: [2400, 2000, 1600], // ⚙︎
  // Draft (unapproved) situations: only in the review demo and the local preview, as for Tactical choice.
  allowDrafts: BUILD.allowDrafts,
  historyKey: "ig.scan.history", // localStorage: which situations this browser has seen (shared with the playground)
  points: { best: 100, reasonable: 50, poor: 0 }, // ⚙︎ PROVISIONAL, like Tactical choice
  hitRadius: 3.6,        // ⚙︎ metres; teammates are at least 4 m apart
};

export const THROUGH = {
  // Scored rounds after the demonstration and the practice try: different situations
  // (through/situations.js), widest window first, none repeated in a play.
  rounds: 3,             // ⚙︎
  demoSeed: 3,           // the demonstration and the practice try are the same for everyone
  practiceSeed: 5,
  historyKey: "ig.through.history", // situations seen recently in this browser
  points: { through: 100, close: 50, miss: 0 }, // ⚙︎ PROVISIONAL
  close: 0.25,           // ⚙︎ s: a pass this close to the window counts as "just early / just late"
  replaySpeed: 0.5,      // ⚙︎ slow-motion replay
};

// Results tiers: game settings, not ability levels. `min` is the share of available points.
export const TIERS = [
  { min: 0, name: "Warm-up" },   // ⚙︎
  { min: 0.5, name: "Sharp" },   // ⚙︎
  { min: 0.9, name: "Locked in" }, // ⚙︎
];
