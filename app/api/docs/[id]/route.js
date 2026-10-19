import { NextResponse } from "next/server";
import { getDocumentById, updateDocumentBlocks, deleteDocument } from "../../../../lib/services/docs";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const document = await getDocumentById(id);

    if (!document) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, blocks, rawMarkdown } = body;

    const existing = await getDocumentById(id);
    if (!existing) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    const result = await updateDocumentBlocks({
      id,
      title: title || existing.title,
      slug: slug || existing.slug,
      blocks,
      rawMarkdown,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al actualizar documento con bloques:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const existing = await getDocumentById(id);
    if (!existing) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    await deleteDocument(id);
    return NextResponse.json({ success: true, message: "Documento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
