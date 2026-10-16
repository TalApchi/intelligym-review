// The results tier for a share of available points (0..1). Tier names and
// thresholds are game settings in config.js, not ability levels.
export function tierFor(share, tiers) {
  let name = tiers[0].name;
  for (const t of tiers) if (share >= t.min) name = t.name;
  return name;
}
