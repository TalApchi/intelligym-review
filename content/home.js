// Home page copy (index.html). Layout: src/site/pages/home.js.
// The home page has one job: get visitors to take the test. Keep it short.

export const HOME = {
  hero: {
    kicker: "Soccer game intelligence",
    title: ["How well do you", "read the game?"], // the last line is highlighted
    lede: "Five short soccer challenges on scanning, awareness, decisions and timing. Free, no account.",
    primary: { label: "TEST YOURSELF", href: "play.html" },
    meta: "A few minutes · phone or computer",
    // A discreet second way in: the three-challenge short test (short-test.html). The main
    // TEST YOURSELF action above stays the full test.
    short: { label: "Short on time? Try the short test", href: "short-test.html" },
    // The hero picture (Tal, 2026-11-21): a stylized 3D illustration, not a photograph or
    // footage from the challenges. Sizes are made by tools/hero_images.py from brand/hero/.
    // The scoreboard-style strip under the headline. The numbers come from the full test's plan
    // (src/config.js); only the labels live here.
    strip: { challenges: "Challenges", points: "Points" },
    visual: {
      base: "assets/hero/hero-pitch",
      src: "assets/hero/hero-pitch-960.jpg",
      width: 1448, height: 1086,
      alt: "Illustration of a soccer attack: a player dribbles toward the penalty area while a teammate runs into the box between defenders, with the goalkeeper set in goal.",
    },
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
