'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Shield, Settings, User, LogIn, LogOut } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [authState, setAuthState] = useState({
    loading: true,
    isAuthenticated: false,
    user: null,
    roles: [],
    isSuperAdmin: false,
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setAuthState({
          loading: false,
          isAuthenticated: !!data.isAuthenticated,
          user: data.user || null,
          roles: Array.isArray(data.roles) ? data.roles : [],
          isSuperAdmin: !!data.isSuperAdmin,
        });
      })
      .catch(() => {
        setAuthState({
          loading: false,
          isAuthenticated: false,
          user: null,
          roles: [],
          isSuperAdmin: false,
        });
      });
  }, [pathname]);

  const isAdmin = authState.roles.includes('ADMIN') || authState.isSuperAdmin;
  const isSuperAdmin = authState.isSuperAdmin;

  return (
    <header className="sl-header">
      {/* LOGO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" className="sl-logo">
          <BookOpen size={22} color="var(--sl-color-accent)" />
          <span>Spec Driven Development (SDD)</span>
        </Link>
      </div>

      {/* NAVEGACIÓN */}
      <nav className="sl-nav-links">
        <Link 
          href="/docs/introduccion/que-es-sdd" 
          className={`sl-nav-link ${pathname?.startsWith('/docs/introduccion') ? 'active' : ''}`}
        >
          Documentación
        </Link>
        <Link 
          href="/docs/plantillas/documento-base-proyecto" 
          className={`sl-nav-link ${pathname?.startsWith('/docs/plantillas') ? 'active' : ''}`}
        >
          Plantillas
        </Link>

        {/* PESTAÑAS ADMINISTRATIVAS CONDICIONALES (SOLO VISIBLES SI ESTÁ AUTORIZADO) */}
        {authState.isAuthenticated && isAdmin && (
          <Link
            href="/admin"
            className={`sl-nav-link ${pathname?.startsWith('/admin') ? 'active' : ''}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              color: 'var(--sl-badge-caution)',
              fontWeight: 600,
            }}
          >
            <Settings size={15} />
            <span>Administrador</span>
          </Link>
        )}

        {authState.isAuthenticated && isSuperAdmin && (
          <Link
            href="/superadmin"
            className={`sl-nav-link ${pathname?.startsWith('/superadmin') ? 'active' : ''}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              color: '#ff7b72',
              fontWeight: 600,
            }}
          >
            <Shield size={15} />
            <span>Super Admin</span>
          </Link>
        )}

        {/* ESTADO DE SESIÓN (LOGIN / USER DROPDOWN) */}
        {!authState.loading && (
          <div style={{ marginLeft: '0.5rem', display: 'flex', alignItems: 'center' }}>
            {authState.isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--sl-color-text-muted)' }}>
                  {authState.user?.name || authState.user?.email}
                </span>
                <a
                  href="/auth/logout"
                  className="sl-btn sl-btn-outline"
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem' }}
                  title="Cerrar sesión"
                >
                  <LogOut size={13} />
                  <span>Salir</span>
                </a>
              </div>
            ) : (
              <Link
                href="/login"
                className="sl-btn sl-btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.3rem 0.75rem' }}
              >
                <LogIn size={14} />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
