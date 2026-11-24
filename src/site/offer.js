// Provider offers on the page: the yellow coupon ticket (kind "coupon") and the "Check offers"
// link (kind "link"). Content comes from content/offers.js; this file only draws and wires it.
// Large in the provider's profile, compact in the comparison table.

import { esc } from "./ui.js";

const TICKET_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5V14a2 2 0 0 0 0-4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 6.5v11" stroke="currentColor" stroke-width="1.6" stroke-dasharray="1.6 2.2"/><path d="m13 14.5 4-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="13.3" cy="10" r="1" fill="currentColor"/><circle cx="16.7" cy="14" r="1" fill="currentColor"/></svg>`;
const EXT = `<span class="ext" aria-hidden="true">↗</span>`;

const TERM_LABELS = [
  ["expires", "Ends"], ["plans", "Applies to"], ["region", "Region"], ["stacking", "Combining offers"], ["exclusive", "Note"],
];

// The coupon ticket. `providerName` is used only for screen-reader text on the link.
export function couponTicket(o, providerName, { compact = false } = {}) {
  const terms = TERM_LABELS.filter(([k]) => o.terms?.[k]);
  const sr = `<span class="sr-only"> (opens ${esc(providerName)}'s site in a new tab)</span>`;
  return `
    <div class="coupon${compact ? " coupon--compact" : ""}" data-coupon>
      <div class="coupon__ticket">
        <span class="coupon__stub">${TICKET_ICON}</span>
        <div class="coupon__body">
          <p class="coupon__headline">${esc(o.headline)}</p>
          <p class="coupon__code-row">Code: <code class="coupon__code" data-code>${esc(o.code)}</code></p>
          <div class="coupon__actions">
            <button class="coupon__copy" type="button" data-copy="${esc(o.code)}" aria-label="Copy code ${esc(o.code)}">Copy code</button>
            <a class="coupon__use" href="${esc(o.url)}" target="_blank" rel="noopener">${esc(o.label)}${EXT}${sr}</a>
          </div>
        </div>
      </div>
      <p class="coupon__status" role="status" aria-live="polite"></p>
      ${!compact ? `<p class="coupon__note">The code is not applied automatically. Use it on ${esc(providerName)}'s site, where its own terms apply.</p>` : ""}
      ${!compact && terms.length ? `<dl class="coupon__details">${terms.map(([k, label]) => `<div><dt>${esc(label)}</dt><dd>${esc(o.terms[k])}</dd></div>`).join("")}</dl>` : ""}
    </div>`;
}

// "Check offers": a link to the provider's own site. Says nothing about a discount.
export function offerLink(o, providerName, { compact = false } = {}) {
  return `<a class="offer-link${compact ? " offer-link--compact" : ""}" href="${esc(o.url)}" target="_blank" rel="noopener">${esc(o.label)}${EXT}<span class="sr-only"> at ${esc(providerName)} (opens ${esc(providerName)}'s website in a new tab)</span></a>`;
}

export function offerView(o, providerName, opts) {
  if (o.kind === "coupon") return couponTicket(o, providerName, opts);
  if (o.kind === "link") return offerLink(o, providerName, opts);
  return "";
}

// Copy code: the Clipboard API, then the older execCommand route, and if both fail the code is
// selected so the visitor can copy it by hand. Brief feedback either way.
function selectText(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

async function copy(text, codeEl) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* fall through */ }
  try {
    selectText(codeEl);
    const ok = document.execCommand?.("copy");
    if (ok) { window.getSelection().removeAllRanges(); return true; }
  } catch { /* fall through */ }
  return false;
}

export function mountOffers(root) {
  root.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const box = btn.closest("[data-coupon]");
    const codeEl = box.querySelector("[data-code]");
    const status = box.querySelector(".coupon__status");
    const ok = await copy(btn.dataset.copy, codeEl);
    clearTimeout(btn._t);
    if (ok) {
      btn.textContent = "Copied ✓";
      btn.classList.add("is-done");
      status.textContent = `Code ${btn.dataset.copy} copied.`;
    } else {
      selectText(codeEl);
      status.textContent = "Couldn't copy automatically. The code is selected: copy it by hand.";
    }
    btn._t = setTimeout(() => {
      btn.textContent = "Copy code";
      btn.classList.remove("is-done");
      status.textContent = "";
    }, ok ? 2200 : 6000);
  });
}
