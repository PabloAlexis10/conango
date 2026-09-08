export interface DefinitionCard {
  id: number;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  correctDefinition: string;
  options: string[];
  example: string;
}

export interface MatchingPair {
  id: number;
  spanish: string;
  english: string;
  category: string;
}

// 1. Definition Flashcards (Word in English -> Definition in English)
export const definitionCards: DefinitionCard[] = [
  {
    id: 1,
    word: "Mandatory",
    phonetic: "/ˈmæn.də.tɔːr.i/",
    partOfSpeech: "Adjective",
    correctDefinition: "Compulsory; required by rule or military regulation",
    options: [
      "Compulsory; required by rule or military regulation",
      "Suggested but voluntary for recruits",
      "Permitted only on weekends",
      "Completed in small civilian groups"
    ],
    example: "Morning muster attendance is mandatory for all personnel."
  },
  {
    id: 2,
    word: "Hazard",
    phonetic: "/ˈhæz.əd/",
    partOfSpeech: "Noun",
    correctDefinition: "A danger, peril, or potential source of harm",
    options: [
      "A standard safety regulation",
      "A danger, peril, or potential source of harm",
      "A mechanical tool used for tire repair",
      "A designated landing runway"
    ],
    example: "The fuel spill on the hangar ramp was a fire hazard."
  },
  {
    id: 3,
    word: "Halt",
    phonetic: "/hɔːlt/",
    partOfSpeech: "Verb",
    correctDefinition: "To stop moving or bring an action to a stop",
    options: [
      "To accelerate through a crossroads",
      "To turn left at an intersection",
      "To stop moving or bring an action to a stop",
      "To sound the alarm siren"
    ],
    example: "The sentry ordered the unknown vehicle to halt."
  },
  {
    id: 4,
    word: "Fall in",
    phonetic: "/fɔːl ɪn/",
    partOfSpeech: "Phrasal Verb",
    correctDefinition: "To form lines or assemble in military formation",
    options: [
      "To form lines or assemble in military formation",
      "To dismiss troops after evening muster",
      "To report an aircraft engine failure",
      "To clean the barracks floor"
    ],
    example: "The drill sergeant ordered the platoon to fall in immediately."
  },
  {
    id: 5,
    word: "Muster",
    phonetic: "/ˈmʌs.tər/",
    partOfSpeech: "Noun / Verb",
    correctDefinition: "A formal gathering or assembly of troops for roll call",
    options: [
      "A formal gathering or assembly of troops for roll call",
      "A medical quarantine facility",
      "A combat vehicle maintenance checklist",
      "A field ration cooking kit"
    ],
    example: "All soldiers assembled on the parade ground for 0600 muster."
  },
  {
    id: 6,
    word: "Overhaul",
    phonetic: "/ˈoʊ.vɚ.hɑːl/",
    partOfSpeech: "Noun / Verb",
    correctDefinition: "To examine thoroughly and make all necessary repairs",
    options: [
      "To inspect superficially without tools",
      "To examine thoroughly and make all necessary repairs",
      "To cancel a scheduled flight route",
      "To discard expired equipment"
    ],
    example: "The helicopter engine required a complete overhaul after 500 flight hours."
  },
  {
    id: 7,
    word: "Light duty",
    phonetic: "/laɪt ˈduː.t̬i/",
    partOfSpeech: "Noun Phrase",
    correctDefinition: "Assignment to less physically demanding work due to injury",
    options: [
      "Assignment to less physically demanding work due to injury",
      "Night patrol guard duties along the fence",
      "Overtime work during combat exercises",
      "Inspection duties performed by senior officers"
    ],
    example: "The medical officer placed Private Gomez on light duty for five days."
  },
  {
    id: 8,
    word: "Relieve",
    phonetic: "/rɪˈliːv/",
    partOfSpeech: "Verb",
    correctDefinition: "To take over a post, shift, or duty from another person",
    options: [
      "To punish a subordinate for tardiness",
      "To take over a post, shift, or duty from another person",
      "To request medical leave overseas",
      "To clean military weapons in the armory"
    ],
    example: "Corporal Vance arrived at midnight to relieve the guard at the gate."
  },
  {
    id: 9,
    word: "Figure out",
    phonetic: "/ˈfɪɡ.jɚ aʊt/",
    partOfSpeech: "Phrasal Verb",
    correctDefinition: "To understand, solve, or discover through thinking",
    options: [
      "To misunderstand operating instructions",
      "To assemble a mechanical rifle",
      "To understand, solve, or discover through thinking",
      "To shout an urgent warning"
    ],
    example: "The technician managed to figure out why the radar was malfunctioning."
  },
  {
    id: 10,
    word: "Accounted for",
    phonetic: "/əˈkaʊn.t̬ɪd fɔːr/",
    partOfSpeech: "Adjective Phrase",
    correctDefinition: "Checked, verified, and confirmed to be present",
    options: [
      "Missing or stolen from the supply depot",
      "Checked, verified, and confirmed to be present",
      "Sold to civilian contractors",
      "Expired and ready for disposal"
    ],
    example: "Every rifle in the battalion armory has been accounted for."
  },
  {
    id: 11,
    word: "Step on the gas",
    phonetic: "/step ɑːn ðə ɡæs/",
    partOfSpeech: "Idiom",
    correctDefinition: "To accelerate or hurry up to make up lost time",
    options: [
      "To fill the vehicle tank with diesel",
      "To inspect the brakes for fluid leaks",
      "To accelerate or hurry up to make up lost time",
      "To park the vehicle inside the garage"
    ],
    example: "We are behind schedule, so step on the gas!"
  },
  {
    id: 12,
    word: "In top shape",
    phonetic: "/ɪn tɑːp ʃeɪp/",
    partOfSpeech: "Idiom",
    correctDefinition: "In prime physical condition and excellent health",
    options: [
      "Severely injured during obstacle training",
      "In prime physical condition and excellent health",
      "Needing immediate medical hospitalization",
      "Recovering from a severe knee fracture"
    ],
    example: "After eight weeks of boot camp, the cadet is in top shape."
  },
  {
    id: 13,
    word: "Detour",
    phonetic: "/ˈdiː.tʊr/",
    partOfSpeech: "Noun",
    correctDefinition: "A roundabout or temporary alternate route",
    options: [
      "A primary straight highway",
      "A roundabout or temporary alternate route",
      "A military airbase landing strip",
      "A bridge destruction alert"
    ],
    example: "Due to bridge repairs on Highway 4, the convoy took a detour."
  },
  {
    id: 14,
    word: "Give a hand",
    phonetic: "/ɡɪv ə hænd/",
    partOfSpeech: "Idiom",
    correctDefinition: "To provide assistance or help someone with work",
    options: [
      "To salute a superior officer with the right hand",
      "To shake hands during an official ceremony",
      "To provide assistance or help someone with work",
      "To hand over personal identification"
    ],
    example: "Can you give me a hand unloading these ammunition crates?"
  },
  {
    id: 15,
    word: "Touch-and-go",
    phonetic: "/ˈtʌtʃ.ən.ɡoʊ/",
    partOfSpeech: "Noun / Adjective",
    correctDefinition: "An aircraft landing followed immediately by takeoff",
    options: [
      "An aircraft landing followed immediately by takeoff",
      "An emergency ejection procedure",
      "A radio transmission protocol",
      "A pre-flight fuel check"
    ],
    example: "Student pilots performed touch-and-go landings for two hours."
  }
];

