// FAQ page: questions grouped as in content/faq.js, each as an expandable <details>.

import { FAQ } from "../../../content/faq.js";
import { esc, html, source, badge, reviewNote, shown } from "../ui.js";

export function render(main) {
  const groups = FAQ.map((g) => {
    const items = g.items.filter(shown);
    if (!items.length) return "";
    return `
      <section class="sec">
        <h2 class="sec__title">${esc(g.group)}</h2>
        <div class="faq">${items.map((i) => `
          <details class="faq__item" id="${i.id}">
            <summary>${esc(i.q)} ${badge(i.status)}</summary>
            <div class="faq__a">
              <p>${html(i.a)}</p>
              ${i.source ? source(i.source) : ""}
              ${reviewNote(i.reviewNote)}
            </div>
          </details>`).join("")}
        </div>
      </section>`;
  }).join("");

  main.innerHTML = `
    <header class="page-head">
      <p class="kicker">FAQ</p>
      <h1 class="display display--lg">Questions and answers</h1>
      <p class="lede">About Soccer IQ and its challenges, and about IntelliGym, answered from IntelliGym's own FAQ.</p>
    </header>
    ${groups}
    <section class="final-cta">
      <h2 class="display display--md">Still curious?</h2>
      <p>Try the challenges, or read more in the knowledge hub.</p>
      <div class="cta-row cta-row--center"><a class="btn btn--primary" href="play.html">Test yourself</a><a class="btn btn--ghost" href="knowledge.html">Knowledge hub</a></div>
    </section>`;

  // Open the question named in the URL (faq.html#account).
  const target = location.hash && main.querySelector(`details#${CSS.escape(location.hash.slice(1))}`);
  if (target) target.open = true;
}
