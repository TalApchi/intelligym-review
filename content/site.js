// Site-wide content: name, navigation, footer, operator line, review banner, search settings.
// Edit text here; the layout is in src/site/shell.js.

export const SITE = {
  name: "Soccer IQ",
  tagline: "Better decisions on the pitch.",
  description: "Soccer IQ is a soccer website about game intelligence: five short challenges, practical tips on reading the game, and a plain comparison of the tools that train it.",
  copyright: "© 2026 Soccer IQ",

  // Who runs the site. Shown on the About page directly under the site name, exactly as written.
  operator: "IntelliGym Labs, New Jersey U.S",

  // Logo files (derived from Omri's originals in brand/omri/ by tools/derive_logo.py).
  // `width` and `height` keep the supplied proportions (415 x 91).
  logo: {
    onDark: "assets/brand/socceriq-logo-dark.svg",
    onLight: "assets/brand/socceriq-logo-light.svg",
    icon: "assets/brand/socceriq-icon.svg",
    alt: "soccerIQ.tech",
    width: 415,
    height: 91,
  },

  // Header navigation, in order. `page` must match data-page on the page's <body>.
  // "Test yourself" is not listed here: it is the single highlighted button in the header (`cta`).
  nav: [
    { page: "home", label: "Home", href: "index.html" },
    { page: "learn", label: "Training tips", href: "learn.html" },
    { page: "knowledge", label: "Knowledge hub", href: "knowledge.html" },
    { page: "tools", label: "Training tools", href: "tools.html" },
    { page: "results", label: "Your results", href: "results.html" },
  ],
  cta: { page: "play", label: "Test yourself", href: "play.html" },

  footer: {
    columns: [
      { title: "Play", links: [
        { label: "Start the challenges", href: "play.html" },
        { label: "Your results", href: "results.html" },
      ] },
      { title: "Learn", links: [
        { label: "The five skills", href: "learn.html#skills" },
        { label: "Training tips", href: "learn.html#tips" },
        { label: "Knowledge hub", href: "knowledge.html" },
      ] },
      { title: "Compare", links: [
        { label: "Training tools", href: "tools.html" },
        { label: "Comparison table", href: "tools.html#compare" },
      ] },
      { title: "About", links: [
        { label: "About Soccer IQ", href: "about.html" },
        { label: "FAQ", href: "faq.html" },
      ] },
    ],
    note: "Soccer IQ Points describe how you did in these games. They are not an IQ test or a validated assessment.",
  },

  // Review build only (tools/build.mjs): a banner on every page.
  reviewBanner: "Review version. Notes marked \"Review\" are hidden in the public build.",

  // Search settings used by the public build (tools/build.mjs --public).
  // The review demo is always noindex. Set `indexing: true` only when the site goes live on
  // its own domain; until then the public build also asks search engines not to index it.
  seo: {
    productionUrl: "https://socceriq.tech/",
    indexing: false,
  },
};
