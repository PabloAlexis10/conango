import { PromoCode, UserProfile, CodeRedemption } from "./types";
import { getCurrentUser, saveCurrentUserProfile, setProStatus } from "./supabase";

const STORAGE_KEY_PROMO_CODES = "conango_promo_codes";
const STORAGE_KEY_REDEEMED = "conango_user_redeemed_codes";
const STORAGE_KEY_ACTIVE_DISCOUNT = "conango_active_discount";

// Empty by default: Only codes created by the administrator will exist
export const DEFAULT_PROMO_CODES: PromoCode[] = [];

export function getPromoCodes(): PromoCode[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROMO_CODES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
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
    const data = await res.json();
    if (data.success && Array.isArray(data.codes)) {
      savePromoCodes(data.codes);
      return { codes: data.codes, redemptions: data.redemptions || [] };
    }
    return { codes: getPromoCodes(), redemptions: [] };
  } catch (err) {
    console.error("[fetchServerCodes] Error:", err);
    return { codes: getPromoCodes(), redemptions: [] };
  }
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
  const cleanCode = params.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if (!cleanCode || cleanCode.length < 3) {
    return { success: false, error: "El código debe tener al menos 3 caracteres alfanuméricos." };
  }

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
    const data = await res.json();
    if (data.success && data.code) {
      const current = getPromoCodes();
      const updated = [data.code, ...current.filter((c) => c.id !== data.code.id)];
      savePromoCodes(updated);
      return { success: true, code: data.code };
    }
    return { success: false, error: data.error || "Error al crear el código." };
  } catch (err: any) {
    return { success: false, error: err.message || "Error de conexión con el servidor." };
  }
}

export async function togglePromoCodeActive(codeId: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codeId }),
    });
    const data = await res.json();
    if (data.success && data.code) {
      const current = getPromoCodes();
      const idx = current.findIndex((c) => c.id === codeId);
      if (idx !== -1) {
        current[idx].active = data.code.active;
        savePromoCodes(current);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function deletePromoCode(codeId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/codes?codeId=${encodeURIComponent(codeId)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (data.success) {
      const updated = getPromoCodes().filter((c) => c.id !== codeId);
      savePromoCodes(updated);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Revoke redemption by Admin
export async function revokeRedemption(redemptionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch("/api/admin/codes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redemptionId }),
    });
    const data = await res.json();
    if (data.success) {
      return { success: true, message: data.message };
    }
    return { success: false, error: data.error || "Error al revocar el canje." };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Canjear un código ingresado por el usuario (conectado al backend central)
export async function redeemCode(rawCode: string): Promise<{
  success: boolean;
  message: string;
  code?: PromoCode;
  rewardType?: "discount" | "gift" | "pro_trial";
}> {
  const clean = rawCode.trim().toUpperCase();
  if (!clean) {
    return { success: false, message: "Por favor ingresa un código promocional o de regalo." };
  }

  let user = getCurrentUser();
  const userId = user?.id || "guest";
  const userName = user?.name || "Cadete";
  const userEmail = user?.email || "cadete@conango.com";

  try {
    const res = await fetch("/api/codes/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: clean,
        userId,
        userName,
        userEmail,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        message: data.message || "Código inválido o no reconocido. Verifica que esté bien escrito.",
      };
    }

    const { code, rewardType, rewardDetail, message } = data;

    // Aplicar beneficios localmente en la cuenta del usuario activo
    if (rewardType === "gift") {
      const gemsToAdd = rewardDetail?.gems || code?.value || 250;
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
    } else if (rewardType === "pro_trial") {
      setProStatus(true);
      if (user) {
        user.isPro = true;
        user.medals = 9999;
        saveCurrentUserProfile(user);
      }
    } else if (rewardType === "discount") {
      const discount = rewardDetail?.discountPercent || code?.value || 50;
      if (typeof window !== "undefined") {
        localStorage.setItem(
          STORAGE_KEY_ACTIVE_DISCOUNT,
          JSON.stringify({ percent: discount, code: code?.code || clean, appliedAt: Date.now() })
        );
      }
    }

    // Registrar en historial local
    if (typeof window !== "undefined" && code?.id) {
      const redeemedList: string[] = JSON.parse(
        localStorage.getItem(`${STORAGE_KEY_REDEEMED}_${userId}`) || "[]"
      );
      if (!redeemedList.includes(code.id)) {
        redeemedList.push(code.id);
        localStorage.setItem(`${STORAGE_KEY_REDEEMED}_${userId}`, JSON.stringify(redeemedList));
      }
    }

    return {
      success: true,
      message,
      code,
      rewardType,
    };
  } catch (err: any) {
    console.error("[redeemCode] Network Error:", err);
    return {
      success: false,
      message: "No se pudo conectar con el servidor de la Comandancia para validar el código. Revisa tu conexión a internet.",
    };
  }
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

