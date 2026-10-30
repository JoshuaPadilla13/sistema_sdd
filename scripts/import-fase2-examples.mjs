import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { db } from "../lib/db/index.js";
import * as schema from "../lib/db/schema.js";
import { eq } from "drizzle-orm";
import { importMarkdownFile } from "../lib/services/docs.js";

const DISENO_CAT_ID = "9ed9a27c-c154-4de9-bdcd-42f12533159e"; // Categoría 'diseno' (Fase 2: Plan y Diseño)

const sourceDir = "d:\\Joshua\\Plantillas ejemplo PL - fase 2";

const exampleFiles = [
  {
    file: "DSOL_PL-00_clasificacion-auto-manual.md",
    slug: "diseno/dsol-pl-00-clasificacion-auto-manual",
    title: "DSOL PL-00: Clasificación auto/manual/auto-derivado",
    description: "Ejemplo ilustrativo de clasificación de artefactos para el proyecto DSOL (Registro de clientes y pedidos).",
    templateSlug: "plantillas/pl-00-clasificacion-auto-manual",
    orderIndex: 1,
  },
  {
    file: "DSOL_PL-01_seleccion-ambientes.md",
    slug: "diseno/dsol-pl-01-seleccion-ambientes",
    title: "DSOL PL-01: Selección de ambientes",
    description: "Ejemplo ilustrativo de ambientes (Local DEV, QA/Staging, Producción) para DSOL.",
    templateSlug: "plantillas/pl-01-seleccion-ambientes",
    orderIndex: 2,
  },
  {
    file: "DSOL_PL-02_seleccion-stack.md",
    slug: "diseno/dsol-pl-02-seleccion-stack",
    title: "DSOL PL-02: Selección de stack",
    description: "Decisión de stack tecnológico justificado para el proyecto DSOL.",
    templateSlug: "plantillas/pl-02-seleccion-stack",
    orderIndex: 3,
  },
  {
    file: "DSOL_PL-03_diagrama-arquitectura.md",
    slug: "diseno/dsol-pl-03-diagrama-arquitectura",
    title: "DSOL PL-03: Diagrama de arquitectura",
    description: "Diagrama de arquitectura y topología de servicios para DSOL.",
    templateSlug: "plantillas/pl-03-diagrama-arquitectura",
    orderIndex: 4,
  },
  {
    file: "DSOL_PL-04_diagrama-flujos.md",
    slug: "diseno/dsol-pl-04-diagrama-flujos",
    title: "DSOL PL-04: Diagrama de flujos",
    description: "Diagramas de secuencia y flujos críticos de pedidos y clientes DSOL.",
    templateSlug: "plantillas/pl-04-diagrama-flujos",
    orderIndex: 5,
  },
  {
    file: "DSOL_PL-05_diccionario-modelo-datos.md",
    slug: "diseno/dsol-pl-05-diccionario-modelo-datos",
    title: "DSOL PL-05: Diccionario y modelo de datos",
    description: "Modelo relacional de datos y tablas de clientes y pedidos DSOL.",
    templateSlug: "plantillas/pl-05-diccionario-modelo-datos",
    orderIndex: 6,
  },
  {
    file: "DSOL_PL-06_contrato-endpoints.md",
    slug: "diseno/dsol-pl-06-contrato-endpoints",
    title: "DSOL PL-06: Contrato de endpoints",
    description: "Contrato de endpoints REST y especificaciones de entrada/salida para DSOL.",
    templateSlug: "plantillas/pl-06-contrato-endpoints",
    orderIndex: 7,
  },
  {
    file: "DSOL_PL-07_manejo-errores.md",
    slug: "diseno/dsol-pl-07-manejo-errores",
    title: "DSOL PL-07: Manejo de errores",
    description: "Estrategia y catálogo de códigos de error estándar para DSOL.",
    templateSlug: "plantillas/pl-07-manejo-errores",
    orderIndex: 8,
  },
  {
    file: "DSOL_PL-08_arquitectura-back.md",
    slug: "diseno/dsol-pl-08-arquitectura-back",
    title: "DSOL PL-08: Arquitectura backend",
    description: "Estructura de capas, servicios y repositorios backend para DSOL.",
    templateSlug: "plantillas/pl-08-arquitectura-back",
    orderIndex: 9,
  },
  {
    file: "DSOL_PL-09_arquitectura-front.md",
    slug: "diseno/dsol-pl-09-arquitectura-front",
    title: "DSOL PL-09: Arquitectura frontend",
    description: "Diseño modular de componentes, estado y layouts frontend para DSOL.",
    templateSlug: "plantillas/pl-09-arquitectura-front",
    orderIndex: 10,
  },
  {
    file: "DSOL_PL-10_vistas-rutas-front.md",
    slug: "diseno/dsol-pl-10-vistas-rutas-front",
    title: "DSOL PL-10: Vistas y rutas frontend",
    description: "Mapa de navegación, pantallas y permisos frontend para DSOL.",
    templateSlug: "plantillas/pl-10-vistas-rutas-front",
    orderIndex: 11,
  },
  {
    file: "DSOL_PL-11_estrategia-pruebas.md",
    slug: "diseno/dsol-pl-11-estrategia-pruebas",
    title: "DSOL PL-11: Estrategia de pruebas",
    description: "Plan de pruebas unitarias, integración y E2E para el proyecto DSOL.",
    templateSlug: "plantillas/pl-11-estrategia-pruebas",
    orderIndex: 12,
  },
  {
    file: "DSOL_PL-G_guia-reunion-diseno.md",
    slug: "diseno/dsol-pl-g-guia-reunion-diseno",
    title: "DSOL PL-G: Guía de reunión de diseño",
    description: "Minuta y guía ejecutiva de la sesión de diseño técnico de DSOL.",
    templateSlug: "plantillas/pl-g-guia-reunion-diseno",
    orderIndex: 13,
  },
  {
    file: "DSOL_PL-J_customer-journey.md",
    slug: "diseno/dsol-pl-j-customer-journey",
    title: "DSOL PL-J: Customer journey",
    description: "Customer journey y flujos de usuario aplicados al proyecto DSOL.",
    templateSlug: "plantillas/pl-j-customer-journey",
    orderIndex: 14,
  },
  {
    file: "DSOL_PL-M_prompt-diseno-visual.md",
    slug: "diseno/dsol-pl-m-prompt-diseno-visual",
    title: "DSOL PL-M: Prompt de diseño visual",
    description: "Prompt y guía visual de componentes UI aplicados para DSOL.",
    templateSlug: "plantillas/pl-m-prompt-diseno-visual",
    orderIndex: 15,
  },
];

