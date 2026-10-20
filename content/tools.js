// Training tools (tools.html profiles, the comparison table, and the tiles on the home page).
//
// Each tool is described only from its official pages (and the studies those pages cite).
// Every tool uses the same structure and the same visual treatment; none is featured.
// Every comparison cell is { text, source?, reviewNote? }. Write "Not published" rather than guess.
// Sources stay in this file for our records; the page does not print them.
//
// Fields on each tool:
//   id, name, company, website      identity; `website` is the official site
//   sortName                        optional: the name used for alphabetical order
//   summary                         two or three sentences for the profile
//   compare                         one cell per row in COMPARE_ROWS below
//   research                        studies the provider cites, listed in the Knowledge hub reading list
//   links                           official links shown on the profile
//   sources, checked                where the facts came from and when (internal; not shown on the page)
//   termsToConfirm                  optional: conflicting terms, shown in the review build only
//   status                          "verified" | "to-confirm" (to-confirm tools appear only in the review build)
//   visible                         false hides the tool everywhere
//   reviewNote                      review build only
//
// Coupons and special offers live in offers.js (one entry per offer, linked by the tool's id).

const C = "2026-10-18"; // date checked
const s = (label, url) => ({ label, url, checked: C });

import { INTELLIGYM } from "./intelligym.js";

// IntelliGym sources used in this file (full details live in intelligym.js).
const IG = {
  how: s("IntelliGym FAQ: How does it work?", "https://soccer.intelligym.com/faq-items/how-does-the-intelligym-work/"),
  session: s("IntelliGym FAQ: Session length", "https://soccer.intelligym.com/faq-items/how-long-is-each-training-session/"),
  mobile: s("IntelliGym FAQ: Mobile phones", "https://soccer.intelligym.com/faq-items/can-the-intelligym-run-on-mobile-phones/"),
  age: s("IntelliGym FAQ: Recommended age", "https://soccer.intelligym.com/faq-items/what-is-the-recommended-age-for-using-intelligym-2/"),
  home: s("IntelliGym home", "https://soccer.intelligym.com/"),
  app: s("IntelliGym plans page", "https://soccerapp.intelligym.com/"),
  guarantee: s("IntelliGym FAQ: Money back guarantee", "https://soccer.intelligym.com/faq-items/do-you-offer-a-money-back-guarantee/"),
  vu: s("IntelliGym: VU Amsterdam study article", "https://soccer.intelligym.com/elite-dutch-soccer-academies-improve-skill-development-with-the-soccer-intelligym/"),
  zenodo: s("Zenodo: VU Amsterdam pilot analysis", "https://zenodo.org/record/268696"),
};

const BYB = {
  home: s("Be Your Best homepage", "https://beyourbest.com/"),
  pricing: s("Be Your Best pricing", "https://beyourbest.com/pricing"),
  faq: s("Be Your Best FAQ", "https://beyourbest.com/faqs"),
  terms: s("Be Your Best Terms & Conditions", "https://beyourbest.com/terms"),
  players: s("Be Your Best: Players", "https://beyourbest.com/players"),
  teams: s("Be Your Best: Teams", "https://beyourbest.com/teams"),
  appStore: s("App Store: Be Your Best Pro", "https://apps.apple.com/app/be-your-best-pro/id6446244749"),
  sky: s("Sky Sports article cited by Be Your Best", "https://www.skysports.com/football/news/12023/12915519/virtual-reality-helps-germany-u17-team-win-european-championship-as-players-use-vr-goggles-to-improve-scanning"),
  jordet: s("Jordet, Bloomfield & Heijmerikx (2013), MIT Sloan conference paper", "https://sloansportsconference.com/research-papers/the-hidden-foundation-of-field-vision-in-english-premier-league-epl-soccer-players"),
};

const NT = {
  home: s("NeuroTracker homepage", "https://www.neurotrackerx.com/"),
  pricing: s("NeuroTracker pricing", "https://www.neurotrackerx.com/pricing"),
  soccer: s("NeuroTracker: Soccer", "https://www.neurotrackerx.com/use-cases/soccer"),
  study: s("NeuroTracker: soccer study summary", "https://www.neurotrackerx.com/science/neurotracker-study-on-transferability-to-soccer-performance"),
  download: s("NeuroTracker: Download and system requirements", "https://www.neurotrackerx.com/download"),
  terms: s("NeuroTracker Personal Terms of Service", "https://www.neurotrackerx.com/legal/personal-terms-of-service"),
  doi: s("Romeas, Guldner & Faubert (2016), Psychology of Sport and Exercise", "https://doi.org/10.1016/j.psychsport.2015.06.002"),
};

