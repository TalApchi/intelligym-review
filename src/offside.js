// Offside, as far as our pictures can show it. Pure functions, no DOM; tested in
// site/tests/offside.test.mjs.
//
// Based on IFAB Laws of the Game, Law 11 (checked 2026-11-01 on theifab.com, "latest" edition):
//   11.1 Being in an offside position is not an offence. A player is in an offside position
//        if any part of the head, body or feet is in the opponents' half (excluding the
//        halfway line) AND nearer the opponents' goal line than both the ball and the
//        second-last opponent. A player level with the second-last opponent, or with the
//        last two opponents, is not in an offside position. Hands and arms don't count.
//   11.2 A player in an offside position at the moment the ball is played or touched by a
//        team-mate commits an offence only by becoming involved in active play: playing or
//        touching the ball passed by the team-mate, interfering with an opponent, or gaining
//        an advantage from a rebound / deflection / save.
//   11.3 No offence when receiving directly from a goal kick, throw-in or corner kick.
//
// WHAT OUR PICTURES CAN AND CAN'T SAY
// Every player is a dot of the same size, placed by its center. A dot has no head, feet or
// arms, so we compare centers: because every dot is the same size, the dot edge nearest the
// goal line is just as far ahead as the center. Positions within LEVEL_TOL metres of each
// other count as level (onside), the same tolerance for the second-last opponent, the ball
// and the halfway line. This is a game approximation, not body-part precision, and it is
// applied the same way everywhere.
//
// We only judge what our challenges represent: the receiver of one open-play pass. No
// restarts other than the three named in 11.3, no rebounds, no "interfering with an
// opponent" beyond the receiver challenging for the pass, no refereeing engine.

export const LEVEL_TOL = 0.5; // m: closer than this counts as level (not offside)

// Our pictures: y = 0 is the opponents' goal line, halfway is y = 52.5, we attack up the
// screen. A frame for the other direction would be { goalLineY: 105, halfwayY: 52.5 }.
export const ATTACK_UP = { goalLineY: 0, halfwayY: 52.5 };

const depthIn = (frame) => (p) => Math.abs(p.y - frame.goalLineY);

/**
 * Is `player` in an offside position at the moment the ball is played?
 * player, ball: { x, y } at that moment. opponents: [{ x, y }] at that moment, keeper
 * included. Returns { offside, reason, line, ... } where `line` is the y of the offside
 * line (the deeper of the ball, the second-last opponent and halfway, as seen from the goal).
 * `offside: null` means the picture doesn't hold enough opponents to judge (fewer than two).
 */
export function offsidePosition({ player, ball, opponents, frame = ATTACK_UP, tol = LEVEL_TOL }) {
  if (!opponents || opponents.length < 2) return { offside: null, reason: "insufficient" };
  const depth = depthIn(frame);
  const toY = (dep) => frame.goalLineY + Math.sign(frame.halfwayY - frame.goalLineY) * dep;
  const d = depth(player);
  const half = depth({ y: frame.halfwayY });
  const sorted = opponents.map((o) => ({ o, d: depth(o) })).sort((a, b) => a.d - b.d);
  const second = sorted[1];
  const ballD = depth(ball);
  const inOpponentsHalf = d < half - tol;
  const aheadOfBall = d < ballD - tol;
  const aheadOfSecondLast = d < second.d - tol;
  const lineD = Math.min(half, ballD, second.d);
  const offside = inOpponentsHalf && aheadOfBall && aheadOfSecondLast;
  const reason = offside ? "offside"
    : !inOpponentsHalf ? "own-half"
    : !aheadOfBall ? "behind-ball"
    : Math.abs(d - second.d) <= tol ? "level"
    : "behind-second-last";
  return {
    offside, reason, line: toY(lineD), lineBy: lineD === second.d ? "opponent" : lineD === ballD ? "ball" : "halfway",
    secondLast: second.o, margin: second.d - d, inOpponentsHalf, aheadOfBall, aheadOfSecondLast,
  };
}

/**
 * Offside offence (11.2, 11.3) for the receiver of a pass.
 * position: the result of offsidePosition at the moment of the pass.
 * involvement: "plays" (plays or touches the ball), "challenges" (challenges an opponent for
 * it), or "none" (not involved: the ball never got near them).
 * restart: "goal-kick" | "throw-in" | "corner" when received directly from one, else null.
 */
export function offsideOffence(position, involvement, restart = null) {
  if (!position || position.offside !== true) return false;
  if (["goal-kick", "throw-in", "corner"].includes(restart)) return false;
  return involvement === "plays" || involvement === "challenges";
}

// For a frozen picture where we pass to a teammate: the receiver plays the ball, so an
// offside position is an offside offence. Returns the position result plus `offence`.
export function judgePass({ receiver, ball, opponents, frame = ATTACK_UP }) {
  const pos = offsidePosition({ player: receiver, ball, opponents, frame });
  return { ...pos, offence: offsideOffence(pos, "plays") };
}

// Offside needs every opponent, and the goalkeeper is usually the last one. Authored pictures
// drawn without a keeper (Tactical choice, Opponents vanish) get one in the usual place, on
// their goal line, and it is drawn on the board, so the picture and the judgment agree.
// `away` is the authored list of [id, role, x, y].
export const DEFAULT_KEEPER = ["a-gk", "goalkeeper", 34, 2.5];
export const withKeeper = (away) => (away.some((p) => p[1] === "goalkeeper") ? away : [...away, DEFAULT_KEEPER]);
