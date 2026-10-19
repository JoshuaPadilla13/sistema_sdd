'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, List } from 'lucide-react';

/**
 * TOC para móviles / tablets: Acordeón colapsable ubicado al inicio del documento
 */
export function MobileTableOfContents({ headings = [] }) {
  const [expanded, setExpanded] = useState(false);

  if (!headings || headings.length === 0) return null;

  return (
    <div className="sl-mobile-toc">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="sl-mobile-toc-toggle"
        aria-expanded={expanded}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <List size={16} color="var(--sl-color-accent)" />
          <span style={{ fontWeight: 600 }}>En esta página</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--sl-color-text-muted)' }}>
            ({headings.length} secciones)
          </span>
        </div>
        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {expanded && (
        <div className="sl-mobile-toc-dropdown">
          <ul className="sl-toc-list">
            {headings.map((h, idx) => (
              <li key={idx} className={`sl-toc-item depth-${h.level}`}>
                <a href={`#${h.id}`} onClick={() => setExpanded(false)}>
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * TOC para Desktop: Barra lateral fija derecha
 */
export default function TableOfContents({ headings = [] }) {
  if (!headings || headings.length === 0) return null;

  return (
    <aside className="sl-toc-pane sl-desktop-toc">
      <div className="sl-toc-title">En esta página</div>
      <ul className="sl-toc-list">
        {headings.map((h, idx) => (
          <li key={idx} className={`sl-toc-item depth-${h.level}`}>
            <a href={`#${h.id}`}>
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
