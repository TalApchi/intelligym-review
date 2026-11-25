// About page (about.html). The company line
// "IntelliGym Labs, New Jersey U.S" moved to IntelliGym's profile in tools.js (2026-10-20).

export const ABOUT = {
  title: "Soccer IQ",
  intro: "Soccer IQ is a website about soccer game intelligence: the ability to read the game, see what is about to happen and choose well under pressure.",
  sections: [
    { title: "What you'll find here", body: "Five short challenges you can play in your browser, plain explanations of the skills behind reading the game, practical tips, a knowledge hub, and a comparison of soccer training tools." },
    { title: "What our scores mean", body: "Soccer IQ Points describe how you did in our five games. They are not an IQ test, a validated assessment or a measure of how good a player you are. Some tactical situations are still being reviewed by a coach and are marked provisional." },
    { title: "How we compare training tools", body: "Each tool is described from its own official pages, in the same format. The tools are different kinds of products, so the comparison shows how they differ rather than ranking them." },
    { title: "Your privacy", body: "There are no accounts. Your latest challenge result is stored only in your own browser so the Your results page can show it; clearing your browser data removes it." },
  ],
  // General coupon wording (Omri, 2026-10-22, updated 2026-11-24): names no provider and makes
  // no ownership statement. Shown while any provider offer in offers.js is live (always in the
  // review build). The coupon and deal tickets themselves are in offers.js.
  coupons: {
    title: "Coupons and offers",
    body: [
      "Where a provider has a discount code or an offer link, you'll find it alongside that tool on the Training tools page.",
      "Where no code is listed, the \"Visit Official Site\" link takes you to the provider's own website to see its current rates and any deals. It does not guarantee a discount.",
      "Purchases, payment, product use, support and refunds are handled directly by the provider you choose, under its own terms. Soccer IQ does not process payments or supply the products you buy.",
    ],
  },

  // The contact form is prepared but switched off: see `contact` in site.js and
  // docs/content-editing.md. Nothing is shown while it is off.
  contact: {
    title: "Contact",
    intro: "Questions or corrections? Send us a message.",
  },
  credits: "Typeface: Manrope (SIL Open Font License).",
};
