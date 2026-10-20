// Your results: the last completed run, kept only in this browser (see store.js).

import { loadLastResult, clearLastResult } from "../store.js";
import { SKILLS } from "../../../content/skills.js";
import { esc, section, button, fmtDate } from "../ui.js";

export const title = "Your results | Soccer IQ";
export const description = "Your latest Soccer IQ challenge result, kept only in this browser.";

function empty() {
  return `
    <div class="empty">
      <p>No result on this device yet. Play the five challenges and your breakdown will appear here.</p>
      <p class="small">You can also explore the tips and tools without playing.</p>
      <div class="cta-row">${button({ label: "TEST YOURSELF", href: "play.html" })}<a class="btn btn--ghost" href="learn.html">Training tips</a></div>
    </div>`;
}

function filled(r) {
  const rows = r.rows.map((row) => {
    const pts = row.points == null ? "Skipped" : `${row.points} / 100`;
    const pct = row.points == null ? 0 : Math.max(0, Math.min(100, row.points));
    const skills = SKILLS.filter((s) => s.challenges.includes(row.id));
    return `
      <li class="res-row">
        <div class="res-row__top">
          <h3 class="h-sub">${esc(row.title)}${row.provisional ? ` <span class="tag">Provisional</span>` : ""}</h3>
          <strong>${pts}</strong>
        </div>
        <div class="bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
        ${row.tally ? `<p class="small">${esc(row.tally)}</p>` : ""}
        ${skills.length ? `<p class="small">Skills: ${skills.map((s) => `<a href="learn.html#${s.id}">${esc(s.name)}</a>`).join(", ")}</p>` : ""}
      </li>`;
  }).join("");
  return `
    <div class="res-total">
      <p class="kicker">Soccer IQ Points</p>
      <p class="res-total__n"><strong>${r.total}</strong><span> / ${r.available}</span></p>
      ${r.tier ? `<p class="res-total__tier">${esc(r.tier)}</p>` : ""}
      ${r.at ? `<p class="small">Played ${fmtDate(r.at.slice(0, 10))} on this device.</p>` : ""}
      <p class="small">A score for these five games, not an IQ test or a validated assessment.</p>
    </div>
    <ol class="res-rows">${rows}</ol>
    <div class="cta-row">
      ${button({ label: "Play again", href: "play.html" })}
      <a class="btn btn--ghost" href="learn.html">How to improve</a>
      <a class="btn btn--ghost" href="tools.html">Training tools</a>
      <button type="button" class="btn btn--text" id="clear">Clear this result</button>
    </div>`;
}

const head = `
    <header class="page-head">
      <p class="kicker">Your results</p>
      <h1 class="h-page">How you did</h1>
      <p class="lede">Your most recent run of the five challenges. It is stored only in this browser; there are no accounts.</p>
    </header>`;

// The built page shows the empty state; mount() swaps in the saved result if there is one.
export const view = () => `${head}${section("result", "", empty())}`;

export function mount(main) {
  const r = loadLastResult();
  const box = main.querySelector("#result");
  if (!r || !box) return;
  box.innerHTML = filled(r);
  box.querySelector("#clear")?.addEventListener("click", () => {
    clearLastResult();
    box.innerHTML = empty();
  });
}
