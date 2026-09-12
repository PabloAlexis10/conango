import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CODES_FILE = path.join(process.cwd(), "data", "promo_codes.json");
const REDEMPTIONS_FILE = path.join(process.cwd(), "data", "code_redemptions.json");

// Fallback memory state for serverless read-only environments
let memoryAdminCodes: any[] = [
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
let memoryAdminRedemptions: any[] = [];

function loadCodes(): any[] {
  try {
    if (fs.existsSync(CODES_FILE)) {
      const data = JSON.parse(fs.readFileSync(CODES_FILE, "utf-8"));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    // Read fallback
  }
  return memoryAdminCodes;
}

function saveCodes(codes: any[]) {
  memoryAdminCodes = codes;
  try {
    const dataDir = path.dirname(CODES_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(CODES_FILE, JSON.stringify(codes, null, 2), "utf-8");
  } catch (err) {
    // Read-only filesystem on Vercel: safely continue with memoryAdminCodes
  }
}

function loadRedemptions(): any[] {
  try {
    if (fs.existsSync(REDEMPTIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(REDEMPTIONS_FILE, "utf-8"));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    // Read fallback
  }
  return memoryAdminRedemptions;
}

function saveRedemptions(redemptions: any[]) {
  memoryAdminRedemptions = redemptions;
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

// GET: list all codes and redemptions
export async function GET() {
  try {
    const codes = loadCodes();
    const redemptions = loadRedemptions();
    return NextResponse.json({ success: true, codes, redemptions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: create new code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cleanCode = (body.code || "").toString().trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");

    if (!cleanCode || cleanCode.length < 3) {
      return NextResponse.json(
        { success: false, error: "El código debe tener al menos 3 caracteres alfanuméricos." },
        { status: 400 }
      );
    }

    const codes = loadCodes();
    if (codes.some((c: any) => c.code.toUpperCase() === cleanCode)) {
      return NextResponse.json(
        { success: false, error: `El código "${cleanCode}" ya existe en el sistema.` },
        { status: 400 }
      );
    }

    const newCode = {
      id: `code_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: cleanCode,
      type: body.type || "discount",
      value: Number(body.value) || 0,
      description: (body.description || "").trim() || `Código oficial ${body.type}`,
      maxUses: Number(body.maxUses) || 999,
      usedCount: 0,
      active: true,
      expiresAt: body.expiresAt || null,
      rewardDetail: body.rewardDetail || {},
      createdAt: new Date().toISOString(),
      createdBy: "Comandancia General",
    };

    codes.unshift(newCode);
    saveCodes(codes);

    return NextResponse.json({ success: true, code: newCode });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH: toggle active or edit
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { codeId } = body;
    if (!codeId) {
      return NextResponse.json({ success: false, error: "ID de código no provisto." }, { status: 400 });
    }

    const codes = loadCodes();
    const idx = codes.findIndex((c: any) => c.id === codeId);
    if (idx === -1) {
      return NextResponse.json({ success: false, error: "Código no encontrado." }, { status: 404 });
    }

    codes[idx].active = !codes[idx].active;
    saveCodes(codes);

    return NextResponse.json({ success: true, code: codes[idx] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: permanently delete code
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codeId = searchParams.get("codeId");
    if (!codeId) {
      return NextResponse.json({ success: false, error: "ID de código no provisto." }, { status: 400 });
    }

    let codes = loadCodes();
    codes = codes.filter((c: any) => c.id !== codeId);
    saveCodes(codes);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Revoke a specific redemption
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { redemptionId } = body;

    if (!redemptionId) {
      return NextResponse.json({ success: false, error: "ID de canje no provisto." }, { status: 400 });
    }

    const redemptions = loadRedemptions();
    const rIdx = redemptions.findIndex((r: any) => r.id === redemptionId);

    if (rIdx === -1) {
      return NextResponse.json({ success: false, error: "Canje no encontrado." }, { status: 404 });
    }

    const targetRedemption = redemptions[rIdx];
    targetRedemption.revoked = true;
    targetRedemption.revokedAt = new Date().toISOString();
    saveRedemptions(redemptions);

    // Decrement usedCount in promo code
    const codes = loadCodes();
    const cIdx = codes.findIndex((c: any) => c.id === targetRedemption.codeId);
    if (cIdx !== -1) {
      codes[cIdx].usedCount = Math.max(0, (codes[cIdx].usedCount || 1) - 1);
      saveCodes(codes);
    }

    return NextResponse.json({
      success: true,
      message: `El canje del código "${targetRedemption.code}" para ${targetRedemption.userName} (${targetRedemption.userEmail}) ha sido revocado.`,
      redemption: targetRedemption,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
