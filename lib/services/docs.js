import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { eq, asc, desc } from "drizzle-orm";
import matter from "gray-matter";
import crypto from "crypto";
import { markdownToBlocks, blocksToMarkdown } from "../blocks.js";
import { withAuditTransaction } from "../db/audit.js";
import { isValidUuid, resolveDbUserId } from "./users.js";

export { isValidUuid, resolveDbUserId };

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
 * Obtiene un documento completo por su slug, garantizando bloques parseados.
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

  // Garantizar que tenga bloques
  const blocks = Array.isArray(document.blocks) && document.blocks.length > 0 
    ? document.blocks 
    : markdownToBlocks(document.rawMarkdown);

  return {
    ...document,
    blocks,
    category,
  };
}

/**
 * Obtiene un documento por ID (para edición administrativa en el editor de bloques).
 */
export async function getDocumentById(id) {
  if (!isValidUuid(id)) return null;

  const results = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.id, id))
    .limit(1);

  if (!results.length) return null;

  const document = results[0];
  const blocks = Array.isArray(document.blocks) && document.blocks.length > 0 
    ? document.blocks 
    : markdownToBlocks(document.rawMarkdown);

  return {
    ...document,
    blocks,
  };
}

/**
 * Procesa y guarda un archivo Markdown (.md).
 * Extrae Frontmatter, calcula SHA-256, genera bloques y registra revisión.
 * Las mutaciones quedan completamente auditadas con el ID del usuario en audit_logs.
 */
export async function importMarkdownFile({ filename, rawContent, categoryId = null, userId = null }) {
  const parsed = matter(rawContent);
  const data = parsed.data || {};
  const content = parsed.content.trim();

  // Validar categoryId: solo si es un UUID válido, de lo contrario null
  const validCategoryId = isValidUuid(categoryId) ? categoryId.trim() : null;

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

  // Generar bloques desde el contenido markdown
  const blocks = markdownToBlocks(content);

  // Calcular SHA-256 del contenido
  const contentHash = crypto.createHash("sha256").update(rawContent).digest("hex");

  return await withAuditTransaction(userId, async (tx) => {
    // Resolver el UUID en users para las llaves foráneas relacionales
    const dbUserId = await resolveDbUserId(userId, tx);

    // Verificar si ya existe un documento con ese slug
    const existing = await tx
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.slug, slug))
      .limit(1);

    let docId;

    if (existing.length > 0) {
      docId = existing[0].id;
      // Actualizar documento existente con nuevos bloques
      await tx
        .update(schema.documents)
        .set({
          title,
          description: data.description || existing[0].description,
          blocks,
          rawMarkdown: rawContent,
          frontmatter: data,
          categoryId: validCategoryId || existing[0].categoryId,
          updatedById: dbUserId,
          updatedAt: new Date(),
        })
        .where(eq(schema.documents.id, docId));

      // Obtener versión actual para la nueva revisión
      const lastRevisions = await tx
        .select()
        .from(schema.documentRevisions)
        .where(eq(schema.documentRevisions.documentId, docId))
        .orderBy(desc(schema.documentRevisions.version))
        .limit(1);

      const nextVersion = (lastRevisions[0]?.version || 1) + 1;

      await tx.insert(schema.documentRevisions).values({
        documentId: docId,
        blocks,
        rawMarkdown: rawContent,
        changeSummary: `Actualizado mediante importación de archivo ${filename}`,
        version: nextVersion,
        createdById: dbUserId,
      });
    } else {
      // Insertar nuevo documento con bloques
      const [inserted] = await tx
        .insert(schema.documents)
        .values({
          categoryId: validCategoryId,
          slug,
          title,
          description: data.description || null,
          blocks,
          rawMarkdown: rawContent,
          frontmatter: data,
          createdById: dbUserId,
          updatedById: dbUserId,
        })
        .returning();

      docId = inserted.id;

      await tx.insert(schema.documentRevisions).values({
        documentId: docId,
        blocks,
        rawMarkdown: rawContent,
        changeSummary: `Creado inicialmente vía importación de ${filename}`,
        version: 1,
        createdById: dbUserId,
      });
    }

    // Registrar en tabla markdown_files
    await tx.insert(schema.markdownFiles).values({
      documentId: docId,
      filename,
      fileSize: Buffer.byteLength(rawContent, "utf8"),
      mimeType: "text/markdown",
      contentHash,
      uploadedById: dbUserId,
    });

    return { docId, slug, title };
  });
}

