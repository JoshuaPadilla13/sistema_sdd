import React from 'react';
import Link from 'next/link';
import { Upload, Shield } from 'lucide-react';
import { db } from '../../lib/db/index';
import * as schema from '../../lib/db/schema';
import { asc, desc } from 'drizzle-orm';

import { auth0 } from '../../lib/auth0';
import { isAuthorizedSuperAdmin } from '../../lib/services/users';
import { getAvailableTemplates } from '../../lib/services/docs';
import AdminDocumentsTable from '../../components/admin/AdminDocumentsTable';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let isSuperAdmin = false;
  try {
    const session = await auth0.getSession();
    if (session?.user?.email) {
      isSuperAdmin = isAuthorizedSuperAdmin(session.user.email);
    }
  } catch (e) {
    // Modo seguro si no hay sesión
  }

  const [documents, categories, availableTemplates] = await Promise.all([
    db
      .select({
        id: schema.documents.id,
        title: schema.documents.title,
        slug: schema.documents.slug,
        categoryId: schema.documents.categoryId,
        templateSlug: schema.documents.templateSlug,
        orderIndex: schema.documents.orderIndex,
        isPublished: schema.documents.isPublished,
        updatedAt: schema.documents.updatedAt,
      })
      .from(schema.documents)
      .orderBy(asc(schema.documents.orderIndex), desc(schema.documents.updatedAt)),
    db.select().from(schema.categories).orderBy(asc(schema.categories.orderIndex)),
    getAvailableTemplates(),
  ]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div className="sl-admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--sl-color-text-title)', marginBottom: '0.35rem' }}>
            🛠️ Panel de Administración de Contenido
          </h1>
          <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.95rem' }}>
            Gestiona la documentación de SDD, asocia plantillas descargables a las fases, reorganiza el orden de los archivos y edita contenido.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/upload" className="sl-btn sl-btn-primary">
            <Upload size={16} />
            <span>Subir Archivo .md</span>
          </Link>
          {isSuperAdmin && (
            <Link href="/superadmin" className="sl-btn sl-btn-outline" style={{ borderColor: 'var(--sl-badge-danger)', color: '#ff7b72' }}>
              <Shield size={16} />
              <span>Super Admin & Auditoría</span>
            </Link>
          )}
        </div>
      </div>

      {/* TABLA INTERACTIVA DE DOCUMENTOS CON SELECCIÓN DE PLANTILLAS */}
      <AdminDocumentsTable 
        initialDocuments={documents} 
        categories={categories} 
        availableTemplates={availableTemplates}
      />
    </div>
  );
}
