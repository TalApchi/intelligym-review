// The five parts of game intelligence explained on the Training tips page and listed on the home page.
// Our own plain-language explanations. `challenges` lists the Soccer IQ challenges (ids from src/config.js)
// that ask for the skill. They are games, not a measure of the skill.

export const SKILLS = [
  {
    id: "scanning",
    name: "Scanning",
    line: "Looking around before the ball arrives.",
    body: "Quick looks over the shoulder and across the field, taken while the ball is on its way, so you already know where teammates, opponents and space are when it reaches you.",
    onPitch: ["Check both shoulders before you receive.", "Look again just before the pass is played: the picture changes."],
    challenges: ["scan"],
  },
  {
    id: "awareness",
    name: "Awareness",
    line: "Keeping the whole picture in mind.",
    body: "Holding on to where several players are and how they are moving, not only the player nearest the ball, and noticing when something changes.",
    onPitch: ["Know where your nearest marker is without staring at them.", "Keep track of runs off the ball, not just the ball."],
    challenges: ["spot", "track"],
  },
  {
    id: "anticipation",
    name: "Anticipation",
    line: "Seeing what is about to happen.",
    body: "Reading body shape, runs and the position of the ball to predict the next action, so you move a moment earlier than the play.",
    onPitch: ["Watch the passer's hips and standing foot.", "Ask yourself where the ball is likely to go next, then move."],
    challenges: ["through"],
  },
  {
    id: "decisions",
    name: "Decision-making",
    line: "Choosing the best option in the time you have.",
    body: "Weighing passing, dribbling and shooting options against the risk of losing the ball, then committing. Often there is more than one good answer.",
    onPitch: ["Have a first and a second option before you receive.", "A safe pass back can be the right call; so can a dribble into space."],
    challenges: ["decide", "scan"],
  },
  {
    id: "timing",
    name: "Timing",
    line: "Doing it at the right moment.",
    body: "Releasing a pass, making a run or stepping in at the moment it works: too early and the chance is not there yet, too late and it has gone.",
    onPitch: ["Pass into a run when the runner is level with the last defender, not after.", "Delay your run until the passer can see you."],
    challenges: ["through"],
  },
];
