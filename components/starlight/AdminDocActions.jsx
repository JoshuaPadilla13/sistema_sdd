'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Edit3 } from 'lucide-react';

export default function AdminDocActions({ documentId, slug }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.roles && (data.roles.includes('ADMIN') || data.roles.includes('SUPER_ADMIN'))) {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', gap: '0.6rem' }}>
      {/* Botón Descargar .md (Público para todos los usuarios) */}
      <a 
        href={`/api/docs/download/${slug}`} 
        download
        className="sl-btn sl-btn-outline"
        style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
        title="Descargar archivo Markdown (.md)"
      >
        <Download size={14} />
        <span>Descargar .md</span>
      </a>

      {/* Botón Editar (SOLO para administradores autenticados) */}
      {isAdmin && (
        <Link
          href={`/admin/documents/${documentId}`}
          className="sl-btn sl-btn-outline"
          style={{ 
            fontSize: '0.82rem', 
            padding: '0.35rem 0.75rem',
            borderColor: 'var(--sl-badge-caution)',
            color: '#f2cc60',
          }}
          title="Editar bloques en panel de Administrador"
        >
          <Edit3 size={14} />
          <span>Editar Bloques</span>
        </Link>
      )}
    </div>
  );
}
