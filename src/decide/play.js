// "Tactical choice": runs the situations on screen.
// Each situation: a frozen picture with you on the ball -> pick an option (the board shows
// your plan) -> Play it -> the outcome animates -> provisional verdict and one sentence.
// Rankings and sentences are DRAFTS pending Omri's approval; this screen always says so.

import { DECIDE } from "../config.js";
import { SCENARIOS } from "./scenarios.js";
import { usableScenarios, pickScenarios, outcomeAt, previewTarget, bestOptions, scoreDecide } from "./logic.js";
import { buildBoard, drawPlayers, markPlayer, placePlayers, showArrow, clearMarks, showCues, clearCues, drawBall, placeBall } from "../board.js";

const VERDICT = { best: "Suggested option", reasonable: "Reasonable option", poor: "Riskier option" };

// This browser's history lives in localStorage, so scenarios don't repeat until the pool
// is used up. Storage can be missing or blocked (private windows): then every play is random.
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(DECIDE.historyKey)) || {}; } catch { return {}; }
}
function saveHistory(history) {
  try { localStorage.setItem(DECIDE.historyKey, JSON.stringify(history)); } catch { /* not saved; fine */ }
}

// The scenarios for this play: DECIDE.situations of them, at random, not seen recently.
function chooseScenarios() {
  const pool = usableScenarios(SCENARIOS, DECIDE);
  const { ids, history } = pickScenarios(pool.map((s) => s.id), loadHistory(), DECIDE.situations, Math.random);
  saveHistory(history);
  return ids.map((id) => pool.find((s) => s.id === id));
}

/**
 * Mounts the challenge into `root` and starts situation 1.
 * Calls onDone(result) after the last situation, in the shape screens.js shows.
 * Returns a cleanup function that stops the animation.
 */
