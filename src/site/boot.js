// Entry point for the content pages: draws the shared header/footer, then the page body.
// Each page's HTML sets <body data-page="..."> and has an empty <main id="main">.

import { mountShell } from "./shell.js";

const PAGES = {
  home: () => import("./pages/home.js"),
  learn: () => import("./pages/learn.js"),
  knowledge: () => import("./pages/knowledge.js"),
  tools: () => import("./pages/tools.js"),
  intelligym: () => import("./pages/intelligym.js"),
  faq: () => import("./pages/faq.js"),
  about: () => import("./pages/about.js"),
  results: () => import("./pages/results.js"),
};

const page = document.body.dataset.page;
mountShell(page === "intelligym" ? "tools" : page);
const main = document.getElementById("main");
if (PAGES[page]) {
  const mod = await PAGES[page]();
  mod.render(main);
  // Anchors (#compare etc.) exist only after rendering, so scroll to them now.
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}
