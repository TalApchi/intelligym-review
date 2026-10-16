// The experience flow: which screen comes next.
//
// OWNER: Tal. Claude does not edit the body of nextScreen().
//
// A "screen" is a small plain object:
//   { name: "landing" }
//   { name: "intro",    index: 0 }   // instructions for challenge number `index`
//   { name: "play",     index: 0 }   // playing challenge `index`
//   { name: "feedback", index: 0 }   // result of challenge `index`
//   { name: "results" }              // summary after the last challenge
//
// An "event" is a string saying what just happened:
//   "start"    the visitor pressed TEST YOURSELF on the landing
//   "ready"    the visitor pressed Ready on an intro screen
//   "done"     a challenge finished
//   "continue" the visitor pressed Continue on a feedback screen
//   "restart"  the visitor pressed Play again on the results screen
//
// A "plan" lists the challenges in order:
//   { challenges: ["spot", "track", "decide"] }
//
// Example:
//   nextScreen({ name: "landing" }, "start", plan)  ->  { name: "intro", index: 0 }

/**
 * Returns the screen that follows `current` when `event` happens.
 * If the event makes no sense on the current screen, returns `current` unchanged.
 * Must not modify `current` or `plan` (always return a new object or `current` itself).
 *
 * @param {{name: string, index?: number}} current
 * @param {string} event
 * @param {{challenges: string[]}} plan
 * @returns {{name: string, index?: number}}
 */
export function nextScreen(current, event, plan) {
  if (current.name === "landing" && event === "start") {
    return { name: "intro", index: 0 };
  }

  if (current.name === "intro" && event === "ready") {
  return { name: "play", index: current.index };
}

if (current.name === "play" && event === "done") {
  return { name: "feedback", index: current.index };
}

if (current.name === "feedback" && event === "continue") {
  const nextIndex = current.index + 1;

  if (nextIndex < plan.challenges.length) {
    return { name: "intro", index: nextIndex };
  }

  return { name: "results" };
}


if (current.name === "results" && event === "restart") {
  return { name: "landing" };
}

  return current;
}