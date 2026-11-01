// Measurement hooks for the short campaign test (docs/measurement.md).
//
// NO analytics, advertising or tracking service is connected. emit() only:
//   1. pushes the event onto window.siqEvents (an in-page queue), and
//   2. dispatches a "siq:event" DOM event on window,
// so an approved integration can later listen in one place. Nothing leaves the browser.
//
// Campaign parameters: only the five standard utm_* values are read from the landing URL,
// kept for this browser session (sessionStorage) and attached to events and to the link into
// the full test. No click ids, no personal data.

export const CAMPAIGN_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const STORE = "siq.campaign";
const clean = (v) => String(v).slice(0, 100).replace(/[^\w .\-+:/]/g, "");

export function campaignParams(search = typeof location === "undefined" ? "" : location.search) {
  let kept = {};
  try { kept = JSON.parse(sessionStorage.getItem(STORE)) || {}; } catch { /* none */ }
  const q = new URLSearchParams(search);
  const fresh = Object.fromEntries(CAMPAIGN_KEYS.filter((k) => q.get(k)).map((k) => [k, clean(q.get(k))]));
  const all = Object.keys(fresh).length ? fresh : kept;
  try { if (Object.keys(fresh).length) sessionStorage.setItem(STORE, JSON.stringify(fresh)); } catch { /* fine */ }
  return all;
}

// A link that carries the campaign parameters along (and any extra ones).
export function withCampaign(href, extra = {}, params = campaignParams()) {
  const [path, query = ""] = href.split("?");
  const q = new URLSearchParams(query);
  for (const [k, v] of Object.entries({ ...params, ...extra })) q.set(k, v);
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

export const EVENTS = {
  shortStart: "short_test_start",
  shortTask: "short_test_task_complete",
  shortComplete: "short_test_complete",
  fullCta: "short_test_full_cta_click",
  fullFromShort: "full_test_start_from_short",
};

export function emit(name, detail = {}) {
  const evt = { event: name, ...detail, campaign: campaignParams(), at: new Date().toISOString() };
  if (typeof window === "undefined") return evt;
  (window.siqEvents = window.siqEvents || []).push(evt);
  window.dispatchEvent(new CustomEvent("siq:event", { detail: evt }));
  return evt;
}
