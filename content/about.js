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
  // General coupon wording (Omri, 2026-10-22): names no provider. Shown while any provider
  // offer is live (and always in the review build). The coupon buttons themselves are in offers.js.
  coupons: {
    title: "Coupons",
    body: "Some providers offer discount coupons, which you're welcome to use. Purchases are made directly with the provider you choose, and payment, product use, support, refunds and any other purchase matters are handled by that provider under its own terms. Soccer IQ does not process payments or provide the products you buy.",
  },

  // The contact form is prepared but switched off: see `contact` in site.js and
  // docs/content-editing.md. Nothing is shown while it is off.
  contact: {
    title: "Contact",
    intro: "Questions or corrections? Send us a message.",
  },
  credits: "Typeface: Manrope (SIL Open Font License).",
};
