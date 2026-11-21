// The home hero picture: an original illustration of a match situation, seen from behind
// the player on the ball, looking at the goal. It is drawn here as inline SVG so it uses the
// theme colors (tokens.css, --scene-*), needs no image download and is in the prerendered HTML.
//
// It is an ILLUSTRATION, not footage or data from the challenges; the caption says so.
// No real players, kits, clubs or sponsors.
//
// Geometry is in metres on a real pitch and projected through a simple camera, so the
// penalty area, goal and players sit in believable perspective:
//   x   metres across the pitch (0 = centre of the goal, positive = right)
//   z   metres from the camera towards the goal line (goal line at z = 30)
//
// Story (the tactical overlay): our player carries the ball at the edge of the area; a
// teammate on the right starts a run behind their defender; the space behind is the read,
// and the dashed arrow is the pass into it, between two defenders.

const W = 800, H = 640;            // viewBox; the card crops it (xMidYMid slice)
const F = 860, CAM_H = 3.6, HORIZON = 34, CAM_X = 0.5;
const GOAL_Z = 30;

const sx = (x, z) => W / 2 + (F * (x - CAM_X)) / z;
const sy = (z, y = 0) => HORIZON + (F * (CAM_H - y)) / z;
const pt = (x, z, y = 0) => [sx(x, z), sy(z, y)];
const r1 = (n) => Math.round(n * 10) / 10;
const pts = (list) => list.map(([a, b]) => `${r1(a)},${r1(b)}`).join(" ");
const line = (a, b, cls = "sc-line") => `<line class="${cls}" x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}"/>`;

// ---------- Pitch: stripes, markings, goal, the stand ----------

function stripes() {
  const out = [];
  let k = 0;
  for (let z = 3; z < 40; z += 3.6, k++) {
    const z2 = Math.min(z + 3.6, 40);
    const y1 = sy(z2), y2 = Math.min(sy(z), H + 40);
    out.push(`<rect class="${k % 2 ? "sc-grass-b" : "sc-grass-a"}" x="-10" y="${r1(y1)}" width="${W + 20}" height="${r1(y2 - y1 + 0.6)}"/>`);
  }
  return out.join("");
}

function markings() {
  const BOX = 20.16, BOX_Z = GOAL_Z - 16.5, SIX = 9.16, SIX_Z = GOAL_Z - 5.5;
  const parts = [
    line(pt(-60, GOAL_Z), pt(60, GOAL_Z)),
    `<polyline class="sc-line" points="${pts([pt(-BOX, GOAL_Z), pt(-BOX, BOX_Z), pt(BOX, BOX_Z), pt(BOX, GOAL_Z)])}"/>`,
    `<polyline class="sc-line" points="${pts([pt(-SIX, GOAL_Z), pt(-SIX, SIX_Z), pt(SIX, SIX_Z), pt(SIX, GOAL_Z)])}"/>`,
  ];
  // The penalty arc: the part of the 9.15 m circle around the spot outside the area.
  const arc = [];
  for (let a = 0; a <= 180; a += 4) {
    const t = (a * Math.PI) / 180;
    const x = 9.15 * Math.cos(t), z = GOAL_Z - 11 - 9.15 * Math.sin(t);
    if (z <= BOX_Z) arc.push(pt(x, z));
  }
  parts.push(`<polyline class="sc-line" points="${pts(arc)}"/>`);
  const [px, py] = pt(0, GOAL_Z - 11);
  parts.push(`<ellipse class="sc-spot" cx="${r1(px)}" cy="${r1(py)}" rx="3.4" ry="1.6"/>`);
  return parts.join("");
}

