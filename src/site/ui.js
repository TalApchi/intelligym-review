// Small helpers shared by the site pages. Presentation only; no copy lives here.

import { BUILD } from "../build.js";

export const REVIEW = BUILD.review;

export const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Content strings may contain simple trusted HTML (links in FAQ answers). Everything else is escaped.
export const html = (s) => String(s ?? "");

export const ext = (url, label, cls = "") =>
  `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}<span class="ext" aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a>`;

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
export const fmtDate = (iso) => (iso ? DATE.format(new Date(iso + "T12:00:00")) : "");

// "Source: <link> · checked 18 Oct 2026"
export function source(src, prefix = "Source") {
  if (!src?.url) return "";
  const label = src.label || new URL(src.url).hostname.replace(/^www\./, "");
  return `<p class="src">${prefix}: ${ext(src.url, label)}${src.checked ? ` <span class="src__date">· checked ${fmtDate(src.checked)}</span>` : ""}</p>`;
}

// Review-only note. Empty in the public build.
export function reviewNote(text) {
  if (!REVIEW || !text) return "";
  return `<aside class="review-note"><span class="review-note__tag">Review</span> ${html(text)}</aside>`;
}

const STATUS = {
  "to-confirm": "To confirm",
  pending: "Pending",
  "pending-approval": "Awaiting reuse approval",
};
export function badge(status) {
  if (!REVIEW || !STATUS[status]) return "";
  return `<span class="status status--${status}">${STATUS[status]}</span>`;
}

// Entries with a status other than "verified" (or none) appear only in the review build,
// so unresolved commercial details never read as confirmed in public.
export function shown(entry) {
  if (!entry || entry.visible === false) return false;
  if (!entry.status || entry.status === "verified") return true;
  return REVIEW;
}

// Testimonials need reuse approval before they appear publicly.
export const shownTestimonial = (t) => t.visible !== false && (t.reuseApproved || REVIEW);

export function testimonialCard(t) {
  const group = { coach: "Coach", player: "Player", parent: "Parent" }[t.group] || "";
  return `
    <figure class="quote">
      <p class="quote__about">About ${esc(t.product)}${group ? ` · ${group}` : ""}</p>
      <blockquote class="quote__text">“${esc(t.excerpt)}”</blockquote>
      <figcaption class="quote__who"><strong>${esc(t.name)}</strong><span>${esc(t.role)}</span></figcaption>
      ${t.reuseApproved ? "" : badge("pending-approval")}
      <p class="src">Published by ${esc(t.product)}: ${ext(t.source.url, "source")}${t.source.checked ? ` <span class="src__date">· checked ${fmtDate(t.source.checked)}</span>` : ""}</p>
      ${reviewNote(t.reviewNote)}
    </figure>`;
}

export const arrow = `<svg class="btn__arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const button = (cta, kind = "primary") =>
  `<a class="btn btn--${kind}" href="${esc(cta.href)}">${esc(cta.label)}${kind === "primary" ? ` ${arrow}` : ""}</a>`;

export const section = (id, title, body, cls = "") =>
  `<section class="sec ${cls}"${id ? ` id="${id}"` : ""}>${title ? `<h2 class="sec__title">${esc(title)}</h2>` : ""}${body}</section>`;