const RZ = {
  home: s("Rezzil homepage", "https://rezzil.com/"),
  performance: s("Rezzil: Performance", "https://rezzil.com/performance/"),
  gaming: s("Rezzil: Gaming", "https://rezzil.com/gaming/"),
  research: s("Rezzil: News & Research", "https://rezzil.com/news-and-research/"),
  terms: s("Rezzil Terms of Service", "https://rezzil.com/terms-of-service"),
  steam: s("Steam: Rezzil Player", "https://store.steampowered.com/app/2071800/Rezzil_Player/"),
  quest: s("Meta Quest store: Rezzil Player", "https://www.meta.com/experiences/rezzil-player-sports-training/3600836956645933/"),
};

const BP = {
  home: s("BlazePod homepage", "https://www.blazepod.com/"),
  soccer: s("BlazePod: Soccer", "https://www.blazepod.com/pages/soccer"),
  research: s("BlazePod Research Center", "https://www.blazepod.com/pages/research-center"),
  terms: s("BlazePod Terms of Use", "https://www.blazepod.com/pages/terms-of-use"),
  privacy: s("BlazePod Privacy Policy", "https://www.blazepod.com/pages/privacy-policy"),
  refund: s("BlazePod Refund Policy", "https://www.blazepod.com/pages/refund-policy"),
  warranty: s("BlazePod Warranty", "https://www.blazepod.com/pages/warranty"),
  membership: s("BlazePod Membership", "https://www.blazepod.com/pages/membership"),
  pods: s("BlazePod: Our Pods", "https://www.blazepod.com/pages/our-pods"),
  app: s("BlazePod: Our App", "https://www.blazepod.com/pages/our-app"),
  trainer: s("BlazePod Trainer Kit", "https://www.blazepod.com/products/trainer-kit"),
  mini: s("BlazePod Mini Kit", "https://www.blazepod.com/products/mini-kit"),
  team: s("BlazePod Ultimate Team Bundle", "https://www.blazepod.com/products/professional-bundle"),
  appStore: s("App Store: BlazePod", "https://apps.apple.com/us/app/blazepod/id1382204042"),
  oliveira: s("de-Oliveira et al. (2021), Journal of Sports Science & Medicine", "https://pmc.ncbi.nlm.nih.gov/articles/PMC7919356/"),
  hoffman: s("BlazePod summary of Hoffman (2020)", "https://www.blazepod.com/blogs/resources/evaluation-of-a-reactive-agility-assessment-device-in-youth-football-players"),
};

// Rows of the comparison table, in order. `key` matches the keys of each tool's `compare`.
export const COMPARE_ROWS = [
  { key: "format", label: "What it is" },
  { key: "soccer", label: "Soccer-specific?" },
  { key: "hardware", label: "What you need" },
  { key: "users", label: "Who it is for" },
  { key: "sessions", label: "Sessions" },
  { key: "evidence", label: "Evidence cited" },
  { key: "limits", label: "Limits of that evidence" },
  { key: "pricing", label: "Price" },
  { key: "trial", label: "Trial and refunds" },
  { key: "offers", label: "Published offers" },
];

export const COMPARE = {
  title: "Compare the tools",
  intro: "These tools are different kinds of products, so the table shows how they differ, not which is best. Prices are as shown on each official page and may differ by country; check the provider's site before buying.",
  checked: C, // internal
};

