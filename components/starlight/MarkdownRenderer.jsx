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

const CALLOUT_ALERT_THEMES = {
  note: {
    title: 'Nota',
    icon: 'ℹ️',
    color: '#58a6ff',
    border: '#388bfd',
    bg: 'rgba(56, 139, 253, 0.1)',
  },
  tip: {
    title: 'Consejo',
    icon: '💡',
    color: '#bc8cff',
    border: '#a371f7',
    bg: 'rgba(163, 113, 247, 0.12)',
  },
  caution: {
    title: 'Precaución',
    icon: '⚠️',
    color: '#f2cc60',
    border: '#d29922',
    bg: 'rgba(210, 153, 34, 0.12)',
  },
  warning: {
    title: 'Precaución',
    icon: '⚠️',
    color: '#f2cc60',
    border: '#d29922',
    bg: 'rgba(210, 153, 34, 0.12)',
  },
  danger: {
    title: 'Peligro',
    icon: '🚨',
    color: '#ff7b72',
    border: '#f85149',
    bg: 'rgba(248, 81, 73, 0.12)',
  },
};

function cleanAlertChildren(children) {
  const list = React.Children.toArray(children);
  let stripped = false;
  return list.map((child, idx) => {
    if (!stripped && React.isValidElement(child) && child.props && child.props.children) {
      const pChildren = React.Children.toArray(child.props.children);
      const newPChildren = pChildren.map((subChild) => {
        if (!stripped && typeof subChild === 'string') {
          const replaced = subChild.replace(/^\[!(NOTE|TIP|CAUTION|WARNING|DANGER)\]\s*\n?/i, '');
          if (replaced !== subChild) {
            stripped = true;
            return replaced;
          }
        }
        return subChild;
      });
      // Si el primer párrafo quedó completamente vacío tras remover el tag [!TAG], omitirlo
      if (newPChildren.every((c) => typeof c === 'string' && c.trim() === '')) {
        return null;
      }
      return React.cloneElement(child, { key: child.key || idx }, ...newPChildren);
    }
    return child;
  }).filter(Boolean);
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
          blockquote: ({ node, children, ...props }) => {
            let alertType = null;
            if (node && node.children) {
              for (const child of node.children) {
                if (child.type === 'element' && child.tagName === 'p' && child.children && child.children[0]?.type === 'text') {
                  const match = child.children[0].value.match(/^\[!(NOTE|TIP|CAUTION|WARNING|DANGER)\]/i);
                  if (match) {
                    alertType = match[1].toLowerCase();
                    break;
                  }
                }
              }
            }

            if (alertType && CALLOUT_ALERT_THEMES[alertType]) {
              const theme = CALLOUT_ALERT_THEMES[alertType];
              const cleanedChildren = cleanAlertChildren(children);

              return (
                <div
                  className={`sl-callout sl-callout-${alertType}`}
                  style={{
                    margin: '1.25rem 0',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${theme.border}`,
                    border: `1px solid ${theme.border}44`,
                    background: theme.bg,
                    color: 'var(--sl-color-text)',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: theme.color,
                      marginBottom: '0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                    }}
                  >
                    <span>{theme.icon}</span>
                    <span>{theme.title}</span>
                  </div>
                  <div style={{ lineHeight: 1.6 }}>{cleanedChildren}</div>
                </div>
              );
            }

            return <blockquote {...props}>{children}</blockquote>;
          },
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
}