// 2. Matching Pairs (Spanish ↔ English)
export const matchingPairs: MatchingPair[] = [
  // Basics & Colors (As requested by user: rojo - red)
  { id: 1, spanish: "Rojo", english: "Red", category: "Colores y Básicos" },
  { id: 2, spanish: "Azul", english: "Blue", category: "Colores y Básicos" },
  { id: 3, spanish: "Verde", english: "Green", category: "Colores y Básicos" },
  { id: 4, spanish: "Amarillo", english: "Yellow", category: "Colores y Básicos" },
  { id: 5, spanish: "Negro", english: "Black", category: "Colores y Básicos" },
  { id: 6, spanish: "Blanco", english: "White", category: "Colores y Básicos" },

  // Essential Military & Technical Vocabulary
  { id: 7, spanish: "Peligro", english: "Hazard", category: "Táctico & ALCPT" },
  { id: 8, spanish: "Obligatorio", english: "Mandatory", category: "Táctico & ALCPT" },
  { id: 9, spanish: "Detenerse", english: "Halt", category: "Táctico & ALCPT" },
  { id: 10, spanish: "Formar fila", english: "Fall in", category: "Táctico & ALCPT" },
  { id: 11, spanish: "Pase de lista", english: "Muster", category: "Táctico & ALCPT" },
  { id: 12, spanish: "Retraso", english: "Delay", category: "Táctico & ALCPT" },
  { id: 13, spanish: "Reparación general", english: "Overhaul", category: "Táctico & ALCPT" },
  { id: 14, spanish: "Desvío", english: "Detour", category: "Táctico & ALCPT" },
  { id: 15, spanish: "Pista de aterrizaje", english: "Runway", category: "Aviación" },
  { id: 16, spanish: "Altitud", english: "Altitude", category: "Aviación" },
  { id: 17, spanish: "Despegar", english: "Take off", category: "Aviación" },
  { id: 18, spanish: "Aterrizar", english: "Land", category: "Aviación" },
  { id: 19, spanish: "Combustible", english: "Fuel", category: "Mantenimiento" },
  { id: 20, spanish: "Herramienta", english: "Tool", category: "Mantenimiento" },
  { id: 21, spanish: "Apagar", english: "Turn off", category: "Comandos" },
  { id: 22, spanish: "Encender", english: "Turn on", category: "Comandos" },
  { id: 23, spanish: "Acelerar", english: "Speed up", category: "Comandos" },
  { id: 24, spanish: "Reducir velocidad", english: "Slow down", category: "Comandos" }
];
