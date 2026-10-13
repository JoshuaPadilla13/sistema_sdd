import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Download, Edit3, ArrowLeft, Calendar, User } from 'lucide-react';
import Sidebar from '../../../components/starlight/Sidebar';
import TableOfContents from '../../../components/starlight/TableOfContents';
import MarkdownRenderer from '../../../components/starlight/MarkdownRenderer';
import AdminDocActions from '../../../components/starlight/AdminDocActions';
import { getNavigationTree, getDocumentBySlug } from '../../../lib/services/docs';
import { extractHeadings } from '../../../lib/toc';

export const dynamic = 'force-dynamic';

export default async function DocPage({ params }) {
  const { slug } = await params;
  const fullSlug = Array.isArray(slug) ? slug.join('/') : slug;

  const [tree, document] = await Promise.all([
    getNavigationTree(),
    getDocumentBySlug(fullSlug),
  ]);

  if (!document) {
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

          {/* Renderizado de Markdown */}
          <MarkdownRenderer content={document.rawMarkdown} />
        </article>

        {/* Panel lateral "En esta página" */}
        <TableOfContents headings={headings} />
      </div>
    </div>
  );
}
