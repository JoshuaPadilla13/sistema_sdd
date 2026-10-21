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
  Download
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
      href: '/docs/requerimientos/sintaxis-ears',
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

  const quickTemplates = [
    {
      title: 'Plantilla de Historias de Usuario',
      desc: 'Formato estricto con metadatos, Gherkin, UI/UX y especificación técnica.',
      href: '/docs/requerimientos/historias-de-usuario',
    },
    {
      title: 'Guía de Sintaxis EARS',
      desc: 'Los 5 patrones de EARS para redactar requisitos sin ambigüedad.',
      href: '/docs/requerimientos/sintaxis-ears',
    },
    {
      title: 'Plantilla Documento Base de Proyecto',
      desc: 'Estructura canónica de inicio de proyecto para Product Managers y Arquitectos.',
      href: '/docs/plantillas/documento-base-proyecto',
    },
    {
      title: 'Modelo y Diccionario de Datos',
      desc: 'Especificación relacional PostgreSQL con Drizzle ORM.',
      href: '/docs/diseno/modelo-de-datos',
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
                  <Link href="/docs/introduccion/flujo-sdd" className="sl-btn sl-btn-primary">
                    <span>Explorar las 7 Fases</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/docs/plantillas/documento-base-proyecto" className="sl-btn sl-btn-outline">
                    <span>Ver Plantillas Oficiales</span>
                  </Link>
                  <Link href="/docs/requerimientos/sintaxis-ears" className="sl-btn sl-btn-outline">
                    <span>Sintaxis EARS</span>
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

          {/* ACCESOS RÁPIDOS */}
          <section style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--sl-color-text-title)', marginBottom: '1.5rem', borderBottom: '1px solid var(--sl-color-border)', paddingBottom: '0.5rem' }}>
              📚 Accesos Rápidos a Documentos y Plantillas
            </h2>
            <div className="sl-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {quickTemplates.map((item, idx) => (
                <Link key={idx} href={item.href} style={{ textDecoration: 'none' }}>
                  <div className="sl-card" style={{ height: '100%' }}>
                    <div>
                      <h4 style={{ color: 'var(--sl-color-accent)', fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                        {item.title}
                      </h4>
                      <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.88rem' }}>
                        {item.desc}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--sl-color-accent)', fontSize: '0.82rem', marginTop: '1rem' }}>
                      <span>Abrir especificación</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
