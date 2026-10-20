// Entry point for the content pages: header/footer, then the page body.
// Each page's HTML sets <body data-page="..."> and has a <main id="main">. In built pages the
// body is already written in (tools/build.mjs prerenders it, so search engines and readers
// without JavaScript get the text); here we only render it when missing and wire up behavior.

import { mountShell } from "./shell.js";

const PAGES = {
  home: () => import("./pages/home.js"),
  learn: () => import("./pages/learn.js"),
  knowledge: () => import("./pages/knowledge.js"),
  tools: () => import("./pages/tools.js"),
  faq: () => import("./pages/faq.js"),
  about: () => import("./pages/about.js"),
  results: () => import("./pages/results.js"),
};

const page = document.body.dataset.page;
mountShell(page);
const main = document.getElementById("main");
if (PAGES[page]) {
  const mod = await PAGES[page]();
  if (!main.hasAttribute("data-prerendered")) main.innerHTML = mod.view();
  mod.mount?.(main);
  // Anchors (#compare etc.) exist only after rendering, so scroll to them now.
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}
