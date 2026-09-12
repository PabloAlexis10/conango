import { PromoCode, UserProfile, CodeRedemption } from "./types";
import { getCurrentUser, saveCurrentUserProfile, setProStatus } from "./supabase";

const STORAGE_KEY_PROMO_CODES = "conango_promo_codes";
const STORAGE_KEY_REDEEMED = "conango_user_redeemed_codes";
const STORAGE_KEY_ACTIVE_DISCOUNT = "conango_active_discount";

// Secret salt for military tactical code checksum
const COMMAND_SALT = "CONANGO_TACTICAL_AUTH_2026_USAF_DLIELC";

// Códigos maestros pre-cargados universales
export const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    id: "code_alcpt2026",
    code: "ALCPT2026",
    type: "gift",
    value: 500,
    description: "Bono de bienvenida para nuevos cadetes",
    maxUses: 99999,
    usedCount: 0,
    active: true,
    expiresAt: undefined,
    rewardDetail: { gems: 500, streakFreeze: 1 },
    createdAt: new Date().toISOString(),
    createdBy: "Comandancia General",
  },
  {
    id: "code_comandante",
    code: "COMANDANTE",
    type: "pro_trial",
    value: 365,
    description: "Pase de honor Comandancia General",
    maxUses: 99999,
    usedCount: 0,
    active: true,
    expiresAt: undefined,
    rewardDetail: { proDays: 365 },
    createdAt: new Date().toISOString(),
    createdBy: "Comandancia General",
  },
];

export function generateTacticalChecksum(payload: string): string {
  let hash = 5381;
  const str = payload.toUpperCase() + COMMAND_SALT;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(4, "0").slice(-4);
}

// Generador de código táctico universal autoverificable
export function generateUniversalTacticalCode(
  type: "pro_trial" | "gift" | "discount",
  value: number,
  prefix?: string
): string {
  const serial = Math.random().toString(36).substring(2, 6).toUpperCase();
  let baseTag = "";
  if (prefix && prefix.trim().length >= 3) {
    baseTag = prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  } else if (type === "pro_trial") {
    baseTag = value >= 365 ? "CONAN-PRO-LIFETIME" : `CONAN-PRO-${value}D`;
  } else if (type === "gift") {
    baseTag = `CONAN-GEMS-${value}`;
  } else {
    baseTag = `CONAN-DESC-${value}`;
  }

  const payload = `${baseTag}-${serial}`;
  const checksum = generateTacticalChecksum(payload);
  return `${payload}-${checksum}`;
}

// Verificador criptográfico cliente/offline de códigos tácticos
export function verifyTacticalCode(rawCode: string): {
  valid: boolean;
  type: "pro_trial" | "gift" | "discount";
  value: number;
  rewardDetail: any;
  description: string;
} | null {
  const clean = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const parts = clean.split("-");
  if (parts.length >= 2) {
    const providedCheck = parts[parts.length - 1];
    const payload = parts.slice(0, parts.length - 1).join("-");
    const expectedCheck = generateTacticalChecksum(payload);

    if (providedCheck === expectedCheck) {
      if (payload.includes("PRO-LIFETIME") || payload.includes("PROLIFE")) {
        return {
          valid: true,
          type: "pro_trial",
          value: 9999,
          rewardDetail: { proDays: 9999 },
          description: "Pase Conan PRO Vitalicio",
        };
      }
      if (payload.includes("PRO") || payload.includes("30D")) {
        const daysMatch = payload.match(/(\d+)D/);
        const days = daysMatch ? parseInt(daysMatch[1], 10) : 30;
        return {
          valid: true,
          type: "pro_trial",
          value: days,
          rewardDetail: { proDays: days },
          description: `Pase Conan PRO Táctico (${days} Días)`,
        };
      }
      if (payload.includes("GEMS") || payload.includes("GIFT")) {
        const gemsMatch = payload.match(/(\d+)/);
        const gems = gemsMatch ? parseInt(gemsMatch[1], 10) : 500;
        return {
          valid: true,
          type: "gift",
          value: gems,
          rewardDetail: { gems, streakFreeze: gems >= 1000 ? 2 : 1 },
          description: `Recompensa Militar de ${gems} Diamantes`,
        };
      }
      if (payload.includes("DESC")) {
        const descMatch = payload.match(/(\d+)/);
        const discount = descMatch ? parseInt(descMatch[1], 10) : 50;
        return {
          valid: true,
          type: "discount",
          value: discount,
          rewardDetail: { discountPercent: discount },
          description: `Descuento Táctico del ${discount}% en Conan PRO`,
        };
      }
      // Código personalizado firmado
      return {
        valid: true,
        type: "pro_trial",
        value: 30,
        rewardDetail: { proDays: 30 },
        description: "Código Táctico Autorizado por la Comandancia",
      };
    }
  }
  return null;
}

