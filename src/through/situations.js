// "Through ball" situations (version 2, playground first). Each is a different picture:
// who has the ball, who makes the run and where to, and how the defence is set up.
// The defenders' jobs are explained in sim.js. PROVISIONAL: written by the build team, not a
// coach; the shapes and jobs need Omri's eye before this replaces challenge 5.
//
// Coordinates are for the right-hand version; every play mirrors at random and nudges
// positions a little. y = 0 is their goal line, y = 52.5 halfway. Paths are waypoints
// [x, y] or [x, y, "stop"] (stop there first). `go` is when a player starts moving, in
// seconds. Roles avoid left/right because the picture can be mirrored.
// `behind`: the defenders the runner has to get beyond for the ball to count as in behind
// (default: the runner's marker).
// `use`: "demo" and "practice" situations are kept for those; the rest make up the rounds.

export const THROUGH_SITUATIONS = [
  {
    id: "striker-split",
    use: "demo",
    title: "Striker between the centre-backs",
    about: "You are in central midfield. The striker runs diagonally across their centre-back and into the gap between the two centre-backs.",
    you: { from: [34, 41], path: [[34, 38]] },
    runner: { role: "striker", from: [42, 24], go: 0.8, path: [[40, 21], [32, 12]] },
    mates: [
      { id: "lw", role: "winger", from: [9, 26], go: 0.6, path: [[10, 24]] },
      { id: "rw", role: "winger", from: [59, 26], go: 0.6, path: [[58, 24]] },
      { id: "am", role: "attacking midfielder", from: [38, 32], go: 0.4, path: [[47, 28]] },
    ],
    defenders: [
      { id: "d-gk", role: "goalkeeper", job: "keeper", at: [34, 3] },
      { id: "d-cb1", role: "centre-back", job: "marker", mark: "runner", at: [41, 20.5], react: 0.45, goalSide: 1.5 },
      { id: "d-cb2", role: "centre-back", job: "cover", at: [27, 19], zone: 16 },
      { id: "d-fb1", role: "full back", job: "marker", mark: "lw", at: [12, 22] },
      { id: "d-fb2", role: "full back", job: "marker", mark: "rw", at: [56, 22] },
      { id: "d-cm1", role: "central midfielder", job: "press", at: [24, 37] },
      { id: "d-cm2", role: "central midfielder", job: "marker", mark: "am", at: [38, 28], follow: 0 },
    ],
  },
  {
    id: "overlap",
    use: "practice",
    title: "Full back overlapping",
    behind: ["d-fb"],
    about: "You are the winger, on the ball out wide. Your full back overlaps round the outside.",
    you: { from: [55, 31], path: [[54, 29]] },
    runner: { role: "full back", from: [57, 43], go: 0.3, path: [[62, 33], [63, 20], [61, 10]] },
    mates: [{ id: "st", role: "striker", from: [34, 22], go: 0.8, path: [[32, 16]] }],
    defenders: [
      { id: "d-gk", role: "goalkeeper", job: "keeper", at: [34, 3] },
      { id: "d-fb", role: "full back", job: "press", at: [51, 23], distance: 4 },
      { id: "d-wm", role: "wide midfielder", job: "marker", mark: "runner", at: [52, 38], chase: true, react: 0.5 },
      { id: "d-cb1", role: "centre-back", job: "cover", at: [41, 18], zone: 24 },
      { id: "d-cb2", role: "centre-back", job: "marker", mark: "st", at: [33, 17] },
    ],
  },
  {
    id: "winger-behind",
    title: "Winger in behind the full back",
    about: "You are in central midfield. The winger comes short, their full back follows, and the winger spins in behind.",
    you: { from: [32, 40], path: [[33, 36]] },
    runner: { role: "winger", from: [57, 26], go: 0.4, path: [[55.5, 33], [62, 21], [56, 8]] },
    mates: [
      { id: "st", role: "striker", from: [36, 23], go: 0.9, path: [[32, 20]] },
      { id: "fw", role: "far winger", from: [12, 26], go: 0.8, path: [[15, 19]] },
      { id: "am", role: "attacking midfielder", from: [44, 31], go: 0.4, path: [[37, 25]] },
      { id: "fb", role: "full back", from: [60, 46], go: 0.4, path: [[61, 39]] },
    ],
    defenders: [
      { id: "d-gk", role: "goalkeeper", job: "keeper", at: [34, 3] },
      { id: "d-fb", role: "full back", job: "marker", mark: "runner", at: [54, 24], react: 0.45, goalSide: 1.5, follow: 8 },
      { id: "d-cb1", role: "centre-back", job: "cover", at: [41, 19], zone: 22 },
      { id: "d-cb2", role: "centre-back", job: "marker", mark: "st", at: [33, 18] },
      { id: "d-fb2", role: "full back", job: "marker", mark: "fw", at: [15, 22] },
      { id: "d-cm", role: "central midfielder", job: "press", at: [27, 31] },
      { id: "d-cm2", role: "central midfielder", job: "marker", mark: "am", at: [42, 27.5], follow: 0 },
      { id: "d-wm", role: "wide midfielder", job: "zone", at: [22, 31] },
    ],
  },
  {
    id: "late-run",
    title: "Midfielder arriving from deep",
    behind: ["d-cb1", "d-cb2"],
    about: "You are in central midfield. The striker drops short and takes a centre-back with them; your other midfielder runs diagonally from deep into the space they leave.",
    you: { from: [44, 40], path: [[43, 37]] },
    runner: { role: "central midfielder", from: [29, 38], go: 0.6, path: [[31, 30], [38, 17], [40, 8]] },
    mates: [
      { id: "st", role: "striker", from: [35, 21], go: 0.4, path: [[37, 27, "stop"]] },
      { id: "rw", role: "winger", from: [60, 24], go: 0.8, path: [[60, 19]] },
      { id: "lw", role: "winger", from: [8, 25], go: 0.8, path: [[9, 20]] },
    ],
    defenders: [
      { id: "d-gk", role: "goalkeeper", job: "keeper", at: [34, 3] },
      { id: "d-cb1", role: "centre-back", job: "marker", mark: "st", at: [34, 18], follow: 8 },
      { id: "d-cb2", role: "centre-back", job: "cover", at: [43, 18], zone: 18 },
      { id: "d-fb1", role: "full back", job: "marker", mark: "rw", at: [57, 21] },
      { id: "d-fb2", role: "full back", job: "marker", mark: "lw", at: [11, 22] },
      { id: "d-cm1", role: "central midfielder", job: "zone", at: [35, 31], react: 0.5 },
      { id: "d-cm2", role: "central midfielder", job: "press", at: [51, 32] },
    ],
  },
  {
    id: "outside-in",
    title: "Winger's curved run inside",
    about: "You are in central midfield, on the other side. The winger runs down the line past their full back's outside, then curves in behind them towards the box.",
    you: { from: [25, 37], path: [[27, 35]] },
    runner: { role: "winger", from: [63, 25], go: 0.7, path: [[64, 19], [58, 12], [50, 9]] },
    mates: [
      { id: "st", role: "striker", from: [33, 22], go: 0.5, path: [[28, 19]] },
      { id: "lw", role: "winger", from: [9, 26], go: 0.6, path: [[10, 21]] },
      { id: "am", role: "attacking midfielder", from: [38, 31], go: 0.5, path: [[43, 35]] },
    ],
    defenders: [
      { id: "d-gk", role: "goalkeeper", job: "keeper", at: [34, 3] },
      { id: "d-fb", role: "full back", job: "marker", mark: "runner", at: [58, 21], react: 0.45, goalSide: 1.5 },
      { id: "d-cb1", role: "centre-back", job: "cover", at: [42, 18], zone: 22 },
      { id: "d-cb2", role: "centre-back", job: "marker", mark: "st", at: [31, 18] },
      { id: "d-fb2", role: "full back", job: "marker", mark: "lw", at: [12, 23] },
      { id: "d-cm1", role: "central midfielder", job: "press", at: [20, 30] },
      { id: "d-cm2", role: "central midfielder", job: "marker", mark: "am", at: [38, 28], follow: 0 },
    ],
  },
  {
    id: "channel",
    title: "Striker into the channel",
    about: "You are the full back, wide near halfway. The winger comes short and takes their full back with them; the striker runs across into the channel behind.",
    you: { from: [62, 42], path: [[61, 39]] },
    runner: { role: "striker", from: [36, 22], go: 1.1, path: [[42, 20], [52, 11], [53, 6]] },
    mates: [
      { id: "rw", role: "winger", from: [59, 26], go: 0.3, path: [[52, 31, "stop"]] },
      { id: "lw", role: "winger", from: [9, 25], go: 0.8, path: [[10, 20]] },
      { id: "am", role: "attacking midfielder", from: [41, 32], go: 0.5, path: [[36, 29]] },
    ],
    defenders: [
      { id: "d-gk", role: "goalkeeper", job: "keeper", at: [34, 3] },
      { id: "d-cb1", role: "centre-back", job: "marker", mark: "runner", at: [36, 19], react: 0.45, goalSide: 1.5 },
      { id: "d-cb2", role: "centre-back", job: "cover", at: [27, 18], zone: 30 },
      { id: "d-fb1", role: "full back", job: "marker", mark: "rw", at: [57, 23], follow: 8 },
      { id: "d-fb2", role: "full back", job: "marker", mark: "lw", at: [12, 22] },
      { id: "d-cm1", role: "central midfielder", job: "marker", mark: "am", at: [39, 29], follow: 0 },
      { id: "d-wm", role: "wide midfielder", job: "press", at: [65, 35], distance: 4 },
    ],
  },
  {
    id: "underlap",
    title: "Midfielder underlapping inside",
    behind: ["d-fb"],
    about: "You are the winger, on the ball out wide. A central midfielder runs past on the inside, between their full back and centre-back.",
    you: { from: [62, 31], path: [[61, 29]] },
    runner: { role: "central midfielder", from: [46, 37], go: 0.5, path: [[50, 28], [52, 16], [50, 8]] },
    mates: [
      { id: "st", role: "striker", from: [36, 20], go: 0.8, path: [[32, 15]] },
      { id: "am", role: "attacking midfielder", from: [38, 31], go: 0.6, path: [[33, 28]] },
    ],
    defenders: [
      { id: "d-gk", role: "goalkeeper", job: "keeper", at: [34, 3] },
      { id: "d-fb", role: "full back", job: "press", at: [64, 24], distance: 4 },
      { id: "d-cm1", role: "central midfielder", job: "marker", mark: "runner", at: [43, 35], chase: true, react: 0.5 },
      { id: "d-cb1", role: "centre-back", job: "cover", at: [45, 18], zone: 18 },
      { id: "d-cb2", role: "centre-back", job: "marker", mark: "st", at: [35, 17] },
      { id: "d-cm2", role: "central midfielder", job: "marker", mark: "am", at: [38, 28], follow: 0 },
    ],
  },
];
