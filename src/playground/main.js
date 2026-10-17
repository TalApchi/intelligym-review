// Prototype playground (playground.html): experiments for Tal to compare, one for "Scan
// before receiving" and one for "Passing window". Separate from the main experience:
// no scoring, no results, nothing here is reachable from the game flow.
//
// Each prototype module exports { id, group, version, name, instruction, tests, mount }.
// mount(api) starts it and returns a cleanup function. The shell below owns the menu, the
// board, the text lines and the Replay / Try again / New situation buttons.

import { buildBoard, drawBall } from "../board.js";
import scan from "./vanish.js";
import through from "./through-play.js";

const PROTOTYPES = [scan, through];

const menu = document.querySelector(".pg__menu");
const stage = document.querySelector(".pg__stage");
let cleanup = null;

for (const p of PROTOTYPES) {
  const b = document.createElement("a");
  b.className = "pg__tab";
  b.href = `#${p.id}`;
  b.innerHTML = `<span class="pg__tab-group">${p.group}</span><span class="pg__tab-name">${p.version}: ${p.name}</span>`;
  menu.append(b);
}

function show(id) {
  const proto = PROTOTYPES.find((p) => p.id === id) || PROTOTYPES[0];
  for (const a of menu.children) a.setAttribute("aria-current", String(a.getAttribute("href") === `#${proto.id}`));
  cleanup?.();
  stage.innerHTML = `
    <header class="pg__head">
      <p class="pg__kicker">${proto.group} · ${proto.version}</p>
      <h2 class="pg__name">${proto.name}</h2>
      <p class="pg__how">${proto.instruction}</p>
    </header>
    <div class="pg__board board-card"><svg class="board" aria-label="Pitch seen from above"></svg></div>
    <div class="pg__panel">
      <div class="pg__timer" hidden><span></span></div>
      <p class="pg__status" aria-live="polite"></p>
      <button class="btn btn--primary pg__act" type="button" hidden></button>
      <p class="pg__explain" aria-live="polite" hidden></p>
      <div class="pg__extra"></div>
      <div class="pg__actions" hidden>
        <button class="btn btn--ghost pg__replay" type="button">Replay</button>
        <button class="btn btn--ghost pg__retry" type="button">Try again</button>
        <button class="btn btn--primary pg__next" type="button">New situation</button>
      </div>
      <p class="pg__tests"><strong>What this version tests:</strong> ${proto.tests}</p>
    </div>`;
  const api = makeApi(stage);
  cleanup = proto.mount(api);
}

// The toolkit each prototype gets. Animations run through api.run(), which stops cleanly
// when the visitor switches prototype, retries or asks for a new situation.
function makeApi(root) {
  const $ = (s) => root.querySelector(s);
  const svg = $(".board");
  let board = null;
  let gen = 0;
  let raf = 0;
  const handlers = { replay: null, retry: null, next: null };
  const ui = { timer: $(".pg__timer"), bar: $(".pg__timer span"), status: $(".pg__status"), act: $(".pg__act"), explain: $(".pg__explain"), extra: $(".pg__extra"), actions: $(".pg__actions") };
  const buttons = { replay: $(".pg__replay"), retry: $(".pg__retry"), next: $(".pg__next") };
  const defaultLabels = Object.fromEntries(Object.entries(buttons).map(([k, b]) => [k, b.textContent]));
  $(".pg__replay").addEventListener("click", () => handlers.replay?.());
  $(".pg__retry").addEventListener("click", () => handlers.retry?.());
  $(".pg__next").addEventListener("click", () => handlers.next?.());

  const api = {
    svg,
    // A fresh board (grass, markings, layers) with the ball drawn on top.
    newBoard() {
      board = buildBoard(svg);
      drawBall(board);
      return board;
    },
    // Starts a new sequence; anything still running from the last one stops.
    begin() {
      gen++;
      cancelAnimationFrame(raf);
      ui.explain.hidden = true;
      ui.actions.hidden = true;
      ui.act.hidden = true;
      ui.timer.hidden = true;
      ui.extra.replaceChildren();
      return gen;
    },
    live: (g) => g === gen,
    // Calls frame(elapsedMs) every animation frame for `ms` (Infinity = until stopped).
    // Resolves true when it finishes, false if a newer sequence took over.
    run(g, ms, frame) {
      return new Promise((resolve) => {
        const start = performance.now();
        const tick = (now) => {
          if (g !== gen) return resolve(false);
          const t = Math.min(now - start, ms);
          if (frame(t) === "stop") return resolve(true);
          if (t >= ms) return resolve(true);
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      });
    },
    status(text) { ui.status.textContent = text; },
    // A thin countdown bar, shown while the visitor is scanning.
    timer(share) {
      ui.timer.hidden = share === null;
      if (share !== null) ui.bar.style.transform = `scaleX(${Math.max(0, 1 - share)})`;
    },
    explain(text) { ui.explain.textContent = text; ui.explain.hidden = false; },
    // A spot under the explanation for extra controls (cleared by begin()).
    slot() { return ui.extra; },
    // The one action button (e.g. "Pass"), or none.
    action(label, onClick) {
      if (!label) { ui.act.hidden = true; ui.act.onclick = null; return; }
      ui.act.textContent = label;
      ui.act.hidden = false;
      ui.act.onclick = onClick;
    },
    // The first try of each prototype waits for "Start", so nothing is missed while reading.
    // Then the board scrolls into view (phones) and `go` runs.
    ready(go) {
      api.status("Ready when you are");
      api.action("Start", () => {
        api.action(null);
        root.querySelector(".pg__head").scrollIntoView({ block: "start", behavior: "smooth" });
        go();
      });
    },
    // Replay / Try again / New situation, shown together once a try is over. `labels` can
    // rename them for this try (e.g. { next: "Practice" }); a missing handler hides its button.
    done({ replay, retry, next, labels = {} }) {
      Object.assign(handlers, { replay, retry, next });
      for (const [k, b] of Object.entries(buttons)) {
        b.textContent = labels[k] || defaultLabels[k];
        b.hidden = !handlers[k];
      }
      ui.actions.hidden = false;
      ui.actions.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
    },
    stop() { gen++; cancelAnimationFrame(raf); },
  };
  return api;
}

const onHash = () => show(location.hash.slice(1));
window.addEventListener("hashchange", onHash);
onHash();
