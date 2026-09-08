import { ConanAccessory } from "./types";

export const CONAN_ACCESSORIES: ConanAccessory[] = [
  {
    id: "sunglasses",
    name: "Gafas Tácticas de Sol",
    emoji: "🕶️",
    category: "eyes",
    description: "Para proteger la visión en misiones de alta intensidad bajo el sol.",
    price: 50,
  },
  {
    id: "beret",
    name: "Boina Militar de Comando",
    emoji: "🎖️",
    category: "head",
    description: "Distintivo de liderazgo táctico y disciplina operacional.",
    price: 100,
  },
  {
    id: "grad_hat",
    name: "Birrete Académico",
    emoji: "🎓",
    category: "head",
    description: "Otorgado a los cadetes que dominan la gramática y el listening.",
    price: 150,
  },
  {
    id: "headphones",
    name: "Audífonos de Radio Piloto",
    emoji: "🎧",
    category: "head",
    description: "Optimizado para escuchar transmisiones de radio nítidas en inglés.",
    price: 200,
  },
  {
    id: "scarf",
    name: "Pañuelo Camuflado Táctico",
    emoji: "🧣",
    category: "neck",
    description: "Elegante pañuelo para operaciones en terrenos montañosos y desérticos.",
    price: 250,
  },
  {
    id: "pilot_goggles",
    name: "Gafas de Aviador de Caza",
    emoji: "🥽",
    category: "eyes",
    description: "Diseñado para pilotos tácticos con reflejos supersónicos.",
    price: 300,
  },
  {
    id: "crown",
    name: "Corona Dorada de Campeón",
    emoji: "👑",
    category: "special",
    description: "La joya suprema del ALCPT. ¡Solo para la élite de Conan!",
    price: 500,
    isProOnly: true,
  },
];

export const MILITARY_RANKS = [
  { level: 1, name: "PVT K9 • Recruit Pup", minXp: 0, badge: "🐾", usGrade: "E-1 Private", desc: "Recluta canino en adiestramiento básico de obediencia y señales tácticas." },
  { level: 2, name: "PFC K9 • Scout Dog", minXp: 150, badge: "🥉", usGrade: "E-3 Private First Class", desc: "Perro rastreador de vanguardia para detección de objetivos." },
  { level: 3, name: "SPC K9 • Patrol Specialist", minXp: 400, badge: "🎖️", usGrade: "E-4 Specialist", desc: "Especialista canino en seguridad perimétrica y rondas tácticas." },
  { level: 4, name: "SGT K9 • Tactical Sentry Dog", minXp: 800, badge: "⭐", usGrade: "E-5 Sergeant", desc: "Sargento K9 de centinela y patrulla armada con certificación de combate." },
  { level: 5, name: "SSG K9 • Combat Assault K9", minXp: 1500, badge: "⭐⭐", usGrade: "E-6 Staff Sergeant", desc: "Líder canino de escuadra para asalto táctico y neutralización rápida." },
  { level: 6, name: "SFC K9 • Search & Rescue Lead", minXp: 2600, badge: "⭐⭐⭐", usGrade: "E-7 Sergeant First Class", desc: "Sargento Primero canino, especialista jefe en búsqueda, rescate y radio." },
  { level: 7, name: "1SG K9 • Operations Master Dog", minXp: 4200, badge: "🏅", usGrade: "E-8 First Sergeant", desc: "Primer Sargento canino a cargo de la disciplina y disciplina de compañía." },
  { level: 8, name: "CSM K9 • Command Sergeant Major", minXp: 6500, badge: "🛡️", usGrade: "E-9 Command Sergeant Major", desc: "Suboficial mayor canino superior, consejero táctico del comando." },
  { level: 9, name: "CPT K9 • Special Recon Commander", minXp: 9500, badge: "💎", usGrade: "O-3 Captain", desc: "Oficial canino al mando de misiones de reconocimiento avanzado." },
  { level: 10, name: "COL K9 • Brigade Chief Canine", minXp: 13000, badge: "🦅", usGrade: "O-6 Colonel", desc: "Coronel canino al mando de todas las brigadas tácticas K9." },
  { level: 11, name: "GEN Conan • Supreme K9 Commander", minXp: 18000, badge: "👑", usGrade: "O-10 General", desc: "Comandante General Supremo K9 de todas las fuerzas militares Conan." },
];

export function getRankByXp(xp: number) {
  let currentRank = MILITARY_RANKS[0];
  let nextRank = MILITARY_RANKS[1];

  for (let i = MILITARY_RANKS.length - 1; i >= 0; i--) {
    if (xp >= MILITARY_RANKS[i].minXp) {
      currentRank = MILITARY_RANKS[i];
      nextRank = MILITARY_RANKS[i + 1] || null;
      break;
    }
  }

  const prevXp = currentRank.minXp;
  const targetXp = nextRank ? nextRank.minXp : currentRank.minXp;
  const progress = nextRank
    ? Math.min(100, Math.max(0, Math.round(((xp - prevXp) / (targetXp - prevXp)) * 100)))
    : 100;

  return {
    currentRank,
    nextRank,
    progress,
  };
}
