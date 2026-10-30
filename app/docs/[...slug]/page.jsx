import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { Download, Edit3, ArrowLeft, Calendar, User } from 'lucide-react';
import Sidebar from '../../../components/starlight/Sidebar';
import TableOfContents, { MobileTableOfContents } from '../../../components/starlight/TableOfContents';
import MarkdownRenderer from '../../../components/starlight/MarkdownRenderer';
import AdminDocActions from '../../../components/starlight/AdminDocActions';
import TemplatesByPhase from '../../../components/starlight/TemplatesByPhase';
import { getNavigationTree, getDocumentBySlug, getAvailableTemplates } from '../../../lib/services/docs';
import { extractHeadings } from '../../../lib/toc';

export const dynamic = 'force-dynamic';

export default async function DocPage({ params }) {
  const { slug } = await params;
  const fullSlug = Array.isArray(slug) ? slug.join('/') : (slug || '');

  const [tree, document] = await Promise.all([
    getNavigationTree(),
    getDocumentBySlug(fullSlug),
  ]);

  if (!document) {
    // Si se navega a /docs/plantillas, mostramos el catálogo organizado por fases
    if (fullSlug === 'plantillas') {
      const templates = await getAvailableTemplates();
      return (
        <div className="sl-layout">
          <Sidebar tree={tree} />

          <div className="sl-main-container">
            <article className="sl-content-pane" style={{ maxWidth: '1020px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--sl-color-text-muted)', marginBottom: '1.5rem' }}>
                <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Inicio</Link>
                <span>/</span>
                <span style={{ color: 'var(--sl-color-text-title)' }}>Plantillas Oficiales por Fases</span>
              </div>

              <TemplatesByPhase 
                initialTemplates={templates}
                title="Catálogo Oficial de Plantillas SDD por Fases"
                subtitle="Explora, visualiza y descarga las plantillas markdown (.md) organizadas por cada una de las 7 fases del ciclo de vida SDD."
              />
            </article>
          </div>
        </div>
      );
    }

    // 1. Si el slug es directamente una categoría (ej: /docs/introduccion)
    const categoryMatch = tree.find((c) => c.slug === fullSlug);
    if (categoryMatch && categoryMatch.documents?.length > 0) {
      redirect(`/docs/${categoryMatch.documents[0].slug}`);
    }

    // 2. Si el slug empieza con una categoría existente pero el subdocumento no existe
    const firstPart = fullSlug.split('/')[0];
    const parentCategory = tree.find((c) => c.slug === firstPart);
    if (parentCategory && parentCategory.documents?.length > 0) {
      redirect(`/docs/${parentCategory.documents[0].slug}`);
    }

    notFound();
  }

  const headings = extractHeadings(document.rawMarkdown);

  return (
    <div className="sl-layout">
      <Sidebar tree={tree} />

      <div className="sl-main-container">
        <article className="sl-content-pane">
          {/* Breadcrumb & Acciones */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--sl-color-text-muted)' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Inicio</Link>
              <span>/</span>
              {document.category && (
                <>
                  <span>{document.category.title}</span>
                  <span>/</span>
                </>
              )}
              <span style={{ color: 'var(--sl-color-text-title)' }}>{document.title}</span>
            </div>

            <AdminDocActions documentId={document.id} slug={document.slug} />
          </div>

          {/* Menú colapsable 'En esta página' en dispositivos móviles y tablets */}
          <MobileTableOfContents headings={headings} />

          {/* Renderizado de Markdown */}
          <MarkdownRenderer content={document.rawMarkdown} template={document.template} />
        </article>

        {/* Panel lateral 'En esta página' en Desktop */}
        <TableOfContents headings={headings} />
      </div>
    </div>
  );
}
