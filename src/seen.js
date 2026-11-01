// Which challenges this browser has already finished in the full test, so a returning player
// can skip a demonstration they've already seen. Instructions always stay; only the example
// animation is folded away and the Through ball demonstration and practice become skippable.
// The short test never marks anything, so players who come from it still get the full test's
// normal instructions and practice.

const KEY = "siq.seen.v1";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export const hasSeen = (id) => Boolean(load()[id]);
export function markSeen(id) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...load(), [id]: true })); } catch { /* not remembered; fine */ }
}
