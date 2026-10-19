// FAQ page. Two groups: questions about Soccer IQ (our own answers) and questions about
// IntelliGym (answered from IntelliGym's official FAQ, with the source shown).
// Each item: { id, q, a, source?, status?, visible }. Answers may contain simple HTML links.

const C = "2026-10-18";

export const FAQ = [
  {
    group: "Soccer IQ",
    items: [
      { id: "what", q: "What is Soccer IQ?", a: "A football website about game intelligence: five short challenges, tips on reading the game, and a guide to tools that train it.", visible: true },
      { id: "test", q: "Is my score an IQ test?", a: "No. Soccer IQ Points describe how you did in these five games, out of 500. They are not an IQ test, a validated assessment or a prediction of how you play.", visible: true },
      { id: "account", q: "Do I need an account?", a: "No. The challenges run in your browser. Your latest result is kept only on this device so you can look at it again on the <a href=\"results.html\">Your results</a> page.", visible: true },
      { id: "devices", q: "What do I need to play?", a: "A phone, tablet or computer with a modern browser. On a phone, tap; on a computer, click.", visible: true },
      { id: "practice", q: "Do practice rounds count?", a: "No. Demonstrations and practice tries are never scored. Each challenge is worth up to 100 points.", visible: true },
      { id: "provisional", q: "Why are some results marked provisional?", a: "Some tactical situations are still being reviewed by a coach, so their scores can change.", visible: true },
      { id: "improve", q: "Will playing the challenges improve my game?", a: "We don't claim that. The challenges are short games that make you think about scanning, awareness, decisions and timing. For training, see the <a href=\"learn.html#tips\">tips</a> and the <a href=\"tools.html\">training tools</a>.", visible: true },
      { id: "intelligym", q: "How is Soccer IQ related to IntelliGym?", a: "IntelliGym is a featured partner of Soccer IQ, so it has its own page. Soccer IQ's challenges are separate games; IntelliGym's research and testimonials are about IntelliGym. More on the <a href=\"about.html\">About page</a>.", visible: true },
    ],
  },
  {
    group: "About IntelliGym (from IntelliGym's FAQ)",
    items: [
      { id: "ig-session", q: "How long is an IntelliGym session?", a: "IntelliGym says each session lasts 30 minutes and is made up of 8 levels of about 4 minutes.", source: { url: "https://soccer.intelligym.com/faq-items/how-long-is-each-training-session/", checked: C }, visible: true },
      { id: "ig-often", q: "How often should players train with it?", a: "IntelliGym recommends 2 to 3 sessions a week, with at least 24 hours of rest between them.", source: { url: "https://soccer.intelligym.com/faq-items/how-often-should-an-athlete-train-with-the-intelligym/", checked: C }, visible: true },
      { id: "ig-age", q: "What ages is it for?", a: "IntelliGym gives 10 to 25 as the general range, and says younger players may find the controls hard.", source: { url: "https://soccer.intelligym.com/faq-items/what-is-the-recommended-age-for-using-intelligym-2/", checked: C }, visible: true },
      { id: "ig-devices", q: "Which devices does it run on?", a: "Windows and Mac computers, and iPhone. IntelliGym notes that the desktop and mobile versions are separate programmes.", source: { url: "https://soccer.intelligym.com/faq-items/can-the-intelligym-run-on-mobile-phones/", checked: C }, visible: true },
      { id: "ig-discounts", q: "Are there discounts?", a: "IntelliGym says it offers lower prices through family and team plans and releases promotional pricing from time to time. A dedicated Soccer IQ offer is pending.", source: { url: "https://soccer.intelligym.com/faq-items/do-you-offer-any-discounts/", checked: C }, visible: true },
      { id: "ig-trial", q: "Is there a free trial or money back guarantee?", a: "IntelliGym's pages give different answers, so check the current terms on IntelliGym's site before buying.", status: "to-confirm", source: { url: "https://soccer.intelligym.com/faq-items/do-you-offer-a-free-trial/", checked: C }, visible: true,
        reviewNote: "See \"Terms to confirm\" on the IntelliGym page: the FAQ says no free trial and 30 days (US) or 60 days (UK); the plans page offers a 7-day free trial." },
    ],
  },
];
