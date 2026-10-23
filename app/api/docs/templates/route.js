import { NextResponse } from "next/server";
import { getAvailableTemplates } from "../../../../lib/services/docs.js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const templates = await getAvailableTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error al listar plantillas:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