/**
 * Guarda cambios realizados en el editor (recibe bloques o rawMarkdown).
 * La operación se ejecuta en una transacción auditada.
 */
export async function updateDocumentBlocks({ id, title, slug, blocks, rawMarkdown, userId = null }) {
  if (!isValidUuid(id)) {
    throw new Error(`ID de documento inválido: ${id}`);
  }

  // Asegurar consistencia bidireccional
  let finalMarkdown = rawMarkdown;
  let finalBlocks = blocks;

  if (blocks && (!rawMarkdown || rawMarkdown.trim() === '')) {
    finalMarkdown = blocksToMarkdown(blocks);
  } else if (rawMarkdown && (!blocks || blocks.length === 0)) {
    finalBlocks = markdownToBlocks(rawMarkdown);
  }

  // Garantizar valores por defecto no nulos para evitar restricciones de base de datos
  finalMarkdown = (finalMarkdown !== null && finalMarkdown !== undefined) 
    ? String(finalMarkdown) 
    : (Array.isArray(finalBlocks) ? blocksToMarkdown(finalBlocks) : "");
  finalBlocks = Array.isArray(finalBlocks) ? finalBlocks : (finalMarkdown ? markdownToBlocks(finalMarkdown) : []);

  return await withAuditTransaction(userId, async (tx) => {
    const dbUserId = await resolveDbUserId(userId, tx);

    await tx
      .update(schema.documents)
      .set({
        title,
        slug,
        blocks: finalBlocks,
        rawMarkdown: finalMarkdown,
        updatedById: dbUserId,
        updatedAt: new Date(),
      })
      .where(eq(schema.documents.id, id));

    // Obtener última versión
    const lastRevisions = await tx
      .select()
      .from(schema.documentRevisions)
      .where(eq(schema.documentRevisions.documentId, id))
      .orderBy(desc(schema.documentRevisions.version))
      .limit(1);

    const nextVersion = (lastRevisions[0]?.version || 1) + 1;

    await tx.insert(schema.documentRevisions).values({
      documentId: id,
      blocks: finalBlocks,
      rawMarkdown: finalMarkdown,
      changeSummary: 'Actualizado vía Editor Visual por Bloques',
      version: nextVersion,
      createdById: dbUserId,
    });

    return { success: true, version: nextVersion };
  });
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

  const content = document.rawMarkdown || blocksToMarkdown(document.blocks || []);

  if (content.startsWith("---")) {
    return content;
  }

  return matter.stringify(content, frontmatterData);
}

/**
 * Elimina un documento y limpia sus archivos y revisiones en cascada dentro de una transacción auditada.
 */
export async function deleteDocument(id, userId = null) {
  if (!id || !isValidUuid(id)) {
    throw new Error("El ID del documento es inválido");
  }

  return await withAuditTransaction(userId, async (tx) => {
    // Limpieza preventiva de dependencias
    await tx.delete(schema.documentRevisions).where(eq(schema.documentRevisions.documentId, id));
    await tx.delete(schema.markdownFiles).where(eq(schema.markdownFiles.documentId, id));
    await tx.delete(schema.documents).where(eq(schema.documents.id, id));

    return { success: true };
  });
}

/**
 * Actualiza el índice de orden secuencial para un conjunto ordenado de documentos dentro de una transacción auditada.
 */
export async function reorderDocuments(orderedIds, userId = null) {
  if (!Array.isArray(orderedIds)) {
    throw new Error("orderedIds debe ser un arreglo de IDs");
  }

  return await withAuditTransaction(userId, async (tx) => {
    for (let index = 0; index < orderedIds.length; index++) {
      const id = orderedIds[index];
      if (isValidUuid(id)) {
        await tx
          .update(schema.documents)
          .set({ orderIndex: index, updatedAt: new Date() })
          .where(eq(schema.documents.id, id));
      }
    }

    return { success: true };
  });
}
