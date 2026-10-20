// IntelliGym: detailed record of IntelliGym's published product facts, plans, terms and research.
//
// Since Omri's 2026-10-20 feedback IntelliGym appears on the site like every other provider:
// its profile and comparison cells live in tools.js. This file is the internal record behind
// those cells. The only part shown is "Terms to confirm", inside IntelliGym's profile, in the
// review build only. The coupon button lives in offers.js.
//
// Status values:
//   "verified"    shown on the official page as quoted, on the date checked
//   "to-confirm"  official pages disagree or the detail is incomplete
// `reviewNote` is for Omri and Tal.

const C = "2026-10-18"; // date checked
const SRC = {
  home: { label: "IntelliGym home (US)", url: "https://soccer.intelligym.com/", checked: C },
  product: { label: "IntelliGym: The product", url: "https://soccer.intelligym.com/product/", checked: C },
  app: { label: "soccerapp.intelligym.com", url: "https://soccerapp.intelligym.com/", checked: C },
  appStore: { label: "App Store: The Soccer IntelliGym", url: "https://apps.apple.com/app/id6538727452", checked: C },
  install: { label: "IntelliGym: Install", url: "https://soccer.intelligym.com/install/", checked: C },
  faqHow: { label: "IntelliGym FAQ: How does the IntelliGym work?", url: "https://soccer.intelligym.com/faq-items/how-does-the-intelligym-work/", checked: C },
  faqSession: { label: "IntelliGym FAQ: How long is each training session?", url: "https://soccer.intelligym.com/faq-items/how-long-is-each-training-session/", checked: C },
  faqAge: { label: "IntelliGym FAQ: Recommended age", url: "https://soccer.intelligym.com/faq-items/what-is-the-recommended-age-for-using-intelligym-2/", checked: C },
  faqMobile: { label: "IntelliGym FAQ: Can it run on mobile phones?", url: "https://soccer.intelligym.com/faq-items/can-the-intelligym-run-on-mobile-phones/", checked: C },
  faqReports: { label: "IntelliGym FAQ: Progress reports", url: "https://soccer.intelligym.com/faq-items/how-can-an-athlete-parent-coach-access-progress-reports-and-training-history/", checked: C },
  faqGuarantee: { label: "IntelliGym FAQ (US): Money back guarantee", url: "https://soccer.intelligym.com/faq-items/do-you-offer-a-money-back-guarantee/", checked: C },
  faqGuaranteeUK: { label: "IntelliGym FAQ (UK): Money back guarantee", url: "https://soccer.intelligym.com/faq-items/do-you-have-a-money-back-guarantee/", checked: C },
  faqTrial: { label: "IntelliGym FAQ (US): Free trial", url: "https://soccer.intelligym.com/faq-items/do-you-offer-a-free-trial/", checked: C },
  faqDiscounts: { label: "IntelliGym FAQ: Discounts", url: "https://soccer.intelligym.com/faq-items/do-you-offer-any-discounts/", checked: C },
  faqGroup: { label: "IntelliGym FAQ: Group rate", url: "https://soccer.intelligym.com/faq-items/is-there-a-group-rate/", checked: C },
  homeUK: { label: "IntelliGym home (UK)", url: "https://soccer.intelligym.com/home-uk/", checked: C },
  homeDE: { label: "IntelliGym home (DE)", url: "https://soccer.intelligym.com/home-de/", checked: C },
  pricing: { label: "IntelliGym pricing (main store)", url: "https://soccer.intelligym.com/pricing-en/", checked: C },
  clubs: { label: "IntelliGym: Club-wide training", url: "https://soccer.intelligym.com/club-wide-training/", checked: C },
  terms: { label: "IntelliGym: Terms & Conditions", url: "https://soccer.intelligym.com/terms-conditions/", checked: C },
  vu: { label: "IntelliGym: VU Amsterdam study article", url: "https://soccer.intelligym.com/elite-dutch-soccer-academies-improve-skill-development-with-the-soccer-intelligym/", checked: C },
  zenodo: { label: "Zenodo record of the VU Amsterdam pilot analysis", url: "https://zenodo.org/record/268696", checked: C },
  origins: { label: "IntelliGym: Origins of the technology", url: "https://soccer.intelligym.com/origins-of-intelligym-cognitive-training-technology/", checked: C },
  nasa: { label: "Hart & Battiste (1992), NASA Ames field test", url: "https://www.usahockeyintelligym.com/wp-content/uploads/2018/11/Hart-and-Battiste-Space-Fortess-helicopter-training.pdf", checked: C },
};