async function main() {
  console.log("Cargando 15 documentos de ejemplo para Fase 2: Plan y Diseño...");

  for (const item of exampleFiles) {
    const fullPath = path.join(sourceDir, item.file);
    if (!fs.existsSync(fullPath)) {
      console.error(`ERROR: No existe el archivo ${fullPath}`);
      continue;
    }

    const rawMarkdown = fs.readFileSync(fullPath, "utf8");

    const contentToImport = `---
title: "${item.title}"
slug: "${item.slug}"
description: "${item.description}"
templateSlug: "${item.templateSlug}"
phase: 2
order_index: ${item.orderIndex}
---

${rawMarkdown.trim()}
`;

    const res = await importMarkdownFile({
      filename: item.file,
      rawContent: contentToImport,
      categoryId: DISENO_CAT_ID,
      phase: 2,
    });

    // Actualizar templateSlug, orderIndex y phase directamente en el registro
    await db
      .update(schema.documents)
      .set({
        title: item.title,
        description: item.description,
        templateSlug: item.templateSlug,
        orderIndex: item.orderIndex,
        phase: 2,
      })
      .where(eq(schema.documents.id, res.docId));

    console.log(`✅ [Fase 2] ${item.slug} vinculado con plantilla -> ${item.templateSlug}`);
  }

  console.log("\n¡Todos los 15 documentos de ejemplo de la Fase 2 cargados y vinculados a sus plantillas exitosamente!");
  process.exit(0);
}

main().catch(console.error);
