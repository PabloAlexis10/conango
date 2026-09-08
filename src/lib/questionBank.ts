import { Question } from "@/lib/types";

// Clean sanitization for audio prompts: removes formula labels, audio reactivo tags, and 'Question:' prefixes
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

// 10 distinct listening templates parameterized by formula and question index
const listeningGenerators = [
  (f: number, i: number) => ({
    context: `The sky is overcast with a temperature of ${50 + (i % 35)} degrees and wind velocity at ${10 + (i % 25)} knots.`,
    contextEs: `El cielo está cubierto con una temperatura de ${50 + (i % 35)} grados y viento a ${10 + (i % 25)} nudos.`,
    q: `What are the meteorological conditions reported for Sector ${i}?`,
    qEs: `¿Cuáles son las condiciones meteorológicas reportadas para el Sector ${i}?`,
    opts: [`Overcast sky with ${10 + (i % 25)} knot winds`, "Severe blizzard with heavy snow", "Freezing fog and hail", "Clear sky with calm breeze"],
    ans: 0,
    exp: `The report specifies an overcast sky with wind speed at ${10 + (i % 25)} knots.`
  }),
  (f: number, i: number) => ({
    context: `Flight ${100 + i}, maintain altitude at ${15 + (i % 15)} thousand feet until passing waypoint ${String.fromCharCode(65 + (i % 26))}.`,
    contextEs: `Vuelo ${100 + i}, mantenga altitud a ${15 + (i % 15)} mil pies hasta pasar el punto ${String.fromCharCode(65 + (i % 26))}.`,
    q: `What cruising altitude must Flight ${100 + i} maintain?`,
    qEs: `¿Qué altitud de crucero debe mantener el Vuelo ${100 + i}?`,
    opts: [`${5 + (i % 5)} thousand feet`, `${15 + (i % 15)} thousand feet`, "50 thousand feet", "Ground level altitude"],
    ans: 1,
    exp: `The tower explicitly directs the aircraft to maintain ${15 + (i % 15)} thousand feet.`
  }),
  (f: number, i: number) => ({
    context: `When will the commander inspect Barracks ${(i % 12) + 1}? He is scheduled to arrive at ${(i % 12) + 1}:00 PM sharp.`,
    contextEs: `¿Cuándo inspeccionará el comandante la Cuadra ${(i % 12) + 1}? Está programado para llegar a las ${(i % 12) + 1}:00 PM en punto.`,
    q: `At what time will the inspection of Barracks ${(i % 12) + 1} occur?`,
    qEs: `¿A qué hora se realizará la inspección de la Cuadra ${(i % 12) + 1}?`,
    opts: ["Tomorrow morning", `At ${(i % 12) + 1}:00 PM`, "At midnight", "Next week"],
    ans: 1,
    exp: `The speaker indicates the inspection is scheduled for ${(i % 12) + 1}:00 PM.`
  }),
  (f: number, i: number) => ({
    context: `All personnel ordered to report to Motor Pool ${(i % 6) + 1} must bring their signed maintenance authorization forms.`,
    contextEs: `Todo el personal ordenado a presentarse en el Parque Automotor ${(i % 6) + 1} debe traer sus formularios de mantenimiento firmados.`,
    q: `What document must personnel bring to Motor Pool ${(i % 6) + 1}?`,
    qEs: `¿Qué documento debe llevar el personal al Parque Automotor ${(i % 6) + 1}?`,
    opts: ["Medical prescription", "Signed maintenance authorization forms", "Personal civilian passport", "Lunch vouchers"],
    ans: 1,
    exp: "The announcement requires signed maintenance authorization forms."
  }),
  (f: number, i: number) => ({
    context: `The supply convoy was delayed by ${20 + (i % 40)} minutes due to road construction on Highway ${i % 9 + 1}.`,
    contextEs: `El convoy de suministros se retrasó ${20 + (i % 40)} minutos debido a obras viales en la Carretera ${i % 9 + 1}.`,
    q: `Why was the supply convoy held up on Highway ${i % 9 + 1}?`,
    qEs: `¿Por qué se retrasó el convoy de suministros en la Carretera ${i % 9 + 1}?`,
    opts: ["Engine mechanical failure", "Road construction work", "Lack of diesel fuel", "Driver took the wrong exit"],
    ans: 1,
    exp: "Road construction on the highway caused the delay."
  }),
  (f: number, i: number) => ({
    context: `Where did you leave the keys to vehicle ${i}? They are hanging on the board in the dispatcher office.`,
    contextEs: `¿Dónde dejaste las llaves del vehículo ${i}? Están colgadas en el tablero de la oficina de despacho.`,
    q: `Where can the keys to vehicle ${i} be found?`,
    qEs: `¿Dónde se pueden encontrar las llaves del vehículo ${i}?`,
    opts: ["Inside the driver's pocket", "On the board in the dispatcher office", "Under the front seat", "At the guard post"],
    ans: 1,
    exp: "The keys are hanging on the board in the dispatcher office."
  }),
  (f: number, i: number) => ({
    context: `The medical officer placed Sergeant Miller on light duty for ${(i % 5) + 2} days following his knee injury.`,
    contextEs: `El médico militar asignó al Sargento Miller a servicio liviano durante ${(i % 5) + 2} días tras su lesión en la rodilla.`,
    q: `What medical duty status was assigned to the sergeant?`,
    qEs: `¿Qué condición médica de servicio se le asignó al sargento?`,
    opts: ["Immediate overseas deployment", `Light duty for ${(i % 5) + 2} days`, "Rigorous obstacle course training", "Honorable discharge"],
    ans: 1,
    exp: `The physician assigned light duty status for ${(i % 5) + 2} days.`
  }),
  (f: number, i: number) => ({
    context: `Runway ${(i % 36) + 1} is currently unavailable due to maintenance crew repairing the edge lights.`,
    contextEs: `La Pista ${(i % 36) + 1} no está disponible actualmente debido a que la cuadrilla repara las luces de borde.`,
    q: `What is the current operational status of Runway ${(i % 36) + 1}?`,
    qEs: `¿Cuál es el estado operativo actual de la Pista ${(i % 36) + 1}?`,
    opts: ["Cleared for emergency landing", "Closed for edge light repairs", "Open for cargo flights only", "Under enemy fire"],
    ans: 1,
    exp: "The runway is unavailable because edge lights are undergoing repair."
  }),
  (f: number, i: number) => ({
    context: `Did you finish calibrating the radar antenna for Station ${i}? Yes, all diagnostic signals are within normal limits.`,
    contextEs: `¿Terminaste de calibrar la antena de radar de la Estación ${i}? Sí, todas las señales diagnósticas están dentro de los límites normales.`,
    q: `What was the outcome of the diagnostic check at Station ${i}?`,
    qEs: `¿Cuál fue el resultado de la revisión diagnóstica en la Estación ${i}?`,
    opts: ["The antenna is broken", "All signals are normal and calibrated", "The power unit burned out", "Parts are missing"],
    ans: 1,
    exp: "Signals within normal limits confirm successful calibration."
  }),
  (f: number, i: number) => ({
    context: `Private Jenkins was late for muster because his alarm failed to go off at ${(i % 4) + 5}:00 AM.`,
    contextEs: `El soldado Jenkins llegó tarde a la formación matutina porque su alarma no sonó a las ${(i % 4) + 5}:00 AM.`,
    q: `Why did Private Jenkins arrive late for morning muster?`,
    qEs: `¿Por qué llegó tarde el soldado Jenkins a la formación matutina?`,
    opts: ["His alarm failed to ring", "Traffic was heavy", "He was at the hospital", "He got lost"],
    ans: 0,
    exp: "His alarm failed to go off in the morning."
  })
];

