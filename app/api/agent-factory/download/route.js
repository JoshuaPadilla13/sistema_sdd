import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "agent-factory-sdd.zip");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Archivo ZIP no encontrado" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="agent-factory-sdd.zip"',
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error al descargar agent-factory-sdd.zip:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
