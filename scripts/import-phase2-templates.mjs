import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { db } from "../lib/db/index.js";
import * as schema from "../lib/db/schema.js";
import { eq } from "drizzle-orm";
import { importMarkdownFile } from "../lib/services/docs.js";

const PLANTILLAS_CAT_ID = "d4e13712-c737-444f-b413-f57505adf6f5";

const phase2Files = [
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-00_clasificacion-auto-manual (2).md",
    filename: "PL-00_clasificacion-auto-manual.md",
    slug: "plantillas/pl-00-clasificacion-auto-manual",
    title: "Plantilla PL-00: Clasificación auto/manual/auto-derivado",
    description: "Documento marco de la fase: define por cada artefacto quién lo decide y de dónde sale.",
    orderIndex: 100,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-01_seleccion-ambientes (2).md",
    filename: "PL-01_seleccion-ambientes.md",
    slug: "plantillas/pl-01-seleccion-ambientes",
    title: "Plantilla PL-01: Selección de ambientes",
    description: "Estrategia y selección de ambientes de desarrollo, staging y producción.",
    orderIndex: 101,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-02_seleccion-stack (2).md",
    filename: "PL-02_seleccion-stack.md",
    slug: "plantillas/pl-02-seleccion-stack",
    title: "Plantilla PL-02: Selección de stack",
    description: "Decisión y justificación técnica del stack frontend, backend, base de datos y hosting.",
    orderIndex: 102,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-03_diagrama-arquitectura (2).md",
    filename: "PL-03_diagrama-arquitectura.md",
    slug: "plantillas/pl-03-diagrama-arquitectura",
    title: "Plantilla PL-03: Guía de diagrama de arquitectura",
    description: "Topología de componentes, integración de servicios y diagramas C4 / Mermaid.",
    orderIndex: 103,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-04_diagrama-flujos (2).md",
    filename: "PL-04_diagrama-flujos.md",
    slug: "plantillas/pl-04-diagrama-flujos",
    title: "Plantilla PL-04: Guía de diagrama de flujos",
    description: "Diagramas de secuencia y flujos de negocio principales end-to-end.",
    orderIndex: 104,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-05_diccionario-modelo-datos (2).md",
    filename: "PL-05_diccionario-modelo-datos.md",
    slug: "plantillas/pl-05-diccionario-modelo-datos",
    title: "Plantilla PL-05: Diccionario de datos, modelo de datos e interfaces",
    description: "Entidades relacionales, atributos, tipos, restricciones e interfaces TypeScript.",
    orderIndex: 105,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-06_contrato-endpoints (2).md",
    filename: "PL-06_contrato-endpoints.md",
    slug: "plantillas/pl-06-contrato-endpoints",
    title: "Plantilla PL-06: Contrato de endpoints",
    description: "Especificación OpenAPI / REST de rutas, payloads de petición, códigos HTTP y respuestas.",
    orderIndex: 106,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-07_manejo-errores (2).md",
    filename: "PL-07_manejo-errores.md",
    slug: "plantillas/pl-07-manejo-errores",
    title: "Plantilla PL-07: Enfoque de manejo de errores",
    description: "Estructura estándar de errores API, validaciones, códigos de error y respuestas al usuario.",
    orderIndex: 107,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-08_arquitectura-back (2).md",
    filename: "PL-08_arquitectura-back.md",
    slug: "plantillas/pl-08-arquitectura-back",
    title: "Plantilla PL-08: Diseño de arquitectura back",
    description: "Estructura de capas de servidor, controladores, servicios, repositorios y persistencia.",
    orderIndex: 108,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-09_arquitectura-front (2).md",
    filename: "PL-09_arquitectura-front.md",
    slug: "plantillas/pl-09-arquitectura-front",
    title: "Plantilla PL-09: Diseño de arquitectura front",
    description: "Arquitectura de interfaz, componentes, gestión de estado y renderizado.",
    orderIndex: 109,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-10_vistas-rutas-front (2).md",
    filename: "PL-10_vistas-rutas-front.md",
    slug: "plantillas/pl-10-vistas-rutas-front",
    title: "Plantilla PL-10: Especificación de vistas y rutas (front)",
    description: "Mapa de rutas del frontend, vistas, permisos requeridos y layouts.",
    orderIndex: 110,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-11_estrategia-pruebas (2).md",
    filename: "PL-11_estrategia-pruebas.md",
    slug: "plantillas/pl-11-estrategia-pruebas",
    title: "Plantilla PL-11: Estrategia de pruebas",
    description: "Pirámide de pruebas, tipos de testing, cobertura mínima y criterios de aceptación.",
    orderIndex: 111,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-G_guia-reunion-diseno (2).md",
    filename: "PL-G_guia-reunion-diseno.md",
    slug: "plantillas/pl-g-guia-reunion-diseno",
    title: "Plantilla PL-G: Guía de la reunión de diseño",
    description: "Guía y agenda para la sesión de diseño técnico con el equipo de arquitectura.",
    orderIndex: 112,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-J_customer-journey (2).md",
    filename: "PL-J_customer-journey.md",
    slug: "plantillas/pl-j-customer-journey",
    title: "Plantilla PL-J: Prompt de customer journey (para Claude)",
    description: "Prompt estructurado para generar customer journeys y flujos de experiencia de usuario.",
    orderIndex: 113,
  },
  {
    path: "c:\\Users\\joshu\\AppData\\Local\\Temp\\PL-M_prompt-diseno-visual (2).md",
    filename: "PL-M_prompt-diseno-visual.md",
    slug: "plantillas/pl-m-prompt-diseno-visual",
    title: "Plantilla PL-M: Prompt de diseño visual (para Claude)",
    description: "Prompt estructurado para guías de diseño visual, sistema de diseño y componentes UI.",
    orderIndex: 114,
  },
];

async function main() {
  console.log("Iniciando importación de 15 plantillas reales para Fase 2 (Plan y Diseño)...");

  for (const item of phase2Files) {
    if (!fs.existsSync(item.path)) {
      console.error(`ERROR: No existe el archivo ${item.path}`);
      continue;
    }

    const rawMarkdown = fs.readFileSync(item.path, "utf8");

    // Construir contenido con frontmatter limpio
    const contentToImport = `---
title: "${item.title}"
slug: "${item.slug}"
description: "${item.description}"
phase: 2
order_index: ${item.orderIndex}
---

${rawMarkdown.trim()}
`;

    const res = await importMarkdownFile({
      filename: item.filename,
      rawContent: contentToImport,
      categoryId: PLANTILLAS_CAT_ID,
      phase: 2,
    });

    // Asegurar orderIndex y descripción exactos
    await db
      .update(schema.documents)
      .set({
        orderIndex: item.orderIndex,
        description: item.description,
        phase: 2,
      })
      .where(eq(schema.documents.id, res.docId));

    console.log(`✅ Importado: [Fase 2] ${item.slug} -> ${item.title}`);
  }

  console.log("\n¡Todas las 15 plantillas de Fase 2 importadas exitosamente!");
}

main().catch(console.error);
