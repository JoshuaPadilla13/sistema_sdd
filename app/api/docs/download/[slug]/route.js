import { NextResponse } from "next/server";
import { getDocumentBySlug, exportMarkdownDocument } from "../../../../../lib/services/docs.js";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const document = await getDocumentBySlug(slug);

    if (!document) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    const markdownContent = exportMarkdownDocument(document);
    const fileName = `${document.slug.replace(/\//g, "-")}.md`;

    return new NextResponse(markdownContent, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error al descargar markdown:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
