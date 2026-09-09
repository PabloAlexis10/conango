import { PromoCode, UserProfile } from "./types";
import { getCurrentUser, saveCurrentUserProfile, setProStatus } from "./supabase";

const STORAGE_KEY_PROMO_CODES = "conango_promo_codes";
const STORAGE_KEY_REDEEMED = "conango_user_redeemed_codes";
const STORAGE_KEY_ACTIVE_DISCOUNT = "conango_active_discount";

// Códigos por defecto autorizados por el Comandante General
export const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    id: "code_conanpro7",
    code: "CONANPRO7",
    type: "pro_trial",
    value: 7,
    description: "Prueba Gratuita de Conan PRO por 7 días con Vidas Infinitas y Radio Cabina F-22",
    rewardDetail: { proDays: 7 },
    active: true,
    usedCount: 0,
    maxUses: 1000,
    createdAt: new Date().toISOString(),
    createdBy: "Comandancia General",
  },
  {
    id: "code_topgun50",
    code: "TOPGUN50",
    type: "discount",
    value: 50,
    description: "50% de Descuento Inmediato en cualquier plan de Conan PRO",
    rewardDetail: { discountPercent: 50 },
    active: true,
    usedCount: 0,
    maxUses: 500,
    createdAt: new Date().toISOString(),
    createdBy: "Comandancia General",
  },
  {
    id: "code_diamantesvip",
    code: "DIAMANTESVIP",
    type: "gift",
    value: 500,
    description: "Regalo Táctico de +500 Diamantes para Pociones y Tienda Táctica",
    rewardDetail: { gems: 500 },
    active: true,
    usedCount: 0,
    maxUses: 500,
    createdAt: new Date().toISOString(),
    createdBy: "Comandancia General",
  },
  {
    id: "code_pocionesvip",
    code: "POCIONESVIP",
    type: "gift",
    value: 300,
    description: "Pack Regalo de +300 Diamantes y +2 Protectores de Racha Táctica",
    rewardDetail: { gems: 300, streakFreeze: 2 },
    active: true,
    usedCount: 0,
    maxUses: 500,
    createdAt: new Date().toISOString(),
    createdBy: "Comandancia General",
  },
  {
    id: "code_alcptmaster",
    code: "ALCPTMASTER",
    type: "pro_trial",
    value: 30,
    description: "Pase Oficial de Prueba Militar PRO por 30 Días con Acceso Total",
    rewardDetail: { proDays: 30 },
    active: true,
    usedCount: 0,
    maxUses: 200,
    createdAt: new Date().toISOString(),
    createdBy: "Comandancia General",
  },
];

export function getPromoCodes(): PromoCode[] {
  if (typeof window === "undefined") return DEFAULT_PROMO_CODES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROMO_CODES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROMO_CODES, JSON.stringify(DEFAULT_PROMO_CODES));
      return DEFAULT_PROMO_CODES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_PROMO_CODES, JSON.stringify(DEFAULT_PROMO_CODES));
      return DEFAULT_PROMO_CODES;
    }
    return parsed;
  } catch {
    return DEFAULT_PROMO_CODES;
  }
}

export function savePromoCodes(codes: PromoCode[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_PROMO_CODES, JSON.stringify(codes));
}

export function createPromoCode(params: {
  code: string;
  type: "discount" | "gift" | "pro_trial";
  value: number;
  description: string;
  maxUses?: number;
  expiresAt?: string;
  rewardDetail?: {
    gems?: number;
    streakFreeze?: number;
    discountPercent?: number;
    proDays?: number;
  };
}): { success: boolean; code?: PromoCode; error?: string } {
  const cleanCode = params.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if (!cleanCode || cleanCode.length < 3) {
    return { success: false, error: "El código debe tener al menos 3 caracteres alfanuméricos." };
  }

  const existing = getPromoCodes();
  if (existing.some((c) => c.code.toUpperCase() === cleanCode)) {
    return { success: false, error: `El código "${cleanCode}" ya existe en el sistema.` };
  }

  const newCode: PromoCode = {
    id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    code: cleanCode,
    type: params.type,
    value: Number(params.value) || 0,
    description: params.description.trim() || `Código ${params.type}`,
    maxUses: params.maxUses || 999,
    usedCount: 0,
    active: true,
    expiresAt: params.expiresAt,
    rewardDetail: params.rewardDetail,
    createdAt: new Date().toISOString(),
    createdBy: "Administrador",
  };

  existing.unshift(newCode);
  savePromoCodes(existing);

  return { success: true, code: newCode };
}

export function togglePromoCodeActive(codeId: string): void {
  const codes = getPromoCodes();
  const idx = codes.findIndex((c) => c.id === codeId);
  if (idx !== -1) {
    codes[idx].active = !codes[idx].active;
    savePromoCodes(codes);
  }
}

