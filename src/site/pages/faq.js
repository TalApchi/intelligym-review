// FAQ page: questions grouped as in content/faq.js, plus one question per live provider offer
// (content/offers.js), each as an expandable <details>.

import { FAQ } from "../../../content/faq.js";
import { OFFERS, offerIsLive } from "../../../content/offers.js";
import { esc, html, reviewNote, shown, pageHead, finalCta, REVIEW } from "../ui.js";

// Offer questions appear when the offer is live, or in the review build.
export const offerFaqs = () => OFFERS.filter((o) => o.visible !== false && o.faq && (offerIsLive(o) || REVIEW))
  .map((o) => ({ id: o.id, q: o.faq.q, a: o.faq.a, visible: true }));

// The coupon is named in the title and description only while its question is on the page.
const withOffers = offerFaqs().length > 0;
export const title = `FAQ: Soccer IQ challenges, scores${withOffers ? ", training tools and coupons" : " and training tools"} | Soccer IQ`;
export const description = `Answers about the Soccer IQ challenges and scores, the training tools we compare${withOffers ? ", who runs Soccer IQ, and the special IntelliGym coupon" : " and who runs Soccer IQ"}.`;

const groups = () => {
  const extra = offerFaqs();
  return FAQ.map((g, i) => ({ ...g, items: [...g.items.filter(shown), ...(i === 0 ? extra : [])] })).filter((g) => g.items.length);
};

export function view() {
  const body = groups().map((g) => `
    <section class="sec" aria-label="${esc(g.group)}">
      <div class="faq">${g.items.map((i) => `
        <details class="faq__item" id="${i.id}">
          <summary><h2 class="faq__q">${esc(i.q)}</h2></summary>
          <div class="faq__a">
            <p>${html(i.a)}</p>
            ${reviewNote(i.reviewNote)}
          </div>
        </details>`).join("")}
      </div>
    </section>`).join("");

  return `
    ${pageHead("FAQ", "Questions and answers", "About the Soccer IQ challenges, your scores and the training tools we compare.")}
    ${body}
    ${finalCta("Still curious?", "Try the challenges and see how you read the game.", { label: "Test yourself", href: "play.html" })}`;
}

export function mount(main) {
  // Open the question named in the URL (faq.html#account).
  const target = location.hash && main.querySelector(`details#${CSS.escape(location.hash.slice(1))}`);
  if (target) target.open = true;
}

const strip = (s) => String(s).replace(/<[^>]+>/g, "");
export const structuredData = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: groups().flatMap((g) => g.items).map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: strip(i.a) } })),
});
