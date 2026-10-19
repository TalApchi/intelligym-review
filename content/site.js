// Site-wide content: name, navigation, footer, disclosure, review banner.
// Edit text here; the layout is in src/site/shell.js.

export const SITE = {
  name: "Soccer IQ",
  tagline: "Read the game.",
  description: "Soccer IQ is a football website about game intelligence: five short challenges, practical tips on reading the game, and an honest look at the tools that train it.",
  copyright: "© 2026 Soccer IQ",

  // Main navigation, in order. `page` must match data-page on the page's <body>.
  nav: [
    { page: "home", label: "Home", href: "index.html" },
    { page: "play", label: "Test yourself", href: "play.html" },
    { page: "learn", label: "Training tips", href: "learn.html" },
    { page: "knowledge", label: "Knowledge hub", href: "knowledge.html" },
    { page: "tools", label: "Training tools", href: "tools.html" },
    { page: "results", label: "Your results", href: "results.html" },
  ],

  footer: {
    columns: [
      { title: "Play", links: [
        { label: "Start the challenges", href: "play.html" },
        { label: "Your results", href: "results.html" },
      ] },
      { title: "Learn", links: [
        { label: "Game intelligence", href: "learn.html#skills" },
        { label: "Training tips", href: "learn.html#tips" },
        { label: "Knowledge hub", href: "knowledge.html" },
      ] },
      { title: "Training tools", links: [
        { label: "All tools", href: "tools.html" },
        { label: "Comparison table", href: "tools.html#compare" },
        { label: "IntelliGym (featured partner)", href: "intelligym.html" },
      ] },
      { title: "About", links: [
        { label: "About Soccer IQ", href: "about.html" },
        { label: "FAQ", href: "faq.html" },
        { label: "Sources", href: "knowledge.html#sources" },
      ] },
    ],
    note: "Soccer IQ Points describe how you did in these games. They are not an IQ test or a validated assessment.",
  },

  // Shown wherever IntelliGym is presented or compared, and on the About page.
  disclosure: {
    short: "IntelliGym is a featured partner of Soccer IQ.",
    long: "IntelliGym is a featured partner of Soccer IQ, so we present it in more detail than other tools. Other tools are described from their own public pages. Soccer IQ's challenges are separate games: IntelliGym's research and testimonials are about IntelliGym, not about Soccer IQ.",
    reviewNote: "Confirm with Omri how the IntelliGym relationship should be described (for example partner, sponsor, or affiliate) and whether any commission must be disclosed.",
  },

  // Review build only (tools/build_review.py): a banner on every page.
  reviewBanner: "Review version for Omri. Notes marked \"Review\" and entries awaiting approval are hidden in the public build.",
};
