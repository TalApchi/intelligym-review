// "Scan before receiving" situations (challenge 4, "Opponents vanish", and the playground).
//
// ⚠ PROVISIONAL. Written by the build team, not by a coach. Which teammate is the draft best
// pass, which are reasonable, and the reasoning all need Omri's review (review.html shows
// every situation). Nothing here is approved.
//
// Each situation: you are about to receive from `passer`. You scan the whole picture; then
// the opponents disappear and you tap the teammate you'd pass to. The teammates' layout on
// its own should not give the answer away: the best option is decided by where the
// opponents were.
//
// Coordinates: metres on the attacking half, y = 0 is the opponents' goal line (top).
// Opponent roles are from their own point of view ("their left back" is on the right of the screen).
//
// Fields:
//   you        [x, y]           where you receive the ball
//   passer     [id, role, x, y] the teammate passing to you (also a possible target)
//   home       [id, role, x, y] the other teammates
//   away       [id, role, x, y] opponents
//   best       id of the draft best target
//   ok         ids of reasonable targets, "p" (back to the passer) included when the picture
//              makes it one; everyone else is a riskier option. No target is ranked by
//              direction
//   reasoning  why the draft prefers the best target (PROVISIONAL)
//   notes      optional { id: sentence } to replace the generated sentence for a target

const P = ([id, role, x, y]) => ({ id, role, x, y });

function situation(s) {
  return { approved: false, ok: [], notes: {}, ...s, you: { x: s.you[0], y: s.you[1] }, passer: P(s.passer), home: s.home.map(P), away: s.away.map(P) };
}