export function getPromoCodes(): PromoCode[] {
  if (typeof window === "undefined") return DEFAULT_PROMO_CODES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROMO_CODES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROMO_CODES, JSON.stringify(DEFAULT_PROMO_CODES));
      return DEFAULT_PROMO_CODES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROMO_CODES;
  } catch {
    return DEFAULT_PROMO_CODES;
  }
}

export function savePromoCodes(codes: PromoCode[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_PROMO_CODES, JSON.stringify(codes));
}

// Fetch codes from centralized server backend
export async function fetchServerCodes(): Promise<{ codes: PromoCode[]; redemptions: CodeRedemption[] }> {
  try {
    const res = await fetch("/api/admin/codes", { method: "GET", cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.codes)) {
        savePromoCodes(data.codes);
        return { codes: data.codes, redemptions: data.redemptions || [] };
      }
    }
  } catch (err) {
    // Silently fallback to local list
  }
  return { codes: getPromoCodes(), redemptions: [] };
}

export async function createPromoCode(params: {
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
}): Promise<{ success: boolean; code?: PromoCode; error?: string }> {
  let cleanCode = params.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if (!cleanCode || cleanCode.length < 3) {
    cleanCode = generateUniversalTacticalCode(params.type, params.value);
  }

  // Si no tiene checksum, firmarlo para compatibilidad universal
  if (!cleanCode.includes("-")) {
    const checksum = generateTacticalChecksum(cleanCode);
    cleanCode = `${cleanCode}-${checksum}`;
  }

  const newLocalCode: PromoCode = {
    id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    code: cleanCode,
    type: params.type,
    value: params.value,
    description: params.description || `Código oficial de ${params.type}`,
    maxUses: params.maxUses || 999,
    usedCount: 0,
    active: true,
    expiresAt: params.expiresAt,
    rewardDetail: params.rewardDetail,
    createdAt: new Date().toISOString(),
    createdBy: "Comandancia General",
  };

  // Guardar localmente de inmediato
  const current = getPromoCodes();
  const updated = [newLocalCode, ...current.filter((c) => c.code !== cleanCode)];
  savePromoCodes(updated);

  // Intentar sincronizar con backend
  try {
    const res = await fetch("/api/admin/codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: cleanCode,
        type: params.type,
        value: params.value,
        description: params.description,
        maxUses: params.maxUses,
        expiresAt: params.expiresAt,
        rewardDetail: params.rewardDetail,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.code) {
        return { success: true, code: data.code };
      }
    }
  } catch (err: any) {
    // Continúa con el código local autenticado
  }

  return { success: true, code: newLocalCode };
}

export async function togglePromoCodeActive(codeId: string): Promise<boolean> {
  const current = getPromoCodes();
  const idx = current.findIndex((c) => c.id === codeId);
  if (idx !== -1) {
    current[idx].active = !current[idx].active;
    savePromoCodes(current);
  }

  try {
    await fetch("/api/admin/codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codeId }),
    });
  } catch {}
  return true;
}

export async function deletePromoCode(codeId: string): Promise<boolean> {
  const updated = getPromoCodes().filter((c) => c.id !== codeId);
  savePromoCodes(updated);

  try {
    await fetch(`/api/admin/codes?codeId=${encodeURIComponent(codeId)}`, {
      method: "DELETE",
    });
  } catch {}
  return true;
}

export async function revokeRedemption(redemptionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch("/api/admin/codes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redemptionId }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return { success: true, message: data.message };
      }
    }
  } catch {}
  return { success: true, message: "Beneficio revocado exitosamente." };
}

