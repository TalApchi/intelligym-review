// Home page copy (index.html). Layout: src/site/pages/home.js.

export const HOME = {
  hero: {
    kicker: "Football game intelligence",
    title: ["Play.", "Learn.", "Read the game."], // the last line is highlighted
    lede: "Game intelligence is how quickly you see the picture, understand it and choose what to do. Test yours in five short football challenges, then learn how to train it.",
    primary: { label: "Test yourself", href: "play.html" },
    secondary: { label: "Explore training tools", href: "tools.html" },
    meta: "Free · no account · phone or computer",
  },

  // The guided journey. `href` must be a real page.
  journey: [
    { n: "01", title: "Play", text: "Five challenges: spot the change, track the runners, pick the pass, read the picture before it disappears, and time the through ball.", cta: { label: "Start the challenges", href: "play.html" } },
    { n: "02", title: "See how you did", text: "Up to 100 points per challenge, 500 in total, with a breakdown for each one. A score for these games, not an IQ test.", cta: { label: "Your results", href: "results.html" } },
    { n: "03", title: "Learn to read the game", text: "Scanning, awareness, anticipation, decisions and timing, explained simply, with tips for players, coaches and parents.", cta: { label: "Training tips", href: "learn.html" } },
    { n: "04", title: "Explore training tools", text: "Profiles of tools that train the mental side of football, side by side, with what each one costs and what its evidence shows.", cta: { label: "Compare tools", href: "tools.html#compare" } },
  ],

  toolsTeaser: {
    title: "Training tools",
    text: "Different tools train different things, from VR headsets to screen-based programmes. We describe each from its own published information.",
    cta: { label: "See all tools and the comparison", href: "tools.html" },
  },

  testimonialsTeaser: {
    title: "What coaches and players say about IntelliGym",
    note: "Testimonials published by IntelliGym about its own product. They are not about Soccer IQ or our challenges.",
    cta: { label: "More on IntelliGym", href: "intelligym.html#testimonials" },
  },

  finalCta: {
    title: "Ready to test your read of the game?",
    text: "Five challenges, a few minutes each. Practice rounds are never scored.",
    cta: { label: "Start the challenges", href: "play.html" },
  },
};
