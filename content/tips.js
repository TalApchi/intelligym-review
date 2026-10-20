// Training tips on the Learn page.
//
// Each tip: { id, title, body, for: ["players"|"coaches"|"parents"], source?, visible }
//   source: { label, url, checked } when the tip comes from someone else's published advice.
//           Kept here for our records; it is not shown on the page.
//   visible: false hides the tip without deleting it.

const IG_CHECKED = "2026-10-18";

// Practical habits for the pitch, in our own words.
export const TIPS = [
  {
    id: "scan-before",
    title: "Look before the ball arrives",
    body: "In every passing drill, check over both shoulders before the ball reaches you. At first, count your looks out loud; it soon becomes a habit you do without thinking.",
    for: ["players"],
    visible: true,
  },
  {
    id: "small-sided",
    title: "Play small-sided games",
    body: "3v3 and 4v4 games give every player more touches and many more decisions than a full match, with less time on the ball.",
    for: ["players", "coaches"],
    source: { label: "IntelliGym: What is soccer IQ and how can you improve it?", url: "https://soccer.intelligym.com/what-is-soccer-iq-and-how-can-you-improve-it/", checked: IG_CHECKED },
    visible: true,
  },
  {
    id: "touch-limits",
    title: "Limit the touches",
    body: "One- or two-touch rules force players to decide before the ball arrives, which is where scanning pays off.",
    for: ["players", "coaches"],
    source: { label: "IntelliGym: What is soccer IQ and how can you improve it?", url: "https://soccer.intelligym.com/what-is-soccer-iq-and-how-can-you-improve-it/", checked: IG_CHECKED },
    visible: true,
  },
  {
    id: "say-what-you-saw",
    title: "Say what you saw",
    body: "After a move or a clip, ask the player what they saw and what else was on. Hearing their reasoning tells a coach more than the outcome does.",
    for: ["coaches", "parents"],
    visible: true,
  },
  {
    id: "second-option",
    title: "Always have a second option",
    body: "Before receiving, pick a first and a second choice. If the first is closed when the ball arrives, the second is already in your head.",
    for: ["players"],
    visible: true,
  },
  {
    id: "praise-the-read",
    title: "Praise the decision, not only the result",
    body: "A good pass that a teammate misses was still a good read. Praising the decision keeps players willing to try the right thing.",
    for: ["coaches", "parents"],
    visible: true,
  },
];
