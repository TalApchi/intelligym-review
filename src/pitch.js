// Builds the landing pitch as SVG and runs its ambient animation.
// The small drawing helpers (el, drawGrass, drawMarkings) are also used by the
// flat challenge board in board.js.
//
// Key idea: everything is drawn in METRES (see scene.js). The SVG viewBox maps
// metres to whatever size the screen gives us, so there is no resize code at all.

const NS = "http://www.w3.org/2000/svg";
export const PLAYER_R = 1.55; // player disc radius in metres (drawn larger than life so it reads)

export function el(name, attrs = {}, parent) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (parent) parent.appendChild(node);
  return node;
}

// ---------- Static layers ----------

function drawDefs(svg) {
  const defs = el("defs", {}, svg);

  const grad = el("linearGradient", { id: "scan-grad", x1: "0", y1: "0", x2: "1", y2: "0" }, defs);
  el("stop", { offset: "0", "stop-color": "#14c4b0", "stop-opacity": "0.34" }, grad);
  el("stop", { offset: "1", "stop-color": "#14c4b0", "stop-opacity": "0" }, grad);

  const blur = el("filter", { id: "soft", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
  el("feGaussianBlur", { stdDeviation: "0.45" }, blur);

  const arrow = el("marker", { id: "arrow", viewBox: "0 0 10 10", refX: "7", refY: "5", markerWidth: "4", markerHeight: "4", orient: "auto-start-reverse" }, defs);
  el("path", { d: "M0 1 L9 5 L0 9 z", fill: "#eef1ec" }, arrow);
}

export function drawGrass({ width, depth }, parent) {
  const g = el("g", {}, parent);
  const bands = 10; // mowing stripes, like a broadcast pitch
  const h = depth / bands;
  for (let i = 0; i < bands; i++) {
    el("rect", { x: -3, y: i * h, width: width + 6, height: h + 0.02, class: i % 2 ? "stripe-b" : "stripe-a" }, g);
  }
  // Grass behind the goal line
  el("rect", { x: -3, y: -6, width: width + 6, height: 6, class: "stripe-b" }, g);
}

export function drawMarkings({ width, depth }, parent) {
  // Real pitch dimensions (IFAB), in metres.
  const g = el("g", { class: "markings" }, parent);
  const cx = width / 2;
  el("rect", { x: 0, y: 0, width, height: depth }, g);                          // touchlines + goal line + halfway
  el("rect", { x: cx - 20.16, y: 0, width: 40.32, height: 16.5 }, g);           // penalty area
  el("rect", { x: cx - 9.16, y: 0, width: 18.32, height: 5.5 }, g);             // goal area
  el("rect", { x: cx - 3.66, y: -1.6, width: 7.32, height: 1.6 }, g);           // goal
  // Penalty arc: the part of the 9.15 m circle around the spot outside the box
  const dy = 16.5 - 11, dx = Math.sqrt(9.15 ** 2 - dy ** 2);
  el("path", { d: `M ${cx - dx} 16.5 A 9.15 9.15 0 0 0 ${cx + dx} 16.5` }, g);
  // Centre circle (top half visible at the halfway line)
  el("path", { d: `M ${cx - 9.15} ${depth} A 9.15 9.15 0 0 1 ${cx + 9.15} ${depth}` }, g);
  // Corner arcs
  el("path", { d: `M 1 0 A 1 1 0 0 1 0 1` }, g);
  el("path", { d: `M ${width - 1} 0 A 1 1 0 0 0 ${width} 1` }, g);
  el("circle", { cx, cy: 11, r: 0.25, class: "spot" }, parent);
  el("circle", { cx, cy: depth, r: 0.25, class: "spot" }, parent);
}

// ---------- Players ----------

function drawPlayer(p, team, parent) {
  const g = el("g", { class: `player ${team}` }, parent);
  el("ellipse", { cx: 0.45, cy: 0.75, rx: PLAYER_R * 1.05, ry: PLAYER_R * 0.75, class: "shadow", filter: "url(#soft)" }, g);
  if (p.read) {
    el("circle", { r: PLAYER_R + 1.1, class: "read-pulse" }, g);
    el("circle", { r: PLAYER_R + 1.1, class: "read-ring" }, g);
  }
  if (p.ball) el("circle", { r: PLAYER_R + 0.9, class: "carrier-ring" }, g);
  el("circle", { r: PLAYER_R, class: "body" }, g);
  el("circle", { r: PLAYER_R, class: "rim" }, g);
  if (p.ball) el("circle", { cx: 1.5, cy: -1.5, r: 0.6, class: "ball" }, g);
  return { ...p, node: g };
}

// Each player gets a slow, unique drift so the scene breathes without looking random.
function driftParams(i) {
  const r = (n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1; // tiny deterministic hash
  return {
    ax: 0.35 + r(1) * 0.8, ay: 0.3 + r(2) * 0.7,
    px: 5 + r(3) * 4, py: 6 + r(4) * 4,
    phase: r(5) * Math.PI * 2,
  };
}

function positionAt(p, t) {
  const d = p.drift;
  return {
    x: p.x + Math.sin((t / d.px) * Math.PI * 2 + d.phase) * d.ax,
    y: p.y + Math.cos((t / d.py) * Math.PI * 2 + d.phase) * d.ay,
  };
}

// Shorten a segment so it starts and ends at the edge of the discs, not their centres.
function trim(a, b, startGap, endGap) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  return { x1: a.x + ux * startGap, y1: a.y + uy * startGap, x2: b.x - ux * endGap, y2: b.y - uy * endGap };
}

// ---------- Public API ----------

export function buildPitch(svg, scene) {
  const { PITCH, VIEW_DEPTH, HOME, AWAY, READS } = scene;
  svg.setAttribute("viewBox", `-2 -4 ${PITCH.width + 4} ${VIEW_DEPTH + 4}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  drawDefs(svg);
  drawGrass(PITCH, svg);
  drawMarkings(PITCH, svg);

  const overlays = el("g", { class: "overlays" }, svg);
  const playersLayer = el("g", { class: "players" }, svg);

  // Scan cone: built pointing along +x, then rotated around the carrier every frame.
  const scanGroup = el("g", {}, overlays);
  const half = (READS.scan.spreadDeg / 2) * (Math.PI / 180);
  const L = READS.scan.length;
  el("path", {
    d: `M 0 0 L ${L * Math.cos(half)} ${-L * Math.sin(half)} A ${L} ${L} 0 0 1 ${L * Math.cos(half)} ${L * Math.sin(half)} Z`,
    class: "scan-cone",
  }, scanGroup);

  const open = { ...READS.openLane, node: el("line", { class: "lane lane--open", "marker-end": "url(#arrow)" }, overlays) };

  // Opponents first so our players draw on top.
  const players = [
    ...AWAY.map((p) => drawPlayer(p, "opp", playersLayer)),
    ...HOME.map((p) => drawPlayer(p, "home", playersLayer)),
  ].map((p, i) => ({ ...p, drift: driftParams(i) }));

  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  return { players, byId, scanGroup, open, scan: READS.scan };
}

// Draw one frame at time t (seconds). Pure "state -> picture", no stored motion state.
export function renderFrame(h, t) {
  const pos = {};
  for (const p of h.players) {
    const q = positionAt(p, t);
    pos[p.id] = q;
    p.node.setAttribute("transform", `translate(${q.x.toFixed(3)} ${q.y.toFixed(3)})`);
  }

  const c = pos[h.open.from];
  const sweep = Math.sin(t * 0.55) * (h.scan.sweepDeg / 2);
  h.scanGroup.setAttribute("transform", `translate(${c.x.toFixed(3)} ${c.y.toFixed(3)}) rotate(${(-90 + sweep).toFixed(2)})`);

  const setLine = (node, a, b, endGap) => {
    const s = trim(a, b, PLAYER_R + 1.2, endGap);
    node.setAttribute("x1", s.x1.toFixed(3)); node.setAttribute("y1", s.y1.toFixed(3));
    node.setAttribute("x2", s.x2.toFixed(3)); node.setAttribute("y2", s.y2.toFixed(3));
  };
  setLine(h.open.node, c, pos[h.open.to], PLAYER_R + 1.9);
}

// Runs the animation only while it can be seen, and not at all for reduced-motion users.
export function startAmbientMotion(h, container) {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  renderFrame(h, 0);
  if (still.matches) return;

  let visible = true, raf = 0, start = performance.now();
  const loop = (now) => {
    renderFrame(h, (now - start) / 1000);
    raf = requestAnimationFrame(loop);
  };
  const update = () => {
    cancelAnimationFrame(raf);
    if (visible && !document.hidden) raf = requestAnimationFrame(loop);
  };
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }).observe(container);
  document.addEventListener("visibilitychange", update);
  update();
}
