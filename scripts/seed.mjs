import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema.js";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Starting seed on Neon PostgreSQL...");

  // 1. Roles
  const rolesData = [
    { id: "USER", name: "Usuario", description: "Acceso a la vista pública de documentación y lectura." },
    { id: "ADMIN", name: "Administrador", description: "Gestión, edición y subida/descarga de archivos Markdown." },
    { id: "SUPER_ADMIN", name: "Super Administrador", description: "Control total del sistema y gestión de roles de usuarios." }
  ];

  for (const r of rolesData) {
    await db.insert(schema.roles).values(r).onConflictDoNothing();
  }
  console.log("✅ Roles seeded (USER, ADMIN, SUPER_ADMIN).");

  // 2. Categorías / Fases de SDD
  const categoriesData = [
    {
      slug: "introduccion",
      title: "🚀 Introducción & Metodología",
      description: "Conceptos fundamentales y visión general del desarrollo guiado por especificaciones.",
      badgeText: "Metodología",
      badgeVariant: "note",
      orderIndex: 0,
      isPublished: true,
    },
    {
      slug: "requerimientos",
      title: "📋 Fase 1: Requerimientos",
      description: "Definición rigurosa de necesidades, historias de usuario y sintaxis EARS.",
      badgeText: "Product Manager",
      badgeVariant: "note",
      orderIndex: 1,
      isPublished: true,
    },
    {
      slug: "diseno",
      title: "📐 Fase 2: Plan y Diseño",
      description: "Arquitectura técnica, modelos de datos, contratos de endpoints y diagramas.",
      badgeText: "Arquitecto",
      badgeVariant: "caution",
      orderIndex: 2,
      isPublished: true,
    },
    {
      slug: "tareas",
      title: "📝 Fase 3: Tareas",
      description: "Desglose ejecutable y granular estructurado en task.md.",
      badgeText: "Front & Back",
      badgeVariant: "success",
      orderIndex: 3,
      isPublished: true,
    },
    {
      slug: "desarrollo",
      title: "💻 Fase 4: Desarrollo",
      description: "Ejecución secuencial con prompts de inicialización y estándares de código.",
      badgeText: "Front & Back",
      badgeVariant: "success",
      orderIndex: 4,
      isPublished: true,
    },
    {
      slug: "testing",
      title: "🧪 Fase 5: Testing",
      description: "Estrategias de prueba unitarias, de integración, E2E y seguridad.",
      badgeText: "QA",
      badgeVariant: "tip",
      orderIndex: 5,
      isPublished: true,
    },
    {
      slug: "deploy",
      title: "🚀 Fase 6: Deploy",
      description: "Configuración de ambientes, servidores y pipelines de despliegue continuo.",
      badgeText: "DevOps / Back",
      badgeVariant: "danger",
      orderIndex: 6,
      isPublished: true,
    },
    {
      slug: "entrega",
      title: "📦 Fase 7: Entrega",
      description: "Manuales de usuario, guías de administración y cierre operacional.",
      badgeText: "PM / Arq",
      badgeVariant: "note",
      orderIndex: 7,
      isPublished: true,
    },
    {
      slug: "plantillas",
      title: "📄 Plantillas Oficiales",
      description: "Formatos oficiales estandarizados para acelerar el desarrollo del proyecto.",
      badgeText: "Oficial",
      badgeVariant: "tip",
      orderIndex: 8,
      isPublished: true,
    },
  ];

  const categoryMap = new Map();

  for (const cat of categoriesData) {
    const existing = await db.select().from(schema.categories).where(eq(schema.categories.slug, cat.slug));
    if (existing.length > 0) {
      categoryMap.set(cat.slug, existing[0].id);
    } else {
      const [inserted] = await db.insert(schema.categories).values(cat).returning();
      categoryMap.set(cat.slug, inserted.id);
    }
  }
  console.log("✅ Categorías SDD creadas.");

  // 3. Documentos Clave de SDD
  const documentsData = [
    // Introducción
    {
      catSlug: "introduccion",
      slug: "introduccion/que-es-sdd",
      title: "¿Qué es SDD?",
      description: "Introducción a Spec Driven Development.",
      orderIndex: 0,
      rawMarkdown: `# ¿Qué es Spec Driven Development (SDD)?

El **Desarrollo Guiado por Especificaciones (Spec Driven Development - SDD)** es un marco metodológico estandarizado que prioriza la definición formal, rigurosa y testeable de los requerimientos y la arquitectura **antes** de escribir la primera línea de código en producción.

---

## Principios Fundamentales

1. **La Especificación es la Fuente Única de Verdad (SSOT):** Ningún desarrollo comienza sin un documento base y criterios de aceptación claros.
2. **Claridad sobre Ambigüedad:** Se erradica la ambigüedad en los requerimientos usando sintaxis estructurada como **EARS** y **Gherkin**.
3. **Colaboración Humano + IA:** Las especificaciones detalladas permiten a desarrolladores y agentes de IA ejecutar tareas con precisión milimétrica sin alucinaciones.
4. **Validación Temprana:** Se detectan inconsistencias en fase de diseño, minimizando drásticamente el retrabajo en fases avanzadas.

---

## Las 7 Fases Secuenciales

El flujo se divide en 7 fases consecutivas:
1. **Requerimientos (Product Manager)**
2. **Plan y Diseño (Arquitecto)**
3. **Tareas (Front & Back)**
4. **Desarrollo (Front & Back / Agentes IA)**
5. **Testing (QA)**
6. **Deploy (DevOps / Backend)**
7. **Entrega (PM & Arquitecto)**
`
    },
    {
      catSlug: "introduccion",
      slug: "introduccion/flujo-sdd",
      title: "El Flujo de las 7 Fases de SDD",
      description: "Explicación detallada de las 7 fases secuenciales en Spec Driven Development.",
      orderIndex: 1,
      rawMarkdown: `# El Flujo de las 7 Fases en Spec Driven Development (SDD)

El marco metodológico **SDD** se organiza en 7 fases consecutivas y dependientes. Ninguna fase inicia formalmente sin la aprobación de los entregables mínimos de la fase anterior.

\`\`\`mermaid
graph TD
    A["1. Requerimientos<br/>(Product Manager)"] --> B["2. Plan / Diseño<br/>(Arquitecto)"]
    B --> C["3. Tareas<br/>(Front & Back)"]
    C --> D["4. Desarrollo<br/>(Front & Back / Kiro)"]
    D --> E["5. Testing<br/>(QA)"]
    E --> F["6. Deploy<br/>(DevOps / Back)"]
    F --> G["7. Entrega<br/>(PM & Arquitecto)"]
\`\`\`

---

## Resumen de las 7 Fases y sus Entregables

### Fase 1: Requerimientos
- **Responsable:** Product Manager
- **Objetivo:** Capturar y formalizar las necesidades del negocio en requisitos no ambiguos.
- **Entregables mínimos:**
  - Minuta de sesión de Discovery
  - Título, Problemas, Objetivos y Límites de alcance
  - Criterios de Aceptación en **Sintaxis EARS**
  - Historias de Usuario en formato Gherkin
  - Reglas de negocio y Casos de uso

### Fase 2: Plan / Diseño
- **Responsable:** Arquitecto de Software
- **Objetivo:** Transformar los requerimientos en un diseño técnico riguroso antes de escribir código.
- **Entregables mínimos:**
  - Selección de Ambientes y Stack (.NET / Node / Next.js)
  - Diagramas de arquitectura
  - Modelo y Diccionario de Datos
  - Contrato formal de Endpoints (OpenAPI / DTOs)
  - Estrategia de pruebas

### Fase 3: Tareas
- **Responsables:** Frontend & Backend Leads
- **Objetivo:** Desglosar el diseño en tareas ejecutables y acotadas.
- **Entregable:** Archivo \`task.md\` con dependencias y criterios de completitud.

### Fase 4: Desarrollo / Implementación
- **Responsables:** Desarrolladores y Agentes IA
- **Objetivo:** Construcción rigurosa siguiendo las tareas de \`task.md\`.

### Fase 5: Testing
- **Responsable:** QA Engineer
- **Objetivo:** Verificación automatizada y manual de criterios de aceptación.

### Fase 6: Deploy
- **Responsables:** Backend / DevOps
- **Objetivo:** Puesta en producción y certificación de estabilidad.

### Fase 7: Entrega
- **Responsables:** PM & Arquitecto
- **Objetivo:** Manuales de usuario, transferencia de conocimiento y cierre formal.
`
    },
    {
      catSlug: "introduccion",
      slug: "introduccion/instrucciones-agente",
      title: "Instrucciones al Agente AI",
      description: "Directrices para que agentes de inteligencia artificial ejecuten proyectos SDD.",
      orderIndex: 2,
      rawMarkdown: `# Instrucciones al Agente de Inteligencia Artificial

Al interactuar con agentes autónomos o asistentes de código (como Kiro, Claude, ChatGPT o Antigravity), este documento establece el protocolo de actuación.

---

## Reglas de Comportamiento del Agente

1. **Nunca improvisar requerimientos:** Si un aspecto no está definido en el documento base, el agente debe formular preguntas aclaratorias antes de escribir código.
2. **Ejecutar tareas de forma secuencial:** Respetar estrictamente el orden establecido en el archivo \`task.md\`.
3. **Validación contra Sintaxis EARS:** Cada función o módulo generado debe cumplir con los criterios de aceptación especificados en formato EARS.
4. **Preservación de Tipos y Contratos:** No modificar DTOs ni esquemas de base de datos sin actualizar la documentación de arquitectura correspondiente.
`
    },
    // Fase 1: Requerimientos
    {
      catSlug: "requerimientos",
      slug: "requerimientos/sintaxis-ears",
      title: "Sintaxis EARS",
      description: "Los 5 patrones de Easy Approach to Requirements Syntax.",
      orderIndex: 0,
      rawMarkdown: `# Guía de Sintaxis EARS (Easy Approach to Requirements Syntax)

La **Sintaxis EARS** proporciona un conjunto de reglas estructuradas en lenguaje natural para redactar requerimientos de software sin ambigüedades.

---

## Los 5 Patrones Fundamentales

### 1. Requerimiento Ubicuo (Ubiquitous)
Aplica en todo momento y no depende de ningún evento o condición.
> **Estructura:** \`El <sistema> debe <respuesta del sistema>.\`  
> **Ejemplo:** El sistema debe registrar un log de auditoría para toda transacción financiera.

### 2. Requerimiento Guiado por Eventos (Event-driven)
Se activa en el instante exacto en que ocurre un evento desencadenante.
> **Estructura:** \`CUANDO <evento disparador>, el <sistema> debe <respuesta del sistema>.\`  
> **Ejemplo:** CUANDO el usuario hace clic en "Descargar .md", el sistema debe generar el archivo Markdown con su Frontmatter canónico.

### 3. Requerimiento Guiado por Estados (State-driven)
Aplica únicamente mientras el sistema se encuentra en un estado específico.
> **Estructura:** \`MIENTRAS <estado definido>, el <sistema> debe <respuesta del sistema>.\`  
> **Ejemplo:** MIENTRAS el usuario no cuente con una sesión activa, el sistema debe ocultar las opciones de edición de contenido.

### 4. Requerimiento Opcional / Característica Opcional (Option Feature)
Aplica sólo si una funcionalidad o módulo opcional está habilitado.
> **Estructura:** \`DONDE <opción habilitada>, el <sistema> debe <respuesta del sistema>.\`  
> **Ejemplo:** DONDE la integración con Auth0 esté activa, el sistema debe delegar la validación de tokens al proveedor de identidad.

### 5. Requerimiento No Deseado / Manejo de Errores (Unwanted Behavior)
Especifica la reacción del sistema ante situaciones anómalas o de fallo.
> **Estructura:** \`SI <condición no deseada/error>, ENTONCES el <sistema> debe <respuesta del sistema>.\`  
> **Ejemplo:** SI el archivo subido excede los 10MB o no tiene extensión .md, ENTONCES el sistema debe rechazar la carga y mostrar una alerta descriptiva.
`
    },
    {
      catSlug: "requerimientos",
      slug: "requerimientos/historias-de-usuario",
      title: "Historias de Usuario y Gherkin",
      description: "Estandarización de User Stories con criterios de aceptación Gherkin.",
      orderIndex: 1,
      rawMarkdown: `# Historias de Usuario en Formato Gherkin

Las Historias de Usuario en SDD combinan la intención de valor del usuario con escenarios de prueba automatizables redactados en formato **Given / When / Then**.

---

## Estructura Estándar

\`\`\`gherkin
Característica: Gestión de Documentos Markdown por Administrador

  Escenario: Subida exitosa de archivo Markdown
    Dado que el usuario ha iniciado sesión con el rol de "ADMIN"
    Y se encuentra en la vista de "/admin/upload"
    Cuando arrastra un archivo con extensión ".md" válido
    Entonces el sistema debe procesar el Frontmatter YAML
    Y almacenar el documento en la base de datos PostgreSQL
    Y mostrar un mensaje de confirmación con el slug generado.
\`\`\`
`
    },
    // Fase 2: Plan y Diseño
    {
      catSlug: "diseno",
      slug: "diseno/modelo-de-datos",
      title: "Modelo y Diccionario de Datos",
      description: "Esquema relacional y entidades de PostgreSQL gestionadas con Drizzle.",
      orderIndex: 0,
      rawMarkdown: `# Modelo y Diccionario de Datos

El almacenamiento persistente se basa en **PostgreSQL** alojado en **Neon**, conectado mediante **Drizzle ORM**.

---

## Tablas Principales

| Tabla | Propósito | Llave Primaria |
|---|---|---|
| \`roles\` | Catálogo de roles de autorización (USER, ADMIN, SUPER_ADMIN) | \`id\` (VARCHAR) |
| \`users\` | Perfiles de usuarios sincronizados desde Auth0 | \`id\` (UUID) |
| \`user_roles\` | Asociación muchos-a-muchos entre usuarios y roles | \`(user_id, role_id)\` |
| \`categories\` | Fases y secciones temáticas de la documentación | \`id\` (UUID) |
| \`documents\` | Artículos y especificaciones en formato Markdown | \`id\` (UUID) |
| \`markdown_files\` | Metadatos y hashes de archivos .md cargados | \`id\` (UUID) |
| \`document_revisions\` | Historial de versiones y auditoría de cambios | \`id\` (UUID) |

---

## Diagrama Entidad-Relación

\`\`\`mermaid
erDiagram
    ROLES ||--o{ USER_ROLES : "asignado en"
    USERS ||--o{ USER_ROLES : "posee"
    USERS ||--o{ DOCUMENTS : "crea"
    USERS ||--o{ MARKDOWN_FILES : "sube"
    CATEGORIES ||--o{ DOCUMENTS : "contiene"
    DOCUMENTS ||--o{ DOCUMENT_REVISIONS : "versiona"
    DOCUMENTS ||--o{ MARKDOWN_FILES : "origina"
\`\`\`
`
    },
    // Plantillas Oficiales
    {
      catSlug: "plantillas",
      slug: "plantillas/documento-base-proyecto",
      title: "Plantilla Documento Base de Proyecto",
      description: "Estructura canónica de especificación técnica SDD.",
      orderIndex: 0,
      rawMarkdown: `# Plantilla Oficial: Documento Base de Proyecto (SDD)

Utilice esta plantilla al iniciar cualquier iniciativa de desarrollo de software bajo la metodología Spec Driven Development.

---

## 1. Información General
- **Nombre del Proyecto:** [Nombre]
- **Código:** [PRJ-001]
- **Product Manager:** [Nombre]
- **Arquitecto de Software:** [Nombre]
- **Fecha de Inicio:** [YYYY-MM-DD]

---

## 2. Declaración del Problema y Objetivos
### 2.1 Problema
[Descripción clara del dolor de negocio que se resolverá.]

### 2.2 Objetivos de Negocio
- Objetivo 1: ...
- Objetivo 2: ...

---

## 3. Alcance y Límites
- **Dentro del Alcance (In Scope):**
  - Funcionalidad A
  - Funcionalidad B
- **Fuera del Alcance (Out of Scope):**
  - Módulo C
`
    }
  ];

  for (const doc of documentsData) {
    const catId = categoryMap.get(doc.catSlug);
    const existing = await db.select().from(schema.documents).where(eq(schema.documents.slug, doc.slug));
    
    if (existing.length === 0) {
      await db.insert(schema.documents).values({
        categoryId: catId,
        slug: doc.slug,
        title: doc.title,
        description: doc.description,
        rawMarkdown: doc.rawMarkdown,
        orderIndex: doc.orderIndex,
        isPublished: true,
      });
      console.log(`📄 Documento creado: ${doc.title} (${doc.slug})`);
    } else {
      console.log(`ℹ️ Documento ya existe: ${doc.title}`);
    }
  }

  // 4. Super Administradores Oficiales
  const superAdminUsers = [
    {
      email: "nayeli.carrizales.diaz@gmail.com",
      name: "Nayeli Carrizales",
      auth0Id: "auth0|nayeli_carrizales"
    },
    {
      email: "joshuapadillags@gmail.com",
      name: "Joshua Padilla",
      auth0Id: "auth0|joshua_padilla"
    }
  ];

  for (const adminUser of superAdminUsers) {
    let userRecord;
    const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, adminUser.email)).limit(1);
    if (existingUser.length === 0) {
      const [inserted] = await db.insert(schema.users).values(adminUser).returning();
      userRecord = inserted;
      console.log(`👤 Super Admin registrado: ${adminUser.email}`);
    } else {
      userRecord = existingUser[0];
      console.log(`👤 Super Admin ya existente: ${adminUser.email}`);
    }

    // Asegurar roles USER, ADMIN y SUPER_ADMIN
    for (const r of ["USER", "ADMIN", "SUPER_ADMIN"]) {
      await db.insert(schema.userRoles).values({
        userId: userRecord.id,
        roleId: r
      }).onConflictDoNothing();
    }
  }
  console.log("👑 Super Admins asignados exitosamente.");

  console.log("🎉 Seeding finalizado con éxito en Neon PostgreSQL!");
}

seed().catch((err) => {
  console.error("❌ Error en seeding:", err);
  process.exit(1);
});
