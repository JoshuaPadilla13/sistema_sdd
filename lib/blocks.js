import crypto from 'crypto';

/**
 * Convierte un texto Markdown en un array de bloques interactivos estructurados.
 * Soporta:
 * - heading (nivel 1, 2, 3)
 * - code (con lenguaje)
 * - callout / alert (note, tip, caution, danger)
 * - list (elementos de viñeta)
 * - paragraph (texto enriquecido)
 */
export function markdownToBlocks(markdown = '') {
  if (!markdown || typeof markdown !== 'string') return [];

  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let i = 0;

  function genId() {
    return 'blk-' + Math.random().toString(36).substring(2, 9);
  }

  while (i < lines.length) {
    const line = lines[i];

    // 1. Omitir líneas vacías sueltas
    if (line.trim() === '') {
      i++;
      continue;
    }

    // 2. Bloque de Código (```lang ... ```)
    if (line.trim().startsWith('```')) {
      const langMatch = line.trim().match(/^```([a-zA-Z0-9_-]*)/);
      const language = langMatch ? langMatch[1] : '';
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // saltar el cierre ```
      blocks.push({
        id: genId(),
        type: 'code',
        language: language || 'text',
        content: codeLines.join('\n'),
      });
      continue;
    }

    // 3. Encabezados (#, ##, ###)
    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2].trim();
      blocks.push({
        id: genId(),
        type: 'heading',
        level,
        content,
      });
      i++;
      continue;
    }

    // 4. Callout / Alert (> [!NOTE] o blockquote estándar)
    if (line.trim().startsWith('>')) {
      const quoteLines = [];
      let variant = 'note';

      const firstQuoteMatch = line.match(/^>\s*\[!(NOTE|TIP|CAUTION|DANGER|WARNING)\]/i);
      if (firstQuoteMatch) {
        const v = firstQuoteMatch[1].toLowerCase();
        variant = v === 'warning' ? 'caution' : v;
        i++;
      }

      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const clean = lines[i].replace(/^>\s?/, '');
        quoteLines.push(clean);
        i++;
      }

      blocks.push({
        id: genId(),
        type: 'callout',
        variant,
        content: quoteLines.join('\n').trim(),
      });
      continue;
    }

    // 5. Listas con viñetas (- elemento o * elemento, incluyendo sangría / subniveles)
    if (line.match(/^(\s*)[-*]\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^(\s*)[-*]\s+/)) {
        const match = lines[i].match(/^(\s*)[-*]\s+(.*)$/);
        if (match) {
          const indent = match[1];
          const text = match[2];
          items.push(`${indent}${text}`);
        } else {
          items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        }
        i++;
      }
      blocks.push({
        id: genId(),
        type: 'list',
        items,
      });
      continue;
    }

    // 6. Párrafo regular (acumular líneas consecutivas hasta línea vacía o bloque especial)
    const paragraphLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().match(/^[-*]\s+/)
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }

    if (paragraphLines.length > 0) {
      blocks.push({
        id: genId(),
        type: 'paragraph',
        content: paragraphLines.join('\n'),
      });
    }
  }

  return blocks;
}

/**
 * Convierte un array de bloques estructurados de vuelta a formato Markdown (.md).
 */
export function blocksToMarkdown(blocks = []) {
  if (!Array.isArray(blocks)) return '';

  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading': {
          const hashes = '#'.repeat(block.level || 2);
          return `${hashes} ${block.content}\n`;
        }

        case 'paragraph': {
          return `${block.content}\n`;
        }

        case 'code': {
          return `\`\`\`${block.language || ''}\n${block.content || ''}\n\`\`\`\n`;
        }

        case 'callout': {
          const variantTag = (block.variant || 'note').toUpperCase();
          const lines = (block.content || '').split('\n');
          const quoted = lines.map((l) => `> ${l}`).join('\n');
          return `> [!${variantTag}]\n${quoted}\n`;
        }

        case 'list': {
          const items = Array.isArray(block.items) ? block.items : [];
          return (
            items
              .map((it) => {
                const itemStr = typeof it === 'string' ? it : String(it);
                const match = itemStr.match(/^(\s*)(.*)$/);
                const indent = match ? match[1] : '';
                const cleanText = match ? match[2].replace(/^[-*]\s+/, '') : itemStr;
                return `${indent}- ${cleanText}`;
              })
              .join('\n') + '\n'
          );
        }

        case 'image': {
          return `![${block.alt || 'Imagen'}](${block.url || ''})\n`;
        }

        default:
          return (block.content || '') + '\n';
      }
    })
    .join('\n');
}