export const TOOLS = [
  {
    id: "intelligym",
    name: "The Soccer IntelliGym",
    sortName: "IntelliGym", // sorted under I
    company: "IntelliGym (ACE Applied Cognitive Engineering Ltd.)",
    website: "https://soccer.intelligym.com/",
    summary: "Computer and iPhone software with game-like exercises that IntelliGym designed to train the mental side of soccer, such as anticipation, attention and awareness. No headset or special equipment is needed.",
    compare: {
      format: { text: "Game-like cognitive training exercises on screen, in 30-minute sessions.", source: IG.how },
      soccer: { text: "Made for soccer players, training skills IntelliGym links to the game, such as anticipation and awareness. IntelliGym says it \"is not a video game\".", source: s("IntelliGym: Best practices", "https://soccer.intelligym.com/best-practices/") },
      hardware: { text: "Windows or Mac computer, or iPhone (iOS 12+). No Android version listed.", source: IG.mobile },
      users: { text: "Players about 10 to 25, families and teams; parents and coaches get progress reports.", source: IG.age },
      sessions: { text: "30 minutes (8 levels of about 4 minutes), 2 to 3 times a week.", source: IG.session },
      evidence: { text: "VU Amsterdam study with 52 academy players from PSV and AZ: IntelliGym reports a 27% larger on-field improvement than a control group after 10 weeks.", source: IG.vu },
      limits: { text: "Reported as a self-deposited pilot analysis, not a journal paper; we could not read the full report.", source: IG.zenodo },
      pricing: { text: "Individual from $21.90 a month, or $15.90 a month on the annual plan ($190.80). Family and team plans available.", source: IG.app },
      trial: { text: "Monthly plans cancel any time; seasonal plans have a 30-day money back guarantee. Other terms differ between IntelliGym's own pages.", source: IG.guarantee,
        reviewNote: "Annual guarantee (30 or 60 days), the free trial and monthly refunds conflict between official pages. See Terms to confirm on the IntelliGym page." },
      offers: { text: "Annual plan marked \"Save 27%\"; discounted family and team plans.", source: IG.app },
    },
    research: [
      { label: "VU Amsterdam pilot analysis of IntelliGym with PSV and AZ academy players (Zenodo)", url: "https://zenodo.org/record/268696" },
      { label: "Hart & Battiste (1992), Field test of video game trainer, NASA Ames (Space Fortress)", url: "https://www.usahockeyintelligym.com/wp-content/uploads/2018/11/Hart-and-Battiste-Space-Fortess-helicopter-training.pdf" },
    ],
    links: [
      { label: "IntelliGym website", url: "https://soccer.intelligym.com/" },
      { label: "Plans and prices", url: "https://soccerapp.intelligym.com/" },
    ],
    sources: [IG.home, IG.how, IG.app, IG.vu],
    termsToConfirm: INTELLIGYM.termsToConfirm,
    checked: C,
    status: "verified",
    visible: true,
  },
  {
    id: "be-your-best",
    name: "Be Your Best",
    company: "Be Your Best AS, Oslo, Norway",
    website: "https://beyourbest.com/",
    summary: "A virtual reality app for Meta Quest headsets that puts players into first-person soccer match scenarios to train scanning, awareness and decision-making. A free phone companion app shows stats, replays and leaderboards but does not train on its own.",
    compare: {
      format: { text: "VR app with 800+ match scenarios: challenges, practice, an 11-a-side match mode and a career mode, with scanning metrics and replays.", source: BYB.pricing },
      soccer: { text: "Fully soccer-specific: first-person match situations.", source: BYB.players },
      hardware: { text: "Meta Quest 2, 3, 3S or Pro headset. Companion app on iOS and Android.", source: BYB.faq },
      users: { text: "Individual players from youth to pro, parents and clubs. Terms require users to be over 13.", source: BYB.terms },
      sessions: { text: "No recommended session length published; described as \"short, focused sessions\".", source: BYB.players },
      evidence: { text: "Cites a 28% average increase in scan rate after 9 weeks with a German youth national team, linking to a Sky Sports article. Also cites a 2013 study linking scanning to pass completion.", source: BYB.sky },
      limits: { text: "The 28% figure comes from an informal federation evaluation reported in the press; a DFB official calls it \"a very simple study\". The 2013 study is correlational and did not test any VR training.", source: BYB.jordet },
      pricing: { text: "Personal plan (3 profiles): US$29 a month, or US$19 a month billed annually (US$228 a year). Club pricing on request.", source: BYB.pricing },
      trial: { text: "No free trial. 14-day money back guarantee on the first subscription only; no refund after renewal.", source: BYB.terms },
      offers: { text: "Annual billing marked \"Save 35%\".", source: BYB.pricing },
    },
    research: [
      { label: "Sky Sports (2023): German U17 team's VR scanning training, the source of the 28% figure", url: "https://www.skysports.com/football/news/12023/12915519/virtual-reality-helps-germany-u17-team-win-european-championship-as-players-use-vr-goggles-to-improve-scanning" },
      { label: "Jordet, Bloomfield & Heijmerikx (2013), The hidden foundation of field vision in English Premier League players, MIT Sloan Sports Analytics Conference", url: "https://sloansportsconference.com/research-papers/the-hidden-foundation-of-field-vision-in-english-premier-league-epl-soccer-players" },
    ],
    links: [
      { label: "Be Your Best website", url: "https://beyourbest.com/" },
      { label: "Pricing", url: "https://beyourbest.com/pricing" },
    ],
    sources: [BYB.home, BYB.pricing, BYB.faq, BYB.terms, BYB.players, BYB.teams, BYB.appStore, BYB.sky, BYB.jordet],
    checked: C,
    status: "verified",
    visible: true,
    reviewNote: "A Meta Quest 3S giveaway ran 11 June to 18 July 2026 and has expired, so it is not listed.",
  },
  {
    id: "neurotracker",
    name: "NeuroTracker",
    company: "NeuroTracker (App Store seller: CogniSens Athletics Inc., Canada)",
    website: "https://www.neurotrackerx.com/",
    summary: "A screen-based trainer built on 3D multiple-object tracking: you follow several moving balls among distractors in 3D, and the speed adapts to you. It is used across many sports and is not specific to soccer.",
    compare: {
      format: { text: "3D multiple-object tracking task; difficulty and speed adapt to the user.", source: NT.home },
      soccer: { text: "No. The same generic task is used across sports and health; there is a soccer marketing page but no soccer content in the task.", source: NT.soccer },
      hardware: { text: "Windows or Mac computer, web browser or tablet, with 3D glasses (one pair included with consumer plans).", source: NT.download },
      users: { text: "Individuals, athletes, teams and organizations.", source: NT.pricing },
      sessions: { text: "Homepage: 6 minutes a day. Its soccer page also says 15 to 20 minutes, 3 to 4 times a week.", source: NT.soccer },
      evidence: { text: "Romeas, Guldner & Faubert (2016), peer-reviewed: 23 university players; the trained group improved passing decisions in small-sided games more than the control groups.", source: NT.doi },
      limits: { text: "Small study (7 to 9 players per group) from the lab where the method originated. Dribbling and shooting did not improve. Homepage percentages are not linked to specific studies.", source: NT.study },
      pricing: { text: "$30 a month, $20 a month billed annually, or $700 once. Currency and region not stated. Business plans on request.", source: NT.pricing },
      trial: { text: "30-day money back guarantee on consumer plans (first purchase, excluding shipping). A free trial is advertised but its length and terms are not published.", source: NT.terms },
      offers: { text: "\"Refer four, pay no more\" and 20% off additional family subscriptions; eligibility and expiry not shown.", source: NT.pricing },
    },
    research: [
      { label: "Romeas, Guldner & Faubert (2016), 3D-Multiple Object Tracking training task improves passing decision-making accuracy in soccer players, Psychology of Sport and Exercise 22", url: "https://doi.org/10.1016/j.psychsport.2015.06.002" },
    ],
    links: [
      { label: "NeuroTracker website", url: "https://www.neurotrackerx.com/" },
      { label: "Pricing", url: "https://www.neurotrackerx.com/pricing" },
    ],
    sources: [NT.home, NT.pricing, NT.soccer, NT.study, NT.download, NT.terms, NT.doi],
    checked: C,
    status: "verified",
    visible: true,
  },
  {
    id: "rezzil",
    name: "Rezzil",
    company: "Mi Hiepa Scout Ltd (trading as Rezzil), Manchester, UK",
    website: "https://rezzil.com/",
    summary: "A Manchester VR company with two different offers: Rezzil Index, a platform for clubs and practitioners covering cognitive testing, training and rehab, and Rezzil Player, a consumer VR sports-drills game for PC VR and Meta Quest.",
    compare: {
      format: { text: "Rezzil Index: VR platform for clubs (testing, training, rehab, data). Rezzil Player: consumer VR game with 160+ drill levels.", source: RZ.performance },
      soccer: { text: "Mostly soccer for clubs, but described as multi-sport. Rezzil Player includes heading and goalkeeping drills alongside other sports.", source: RZ.gaming },
      hardware: { text: "VR headset. Rezzil Player: PC VR (SteamVR) or Meta Quest. Index hardware not published.", source: RZ.steam },
      users: { text: "Index: clubs, leagues and practitioners. Player: consumers. Rezzil's Terms say users must be over 18.", source: RZ.terms },
      sessions: { text: "Not published." },
      evidence: { text: "Lists research areas and partners, with case studies and testimonials from clubs.", source: RZ.research },
      limits: { text: "No study titles, journals or results are published on its official pages, so the claims cannot be checked.", source: RZ.research },
      pricing: { text: "Index: on request. Rezzil Player on Steam: $4.99 plus optional packs ($2.99 to $3.99). Meta Quest price could not be read.", source: RZ.steam },
      trial: { text: "No trial mentioned. Refunds for the game go through the app store's own policy.", source: RZ.terms },
      offers: { text: "None published." },
    },
    research: [],
    links: [
      { label: "Rezzil website", url: "https://rezzil.com/" },
      { label: "Rezzil Player on Steam", url: "https://store.steampowered.com/app/2071800/Rezzil_Player/" },
      { label: "Rezzil Player on Meta Quest", url: "https://www.meta.com/experiences/rezzil-player-sports-training/3600836956645933/" },
    ],
    sources: [RZ.home, RZ.performance, RZ.gaming, RZ.research, RZ.terms, RZ.steam, RZ.quest],
    checked: C,
    status: "verified",
    visible: true,
    reviewNote: "The Meta Quest store price and whether a PlayStation VR2 version is on sale could not be confirmed from readable official pages.",
  },
  {
    id: "blazepod",
    name: "BlazePod",
    company: "Play Coyotta Ltd., Tel Aviv, Israel (US company: BlazePod Inc., Florida)",
    website: "https://www.blazepod.com/",
    summary: "Wireless light-up pods that players tap or touch, run from a phone or tablet app with ready-made and custom reaction drills. It is used on the field, in the gym and in rehab across many sports; its soccer page promotes first-step speed, scanning and decision-making.",
    compare: {
      format: { text: "Physical reaction drills: pods light up and the player moves to tap them off; the app runs drills and records reaction times.", source: BP.pods },
      soccer: { text: "No. A multi-sport and rehab product with a soccer page; the drills themselves are general reaction and movement drills.", source: BP.soccer },
      hardware: { text: "BlazePod pods (kits of 3 to 12, with a charging base) and the free iOS or Android app. Space to move around the pods.", source: BP.trainer },
      users: { text: "Athletes, coaches, teams, gyms and physical therapists. The Terms say the services are not for anyone under 16.", source: BP.terms },
      sessions: { text: "No recommended session length published." },
      evidence: { text: "A research page with about 30 references. Studies that used BlazePod itself mainly test it as a measuring tool, for example a test-retest study with 24 young adults.", source: BP.research },
      limits: { text: "The cited BlazePod studies check that it measures reaction time reliably; none shows that training with it improves soccer performance. Homepage percentages are company statistics.", source: BP.oliveira },
      pricing: { text: "Kits from US$219 (3 pods) to US$1,352 (12-pod team bundle) at regular prices. App: free Go tier; Pro US$12.99 a month or US$99.99 a year at regular prices.", source: BP.home,
        reviewNote: "On 2026-10-20 a 20% \"Fall Sale\" was running with no end date (kits from $175.20; Pro $10.39 a month or $79.99 a year, marked \"Website exclusive offer\"). Regular prices are shown here because the sale has no stated end." },
      trial: { text: "30-day money back guarantee on hardware (US returns need a return number within 14 days; shipping not refunded). App: full refund within 14 days of the first subscription; trial length not published.", source: BP.refund },
      offers: { text: "Sitewide sales from time to time (up to 20% off on 2026-10-20, no end date shown).", source: BP.home },
    },
    research: [
      { label: "de-Oliveira et al. (2021), Test-retest reliability of a visual-cognitive technology (BlazePod) to measure response time, Journal of Sports Science & Medicine 20(1)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7919356/" },
      { label: "Hoffman (2020), Evaluation of a reactive agility assessment device in youth football players, Journal of Strength & Conditioning Research 34(12)", url: "https://journals.lww.com/nsca-jscr/fulltext/2020/12000/evaluation_of_a_reactive_agility_assessment_device.2.aspx" },
    ],
    links: [
      { label: "BlazePod website", url: "https://www.blazepod.com/" },
      { label: "Soccer page", url: "https://www.blazepod.com/pages/soccer" },
    ],
    sources: Object.values(BP),
    checked: "2026-10-20",
    status: "verified",
    visible: true,
    reviewNote: "Company: the Terms of Use name Play Coyotta Ltd. (Israel); the Privacy, Refund and Warranty pages name BlazePod Inc. (Weston, Florida). The young-athletes page markets to parents although the Terms set a 16+ age limit. Hoffman (2020) does not say whether \"football\" means soccer or American football, and its full text could not be read.",
  },

];

// The order tools are shown in: alphabetical, so no provider is placed first by choice.
const key = (t) => t.sortName || t.name;
export const toolsInOrder = (list) => [...list].sort((a, b) => key(a).localeCompare(key(b)));

// Tools from the Base44 reference that we could not find under those names. Review build only.
export const TOOLS_REVIEW_NOTES = [
  "\"CogniSport Decision Trainer\" and \"Game Analysis Software Pro\" from the Base44 template were not found as real products, so they are not listed.",
  "None of these companies publishes a press kit, so the profiles use text only, with no product photos or logos.",
  "Confirm with Omri that Soccer IQ has no commercial relationship with the other providers before public release. Future provider coupons go in content/offers.js.",
];
