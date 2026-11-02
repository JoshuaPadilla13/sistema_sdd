import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const version = (searchParams.get("version") || searchParams.get("v") || "").toLowerCase();

    const isV4 = version === "v4" || version === "actual" || version === "4";
    const filename = isV4 ? "agent-factory-v4-actual.zip" : "agent-factory-sdd.zip";
    const downloadName = isV4 ? "AGENT-FACTORY-V4-ACTUAL.zip" : "agent-factory-sdd.zip";

    const filePath = path.join(process.cwd(), "public", filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `Archivo ZIP (${filename}) no encontrado` }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${downloadName}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error al descargar ZIP de Agent Factory:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
