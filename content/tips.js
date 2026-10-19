// Training tips on the Learn page.
//
// Each tip: { id, title, body, for: ["players"|"coaches"|"parents"], source?, visible }
//   source: { label, url, checked } when the tip comes from someone else's published advice.
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

// Advice IntelliGym publishes for its own training programme. Shown as a separate,
// credited group so it is clear it applies to IntelliGym training.
export const IG_ADVICE = {
  title: "IntelliGym's advice for its own training",
  intro: "IntelliGym publishes practical guidance for athletes, parents and coaches using its programme. In summary:",
  items: [
    { id: "ig-routine", text: "Train 2 to 3 sessions a week, with at least 24 hours of rest between sessions.", source: { label: "IntelliGym FAQ: How often should an athlete train?", url: "https://soccer.intelligym.com/faq-items/how-often-should-an-athlete-train-with-the-intelligym/", checked: IG_CHECKED }, visible: true },
    { id: "ig-complete", text: "\"It is more important to complete the training than it is to excel within the training environment.\"", source: { label: "IntelliGym: Onboarding tips & best practices", url: "https://soccer.intelligym.com/best-practices/", checked: IG_CHECKED }, visible: true },
    { id: "ig-timing", text: "Avoid training right before a game or practice.", source: { label: "IntelliGym: Onboarding tips & best practices", url: "https://soccer.intelligym.com/best-practices/", checked: IG_CHECKED }, visible: true },
    { id: "ig-repeat", text: "The training is hard on purpose; repeat earlier levels as often as needed.", source: { label: "IntelliGym FAQ: Is the training difficult?", url: "https://soccer.intelligym.com/faq-items/is-the-training-difficult/", checked: IG_CHECKED }, visible: true },
    { id: "ig-measure", text: "Pair the training with on-field measures such as completed passes, takeaways and decision-making in games.", source: { label: "IntelliGym: Onboarding tips & best practices", url: "https://soccer.intelligym.com/best-practices/", checked: IG_CHECKED }, visible: true },
    { id: "ig-encourage", text: "Parents and coaches: encourage and reward progress, individually or as a team.", source: { label: "IntelliGym: Onboarding tips & best practices", url: "https://soccer.intelligym.com/best-practices/", checked: IG_CHECKED }, visible: true },
  ],
};
