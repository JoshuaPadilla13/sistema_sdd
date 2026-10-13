import React from 'react';
import Link from 'next/link';
import { Upload, FileText, Download, Edit, Eye, PlusCircle } from 'lucide-react';
import { db } from '../../lib/db/index';
import * as schema from '../../lib/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const documents = await db
    .select({
      id: schema.documents.id,
      title: schema.documents.title,
      slug: schema.documents.slug,
      categoryId: schema.documents.categoryId,
      isPublished: schema.documents.isPublished,
      updatedAt: schema.documents.updatedAt,
    })
    .from(schema.documents)
    .orderBy(desc(schema.documents.updatedAt));

  const categories = await db.select().from(schema.categories);
  const categoryMap = new Map(categories.map((c) => [c.id, c.title]));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div className="sl-admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--sl-color-text-title)', marginBottom: '0.35rem' }}>
            🛠️ Panel de Administración de Contenido
          </h1>
          <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.95rem' }}>
            Gestiona la documentación de SDD, sube archivos Markdown (.md) y descarga especificaciones.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/upload" className="sl-btn sl-btn-primary">
            <Upload size={16} />
            <span>Subir Archivo .md</span>
          </Link>
          <Link href="/superadmin" className="sl-btn sl-btn-outline" style={{ borderColor: 'var(--sl-badge-danger)', color: '#ff7b72' }}>
            <span>Gestión de Roles (Super Admin)</span>
          </Link>
        </div>
      </div>

      {/* TABLA DE DOCUMENTOS */}
      <div style={{ background: 'var(--sl-color-bg-sidebar)', border: '1px solid var(--sl-color-border)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sl-color-border)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Título</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Fase / Categoría</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Slug</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Estado</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const catTitle = doc.categoryId ? categoryMap.get(doc.categoryId) : 'Sin categoría';
              return (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--sl-color-border)' }}>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--sl-color-text-title)' }}>
                    {doc.title}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--sl-color-text-muted)', fontSize: '0.88rem' }}>
                    {catTitle}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--sl-color-accent)', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                    /{doc.slug}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className="sl-badge success">Publicado</span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <Link
                        href={`/docs/${doc.slug}`}
                        className="sl-btn sl-btn-outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        title="Ver en vista pública"
                      >
                        <Eye size={14} />
                      </Link>
                      <a
                        href={`/api/docs/download/${doc.slug}`}
                        download
                        className="sl-btn sl-btn-outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        title="Descargar archivo Markdown (.md)"
                      >
                        <Download size={14} />
                      </a>
                      <Link
                        href={`/admin/documents/${doc.id}`}
                        className="sl-btn sl-btn-outline"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        title="Editar documento"
                      >
                        <Edit size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
