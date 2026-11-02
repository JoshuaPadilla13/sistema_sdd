import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "agent-factory-v4-actual.zip");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Archivo ZIP (agent-factory-v4-actual.zip) no encontrado" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="AGENT-FACTORY-V4-ACTUAL.zip"',
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error al descargar AGENT-FACTORY-V4-ACTUAL.zip:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
