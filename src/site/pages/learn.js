// Training tips page: the five skills, then practical tips for players, coaches and parents.
// Tips only: no About content or provider promotion here.

import { SKILLS } from "../../../content/skills.js";
import { TIPS } from "../../../content/tips.js";
import { CHALLENGES } from "../../config.js";
import { esc, section, pageHead, finalCta } from "../ui.js";

export const title = "Soccer training tips: read the game better | Soccer IQ";
export const description = "The five skills behind soccer game intelligence (scanning, awareness, anticipation, decision-making, timing) with practical tips for players, coaches and parents.";

const AUDIENCES = [["all", "Everyone"], ["players", "Players"], ["coaches", "Coaches"], ["parents", "Parents"]];

export function view() {
  const skills = SKILLS.map((s, i) => `
    <article class="skill" id="${s.id}">
      <p class="skill__n">Skill ${i + 1}</p>
      <h3 class="h-sub">${esc(s.name)}</h3>
      <p class="skill__line">${esc(s.line)}</p>
      <p>${esc(s.body)}</p>
      <h4 class="label">On the field</h4>
      <ul class="ticks">${s.onPitch.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      <p class="small">Tested in: ${s.challenges.map((id) => esc(CHALLENGES[id].title)).join(", ")}</p>
    </article>`).join("");

  const tips = TIPS.filter((t) => t.visible !== false).map((t) => `
    <article class="tip" data-for="${t.for.join(" ")}">
      <p class="label label--accent">${t.for.map((f) => esc(f[0].toUpperCase() + f.slice(1))).join(" · ")}</p>
      <h3 class="h-sub">${esc(t.title)}</h3>
      <p>${esc(t.body)}</p>
    </article>`).join("");

  return `
    ${pageHead("Training tips", "Learn to read the game", "Five skills sit behind what coaches call game intelligence. Here is what each one means in a game, and habits that help.")}

    ${section("skills", "The five skills", `<div class="skills">${skills}</div>`)}

    ${section("tips", "Tips for players, coaches and parents", `
      <div class="filter" role="group" aria-label="Show tips for">
        ${AUDIENCES.map(([k, l], i) => `<button type="button" class="chip" data-for="${k}" aria-pressed="${i === 0}">${l}</button>`).join("")}
      </div>
      <div class="tips">${tips}</div>`)}

    ${finalCta("Put it to the test", "Five short challenges built around these skills.", { label: "TEST YOURSELF", href: "play.html" })}`;
}

export function mount(main) {
  const chips = main.querySelectorAll(".chip");
  chips.forEach((chip) => chip.addEventListener("click", () => {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
    main.querySelectorAll(".tip").forEach((tip) => {
      tip.hidden = chip.dataset.for !== "all" && !tip.dataset.for.split(" ").includes(chip.dataset.for);
    });
  }));
}
