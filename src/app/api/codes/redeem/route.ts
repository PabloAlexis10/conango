import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CODES_FILE = path.join(process.cwd(), "data", "promo_codes.json");
const REDEMPTIONS_FILE = path.join(process.cwd(), "data", "code_redemptions.json");

// Secret salt for military tactical code checksum
const COMMAND_SALT = "CONANGO_TACTICAL_AUTH_2026_USAF_DLIELC";

export function generateTacticalChecksum(payload: string): string {
  let hash = 5381;
  const str = payload.toUpperCase() + COMMAND_SALT;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(4, "0").slice(-4);
}

// In-memory fallback in case of read-only serverless environment
let memoryCodes: any[] = [
  {
    id: "code_alcpt2026",
    code: "ALCPT2026",
    type: "gift",
    value: 500,
    description: "Bono de bienvenida para nuevos cadetes",
    maxUses: 99999,
    usedCount: 0,
    active: true,
    expiresAt: null,
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
    expiresAt: null,
    rewardDetail: { proDays: 365 },
    createdAt: new Date().toISOString(),
    createdBy: "Comandancia General",
  },
];
let memoryRedemptions: any[] = [];

function loadCodes(): any[] {
  try {
    if (fs.existsSync(CODES_FILE)) {
      const data = JSON.parse(fs.readFileSync(CODES_FILE, "utf-8"));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    // Read error fallback
  }
  return memoryCodes;
}

function saveCodes(codes: any[]) {
  memoryCodes = codes;
  try {
    const dataDir = path.dirname(CODES_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2), "utf-8");
  } catch (err) {
    // Read-only filesystem on Vercel: safely continue with memoryCodes
  }
}

