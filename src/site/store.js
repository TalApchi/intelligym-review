// The visitor's latest challenge result, kept only in this browser (no accounts, no server).
// Written by the game when the results screen is reached; read by results.html and the home page.

const KEY = "siq.lastResult.v1";

export function saveLastResult(result) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...result, at: new Date().toISOString() })); } catch { /* storage blocked: nothing to keep */ }
}

export function loadLastResult() {
  try {
    const r = JSON.parse(localStorage.getItem(KEY));
    return r && Array.isArray(r.rows) ? r : null;
  } catch { return null; }
}

export function clearLastResult() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

// The short campaign test (short-test.html) keeps its own result under its own key, so playing
// or replaying it never overwrites the full test's saved result above.
const SHORT_KEY = "siq.shortResult.v1";

export function saveShortResult(result) {
  try { localStorage.setItem(SHORT_KEY, JSON.stringify({ ...result, test: "short", at: new Date().toISOString() })); } catch { /* storage blocked */ }
}

export function loadShortResult() {
  try {
    const r = JSON.parse(localStorage.getItem(SHORT_KEY));
    return r && Array.isArray(r.rows) ? r : null;
  } catch { return null; }
}
