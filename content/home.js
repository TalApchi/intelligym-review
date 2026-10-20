// Home page copy (index.html). Layout: src/site/pages/home.js.
// The home page has one job: get visitors to take the test. Keep it short.

export const HOME = {
  hero: {
    kicker: "Soccer game intelligence",
    title: ["How well do you", "read the game?"], // the last line is highlighted
    lede: "Five short soccer challenges on scanning, awareness, decisions and timing. Free, no account.",
    primary: { label: "TEST YOURSELF", href: "play.html" },
    meta: "A few minutes · phone or computer",
  },

  // The guided journey, kept to one line per step. `href` must be a real page.
  journey: [
    { n: "1", title: "TEST YOURSELF", text: "Five challenges, up to 100 points each.", cta: { label: "TEST YOURSELF", href: "play.html" } },
    { n: "2", title: "See your results", text: "A breakdown for every challenge.", cta: { label: "Your results", href: "results.html" } },
    { n: "3", title: "Learn", text: "Simple tips to read the game better.", cta: { label: "Training tips", href: "learn.html" } },
    { n: "4", title: "Explore training", text: "Training tools compared side by side.", cta: { label: "Training tools", href: "tools.html" } },
  ],

  skillsTitle: "The five skills we test",

  finalCta: {
    title: "Ready when you are",
    text: "Practice rounds are never scored.",
    cta: { label: "TEST YOURSELF", href: "play.html" },
  },
};
