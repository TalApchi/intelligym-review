// Scene data for the landing visual: WHO stands WHERE.
// Units are metres on a half pitch. x: 0 (left touchline) to 68 (right touchline).
// y: 0 (the goal line we attack) to 52.5 (the halfway line).
// Change a number here and the picture changes. No pixel maths needed.

export const PITCH = { width: 68, depth: 52.5 };

// How much of the half pitch the camera shows (metres from the goal line).
export const VIEW_DEPTH = 43;

// Our team (chalk). The ball carrier is marked with `ball: true`.
export const HOME = [
  { id: "carrier", x: 33, y: 33.5, ball: true },
  { id: "lb", x: 7, y: 37 },
  { id: "cb1", x: 22, y: 41 },
  { id: "rb", x: 61, y: 35 },
  { id: "cm", x: 48, y: 30 },
  { id: "cam", x: 39, y: 19.5 },
  { id: "lw", x: 9, y: 20 },
  { id: "rw", x: 60, y: 18.5, read: true },               // read: highlighted as "the read"
  { id: "st", x: 30, y: 10.5 },
];

// Opponents (slate).
export const AWAY = [
  { id: "gk", x: 34, y: 2.5 },
  { id: "d1", x: 15, y: 13 },
  { id: "d2", x: 27, y: 12 },
  { id: "d3", x: 41, y: 12.5 },
  { id: "d4", x: 53, y: 14 },
  { id: "m1", x: 21, y: 25 },
  { id: "m2", x: 32, y: 26 },
  { id: "m3", x: 45, y: 22 },
  { id: "f1", x: 26, y: 37 },
  { id: "f2", x: 43, y: 38.5 },
];

// Overlays that show what "reading the game" means.
export const READS = {
  openLane: { from: "carrier", to: "rw" },      // the pass that is on
  scan: { from: "carrier", length: 30, spreadDeg: 44, sweepDeg: 36 },
};