export const INTELLIGYM = {
  name: "The Soccer IntelliGym",
  company: "IntelliGym (ACE Applied Cognitive Engineering Ltd.)",
  website: "https://soccer.intelligym.com/",
  tagline: "Cognitive training software for soccer players, from IntelliGym.",
  summary: "A computer and iPhone training program of game-like exercises designed to train the mental side of soccer, such as anticipation, attention and awareness. It is used by individual players, families and clubs.",

  // Short facts for the profile (each with its source).
  facts: [
    { label: "What it trains (IntelliGym's description)", value: "Anticipation, divided and peripheral attention, working memory, task switching, situational and spatial awareness, pattern recognition.", source: SRC.faqHow },
    { label: "Session", value: "30-minute sessions made up of 8 levels of about 4 minutes each.", source: SRC.faqSession },
    { label: "How often", value: "2 to 3 sessions a week, with at least 24 hours of rest in between.", source: SRC.faqHow },
    { label: "Ages", value: "IntelliGym gives 10 to 25 as the general age range, starting from about 10.", source: SRC.faqAge },
    { label: "Who it is for", value: "Individual athletes, families (2 to 4 athletes) and teams (5 or more).", source: SRC.home },
    { label: "Devices", value: "Windows or Mac computer, or iPhone (iOS 12 or later). Desktop and mobile are separate programs; no Android version is listed.", source: SRC.faqMobile },
    { label: "Computer setup", value: "IntelliGym recommends a larger screen and a mouse rather than a trackpad.", source: SRC.install },
    { label: "For parents and coaches", value: "Progress reports, training history and a leaderboard in the Members Area; parents and coaches get their own access.", source: SRC.faqReports },
  ],

  // Plans as shown on soccerapp.intelligym.com (the most current price list found).
  // Prices in USD as printed ("$", no currency code). `total` is our arithmetic, labelled as such.
  plans: {
    source: SRC.app,
    region: "Not stated on the page (prices in $)",
    currency: "USD",
    note: "Prices as shown on IntelliGym's plans page on the date checked. Check the official page before buying.",
    groups: [
      { id: "individual", title: "Individual (1 license)", rows: [
        { id: "ind-monthly", plan: "Monthly", price: "$21.90 / month", billing: "Monthly subscription", label: "", status: "verified", visible: true },
        { id: "ind-seasonal", plan: "Seasonal", price: "$17.95 / month", billing: "6 months prepaid", total: "$107.70 for 6 months", label: "Marked \"Most Recommended\"", status: "verified", visible: true },
        { id: "ind-annual", plan: "Annual", price: "$15.90 / month", billing: "12 months prepaid", total: "$190.80 for 12 months", label: "Marked \"Save 27%\" against monthly", status: "verified", visible: true },
      ] },
      { id: "family", title: "Family (2 to 4 licenses)", rows: [
        { id: "fam-monthly", plan: "Monthly", price: "$17.90 / month", billing: "Monthly", status: "verified", visible: true },
        { id: "fam-seasonal", plan: "Seasonal", price: "$14.95 / month", billing: "6 months prepaid", status: "verified", visible: true },
        { id: "fam-annual", plan: "Annual", price: "$12.90 / month", billing: "12 months prepaid", label: "Marked \"Get Best Value\"", status: "verified", visible: true },
      ], reviewNote: "The page does not say whether family prices are per member or for the whole family. Confirm before publishing." },
      { id: "teams", title: "Teams and clubs", rows: [
        { id: "teams", plan: "Team / club", price: "Custom pricing", billing: "Contact IntelliGym", status: "verified", visible: true },
      ] },
    ],
  },

  // Where to buy. Links go to IntelliGym's own pages; Soccer IQ does not sell anything.
  purchaseLinks: [
    { id: "plans", label: "See plans on IntelliGym", url: "https://soccerapp.intelligym.com/", primary: true, visible: true },
    { id: "store", label: "IntelliGym main store", url: "https://soccer.intelligym.com/pricing-en/", visible: true,
      reviewNote: "This store loads its prices by script, so we could not read them. Confirm which store Soccer IQ should link to." },
    { id: "ios", label: "iPhone app (App Store)", url: "https://apps.apple.com/app/id6538727452", visible: true },
    { id: "clubs", label: "Teams and clubs", url: "https://soccer.intelligym.com/club-wide-training/", visible: true },
  ],

  // Offers. Only published, sourced offers are shown as offers.
  offers: [
    { id: "annual-saving", title: "Annual plan saving", text: "IntelliGym's plans page labels the individual annual plan \"Save 27%\" compared with paying monthly ($15.90 against $21.90 a month).",
      status: "verified", appliesTo: "Individual annual plan", region: "Not stated", expires: "No expiry stated", eligibility: "Not stated", source: SRC.app, visible: true },
    { id: "group-pricing", title: "Family and team pricing", text: "IntelliGym says it offers discounted pricing through its family and team plans, and custom pricing for clubs.",
      status: "verified", appliesTo: "Family and team plans", region: "Not stated", expires: "No expiry stated", eligibility: "Families of 2 to 4; teams of 5 or more", source: SRC.faqGroup, visible: true },
  ],

  // Published terms that official pages agree on.
  terms: [
    { id: "cancel-monthly", text: "Monthly plans can be cancelled at any time.", source: SRC.faqGuarantee, status: "verified", visible: true },
    { id: "seasonal-guarantee", text: "Seasonal plans come with a 30-day money back guarantee.", source: SRC.faqGuarantee, status: "verified", visible: true },
  ],

  // Where official pages disagree. Review build only, in an expandable "Terms to confirm" box.
  // Each version keeps its own source. Nothing here is shown publicly until resolved.
  termsToConfirm: [
    { id: "annual-guarantee", topic: "Money back guarantee on annual plans", versions: [
      { text: "30 days", source: SRC.faqGuarantee, note: "US FAQ; also the US home page and the plans page" },
      { text: "60 days", source: SRC.faqGuaranteeUK, note: "UK FAQ (edited the same day as the US one); also the UK and DE home pages" },
    ] },
    { id: "free-trial", topic: "Free trial", versions: [
      { text: "\"We do not offer free trials\"", source: SRC.faqTrial, note: "US FAQ" },
      { text: "\"Get 7 days free trial\" buttons on every plan", source: SRC.app, note: "Plans page" },
    ] },
    { id: "monthly-refund", topic: "Refund on monthly plans", versions: [
      { text: "Can be cancelled any time (no refund mentioned)", source: SRC.faqGuarantee, note: "US FAQ" },
      { text: "\"7-day money back guarantee\"", source: SRC.app, note: "Plans page, monthly cards" },
    ] },
    { id: "prices", topic: "Prices", versions: [
      { text: "Individual $21.90 / month; annual $15.90 / month ($190.80); seasonal $17.95 / month ($107.70)", source: SRC.app, note: "Plans page (modified June 2026)" },
      { text: "Monthly $21.90; seasonal $99.90; annual $190.99", source: SRC.appStore, note: "App Store in-app purchases, US store" },
      { text: "$9.95 / month; annual $119.40", source: SRC.homeUK, note: "UK home page (2023), priced in $" },
      { text: "€9.95 / month; annual €119.40", source: SRC.homeDE, note: "German home page" },
    ] },
    { id: "renewal", topic: "Automatic renewal and how to cancel", versions: [
      { text: "Not stated on any page we could read. Checkout pages could not be inspected.", source: SRC.terms, note: "Terms & Conditions (2017) have no subscription clauses" },
    ] },
    { id: "age-terms", topic: "Minimum age in the legal terms", versions: [
      { text: "Product for ages 10 and up", source: SRC.faqAge, note: "FAQ" },
      { text: "Terms say users must be over 18", source: SRC.terms, note: "Terms & Conditions" },
    ] },
  ],

  // What IntelliGym's cited research shows, described accurately. Used on knowledge.html.
  research: [
    { id: "vu", title: "VU Amsterdam academy study",
      what: "IntelliGym reports a 10-week randomised comparison with 52 academy players aged 14 to 17 from PSV Eindhoven and AZ Alkmaar. One group trained with IntelliGym twice a week; the control group watched match clips. Blinded raters scored small-sided games before and after.",
      result: "IntelliGym reports that the trained group's on-field improvement was 27% higher than the control group's.",
      limits: "The report is a self-deposited \"pilot analysis\" on Zenodo, not a journal paper, and we could not read the full PDF. IntelliGym's pages round the result to about 30%.",
      sources: [SRC.vu, SRC.zenodo] },
    { id: "space-fortress", title: "Origins: the Space Fortress research",
      what: "IntelliGym's origins page traces its approach to Space Fortress, a training game it says was developed by DARPA and later studied with flight trainees in the 1990s.",
      result: "In the NASA Ames field test of helicopter trainees, the Space Fortress group's flight ratings were slightly higher than the other groups'.",
      limits: "The paper reports that the group differences were not statistically significant and calls the results not conclusive. The studies involved aviation trainees, not soccer players. IntelliGym's \"approved by NASA and DARPA\" wording is not supported by these sources.",
      sources: [SRC.origins, SRC.nasa] },
  ],

  reviewNotes: [
    "IntelliGym also claims injury reduction \"by tens of percent\"; the only data behind it is from ice hockey, so it is not used here.",
    "Results timing differs between pages (\"about 5 weeks\" in the FAQ, \"starting in 6 weeks\" on the home page), so no timing claim is shown.",
  ],
};
