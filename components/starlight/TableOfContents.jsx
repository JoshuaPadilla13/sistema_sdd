'use client';

import React from 'react';

export default function TableOfContents({ headings = [] }) {
  if (!headings || headings.length === 0) return null;

  return (
    <aside className="sl-toc-pane">
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