function stand() {
  const boardTop = sy(36, 0.9), boardBot = sy(36);
  // A few rows of crowd dots, deterministic (no Math.random: the prerender and the page match).
  const dots = [];
  for (let row = 0; row < 7; row++) {
    const y = boardTop - 8 - row * 11;
    for (let i = 0; i < 46; i++) {
      const x = ((i * 37 + row * 23) % 46) * 18 + (row % 2) * 9 - 10;
      const s = ((i * 13 + row * 7) % 5);
      dots.push(`<circle class="sc-crowd sc-crowd--${s % 3}" cx="${x}" cy="${r1(y + (s - 2))}" r="${2.6 + (s % 2) * 0.6}"/>`);
    }
  }
  return `
    <rect class="sc-stand" x="-10" y="-10" width="${W + 20}" height="${r1(boardTop + 10)}"/>
    <g class="sc-crowd-g">${dots.join("")}</g>
    <rect class="sc-boards" x="-10" y="${r1(boardTop)}" width="${W + 20}" height="${r1(boardBot - boardTop)}"/>
    <rect class="sc-boards-line" x="-10" y="${r1(boardTop)}" width="${W + 20}" height="1.5"/>`;
}

function goal() {
  const HW = 3.66, GH = 2.44, D = 2.0;
  const fl = pt(-HW, GOAL_Z), fr = pt(HW, GOAL_Z), tl = pt(-HW, GOAL_Z, GH), tr = pt(HW, GOAL_Z, GH);
  const bl = pt(-HW, GOAL_Z + D), br = pt(HW, GOAL_Z + D), btl = pt(-HW, GOAL_Z + D, GH * 0.8), btr = pt(HW, GOAL_Z + D, GH * 0.8);
  const netBack = pts([bl, btl, btr, br]);
  return `
    <polygon class="sc-net-back" points="${pts([tl, tr, fr, br, btr, btl, bl, fl])}"/>
    <polygon class="sc-net" points="${netBack}" fill="url(#sc-mesh)"/>
    <polygon class="sc-net" points="${pts([tl, btl, bl, fl])}" fill="url(#sc-mesh)"/>
    <polygon class="sc-net" points="${pts([tr, btr, br, fr])}" fill="url(#sc-mesh)"/>
    <polygon class="sc-net" points="${pts([tl, tr, btr, btl])}" fill="url(#sc-mesh)"/>
    <polyline class="sc-post sc-post--shade" points="${pts([fl, tl, tr, fr])}" transform="translate(1.2 1.2)"/>
    <polyline class="sc-post" points="${pts([fl, tl, tr, fr])}"/>`;
}

// ---------- Players: pictogram figures ----------
// A pose is a set of joints in a local frame: 100 units tall, feet at y = 0, y up is negative.
// Limbs are thick round strokes, so the figures read clearly at any size.

const POSES = {
  // From behind, running towards goal with the ball just ahead.
  carrier: {
    head: [0, -91], neck: [0, -82],
    sh: [[-11, -77], [11, -77]], hip: [[-6.5, -50], [6.5, -50]],
    legs: [ // [knee, ankle, toe]
      [[-8, -28], [-7, -5], [-7, 0]],
      [[9, -27], [15, -13], [16, -8]],
    ],
    arms: [ // [elbow, hand]
      [[-20, -63], [-19, -51]],
      [[19, -67], [25, -57]],
    ],
    number: true, back: true,
  },
  // Side-on sprint to the right, into the space.
  runner: {
    head: [5, -90], neck: [3, -81],
    sh: [[0, -76], [5, -76]], hip: [[-3, -50], [1, -50]],
    legs: [
      [[-6, -27], [-15, -10], [-10, -2]],
      [[13, -37], [10, -17], [17, -16]],
    ],
    arms: [
      [[-9, -62], [-5, -52]],
      [[13, -66], [17, -77]],
    ],
  },
  // Facing the camera, knees bent, ready to block.
  defender: {
    head: [0, -86], neck: [0, -78],
    sh: [[-11, -73], [11, -73]], hip: [[-6.5, -46], [6.5, -46]],
    legs: [
      [[-13, -25], [-14, -5], [-18, 0]],
      [[13, -25], [14, -5], [18, 0]],
    ],
    arms: [
      [[-20, -58], [-25, -47]],
      [[20, -58], [25, -47]],
    ],
    face: true,
  },
  // Turning, half side-on, tracking the runner.
  turner: {
    head: [2, -89], neck: [1, -80],
    sh: [[-9, -75], [9, -75]], hip: [[-5.5, -49], [5.5, -49]],
    legs: [
      [[-9, -27], [-13, -6], [-17, -1]],
      [[10, -28], [13, -7], [17, -3]],
    ],
    arms: [
      [[-18, -62], [-16, -50]],
      [[17, -64], [24, -58]],
    ],
    face: true,
  },
  keeper: {
    head: [0, -86], neck: [0, -78],
    sh: [[-11, -73], [11, -73]], hip: [[-6.5, -46], [6.5, -46]],
    legs: [
      [[-14, -26], [-15, -5], [-19, 0]],
      [[14, -26], [15, -5], [19, 0]],
    ],
    arms: [
      [[-24, -64], [-31, -56]],
      [[24, -64], [31, -56]],
    ],
    face: true, gloves: true,
  },
};

