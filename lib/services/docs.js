import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { eq, asc, desc } from "drizzle-orm";
import matter from "gray-matter";
import crypto from "crypto";

/**
 * Obtiene todas las categorías y sus documentos asociados para el Sidebar y Home.
 */
export async function getNavigationTree() {
  const categories = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.isPublished, true))
    .orderBy(asc(schema.categories.orderIndex));

  const documents = await db
    .select({
      id: schema.documents.id,
      title: schema.documents.title,
      slug: schema.documents.slug,
      categoryId: schema.documents.categoryId,
      orderIndex: schema.documents.orderIndex,
      isPublished: schema.documents.isPublished,
    })
    .from(schema.documents)
    .where(eq(schema.documents.isPublished, true))
    .orderBy(asc(schema.documents.orderIndex));

  return categories.map((cat) => ({
    ...cat,
    documents: documents.filter((doc) => doc.categoryId === cat.id),
  }));
}

/**
 * Obtiene un documento completo por su slug.
 */
export async function getDocumentBySlug(slug) {
  const cleanSlug = Array.isArray(slug) ? slug.join("/") : slug;
  
  const results = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.slug, cleanSlug))
    .limit(1);

  if (!results.length) return null;

  const document = results[0];
  let category = null;

  if (document.categoryId) {
    const catResults = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, document.categoryId))
      .limit(1);
    category = catResults[0] || null;
  }

  return {
    ...document,
    category,
  };
}

/**
 * Obtiene un documento por ID (para edición administrativa).
 */
export async function getDocumentById(id) {
  const results = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.id, id))
    .limit(1);

  return results[0] || null;
}

/**
 * Procesa y guarda un archivo Markdown (.md).
 * Extrae Frontmatter, calcula SHA-256, crea o actualiza el documento y registra la revisión.
 */
export async function importMarkdownFile({ filename, rawContent, categoryId = null, userId = null }) {
  const parsed = matter(rawContent);
  const data = parsed.data || {};
  const content = parsed.content.trim();

  // Obtener o inferir título
  let title = data.title;
  if (!title) {
    const firstH1 = content.match(/^#\s+(.+)$/m);
    title = firstH1 ? firstH1[1].trim() : filename.replace(/\.md$/i, "");
  }

  // Obtener o inferir slug
  let slug = data.slug;
  if (!slug) {
    const baseName = filename.toLowerCase().replace(/\.md$/i, "").replace(/[^a-z0-9_-]/g, "-");
    slug = baseName;
  }

  // Calcular SHA-256 del contenido
  const contentHash = crypto.createHash("sha256").update(rawContent).digest("hex");

  // Verificar si ya existe un documento con ese slug
  const existing = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.slug, slug))
    .limit(1);

  let docId;

  if (existing.length > 0) {
    docId = existing[0].id;
    // Actualizar documento existente
    await db
      .update(schema.documents)
      .set({
        title,
        description: data.description || existing[0].description,
        rawMarkdown: rawContent,
        frontmatter: data,
        categoryId: categoryId || existing[0].categoryId,
        updatedById: userId,
        updatedAt: new Date(),
      })
      .where(eq(schema.documents.id, docId));

    // Obtener versión actual para la nueva revisión
    const lastRevisions = await db
      .select()
      .from(schema.documentRevisions)
      .where(eq(schema.documentRevisions.documentId, docId))
      .orderBy(desc(schema.documentRevisions.version))
      .limit(1);

    const nextVersion = (lastRevisions[0]?.version || 1) + 1;

    await db.insert(schema.documentRevisions).values({
      documentId: docId,
      rawMarkdown: rawContent,
      changeSummary: `Actualizado mediante importación de archivo ${filename}`,
      version: nextVersion,
      createdById: userId,
    });
  } else {
    // Insertar nuevo documento
    const [inserted] = await db
      .insert(schema.documents)
      .values({
        categoryId,
        slug,
        title,
        description: data.description || null,
        rawMarkdown: rawContent,
        frontmatter: data,
        createdById: userId,
        updatedById: userId,
      })
      .returning();

    docId = inserted.id;

    await db.insert(schema.documentRevisions).values({
      documentId: docId,
      rawMarkdown: rawContent,
      changeSummary: `Creado inicialmente vía importación de ${filename}`,
      version: 1,
      createdById: userId,
    });
  }

  // Registrar en tabla markdown_files
  await db.insert(schema.markdownFiles).values({
    documentId: docId,
    filename,
    fileSize: Buffer.byteLength(rawContent, "utf8"),
    mimeType: "text/markdown",
    contentHash,
    uploadedById: userId,
  });

  return { docId, slug, title };
}

/**
 * Genera el archivo Markdown descargable con Frontmatter canónico.
 */
export function exportMarkdownDocument(document) {
  const frontmatterData = {
    title: document.title,
    description: document.description || "",
    slug: document.slug,
    updatedAt: document.updatedAt ? new Date(document.updatedAt).toISOString() : new Date().toISOString(),
    ...(document.frontmatter || {}),
  };

  // Si el contenido ya incluye frontmatter, retornarlo; si no, ensamblarlo
  if (document.rawMarkdown.startsWith("---")) {
    return document.rawMarkdown;
  }

  return matter.stringify(document.rawMarkdown, frontmatterData);
}
