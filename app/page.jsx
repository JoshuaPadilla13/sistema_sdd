import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Layers, 
  CheckSquare, 
  Code, 
  TestTube, 
  Rocket, 
  Package, 
  ArrowRight,
  Download,
  Bot,
  Sparkles,
  FolderArchive,
  CheckCircle2
} from 'lucide-react';
import Sidebar from '../components/starlight/Sidebar';
import { getNavigationTree, getAvailableTemplates } from '../lib/services/docs';
import TemplatesByPhase from '../components/starlight/TemplatesByPhase';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [tree, templates] = await Promise.all([
    getNavigationTree(),
    getAvailableTemplates(),
  ]);

  const phases = [
    {
      number: '1',
      title: '1. Requerimientos',
      responsible: 'Product Manager',
      badge: 'note',
      icon: <FileText size={24} color="#58a6ff" />,
      description: 'Definición de problemas, objetivos, alcances, historias de usuario en Gherkin, criterios de aceptación en Sintaxis EARS, reglas de negocio y casos de uso.',
      deliverables: 'Minuta Discovery, EARS, US, Reglas de Negocio, Documento Base.',
      href: '/docs/plantillas/rq-08-criterios-aceptacion-ears',
    },
    {
      number: '2',
      title: '2. Plan / Diseño',
      responsible: 'Arquitecto',
      badge: 'caution',
      icon: <Layers size={24} color="#f2cc60" />,
      description: 'Transforma requerimientos aprobados en arquitectura técnica. Selección de stack, diagramas draw.io, modelo de datos, contratos API y estrategia de pruebas.',
      deliverables: 'Selección de Ambientes/Stack, Contrato Endpoints, Diagramas, Estrategia QA.',
      href: '/docs/diseno/modelo-de-datos',
    },
    {
      number: '3',
      title: '3. Tareas',
      responsible: 'Front & Back',
      badge: 'success',
      icon: <CheckSquare size={24} color="#7ee787" />,
      description: 'Desglose ejecutable en un archivo task.md estructurado con dependencias, entregables esperados, tareas obligatorias y opcionales.',
      deliverables: 'task.md con dependencias y criterios de completitud.',
      href: '/docs/introduccion/flujo-sdd',
    },
    {
      number: '4',
      title: '4. Desarrollo',
      responsible: 'Front & Back (Kiro / Agentes)',
      badge: 'success',
      icon: <Code size={24} color="#7ee787" />,
      description: 'Ejecución secuencial de tareas de task.md. Uso del repositorio de prompts de inicialización, control de cambios en CHANGELOG y entregables de código.',
      deliverables: 'Código testeable, pull requests y cumplimiento de especificación.',
      href: '/docs/introduccion/instrucciones-agente',
    },
    {
      number: '5',
      title: '5. Testing',
      responsible: 'QA',
      badge: 'tip',
      icon: <TestTube size={24} color="#bc8cff" />,
      description: 'Ejecución de Test Plan y Test Cases. Pruebas automatizadas (Vitest + RTL + Playwright / xUnit) y reporte de seguridad.',
      deliverables: 'Test Plan, Test Cases, matrices de cobertura y reportes de QA.',
      href: '/docs/introduccion/flujo-sdd',
    },
    {
      number: '6',
      title: '6. Deploy',
      responsible: 'Backend / DevOps',
      badge: 'danger',
      icon: <Rocket size={24} color="#ff7b72" />,
      description: 'Configuración de pools de IIS, ambientes cloud serverless en Vercel, pipelines CI/CD y certificación de estabilidad operacional.',
      deliverables: 'Pipelines CI/CD, infraestructura de ambientes y monitoreo.',
      href: '/docs/introduccion/flujo-sdd',
    },
    {
      number: '7',
      title: '7. Entrega',
      responsible: 'Arquitecto & Product Manager',
      badge: 'note',
      icon: <Package size={24} color="#58a6ff" />,
      description: 'Cierre del proyecto con manuales de usuario, manuales de administración y guías de accesos operacionales.',
      deliverables: 'Manuales de usuario y administración, actas de entrega.',
      href: '/docs/introduccion/flujo-sdd',
    },
  ];

  return (
    <div className="sl-layout">
      <Sidebar tree={tree} />

      <div className="sl-main-container">
        <div className="sl-content-pane" style={{ maxWidth: '1100px' }}>
          {/* HERO CON IMAGEN OFICIAL */}
          <section className="sl-hero">
            <div className="sl-hero-grid">
              <div className="sl-hero-copy">
                <h1 className="sl-hero-title">Spec Driven Development (SDD)</h1>
                <p className="sl-hero-subtitle">
                  Metodología estandarizada de 7 fases para transformar requerimientos de negocio en software riguroso, testeable y ejecutable por equipos e IA.
                </p>
                <div className="sl-hero-actions">
                  <a href="/api/agent-factory/download" download className="sl-btn sl-btn-primary" style={{ gap: '0.5rem' }}>
                    <Download size={16} />
                    <span>Descargar AGENT FACTORY (.ZIP)</span>
                  </a>
                  <Link href="/docs/introduccion/agent-factory" className="sl-btn sl-btn-outline" style={{ gap: '0.45rem' }}>
                    <Bot size={16} />
                    <span>Guía del Agente</span>
                  </Link>
                  <Link href="/docs/introduccion/flujo-sdd" className="sl-btn sl-btn-outline">
                    <span>Flujo de 7 Fases</span>
                  </Link>
                </div>
              </div>

              <div className="sl-hero-image-wrapper">
                <img
                  src="/houston.webp"
                  alt="Houston - Spec Driven Development (SDD)"
                  width="380"
                  height="380"
                  className="sl-hero-image"
                />
              </div>
            </div>
          </section>

          {/* BANNER DESTACADO: KIT BASE AGENT FACTORY */}
          <section style={{
            marginTop: '2.5rem',
            background: 'linear-gradient(135deg, rgba(88, 166, 255, 0.1) 0%, rgba(188, 140, 255, 0.08) 100%)',
            border: '1px solid rgba(88, 166, 255, 0.35)',
            borderRadius: '12px',
            padding: '1.75rem 2rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ flex: '1 1 500px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(88, 166, 255, 0.2)', color: '#58a6ff', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                  <Sparkles size={13} />
                  <span>Kit Base Oficial para Nuevos Proyectos</span>
                </div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--sl-color-text-title)', marginBottom: '0.65rem' }}>
                  📦 AGENT FACTORY — Fase 01 Requerimientos (SDD)
                </h2>
                <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.94rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                  Paquete base comprimido con la configuración completa del agente, las <strong>9 skills</strong> especializadas, <strong>convenciones</strong> obligatorias, <strong>instructivos</strong>, <strong>plantillas</strong> y estructura de carpetas:
                </p>

                {/* 3 MODOS DE USO */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div style={{ background: 'var(--sl-color-bg)', border: '1px solid var(--sl-color-border)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#58a6ff', marginBottom: '0.2rem' }}>
                      Modo 1 · Post-Sesión
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--sl-color-text-muted)', lineHeight: '1.4' }}>
                      Genera RQ-01, RQ-02 y RQ-03 tras cada sesión y reporta los pendientes críticos.
                    </div>
                  </div>
                  <div style={{ background: 'var(--sl-color-bg)', border: '1px solid var(--sl-color-border)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#7ee787', marginBottom: '0.2rem' }}>
                      Modo 2 · Documentación
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--sl-color-text-muted)', lineHeight: '1.4' }}>
                      Genera en orden RQ-04 a RQ-08 y ejecuta la revisión de consistencia.
                    </div>
                  </div>
                  <div style={{ background: 'var(--sl-color-bg)', border: '1px solid var(--sl-color-border)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f2cc60', marginBottom: '0.2rem' }}>
                      Modo 3 · Resolución
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--sl-color-text-muted)', lineHeight: '1.4' }}>
                      Cierra pendientes PEN respondidos y propaga versiones a todos los docs.
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--sl-color-text-muted)' }}>
                  <strong>Contenido del ZIP:</strong> <code>/.kiro/agents</code>, <code>/.kiro/skills</code>, <code>/.kiro/steering</code>, <code>/instructivos</code>, <code>/documentacion</code>, <code>/templates</code>, <code>/transcripciones discovery</code> y <code>README.md</code>.
                </div>
              </div>

              {/* ACCIONES DE DESCARGA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignSelf: 'center', minWidth: '220px' }}>
                <a
                  href="/api/agent-factory/download"
                  download="agent-factory-sdd.zip"
                  className="sl-btn sl-btn-primary"
                  style={{
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    boxShadow: '0 4px 14px rgba(88, 166, 255, 0.4)'
                  }}
                >
                  <Download size={18} />
                  <span>Descargar ZIP Base</span>
                </a>

                <Link
                  href="/docs/introduccion/agent-factory"
                  className="sl-btn sl-btn-outline"
                  style={{
                    padding: '0.6rem 1rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Bot size={15} />
                  <span>Ver Prompt y Guía</span>
                </Link>
              </div>
            </div>
          </section>

          {/* PLANTILLAS OFICIALES POR FASES */}
          <TemplatesByPhase initialTemplates={templates} />

          {/* 7 FASES GRID */}
          <section style={{ marginTop: '3.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--sl-color-text-title)', marginBottom: '1.5rem', borderBottom: '1px solid var(--sl-color-border)', paddingBottom: '0.5rem' }}>
              🚀 Las 7 Fases del Desarrollo Guiado por Especificaciones
            </h2>
            <div className="sl-cards-grid">
              {phases.map((p) => (
                <div key={p.number} className="sl-card">
                  <div>
                    <div className="sl-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {p.icon}
                        <h3 className="sl-card-title">{p.title}</h3>
                      </div>
                      <span className={`sl-badge ${p.badge}`}>{p.responsible}</span>
                    </div>
                    <p className="sl-card-body">{p.description}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--sl-color-text-muted)', fontStyle: 'italic', marginBottom: '1rem' }}>
                      <strong>Entregables:</strong> {p.deliverables}
                    </p>
                  </div>
                  <Link href={p.href} className="sl-btn sl-btn-outline" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', alignSelf: 'flex-start' }}>
                    <span>Ver fase</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
