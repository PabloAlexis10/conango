export interface DefinitionCard {
  id: number;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaningEs: string;
  correctDefinition: string;
  example: string;
}

export interface MatchingPair {
  id: number;
  spanish: string;
  english: string;
  category: string;
}

// 1. Pronunciation / Vocabulary Cards (Word in English -> Phonetic, Meaning in Spanish & English Definition)
export const definitionCards: DefinitionCard[] = [
  {
    id: 1,
    word: "Mandatory",
    phonetic: "/ˈmæn.də.tɔːr.i/",
    partOfSpeech: "Adjective",
    meaningEs: "Obligatorio / Compulsorio",
    correctDefinition: "Compulsory; required by rule or regulation",
    example: "Morning muster attendance is mandatory for all personnel."
  },
  {
    id: 2,
    word: "Hazard",
    phonetic: "/ˈhæz.ɚd/",
    partOfSpeech: "Noun",
    meaningEs: "Peligro / Riesgo",
    correctDefinition: "A danger, peril, or potential source of harm",
    example: "The fuel spill on the hangar ramp was a fire hazard."
  },
  {
    id: 3,
    word: "Halt",
    phonetic: "/hɑːlt/",
    partOfSpeech: "Verb",
    meaningEs: "Detenerse / Alto",
    correctDefinition: "To stop moving or bring an action to a stop",
    example: "The sentry ordered the unknown vehicle to halt."
  },
  {
    id: 4,
    word: "Fall in",
    phonetic: "/fɑːl ɪn/",
    partOfSpeech: "Phrasal Verb",
    meaningEs: "Formar fila / Alinearse",
    correctDefinition: "To assemble and form straight lines",
    example: "The sergeant ordered the squad to fall in immediately."
  },
  {
    id: 5,
    word: "Muster",
    phonetic: "/ˈmʌs.tɚ/",
    partOfSpeech: "Noun / Verb",
    meaningEs: "Pase de lista / Formación",
    correctDefinition: "A formal assembly of personnel for roll call",
    example: "All personnel assembled on the field for morning muster."
  },
  {
    id: 6,
    word: "Overhaul",
    phonetic: "/ˈoʊ.vɚ.hɑːl/",
    partOfSpeech: "Noun / Verb",
    meaningEs: "Reparación general / Mantenimiento mayor",
    correctDefinition: "To inspect thoroughly and make all necessary repairs",
    example: "The transport aircraft underwent a full engine overhaul."
  },
  {
    id: 7,
    word: "Runway",
    phonetic: "/ˈrʌn.weɪ/",
    partOfSpeech: "Noun",
    meaningEs: "Pista de aterrizaje",
    correctDefinition: "A level strip of ground on which aircraft take off and land",
    example: "Runway 24 is cleared for immediate landing."
  },
  {
    id: 8,
    word: "Altitude",
    phonetic: "/ˈæl.tə.tuːd/",
    partOfSpeech: "Noun",
    meaningEs: "Altitud / Altura de vuelo",
    correctDefinition: "Height above sea level or ground level",
    example: "Maintain an altitude of fifteen thousand feet."
  },
  {
    id: 9,
    word: "Clearance",
    phonetic: "/ˈklɪr.əns/",
    partOfSpeech: "Noun",
    meaningEs: "Autorización / Permiso",
    correctDefinition: "Official authorization for flight or movement",
    example: "The pilot received clearance for departure on runway one."
  },
  {
    id: 10,
    word: "Detour",
    phonetic: "/ˈdiː.tʊr/",
    partOfSpeech: "Noun / Verb",
    meaningEs: "Desvío / Ruta alternativa",
    correctDefinition: "A roundabout way or alternate route taken to avoid an obstacle",
    example: "Due to road construction, the convoy took a detour."
  },
  {
    id: 11,
    word: "Briefing",
    phonetic: "/ˈbriː.fɪŋ/",
    partOfSpeech: "Noun",
    meaningEs: "Reunión informativa / Instrucciones",
    correctDefinition: "A meeting for giving essential information or instructions",
    example: "The morning weather briefing begins at zero eight hundred."
  },
  {
    id: 12,
    word: "Roger",
    phonetic: "/ˈrɑː.dʒɚ/",
    partOfSpeech: "Radio term",
    meaningEs: "Comprendido / Entendido",
    correctDefinition: "Received and understood all of your last transmission",
    example: "Tower, roger that, turning left heading two-seven-zero."
  },
  {
    id: 13,
    word: "Mayday",
    phonetic: "/ˈmeɪ.deɪ/",
    partOfSpeech: "Emergency call",
    meaningEs: "Llamada de socorro / Emergencia",
    correctDefinition: "An international radio distress signal used by aircraft and ships",
    example: "Mayday, mayday, flight 402 has lost engine power."
  },
  {
    id: 14,
    word: "Ceiling",
    phonetic: "/ˈsiː.lɪŋ/",
    partOfSpeech: "Noun (Aviation)",
    meaningEs: "Techo de nubes",
    correctDefinition: "The altitude of the lowest layer of clouds covering the sky",
    example: "The cloud ceiling dropped to eight hundred feet."
  },
  {
    id: 15,
    word: "Altimeter",
    phonetic: "/ælˈtɪm.ə.t̬ɚ/",
    partOfSpeech: "Noun",
    meaningEs: "Altímetro",
    correctDefinition: "An instrument for measuring altitude above sea level",
    example: "The pilot calibrated the altimeter to current barometric pressure."
  },
  {
    id: 16,
    word: "Approach",
    phonetic: "/əˈproʊtʃ/",
    partOfSpeech: "Noun / Verb",
    meaningEs: "Aproximación para aterrizar",
    correctDefinition: "The final descent path of an aircraft coming in to land",
    example: "Flight 105 is on final approach to runway three."
  },
  {
    id: 17,
    word: "Crosswind",
    phonetic: "/ˈkrɑːs.wɪnd/",
    partOfSpeech: "Noun",
    meaningEs: "Viento cruzado",
    correctDefinition: "Wind blowing across the direction of aircraft travel",
    example: "Landing required caution due to strong crosswinds."
  },
  {
    id: 18,
    word: "Wilco",
    phonetic: "/ˈwɪl.koʊ/",
    partOfSpeech: "Radio term",
    meaningEs: "Cumpliré / Recibido y ejecutaré",
    correctDefinition: "Will comply; message received and will be carried out",
    example: "Descend to flight level one-eight-zero, wilco."
  },
  {
    id: 19,
    word: "Heading",
    phonetic: "/ˈhed.ɪŋ/",
    partOfSpeech: "Noun (Navigation)",
    meaningEs: "Rumbo",
    correctDefinition: "The compass direction in which an aircraft or vessel is pointing",
    example: "Fly heading zero-nine-zero degrees."
  },
  {
    id: 20,
    word: "Checkpoint",
    phonetic: "/ˈtʃek.pɔɪnt/",
    partOfSpeech: "Noun",
    meaningEs: "Puesto de control",
    correctDefinition: "A barrier or station where travelers are stopped for inspection",
    example: "Show your identification card at the security checkpoint."
  }
];

