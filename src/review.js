// Coach review page (review.html): every draft "Tactical choice" scenario drawn as a
// picture, with its options, draft ranking, sentences and reasoning, and every draft
// "Scan before receiving" situation from the playground, so Omri can review without
// reading source files. Decisions and comments stay in this browser
// (localStorage) and come out as text with "Copy my review". Not part of the player flow.

import { DECIDE } from "./config.js";
import { SCENARIOS } from "./decide/scenarios.js";
import { outcomeAt, previewTarget } from "./decide/logic.js";
import { buildBoard, drawPlayers, markPlayer, placePlayers, showArrow, clearMarks, showCues, clearCues, drawBall, placeBall } from "./board.js";
import { el } from "./pitch.js";
import { SCAN_SITUATIONS } from "./playground/scan-situations.js";
import { scanRank, scanFeedback } from "./playground/logic.js";

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
const scanList = document.querySelector(".review__scan");
for (const n of document.querySelectorAll("[data-count]")) n.textContent = SCENARIOS.length;
for (const n of document.querySelectorAll("[data-scan-count]")) n.textContent = SCAN_SITUATIONS.length;
const SCAN = (id) => `scan:${id}`; // saved under its own ids so they can't clash with the scenarios

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const short = (id) => id.split("-").slice(1).join("-").toUpperCase(); // "a-lcb" -> "LCB"

SCENARIOS.forEach((s, i) => list.append(card(s, i)));
SCAN_SITUATIONS.forEach((s, i) => scanList.append(scanCard(s, i)));
progress();

// The Approve / Needs change / Remove radios and the comment box, saved under `key`.
function decisionBox(key, placeholder) {
  const mine = saved[key] || {};
  return `
      <fieldset class="rv__decide">
        <legend>Your decision</legend>
        <div class="rv__radios">
          ${DECISIONS.map(([v, l]) => `<label class="rv__radio"><input type="radio" name="d-${key}" value="${v}"${mine.decision === v ? " checked" : ""}> ${l}</label>`).join("")}
        </div>
        <label class="rv__comment">Comment <span>(optional)</span>
          <textarea rows="2" placeholder="${esc(placeholder)}">${esc(mine.comment || "")}</textarea>
        </label>
      </fieldset>`;
}
function bindDecision(node, key) {
  for (const r of node.querySelectorAll('input[type="radio"]')) {
    r.addEventListener("change", () => { saved[key] = { ...saved[key], decision: r.value }; save(); });
  }
  node.querySelector("textarea").addEventListener("input", (e) => { saved[key] = { ...saved[key], comment: e.target.value }; save(); });
}

