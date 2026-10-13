import { NextResponse } from "next/server";
import { getDocumentById } from "../../../../lib/services/docs";
import { db } from "../../../../lib/db/index";
import * as schema from "../../../../lib/db/schema";
import { eq, desc } from "drizzle-orm";

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
    const { title, slug, rawMarkdown } = await request.json();

    const existing = await getDocumentById(id);
    if (!existing) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    // Actualizar documento
    await db
      .update(schema.documents)
      .set({
        title,
        slug,
        rawMarkdown,
        updatedAt: new Date(),
      })
      .where(eq(schema.documents.id, id));

    // Obtener última versión para incrementar
    const lastRevisions = await db
      .select()
      .from(schema.documentRevisions)
      .where(eq(schema.documentRevisions.documentId, id))
      .orderBy(desc(schema.documentRevisions.version))
      .limit(1);

    const nextVersion = (lastRevisions[0]?.version || 1) + 1;

    // Registrar revisión
    await db.insert(schema.documentRevisions).values({
      documentId: id,
      rawMarkdown,
      changeSummary: `Edición manual en panel administrativo`,
      version: nextVersion,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