export function deletePromoCode(codeId: string): void {
  const codes = getPromoCodes().filter((c) => c.id !== codeId);
  savePromoCodes(codes);
}

// Canjear un código ingresado por el usuario
export function redeemCode(rawCode: string): {
  success: boolean;
  message: string;
  code?: PromoCode;
  rewardType?: "discount" | "gift" | "pro_trial";
} {
  const clean = rawCode.trim().toUpperCase();
  if (!clean) {
    return { success: false, message: "Por favor ingresa un código promocional o de regalo." };
  }

  const codes = getPromoCodes();
  const match = codes.find((c) => c.code.toUpperCase() === clean);

  if (!match) {
    // Códigos rápidos especiales
    if (clean === "CONANPRO" || clean === "ADMINMASTER") {
      setProStatus(true);
      return {
        success: true,
        message: "¡Código Maestro Autorizado! Conan PRO activado indefinidamente con Vidas Infinitas.",
        rewardType: "pro_trial",
      };
    }
    return { success: false, message: "Código inválido o no reconocido. Verifica que esté bien escrito." };
  }

  if (!match.active) {
    return { success: false, message: "Este código ha sido desactivado por la Comandancia." };
  }

  if (match.expiresAt && new Date(match.expiresAt).getTime() < Date.now()) {
    return { success: false, message: "Este código ha caducado en su fecha de vigencia." };
  }

  if (match.maxUses && match.usedCount >= match.maxUses) {
    return { success: false, message: "Este código ha alcanzado el límite máximo de canjes permitidos." };
  }

  // Verificar si este usuario ya canjeó este código
  let user = getCurrentUser();
  const userId = user?.id || "guest";
  if (typeof window !== "undefined") {
    const redeemedList: string[] = JSON.parse(
      localStorage.getItem(`${STORAGE_KEY_REDEEMED}_${userId}`) || "[]"
    );
    if (redeemedList.includes(match.id)) {
      return { success: false, message: "Ya has canjeado este código anteriormente en tu cuenta." };
    }
  }

  // Aplicar beneficios
  let message = "";
  if (match.type === "gift") {
    const gemsToAdd = match.rewardDetail?.gems || match.value || 250;
    const freezeToAdd = match.rewardDetail?.streakFreeze || 0;

    if (!user) {
      user = {
        id: "usr_" + Date.now(),
        email: "cadete@conango.com",
        name: "Cadete ConanGo",
        medals: 5,
        streakDays: 1,
        xp: 100,
        coins: 100,
        gems: 100,
        streakFreeze: 0,
        created_at: new Date().toISOString(),
      };
    }

    user.gems = (user.gems ?? user.coins ?? 100) + gemsToAdd;
    user.coins = user.gems;
    if (freezeToAdd > 0) {
      user.streakFreeze = (user.streakFreeze || 0) + freezeToAdd;
    }

    saveCurrentUserProfile(user);
    message = `¡Felicitaciones! Has recibido +${gemsToAdd} Diamantes Tácticos${
      freezeToAdd > 0 ? ` y +${freezeToAdd} Protectores de Racha` : ""
    }.`;
  } else if (match.type === "pro_trial") {
    const days = match.rewardDetail?.proDays || match.value || 7;
    setProStatus(true);
    message = `¡Pase Militar Autorizado! Tienes acceso completo a Conan PRO por ${days} días con Vidas Infinitas, Simulador Radio F-22 y Bóveda de Errores.`;
  } else if (match.type === "discount") {
    const discount = match.rewardDetail?.discountPercent || match.value || 50;
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY_ACTIVE_DISCOUNT,
        JSON.stringify({ percent: discount, code: match.code, appliedAt: Date.now() })
      );
    }
    message = `¡Descuento del ${discount}% activado con éxito! Se aplicará automáticamente al contratar Conan PRO.`;
  }

  // Registrar uso
  match.usedCount += 1;
  savePromoCodes(codes);

  if (typeof window !== "undefined") {
    const redeemedList: string[] = JSON.parse(
      localStorage.getItem(`${STORAGE_KEY_REDEEMED}_${userId}`) || "[]"
    );
    redeemedList.push(match.id);
    localStorage.setItem(`${STORAGE_KEY_REDEEMED}_${userId}`, JSON.stringify(redeemedList));
  }

  return {
    success: true,
    message,
    code: match,
    rewardType: match.type,
  };
}

export function getActiveDiscount(): { percent: number; code: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_DISCOUNT);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Válido por 48 horas
    if (Date.now() - parsed.appliedAt < 48 * 3600 * 1000) {
      return parsed;
    }
    localStorage.removeItem(STORAGE_KEY_ACTIVE_DISCOUNT);
    return null;
  } catch {
    return null;
  }
}