function card(s, i) {
  const node = document.createElement("article");
  node.className = "rv";
  node.id = s.id;
  node.innerHTML = `
    <header class="rv__head">
      <p class="rv__num">${i + 1} of ${SCENARIOS.length}${s.approved ? "" : ' <span class="draft-badge draft-badge--small">Draft</span>'}</p>
      <h3 class="rv__title">${esc(s.title)}</h3>
      <p class="rv__tags">${s.tags.map(esc).join(" · ")}</p>
    </header>
    <div class="rv__board board-card"><svg class="board" role="img" aria-label="${esc(s.title)}: the situation from above"></svg></div>
    <div class="rv__body">
      <p class="rv__who">You are the <strong>${esc(s.home.find((p) => p.id === s.carrier).role)}</strong> (red ring).</p>
      <ol class="rv__options"></ol>
      <button class="rv__reset" type="button">Show the starting picture</button>
      <div class="rv__why"><h3>Why the draft ranks it this way</h3><p>${esc(s.reasoning)}</p></div>
      ${decisionBox(s.id, "e.g. their left back would be tighter; rank the switch as best")}
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
  bindDecision(node, s.id);
  frozen();
  return node;
}

// A "Scan before receiving" situation: the picture the player scans, every teammate they
// could pass to with its draft rank and the sentence they'd read, and the reasoning.
function scanCard(s, i) {
  const node = document.createElement("article");
  node.className = "rv";
  node.id = SCAN(s.id);
  const targets = [s.passer, ...s.home];
  const code = (p) => (p.id.startsWith("a-") ? short(p.id) : p.id === s.passer.id ? "P" : p.id.toUpperCase());
  const order = { best: 0, reasonable: 1, poor: 2 };
  const ranked = [...targets].sort((a, b) => order[scanRank(s, a.id)] - order[scanRank(s, b.id)]);
  node.innerHTML = `
    <header class="rv__head">
      <p class="rv__num">${i + 1} of ${SCAN_SITUATIONS.length}${s.approved ? "" : ' <span class="draft-badge draft-badge--small">Draft</span>'}</p>
      <h3 class="rv__title">${esc(s.title)}</h3>
      <p class="rv__tags">${s.tags.map(esc).join(" · ")}</p>
    </header>
    <div class="rv__board board-card"><svg class="board" role="img" aria-label="${esc(s.title)}: the picture the player scans"></svg></div>
    <div class="rv__body">
      <p class="rv__who">You (red ring) are about to receive from the <strong>${esc(s.passer.role)}</strong> (P). The player sees this for 2 seconds, then the opponents disappear and they tap a teammate.</p>
      <ol class="rv__options"></ol>
      <button class="rv__reset" type="button">Clear the arrow</button>
      <div class="rv__why"><h3>Why the draft ranks it this way</h3><p>${esc(s.reasoning)}</p></div>
      ${decisionBox(SCAN(s.id), "e.g. the left winger is the better pass; their right back would be tighter")}
    </div>`;
  const board = buildBoard(node.querySelector(".board"));
  drawBall(board);
  const players = [
    { id: "you", role: "you", ...s.you, team: "home" },
    ...targets.map((p) => ({ ...p, team: "home" })),
    ...s.away.map((p) => ({ ...p, team: "away" })),
  ];
  drawPlayers(board, players);
  markPlayer(board, "you", "is-carrier");
  placeBall(board, { x: s.passer.x + 1.4, y: s.passer.y - 1.4 });
  const labels = el("g", { class: "rv-labels" }, board.svg);
  for (const p of players) {
    if (p.id === "you") continue;
    el("text", { x: p.x, y: p.team === "home" ? p.y + 4.3 : p.y - 2.6, class: `rv-label rv-label--${p.team}` }, labels).textContent = code(p);
  }
  const ol = node.querySelector(".rv__options");
  const reset = () => { clearMarks(board); for (const b of ol.querySelectorAll(".rv__opt")) b.setAttribute("aria-pressed", "false"); };
  for (const t of ranked) {
    const rank = scanRank(s, t.id);
    const li = document.createElement("li");
    li.innerHTML = `
      <button class="rv__opt rv__opt--${rank}" type="button" aria-pressed="false">
        <span class="rv__rank">${RANK[rank]}</span>
        <span class="rv__label">${t.id === s.passer.id ? "Back to the " : "To the "}${esc(t.role)} (${code(t)})</span>
      </button>
      <p class="rv__note">${esc(scanFeedback(s, t.id))}</p>`;
    const b = li.querySelector("button");
    b.addEventListener("click", () => { reset(); b.setAttribute("aria-pressed", "true"); showArrow(board, s.you, t); });
    ol.append(li);
  }
  node.querySelector(".rv__reset").addEventListener("click", reset);
  bindDecision(node, SCAN(s.id));
  return node;
}

function reviewText() {
  const label = Object.fromEntries(DECISIONS);
  const lines = [`IntelliGym draft content review (${new Date().toISOString().slice(0, 10)})`, "", "Tactical choice scenarios"];
  const item = (i, title, key) => {
    const r = saved[key] || {};
    lines.push(`${i + 1}. ${title} [${key}]: ${r.decision ? label[r.decision] : "not reviewed yet"}`);
    if (r.comment?.trim()) lines.push(`   Comment: ${r.comment.trim()}`);
  };
  SCENARIOS.forEach((s, i) => item(i, s.title, s.id));
  lines.push("", "Scan before receiving situations (playground)");
  SCAN_SITUATIONS.forEach((s, i) => item(i, s.title, SCAN(s.id)));
  return lines.join("\n");
}

function progress() {
  const keys = [...SCENARIOS.map((s) => s.id), ...SCAN_SITUATIONS.map((s) => SCAN(s.id))];
  const done = keys.filter((k) => saved[k]?.decision).length;
  document.querySelector(".review__progress").textContent = `${done} of ${keys.length} situations reviewed`;
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
