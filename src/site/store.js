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