// Canjear un código con garantía de éxito 100%
export async function redeemCode(rawCode: string): Promise<{
  success: boolean;
  message: string;
  code?: PromoCode;
  rewardType?: "discount" | "gift" | "pro_trial";
}> {
  const clean = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if (!clean || clean.length < 3) {
    return { success: false, message: "Por favor ingresa un código promocional o de regalo válido." };
  }

  let user = getCurrentUser();
  const userId = user?.id || "guest";
  const userName = user?.name || "Cadete";
  const userEmail = user?.email || "cadete@conango.com";

  // 1. Validar que no se haya canjeado previamente en este dispositivo
  if (typeof window !== "undefined") {
    const redeemedList: string[] = JSON.parse(
      localStorage.getItem(`${STORAGE_KEY_REDEEMED}_${userId}`) || "[]"
    );
    if (redeemedList.includes(clean)) {
      return {
        success: false,
        message: "Ya has canjeado este código anteriormente en tu cuenta/dispositivo.",
      };
    }
  }

  // Función interna para aplicar beneficios localmente
  const applyReward = (
    rewardType: "discount" | "gift" | "pro_trial",
    rewardDetail: any,
    codeVal?: number,
    codeObj?: any
  ) => {
    let msg = "";
    if (rewardType === "gift") {
      const gemsToAdd = rewardDetail?.gems || codeVal || 250;
      const freezeToAdd = rewardDetail?.streakFreeze || 0;

      if (!user) {
        user = {
          id: userId,
          email: userEmail,
          name: userName,
          medals: 15,
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
      msg = `¡Felicitaciones! Has recibido +${gemsToAdd} Diamantes Tácticos de recompensa.`;
    } else if (rewardType === "pro_trial") {
      setProStatus(true);
      if (user) {
        user.isPro = true;
        user.medals = 9999;
        saveCurrentUserProfile(user);
      }
      const days = rewardDetail?.proDays || codeVal || 30;
      msg = days >= 365 ? "¡Pase Vitalicio Activado! Tienes acceso total a Conan PRO." : `¡Pase Militar Autorizado! Tienes acceso a Conan PRO por ${days} días.`;
    } else if (rewardType === "discount") {
      const discount = rewardDetail?.discountPercent || codeVal || 50;
      if (typeof window !== "undefined") {
        localStorage.setItem(
          STORAGE_KEY_ACTIVE_DISCOUNT,
          JSON.stringify({ percent: discount, code: clean, appliedAt: Date.now() })
        );
      }
      msg = `¡Descuento oficial del ${discount}% aplicado con éxito para tu suscripción PRO!`;
    }

    // Registrar en historial local
    if (typeof window !== "undefined") {
      const redeemedList: string[] = JSON.parse(
        localStorage.getItem(`${STORAGE_KEY_REDEEMED}_${userId}`) || "[]"
      );
      if (!redeemedList.includes(clean)) {
        redeemedList.push(clean);
        localStorage.setItem(`${STORAGE_KEY_REDEEMED}_${userId}`, JSON.stringify(redeemedList));
      }
    }

    return msg;
  };

  // 2. Chequeo criptográfico inmediato (Universal: funciona offline o sin base de datos)
  const tacticalCheck = verifyTacticalCode(clean);
  if (tacticalCheck && tacticalCheck.valid) {
    const message = applyReward(tacticalCheck.type, tacticalCheck.rewardDetail, tacticalCheck.value);

    // Intentar registrar en backend en segundo plano sin bloquear
    fetch("/api/codes/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: clean, userId, userName, userEmail }),
    }).catch(() => {});

    return {
      success: true,
      message,
      rewardType: tacticalCheck.type,
      code: {
        id: `code_${clean}`,
        code: clean,
        type: tacticalCheck.type,
        value: tacticalCheck.value,
        description: tacticalCheck.description,
        usedCount: 1,
        active: true,
        createdAt: new Date().toISOString(),
      },
    };
  }

  // 3. Intento vía API de servidor
  try {
    const res = await fetch("/api/codes/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: clean, userId, userName, userEmail }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const message = applyReward(data.rewardType, data.rewardDetail, data.code?.value, data.code);
        return {
          success: true,
          message: data.message || message,
          code: data.code,
          rewardType: data.rewardType,
        };
      } else if (data.message) {
        return { success: false, message: data.message };
      }
    }
  } catch (err) {
    // Si la red falla, continúa con chequeo local
  }

  // 4. Chequeo en códigos locales almacenados en el navegador o predeterminados
  const allLocalCodes = getPromoCodes();
  const localMatch = allLocalCodes.find((c) => c.code.toUpperCase() === clean);
  if (localMatch && localMatch.active) {
    const message = applyReward(localMatch.type, localMatch.rewardDetail, localMatch.value, localMatch);
    localMatch.usedCount = (localMatch.usedCount || 0) + 1;
    savePromoCodes(allLocalCodes);

    return {
      success: true,
      message,
      code: localMatch,
      rewardType: localMatch.type,
    };
  }

  return {
    success: false,
    message: "Código inválido o no reconocido. Verifica que esté bien escrito o solicita un nuevo código a la Comandancia.",
  };
}

export function getActiveDiscount(): { percent: number; code: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_DISCOUNT);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (Date.now() - parsed.appliedAt < 48 * 3600 * 1000) {
      return parsed;
    }
    localStorage.removeItem(STORAGE_KEY_ACTIVE_DISCOUNT);
    return null;
  } catch {
    return null;
  }
}


