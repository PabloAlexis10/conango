import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import { ingestAllWordForms } from "../../../../../scripts/ingestWordForms";

export async function POST(request: NextRequest) {
  try {
    let targetFolder: string | undefined;
    try {
      const body = await request.json();
      if (body.folder) targetFolder = body.folder;
    } catch {
      // Body is optional
    }

    const result = await ingestAllWordForms(targetFolder);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[API Ingest Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
