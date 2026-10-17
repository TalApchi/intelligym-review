// The timeline under the board after a through ball: when a pass would have worked (green)
// and when it wouldn't, with your pass as a red line. Tapping it (or arrow keys + Enter)
// calls onPick(t) to replay "what if you'd passed here".

export function timeline(m, release, onPick) {
  const w = m.window, T = m.timeLimit;
  const pct = (t) => `${(Math.min(T, Math.max(0, t)) / T) * 100}%`;
  const box = document.createElement("div");
  box.className = "tb-tl";
  const bar = document.createElement("div");
  bar.className = "tb-tl__bar";
  bar.setAttribute("role", "slider");
  bar.setAttribute("aria-label", "Release moment: tap to see what a pass then would have done");
  bar.setAttribute("aria-valuemin", "0");
  bar.setAttribute("aria-valuemax", T.toFixed(1));
  bar.tabIndex = 0;
  // runs of the same result
  let i = 0;
  while (i < w.samples.length) {
    let j = i;
    const ok = w.samples[i].kind === "through";
    while (j + 1 < w.samples.length && (w.samples[j + 1].kind === "through") === ok) j++;
    const seg = document.createElement("span");
    seg.className = `tb-tl__seg ${ok ? "is-on" : "is-off"}`;
    seg.style.left = pct(w.samples[i].t);
    seg.style.width = `calc(${pct(w.samples[j].t + w.step)} - ${pct(w.samples[i].t)})`;
    bar.append(seg);
    i = j + 1;
  }
  const probe = Object.assign(document.createElement("span"), { className: "tb-tl__probe", hidden: true });
  const you = Object.assign(document.createElement("span"), { className: "tb-tl__you", hidden: release === null });
  if (release !== null) you.style.left = pct(release);
  const head = Object.assign(document.createElement("span"), { className: "tb-tl__head", hidden: true });
  bar.append(probe, you, head);
  const legend = document.createElement("div");
  legend.className = "tb-tl__legend";
  legend.innerHTML = `<span style="left:${pct(w.start / 2)}">Too early</span><span class="is-on" style="left:${pct((w.start + w.end) / 2)}">On</span><span style="left:${pct((w.end + T) / 2)}">Too late</span>`;
  const hint = document.createElement("p");
  hint.className = "tb-tl__hint";
  hint.textContent = release === null
    ? "You didn't pass. Tap the bar to see any moment."
    : "Your pass is the red line. Tap the bar to see what a pass at that moment would have done.";
  bar.addEventListener("pointerup", (e) => {
    const r = bar.getBoundingClientRect();
    onPick(Math.min(T - 0.05, Math.max(0, ((e.clientX - r.left) / r.width) * T)));
  });
  let kbT = release ?? w.start;
  bar.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight" && e.key !== "Enter") return;
    e.preventDefault();
    if (e.key !== "Enter") kbT = Math.min(T - 0.05, Math.max(0, kbT + (e.key === "ArrowRight" ? 0.1 : -0.1)));
    onPick(kbT);
  });
  box.append(bar, legend, hint);
  return {
    el: box,
    playhead(t) { head.hidden = t === null; if (t !== null) head.style.left = pct(t); },
    probe(t) { probe.hidden = false; probe.style.left = pct(t); },
  };
}
