// Knowledge hub (knowledge.html). The evidence entries come from tools.js (every provider in the
// same format); the reading list at the bottom is the research those providers cite.

export const KNOWLEDGE = {
  title: "Knowledge hub",
  intro: "What game intelligence is, what training tools say about their evidence, and how to read those claims.",

  basics: {
    title: "Game intelligence in one paragraph",
    body: "Coaches use \"game intelligence\" or \"soccer IQ\" for a player's ability to read the game: take in what is happening around them, predict what comes next and pick a good action in time. It draws on perception (scanning, attention), memory (keeping track of players), and decision-making under time pressure. It is a description of how players play, not a single number.",
    link: { label: "The five skills, explained", href: "learn.html#skills" },
  },

  readingClaims: {
    title: "How to read a training claim",
    points: [
      { title: "Who ran the study?", text: "Research run or paid for by the company selling the product is useful, but independent replication is stronger." },
      { title: "Was there a fair comparison?", text: "Look for a control group that did something similar, randomly assigned, with raters who did not know who trained." },
      { title: "How many players, and who?", text: "Small groups give uncertain results. Results from pilots, other sports or adults may not carry over to young soccer players." },
      { title: "What was measured?", text: "Getting better at the training task is not the same as playing better in matches. Check how on-pitch performance was measured." },
      { title: "Is it published?", text: "A peer-reviewed journal paper has been checked by other scientists. A company article or a self-uploaded report has not." },
      { title: "Are the numbers rounded up?", text: "\"Up to 30%\" usually means the best case, not the typical result." },
    ],
  },

  ourChallenges: {
    title: "About the Soccer IQ challenges",
    body: "Our five challenges are games designed around moments from soccer games: noticing a change, tracking runners, choosing a pass, reading the picture before it disappears and timing a through ball. They have not been validated as a test, and we make no claim that playing them improves performance. The research on this page is about the training tools, not about our challenges.",
  },
};
