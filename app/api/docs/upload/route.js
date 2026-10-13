import { NextResponse } from "next/server";
import { importMarkdownFile } from "../../../../lib/services/docs.js";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const categoryId = formData.get("categoryId") || null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No se proporcionó ningún archivo válido" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".md")) {
      return NextResponse.json({ error: "El archivo debe tener extensión .md" }, { status: 400 });
    }

    const rawContent = await file.text();
    const result = await importMarkdownFile({
      filename: file.name,
      rawContent,
      categoryId: categoryId ? categoryId : null,
      userId: null,
    });

    return NextResponse.json({
      success: true,
      message: `Archivo ${file.name} procesado y guardado correctamente`,
      document: result,
    });
  } catch (error) {
    console.error("Error al procesar subida de markdown:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
