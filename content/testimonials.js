// Testimonials published by IntelliGym about IntelliGym.
//
// They are NOT endorsements of Soccer IQ or of our challenges, and every card says so.
// Full texts live in the internal notes (notes/intelligym-content-inventory.md, outside the site).
//
// Fields:
//   id            unique, never reused
//   product       which product the person is talking about (always shown on the card)
//   name, role    exactly as printed on the source page
//   group         "coach" | "player" | "parent"
//   excerpt       the sentence shown on the site, verbatim from the source
//   source        { url, checked } the page the excerpt was copied from, and when
//   reuseApproved true once IntelliGym/Omri confirm we may reuse it. Until then the card shows
//                 only in the review build, marked "Awaiting reuse approval".
//   featured      true to show it on the home page as well
//   visible       false hides it everywhere
//   reviewNote    review build only

const TESTIMONIALS_PAGE = "https://soccer.intelligym.com/testimonials-en/";
const CHECKED = "2026-10-18";

export const TESTIMONIALS = [
  { id: "knaller", product: "IntelliGym", name: "Walter Knaller", role: "U15 coach, SK Rapid Vienna", group: "coach",
    excerpt: "In the past, I had to explain game intelligence in video meetings, now – they just play it!",
    source: { url: TESTIMONIALS_PAGE, checked: CHECKED }, reuseApproved: false, featured: true, visible: true },
  { id: "beuker", product: "IntelliGym", name: "Marijn Beuker", role: "Head of Performance & Development, AZ Alkmaar", group: "coach",
    excerpt: "We're always looking for an edge. IntelliGym embodies that.",
    source: { url: TESTIMONIALS_PAGE, checked: CHECKED }, reuseApproved: false, featured: true, visible: true },
  { id: "van-agt", product: "IntelliGym", name: "Luc van Agt", role: "Sport physiologist, PSV soccer and KNVB", group: "coach",
    excerpt: "Our experience with IntelliGym has been overwhelmingly positive.",
    source: { url: TESTIMONIALS_PAGE, checked: CHECKED }, reuseApproved: false, featured: true, visible: true },
  { id: "van-boven", product: "IntelliGym", name: "Hidde van Boven", role: "PSV Youth Academy Coach", group: "coach",
    excerpt: "Players like it because they train their brain in an unconscious, competitive and playful way.",
    source: { url: "https://soccer.intelligym.com/", checked: CHECKED }, reuseApproved: false, visible: true },
  { id: "preuss", product: "IntelliGym", name: "Dr. Fabian Preuß", role: "Founder, Fußball-Eltern Community, Germany", group: "coach",
    excerpt: "IntelliGym is a very good training module for improving game intelligence.",
    source: { url: TESTIMONIALS_PAGE, checked: CHECKED }, reuseApproved: false, visible: true },
  { id: "duffner", product: "IntelliGym", name: "Tobias Duffner", role: "Goalkeeper, Werder Bremen U23", group: "player",
    excerpt: "IntelliGym helped me see and exploit opportunities before they happened.",
    source: { url: TESTIMONIALS_PAGE, checked: CHECKED }, reuseApproved: false, visible: true },
  { id: "rb-psv", product: "IntelliGym", name: "R.B.", role: "Striker, youth team, PSV Eindhoven", group: "player",
    excerpt: "The IntelliGym is fun most of the time, although it is hard work.",
    source: { url: TESTIMONIALS_PAGE, checked: CHECKED }, reuseApproved: false, visible: true,
    reviewNote: "IntelliGym prints youth players with initials only." },
  { id: "ns-psv", product: "IntelliGym", name: "N.S.", role: "Goalkeeper, youth team, PSV Eindhoven", group: "player",
    excerpt: "The IntelliGym is fun, and I would do it even if it was not part of our academy training.",
    source: { url: TESTIMONIALS_PAGE, checked: CHECKED }, reuseApproved: false, visible: true,
    reviewNote: "IntelliGym prints youth players with initials only." },
  { id: "heldwein", product: "IntelliGym", name: "Kurt Heldwein", role: "MA, United States", group: "parent",
    excerpt: "He is more self-confident and comfortable making decisions during games.",
    source: { url: TESTIMONIALS_PAGE, checked: CHECKED }, reuseApproved: false, visible: true },
  { id: "chongo", product: "IntelliGym", name: "Charles Chongo", role: "San Francisco, CA", group: "parent",
    excerpt: "She just seems to know where players should be and it's improved her positioning too.",
    source: { url: TESTIMONIALS_PAGE, checked: CHECKED }, reuseApproved: false, visible: true },
  { id: "solomon", product: "IntelliGym", name: "Manor Solomon", role: "Professional soccer player", group: "player",
    excerpt: "Game intelligence is one of the most important skills for playing at the top level.",
    source: { url: TESTIMONIALS_PAGE, checked: CHECKED }, reuseApproved: false, visible: false,
    reviewNote: "Hidden: IntelliGym lists his club as Fulham on the testimonials page and Shakhtar Donetsk on the home page. Confirm the role before showing." },
];
