// Small helpers shared by the site pages. Presentation only; no copy lives here.

import { BUILD } from "../build.js";

export const REVIEW = BUILD.review;

export const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Content strings may contain simple trusted HTML (links in FAQ answers). Everything else is escaped.
export const html = (s) => String(s ?? "");

export const ext = (url, label, cls = "") =>
  `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}<span class="ext" aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>`;

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
export const fmtDate = (iso) => (iso ? DATE.format(new Date(iso + "T12:00:00")) : "");

// Review-only note. Empty in the public build.
export function reviewNote(text) {
  if (!REVIEW || !text) return "";
  return `<aside class="review-note"><span class="review-note__tag">Review</span> ${html(text)}</aside>`;
}

// Entries with a status other than "verified" (or none) appear only in the review build,
// so unresolved details never read as confirmed in public.
export function shown(entry) {
  if (!entry || entry.visible === false) return false;
  if (!entry.status || entry.status === "verified") return true;
  return REVIEW;
}

export const arrow = `<svg class="btn__arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// kind: "cta" (yellow, the main action), "primary" (teal) or "ghost"
export const button = (cta, kind = "cta") =>
  `<a class="btn btn--${kind}" href="${esc(cta.href)}">${esc(cta.label)}${kind !== "ghost" ? ` ${arrow}` : ""}</a>`;

export const section = (id, title, body, cls = "") =>
  `<section class="sec ${cls}"${id ? ` id="${id}"` : ""}>${title ? `<h2 class="sec__title">${esc(title)}</h2>` : ""}${body}</section>`;

// The page head: a small label, the one h1, and a short intro.
export const pageHead = (kicker, title, lede, extra = "") => `
  <header class="page-head">
    <p class="kicker">${esc(kicker)}</p>
    <h1 class="h-page">${esc(title)}</h1>
    ${lede ? `<p class="lede">${esc(lede)}</p>` : ""}
    ${extra}
  </header>`;

export const finalCta = (title, text, cta) => `
  <section class="final-cta" aria-labelledby="final-cta-title">
    <h2 class="h-section" id="final-cta-title">${esc(title)}</h2>
    <p>${esc(text)}</p>
    ${button(cta)}
  </section>`;
