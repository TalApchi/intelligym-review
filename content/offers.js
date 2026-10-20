// Provider offers and coupons: the big coupon button on a tool's profile (tools.html) and the
// matching question on the FAQ and About pages.
//
// One entry per offer. Only IntelliGym has one for now; add other providers' offers here in the
// same shape when real details are supplied. Never enter a code, discount, expiry or eligibility
// rule that the provider has not confirmed.
//
// Fields:
//   id            unique, never reused
//   provider      the tool's `id` in tools.js; the button appears on that tool's profile
//   button        the button label, exactly as shown
//   url           the provider's redemption page. EMPTY = the button is shown disabled in the
//                 review build and left out of the public build. Fill it in to activate the offer.
//   code, discount, expires, eligibility, region
//                 optional details, shown under the button only when filled in
//   faq           { q, a }: the FAQ question and answer
//   about         one sentence for the About page's Coupons section
//                 (faq and about are shown only when the offer is live, or in the review build)
//   source        { url, checked }: where the offer details were confirmed (internal)
//   visible       false hides the offer everywhere
//   note          internal only, never shown (the button itself shows no "pending" message)

export const OFFERS = [
  {
    id: "intelligym-coupon",
    provider: "intelligym",
    button: "Get a special IntelliGym coupon",
    buttonShort: "Get the coupon", // the compact button in the comparison table
    url: "",
    code: "",
    discount: "",
    expires: "",
    eligibility: "",
    region: "",
    faq: {
      q: "Is there a special IntelliGym coupon?",
      a: "Yes. Use the \"Get a special IntelliGym coupon\" button in IntelliGym's profile on the <a href=\"tools.html#intelligym\">Training tools</a> page. The coupon is redeemed on IntelliGym's own site, under IntelliGym's terms.",
    },
    about: "Soccer IQ visitors can get a special IntelliGym coupon from the button in IntelliGym's profile on the <a href=\"tools.html#intelligym\">Training tools</a> page. It is redeemed on IntelliGym's own site, under IntelliGym's terms.",
    source: null,
    visible: true,
    note: "Button is disabled until the redemption URL is added in content/offers.js (url). No code, discount or expiry has been supplied.",
  },
];

// An offer is live when it is visible and has a redemption URL.
export const offerIsLive = (o) => o.visible !== false && Boolean(o.url);