const seg = (a, b, w, cls) => `<line class="${cls}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke-width="${w}"/>`;
const mid = (a, b, t = 0.5) => [r1(a[0] + (b[0] - a[0]) * t), r1(a[1] + (b[1] - a[1]) * t)];

function figure(pose, kit, skin) {
  const p = POSES[pose];
  const [hipL, hipR] = p.hip, [shL, shR] = p.sh;
  const leg = ([knee, ankle, toe], hip) => {
    const sock = mid(knee, ankle, 0.35);
    return seg(hip, knee, 10, `sc-limb sc-${kit}-shorts`) + seg(hip, mid(hip, knee, 0.55), 10.5, `sc-limb sc-${kit}-shorts`) +
      seg(knee, sock, 7.6, `sc-limb sc-skin-${skin}`) + seg(sock, ankle, 7.6, `sc-limb sc-${kit}-socks`) +
      seg(ankle, toe, 6.4, "sc-limb sc-boot");
  };
  const arm = ([elbow, hand], sh) =>
    seg(sh, mid(sh, elbow, 0.6), 7, `sc-limb sc-${kit}-shirt`) + seg(mid(sh, elbow, 0.5), elbow, 5.8, `sc-limb sc-skin-${skin}`) +
    seg(elbow, hand, 5.4, p.gloves ? "sc-limb sc-glove" : `sc-limb sc-skin-${skin}`);
  // Torso: shoulders to hips, slightly tapered, rounded by a stroke in the shirt color.
  const torso = `<polygon class="sc-torso sc-${kit}-shirt" points="${pts([[shL[0] - 1, shL[1]], [shR[0] + 1, shR[1]], [hipR[0] + 1.5, hipR[1] + 2], [hipL[0] - 1.5, hipL[1] + 2]])}"/>`;
  const shorts = `<polygon class="sc-torso sc-${kit}-shorts" points="${pts([[hipL[0] - 2.5, hipL[1] - 1], [hipR[0] + 2.5, hipR[1] - 1], [hipR[0] + 3.5, hipR[1] + 11], [hipL[0] - 3.5, hipL[1] + 11]])}"/>`;
  const neck = seg(p.neck, [p.neck[0], p.neck[1] + 5], 5, `sc-limb sc-skin-${skin}`);
  const head = `<circle class="sc-skin-${skin}-fill" cx="${p.head[0]}" cy="${p.head[1]}" r="7.6"/>` +
    (p.back
      ? `<path class="sc-hair" d="M${p.head[0] - 7.6} ${p.head[1] + 1} a7.6 7.6 0 0 1 15.2 0 q0 4 -1.5 5.5 h-12.2 q-1.5 -1.5 -1.5 -5.5z"/>`
      : `<path class="sc-hair" d="M${p.head[0] - 7.6} ${p.head[1] - 0.5} a7.6 7.6 0 0 1 15.2 0 q-3.5 -3.2 -7.6 -3.2 q-4.1 0 -7.6 3.2z"/>`);
  const number = p.number ? `<text class="sc-number" x="${(shL[0] + shR[0]) / 2}" y="${shL[1] + 17}" text-anchor="middle">10</text>` : "";
  // Back limbs first, then the body, then the front limbs.
  return leg(p.legs[0], hipL) + arm(p.arms[0], shL) + shorts + leg(p.legs[1], hipR) + torso + number + neck + head + arm(p.arms[1], shR);
}

