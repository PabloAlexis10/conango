import { ShopPowerUp, DiamondPack } from "./types";

// POCIONES MÁGICAS DE LA TIENDA (ESTILO HARRY POTTER)
export const MAGIC_POTIONS: ShopPowerUp[] = [
  {
    id: "double_xp_15",
    name: "Poción Multijugos (Doble XP ⚡)",
    emoji: "🧪",
    category: "booster",
    description: "Multiplica por 2 toda la experiencia (XP) obtenida en evaluaciones y lecciones durante 15 minutos. ¡Exclusiva para personal registrado!",
    priceGems: 100,
    priceClp: 990,
  },
  {
    id: "streak_freeze",
    name: "Poción Félix Felicis (Suerte Líquida ❄️)",
    emoji: "🧪",
    category: "streak",
    description: "Protector de racha mágica. Si un día no puedes entrenar, tu racha de fuego 🔥 queda congelada y 100% protegida.",
    priceGems: 200,
    priceClp: 1490,
  },
  {
    id: "refill_hearts",
    name: "Poción Vigorizante (Recarga de Vidas ❤️)",
    emoji: "🧪",
    category: "hearts",
    description: "Restaura inmediatamente tus 5 vidas al 100% para continuar practicando sin interrupciones.",
    priceGems: 150,
    priceClp: 990,
  },
  {
    id: "conan_pro_pass",
    name: "Elixir de la Inmortalidad (Piedra Filosofal 👑)",
    emoji: "⚗️",
    category: "pro",
    description: "Membresía Conan PRO: Vidas infinitas (∞), cero anuncios en toda la plataforma y potenciador 2x XP permanente.",
    priceGems: 0,
    priceClp: 4990,
  },
];

// PAQUETES DE DIAMANTES / GEMAS TÁCTICAS PARA COMPRAR CON DINERO REAL
export const DIAMOND_PACKS: DiamondPack[] = [
  {
    id: "pack_150_gems",
    name: "Bolsa Táctica de Diamantes",
    emoji: "💎",
    gemsCount: 150,
    priceClp: 990,
    description: "Ideal para adquirir pociones de Doble XP y recargas de vidas de emergencia.",
  },
  {
    id: "pack_600_gems",
    name: "Cofre de Oficial de Diamantes",
    emoji: "💎✨",
    gemsCount: 600,
    bonusText: "+25% Extra",
    priceClp: 2990,
    popular: true,
    description: "Excelente balance para equiparte con pociones mágicas y proteger tu racha.",
  },
  {
    id: "pack_2000_gems",
    name: "Bóveda General de la USAF",
    emoji: "💎👑",
    gemsCount: 2000,
    bonusText: "+50% Extra",
    priceClp: 7990,
    description: "El arsenal de diamantes definitivo para todo tu entrenamiento militar.",
  },
];

// Alias para compatibilidad hacia atrás
export const DUOLINGO_POWERUPS = MAGIC_POTIONS;

