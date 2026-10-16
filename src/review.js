// Coach review page (review.html): every draft "Tactical choice" scenario drawn as a
// picture, with its options, draft ranking, sentences and reasoning, so Omri can review
// without reading source files. Decisions and comments stay in this browser
// (localStorage) and come out as text with "Copy my review". Not part of the player flow.

import { DECIDE } from "./config.js";
import { SCENARIOS } from "./decide/scenarios.js";
import { outcomeAt, previewTarget } from "./decide/logic.js";
import { buildBoard, drawPlayers, markPlayer, placePlayers, showArrow, clearMarks, showCues, clearCues, drawBall, placeBall } from "./board.js";
import { el } from "./pitch.js";

const KEY = "ig.review.v1";
const RANK = { best: "Draft best", reasonable: "Reasonable", poor: "Weak" };
const DECISIONS = [["approve", "Approve"], ["change", "Needs change"], ["remove", "Remove"]];

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
let saved = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* kept for this visit only */ }
  progress();
}

const list = document.querySelector(".review__list");
document.querySelector("[data-count]").textContent = SCENARIOS.length;

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const short = (id) => id.split("-").slice(1).join("-").toUpperCase(); // "a-lcb" -> "LCB"

SCENARIOS.forEach((s, i) => list.append(card(s, i)));
progress();

function card(s, i) {
  const node = document.createElement("article");
  node.className = "rv";
  node.id = s.id;
  const mine = saved[s.id] || {};
  node.innerHTML = `
    <header class="rv__head">
      <p class="rv__num">${i + 1} of ${SCENARIOS.length}${s.approved ? "" : ' <span class="draft-badge draft-badge--small">Draft</span>'}</p>
      <h2 class="rv__title">${esc(s.title)}</h2>
      <p class="rv__tags">${s.tags.map(esc).join(" · ")}</p>
    </header>
    <div class="rv__board board-card"><svg class="board" role="img" aria-label="${esc(s.title)}: the situation from above"></svg></div>
    <div class="rv__body">
      <p class="rv__who">You are the <strong>${esc(s.home.find((p) => p.id === s.carrier).role)}</strong> (red ring).</p>
      <ol class="rv__options"></ol>
      <button class="rv__reset" type="button">Show the starting picture</button>
      <div class="rv__why"><h3>Why the draft ranks it this way</h3><p>${esc(s.reasoning)}</p></div>
      <fieldset class="rv__decide">
        <legend>Your decision</legend>
        <div class="rv__radios">
          ${DECISIONS.map(([v, l]) => `<label class="rv__radio"><input type="radio" name="d-${s.id}" value="${v}"${mine.decision === v ? " checked" : ""}> ${l}</label>`).join("")}
        </div>
        <label class="rv__comment">Comment <span>(optional)</span>
          <textarea rows="2" placeholder="e.g. their left back would be tighter; rank the switch as best">${esc(mine.comment || "")}</textarea>
        </label>
      </fieldset>
    </div>`;

  const board = buildBoard(node.querySelector(".board"));
  drawBall(board);
  const players = [...s.home.map((p) => ({ ...p, team: "home" })), ...s.away.map((p) => ({ ...p, team: "away" }))];
  const carrier = s.home.find((p) => p.id === s.carrier);
  const labels = el("g", { class: "rv-labels" }, board.svg);
  let raf = 0;

  function frozen() {
    cancelAnimationFrame(raf);
    drawPlayers(board, players);
    markPlayer(board, s.carrier, "is-carrier");
    clearMarks(board);
    showCues(board, s.cues.map((c) => {
      const from = players.find((p) => p.id === c.id);
      return { from, to: c.to, team: from.team };
    }));
    placeBall(board, { x: carrier.x + 1.6, y: carrier.y - 1.6, lift: 0 });
    drawLabels(Object.fromEntries(players.map((p) => [p.id, p])));
    for (const b of node.querySelectorAll(".rv__opt")) b.setAttribute("aria-pressed", "false");
  }
  function drawLabels(pos) {
    labels.replaceChildren();
    for (const p of players) {
      const q = pos[p.id];
      el("text", { x: q.x, y: p.team === "home" ? q.y + 4.3 : q.y - 2.6, class: `rv-label rv-label--${p.team}` }, labels).textContent = short(p.id); // ours below, theirs above
    }
  }
  function play(option, button) {
    frozen();
    button.setAttribute("aria-pressed", "true");
    clearCues(board);
    showArrow(board, carrier, previewTarget(option));
    const ballStart = { x: carrier.x + 1.6, y: carrier.y - 1.6 };
    const path = { ...option, ball: [ballStart, ...option.ball.slice(1)] };
    const start = performance.now();
    const tick = (now) => {
      const u = Math.min(1, (now - start) / DECIDE.outcomeMs);
      const f = outcomeAt(s, path, u);
      placePlayers(board, f.players);
      placeBall(board, f.ball);
      drawLabels(f.players);
      if (u < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  const ol = node.querySelector(".rv__options");
  for (const o of s.options) {
    const li = document.createElement("li");
    li.innerHTML = `
      <button class="rv__opt rv__opt--${o.rank}" type="button" aria-pressed="false">
        <span class="rv__rank">${RANK[o.rank]}</span>
        <span class="rv__label">${esc(o.label)}</span>
        <span class="rv__result">Shown outcome: ${esc(o.result)}</span>
      </button>
      <p class="rv__note">${esc(o.note)}</p>`;
    const b = li.querySelector("button");
    b.addEventListener("click", () => play(o, b));
    ol.append(li);
  }
  node.querySelector(".rv__reset").addEventListener("click", frozen);
  for (const r of node.querySelectorAll('input[type="radio"]')) {
    r.addEventListener("change", () => { saved[s.id] = { ...saved[s.id], decision: r.value }; save(); });
  }
  node.querySelector("textarea").addEventListener("input", (e) => { saved[s.id] = { ...saved[s.id], comment: e.target.value }; save(); });
  frozen();
  return node;
}

function reviewText() {
  const label = Object.fromEntries(DECISIONS);
  const lines = [`IntelliGym "Tactical choice" scenario review (${new Date().toISOString().slice(0, 10)})`, ""];
  SCENARIOS.forEach((s, i) => {
    const r = saved[s.id] || {};
    lines.push(`${i + 1}. ${s.title} [${s.id}]: ${r.decision ? label[r.decision] : "not reviewed yet"}`);
    if (r.comment?.trim()) lines.push(`   Comment: ${r.comment.trim()}`);
  });
  return lines.join("\n");
}

function progress() {
  const done = SCENARIOS.filter((s) => saved[s.id]?.decision).length;
  document.querySelector(".review__progress").textContent = `${done} of ${SCENARIOS.length} situations reviewed`;
  document.querySelector(".review__text").value = reviewText();
}

document.querySelector(".review__copy").addEventListener("click", async () => {
  const text = reviewText();
  const out = document.querySelector(".review__copied");
  const box = document.querySelector(".review__text");
  box.value = text;
  try {
    await navigator.clipboard.writeText(text);
    out.textContent = "Copied. Paste it into an email or message to Tal.";
  } catch {
    box.focus(); box.select();
    out.textContent = "Couldn't copy automatically. The text is selected below: copy it from there.";
  }
});