// Place a figure on the pitch at (x, z), scaled to a 1.8 m player.
function player({ x, z, pose, kit, skin = 1, flip = false }) {
  const [fx, fy] = pt(x, z);
  const s = (F * 1.8) / z / 100;
  const shadow = `<ellipse class="sc-shadow" cx="${r1(fx)}" cy="${r1(fy)}" rx="${r1(22 * s)}" ry="${r1(5 * s)}"/>`;
  return `${shadow}<g transform="translate(${r1(fx)} ${r1(fy)}) scale(${flip ? -r1(s * 100) / 100 : r1(s * 100) / 100} ${r1(s * 100) / 100})">${figure(pose, kit, skin)}</g>`;
}

function ball(x, z) {
  const [bx, by] = pt(x, z, 0.11);
  const r = (F * 0.11) / z;
  return `<ellipse class="sc-shadow" cx="${r1(bx + r * 0.3)}" cy="${r1(by + r)}" rx="${r1(r * 1.1)}" ry="${r1(r * 0.35)}"/>
    <g transform="translate(${r1(bx)} ${r1(by)}) scale(${r1(r / 10 * 100) / 100})">
      <circle class="sc-ball" r="10"/>
      <path class="sc-ball-patch" d="M0 -3.6 L3.4 -1.1 L2.1 2.9 L-2.1 2.9 L-3.4 -1.1Z"/>
      <path class="sc-ball-seam" d="M0 -3.6V-9.4M3.4 -1.1L8.9 -2.9M2.1 2.9L5.5 7.6M-2.1 2.9L-5.5 7.6M-3.4 -1.1L-8.9 -2.9"/>
      <path class="sc-ball-patch" d="M-2.6 -9.9 L2.6 -9.9 L0 -9.4Z M9.4 -1.6 L8 3.6 L8.9 -2.9Z M-9.4 -1.6 L-8 3.6 L-8.9 -2.9Z"/>
    </g>`;
}

// ---------- The read: space, run and pass ----------

const BALL = { x: -0.15, z: 7.0 };
const SPACE = { x: 3.3, z: 23.6 };
const RUN_FROM = { x: 6.6, z: 16.2 };