// 10 distinct reading categories parameterized by formula and question index
const readingGenerators = [
  (f: number, i: number) => ({
    q: "The battalion commander instructed that all recruits ___ their uniforms prior to inspection.",
    opts: ["clean and press", "cleaning and pressing", "cleaned and pressed", "to clean and press"],
    ans: 0,
    exp: "Subjunctive clause structure following 'instructed that' requires the base verb ('clean and press')."
  }),
  (f: number, i: number) => ({
    q: `If the transport aircraft ___ fuel before reaching base, it will divert to Airfield ${String.fromCharCode(65 + (i % 26))}.`,
    opts: ["runs low on", "ran low on", "will run low on", "had run low on"],
    ans: 0,
    exp: "First conditional rule requires present simple ('runs low on') in the if-clause."
  }),
  (f: number, i: number) => ({
    q: `Sergeant Gomez has served as a communications technician ___ ${(i % 8) + 2} years.`,
    opts: ["since", "for", "during", "at"],
    ans: 1,
    exp: "Duration of time is expressed with 'for'."
  }),
  (f: number, i: number) => ({
    q: "Choose the word closest in meaning to 'mandatory': Daily attendance at roll call is mandatory.",
    opts: ["optional", "compulsory", "voluntary", "suggested"],
    ans: 1,
    exp: "'Mandatory' means compulsory or required by military regulation."
  }),
  (f: number, i: number) => ({
    q: "The military vehicle ___ by certified mechanics at the depot last Friday.",
    opts: ["was serviced", "servicing", "has serviced", "will service"],
    ans: 0,
    exp: "Passive voice in simple past: was + past participle ('was serviced')."
  }),
  (f: number, i: number) => ({
    q: "All soldiers assigned to the firing range ___ wear protective ear defenders.",
    opts: ["must", "ought", "able to", "capable to"],
    ans: 0,
    exp: "'Must' expresses an absolute military obligation without 'to'."
  }),
  (f: number, i: number) => ({
    q: "Choose the antonym for 'hazard': The oil spill on the hangar floor was considered a hazard.",
    opts: ["peril", "safety measure", "danger", "obstacle"],
    ans: 1,
    exp: "The opposite of 'hazard' (danger/risk) is a safety measure or security."
  }),
  (f: number, i: number) => ({
    q: "The squad leader showed the new arrivals where ___ their field duffle bags.",
    opts: ["to place", "placing", "placed of", "placement to"],
    ans: 0,
    exp: "Indirect instructional infinitive: 'where to place'."
  }),
  (f: number, i: number) => ({
    q: "By the time the convoy departs next morning, the mechanics ___ the engine overhaul.",
    opts: ["will have finished", "finish", "finished", "had finished"],
    ans: 0,
    exp: "Future perfect ('will have finished') denotes an action completed before a future time."
  }),
  (f: number, i: number) => ({
    q: "Choose the synonym for 'halt': The guard ordered the unknown vehicle to halt immediately.",
    opts: ["accelerate", "stop", "proceed", "reverse"],
    ans: 1,
    exp: "'Halt' means to bring to a stop."
  })
];

export function getFormulaQuestions(formulaNum: number): Question[] {
  const safeFormula = Math.min(100, Math.max(1, formulaNum));
  const questions: Question[] = [];

  // Part 1: Listening (Questions 1 to 60)
  for (let i = 1; i <= 60; i++) {
    const templateFn = listeningGenerators[(i - 1) % listeningGenerators.length];
    const data = templateFn(safeFormula, i);

    // Audio reads ONLY context + question
    const audioScript = cleanAudioPrompt(`${data.context} ${data.q}`);

    questions.push({
      id: i,
      formula: safeFormula,
      formulaName: `Fórmula ${safeFormula}`,
      type: "listening",
      context: data.context,
      contextEs: data.contextEs,
      question: data.q,
      questionEs: data.qEs,
      textToSpeak: audioScript,
      options: data.opts,
      correctAnswer: data.ans,
      image: null,
      explanation: data.exp,
    });
  }

  // Part 2: Reading (Questions 61 to 100)
  for (let i = 61; i <= 100; i++) {
    const templateFn = readingGenerators[(i - 61) % readingGenerators.length];
    const data = templateFn(safeFormula, i);

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
