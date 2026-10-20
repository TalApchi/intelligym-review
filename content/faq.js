// FAQ page. Questions about Soccer IQ, each as { id, q, a, visible, status?, reviewNote? }.
// Answers may contain simple HTML links. Provider coupon questions are not written here:
// they come from offers.js (one per offer), so a coupon question appears only for a real offer.

export const FAQ = [
  {
    group: "Soccer IQ",
    items: [
      { id: "what", q: "What is Soccer IQ?", a: "A soccer website about game intelligence: five short challenges, tips on reading the game, and a comparison of training tools.", visible: true },
      { id: "test", q: "Is my score an IQ test?", a: "No. Soccer IQ Points describe how you did in these five games, out of 500. They are not an IQ test, a validated assessment or a prediction of how you play.", visible: true },
      { id: "account", q: "Do I need an account?", a: "No. The challenges run in your browser. Your latest result is kept only on this device so you can look at it again on the <a href=\"results.html\">Your results</a> page.", visible: true },
      { id: "devices", q: "What do I need to play?", a: "A phone, tablet or computer with a modern browser. On a phone, tap; on a computer, click.", visible: true },
      { id: "practice", q: "Do practice rounds count?", a: "No. Demonstrations and practice tries are never scored. Each challenge is worth up to 100 points.", visible: true },
      { id: "provisional", q: "Why are some results marked provisional?", a: "Some tactical situations are still being reviewed by a coach, so their scores can change.", visible: true },
      { id: "improve", q: "Will playing the challenges improve my game?", a: "We don't claim that. The challenges are short games that make you think about scanning, awareness, decisions and timing. For training, see the <a href=\"learn.html#tips\">training tips</a> and the <a href=\"tools.html\">training tools comparison</a>.", visible: true },
      { id: "tools", q: "Which training tools do you compare?", a: "BlazePod, Be Your Best, IntelliGym, NeuroTracker and Rezzil. Each is described from its official pages in the same format. See the <a href=\"tools.html#compare\">comparison table</a>.", visible: true },
      { id: "who", q: "Who runs Soccer IQ?", a: "IntelliGym Labs, New Jersey, U.S. More on the <a href=\"about.html\">About page</a>.", visible: true },
    ],
  },
];
