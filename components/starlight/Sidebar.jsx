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
  PanelLeftOpen,
  FileText,
  Layers,
  FolderArchive,
  ExternalLink,
  Settings,
  Shield
} from 'lucide-react';

const SDD_PHASES_SIDEBAR = [
  {
    phase: 1,
    title: 'Fase 1 · Requerimientos',
    role: 'Product Manager',
    badgeVariant: 'note',
    color: '#58a6ff',
  },
  {
    phase: 2,
    title: 'Fase 2 · Plan y Diseño',
    role: 'Arquitecto',
    badgeVariant: 'caution',
    color: '#f2cc60',
  },
  {
    phase: 3,
    title: 'Fase 3 · Tareas',
    role: 'Front & Back',
    badgeVariant: 'success',
    color: '#7ee787',
  },
  {
    phase: 4,
    title: 'Fase 4 · Desarrollo',
    role: 'Agentes AI',
    badgeVariant: 'success',
    color: '#7ee787',
  },
  {
    phase: 5,
    title: 'Fase 5 · Testing',
    role: 'QA',
    badgeVariant: 'tip',
    color: '#bc8cff',
  },
  {
    phase: 6,
    title: 'Fase 6 · Deploy',
    role: 'DevOps',
    badgeVariant: 'danger',
    color: '#ff7b72',
  },
  {
    phase: 7,
    title: 'Fase 7 · Entrega',
    role: 'Arquitecto & PM',
    badgeVariant: 'note',
    color: '#58a6ff',
  },
];

