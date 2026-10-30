'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Download, 
  Search, 
  FolderArchive, 
  FileText, 
  Layers, 
  CheckSquare, 
  Code, 
  TestTube, 
  Rocket, 
  Package, 
  Eye, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const PHASE_ICONS = {
  1: <FileText size={18} color="#58a6ff" />,
  2: <Layers size={18} color="#f2cc60" />,
  3: <CheckSquare size={18} color="#7ee787" />,
  4: <Code size={18} color="#7ee787" />,
  5: <TestTube size={18} color="#bc8cff" />,
  6: <Rocket size={18} color="#ff7b72" />,
  7: <Package size={18} color="#58a6ff" />,
};

const PHASES_INFO = [
  {
    id: 1,
    name: 'Fase 1: Requerimientos',
    shortName: 'Fase 1 · Requerimientos',
    role: 'Product Manager',
    badgeVariant: 'note',
    color: '#58a6ff',
    desc: 'Discovery, especificación de problemas, historias de usuario, reglas de negocio y sintaxis EARS.',
  },
  {
    id: 2,
    name: 'Fase 2: Plan y Diseño',
    shortName: 'Fase 2 · Plan y Diseño',
    role: 'Arquitecto',
    badgeVariant: 'caution',
    color: '#f2cc60',
    desc: 'Arquitectura de software, modelo y diccionario de datos, contratos API y topología.',
  },
  {
    id: 3,
    name: 'Fase 3: Tareas',
    shortName: 'Fase 3 · Tareas',
    role: 'Front & Back Leads',
    badgeVariant: 'success',
    color: '#7ee787',
    desc: 'Desglose ejecutable de tareas en task.md con dependencias y criterios de completitud.',
  },
  {
    id: 4,
    name: 'Fase 4: Desarrollo',
    shortName: 'Fase 4 · Desarrollo',
    role: 'Front & Back / Agentes AI',
    badgeVariant: 'success',
    color: '#7ee787',
    desc: 'Control de cambios CHANGELOG.md, prompts de inicialización de agentes y ejecución de código.',
  },
  {
    id: 5,
    name: 'Fase 5: Testing',
    shortName: 'Fase 5 · Testing',
    role: 'QA / Testers',
    badgeVariant: 'tip',
    color: '#bc8cff',
    desc: 'Test Plan, catálogo de casos de prueba y matrices de cobertura verificable.',
  },
  {
    id: 6,
    name: 'Fase 6: Deploy',
    shortName: 'Fase 6 · Deploy',
    role: 'DevOps / Release Lead',
    badgeVariant: 'danger',
    color: '#ff7b72',
    desc: 'Pipelines CI/CD en GitHub Actions / Vercel y checklist de salida a producción.',
  },
  {
    id: 7,
    name: 'Fase 7: Entrega',
    shortName: 'Fase 7 · Entrega',
    role: 'Arquitecto & PM',
    badgeVariant: 'note',
    color: '#58a6ff',
    desc: 'Acta de entrega y cierre formal con stakeholders, y manuales de operación.',
  },
];

