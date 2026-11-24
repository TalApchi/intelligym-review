// Provider offers: one entry per provider, in one place. tools.html reads this file for the offer
// in each provider's profile and in its "Published offers" cell of the comparison table; the FAQ
// adds a question for each live entry that has `faq`; the About page shows its general Coupons
// wording while any entry is live. Templates never hold offer details, so a provider's real code
// and terms can be added here later without touching any page code.
//
// Two kinds:
//   "coupon"  a confirmed code. Drawn as the yellow ticket: headline, the code (selectable),
//             a Copy code button and a link to the provider's destination.
//   "link"    no code yet: a "Check offers" link to the provider's official homepage. It is a link
//             to the provider's site, not a promise of a discount, and the page says nothing more.
//
// Fields:
//   id            unique, never reused
//   provider      the tool's `id` in tools.js
//   kind          "coupon" | "link"
//   status        "confirmed"  details supplied and approved by the site owner (Omri) -> shown in
//                              the review AND public builds
//                 "link-only"  no code; the "Check offers" link is shown in both builds
//                 "pending"    not shown anywhere (no disabled buttons, no "pending" wording)
//   url           where the button goes: the provider's own page. Never invent a URL that claims
//                 to apply a code automatically.
//   label         the link's text ("Use at IntelliGym", "Check offers")
//   headline      coupon only: the ticket's headline, e.g. "20% OFF IntelliGym"
//   code, discount  coupon only: exactly as supplied by the provider/owner
//   terms         coupon only, optional: { expires, plans, region, stacking, exclusive } shown under
//                 the ticket ONLY when filled in with confirmed wording. Leave empty rather than guess.
//   faq           optional { q, a }: added to the FAQ while the offer is live
//   approved      internal: who approved the details and when
//   openQuestions internal: terms not yet supplied (also listed in docs/outstanding-items.md)
//   visible       false hides the entry everywhere
//
// Never enter a code, discount, expiry, eligible plan, region, stacking rule or "exclusive" claim
// that the provider or the site owner has not confirmed.

export const OFFERS = [
  {
    id: "intelligym-coupon",
    provider: "intelligym",
    kind: "coupon",
    status: "confirmed",
    headline: "20% OFF IntelliGym",
    discount: "20%",
    code: "SOCCERIQ20",
    url: "https://soccerapp.intelligym.com/",
    label: "Use at IntelliGym",
    terms: { expires: "", plans: "", region: "", stacking: "", exclusive: "" },
    faq: {
      q: "Is there an IntelliGym coupon?",
      a: "Yes: 20% off IntelliGym with the code SOCCERIQ20. You'll find it, with a Copy code button and a link to IntelliGym, in IntelliGym's profile and in the comparison table on the <a href=\"tools.html#intelligym\">Training tools</a> page. The code is not applied automatically; use it on IntelliGym's site, where IntelliGym's own terms apply.",
    },
    approved: { by: "Omri (site owner), supplied via Tal", date: "2026-11-24" },
    openQuestions: [
      "Expiry date, if any",
      "Which plans it applies to (monthly, seasonal, annual, family, team)",
      "Regions or currencies where it works",
      "Whether it combines with other IntelliGym discounts (e.g. the annual \"Save 27%\")",
      "Where on soccerapp.intelligym.com the code is entered (we have not seen the checkout)",
    ],
    visible: true,
  },

  // "Check offers" links (Omri, 2026-11-24: he is arranging coupons with these companies; until
  // a code is confirmed each button goes to the provider's official homepage, the same verified
  // `website` as in tools.js; a test checks they match).
  { id: "be-your-best-offers", provider: "be-your-best", kind: "link", status: "link-only", label: "Check offers", url: "https://beyourbest.com/", visible: true },
  { id: "blazepod-offers", provider: "blazepod", kind: "link", status: "link-only", label: "Check offers", url: "https://www.blazepod.com/", visible: true },
  { id: "neurotracker-offers", provider: "neurotracker", kind: "link", status: "link-only", label: "Check offers", url: "https://www.neurotrackerx.com/", visible: true },
  { id: "playermaker-offers", provider: "playermaker", kind: "link", status: "link-only", label: "Check offers", url: "https://www.playermaker.com/", visible: true },
  { id: "rezzil-offers", provider: "rezzil", kind: "link", status: "link-only", label: "Check offers", url: "https://rezzil.com/", visible: true },
];

// Live = shown in both builds. A coupon needs its code, discount and destination and must be
// confirmed; a link needs its destination. Anything else is not shown at all.
export function offerIsLive(o) {
  if (!o || o.visible === false || !o.url) return false;
  if (o.kind === "coupon") return o.status === "confirmed" && Boolean(o.code && o.discount && o.headline);
  if (o.kind === "link") return o.status === "link-only" || o.status === "confirmed";
  return false;
}

export const liveOffersFor = (providerId) => OFFERS.filter((o) => o.provider === providerId && offerIsLive(o));
