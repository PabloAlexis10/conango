import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CODES_FILE = path.join(process.cwd(), "data", "promo_codes.json");
const REDEMPTIONS_FILE = path.join(process.cwd(), "data", "code_redemptions.json");

function ensureFiles() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(CODES_FILE)) {
    fs.writeFileSync(CODES_FILE, "[]", "utf-8");
  }
  if (!fs.existsSync(REDEMPTIONS_FILE)) {
    fs.writeFileSync(REDEMPTIONS_FILE, "[]", "utf-8");
  }
}

function loadCodes() {
  ensureFiles();
  try {
    return JSON.parse(fs.readFileSync(CODES_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveCodes(codes: any[]) {
  ensureFiles();
  fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2), "utf-8");
}

function loadRedemptions() {
  ensureFiles();
  try {
    return JSON.parse(fs.readFileSync(REDEMPTIONS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveRedemptions(redemptions: any[]) {
  ensureFiles();
  fs.writeFileSync(REDEMPTIONS_FILE, JSON.stringify(redemptions, null, 2), "utf-8");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawCode = (body.code || "").toString().trim().toUpperCase();
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
    const match = codes.find((c: any) => c.code.toUpperCase() === rawCode);

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