function read() {
  // The space behind the defender: a soft teal pool and a dashed ring on the grass.
  const ring = [];
  for (let a = 0; a < 360; a += 10) {
    const t = (a * Math.PI) / 180;
    ring.push(pt(SPACE.x + 3.1 * Math.cos(t), SPACE.z + 2.6 * Math.sin(t)));
  }
  const [cx, cy] = pt(SPACE.x, SPACE.z);
  // The teammate's run: from where they are into the space, curving round the defender.
  const run = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const x = RUN_FROM.x + (SPACE.x + 0.8 - RUN_FROM.x) * t + Math.sin(t * Math.PI) * 1.4;
    const z = RUN_FROM.z + (SPACE.z - 0.6 - RUN_FROM.z) * t;
    run.push(pt(x, z));
  }
  // The pass: ball to the near edge of the space, a gentle curve (a quadratic curve on screen).
  const p0 = pt(BALL.x + 0.2, BALL.z + 0.3), p2 = pt(SPACE.x - 0.3, SPACE.z - 1.2);
  const p1 = [(p0[0] + p2[0]) / 2 - 34, (p0[1] + p2[1]) / 2 - 6];
  const pass = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, u = 1 - t;
    pass.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
  }
  const end = p2;
  const ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
  const head = [
    [end[0] + Math.cos(ang) * 6, end[1] + Math.sin(ang) * 6],
    [end[0] + Math.cos(ang + 2.6) * 14, end[1] + Math.sin(ang + 2.6) * 14],
    [end[0] + Math.cos(ang - 2.6) * 14, end[1] + Math.sin(ang - 2.6) * 14],
  ];
  return {
    space: `<ellipse class="sc-space-pool" cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1((F * 3.4) / SPACE.z)}" ry="${r1((F * 3.4) / SPACE.z * 0.28)}"/>
      <polygon class="sc-space-ring" points="${pts(ring)}"/>`,
    run: `<polyline class="sc-run" points="${pts(run)}"/>`,
    pass: `<polyline class="sc-pass-halo" points="${pts(pass)}"/><polyline class="sc-pass" points="${pts(pass)}"/>
      <polygon class="sc-pass-head" points="${pts(head)}"/>`,
    label: [r1(cx), r1(cy)],
  };
}

// A small label on the pitch, above the space.
function chip([x, y], text) {
  const w = text.length * 9.4 + 32, h = 32, top = y - 58;
  return `<g class="sc-chip" transform="translate(${r1(x - w / 2)} ${r1(top)})">
      <rect width="${r1(w)}" height="${h}" rx="16"/>
      <circle class="sc-chip-dot" cx="16" cy="16" r="5"/>
      <text x="28" y="21.5">${text}</text>
      <path class="sc-chip-tail" d="M${r1(w / 2 - 51)} ${h} l5 6 l5 -6z"/>
    </g>`;
}

export function heroSceneSVG() {
  const R = read();
  const people = [
    { x: 0.7, z: 28.8, pose: "keeper", kit: "gk", skin: 2 },
    { x: -4.6, z: 19.8, pose: "defender", kit: "opp", skin: 1 },
    { x: 4.4, z: 18.0, pose: "turner", kit: "opp", skin: 3 },
    { x: RUN_FROM.x, z: RUN_FROM.z, pose: "runner", kit: "home", skin: 2 },
    { x: -6.4, z: 14.2, pose: "runner", kit: "home", skin: 3, flip: true },
    { x: -1.9, z: 11.4, pose: "defender", kit: "opp", skin: 2 },
  ].sort((a, b) => b.z - a.z); // far ones first
  const carrier = { x: -0.8, z: 6.5, pose: "carrier", kit: "home", skin: 1 };

  return `
  <svg class="hero-scene__svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="hero-scene-title">
    <title id="hero-scene-title">Illustration: a soccer player dribbles toward goal while a teammate runs into space behind a defender; a dashed arrow shows the pass into that space.</title>
    <defs>
      <pattern id="sc-mesh" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path class="sc-mesh" d="M0 0H7M0 0V7"/>
      </pattern>
      <radialGradient id="sc-flood" cx="50%" cy="0%" r="80%">
        <stop offset="0" class="sc-flood-a"/><stop offset="1" class="sc-flood-b"/>
      </radialGradient>
      <linearGradient id="sc-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.62" class="sc-fade-a"/><stop offset="1" class="sc-fade-b"/>
      </linearGradient>
    </defs>
    ${stand()}
    <g class="sc-pitch">${stripes()}${markings()}</g>
    ${goal()}
    ${R.space}
    ${R.run}
    ${people.map(player).join("")}
    ${R.pass}
    ${chip([R.label[0] + 46, R.label[1]], "Space to pass into")}
    ${ball(BALL.x, BALL.z)}
    ${player(carrier)}
    <rect class="sc-light" x="0" y="0" width="${W}" height="${H}" fill="url(#sc-flood)"/>
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#sc-fade)"/>
  </svg>`;
}

