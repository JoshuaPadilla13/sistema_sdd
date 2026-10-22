import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { db } from "../lib/db/index.js";
import * as schema from "../lib/db/schema.js";
import { eq } from "drizzle-orm";
import { importMarkdownFile } from "../lib/services/docs.js";

const AGENT_FACTORY_DIR = "c:\\Users\\joshu\\Downloads\\AGENT FACTORY 1\\AGENT FACTORY";

async function syncTemplates() {
  console.log("🚀 Sincronizando plantillas de AGENT FACTORY con la base de datos...");

  // 1. Obtener categorías 'plantillas' e 'introduccion'
  const categories = await db.select().from(schema.categories);
  const plantillasCat = categories.find((c) => c.slug === "plantillas") || categories[0];
  const introCat = categories.find((c) => c.slug === "introduccion") || categories[0];

  // Obtener un usuario de administración válido (UUID) o null
  const adminUsers = await db.select().from(schema.users).limit(1);
  const adminUserId = adminUsers[0]?.id || null;

  const templatesToSync = [
    {
      file: "RQ-01_checklist-discovery.md",
      title: "Plantilla RQ-01: Checklist de Discovery",
      slug: "plantillas/rq-01-checklist-discovery",
      description: "Checklist en tiempo real para sesiones de Discovery, verificación de cobertura y preguntas de rescate.",
      category: plantillasCat.id,
    },
    {
      file: "RQ-02_cuestionario-discovery.md",
      title: "Plantilla RQ-02: Cuestionario de Discovery",
      slug: "plantillas/rq-02-cuestionario-discovery",
      description: "Cuestionario completo para clientes en lenguaje sencillo sin tecnicismos para reuniones de inicio.",
      category: plantillasCat.id,
    },
    {
      file: "RQ-03_minuta-discovery.md",
      title: "Plantilla RQ-03: Minuta de Discovery",
      slug: "plantillas/rq-03-minuta-discovery",
      description: "Minuta formal de sesión con decisiones, suposiciones y registro de pendientes PEN.",
      category: plantillasCat.id,
    },
    {
      file: "RQ-04_documento-base.md",
      title: "Plantilla RQ-04: Documento Base de Proyecto",
      slug: "plantillas/rq-04-documento-base",
      description: "Definición canónica de problemas, objetivos, límites de alcance, actores y glosario del proyecto.",
      category: plantillasCat.id,
    },
    {
      file: "RQ-05_historias-usuario.md",
      title: "Plantilla RQ-05: Historias de Usuario",
      slug: "plantillas/rq-05-historias-usuario",
      description: "Historias de usuario enfocadas exclusivamente en actor, Como/Quiero/Para, prioridad y contribución.",
      category: plantillasCat.id,
    },
    {
      file: "RQ-06_reglas-negocio.md",
      title: "Plantilla RQ-06: Reglas de Negocio",
      slug: "plantillas/rq-06-reglas-negocio",
      description: "Catálogo de restricciones, cálculos y condiciones invariantes del dominio (RN-001...).",
      category: plantillasCat.id,
    },
    {
      file: "RQ-07_casos-uso.md",
      title: "Plantilla RQ-07: Casos de Uso",
      slug: "plantillas/rq-07-casos-uso",
      description: "Especificación formal de casos de uso (CU-001...), flujos principal, alternos y de excepción.",
      category: plantillasCat.id,
    },
    {
      file: "RQ-08_criterios-aceptacion-ears.md",
      title: "Plantilla RQ-08: Criterios de Aceptación EARS",
      slug: "plantillas/rq-08-criterios-aceptacion-ears",
      description: "Criterios de aceptación verificables bajo los 5 patrones de sintaxis EARS.",
      category: plantillasCat.id,
    },
  ];

  // 2. Importar cada plantilla
  for (const item of templatesToSync) {
    const fullPath = path.join(AGENT_FACTORY_DIR, "templates", item.file);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Archivo no encontrado: ${fullPath}`);
      continue;
    }

    const rawFileContent = fs.readFileSync(fullPath, "utf8");
    const frontmatterHeader = `---\ntitle: "${item.title}"\nslug: "${item.slug}"\ndescription: "${item.description}"\n---\n\n`;
    const finalContent = frontmatterHeader + rawFileContent;

    await importMarkdownFile({
      filename: item.file,
      rawContent: finalContent,
      categoryId: item.category,
      userId: adminUserId,
    });

    console.log(`  ✓ Sincronizada: ${item.title} -> /docs/${item.slug}`);
  }

  // 3. Importar la guía de AGENT FACTORY (README.md) bajo 'introduccion/agent-factory'
  const readmePath = path.join(AGENT_FACTORY_DIR, "README.md");
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, "utf8");
    const guideFrontmatter = `---\ntitle: "🤖 Kit Base AGENT FACTORY — Fase 01 Requerimientos"\nslug: "introduccion/agent-factory"\ndescription: "Guía oficial, estructura del kit, prompt universal y los 3 modos de operación del subagente sdd-01-requerimientos."\n---\n\n`;
    
    // Agregar un callout con enlace directo para descargar el ZIP
    const downloadBanner = `:::tip[Descarga del Kit Base]\nPuedes descargar el paquete completo con el subagente, las 9 skills, convenciones y carpetas listas para tus proyectos:\n\n**[📥 Descargar AGENT FACTORY (ZIP)](/api/agent-factory/download)** *(Incluye .kiro, templates, instructivos, documentacion y transcripciones discovery)*\n:::\n\n`;

    const finalReadme = guideFrontmatter + downloadBanner + readmeContent;

    await importMarkdownFile({
      filename: "agent-factory-readme.md",
      rawContent: finalReadme,
      categoryId: introCat.id,
      userId: adminUserId,
    });

    console.log(`  ✓ Sincronizada Guía: /docs/introduccion/agent-factory`);
  }

  console.log("🎉 Todas las plantillas y la guía de AGENT FACTORY fueron sincronizadas exitosamente en la base de datos.");
  process.exit(0);
}

syncTemplates().catch((err) => {
  console.error("❌ Error al sincronizar plantillas:", err);
  process.exit(1);
});
