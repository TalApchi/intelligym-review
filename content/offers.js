// Provider offers: one entry per provider, in one place. tools.html reads this file for the offer
// in each provider's profile and in its "Published offers" cell of the comparison table; the FAQ
// adds a question for each live entry that has `faq`; the About page shows its general Coupons
// wording while any entry is live. Templates never hold offer details, so a provider's real code
// and terms can be added here later without touching any page code.
//
// Two kinds, both drawn as the same yellow ticket (notched edges, dashed stub):
//   "coupon"  a confirmed code: headline, the code (selectable), a Copy code button and a link to
//             the provider's destination.
//   "deal"    no code: headline "CHECK FOR DEALS", the line "Code: None required (Standard rates
//             apply)" and ONE link, "Visit Official Site ↗", to the provider's official homepage.
//             No code, percentage or Copy code button. (Omri, 2026-11-25; replaces the teal
//             "Check offers" buttons of 2026-11-24.)
//
// Fields:
//   id            unique, never reused
//   provider      the tool's `id` in tools.js
//   kind          "coupon" | "deal"
//   status        "confirmed"  details supplied and approved by the site owner (Omri) -> shown in
//                              the review AND public builds
//                 "link-only"  no code; the "deal" ticket is shown in both builds
//                 "pending"    not shown anywhere (no disabled buttons, no "pending" wording)
//   url           where the button goes: the provider's own page. Never invent a URL that claims
//                 to apply a code automatically.
//   label         the link's text ("Use at IntelliGym", "Visit Official Site"; the ↗ is added by the page)
//   headline      the ticket's headline, e.g. "20% OFF IntelliGym", "CHECK FOR DEALS"
//   codeLine      deal only: the line under the headline, exactly as approved
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

// Omri's exact wording for providers without a code (2026-11-25).
const DEAL = {
  kind: "deal",
  status: "link-only",
  headline: "CHECK FOR DEALS",
  codeLine: "Code: None required (Standard rates apply)",
  label: "Visit Official Site",
  visible: true,
};

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

  // Deal tickets for the other providers (Omri, 2026-11-24 / 2026-11-25: he is arranging coupons
  // with these companies; until a code is confirmed each ticket links to the provider's official
  // homepage, the same verified `website` as in tools.js; a test checks they match). The wording
  // is shared by all five (DEAL below); to give one provider a real code, change its entry to
  // kind "coupon" as described in docs/content-editing.md.
  { id: "be-your-best-offers", provider: "be-your-best", ...DEAL, url: "https://beyourbest.com/" },
  { id: "blazepod-offers", provider: "blazepod", ...DEAL, url: "https://www.blazepod.com/" },
  { id: "neurotracker-offers", provider: "neurotracker", ...DEAL, url: "https://www.neurotrackerx.com/" },
  { id: "playermaker-offers", provider: "playermaker", ...DEAL, url: "https://www.playermaker.com/" },
  { id: "rezzil-offers", provider: "rezzil", ...DEAL, url: "https://rezzil.com/" },
];

// Live = shown in both builds. A coupon needs its code, discount and destination and must be
// confirmed; a deal ticket needs its destination. Anything else is not shown at all.
export function offerIsLive(o) {
  if (!o || o.visible === false || !o.url) return false;
  if (o.kind === "coupon") return o.status === "confirmed" && Boolean(o.code && o.discount && o.headline);
  if (o.kind === "deal") return o.status === "link-only" || o.status === "confirmed";
  return false;
}

export const liveOffersFor = (providerId) => OFFERS.filter((o) => o.provider === providerId && offerIsLive(o));