export const SCAN_SITUATIONS = [
  situation({
    id: "weak-side", title: "Weak side open", tags: ["switch", "far side"],
    you: [30, 36], passer: ["p", "centre-back", 25, 48],
    home: [["lw", "left winger", 8, 25], ["lm", "left midfielder", 17, 35], ["st", "striker", 30, 15], ["am", "attacking midfielder", 39, 26], ["rw", "right winger", 60, 23]],
    away: [["a-rb", "right back", 12, 21], ["a-rm", "right midfielder", 21, 30], ["a-cm", "central midfielder", 35, 30], ["a-rcb", "right centre-back", 27, 11], ["a-lcb", "left centre-back", 38, 12], ["a-lm", "left midfielder", 47, 36], ["a-lb", "left back", 51, 15]],
    best: "rw", ok: ["lm", "p"],
    reasoning: "They have crowded the side of the ball. The right winger had the most room and a clear lane across; the near options all had someone within a few steps.",
  }),
  situation({
    id: "screen", title: "Midfield screen", tags: ["keep the ball", "forward lanes shut"],
    you: [36, 37], passer: ["p", "centre-back", 40, 48],
    home: [["cm", "central midfielder", 22, 40], ["st", "striker", 35, 17], ["am", "attacking midfielder", 44, 25], ["lw", "left winger", 12, 22], ["rb", "right back", 58, 38]],
    away: [["a-cm1", "central midfielder", 33, 29], ["a-cm2", "central midfielder", 41, 30], ["a-rcb", "right centre-back", 31, 13], ["a-lcb", "left centre-back", 40, 14], ["a-rb", "right back", 14, 17], ["a-lm", "left midfielder", 53, 33], ["a-st", "striker", 29, 35.6]],
    best: "rb", ok: ["cm", "p"],
    reasoning: "Their two midfielders sat in front of every forward pass. The right back was open with a lane outside their left midfielder; the central midfielder was free but their striker was close to the lane.",
  }),
  situation({
    id: "hidden-lane", title: "Lane already taken", tags: ["passing lane", "looks open"],
    you: [32, 34], passer: ["p", "left back", 18, 44],
    home: [["st", "striker", 33, 13], ["rw", "right winger", 56, 20], ["am", "attacking midfielder", 42, 22], ["lw", "left winger", 10, 20], ["rm", "right midfielder", 52, 36]],
    away: [["a-dm", "holding midfielder", 37, 28], ["a-rcb", "right centre-back", 29, 9], ["a-lcb", "left centre-back", 40, 9], ["a-lb", "left back", 58, 13], ["a-rb", "right back", 13, 14], ["a-lm", "left midfielder", 47, 24], ["a-rm", "right midfielder", 24, 27]],
    best: "rm", ok: ["st", "p"],
    reasoning: "The attacking midfielder had space around them, but their holding midfielder stood in the lane to them. The right midfielder had a clear lane and nobody close.",
  }),
  situation({
    id: "back-to-passer", title: "Back where it came from", tags: ["return pass", "everything covered"],
    you: [24, 30], passer: ["p", "central midfielder", 34, 41],
    home: [["lw", "left winger", 8, 20], ["st", "striker", 30, 14], ["am", "attacking midfielder", 38, 24], ["lb", "left back", 6, 38]],
    away: [["a-rb", "right back", 11, 16], ["a-rcb", "right centre-back", 29, 9], ["a-dm", "holding midfielder", 35, 20], ["a-rm", "right midfielder", 12, 33], ["a-cm", "central midfielder", 27, 23], ["a-lm", "left midfielder", 44, 28], ["a-st", "striker", 22, 39]],
    best: "p", ok: ["am"],
    reasoning: "Every forward option had an opponent close, and their striker was screening the left back. Playing back to the central midfielder, who was facing forward with space, kept the ball.",
  }),
  situation({
    id: "decoy-drop", title: "Striker drops, winger goes", tags: ["space behind", "defender follows"],
    you: [34, 38], passer: ["p", "centre-back", 30, 49],
    home: [["st", "striker", 35, 25], ["lw", "left winger", 16, 14], ["rw", "right winger", 56, 20], ["am", "attacking midfielder", 24, 30], ["rb", "right back", 60, 38]],
    away: [["a-rcb", "right centre-back", 33, 20.5], ["a-lcb", "left centre-back", 43, 12], ["a-rb", "right back", 9, 18], ["a-lb", "left back", 57, 15], ["a-cm", "central midfielder", 27, 34], ["a-lm", "left midfielder", 50, 31], ["a-dm", "holding midfielder", 42, 27]],
    best: "lw", ok: ["rb", "p"],
    reasoning: "Their right centre-back followed the striker, which left the left winger with space inside their right back. The striker was the obvious pass but had a defender right behind them.",
  }),
  situation({
    id: "overload-left", title: "Two against one wide", tags: ["overload", "far player"],
    you: [30, 33], passer: ["p", "centre-back", 36, 46],
    home: [["lw", "left winger", 7, 17], ["lm", "left midfielder", 15, 27], ["st", "striker", 35, 14], ["rw", "right winger", 58, 22], ["cm", "central midfielder", 42, 36]],
    away: [["a-rb", "right back", 11, 24.5], ["a-rcb", "right centre-back", 31, 10], ["a-lcb", "left centre-back", 39, 10.5], ["a-lb", "left back", 55, 17], ["a-cm", "central midfielder", 36, 25], ["a-lm", "left midfielder", 47, 32], ["a-rm", "right midfielder", 25, 22]],
    best: "lw", ok: ["cm", "p"],
    reasoning: "Their right back was caught between two of ours. They stood closer to the left midfielder, so the left winger beyond was the one with time.",
  }),
  situation({
    id: "cover-shadow", title: "Behind the presser", tags: ["cover shadow", "pressing forward"],
    you: [40, 40], passer: ["p", "right back", 58, 46],
    home: [["cm", "central midfielder", 30, 30], ["lm", "left midfielder", 14, 34], ["st", "striker", 36, 17], ["am", "attacking midfielder", 48, 26], ["rw", "right winger", 62, 24]],
    away: [["a-st", "striker", 36, 35], ["a-cm", "central midfielder", 44, 30], ["a-lb", "left back", 55, 17], ["a-rcb", "right centre-back", 32, 13], ["a-lcb", "left centre-back", 41, 13], ["a-rm", "right midfielder", 18, 29], ["a-dm", "holding midfielder", 27, 24]],
    best: "rw", ok: ["lm", "p"],
    reasoning: "Their striker stood between you and the central midfielder, so that pass would run into them. Their left back had stayed narrow, which left the right winger the clearest option.",
  }),
  situation({
    id: "full-back-high", title: "Full-back up the line", tags: ["full-back", "winger marked"],
    you: [44, 36], passer: ["p", "central midfielder", 34, 45],
    home: [["rw", "right winger", 57, 22], ["rb", "right back", 63, 31], ["st", "striker", 38, 15], ["am", "attacking midfielder", 32, 26], ["lw", "left winger", 12, 22]],
    away: [["a-lb", "left back", 56, 26.5], ["a-lm", "left midfielder", 53, 38], ["a-lcb", "left centre-back", 42, 12], ["a-rcb", "right centre-back", 33, 12], ["a-cm", "central midfielder", 36, 30], ["a-dm", "holding midfielder", 44, 22], ["a-rb", "right back", 16, 17]],
    best: "rb", ok: ["lw", "p"],
    reasoning: "Their left back was tight on the right winger and their left midfielder was behind you, so the right back had the touchline to themselves.",
  }),
  situation({
    id: "striker-feet", title: "Into the striker", tags: ["pass into feet", "space in front of the defence"],
    you: [33, 38], passer: ["p", "centre-back", 22, 47],
    home: [["st", "striker", 34, 22], ["lw", "left winger", 10, 20], ["rw", "right winger", 57, 21], ["lm", "left midfielder", 19, 33], ["rm", "right midfielder", 48, 34]],
    away: [["a-rcb", "right centre-back", 29, 11], ["a-lcb", "left centre-back", 40, 11], ["a-rb", "right back", 12, 15.5], ["a-lb", "left back", 55, 16], ["a-rm", "right midfielder", 21, 28], ["a-lm", "left midfielder", 45, 29], ["a-cm", "central midfielder", 26, 22]],
    best: "st", ok: ["rm", "p"],
    reasoning: "Their centre-backs stayed deep and their midfield was split, so the striker had room to receive and turn. Both wingers had a full-back close.",
  }),
  situation({
    id: "wrong-side", title: "Marked from the wrong side", tags: ["marking", "goal-side"],
    you: [36, 34], passer: ["p", "centre-back", 40, 47],
    home: [["am", "attacking midfielder", 26, 20], ["st", "striker", 44, 13], ["lw", "left winger", 10, 24], ["rw", "right winger", 58, 26], ["cm", "central midfielder", 24, 38]],
    away: [["a-cm", "central midfielder", 28, 24.5], ["a-rcb", "right centre-back", 33, 12], ["a-lcb", "left centre-back", 45, 8.5], ["a-rb", "right back", 13, 19], ["a-lb", "left back", 54, 17], ["a-dm", "holding midfielder", 37, 26], ["a-st", "striker", 21, 43]],
    best: "rw", ok: ["cm", "p"],
    reasoning: "The right winger had nobody tight. The attacking midfielder looked free once the opponents vanished, but their central midfielder stood on the side towards you, right in the lane.",
  }),
  situation({
    id: "inside-channel", title: "Half-space", tags: ["between the lines", "inside channel"],
    you: [26, 40], passer: ["p", "left back", 10, 44],
    home: [["am", "attacking midfielder", 22, 22], ["lw", "left winger", 8, 25], ["st", "striker", 34, 14], ["rw", "right winger", 58, 22], ["cm", "central midfielder", 38, 40]],
    away: [["a-rb", "right back", 10, 20], ["a-rm", "right midfielder", 15, 34], ["a-rcb", "right centre-back", 28, 12], ["a-lcb", "left centre-back", 39, 11], ["a-cm", "central midfielder", 33, 30], ["a-dm", "holding midfielder", 34, 22.5], ["a-lb", "left back", 55, 18]],
    best: "am", ok: ["cm", "p"],
    reasoning: "The attacking midfielder was in the gap between their midfield and defence, and the lane ran between their right midfielder and central midfielder.",
  }),
  situation({
    id: "press-trap", title: "Pressing trap", tags: ["pressing", "touchline"],
    you: [54, 34], passer: ["p", "right back", 60, 46],
    home: [["rw", "right winger", 62, 20], ["am", "attacking midfielder", 46, 24], ["cm", "central midfielder", 38, 38], ["st", "striker", 36, 14], ["lm", "left midfielder", 18, 32]],
    away: [["a-lb", "left back", 61, 25], ["a-lm", "left midfielder", 55, 27], ["a-cm", "central midfielder", 42, 35.5], ["a-lcb", "left centre-back", 44, 12], ["a-rcb", "right centre-back", 33, 11], ["a-dm", "holding midfielder", 40, 23], ["a-rm", "right midfielder", 22, 27]],
    best: "p", ok: [],
    reasoning: "Near the touchline everything forward and inside was crowded: the winger, the attacking midfielder and the central midfielder all had someone in the lane or close. The way out was back.",
  }),
  situation({
    id: "late-runner", title: "Midfielder arriving", tags: ["third man", "space at the edge"],
    you: [24, 22], passer: ["p", "left winger", 10, 30],
    home: [["st", "striker", 30, 10], ["am", "attacking midfielder", 37, 26], ["rw", "right winger", 54, 14], ["lb", "left back", 8, 40], ["cm", "central midfielder", 30, 38]],
    away: [["a-rcb", "right centre-back", 28, 6], ["a-lcb", "left centre-back", 36, 8], ["a-lb", "left back", 51, 10], ["a-rb", "right back", 16, 13], ["a-dm", "holding midfielder", 30, 16], ["a-rm", "right midfielder", 17, 30], ["a-lm", "left midfielder", 46, 27]],
    best: "am", ok: ["cm", "p"],
    reasoning: "The striker had two centre-backs on them. The attacking midfielder arriving at the edge of the box had a clear lane and the nearest opponent several steps away.",
  }),
  situation({
    id: "far-post-diagonal", title: "Long diagonal", tags: ["switch", "high winger"],
    you: [16, 26], passer: ["p", "left back", 6, 36],
    home: [["lw", "left winger", 9, 12], ["st", "striker", 28, 12], ["am", "attacking midfielder", 28, 24], ["rw", "right winger", 54, 10], ["cm", "central midfielder", 26, 38]],
    away: [["a-rb", "right back", 12, 8], ["a-rcb", "right centre-back", 25, 8], ["a-lcb", "left centre-back", 34, 9], ["a-rm", "right midfielder", 18, 19], ["a-cm", "central midfielder", 30, 30], ["a-dm", "holding midfielder", 34, 23], ["a-lb", "left back", 44, 7]],
    best: "rw", ok: ["cm", "p"],
    reasoning: "Their whole block had shifted towards you, so their left back was narrow. The right winger was alone near the far touchline.",
  }),
  situation({
    id: "blindside", title: "Defender watching the ball", tags: ["blind side", "free behind"],
    you: [38, 30], passer: ["p", "central midfielder", 30, 41],
    home: [["st", "striker", 40, 12], ["lw", "left winger", 18, 14], ["rw", "right winger", 58, 16], ["am", "attacking midfielder", 28, 22], ["rm", "right midfielder", 52, 34]],
    away: [["a-lcb", "left centre-back", 44, 15.5], ["a-rcb", "right centre-back", 33, 11], ["a-rb", "right back", 22, 18], ["a-lb", "left back", 50, 13], ["a-dm", "holding midfielder", 35, 22], ["a-lm", "left midfielder", 46, 29], ["a-cm", "central midfielder", 24, 30]],
    best: "rw", ok: ["rm", "st", "am", "p"],
    reasoning: "Their left back had tucked in next to their centre-back, leaving the right winger alone on the outside. The striker was an option but had a centre-back close.",
  }),
  situation({
    id: "both-wings-closed", title: "Middle is the answer", tags: ["central pass", "wide players marked"],
    you: [34, 40], passer: ["p", "centre-back", 28, 49],
    home: [["lw", "left winger", 10, 22], ["rw", "right winger", 58, 22], ["am", "attacking midfielder", 32, 25], ["st", "striker", 38, 12], ["lb", "left back", 8, 38]],
    away: [["a-rb", "right back", 12, 26], ["a-lb", "left back", 55, 25.5], ["a-rcb", "right centre-back", 33, 9], ["a-lcb", "left centre-back", 42, 10], ["a-rm", "right midfielder", 13, 34], ["a-lm", "left midfielder", 47, 33], ["a-cm", "central midfielder", 41, 24]],
    best: "am", ok: ["lb", "p"],
    reasoning: "Both full-backs were tight on the wingers and their right midfielder was by the left back. Their central midfielder was a few steps from the attacking midfielder, but the lane to them was clear.",
  }),
  situation({
    id: "wide-midfielder-free", title: "Quiet on the left", tags: ["wide midfielder", "short pass"],
    you: [36, 32], passer: ["p", "central midfielder", 44, 42],
    home: [["lm", "left midfielder", 20, 30], ["lw", "left winger", 10, 14], ["st", "striker", 32, 12], ["am", "attacking midfielder", 44, 20], ["rw", "right winger", 60, 24]],
    away: [["a-rb", "right back", 14, 17], ["a-rcb", "right centre-back", 29, 8], ["a-lcb", "left centre-back", 37, 10.5], ["a-lb", "left back", 57, 19.5], ["a-dm", "holding midfielder", 40, 23], ["a-cm", "central midfielder", 30, 24], ["a-lm", "left midfielder", 50, 31]],
    best: "lm", ok: ["rw", "p"],
    reasoning: "The left midfielder had space and a short, clear lane. Everyone ahead had someone close, and the right winger's lane passed near their left midfielder.",
  }),
  situation({
    id: "deep-striker", title: "Striker in the pocket", tags: ["striker", "between midfield and defence"],
    you: [28, 42], passer: ["p", "centre-back", 38, 49],
    home: [["st", "striker", 30, 26], ["lw", "left winger", 8, 28], ["rw", "right winger", 56, 26], ["am", "attacking midfielder", 44, 32], ["lb", "left back", 12, 42]],
    away: [["a-rcb", "right centre-back", 27, 16], ["a-lcb", "left centre-back", 38, 16], ["a-rb", "right back", 9, 23], ["a-lb", "left back", 53, 21.5], ["a-cm", "central midfielder", 22, 34], ["a-dm", "holding midfielder", 40, 28], ["a-rm", "right midfielder", 16, 38]],
    best: "st", ok: ["rw", "p"],
    reasoning: "Their centre-backs held their line instead of stepping out, so the striker had room in front of them. Their holding midfielder was closer to the attacking midfielder.",
  }),
  situation({
    id: "after-turnover", title: "Just won it back", tags: ["transition", "first pass forward"],
    you: [40, 30], passer: ["p", "central midfielder", 30, 34],
    home: [["st", "striker", 34, 16], ["rw", "right winger", 56, 26], ["lw", "left winger", 14, 24], ["am", "attacking midfielder", 46, 18], ["rb", "right back", 60, 42]],
    away: [["a-lcb", "left centre-back", 38, 12], ["a-rcb", "right centre-back", 29, 18], ["a-lb", "left back", 46, 26], ["a-rb", "right back", 20, 30], ["a-cm", "central midfielder", 44, 35], ["a-lm", "left midfielder", 60, 34], ["a-rm", "right midfielder", 18, 21]],
    best: "am", ok: ["st", "p"],
    reasoning: "Right after winning the ball their shape was broken. The attacking midfielder had space between their centre-back and left back, and a clear lane forward.",
  }),
  situation({
    id: "goal-side-cb", title: "Centre-back goal-side", tags: ["marking", "short option"],
    you: [32, 30], passer: ["p", "centre-back", 26, 44],
    home: [["st", "striker", 30, 14], ["lw", "left winger", 12, 18], ["rw", "right winger", 56, 15], ["cm", "central midfielder", 44, 34], ["lm", "left midfielder", 16, 34]],
    away: [["a-rcb", "right centre-back", 29, 9], ["a-lcb", "left centre-back", 40, 10], ["a-rb", "right back", 16, 13], ["a-lb", "left back", 50, 9], ["a-cm", "central midfielder", 41, 28.5], ["a-dm", "holding midfielder", 28, 21], ["a-rm", "right midfielder", 20, 29]],
    best: "rw", ok: ["st", "p"],
    reasoning: "The striker was free in front of the centre-back, but their holding midfielder was close to the lane. Their left back was a step behind the right winger, who had the most time.",
  }),
  situation({
    id: "switch-back", title: "Their shift went too far", tags: ["switch", "short side crowded"],
    you: [50, 30], passer: ["p", "right back", 60, 40],
    home: [["rw", "right winger", 60, 18], ["am", "attacking midfielder", 44, 20], ["st", "striker", 36, 13], ["lw", "left winger", 14, 18], ["cm", "central midfielder", 36, 36]],
    away: [["a-lb", "left back", 58, 14], ["a-lm", "left midfielder", 55, 25], ["a-lcb", "left centre-back", 44, 13], ["a-rcb", "right centre-back", 34, 9], ["a-dm", "holding midfielder", 40, 21.5], ["a-cm", "central midfielder", 30, 30], ["a-rb", "right back", 24, 14]],
    best: "lw", ok: ["cm", "p"],
    reasoning: "Their whole team had moved to your side. The pass to the left winger had to travel, but the lane was clear and their right back was well inside.",
  }),
  situation({
    id: "two-close-options", title: "Two short options", tags: ["short pass", "pick the right one"],
    you: [30, 38], passer: ["p", "centre-back", 34, 49],
    home: [["cm", "central midfielder", 42, 34], ["lm", "left midfielder", 18, 32], ["st", "striker", 32, 18], ["lw", "left winger", 8, 20], ["rw", "right winger", 58, 22]],
    away: [["a-lm", "left midfielder", 46, 30], ["a-rm", "right midfielder", 25, 30], ["a-cm", "central midfielder", 34, 27], ["a-rcb", "right centre-back", 28, 12], ["a-lcb", "left centre-back", 37, 12], ["a-rb", "right back", 12, 16], ["a-lb", "left back", 54, 18]],
    best: "lm", ok: ["cm", "p"],
    reasoning: "Both short options looked free once the opponents vanished. Their left midfielder was closer to our central midfielder than their right midfielder was to our left midfielder, and the lane to the left was cleaner.",
  }),
];
