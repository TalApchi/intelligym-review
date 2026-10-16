// Hand-placed starting pictures for "Spot the change", in metres on the
// attacking half (y = 0 is the opponents' goal line at the top, y = 52.5 is halfway).
// These are just plausible shapes to remember, not tactical advice.
//
// Roles are named from each team's own point of view. Our team attacks upward,
// so "your left" is the left of the screen. Opponents face down the screen,
// so "their left" is the right of the screen.

export const FORMATIONS = [
  {
    id: "final-third",
    home: [
      { id: "h-lw", role: "left winger", x: 10, y: 21 },
      { id: "h-st", role: "striker", x: 34, y: 14 },
      { id: "h-rw", role: "right winger", x: 58, y: 20 },
      { id: "h-am", role: "attacking midfielder", x: 41, y: 28 },
      { id: "h-lm", role: "left midfielder", x: 22, y: 35 },
      { id: "h-rm", role: "right midfielder", x: 46, y: 39 },
    ],
    away: [
      { id: "a-rb", role: "right back", x: 14, y: 12 },
      { id: "a-rcb", role: "right centre-back", x: 27, y: 9 },
      { id: "a-lcb", role: "left centre-back", x: 41, y: 9 },
      { id: "a-lb", role: "left back", x: 54, y: 12 },
      { id: "a-dm", role: "holding midfielder", x: 33, y: 23 },
    ],
  },
  {
    id: "midfield",
    home: [
      { id: "h-lb", role: "left back", x: 9, y: 40 },
      { id: "h-lw", role: "left winger", x: 12, y: 24 },
      { id: "h-lm", role: "left midfielder", x: 24, y: 33 },
      { id: "h-st", role: "striker", x: 36, y: 17 },
      { id: "h-rm", role: "right midfielder", x: 45, y: 36 },
      { id: "h-rw", role: "right winger", x: 60, y: 27 },
    ],
    away: [
      { id: "a-rcb", role: "right centre-back", x: 28, y: 9 },
      { id: "a-lcb", role: "left centre-back", x: 43, y: 10 },
      { id: "a-rm", role: "right midfielder", x: 21, y: 23 },
      { id: "a-cm", role: "central midfielder", x: 35, y: 27 },
      { id: "a-lm", role: "left midfielder", x: 51, y: 21 },
    ],
  },
  {
    id: "wide-left",
    home: [
      { id: "h-lw", role: "left winger", x: 8, y: 16 },
      { id: "h-st", role: "striker", x: 31, y: 14 },
      { id: "h-lm", role: "left midfielder", x: 19, y: 29 },
      { id: "h-am", role: "attacking midfielder", x: 39, y: 25 },
      { id: "h-rm", role: "right midfielder", x: 48, y: 35 },
      { id: "h-rb", role: "right back", x: 60, y: 41 },
    ],
    away: [
      { id: "a-rb", role: "right back", x: 13, y: 9 },
      { id: "a-rcb", role: "right centre-back", x: 25, y: 6 },
      { id: "a-lcb", role: "left centre-back", x: 40, y: 8 },
      { id: "a-cm", role: "central midfielder", x: 27, y: 21 },
      { id: "a-lm", role: "left midfielder", x: 53, y: 23 },
    ],
  },
];
