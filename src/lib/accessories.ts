import { ShopPowerUp } from "./types";

export const DUOLINGO_POWERUPS: ShopPowerUp[] = [
  {
    id: "double_xp_15",
    name: "Poción Doble Experiencia (15 Min)",
    emoji: "⚡",
    category: "booster",
    description: "Duplica toda la XP obtenida en evaluaciones y exámenes durante 15 minutos. ¡Exclusivo para cadetes registrados!",
    priceGems: 100,
  },
  {
    id: "streak_freeze",
    name: "Protector de Racha (Streak Freeze)",
    emoji: "❄️",
    category: "streak",
    description: "Equipa un congelador de racha. Si estás 1 día sin entrenar, tu racha de fuego 🔥 queda 100% protegida.",
    priceGems: 200,
  },
  {
    id: "refill_hearts",
    name: "Recarga Completa de 5 Vidas",
    emoji: "❤️",
    category: "hearts",
    description: "Restaura inmediatamente tus 5 vidas al 100% para continuar practicando sin esperar ni ver anuncios.",
    priceGems: 150,
  },
  {
    id: "conan_pro_pass",
    name: "Conan PRO (Super Duolingo)",
    emoji: "👑",
    category: "pro",
    description: "Vidas infinitas (∞), cero anuncios en toda la plataforma y potenciador 2x XP permanente.",
    priceGems: 0,
  },
];

export const MILITARY_RANKS = [
  { level: 1, name: "PVT K9 • Recruit Pup", minXp: 0, badge: "🐾", usGrade: "E-1 Private", desc: "Recluta canino en adiestramiento básico de obediencia y señales tácticas." },
  { level: 2, name: "PFC K9 • Scout Dog", minXp: 150, badge: "🥉", usGrade: "E-3 Private First Class", desc: "Perro rastreador de vanguardia para detección de objetivos." },
  { level: 3, name: "SPC K9 • Patrol Specialist", minXp: 400, badge: "🎖️", usGrade: "E-4 Specialist", desc: "Especialista canino en seguridad perimétrica y rondas tácticas." },
  { level: 4, name: "SGT K9 • Tactical Sentry Dog", minXp: 800, badge: "⭐", usGrade: "E-5 Sergeant", desc: "Sargento K9 de centinela y patrulla armada con certificación de combate." },
  { level: 5, name: "SSG K9 • Combat Assault K9", minXp: 1500, badge: "⭐⭐", usGrade: "E-6 Staff Sergeant", desc: "Líder canino de escuadra para asalto táctico y neutralización rápida." },
  { level: 6, name: "SFC K9 • Search & Rescue Lead", minXp: 2600, badge: "⭐⭐⭐", usGrade: "E-7 Sergeant First Class", desc: "Sargento Primero canino, especialista jefe en búsqueda, rescate y radio." },
  { level: 7, name: "1SG K9 • Operations Master Dog", minXp: 4200, badge: "🏅", usGrade: "E-8 First Sergeant", desc: "Primer Sargento canino a cargo de la disciplina y misiones de compañía." },
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