function loadRedemptions(): any[] {
  try {
    if (fs.existsSync(REDEMPTIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(REDEMPTIONS_FILE, "utf-8"));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    // Read error fallback
  }
  return memoryRedemptions;
}

function saveRedemptions(redemptions: any[]) {
  memoryRedemptions = redemptions;
  try {
    const dataDir = path.dirname(REDEMPTIONS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(REDEMPTIONS_FILE, JSON.stringify(redemptions, null, 2), "utf-8");
  } catch (err) {
    // Read-only filesystem fallback
  }
}

// Check if a code is a universal signed tactical code
function checkSignedCode(cleanCode: string): any | null {
  const parts = cleanCode.split("-");
  if (parts.length >= 2) {
    const providedCheck = parts[parts.length - 1];
    const payload = parts.slice(0, parts.length - 1).join("-");
    const expectedCheck = generateTacticalChecksum(payload);
    if (providedCheck === expectedCheck) {
      // Decode reward type from payload
      if (payload.includes("PRO-30D") || payload.includes("PRO30")) {
        return {
          id: `code_signed_${cleanCode}`,
          code: cleanCode,
          type: "pro_trial",
          value: 30,
          description: "Pase Conan PRO Táctico (30 Días)",
          rewardDetail: { proDays: 30 },
          active: true,
        };
      }
      if (payload.includes("PRO-LIFETIME") || payload.includes("PROLIFE")) {
        return {
          id: `code_signed_${cleanCode}`,
          code: cleanCode,
          type: "pro_trial",
          value: 9999,
          description: "Pase Conan PRO Vitalicio",
          rewardDetail: { proDays: 9999 },
          active: true,
        };
      }
      if (payload.includes("GEMS-500") || payload.includes("GIFT-500")) {
        return {
          id: `code_signed_${cleanCode}`,
          code: cleanCode,
          type: "gift",
          value: 500,
          description: "Recompensa Militar de 500 Diamantes",
          rewardDetail: { gems: 500, streakFreeze: 1 },
          active: true,
        };
      }
      if (payload.includes("GEMS-1000") || payload.includes("GIFT-1000")) {
        return {
          id: `code_signed_${cleanCode}`,
          code: cleanCode,
          type: "gift",
          value: 1000,
          description: "Recompensa Militar de 1,000 Diamantes",
          rewardDetail: { gems: 1000, streakFreeze: 2 },
          active: true,
        };
      }
      if (payload.includes("DESC-50") || payload.includes("DESC50")) {
        return {
          id: `code_signed_${cleanCode}`,
          code: cleanCode,
          type: "discount",
          value: 50,
          description: "Descuento Táctico 50% en Conan PRO",
          rewardDetail: { discountPercent: 50 },
          active: true,
        };
      }
      // General signed custom code (grants 30 days pro by default)
      return {
        id: `code_signed_${cleanCode}`,
        code: cleanCode,
        type: "pro_trial",
        value: 30,
        description: "Código Autorizado por la Comandancia",
        rewardDetail: { proDays: 30 },
        active: true,
      };
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawCode = (body.code || "").toString().trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    const userId = (body.userId || "").toString().trim() || "guest";
    const userName = (body.userName || "").toString().trim() || "Cadete";
    const userEmail = (body.userEmail || "").toString().trim().toLowerCase() || "cadete@conango.com";

    if (!rawCode) {
      return NextResponse.json(
        { success: false, message: "Por favor ingresa un código promocional o de regalo." },
        { status: 400 }
      );
    }

    const codes = loadCodes();
    let match = codes.find((c: any) => c.code.toUpperCase() === rawCode);

    if (!match) {
      match = checkSignedCode(rawCode);
    }

    if (!match) {
      return NextResponse.json(
        { success: false, message: "Código inválido o no reconocido. Verifica que esté bien escrito." },
        { status: 404 }
      );
    }

    if (!match.active) {
      return NextResponse.json(
        { success: false, message: "Este código ha sido desactivado por la Comandancia." },
        { status: 400 }
      );
    }

    if (match.expiresAt && new Date(match.expiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, message: "Este código ha caducado en su fecha de vigencia." },
        { status: 400 }
      );
    }

    if (match.maxUses && match.usedCount >= match.maxUses) {
      return NextResponse.json(
        { success: false, message: "Este código ha alcanzado el límite máximo de canjes permitidos." },
        { status: 400 }
      );
    }

    // Check if user already redeemed
    const redemptions = loadRedemptions();
    const alreadyRedeemed = redemptions.some(
      (r: any) =>
        r.codeId === match.id &&
        !r.revoked &&
        (r.userId === userId || (userEmail !== "cadete@conango.com" && r.userEmail === userEmail))
    );

    if (alreadyRedeemed) {
      return NextResponse.json(
        { success: false, message: "Ya has canjeado este código anteriormente en tu cuenta." },
        { status: 400 }
      );
    }

    // Register redemption
    const redemption = {
      id: `rdm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      codeId: match.id,
      code: match.code,
      userId,
      userName,
      userEmail,
      type: match.type,
      value: match.value,
      rewardDetail: match.rewardDetail || {},
      redeemedAt: new Date().toISOString(),
      revoked: false,
    };

    redemptions.unshift(redemption);
    saveRedemptions(redemptions);

    // Update usage count
    match.usedCount = (match.usedCount || 0) + 1;
    saveCodes(codes);

    let message = "";
    if (match.type === "gift") {
      const gems = match.rewardDetail?.gems || match.value || 250;
      message = `¡Felicitaciones! Has recibido +${gems} Diamantes Tácticos de recompensa militar.`;
    } else if (match.type === "pro_trial") {
      const days = match.rewardDetail?.proDays || match.value || 7;
      message = `¡Pase Militar Autorizado! Tienes acceso completo a Conan PRO por ${days} días con Vidas Infinitas y Bóveda de Errores.`;
    } else if (match.type === "discount") {
      const discount = match.rewardDetail?.discountPercent || match.value || 50;
      message = `¡Descuento oficial del ${discount}% aplicado con éxito para tu suscripción PRO!`;
    }

    return NextResponse.json({
      success: true,
      message,
      code: match,
      rewardType: match.type,
      rewardDetail: match.rewardDetail,
      redemption,
    });
  } catch (error: any) {
    console.error("[Redeem Error]:", error);
    return NextResponse.json(
      { success: false, message: "Error en el servidor al validar el código militar." },
      { status: 500 }
    );
  }
}
