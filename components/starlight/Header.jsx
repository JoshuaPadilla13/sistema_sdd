'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Shield, Settings, FileText, ArrowRight } from 'lucide-react';

export default function Header() {
  return (
    <header className="sl-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" className="sl-logo">
          <BookOpen size={22} color="var(--sl-color-accent)" />
          <span>Spec Driven Development (SDD)</span>
        </Link>
      </div>

      <nav className="sl-nav-links">
        <Link href="/docs/introduccion/que-es-sdd" className="sl-nav-link">
          Documentación
        </Link>
        <Link href="/docs/plantillas/documento-base-proyecto" className="sl-nav-link">
          Plantillas
        </Link>
        <Link href="/admin" className="sl-nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Settings size={15} />
          <span>Admin</span>
        </Link>
        <Link href="/superadmin" className="sl-nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Shield size={15} />
          <span>Super Admin</span>
        </Link>
      </nav>
    </header>
  );
}