export default function Sidebar({ tree = [] }) {
  const pathname = usePathname();

  // Separar categorías de documentación vs categoría de plantillas
  const docCategories = tree.filter((c) => c.slug !== 'plantillas');
  const plantillasCat = tree.find((c) => c.slug === 'plantillas');
  const allTemplates = plantillasCat?.documents || [];

  // Estados para colapsar/expandir categorías de documentación
  const [openCategories, setOpenCategories] = useState({});

  // Estados independientes para colapsar/expandir plantillas por fase
  const [openTemplatePhases, setOpenTemplatePhases] = useState({ 1: true, 2: true });

  // Estado para abrir/cerrar sidebar en móviles (off-canvas drawer)
  const [mobileOpen, setMobileOpen] = useState(false);
  // Estado para colapsar/expandir sidebar en desktop (lectura en pantalla completa)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  // Inicializar estados: expandir por defecto o según la ruta activa
  useEffect(() => {
    const initialCats = {};
    docCategories.forEach((cat) => {
      const hasActiveDoc = cat.documents?.some((doc) => `/docs/${doc.slug}` === pathname);
      initialCats[cat.id] = true;
      if (hasActiveDoc) {
        initialCats[cat.id] = true;
      }
    });
    setOpenCategories(initialCats);

    // Identificar si el documento activo pertenece a alguna fase de plantillas
    const activeTemplate = allTemplates.find((doc) => `/docs/${doc.slug}` === pathname);
    if (activeTemplate) {
      setOpenTemplatePhases((prev) => ({
        ...prev,
        [activeTemplate.phase || 1]: true,
      }));
    } else if (pathname === '/docs/plantillas') {
      setOpenTemplatePhases({ 1: true, 2: true });
    }
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

  // Alternar el colapso de una fase de plantillas
  const toggleTemplatePhase = (phaseNum) => {
    setOpenTemplatePhases((prev) => ({
      ...prev,
      [phaseNum]: !prev[phaseNum],
    }));
  };

  // Alternar expandir/colapsar todas las categorías y plantillas
  const toggleAllCategories = () => {
    const allOpen = Object.values(openCategories).every(Boolean) && Object.values(openTemplatePhases).every(Boolean);
    const newCats = {};
    docCategories.forEach((cat) => {
      newCats[cat.id] = !allOpen;
    });
    setOpenCategories(newCats);
    setOpenTemplatePhases({
      1: !allOpen,
      2: !allOpen,
      3: !allOpen,
      4: !allOpen,
      5: !allOpen,
      6: !allOpen,
      7: !allOpen,
    });
  };

  const areAllExpanded =
    Object.values(openCategories).length > 0 &&
    Object.values(openCategories).every(Boolean) &&
    Object.values(openTemplatePhases).every(Boolean);

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
          <span>Índice de Documentación y Plantillas SDD</span>
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
        aria-label="Navegación de documentación y plantillas"
      >
        {/* CABECERA DE CONTROL DEL SIDEBAR */}
        <div className="sl-sidebar-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={16} color="var(--sl-color-accent)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--sl-color-text-title)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Navegación SDD
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {/* Botón expandir/colapsar todo */}
            <button
              type="button"
              onClick={toggleAllCategories}
              className="sl-icon-btn"
              title={areAllExpanded ? 'Colapsar todo' : 'Expandir todo'}
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

        {/* CONTENIDO DEL SIDEBAR */}
        <div className="sl-sidebar-content">
          {/* SECCIÓN 1: FASES Y DOCUMENTACIÓN DE PROYECTO */}
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--sl-color-text-muted)',
            padding: '0.4rem 0.75rem 0.35rem',
            opacity: 0.85
          }}>
            📖 Fases y Ejemplos de Proyecto
          </div>

          {docCategories.map((cat) => {
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

          {/* SECCIÓN 2: SEPARADOR VISUAL PARA PLANTILLAS OFICIALES POR FASE */}
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '0.9rem',
            borderTop: '1px solid var(--sl-color-border)',
            marginBottom: '0.4rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--sl-color-accent)',
            }}>
              📄 Plantillas Oficiales por Fase
            </span>
            <Link
              href="/docs/plantillas"
              onClick={() => setMobileOpen(false)}
              style={{
                fontSize: '0.72rem',
                color: 'var(--sl-color-accent)',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
              title="Abrir catálogo interactivo de plantillas por fases"
            >
              <span>Ver catálogo</span>
              <ExternalLink size={11} />
            </Link>
          </div>

          {/* BOTÓN GENERAL AL CATÁLOGO DE PLANTILLAS */}
          <div style={{ padding: '0 0.5rem 0.5rem' }}>
            <Link
              href="/docs/plantillas"
              onClick={() => setMobileOpen(false)}
              className={`sl-sidebar-item ${pathname === '/docs/plantillas' ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                background: pathname === '/docs/plantillas' ? 'rgba(88, 166, 255, 0.15)' : 'var(--sl-color-bg)',
                border: `1px solid ${pathname === '/docs/plantillas' ? 'var(--sl-color-accent)' : 'var(--sl-color-border)'}`,
                color: pathname === '/docs/plantillas' ? 'var(--sl-color-accent)' : 'var(--sl-color-text)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <span>🗂️</span>
              <span>Catálogo Completo por Fases</span>
            </Link>
          </div>

          {/* GRUPOS INDEPENDIENTES DE PLANTILLAS POR CADA FASE */}
          {SDD_PHASES_SIDEBAR.map((phaseMeta) => {
            const pNum = phaseMeta.phase;
            const phaseDocs = allTemplates.filter((d) => (d.phase || 1) === pNum);
            const isOpen = !!openTemplatePhases[pNum];
            const hasActiveDoc = phaseDocs.some((d) => `/docs/${d.slug}` === pathname);
            const count = phaseDocs.length;

            return (
              <div key={pNum} className={`sl-sidebar-group ${isOpen ? 'is-open' : 'is-collapsed'}`} style={{ marginBottom: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => toggleTemplatePhase(pNum)}
                  className={`sl-sidebar-header-btn ${hasActiveDoc ? 'has-active' : ''}`}
                  aria-expanded={isOpen}
                  style={{
                    borderLeft: `3px solid ${phaseMeta.color}`,
                    paddingLeft: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flex: 1, minWidth: 0 }}>
                    <span className="sl-chevron-icon" style={{ display: 'flex', alignItems: 'center' }}>
                      {isOpen ? (
                        <ChevronDown size={14} color="var(--sl-color-text-muted)" />
                      ) : (
                        <ChevronRight size={14} color="var(--sl-color-text-muted)" />
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: '0.83rem',
                        fontWeight: hasActiveDoc ? 700 : 600,
                        color: hasActiveDoc ? 'var(--sl-color-accent)' : 'var(--sl-color-text-title)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {phaseMeta.title}
                    </span>
                  </div>

                  <span
                    className={`sl-badge ${phaseMeta.badgeVariant || 'note'}`}
                    style={{ marginLeft: '0.4rem', fontSize: '0.68rem', padding: '0.1rem 0.45rem', flexShrink: 0 }}
                  >
                    {count > 0 ? `${count} plantillas` : 'Próximamente'}
                  </span>
                </button>

                {isOpen && (
                  <ul className="sl-sidebar-list">
                    {count > 0 ? (
                      phaseDocs.map((doc) => {
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
                        Plantillas en desarrollo
                      </li>
                    )}
                  </ul>
                )}
              </div>
            );
          })}

          {/* SECCIÓN 3: ACCESO ADMINISTRATIVO (VISIBLES PARA CUALQUIER USUARIO) */}
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '0.9rem',
            borderTop: '1px solid var(--sl-color-border)',
            marginBottom: '0.5rem',
            paddingLeft: '0.75rem',
            paddingRight: '0.75rem',
          }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--sl-badge-caution, #f2cc60)',
            }}>
              🛠️ Control y Administración
            </span>
          </div>

          <div style={{ padding: '0 0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className={`sl-sidebar-item ${pathname?.startsWith('/admin') ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                background: pathname?.startsWith('/admin') ? 'rgba(242, 204, 96, 0.15)' : 'var(--sl-color-bg)',
                border: `1px solid ${pathname?.startsWith('/admin') ? 'rgba(242, 204, 96, 0.4)' : 'var(--sl-color-border)'}`,
                color: pathname?.startsWith('/admin') ? '#f2cc60' : 'var(--sl-color-text)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <Settings size={15} color="#f2cc60" />
              <span>Panel de Administrador</span>
            </Link>

            <Link
              href="/superadmin"
              onClick={() => setMobileOpen(false)}
              className={`sl-sidebar-item ${pathname?.startsWith('/superadmin') ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                background: pathname?.startsWith('/superadmin') ? 'rgba(255, 123, 114, 0.15)' : 'var(--sl-color-bg)',
                border: `1px solid ${pathname?.startsWith('/superadmin') ? 'rgba(255, 123, 114, 0.4)' : 'var(--sl-color-border)'}`,
                color: pathname?.startsWith('/superadmin') ? '#ff7b72' : 'var(--sl-color-text)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <Shield size={15} color="#ff7b72" />
              <span>Super Admin & Auditoría</span>
            </Link>
          </div>
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
