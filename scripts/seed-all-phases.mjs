import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../lib/db/index.js";
import * as schema from "../lib/db/schema.js";
import { eq, like, or } from "drizzle-orm";
import { importMarkdownFile } from "../lib/services/docs.js";

const newTemplates = [
  // FASE 2: PLAN Y DISEÑO
  {
    phase: 2,
    code: "PL-01",
    file: "PL-01_arquitectura-stack.md",
    slug: "plantillas/pl-01-arquitectura-stack",
    title: "Plantilla PL-01: Documento de Arquitectura y Stack",
    description: "Especificación de decisiones arquitectónicas (ADR), selección de stack tecnológico, ambientes y topología del sistema.",
    content: `# Plantilla PL-01: Documento de Arquitectura y Stack (SDD)

| Campo | Valor |
|-------|-------|
| Documento | PL-01 · Arquitectura y Stack Tecnológico |
| Fase | Fase 2: Plan / Diseño |
| Versión | 1.0 |
| Rol Responsable | Arquitecto de Software |
| Estado | Aprobado |

---

## 1. Visión Arquitectónica General
[Resumen de la solución técnica, patrón arquitectónico elegido: Monolito Modular, Microservicios, Serverless, Jamstack, etc.]

---

## 2. Decisiones de Stack Tecnológico (ADR - Architecture Decision Records)
| Capa | Tecnología / Framework | Versión | Justificación Técnica |
|------|------------------------|---------|-----------------------|
| Frontend | Next.js / React | 15+ | SSR, Turbopack, App Router y SEO optimizado |
| Backend API | Node.js / Serverless Routes | 20+ LTS | Escalabilidad horizontal y bajo consumo |
| Base de Datos | PostgreSQL (Neon) | 16+ | Serveless branching, conformancia ACID |
| ORM / Driver | Drizzle ORM | 0.38+ | Type-safety extremo y zero-overhead |
| Autenticación | Auth0 / OAuth2 + OpenID | Canonical | RBAC estricto y auditoría enterprise |
| Hosting / Deploy | Vercel Cloud | Edge/Serverless | CI/CD nativo y zero-config rollbacks |

---

## 3. Ambientes de Ejecución
- **Local (DEV):** Entorno local con emuladores y \`.env.local\`.
- **Staging / Preview:** Despliegue automático por Pull Request en ramas de características.
- **Producción (PROD):** Rama \`main\` protegida, migraciones automáticas transaccionales.
`,
  },
  {
    phase: 2,
    code: "PL-02",
    file: "PL-02_modelo-datos.md",
    slug: "plantillas/pl-02-modelo-datos",
    title: "Plantilla PL-02: Modelo y Diccionario de Datos",
    description: "Diseño relacional, entidades, tipos de datos, llaves foráneas e índices para PostgreSQL.",
    content: `# Plantilla PL-02: Modelo y Diccionario de Datos (SDD)

| Campo | Valor |
|-------|-------|
| Documento | PL-02 · Modelo y Diccionario de Datos |
| Fase | Fase 2: Plan / Diseño |
| Versión | 1.0 |
| Rol Responsable | Arquitecto de Datos / Backend Lead |

---

## 1. Diccionario de Entidades y Campos

### Tabla: \`entidad_principal\`
| Columna | Tipo de Dato | Nulable | Restricción / Default | Descripción |
|---------|--------------|---------|-----------------------|-------------|
| id | UUID | NO | PK, defaultRandom() | Identificador único del registro |
| slug | VARCHAR(255) | NO | UNIQUE | Identificador legible para URLs |
| title | VARCHAR(255) | NO | — | Título representativo |
| is_active | BOOLEAN | NO | DEFAULT true | Bandera de visibilidad |
| created_at | TIMESTAMP | NO | DEFAULT now() | Fecha de creación del registro |

---

## 2. Estrategia de Índices
- \`idx_entidad_slug\`: B-Tree sobre \`slug\` para búsquedas O(1).
- \`idx_audit_logs_timestamp\`: B-Tree descendente sobre fecha para consultas cronológicas de auditoría.
`,
  },
  {
    phase: 2,
    code: "PL-03",
    file: "PL-03_contratos-api.md",
    slug: "plantillas/pl-03-contratos-api",
    title: "Plantilla PL-03: Contratos de Endpoints API",
    description: "Especificación formal de endpoints REST, estructuras de request/response, autenticación y códigos HTTP.",
    content: `# Plantilla PL-03: Contratos de Endpoints API (SDD)

| Campo | Valor |
|-------|-------|
| Documento | PL-03 · Contratos de Endpoints API |
| Fase | Fase 2: Plan / Diseño |
| Versión | 1.0 |
| Estándar | RESTful / JSON:API |

---

## 1. Convenciones Globales
- **Base URL:** \`/api/v1\`
- **Formato de datos:** \`application/json; charset=utf-8\`
- **Autenticación:** Header HTTP \`Authorization: Bearer <TOKEN>\` o Cookies de sesión segura.

---

## 2. Catálogo de Endpoints

### 2.1 \`GET /api/recurso\`
- **Descripción:** Obtiene la lista paginada de recursos.
- **Códigos de Respuesta:**
  - \`200 OK\`: Lista obtenida con éxito.
  - \`401 Unauthorized\`: Sesión no iniciada.
`,
  },

  // FASE 3: TAREAS
  {
    phase: 3,
    code: "TK-01",
    file: "TK-01_desglose-tareas.md",
    slug: "plantillas/tk-01-desglose-tareas",
    title: "Plantilla TK-01: Desglose Ejecutable de Tareas (task.md)",
    description: "Plantilla canónica de task.md para desglose secuencial con dependencias, entregables y criterios DoD.",
    content: `# Plantilla TK-01: Desglose Ejecutable de Tareas (task.md)

| Campo | Valor |
|-------|-------|
| Documento | TK-01 · Desglose Ejecutable de Tareas |
| Fase | Fase 3: Tareas |
| Archivo Destino | \`/task.md\` en la raíz del repositorio |
| Responsable | Frontend & Backend Leads |

---

## Estructura Oficial de \`task.md\`

\`\`\`markdown
# Plan de Tareas: [Nombre de la Característica o Sprint]

## Criterios de Completitud Globales (Definition of Done)
- [ ] Código TypeScript/JavaScript sin errores de compilación ni advertencias.
- [ ] Pruebas unitarias automatizadas cubriendo los casos principales.
- [ ] Auditoría de base de datos registrando cambios de sesión.
- [ ] Despliegue verificado en ambiente Staging.

---

## Bloque 1: Persistencia y Base de Datos
- [ ] **TK-01-1**: Crear migración SQL para la nueva tabla \`entidad\`.
- [ ] **TK-01-2**: Actualizar esquema Drizzle ORM y exportar modelos.

## Bloque 2: Capa de Servicios y API
- [ ] **TK-02-1**: Implementar función de servicio con transacción auditada.
- [ ] **TK-02-2**: Crear endpoint REST \`/api/entidad\` con validación de roles.

## Bloque 3: Interfaz de Usuario
- [ ] **TK-03-1**: Crear componente interactivo con soporte Dark/Light mode.
- [ ] **TK-03-2**: Integrar llamada al API con estados de carga y error.
\`\`\`
`,
  },

  // FASE 4: DESARROLLO
  {
    phase: 4,
    code: "DEV-01",
    file: "DEV-01_changelog.md",
    slug: "plantillas/dev-01-changelog",
    title: "Plantilla DEV-01: Registro de Cambios (CHANGELOG.md)",
    description: "Estructura formal basada en 'Keep a Changelog' y SemVer para documentar releases y modificaciones.",
    content: `# Plantilla DEV-01: Registro de Cambios (CHANGELOG.md)

| Campo | Valor |
|-------|-------|
| Documento | DEV-01 · CHANGELOG.md |
| Fase | Fase 4: Desarrollo |
| Estándar | Keep a Changelog 1.1.0 & Semantic Versioning (SemVer) |

---

## Formato Oficial

\`\`\`markdown
# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y adhiere a [Semantic Versioning](https://semver.org/).

## [Unreleased]
### Added (Agregado)
- Soporte para visualización y descarga de plantillas clasificadas por fases SDD.

---

## [1.0.0] - 2026-10-22
### Added
- Sistema de auditoría transparente a nivel de PostgreSQL con triggers automáticos.
- Editor visual por bloques sincronizado bidireccionalmente con Markdown.
- Catálogo oficial de las 8 plantillas de AGENT FACTORY (Fase 1).
\`\`\`
`,
  },
  {
    phase: 4,
    code: "DEV-02",
    file: "DEV-02_prompt-agente.md",
    slug: "plantillas/dev-02-prompt-agente",
    title: "Plantilla DEV-02: Prompt de Inicialización de Agente AI",
    description: "Instrucciones de arranque y contexto para agentes de código (Kiro, Antigravity, Claude, Copilot).",
    content: `# Plantilla DEV-02: Prompt de Inicialización de Agente AI

| Campo | Valor |
|-------|-------|
| Documento | DEV-02 · Prompt de Inicialización de Agente AI |
| Fase | Fase 4: Desarrollo |
| Propósito | Asegurar cumplimiento de SDD por asistentes de inteligencia artificial |

---

## Prompt Base para Configuración de Agentes

\`\`\`markdown
Eres un Asistente Senior de Ingeniería de Software que opera bajo la metodología estricta de Spec Driven Development (SDD).

Tus reglas obligatorias de trabajo son:
1. NUNCA generes código de producción sin haber consultado primero la especificación técnica y el archivo \`task.md\`.
2. Conserva estrictamente todos los comentarios, docstrings y tipos existentes.
3. Todas las mutaciones de base de datos deben ejecutarse a través de transacciones auditadas con \`withAuditTransaction\`.
4. Ante cualquier ambigüedad, consulta la sintaxis canónica EARS definida en la Fase 1.
5. Ejecuta siempre la verificación de compilación (\`npm run build\`) antes de dar una tarea por finalizada.
\`\`\`
`,
  },

  // FASE 5: TESTING
  {
    phase: 5,
    code: "QA-01",
    file: "QA-01_test-plan.md",
    slug: "plantillas/qa-01-test-plan",
    title: "Plantilla QA-01: Plan de Pruebas (Test Plan)",
    description: "Plan de aseguramiento de calidad con estrategia, tipos de prueba, criterios de entrada/salida y ambientes.",
    content: `# Plantilla QA-01: Plan de Pruebas (Test Plan)

| Campo | Valor |
|-------|-------|
| Documento | QA-01 · Plan de Pruebas (Test Plan) |
| Fase | Fase 5: Testing |
| Rol Responsable | QA Lead / Tester |
| Estado | Aprobado |

---

## 1. Alcance de las Pruebas
- **En Alcance:**
  - Pruebas unitarias de servicios de persistencia y parseo de bloques.
  - Pruebas de integración de endpoints REST (\`GET\`, \`POST\`, \`PUT\`, \`DELETE\`).
  - Pruebas E2E de flujos críticos de usuario (Autenticación Auth0, Descarga de Plantillas, Edición de Bloques).
- **Fuera de Alcance:**
  - Pruebas de estrés volumétrico superior a 50,000 req/seg.

---

## 2. Tipos de Pruebas y Herramientas
| Tipo de Prueba | Herramienta / Framework | Criterio de Cobertura |
|----------------|-------------------------|-----------------------|
| Unitarias | Vitest / Jest | >= 80% en lógica de negocio |
| Integración API | Supertest / Node Test Runner | 100% de endpoints principales |
| E2E | Playwright | Flujos críticos de navegación y edición |
`,
  },
  {
    phase: 5,
    code: "QA-02",
    file: "QA-02_casos-prueba.md",
    slug: "plantillas/qa-02-casos-prueba",
    title: "Plantilla QA-02: Casos de Prueba y Matriz de Cobertura",
    description: "Matriz detallada de casos de prueba con ID, precondición, pasos, resultado esperado y estado.",
    content: `# Plantilla QA-02: Casos de Prueba y Matriz de Cobertura

| Campo | Valor |
|-------|-------|
| Documento | QA-02 · Matriz de Casos de Prueba |
| Fase | Fase 5: Testing |
| Versión | 1.0 |

---

## Matriz de Ejecución de Casos de Prueba

| ID Caso | Historia / Req Asociado | Precondición | Pasos de Ejecución | Resultado Esperado | Estado (Pass/Fail) |
|---------|-------------------------|--------------|--------------------|--------------------|--------------------|
| TC-001 | RQ-01 (Checklist) | Usuario anónimo en Home | 1. Hacer clic en botón 'Plantillas'. 2. Seleccionar pestaña 'Fase 1'. | Se listan las 8 plantillas de requerimientos con botones de descarga. | Pass |
| TC-002 | RQ-08 (EARS) | Usuario logueado como Admin | 1. Ir a /admin. 2. Cambiar plantilla asociada de un documento. 3. Guardar. | El valor se actualiza en Postgres y se refleja en la vista pública. | Pass |
`,
  },

  // FASE 6: DEPLOY
  {
    phase: 6,
    code: "DP-01",
    file: "DP-01_pipeline-cicd.md",
    slug: "plantillas/dp-01-pipeline-cicd",
    title: "Plantilla DP-01: Configuración de Pipeline CI/CD",
    description: "Plantilla de workflow de GitHub Actions / GitLab CI para build, test, verificación de linters y deploy automático.",
    content: `# Plantilla DP-01: Configuración de Pipeline CI/CD (SDD)

| Campo | Valor |
|-------|-------|
| Documento | DP-01 · Configuración de Pipeline CI/CD |
| Fase | Fase 6: Deploy |
| Plataforma | GitHub Actions / Vercel Cloud |

---

## Pipeline YAML (\`.github/workflows/deploy.yml\`)

\`\`\`yaml
name: CI/CD Pipeline - SDD System

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verify-and-build:
    name: Verificación y Compilación
    runs-on: ubuntu-latest

    steps:
      - name: Checkout del Repositorio
        uses: actions/checkout@v4
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Instalar Dependencias
        run: npm ci
      - name: Compilación Next.js
        run: npm run build
\`\`\`
`,
  },
  {
    phase: 6,
    code: "DP-02",
    file: "DP-02_checklist-produccion.md",
    slug: "plantillas/dp-02-checklist-produccion",
    title: "Plantilla DP-02: Checklist de Salida a Producción",
    description: "Lista de verificación rigurosa previa y posterior a la puesta en marcha de una versión en producción.",
    content: `# Plantilla DP-02: Checklist de Salida a Producción (SDD)

| Campo | Valor |
|-------|-------|
| Documento | DP-02 · Checklist de Salida a Producción |
| Fase | Fase 6: Deploy |
| Responsable | DevOps / Release Manager |

---

## 1. Verificaciones Previas al Despliegue (Pre-Deploy)
- [ ] Variables de entorno de producción configuradas y auditadas (\`DATABASE_URL\`, \`AUTH0_*\`).
- [ ] Migraciones de base de datos probadas en ambiente Staging.
- [ ] Backup completo de la base de datos de producción realizado.
- [ ] Monitoreo y alertas configuradas en Datadog / Sentry / Vercel Analytics.

---

## 2. Pruebas Post-Despliegue (Smoke Tests)
- [ ] Login y logout con Auth0 validado.
- [ ] Carga exitosa de documentos en el sidebar.
- [ ] Descarga de plantillas operando al 100%.
- [ ] Edición y guardado de bloques en panel de administración.
`,
  },

  // FASE 7: ENTREGA
  {
    phase: 7,
    code: "EN-01",
    file: "EN-01_acta-entrega.md",
    slug: "plantillas/en-01-acta-entrega",
    title: "Plantilla EN-01: Acta de Entrega y Cierre Operacional",
    description: "Documento legal y de gestión para la firma de aceptación final del proyecto por los stakeholders.",
    content: `# Plantilla EN-01: Acta de Entrega y Cierre Operacional

| Campo | Valor |
|-------|-------|
| Documento | EN-01 · Acta de Entrega y Aceptación |
| Fase | Fase 7: Entrega |
| Stakeholders | Sponsor, Product Manager, Arquitecto Líder |

---

## 1. Datos Generales de la Entrega
- **Nombre del Sistema:** [Nombre del Sistema]
- **Versión Liberada:** [v1.0.0]
- **Fecha de Entrega:** [YYYY-MM-DD]
- **Cliente / Sponsor:** [Nombre del Responsable del Cliente]

---

## 2. Declaración de Cumplimiento
Por medio de la presente acta, las partes firmantes certifican que:
1. Los entregables especificados en las Fases 1 a 6 fueron completados a satisfacción.
2. Los criterios de aceptación formulados en sintaxis EARS fueron verificados y aprobados.
3. Se transfirieron los manuales de usuario y de administración correspondientes.
`,
  },
  {
    phase: 7,
    code: "EN-02",
    file: "EN-02_manual-operacion.md",
    slug: "plantillas/en-02-manual-operacion",
    title: "Plantilla EN-02: Manual de Operación y Administración",
    description: "Guía técnica para administradores de sistemas, gestión de accesos, soporte y mantenimiento.",
    content: `# Plantilla EN-02: Manual de Operación y Administración

| Campo | Valor |
|-------|-------|
| Documento | EN-02 · Manual de Operación y Administración |
| Fase | Fase 7: Entrega |
| Audiencia | Equipo de Soporte Técnico y Administradores |

---

## 1. Gestión de Usuarios y Roles
- **Roles del Sistema:**
  - \`USER\`: Acceso de lectura a documentación y descarga de plantillas.
  - \`ADMIN\`: Capacidad de reordenar, subir archivos Markdown y editar bloques.
  - \`SUPER_ADMIN\`: Acceso al visor de auditoría forense en tiempo real y asignación de privilegios.

---

## 2. Respaldos y Restauración
- **Motor:** Neon Serverless PostgreSQL.
- **Backups Automáticos:** Diarios con retención de 30 días.
`,
  },
];

async function seed() {
  console.log("🚀 Sincronizando plantillas por fase...");

  const plantillasCat = await db.query.categories.findFirst({
    where: (c, { eq }) => eq(c.slug, "plantillas")
  });

  const adminUser = await db.query.users.findFirst();
  const adminUserId = adminUser?.id || null;

  for (const item of newTemplates) {
    const rawContent = `---\ntitle: "${item.title}"\nslug: "${item.slug}"\ndescription: "${item.description}"\nphase: ${item.phase}\n---\n\n${item.content}`;

    await importMarkdownFile({
      filename: item.file,
      rawContent,
      categoryId: plantillasCat?.id || null,
      userId: adminUserId,
    });

    // Actualizar phase
    await db
      .update(schema.documents)
      .set({ phase: item.phase })
      .where(eq(schema.documents.slug, item.slug));

    console.log(`✓ Procesada [Fase ${item.phase}]: ${item.title}`);
  }

  // Asegurar phase = 1 para RQ
  await db
    .update(schema.documents)
    .set({ phase: 1 })
    .where(like(schema.documents.slug, 'plantillas/rq-%'));

  console.log("🎉 Todas las plantillas de las 7 fases han sido registradas y asociadas.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
