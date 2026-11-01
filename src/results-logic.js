// What the results screens say about a run. Pure functions, tested in site/tests/results.test.mjs.
// Only what the points themselves show: no IQ score, no percentiles, no comparison with other
// players or professionals, no claim about real-match ability.

const list = (names) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0]);

/**
 * One or two sentences about the pattern in the scores, or "" when there is nothing fair to say.
 * rows: [{ id, title, points }] where points is 0..100, or null for a challenge not played.
 */
export function observation(rows) {
  const played = rows.filter((r) => typeof r.points === "number");
  if (played.length < 2) return "";
  const max = Math.max(...played.map((r) => r.points));
  const min = Math.min(...played.map((r) => r.points));
  const top = played.filter((r) => r.points === max).map((r) => r.title);
  const low = played.filter((r) => r.points === min).map((r) => r.title);
  if (min >= 90) return "You scored 90 or more in every challenge you played.";
  if (max === 0) return "No points this time. Each challenge gets easier to read once you know what to look for: the tips below explain what each one is about.";
  if (max - min >= 30) {
    return `Your highest score was in ${list(top)} (${max}) and your lowest in ${list(low)} (${min}). In these games, ${list(low)} ${low.length > 1 ? "are" : "is"} where most of your points went.`;
  }
  return `Your scores were fairly even, between ${min} and ${max}.`;
}

/**
 * The tips worth reading next: the skills behind the lowest-scoring challenge(s), from
 * content/skills.js. Returns [{ id, name }] (at most two), or [] if every score is 90+.
 */
export function nextSkills(rows, skills) {
  const played = rows.filter((r) => typeof r.points === "number");
  if (!played.length) return [];
  const min = Math.min(...played.map((r) => r.points));
  if (min >= 90) return [];
  const weakest = played.filter((r) => r.points === min).map((r) => r.id);
  return skills.filter((s) => s.challenges.some((c) => weakest.includes(c))).slice(0, 2).map(({ id, name }) => ({ id, name }));
}