// 2. Matching Pairs (Spanish ↔ English) - 50+ rich pairs
export const matchingPairs: MatchingPair[] = [
  // Colores y básicos (ejemplo solicitado: rojo - red)
  { id: 1, spanish: "Rojo", english: "Red", category: "Colores y Básicos" },
  { id: 2, spanish: "Azul", english: "Blue", category: "Colores y Básicos" },
  { id: 3, spanish: "Verde", english: "Green", category: "Colores y Básicos" },
  { id: 4, spanish: "Amarillo", english: "Yellow", category: "Colores y Básicos" },
  { id: 5, spanish: "Negro", english: "Black", category: "Colores y Básicos" },
  { id: 6, spanish: "Blanco", english: "White", category: "Colores y Básicos" },
  { id: 7, spanish: "Gris", english: "Gray", category: "Colores y Básicos" },
  { id: 8, spanish: "Naranja", english: "Orange", category: "Colores y Básicos" },

  // Vocabulario esencial & ALCPT
  { id: 9, spanish: "Peligro", english: "Hazard", category: "General & ALCPT" },
  { id: 10, spanish: "Obligatorio", english: "Mandatory", category: "General & ALCPT" },
  { id: 11, spanish: "Detenerse", english: "Halt", category: "General & ALCPT" },
  { id: 12, spanish: "Formar fila", english: "Fall in", category: "General & ALCPT" },
  { id: 13, spanish: "Pase de lista", english: "Muster", category: "General & ALCPT" },
  { id: 14, spanish: "Retraso", english: "Delay", category: "General & ALCPT" },
  { id: 15, spanish: "Reparación general", english: "Overhaul", category: "General & ALCPT" },
  { id: 16, spanish: "Desvío", english: "Detour", category: "General & ALCPT" },
  { id: 17, spanish: "Instrucciones", english: "Briefing", category: "General & ALCPT" },
  { id: 18, spanish: "Autorización", english: "Clearance", category: "General & ALCPT" },

  // Aviación y Navegación
  { id: 19, spanish: "Pista de aterrizaje", english: "Runway", category: "Aviación" },
  { id: 20, spanish: "Altitud", english: "Altitude", category: "Aviación" },
  { id: 21, spanish: "Despegar", english: "Take off", category: "Aviación" },
  { id: 22, spanish: "Aterrizar", english: "Land", category: "Aviación" },
  { id: 23, spanish: "Aproximación", english: "Approach", category: "Aviación" },
  { id: 24, spanish: "Rumbo", english: "Heading", category: "Aviación" },
  { id: 25, spanish: "Viento cruzado", english: "Crosswind", category: "Aviación" },
  { id: 26, spanish: "Techo de nubes", english: "Ceiling", category: "Aviación" },
  { id: 27, spanish: "Niebla", english: "Fog", category: "Clima" },
  { id: 28, spanish: "Lluvia intensa", english: "Heavy rain", category: "Clima" },
  { id: 29, spanish: "Tormenta", english: "Thunderstorm", category: "Clima" },
  { id: 30, spanish: "Despejado", english: "Clear sky", category: "Clima" },

  // Mantenimiento, Herramientas & Logística
  { id: 31, spanish: "Combustible", english: "Fuel", category: "Mantenimiento" },
  { id: 32, spanish: "Herramienta", english: "Tool", category: "Mantenimiento" },
  { id: 33, spanish: "Llave de tuercas", english: "Wrench", category: "Mantenimiento" },
  { id: 34, spanish: "Destornillador", english: "Screwdriver", category: "Mantenimiento" },
  { id: 35, spanish: "Batería", english: "Battery", category: "Mantenimiento" },
  { id: 36, spanish: "Fuga", english: "Leak", category: "Mantenimiento" },
  { id: 37, spanish: "Repuesto", english: "Spare part", category: "Mantenimiento" },
  { id: 38, spanish: "Almacén", english: "Warehouse", category: "Logística" },
  { id: 39, spanish: "Suministros", english: "Supplies", category: "Logística" },
  { id: 40, spanish: "Envío", english: "Shipment", category: "Logística" },

  // Acciones y Comandos cotidianos
  { id: 41, spanish: "Apagar", english: "Turn off", category: "Comandos" },
  { id: 42, spanish: "Encender", english: "Turn on", category: "Comandos" },
  { id: 43, spanish: "Acelerar", english: "Speed up", category: "Comandos" },
  { id: 44, spanish: "Reducir velocidad", english: "Slow down", category: "Comandos" },
  { id: 45, spanish: "Subir", english: "Climb", category: "Comandos" },
  { id: 46, spanish: "Descender", english: "Descend", category: "Comandos" },
  { id: 47, spanish: "Girar a la izquierda", english: "Turn left", category: "Comandos" },
  { id: 48, spanish: "Girar a la derecha", english: "Turn right", category: "Comandos" },
  { id: 49, spanish: "Mantener", english: "Maintain", category: "Comandos" },
  { id: 50, spanish: "Proceder", english: "Proceed", category: "Comandos" }
];