export default function TemplatesByPhase({ initialTemplates = [], title, subtitle }) {
  const [selectedPhase, setSelectedPhase] = useState('all'); // 'all' | 1 | 2 | 3 | 4 | 5 | 6 | 7
  const [searchQuery, setSearchQuery] = useState('');

  // Normalizar y enriquecer plantillas con fase
  const templates = useMemo(() => {
    return initialTemplates.map((t) => {
      let phaseNum = t.phase;
      if (!phaseNum || phaseNum < 1 || phaseNum > 7) {
        const s = (t.slug || '').toLowerCase();
        if (s.includes('rq-') || s.includes('discovery') || s.includes('ears')) phaseNum = 1;
        else if (s.includes('pl-') || s.includes('diseno') || s.includes('arquitectura') || s.includes('modelo-datos') || s.includes('contrato')) phaseNum = 2;
        else if (s.includes('tk-') || s.includes('task') || s.includes('tarea')) phaseNum = 3;
        else if (s.includes('dev-') || s.includes('desarrollo') || s.includes('changelog')) phaseNum = 4;
        else if (s.includes('qa-') || s.includes('test') || s.includes('prueba')) phaseNum = 5;
        else if (s.includes('dp-') || s.includes('deploy') || s.includes('pipeline') || s.includes('produccion')) phaseNum = 6;
        else if (s.includes('en-') || s.includes('entrega') || s.includes('manual') || s.includes('acta')) phaseNum = 7;
        else phaseNum = 1;
      }

      // Extraer código de la plantilla (ej: RQ-01, PL-01, TK-01...)
      const codeMatch = (t.title || '').match(/\b([A-Z]{2}-\d{2})\b/i) || (t.slug || '').match(/([a-z]{2}-\d{2})/i);
      const code = codeMatch ? codeMatch[1].toUpperCase() : `F${phaseNum}`;

      const phaseInfo = PHASES_INFO.find((p) => p.id === phaseNum) || PHASES_INFO[0];

      return {
        ...t,
        phase: phaseNum,
        phaseInfo,
        code,
        downloadUrl: `/api/docs/download/${t.slug}`,
        viewUrl: `/docs/${t.slug}`,
      };
    });
  }, [initialTemplates]);

  // Contadores por fase
  const countsByPhase = useMemo(() => {
    const counts = { all: templates.length };
    PHASES_INFO.forEach((p) => {
      counts[p.id] = templates.filter((t) => t.phase === p.id).length;
    });
    return counts;
  }, [templates]);

  // Filtrar plantillas según fase y término de búsqueda
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchesPhase = selectedPhase === 'all' || t.phase === Number(selectedPhase);
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q);

      return matchesPhase && matchesSearch;
    });
  }, [templates, selectedPhase, searchQuery]);

  // Agrupar por fase para la vista cuando "Todas" está seleccionada
  const groupedByPhase = useMemo(() => {
    if (selectedPhase !== 'all') {
      const phaseNum = Number(selectedPhase);
      const phase = PHASES_INFO.find((p) => p.id === phaseNum);
      return [
        {
          phase,
          items: filteredTemplates,
        },
      ];
    }

    return PHASES_INFO.map((phase) => ({
      phase,
      items: filteredTemplates.filter((t) => t.phase === phase.id),
    })).filter((g) => g.items.length > 0);
  }, [filteredTemplates, selectedPhase]);

  return (
    <section style={{ marginTop: '2.5rem' }}>
      {/* ENCABEZADO DE LA SECCIÓN */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', color: 'var(--sl-color-text-title)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>📄 {title || 'Plantillas Oficiales SDD por Fases'}</span>
          </h2>
          <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.92rem', marginTop: '0.35rem' }}>
            {subtitle || 'Visualiza cada formato con renderizado interactivo o descárgalo individualmente en archivo Markdown (.md).'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <a
            href="/api/agent-factory/download"
            download="agent-factory-sdd.zip"
            className="sl-btn sl-btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem', gap: '0.4rem' }}
          >
            <FolderArchive size={15} />
            <span>Descargar Kit Completo en ZIP</span>
          </a>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS: SELECTOR DE FASES + BUSCADOR */}
      <div style={{
        background: 'var(--sl-color-bg-sidebar)',
        border: '1px solid var(--sl-color-border)',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '2rem',
      }}>
        {/* BUSCADOR */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sl-color-text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código (ej. RQ-01, PL-01), título o palabra clave..."
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem 0.6rem 2.4rem',
              borderRadius: '8px',
              border: '1px solid var(--sl-color-border)',
              background: 'var(--sl-color-bg)',
              color: 'var(--sl-color-text)',
              fontSize: '0.88rem',
            }}
          />
        </div>

        {/* PESTAÑAS SELECTORAS DE FASES */}
        <div style={{
          display: 'flex',
          gap: '0.45rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--sl-color-text-muted)', marginRight: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Filtrar por Fase:
          </span>

          <button
            type="button"
            onClick={() => setSelectedPhase('all')}
            style={{
              padding: '0.35rem 0.8rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '20px',
              border: selectedPhase === 'all' ? '1px solid var(--sl-color-accent)' : '1px solid var(--sl-color-border)',
              background: selectedPhase === 'all' ? 'var(--sl-color-accent)' : 'var(--sl-color-bg)',
              color: selectedPhase === 'all' ? '#ffffff' : 'var(--sl-color-text)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Todas ({countsByPhase.all || 0})
          </button>

          {PHASES_INFO.map((phase) => {
            const isSelected = selectedPhase === String(phase.id);
            const count = countsByPhase[phase.id] || 0;

            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setSelectedPhase(String(phase.id))}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '20px',
                  border: isSelected ? `1px solid ${phase.color}` : '1px solid var(--sl-color-border)',
                  background: isSelected ? `${phase.color}22` : 'var(--sl-color-bg)',
                  color: isSelected ? phase.color : 'var(--sl-color-text)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: phase.color }} />
                <span>{phase.shortName}</span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: isSelected ? phase.color : 'var(--sl-color-border)',
                  color: isSelected ? '#000000' : 'var(--sl-color-text-muted)',
                  fontWeight: 700
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDERIZADO DE PLANTILLAS AGRUPADAS POR FASE */}
      {groupedByPhase.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          background: 'var(--sl-color-bg-sidebar)',
          border: '1px solid var(--sl-color-border)',
          borderRadius: '12px',
          color: 'var(--sl-color-text-muted)',
        }}>
          <FileText size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--sl-color-text)' }}>
            No se encontraron plantillas para el criterio seleccionado
          </p>
          <p style={{ fontSize: '0.85rem' }}>
            Intenta buscar con otro término o selecciona "Todas las Fases".
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {groupedByPhase.map(({ phase, items }) => (
            <div key={phase.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* ENCABEZADO DE FASE */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.75rem',
                borderBottom: `2px solid ${phase.color}44`,
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `${phase.color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {PHASE_ICONS[phase.id]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--sl-color-text-title)', margin: 0 }}>
                      {phase.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--sl-color-text-muted)', margin: '0.15rem 0 0 0' }}>
                      {phase.desc}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`sl-badge ${phase.badgeVariant}`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Rol: {phase.role}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--sl-color-text-muted)', fontWeight: 600 }}>
                    {items.length} {items.length === 1 ? 'plantilla' : 'plantillas'}
                  </span>
                </div>
              </div>

              {/* GRID DE PLANTILLAS DE ESTA FASE */}
              <div className="sl-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {items.map((t) => (
                  <div
                    key={t.slug}
                    className="sl-card"
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderLeft: `3px solid ${phase.color}`,
                    }}
                  >
                    <div>
                      {/* BADGES: CÓDIGO + DESCARGA DIRECTA */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: `${phase.color}22`,
                              color: phase.color,
                              letterSpacing: '0.04em',
                            }}
                          >
                            {t.code}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--sl-color-text-muted)' }}>
                            Fase {t.phase}
                          </span>
                        </div>

                        <a
                          href={t.downloadUrl}
                          download
                          style={{
                            color: 'var(--sl-color-text-muted)',
                            display: 'inline-flex',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            transition: 'all 0.2s',
                          }}
                          title={`Descargar ${t.code} (.md)`}
                        >
                          <Download size={15} />
                        </a>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', color: 'var(--sl-color-text-title)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                        {t.title}
                      </h4>

                      <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.84rem', lineHeight: '1.5' }}>
                        {t.description || 'Plantilla estandarizada en formato Markdown editable para Spec Driven Development.'}
                      </p>
                    </div>

                    {/* BOTONES DE ACCIÓN: VER Y DESCARGAR */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginTop: '1.25rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--sl-color-border)'
                    }}>
                      <Link
                        href={t.viewUrl}
                        className="sl-btn sl-btn-primary"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', flex: 1, justifyContent: 'center' }}
                      >
                        <Eye size={13} />
                        <span>Ver Plantilla</span>
                      </Link>
                      <a
                        href={t.downloadUrl}
                        download
                        className="sl-btn sl-btn-outline"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Descargar archivo Markdown (.md)"
                      >
                        <Download size={13} />
                        <span>.md</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