export function playDecide(root, { onDone }) {
  const scenarios = chooseScenarios();

  root.innerHTML = `
    <div class="play" data-phase="choose">
      <div class="play__board board-card"><svg class="board" aria-label="Pitch seen from above"></svg></div>
      <section class="play__panel">
        <div class="play__meta">
          <span class="play__round"></span>
          <span class="draft-badge" hidden>Draft scenario</span>
        </div>
        <h2 class="play__prompt" aria-live="polite"></h2>
        <p class="play__hint" hidden>Dashed arrows show runs and pressure that are already happening.</p>
        <div class="choices" role="radiogroup" aria-label="Your options"></div>
        <button class="btn btn--primary play__go" type="button" hidden>Play it</button>
        <div class="play__result" hidden>
          <p class="verdict"><span class="verdict__name"></span><span class="verdict__pts"></span></p>
          <p class="play__line"></p>
          <p class="play__best"></p>
          <p class="play__why"></p>
          <p class="play__provisional">Provisional: this ranking and explanation are drafts until Omri approves them.</p>
          <button class="btn btn--primary play__next" type="button"></button>
        </div>
      </section>
    </div>`;

  const $ = (sel) => root.querySelector(sel);
  const ui = {
    play: $(".play"), round: $(".play__round"), badge: $(".draft-badge"), prompt: $(".play__prompt"),
    choices: $(".choices"), go: $(".play__go"), result: $(".play__result"),
    verdictName: $(".verdict__name"), verdictPts: $(".verdict__pts"), line: $(".play__line"),
    best: $(".play__best"), why: $(".play__why"), hint: $(".play__hint"), next: $(".play__next"),
  };
  const board = buildBoard($(".board"));
  drawBall(board);
  const ranks = [];
  const rows = [];

  let alive = true;
  let raf = 0;

  // Lets the visitor try options before committing. Resolves with the chosen option.
  function choose(scenario) {
    return new Promise((resolve) => {
      let selected = null;
      const carrier = scenario.home.find((p) => p.id === scenario.carrier);
      ui.choices.replaceChildren();
      for (const option of scenario.options) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "choice";
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", "false");
        b.textContent = option.label;
        b.addEventListener("click", () => {
          selected = option;
          for (const other of ui.choices.children) other.setAttribute("aria-checked", String(other === b));
          showArrow(board, carrier, previewTarget(option));
          ui.go.hidden = false;
          ui.go.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
        });
        ui.choices.appendChild(b);
      }
      ui.go.onclick = () => { if (selected && alive) { ui.go.onclick = null; resolve(selected); } };
    });
  }

  // The outcome as a pure function of elapsed time (see outcomeAt in logic.js).
  function animate(scenario, option) {
    return new Promise((resolve) => {
      const start = performance.now();
      const tick = (now) => {
        if (!alive) return;
        const u = Math.min(1, (now - start) / DECIDE.outcomeMs);
        const frame = outcomeAt(scenario, option, u);
        placePlayers(board, frame.players);
        placeBall(board, frame.ball);
        if (u < 1) raf = requestAnimationFrame(tick);
        else resolve();
      };
      raf = requestAnimationFrame(tick);
    });
  }

  const waitForNext = () => new Promise((resolve) => {
    ui.next.addEventListener("click", () => alive && resolve(), { once: true });
  });

  async function run() {
    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];
      const last = i === scenarios.length - 1;
      ui.round.textContent = `Situation ${i + 1} of ${scenarios.length} · ${scenario.title}`;
      ui.badge.hidden = scenario.approved;
      ui.prompt.textContent = "You have the ball. Make the call.";
      ui.result.hidden = true;
      ui.choices.hidden = false;
      ui.go.hidden = true;
      ui.play.dataset.phase = "choose";
      clearMarks(board);

      drawPlayers(board, [...scenario.home.map((p) => ({ ...p, team: "home" })), ...scenario.away.map((p) => ({ ...p, team: "away" }))]);
      markPlayer(board, scenario.carrier, "is-carrier");
      const carrier = scenario.home.find((p) => p.id === scenario.carrier);
      const cues = scenario.cues.map((c) => {
        const from = [...scenario.home, ...scenario.away].find((p) => p.id === c.id);
        return { from, to: c.to, team: scenario.home.includes(from) ? "home" : "away" };
      });
      showCues(board, cues);
      ui.hint.hidden = cues.length === 0;
      placeBall(board, { x: carrier.x + 1.6, y: carrier.y - 1.6, lift: 0 }); // at the carrier's feet

      const option = await choose(scenario);

      // Play the outcome
      ui.play.dataset.phase = "outcome";
      ui.choices.hidden = true;
      ui.go.hidden = true;
      ui.hint.hidden = true;
      ui.prompt.textContent = option.label;
      clearMarks(board);
      clearCues(board);
      const ballStart = { x: carrier.x + 1.6, y: carrier.y - 1.6 };
      await animate(scenario, { ...option, ball: [ballStart, ...option.ball.slice(1)] });
      if (!alive) return;

      // Verdict (provisional)
      ranks.push(option.rank);
      const pts = DECIDE.points[option.rank];
      const best = bestOptions(scenario);
      ui.play.dataset.phase = "reveal";
      ui.prompt.textContent = option.result;
      ui.verdictName.textContent = `${VERDICT[option.rank]}${scenario.approved ? "" : " (draft)"}`;
      ui.verdictPts.textContent = `${pts} pts`;
      ui.line.textContent = option.note;
      ui.best.textContent = option.rank === "best" ? "" : `${scenario.approved ? "Suggested option" : "Suggested option (draft)"}: ${best.map((o) => o.label.toLowerCase()).join(", or ")}.`;
      ui.best.hidden = option.rank === "best";
      ui.why.textContent = `${scenario.approved ? "Why" : "Why (draft)"}: ${scenario.reasoning}${scenario.open ? ` ${scenario.open}` : ""}`;
      ui.next.textContent = last ? "See your points" : "Next situation";
      ui.result.hidden = false;
      ui.next.focus({ preventScroll: true });
      ui.next.scrollIntoView?.({ block: "nearest", behavior: "smooth" }); // short phones
      rows.push({
        ok: option.rank === "best",
        label: `${scenario.title}${scenario.approved ? "" : " · draft"}`,
        line: `${option.label}: ${option.note}`,
        aside: `${pts} pts`,
      });
      await waitForNext();
    }
    const bests = ranks.filter((r) => r === "best").length;
    onDone({
      points: scoreDecide(ranks, DECIDE),
      tally: `${bests} of ${ranks.length} suggested options`,
      sub: `You picked a suggested option in ${bests} of ${ranks.length} situations. The suggestions are drafts until Omri approves them.`,
      rows,
      provisional: scenarios.some((s) => !s.approved),
    });
  }

  run();

  return () => {
    alive = false;
    cancelAnimationFrame(raf);
  };
}
