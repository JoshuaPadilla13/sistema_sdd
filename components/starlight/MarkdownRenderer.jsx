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
    id: 'note',
    title: 'Nota',
    icon: 'ℹ️',
    color: '#58a6ff',             // Azul
    border: '#388bfd',
    borderLight: 'rgba(56, 139, 253, 0.45)',
    bg: 'rgba(56, 139, 253, 0.18)',
    bgGradient: 'linear-gradient(135deg, rgba(56, 139, 253, 0.24) 0%, rgba(56, 139, 253, 0.12) 100%)',
    badgeBg: 'rgba(56, 139, 253, 0.25)',
    badgeText: '#79c0ff',
  },
  tip: {
    id: 'tip',
    title: 'Consejo',
    icon: '💡',
    color: '#bc8cff',             // Púrpura / Morado
    border: '#a371f7',
    borderLight: 'rgba(163, 113, 247, 0.45)',
    bg: 'rgba(163, 113, 247, 0.18)',
    bgGradient: 'linear-gradient(135deg, rgba(163, 113, 247, 0.24) 0%, rgba(163, 113, 247, 0.12) 100%)',
    badgeBg: 'rgba(163, 113, 247, 0.25)',
    badgeText: '#d2a8ff',
  },
  caution: {
    id: 'caution',
    title: 'Precaución',
    icon: '⚠️',
    color: '#f2cc60',             // Amarillo
    border: '#d29922',
    borderLight: 'rgba(210, 153, 34, 0.50)',
    bg: 'rgba(210, 153, 34, 0.20)',
    bgGradient: 'linear-gradient(135deg, rgba(210, 153, 34, 0.26) 0%, rgba(210, 153, 34, 0.12) 100%)',
    badgeBg: 'rgba(210, 153, 34, 0.28)',
    badgeText: '#f2cc60',
  },
  warning: {
    id: 'caution',
    title: 'Precaución',
    icon: '⚠️',
    color: '#f2cc60',
    border: '#d29922',
    borderLight: 'rgba(210, 153, 34, 0.50)',
    bg: 'rgba(210, 153, 34, 0.20)',
    bgGradient: 'linear-gradient(135deg, rgba(210, 153, 34, 0.26) 0%, rgba(210, 153, 34, 0.12) 100%)',
    badgeBg: 'rgba(210, 153, 34, 0.28)',
    badgeText: '#f2cc60',
  },
  danger: {
    id: 'danger',
    title: 'Peligro',
    icon: '🚨',
    color: '#ff7b72',             // Rojo
    border: '#f85149',
    borderLight: 'rgba(248, 81, 73, 0.50)',
    bg: 'rgba(248, 81, 73, 0.20)',
    bgGradient: 'linear-gradient(135deg, rgba(248, 81, 73, 0.26) 0%, rgba(248, 81, 73, 0.12) 100%)',
    badgeBg: 'rgba(248, 81, 73, 0.28)',
    badgeText: '#ff7b72',
  },
};

export function resolveVariant(raw) {
  if (!raw) return null;
  const tag = raw.toLowerCase().trim();
  if (['tip', 'consejo', 'recomendacion', 'recomendación', 'sugerencia'].includes(tag)) {
    return 'tip';
  }
  if (['caution', 'warning', 'precaucion', 'precaución', 'advertencia', 'alerta', 'atencion', 'atención'].includes(tag)) {
    return 'caution';
  }
  if (['danger', 'peligro', 'critico', 'crítico', 'error'].includes(tag)) {
    return 'danger';
  }
  if (['note', 'nota', 'info', 'important', 'importante', 'aviso'].includes(tag)) {
    return 'note';
  }
  return null;
}

export function extractAlertType(node) {
  if (!node || !node.children) return null;

  for (const child of node.children) {
    if (child.type === 'element' && child.tagName === 'p' && child.children) {
      for (const sub of child.children) {
        if (sub.type === 'text') {
          const match = sub.value.match(/^\s*\[!([a-zA-ZáéíóúÁÉÍÓÚ_-]+)\]/i);
          if (match) return resolveVariant(match[1]);
        }
        if (sub.type === 'element' && (sub.tagName === 'strong' || sub.tagName === 'b') && sub.children?.[0]?.type === 'text') {
          const boldText = sub.children[0].value.replace(/:$/, '').trim();
          const resolved = resolveVariant(boldText);
          if (resolved) return resolved;
        }
      }
    }
  }
  return null;
}

function cleanAlertChildren(children) {
  const list = React.Children.toArray(children);
  let stripped = false;
  return list.map((child, idx) => {
    if (!stripped && React.isValidElement(child) && child.props && child.props.children) {
      const pChildren = React.Children.toArray(child.props.children);
      const newPChildren = [];

      for (let i = 0; i < pChildren.length; i++) {
        const sub = pChildren[i];
        if (!stripped) {
          if (typeof sub === 'string') {
            const replaced = sub.replace(/^\s*\[![a-zA-ZáéíóúÁÉÍÓÚ_-]+\]\s*\n?/i, '');
            if (replaced !== sub) {
              stripped = true;
              if (replaced.trim() !== '') newPChildren.push(replaced);
              continue;
            }
          }
          if (React.isValidElement(sub) && (sub.type === 'strong' || sub.type === 'b')) {
            const innerText = React.Children.toArray(sub.props.children).join('');
            if (resolveVariant(innerText.replace(/:$/, '').trim())) {
              stripped = true;
              if (typeof pChildren[i + 1] === 'string' && pChildren[i + 1].startsWith(':')) {
                pChildren[i + 1] = pChildren[i + 1].substring(1).trimStart();
              }
              continue;
            }
          }
        }
        newPChildren.push(sub);
      }

      if (newPChildren.length === 0 || newPChildren.every((c) => typeof c === 'string' && c.trim() === '')) {
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
            const alertType = extractAlertType(node);

            if (alertType && CALLOUT_ALERT_THEMES[alertType]) {
              const theme = CALLOUT_ALERT_THEMES[alertType];
              const cleanedChildren = cleanAlertChildren(children);

              return (
                <div
                  className={`sl-callout sl-callout-${alertType}`}
                  style={{
                    margin: '1.5rem 0',
                    padding: '1rem 1.25rem',
                    borderRadius: '8px',
                    borderLeft: `5px solid ${theme.border}`,
                    border: `1px solid ${theme.borderLight}`,
                    background: theme.bgGradient,
                    backgroundColor: theme.bg,
                    boxShadow: `0 4px 16px ${theme.border}26`,
                    color: 'var(--sl-color-text)',
                  }}
                >
                  <div style={{ marginBottom: '0.45rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        color: theme.badgeText || theme.color,
                        background: theme.badgeBg,
                        border: `1px solid ${theme.borderLight}`,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                      }}
                    >
                      <span>{theme.icon}</span>
                      <span>{theme.title}</span>
                    </span>
                  </div>
                  <div style={{ lineHeight: 1.65, fontSize: '0.94rem' }}>{cleanedChildren}</div>
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
