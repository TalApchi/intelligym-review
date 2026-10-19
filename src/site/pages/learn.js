// Learn page: the five skills, then training tips for players, coaches and parents.

import { SKILLS } from "../../../content/skills.js";
import { TIPS, IG_ADVICE } from "../../../content/tips.js";
import { CHALLENGES } from "../../config.js";
import { esc, source, section, button } from "../ui.js";

const AUDIENCES = [["all", "Everyone"], ["players", "Players"], ["coaches", "Coaches"], ["parents", "Parents"]];

export function render(main) {
  const skills = SKILLS.map((s, i) => `
    <article class="skill" id="${s.id}">
      <span class="skill__n" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
      <h3 class="skill__name">${esc(s.name)}</h3>
      <p class="skill__line">${esc(s.line)}</p>
      <p>${esc(s.body)}</p>
      <h4 class="skill__sub">On the pitch</h4>
      <ul class="ticks">${s.onPitch.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      <p class="skill__try">In our challenges: ${s.challenges.map((id) => `<a href="play.html">${esc(CHALLENGES[id].title)}</a>`).join(", ")}</p>
    </article>`).join("");

  const tips = TIPS.filter((t) => t.visible !== false).map((t) => `
    <article class="tip" data-for="${t.for.join(" ")}">
      <p class="tip__for">${t.for.map((f) => esc(f[0].toUpperCase() + f.slice(1))).join(" · ")}</p>
      <h3 class="tip__title">${esc(t.title)}</h3>
      <p>${esc(t.body)}</p>
      ${t.source ? source(t.source, "Based on") : ""}
    </article>`).join("");

  const advice = IG_ADVICE.items.filter((a) => a.visible !== false).map((a) => `
    <li><p>${esc(a.text)}</p>${source(a.source)}</li>`).join("");

  main.innerHTML = `
    <header class="page-head">
      <p class="kicker">Training tips</p>
      <h1 class="display display--lg">Learn to read the game</h1>
      <p class="lede">Five skills sit behind what coaches call game intelligence. Here is what each one means on the pitch, and habits that help.</p>
    </header>

    ${section("skills", "The five skills", `<div class="skills">${skills}</div>`)}

    ${section("tips", "Tips for players, coaches and parents", `
      <div class="filter" role="group" aria-label="Show tips for">
        ${AUDIENCES.map(([k, l], i) => `<button type="button" class="chip" data-for="${k}" aria-pressed="${i === 0}">${l}</button>`).join("")}
      </div>
      <div class="tips">${tips}</div>`)}

    ${section("intelligym-advice", IG_ADVICE.title, `
      <p class="sec__lede">${esc(IG_ADVICE.intro)}</p>
      <ul class="advice">${advice}</ul>
      <p class="disclosure">This advice is IntelliGym's guidance for its own programme. <a href="intelligym.html">About IntelliGym</a></p>`)}

    <section class="final-cta">
      <h2 class="display display--md">Put it to the test</h2>
      <p>Five short challenges built around these skills.</p>
      ${button({ label: "Start the challenges", href: "play.html" })}
    </section>`;

  const chips = main.querySelectorAll(".chip");
  chips.forEach((chip) => chip.addEventListener("click", () => {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    main.querySelectorAll(".tip").forEach((tip) => {
      tip.hidden = chip.dataset.for !== "all" && !tip.dataset.for.split(" ").includes(chip.dataset.for);
    });
  }));
}
