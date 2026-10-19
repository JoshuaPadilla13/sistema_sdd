'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Shield, Settings, User, LogIn, LogOut, Menu, X } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Cerrar menú móvil al navegar a otra página
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isAdmin = authState.roles.includes('ADMIN') || authState.isSuperAdmin;
  const isSuperAdmin = authState.isSuperAdmin;

  return (
    <>
      <header className="sl-header">
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" className="sl-logo">
            <BookOpen size={22} color="var(--sl-color-accent)" />
            <span className="sl-logo-text">Spec Driven Development (SDD)</span>
          </Link>
        </div>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="sl-nav-links sl-desktop-nav">
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

          {/* PESTAÑAS ADMINISTRATIVAS CONDICIONALES */}
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

          {/* ESTADO DE SESIÓN (DESKTOP) */}
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

        {/* BOTÓN HAMBURGUESA PARA MÓVILES */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sl-mobile-menu-btn"
          aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* MENÚ MÓVIL COLAPSABLE (DROPDOWN / DRAWER) */}
      {mobileMenuOpen && (
        <>
          <div 
            className="sl-mobile-nav-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav className="sl-mobile-nav-drawer" aria-label="Menú principal móvil">
            <div className="sl-mobile-nav-content">
              <Link 
                href="/docs/introduccion/que-es-sdd" 
                className={`sl-mobile-nav-item ${pathname?.startsWith('/docs/introduccion') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen size={18} />
                <span>Documentación</span>
              </Link>
              <Link 
                href="/docs/plantillas/documento-base-proyecto" 
                className={`sl-mobile-nav-item ${pathname?.startsWith('/docs/plantillas') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Plantillas y Guías</span>
              </Link>

              {authState.isAuthenticated && isAdmin && (
                <Link
                  href="/admin"
                  className={`sl-mobile-nav-item ${pathname?.startsWith('/admin') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: 'var(--sl-badge-caution)' }}
                >
                  <Settings size={18} />
                  <span>Panel Administrador</span>
                </Link>
              )}

              {authState.isAuthenticated && isSuperAdmin && (
                <Link
                  href="/superadmin"
                  className={`sl-mobile-nav-item ${pathname?.startsWith('/superadmin') ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ color: '#ff7b72' }}
                >
                  <Shield size={18} />
                  <span>Panel Super Admin</span>
                </Link>
              )}

              <div className="sl-mobile-nav-divider" />

              {!authState.loading && (
                <div>
                  {authState.isAuthenticated ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--sl-color-text-muted)', fontSize: '0.85rem' }}>
                        <User size={16} />
                        <span>{authState.user?.name || authState.user?.email}</span>
                      </div>
                      <a
                        href="/auth/logout"
                        className="sl-btn sl-btn-outline"
                        style={{ justifyContent: 'center', width: '100%', padding: '0.6rem' }}
                      >
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                      </a>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="sl-btn sl-btn-primary"
                      style={{ justifyContent: 'center', width: '100%', padding: '0.6rem' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LogIn size={16} />
                      <span>Iniciar Sesión</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
