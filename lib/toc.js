/**
 * Extrae los encabezados (H2 y H3) de un markdown para renderizar el Table of Contents (TOC).
 */
export function extractHeadings(markdown) {
  if (!markdown) return [];

  // Remover bloques de código para evitar falsos positivos de encabezados
  const cleanMarkdown = markdown.replace(/```[\s\S]*?```/g, "");

  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(cleanMarkdown)) !== null) {
    const level = match[1].length; // 2 para ##, 3 para ###
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    headings.push({
      level,
      text,
      id,
    });
  }

  return headings;
}
