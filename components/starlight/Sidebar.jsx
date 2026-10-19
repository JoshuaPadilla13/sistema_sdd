'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, 
  ChevronRight, 
  Menu, 
  X, 
  ChevronsUpDown, 
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function Sidebar({ tree = [] }) {
  const pathname = usePathname();

  // Estado para controlar qué categorías están expandidas
  const [openCategories, setOpenCategories] = useState({});
  // Estado para abrir/cerrar sidebar en móviles (off-canvas drawer)
  const [mobileOpen, setMobileOpen] = useState(false);
  // Estado para colapsar/expandir sidebar en desktop (lectura en pantalla completa)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // Inicializar categorías: expandir por defecto todas o la que contiene el documento activo
  useEffect(() => {
    const initialState = {};
    tree.forEach((cat) => {
      // Si la categoría contiene el documento activo, asegurar que esté abierta
      const hasActiveDoc = cat.documents?.some((doc) => `/docs/${doc.slug}` === pathname);
      // Por defecto, abrir todas las categorías para facilidad de navegación, o abrir la activa
      initialState[cat.id] = true;
      if (hasActiveDoc) {
        initialState[cat.id] = true;
      }
    });
    setOpenCategories(initialState);
  }, [tree, pathname]);

  // Cerrar el drawer móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Sincronizar clase en el body y layout para centrar el contenido al colapsar el sidebar en PC
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const layout = document.querySelector('.sl-layout');
      if (desktopCollapsed) {
        document.body.classList.add('sl-sidebar-collapsed');
        if (layout) layout.classList.add('sidebar-collapsed');
      } else {
        document.body.classList.remove('sl-sidebar-collapsed');
        if (layout) layout.classList.remove('sidebar-collapsed');
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('sl-sidebar-collapsed');
        const layout = document.querySelector('.sl-layout');
        if (layout) layout.classList.remove('sidebar-collapsed');
      }
    };
  }, [desktopCollapsed]);

  // Alternar el colapso de una categoría específica
  const toggleCategory = (catId) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Alternar expandir/colapsar todas las categorías
  const toggleAllCategories = () => {
    const allOpen = Object.values(openCategories).every(Boolean);
    const newState = {};
    tree.forEach((cat) => {
      newState[cat.id] = !allOpen;
    });
    setOpenCategories(newState);
  };

  const areAllExpanded = Object.values(openCategories).length > 0 && Object.values(openCategories).every(Boolean);

  return (
    <>
      {/* BARRA FLOTANTE / STICKY PARA MÓVILES (< 1024px) */}
      <div className="sl-mobile-sidebar-bar">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="sl-mobile-sidebar-trigger"
          aria-label="Abrir menú de documentación"
        >
          <Menu size={18} />
          <span>Índice de Documentación (Fases SDD)</span>
        </button>
      </div>

      {/* BACKDROP OSCURO PARA MÓVILES */}
      {mobileOpen && (
        <div 
          className="sl-sidebar-backdrop" 
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ASIDE PRINCIPAL (DESKTOP + DRAWER MÓVIL) */}
      <aside 
        className={`sl-sidebar ${mobileOpen ? 'mobile-open' : ''} ${desktopCollapsed ? 'desktop-collapsed' : ''}`}
        aria-label="Navegación de documentación"
      >
        {/* CABECERA DE CONTROL DEL SIDEBAR */}
        <div className="sl-sidebar-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={16} color="var(--sl-color-accent)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sl-color-text-title)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Fases SDD
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {/* Botón expandir/colapsar todas las categorías */}
            <button
              type="button"
              onClick={toggleAllCategories}
              className="sl-icon-btn"
              title={areAllExpanded ? 'Colapsar todas las fases' : 'Expandir todas las fases'}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <ChevronsUpDown size={14} />
              <span className="sl-hide-sm">{areAllExpanded ? 'Colapsar' : 'Expandir'}</span>
            </button>

            {/* Botón cerrar en móvil */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="sl-icon-btn sl-mobile-close-btn"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </button>

            {/* Botón colapsar sidebar en desktop */}
            <button
              type="button"
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
              className="sl-icon-btn sl-desktop-toggle-btn"
              title={desktopCollapsed ? 'Expandir barra lateral' : 'Ocultar barra lateral para lectura'}
              aria-label="Alternar barra lateral"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
        </div>

        {/* LISTADO DE CATEGORÍAS COLAPSABLES (ACORDEÓN) */}
        <div className="sl-sidebar-content">
          {tree.map((cat) => {
            const isOpen = !!openCategories[cat.id];
            const hasActiveDoc = cat.documents?.some((doc) => `/docs/${doc.slug}` === pathname);

            return (
              <div key={cat.id} className={`sl-sidebar-group ${isOpen ? 'is-open' : 'is-collapsed'}`}>
                {/* BOTÓN COLAPSABLE DEL GRUPO */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`sl-sidebar-header-btn ${hasActiveDoc ? 'has-active' : ''}`}
                  aria-expanded={isOpen}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1, minWidth: 0 }}>
                    <span className="sl-chevron-icon" style={{ display: 'flex', alignItems: 'center' }}>
                      {isOpen ? (
                        <ChevronDown size={15} color="var(--sl-color-text-muted)" />
                      ) : (
                        <ChevronRight size={15} color="var(--sl-color-text-muted)" />
                      )}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: hasActiveDoc ? 700 : 600,
                        color: hasActiveDoc ? 'var(--sl-color-accent)' : 'var(--sl-color-text-title)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {cat.title}
                    </span>
                  </div>

                  {cat.badgeText && (
                    <span className={`sl-badge ${cat.badgeVariant || 'note'}`} style={{ marginLeft: '0.5rem', flexShrink: 0 }}>
                      {cat.badgeText}
                    </span>
                  )}
                </button>

                {/* LISTADO DE DOCUMENTOS DENTRO DE LA CATEGORÍA */}
                {isOpen && (
                  <ul className="sl-sidebar-list">
                    {cat.documents && cat.documents.length > 0 ? (
                      cat.documents.map((doc) => {
                        const docPath = `/docs/${doc.slug}`;
                        const isActive = pathname === docPath;
                        return (
                          <li key={doc.id} className={`sl-sidebar-item ${isActive ? 'active' : ''}`}>
                            <Link href={docPath} onClick={() => setMobileOpen(false)}>
                              <span className="sl-sidebar-item-bullet">•</span>
                              <span className="sl-sidebar-item-text">{doc.title}</span>
                            </Link>
                          </li>
                        );
                      })
                    ) : (
                      <li className="sl-sidebar-item" style={{ paddingLeft: '1.75rem', color: 'var(--sl-color-text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                        Próximamente
                      </li>
                    )}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* BOTÓN FLOTANTE PARA RESTAURAR SIDEBAR EN DESKTOP SI ESTÁ COLAPSADO */}
      {desktopCollapsed && (
        <button
          type="button"
          onClick={() => setDesktopCollapsed(false)}
          className="sl-sidebar-restore-btn"
          title="Mostrar barra lateral"
          aria-label="Restaurar barra lateral"
        >
          <PanelLeftOpen size={18} />
          <span>Mostrar Menú</span>
        </button>
      )}
    </>
  );
}