// ESCALA OFICIAL DE GRADOS DE LA FUERZA AÉREA DE ESTADOS UNIDOS (USAF - PERSONAS) EN INGLÉS
export const MILITARY_RANKS = [
  // Clases / Personal Alistado (Enlisted Airmen)
  { level: 1, name: "Airman Basic", abbr: "AB", minXp: 0, badge: "🪖", usGrade: "Airman Basic", desc: "Nivel inicial de instrucción militar y aprendizaje básico de aviación." },
  { level: 2, name: "Airman", abbr: "Amn", minXp: 50, badge: "🥉", usGrade: "Airman", desc: "Aviador en período de servicio activo con destrezas tácticas elementales." },
  { level: 3, name: "Airman First Class", abbr: "A1C", minXp: 120, badge: "🎖️", usGrade: "Airman First Class", desc: "Aviador de primera clase con dominio técnico en comunicaciones en inglés." },
  { level: 4, name: "Senior Airman", abbr: "SrA", minXp: 250, badge: "⭐", usGrade: "Senior Airman", desc: "Aviador senior con liderazgo de escuadrilla y alta precisión técnica." },
  { level: 5, name: "Staff Sergeant", abbr: "SSgt", minXp: 450, badge: "⭐⭐", usGrade: "Staff Sergeant", desc: "Suboficial de escuadra a cargo de la supervisión de entrenamiento táctico." },
  { level: 6, name: "Technical Sergeant", abbr: "TSgt", minXp: 750, badge: "⭐⭐⭐", usGrade: "Technical Sergeant", desc: "Sargento técnico responsable de sistemas avanzados y preparación ALCPT." },
  { level: 7, name: "Master Sergeant", abbr: "MSgt", minXp: 1200, badge: "🏅", usGrade: "Master Sergeant", desc: "Sargento maestro de sección operativa con excelencia en radiofonía." },
  { level: 8, name: "Senior Master Sergeant", abbr: "SMSgt", minXp: 1800, badge: "🛡️", usGrade: "Senior Master Sergeant", desc: "Suboficial superior de ala táctica y gestión de misiones aéreas." },
  { level: 9, name: "Chief Master Sergeant", abbr: "CMSgt", minXp: 2600, badge: "🦅", usGrade: "Chief Master Sergeant", desc: "Máximo grado de la categoría de suboficiales de la Fuerza Aérea." },

  // Oficiales de la Fuerza Aérea (Commissioned Officers)
  { level: 10, name: "Second Lieutenant", abbr: "2d Lt", minXp: 3600, badge: "🔹", usGrade: "Second Lieutenant", desc: "Oficial subalterno al mando de vuelo y operaciones iniciales." },
  { level: 11, name: "First Lieutenant", abbr: "1st Lt", minXp: 4800, badge: "🔷", usGrade: "First Lieutenant", desc: "Teniente primero con experiencia de vuelo y combate comprobada." },
  { level: 12, name: "Captain", abbr: "Capt", minXp: 6200, badge: "⚡", usGrade: "Captain", desc: "Capitán comandante de escuadrón aéreo y especialista bilingüe." },
  { level: 13, name: "Major", abbr: "Maj", minXp: 8000, badge: "⚜️", usGrade: "Major", desc: "Oficial superior a cargo del estado mayor de operaciones aéreas." },
  { level: 14, name: "Lieutenant Colonel", abbr: "Lt Col", minXp: 10500, badge: "🥈", usGrade: "Lieutenant Colonel", desc: "Teniente coronel al mando de escuadrón táctico de combate y bombardeo." },
  { level: 15, name: "Colonel", abbr: "Col", minXp: 14000, badge: "🥇", usGrade: "Colonel", desc: "Coronel jefe de ala aérea de la Fuerza Aérea de los Estados Unidos." },
  { level: 16, name: "Brigadier General", abbr: "Brig Gen", minXp: 19000, badge: "🌟", usGrade: "Brigadier General", desc: "General de una estrella, comandante de brigada aeroespacial." },
  { level: 17, name: "Major General", abbr: "Maj Gen", minXp: 26000, badge: "🌟🌟", usGrade: "Major General", desc: "General de dos estrellas al mando de división de operaciones estratégicas." },
  { level: 18, name: "Lieutenant General", abbr: "Lt Gen", minXp: 36000, badge: "🌟🌟🌟", usGrade: "Lieutenant General", desc: "Teniente general de tres estrellas, jefe de fuerza aérea expedicionaria." },
  { level: 19, name: "General", abbr: "Gen", minXp: 50000, badge: "🌟🌟🌟🌟", usGrade: "General", desc: "General de cuatro estrellas, comandante del cuartel general de la USAF." },
  { level: 20, name: "General of the Air Force", abbr: "GAF", minXp: 75000, badge: "👑", usGrade: "General of the Air Force", desc: "Grado supremo de cinco estrellas de la Fuerza Aérea. ¡Héroe legendario supremo!" },
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

export function getUserRankTitle(xp: number): string {
  return getRankByXp(xp).currentRank.name;
}

export function getUserRankGrade(xp: number): string {
  return getRankByXp(xp).currentRank.usGrade;
}

export function getUserRankBadge(xp: number): string {
  return getRankByXp(xp).currentRank.badge;
}

