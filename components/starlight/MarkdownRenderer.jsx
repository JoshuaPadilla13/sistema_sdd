'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Download, FileText } from 'lucide-react';

export function TemplateDownloadButton({ template }) {
  if (!template || !template.slug) return null;

  return (
    <div style={{
      margin: '0.85rem 0 1.75rem 0',
      padding: '0.75rem 1.1rem',
      background: 'rgba(35, 134, 54, 0.08)',
      border: '1px solid rgba(46, 160, 67, 0.4)',
      borderRadius: '8px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.85rem',
      flexWrap: 'wrap',
    }}>
      <a
        href={`/api/docs/download/${template.slug}`}
        download
        className="sl-btn sl-btn-primary"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.45rem 0.95rem',
          fontSize: '0.88rem',
          fontWeight: 600,
          borderRadius: '6px',
          textDecoration: 'none',
        }}
      >
        <Download size={15} />
        <span>Descargar plantilla</span>
      </a>

      {template.title && (
        <span style={{ fontSize: '0.84rem', color: 'var(--sl-color-text-muted)' }}>
          Plantilla oficial: <strong style={{ color: 'var(--sl-color-text-title)' }}>{template.title}</strong>
        </span>
      )}
    </div>
  );
}

export default function MarkdownRenderer({ content = '', template = null }) {
  // Omitir bloque Frontmatter inicial si está presente
  const cleanContent = content.replace(/^---[\s\S]*?---\s*/, '');
  const hasH1 = /^#\s+/m.test(cleanContent);
  let renderedButton = false;

  return (
    <div className="sl-prose">
      {/* Si el documento no incluye H1 explícito en el markdown, renderizar el botón arriba */}
      {!hasH1 && template && template.slug && (
        <TemplateDownloadButton template={template} />
      )}

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, children, ...props }) => {
            const showButton = !renderedButton && template && template.slug;
            if (showButton) renderedButton = true;

            return (
              <>
                <h1 {...props}>{children}</h1>
                {showButton && <TemplateDownloadButton template={template} />}
              </>
            );
          },
          h2: ({ node, children, ...props }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return <h2 id={id} {...props}>{children}</h2>;
          },
          h3: ({ node, children, ...props }) => {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return <h3 id={id} {...props}>{children}</h3>;
          },
          pre: ({ node, children, ...props }) => (
            <pre {...props}>{children}</pre>
          ),
          code: ({ node, inline, className, children, ...props }) => {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}
