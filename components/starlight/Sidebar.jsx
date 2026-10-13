'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ tree = [] }) {
  const pathname = usePathname();

  return (
    <aside className="sl-sidebar">
      {tree.map((cat) => (
        <div key={cat.id} className="sl-sidebar-group">
          <div className="sl-sidebar-header">
            <span>{cat.title}</span>
            {cat.badgeText && (
              <span className={`sl-badge ${cat.badgeVariant || 'note'}`}>
                {cat.badgeText}
              </span>
            )}
          </div>
          <ul className="sl-sidebar-list">
            {cat.documents && cat.documents.length > 0 ? (
              cat.documents.map((doc) => {
                const docPath = `/docs/${doc.slug}`;
                const isActive = pathname === docPath;
                return (
                  <li key={doc.id} className={`sl-sidebar-item ${isActive ? 'active' : ''}`}>
                    <Link href={docPath}>
                      {doc.title}
                    </Link>
                  </li>
                );
              })
            ) : (
              <li className="sl-sidebar-item" style={{ paddingLeft: '0.65rem', color: 'var(--sl-color-text-muted)', fontSize: '0.8rem' }}>
                Próximamente
              </li>
            )}
          </ul>
        </div>
      ))}
    </aside>
  );
}
