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
import { getNavigationTree } from '../lib/services/docs';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tree = await getNavigationTree();

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

  // Las 8 plantillas canónicas de AGENT FACTORY (Fase 1)
  const canonicalTemplates = [
    {
      code: 'RQ-01',
      title: 'RQ-01 · Checklist de Discovery',
      desc: 'Checklist en tiempo real para sesiones de Discovery, verificación de cobertura y preguntas de rescate.',
      href: '/docs/plantillas/rq-01-checklist-discovery',
      downloadUrl: '/api/docs/download/plantillas/rq-01-checklist-discovery',
    },
    {
      code: 'RQ-02',
      title: 'RQ-02 · Cuestionario de Discovery',
      desc: 'Cuestionario completo para clientes en lenguaje sencillo sin tecnicismos para reuniones iniciales.',
      href: '/docs/plantillas/rq-02-cuestionario-discovery',
      downloadUrl: '/api/docs/download/plantillas/rq-02-cuestionario-discovery',
    },
    {
      code: 'RQ-03',
      title: 'RQ-03 · Minuta de Discovery',
      desc: 'Minuta formal de sesión con decisiones, suposiciones y registro de pendientes críticos PEN.',
      href: '/docs/plantillas/rq-03-minuta-discovery',
      downloadUrl: '/api/docs/download/plantillas/rq-03-minuta-discovery',
    },
    {
      code: 'RQ-04',
      title: 'RQ-04 · Documento Base de Proyecto',
      desc: 'Definición canónica de problemas, objetivos, límites de alcance, actores y glosario del proyecto.',
      href: '/docs/plantillas/rq-04-documento-base',
      downloadUrl: '/api/docs/download/plantillas/rq-04-documento-base',
    },
    {
      code: 'RQ-05',
      title: 'RQ-05 · Historias de Usuario',
      desc: 'Estructura ágil centrada en actor, Como/Quiero/Para, prioridad y contribución a objetivos.',
      href: '/docs/plantillas/rq-05-historias-usuario',
      downloadUrl: '/api/docs/download/plantillas/rq-05-historias-usuario',
    },
    {
      code: 'RQ-06',
      title: 'RQ-06 · Reglas de Negocio',
      desc: 'Catálogo de restricciones, cálculos e invariantes del dominio de negocio (RN-001...).',
      href: '/docs/plantillas/rq-06-reglas-negocio',
      downloadUrl: '/api/docs/download/plantillas/rq-06-reglas-negocio',
    },
    {
      code: 'RQ-07',
      title: 'RQ-07 · Casos de Uso',
      desc: 'Especificación de casos de uso (CU-001...), flujos principales, alternos y excepciones.',
      href: '/docs/plantillas/rq-07-casos-uso',
      downloadUrl: '/api/docs/download/plantillas/rq-07-casos-uso',
    },
    {
      code: 'RQ-08',
      title: 'RQ-08 · Criterios EARS',
      desc: 'Criterios de aceptación verificables bajo los 5 patrones estandarizados de sintaxis EARS.',
      href: '/docs/plantillas/rq-08-criterios-aceptacion-ears',
      downloadUrl: '/api/docs/download/plantillas/rq-08-criterios-aceptacion-ears',
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

          {/* PLANTILLAS OFICIALES INDIVIDUALES (RQ-01 A RQ-08) */}
          <section style={{ marginTop: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--sl-color-text-title)', margin: 0 }}>
                  📄 Plantillas Oficiales para Descarga Individual
                </h2>
                <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                  Puedes visualizar cada plantilla con renderizado interactivo o descargarla individualmente en formato Markdown (.md).
                </p>
              </div>
              <a
                href="/api/agent-factory/download"
                download
                className="sl-btn sl-btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', gap: '0.4rem' }}
              >
                <FolderArchive size={14} />
                <span>Descargar Todas en ZIP</span>
              </a>
            </div>

            <div className="sl-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {canonicalTemplates.map((t) => (
                <div key={t.code} className="sl-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="sl-badge note" style={{ fontWeight: 700 }}>{t.code}</span>
                      <a
                        href={t.downloadUrl}
                        download
                        style={{ color: 'var(--sl-color-text-muted)', display: 'inline-flex', padding: '4px', borderRadius: '4px', transition: 'color 0.2s' }}
                        title={`Descargar ${t.code} (.md)`}
                      >
                        <Download size={15} />
                      </a>
                    </div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--sl-color-text-title)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                      {t.title}
                    </h3>
                    <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      {t.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--sl-color-border)' }}>
                    <Link
                      href={t.href}
                      className="sl-btn sl-btn-primary"
                      style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', flex: 1, justifyContent: 'center' }}
                    >
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
          </section>

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
