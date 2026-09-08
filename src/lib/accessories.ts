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
  { level: 1, name: "Recluta Táctico", minXp: 0, badge: "🥉" },
  { level: 2, name: "Soldado Primero", minXp: 150, badge: "🎖️" },
  { level: 3, name: "Cabo de Escuadra", minXp: 400, badge: "⭐" },
  { level: 4, name: "Sargento Segundo", minXp: 800, badge: "⭐⭐" },
  { level: 5, name: "Suboficial Mayor", minXp: 1500, badge: "⭐⭐⭐" },
  { level: 6, name: "Teniente de Operaciones", minXp: 2600, badge: "🏅" },
  { level: 7, name: "Capitán de Vuelo", minXp: 4200, badge: "💎" },
  { level: 8, name: "Mayor de Inteligencia", minXp: 6500, badge: "🛡️" },
  { level: 9, name: "Coronel en Jefe", minXp: 9500, badge: "🦅" },
  { level: 10, name: "General Supremo Conan", minXp: 14000, badge: "👑" },
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
