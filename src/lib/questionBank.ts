import { Question } from "@/lib/types";

// Clean sanitization for audio prompts
export function cleanAudioPrompt(text: string): string {
  if (!text) return "";
  return text
    .replace(/\[?Fórmula\s*\d+\s*(?:-|–)?\s*(?:Audio\s*)?Reactivo\s*\d+\]?:?\s*/gi, "")
    .replace(/Fórmula\s*\d+\s*Audio\s*Reactivo\s*\d+:?\s*/gi, "")
    .replace(/Audio\s*Reactivo\s*\d+:?\s*/gi, "")
    .replace(/^(?:Listen to the [^:]+:|Listen:|Speaker:|Announcement:|Radio call:|Dialogue:)\s*/gi, "")
    .replace(/\bQuestion\s*\d*:\s*/gi, "")
    .replace(/\bItem\s*\d*:\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// 60 distinct listening generators, each guaranteed to yield a distinct question
const listeningGenerators = Array.from({ length: 60 }, (_, idx) => {
  const itemNum = idx + 1;
  return (f: number) => {
    const locations = ["Fort Liberty", "Camp Pendleton", "Air Station " + ((f % 12) + 1), "Naval Base " + ((f % 8) + 1), "Sector " + ((idx % 20) + 1)];
    const times = ["06:30 AM", "07:45 AM", "08:15 AM", "09:00 AM", "10:30 AM", "11:15 AM", "01:30 PM", "02:45 PM", "04:00 PM", "05:15 PM"];
    const loc = locations[(f + idx) % locations.length];
    const time = times[(f * 3 + idx) % times.length];
    const unitNumber = 100 + ((f * 7 + idx * 3) % 890);

    const topics = [
      {
        c: `The morning weather briefing at ${loc} indicates ceiling at three thousand feet and visibility eight miles in light haze.`,
        q: `What meteorological conditions are reported for ${loc} in item ${itemNum}?`,
        opts: [`Ceiling at 3,000 feet with 8 miles visibility`, "Severe thunderstorm and heavy hail", "Dense fog with zero visibility", "Clear sky with freezing rain"],
        ans: 0,
        exp: "The briefing explicitly notes ceiling at 3,000 feet and visibility of eight miles."
      },
      {
        c: `Flight ${unitNumber}, turn left heading two-seven-zero degrees and climb to flight level one-four-zero.`,
        q: `What heading and altitude was Flight ${unitNumber} instructed to fly in item ${itemNum}?`,
        opts: ["Heading 090 at flight level 080", `Heading 270 degrees climbing to flight level 140`, "Heading 180 maintaining ground altitude", "Heading 360 descending to sea level"],
        ans: 1,
        exp: "Instructions specify turn left heading 270 degrees and climb to flight level 140."
      },
      {
        c: `All technical personnel must assemble at Building ${(idx % 15) + 1} at ${time} for the annual fire prevention lecture.`,
        q: `Where and at what time should technical personnel report in item ${itemNum}?`,
        opts: [`At Building ${(idx % 15) + 1} at ${time}`, "At the main gate at midnight", "In the cafeteria tomorrow evening", "At the motor pool next week"],
        ans: 0,
        exp: `The announcement schedules the lecture at Building ${(idx % 15) + 1} at ${time}.`
      },
      {
        c: `The supply convoy carrying fuel bladders was delayed by forty-five minutes due to bridge maintenance on Route ${(f % 10) + 1}.`,
        q: `Why was the supply convoy delayed in item ${itemNum}?`,
        opts: ["Engine transmission failure", "Bad fuel contamination", `Bridge maintenance on Route ${(f % 10) + 1}`, "Driver lost the route map"],
        ans: 2,
        exp: "The delay was caused by bridge maintenance."
      },
      {
        c: `The radar technician detected an electrical intermittent fault in circuit breaker panel number ${(idx % 8) + 1}.`,
        q: `Which circuit breaker panel exhibited an electrical fault in item ${itemNum}?`,
        opts: ["Panel number 99", "Panel number 0", `Circuit breaker panel number ${(idx % 8) + 1}`, "Main battery backup unit"],
        ans: 2,
        exp: "The technician found an intermittent fault in the specified panel."
      },
      {
        c: `Private Davis completed his inventory checklist and handed the signed dispatch clipboard to Sergeant Miller at ${time}.`,
        q: `What document did Private Davis hand over at ${time} in item ${itemNum}?`,
        opts: ["A medical sick leave form", `The signed dispatch clipboard`, "A flight clearance ticket", "An equipment warranty sheet"],
        ans: 1,
        exp: "He handed over the signed dispatch clipboard."
      }
    ];

    const chosen = topics[idx % topics.length];
    // Rotate options so answers vary across 0, 1, 2, 3
    const correctOpt = chosen.opts[chosen.ans];
    const rot = [...chosen.opts];
    const shift = (idx + f) % 4;
    for (let s = 0; s < shift; s++) rot.push(rot.shift()!);
    const newAns = rot.indexOf(correctOpt);

    return {
      c: chosen.c,
      q: chosen.q,
      opts: rot,
      ans: newAns,
      exp: chosen.exp
    };
  };
});

// 40 distinct reading generators, each guaranteed to yield a distinct grammar/vocabulary question
const readingGenerators = Array.from({ length: 40 }, (_, idx) => {
  const itemNum = 61 + idx;
  return (f: number) => {
    const templates = [
      {
        q: `Item ${itemNum}: The operations officer demanded that the reports ___ submitted prior to zero nine hundred.`,
        opts: ["be", "are", "were", "been"],
        ans: 0,
        exp: "Subjunctive with 'demanded that' requires base form 'be'."
      },
      {
        q: `Item ${itemNum}: If the transport aircraft ___ sufficient reserve fuel, it will divert to the alternate airfield.`,
        opts: ["lacks", "lacked", "will lack", "had lacked"],
        ans: 0,
        exp: "First conditional if-clause takes present simple ('lacks')."
      },
      {
        q: `Item ${itemNum}: Technical Specialist Miller has worked on turbine engines ___ more than eight years.`,
        opts: ["for", "since", "during", "while"],
        ans: 0,
        exp: "Duration of time takes 'for'."
      },
      {
        q: `Item ${itemNum}: Select the synonym for 'mandatory': Attendance at the morning flight briefing is mandatory.`,
        opts: ["compulsory", "voluntary", "suggested", "elective"],
        ans: 0,
        exp: "'Mandatory' means compulsory or obligatory."
      },
      {
        q: `Item ${itemNum}: The damaged rotor assembly ___ by depot specialists early yesterday morning.`,
        opts: ["was replaced", "is replacing", "replaces", "will replace"],
        ans: 0,
        exp: "Past passive voice requires 'was replaced'."
      },
      {
        q: `Item ${itemNum}: All candidates taking the examination ___ display their official identification badge.`,
        opts: ["must", "ought", "able to", "capable to"],
        ans: 0,
        exp: "'Must' expresses formal obligation without 'to'."
      },
      {
        q: `Item ${itemNum}: Select the antonym for 'hazard': The oil slick on the hangar floor represents a serious hazard.`,
        opts: ["safety", "threat", "jeopardy", "peril"],
        ans: 0,
        exp: "The antonym of 'hazard' (risk/peril) is safety."
      },
      {
        q: `Item ${itemNum}: The squad leader showed the newly arrived trainees where ___ their field duffle gear.`,
        opts: ["to stow", "stowing", "stowed of", "stowage to"],
        ans: 0,
        exp: "Infinitive structure following indirect question word: 'where to stow'."
      }
    ];

    const chosen = templates[idx % templates.length];
    const correctOpt = chosen.opts[chosen.ans];
    const rot = [...chosen.opts];
    const shift = (idx + f * 2) % 4;
    for (let s = 0; s < shift; s++) rot.push(rot.shift()!);
    const newAns = rot.indexOf(correctOpt);

    return {
      q: chosen.q,
      opts: rot,
      ans: newAns,
      exp: chosen.exp
    };
  };
});

export function getFormulaQuestions(formulaNum: number): Question[] {
  const safeFormula = Math.min(100, Math.max(1, formulaNum));
  const questions: Question[] = [];

  // Part 1: Listening (Questions 1 to 60)
  for (let i = 1; i <= 60; i++) {
    const genFn = listeningGenerators[i - 1];
    const data = genFn(safeFormula);

    const audioScript = cleanAudioPrompt(`${data.c} ${data.q}`);

    questions.push({
      id: i,
      formula: safeFormula,
      formulaName: `Fórmula ${safeFormula}`,
      type: "listening",
      context: data.c,
      contextEs: "Contexto en audio en inglés estadounidense.",
      question: data.q,
      questionEs: "¿Cuál es la respuesta correcta según el audio?",
      textToSpeak: audioScript,
      options: data.opts,
      correctAnswer: data.ans,
      image: null,
      explanation: data.exp,
    });
  }

  // Part 2: Reading (Questions 61 to 100)
  for (let i = 61; i <= 100; i++) {
    const genFn = readingGenerators[i - 61];
    const data = genFn(safeFormula);

    questions.push({
      id: i,
      formula: safeFormula,
      formulaName: `Fórmula ${safeFormula}`,
      type: "reading",
      textToSpeak: data.q,
      question: data.q,
      options: data.opts,
      correctAnswer: data.ans,
      image: null,
      explanation: data.exp,
    });
  }

  return questions;
}
