'use client';

import React, { useState } from 'react';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  AlignLeft, 
  Code, 
  AlertTriangle, 
  List, 
  Image as ImageIcon,
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Plus, 
  Layers, 
  FileText, 
  Eye,
  Indent,
  Outdent
} from 'lucide-react';
import MarkdownRenderer from '../starlight/MarkdownRenderer';
import { blocksToMarkdown, markdownToBlocks } from '../../lib/blocks';

export default function BlockEditor({ 
  initialBlocks = [], 
  initialMarkdown = '', 
  onChange 
}) {
  const [activeTab, setActiveTab] = useState('blocks'); // 'blocks' | 'markdown'
  const [blocks, setBlocks] = useState(
    initialBlocks.length > 0 ? initialBlocks : markdownToBlocks(initialMarkdown)
  );
  const [rawMarkdown, setRawMarkdown] = useState(
    initialMarkdown || blocksToMarkdown(initialBlocks)
  );
  const [showPreview, setShowPreview] = useState(true);

  const genId = () => 'blk-' + Math.random().toString(36).substring(2, 9);

  // Sincronizar hacia arriba cuando cambian los bloques
  const updateBlocksState = (newBlocks) => {
    setBlocks(newBlocks);
    const md = blocksToMarkdown(newBlocks);
    setRawMarkdown(md);
    if (onChange) onChange({ blocks: newBlocks, rawMarkdown: md });
  };

  // Sincronizar hacia arriba cuando cambia el markdown crudo
  const updateMarkdownState = (newMd) => {
    setRawMarkdown(newMd);
    const parsedBlocks = markdownToBlocks(newMd);
    setBlocks(parsedBlocks);
    if (onChange) onChange({ blocks: parsedBlocks, rawMarkdown: newMd });
  };

  // Añadir un nuevo bloque
  const addBlock = (type) => {
    let newBlock;
    switch (type) {
      case 'heading':
        newBlock = { id: genId(), type: 'heading', level: 2, content: 'Nuevo Encabezado' };
        break;
      case 'paragraph':
        newBlock = { id: genId(), type: 'paragraph', content: 'Escribe tu texto aquí...' };
        break;
      case 'code':
        newBlock = { id: genId(), type: 'code', language: 'javascript', content: '// Tu código aquí' };
        break;
      case 'callout':
        newBlock = { id: genId(), type: 'callout', variant: 'note', content: 'Nota importante aquí...' };
        break;
      case 'list':
        newBlock = { id: genId(), type: 'list', items: ['Elemento 1', 'Elemento 2'] };
        break;
      case 'image':
        newBlock = { id: genId(), type: 'image', url: 'https://placehold.co/600x400', alt: 'Descripción de la imagen' };
        break;
      default:
        return;
    }

    const updated = [...blocks, newBlock];
    updateBlocksState(updated);
  };

  // Modificar campo de un bloque
  const modifyBlock = (id, field, value) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, [field]: value } : b));
    updateBlocksState(updated);
  };

  // Eliminar un bloque
  const deleteBlock = (id) => {
    const updated = blocks.filter((b) => b.id !== id);
    updateBlocksState(updated);
  };

  // Mover bloque hacia arriba
  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...blocks];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    updateBlocksState(updated);
  };

  // Mover bloque hacia abajo
  const moveDown = (index) => {
    if (index === blocks.length - 1) return;
    const updated = [...blocks];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    updateBlocksState(updated);
  };

  // Operaciones de Lista con Sangría / Subniveles
  const addListItem = (blockId) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const items = [...(block.items || []), 'Nuevo elemento'];
    modifyBlock(blockId, 'items', items);
  };

  const updateListItem = (blockId, itemIdx, newText) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const current = block.items?.[itemIdx] || '';
    const match = current.match(/^(\s*)/);
    const indent = match ? match[1] : '';
    const items = [...(block.items || [])];
    items[itemIdx] = `${indent}${newText.replace(/^\s+/, '')}`;
    modifyBlock(blockId, 'items', items);
  };

  const indentListItem = (blockId, itemIdx) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const items = [...(block.items || [])];
    // Aumentar sangría agregando 2 espacios al inicio
    items[itemIdx] = `  ${items[itemIdx] || ''}`;
    modifyBlock(blockId, 'items', items);
  };

  const outdentListItem = (blockId, itemIdx) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const items = [...(block.items || [])];
    // Reducir sangría removiendo hasta 2 espacios iniciales
    items[itemIdx] = (items[itemIdx] || '').replace(/^ {1,2}/, '');
    modifyBlock(blockId, 'items', items);
  };

  const removeListItem = (blockId, itemIdx) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const items = (block.items || []).filter((_, i) => i !== itemIdx);
    modifyBlock(blockId, 'items', items);
  };

  return (
    <div>
      {/* SELECTOR DE MODO: BLOQUES O MARKDOWN + TOGGLE PREVIEW */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--sl-color-border)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('blocks')}
            className={`sl-btn ${activeTab === 'blocks' ? 'sl-btn-primary' : 'sl-btn-outline'}`}
            style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}
          >
            <Layers size={15} />
            <span>Editor Visual por Bloques</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('markdown')}
            className={`sl-btn ${activeTab === 'markdown' ? 'sl-btn-primary' : 'sl-btn-outline'}`}
            style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}
          >
            <FileText size={15} />
            <span>Código Markdown Puro (.md)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="sl-btn sl-btn-outline"
          style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
        >
          <Eye size={15} />
          <span>{showPreview ? 'Ocultar Previsualización' : 'Mostrar Previsualización'}</span>
        </button>
      </div>

      <div className={`sl-editor-grid ${showPreview ? 'with-preview' : 'no-preview'}`} style={{ gap: '1.5rem', minHeight: '650px' }}>
        {/* ÁREA DE EDICIÓN */}
        <div>
          {activeTab === 'blocks' ? (
            <div>
              {/* TOOLBAR PARA AÑADIR BLOQUES */}
              <div style={{
                background: 'var(--sl-color-bg-sidebar)',
                border: '1px solid var(--sl-color-border)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sl-color-text-muted)', textTransform: 'uppercase' }}>
                  + Añadir Bloque:
                </span>
                <button
                  type="button"
                  onClick={() => addBlock('heading')}
                  className="sl-btn sl-btn-outline"
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem' }}
                >
                  <Heading2 size={13} /> Encabezado
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('paragraph')}
                  className="sl-btn sl-btn-outline"
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem' }}
                >
                  <AlignLeft size={13} /> Párrafo
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('code')}
                  className="sl-btn sl-btn-outline"
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem' }}
                >
                  <Code size={13} /> Código
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('callout')}
                  className="sl-btn sl-btn-outline"
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem' }}
                >
                  <AlertTriangle size={13} /> Alerta / Callout
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('list')}
                  className="sl-btn sl-btn-outline"
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem' }}
                >
                  <List size={13} /> Lista
                </button>
                <button
                  type="button"
                  onClick={() => addBlock('image')}
                  className="sl-btn sl-btn-outline"
                  style={{ fontSize: '0.78rem', padding: '0.25rem 0.55rem' }}
                >
                  <ImageIcon size={13} /> Imagen
                </button>
              </div>

              {/* LISTA DE BLOQUES INTERACTIVOS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {blocks.length === 0 ? (
                  <div style={{
                    padding: '3rem',
                    textAlign: 'center',
                    background: 'var(--sl-color-bg-sidebar)',
                    border: '1px dashed var(--sl-color-border)',
                    borderRadius: '8px',
                    color: 'var(--sl-color-text-muted)',
                  }}>
                    <Layers size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                    <p>No hay bloques en este documento.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Usa la barra superior para comenzar a añadir contenido modular.</p>
                  </div>
                ) : (
                  blocks.map((block, idx) => (
                    <div
                      key={block.id || idx}
                      style={{
                        background: 'var(--sl-color-bg-sidebar)',
                        border: '1px solid var(--sl-color-border)',
                        borderRadius: '8px',
                        padding: '1rem',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      {/* HEADER DE CONTROL DEL BLOQUE */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--sl-color-text-muted)', background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                            #{idx + 1} {block.type}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <button
                            type="button"
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            className="sl-btn sl-btn-outline"
                            style={{ padding: '0.2rem 0.4rem', opacity: idx === 0 ? 0.3 : 1 }}
                            title="Mover arriba"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDown(idx)}
                            disabled={idx === blocks.length - 1}
                            className="sl-btn sl-btn-outline"
                            style={{ padding: '0.2rem 0.4rem', opacity: idx === blocks.length - 1 ? 0.3 : 1 }}
                            title="Mover abajo"
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBlock(block.id)}
                            className="sl-btn sl-btn-outline"
                            style={{ padding: '0.2rem 0.4rem', color: '#ff7b72', borderColor: '#f8514933' }}
                            title="Eliminar bloque"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* CUERPO ESPECÍFICO SEGÚN TIPO DE BLOQUE */}
                      {block.type === 'heading' && (
                        <div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <select
                              value={block.level || 2}
                              onChange={(e) => modifyBlock(block.id, 'level', parseInt(e.target.value))}
                              style={{
                                background: 'var(--sl-color-bg)',
                                color: 'var(--sl-color-text)',
                                border: '1px solid var(--sl-color-border)',
                                borderRadius: '4px',
                                padding: '0.35rem 0.6rem',
                                fontSize: '0.85rem',
                              }}
                            >
                              <option value={1}>H1 - Título Principal</option>
                              <option value={2}>H2 - Sección</option>
                              <option value={3}>H3 - Subsección</option>
                            </select>
                            <input
                              type="text"
                              value={block.content || ''}
                              onChange={(e) => modifyBlock(block.id, 'content', e.target.value)}
                              placeholder="Texto del encabezado..."
                              style={{
                                flex: 1,
                                background: 'var(--sl-color-bg)',
                                color: 'var(--sl-color-text-title)',
                                border: '1px solid var(--sl-color-border)',
                                borderRadius: '4px',
                                padding: '0.35rem 0.6rem',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {block.type === 'paragraph' && (
                        <div>
                          <textarea
                            value={block.content || ''}
                            onChange={(e) => modifyBlock(block.id, 'content', e.target.value)}
                            rows={4}
                            placeholder="Redacta el contenido en formato Markdown enriquecido..."
                            style={{
                              width: '100%',
                              background: 'var(--sl-color-bg)',
                              color: 'var(--sl-color-text)',
                              border: '1px solid var(--sl-color-border)',
                              borderRadius: '6px',
                              padding: '0.6rem',
                              fontSize: '0.9rem',
                              lineHeight: 1.5,
                              resize: 'vertical',
                            }}
                          />
                        </div>
                      )}

                      {block.type === 'code' && (
                        <div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <input
                              type="text"
                              value={block.language || ''}
                              onChange={(e) => modifyBlock(block.id, 'language', e.target.value)}
                              placeholder="Lenguaje (ej: javascript, csharp, mermaid, sql)..."
                              style={{
                                width: '220px',
                                background: 'var(--sl-color-bg)',
                                color: 'var(--sl-color-text)',
                                border: '1px solid var(--sl-color-border)',
                                borderRadius: '4px',
                                padding: '0.3rem 0.5rem',
                                fontSize: '0.8rem',
                                fontFamily: 'monospace',
                              }}
                            />
                          </div>
                          <textarea
                            value={block.content || ''}
                            onChange={(e) => modifyBlock(block.id, 'content', e.target.value)}
                            rows={6}
                            placeholder="Escribe el código fuente..."
                            style={{
                              width: '100%',
                              background: '#0d1117',
                              color: '#58a6ff',
                              border: '1px solid var(--sl-color-border)',
                              borderRadius: '6px',
                              padding: '0.75rem',
                              fontFamily: 'ui-monospace, monospace',
                              fontSize: '0.85rem',
                              lineHeight: 1.4,
                              resize: 'vertical',
                            }}
                          />
                        </div>
                      )}

                      {block.type === 'callout' && (
                        <div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <select
                              value={block.variant || 'note'}
                              onChange={(e) => modifyBlock(block.id, 'variant', e.target.value)}
                              style={{
                                background: 'var(--sl-color-bg)',
                                color: 'var(--sl-color-text)',
                                border: '1px solid var(--sl-color-border)',
                                borderRadius: '4px',
                                padding: '0.3rem 0.5rem',
                                fontSize: '0.82rem',
                                textTransform: 'uppercase',
                              }}
                            >
                              <option value="note">ℹ️ Nota (Note)</option>
                              <option value="tip">💡 Consejo (Tip)</option>
                              <option value="caution">⚠️ Precaución (Caution)</option>
                              <option value="danger">🚨 Peligro (Danger)</option>
                            </select>
                          </div>
                          <textarea
                            value={block.content || ''}
                            onChange={(e) => modifyBlock(block.id, 'content', e.target.value)}
                            rows={3}
                            placeholder="Mensaje de alerta o callout..."
                            style={{
                              width: '100%',
                              background: 'var(--sl-color-bg)',
                              color: 'var(--sl-color-text)',
                              border: '1px solid var(--sl-color-border)',
                              borderRadius: '6px',
                              padding: '0.6rem',
                              fontSize: '0.88rem',
                              resize: 'vertical',
                            }}
                          />
                        </div>
                      )}

                      {block.type === 'list' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--sl-color-text-muted)' }}>
                              Elementos de la lista (utiliza los botones de sangría ⇥ / ⇤ para crear subniveles):
                            </p>
                          </div>

                          {/* LISTADO DE ELEMENTOS INTERACTIVOS CON SANGRÍA */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            {(!block.items || block.items.length === 0) ? (
                              <p style={{ fontSize: '0.82rem', color: 'var(--sl-color-text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                                La lista está vacía. Haz clic en "Añadir elemento" para comenzar.
                              </p>
                            ) : (
                              block.items.map((it, itemIdx) => {
                                const itemStr = typeof it === 'string' ? it : String(it);
                                const match = itemStr.match(/^(\s*)(.*)$/);
                                const indentSpaces = match ? match[1].length : 0;
                                const text = match ? match[2] : itemStr;
                                const level = Math.floor(indentSpaces / 2) + 1;

                                return (
                                  <div
                                    key={itemIdx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.45rem',
                                      paddingLeft: `${Math.min(indentSpaces * 14, 120)}px`,
                                      transition: 'padding-left 0.15s ease',
                                    }}
                                  >
                                    <span 
                                      style={{ 
                                        fontSize: '0.75rem', 
                                        color: level > 1 ? 'var(--sl-color-accent)' : 'var(--sl-color-text-muted)',
                                        minWidth: '22px',
                                        fontWeight: 600,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '2px',
                                      }}
                                      title={`Nivel ${level} (${indentSpaces} espacios de sangría)`}
                                    >
                                      {level > 1 ? '↳ •' : '•'}
                                    </span>

                                    <input
                                      type="text"
                                      value={text}
                                      onChange={(e) => updateListItem(block.id, itemIdx, e.target.value)}
                                      placeholder={`Elemento de nivel ${level}...`}
                                      style={{
                                        flex: 1,
                                        background: 'var(--sl-color-bg)',
                                        color: 'var(--sl-color-text)',
                                        border: '1px solid var(--sl-color-border)',
                                        borderRadius: '5px',
                                        padding: '0.35rem 0.6rem',
                                        fontSize: '0.86rem',
                                      }}
                                    />

                                    {/* BOTÓN REDUCIR SANGRÍA (OUTDENT) */}
                                    <button
                                      type="button"
                                      onClick={() => outdentListItem(block.id, itemIdx)}
                                      disabled={indentSpaces === 0}
                                      className="sl-btn sl-btn-outline"
                                      style={{
                                        padding: '0.25rem 0.45rem',
                                        fontSize: '0.75rem',
                                        opacity: indentSpaces === 0 ? 0.3 : 1,
                                        cursor: indentSpaces === 0 ? 'not-allowed' : 'pointer',
                                      }}
                                      title="Reducir sangría / Subir nivel (-2 espacios)"
                                    >
                                      <Outdent size={13} />
                                    </button>

                                    {/* BOTÓN AUMENTAR SANGRÍA (INDENT) */}
                                    <button
                                      type="button"
                                      onClick={() => indentListItem(block.id, itemIdx)}
                                      className="sl-btn sl-btn-outline"
                                      style={{
                                        padding: '0.25rem 0.45rem',
                                        fontSize: '0.75rem',
                                      }}
                                      title="Aumentar sangría / Crear subelemento (+2 espacios)"
                                    >
                                      <Indent size={13} />
                                    </button>

                                    {/* BOTÓN ELIMINAR ELEMENTO */}
                                    <button
                                      type="button"
                                      onClick={() => removeListItem(block.id, itemIdx)}
                                      className="sl-btn sl-btn-outline"
                                      style={{
                                        padding: '0.25rem 0.45rem',
                                        fontSize: '0.75rem',
                                        borderColor: 'rgba(248, 81, 73, 0.3)',
                                        color: '#ff7b72',
                                      }}
                                      title="Eliminar este elemento"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                );
                              })
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                            <button
                              type="button"
                              onClick={() => addListItem(block.id)}
                              className="sl-btn sl-btn-outline"
                              style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem', color: 'var(--sl-color-accent)' }}
                            >
                              <Plus size={13} />
                              <span>Añadir elemento a la lista</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {block.type === 'image' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <input
                            type="text"
                            value={block.url || ''}
                            onChange={(e) => modifyBlock(block.id, 'url', e.target.value)}
                            placeholder="URL de la imagen (ej: /images/diagrama.png o https://...)"
                            style={{
                              width: '100%',
                              background: 'var(--sl-color-bg)',
                              color: 'var(--sl-color-text)',
                              border: '1px solid var(--sl-color-border)',
                              borderRadius: '4px',
                              padding: '0.4rem 0.6rem',
                              fontSize: '0.85rem',
                            }}
                          />
                          <input
                            type="text"
                            value={block.alt || ''}
                            onChange={(e) => modifyBlock(block.id, 'alt', e.target.value)}
                            placeholder="Texto alternativo (alt text)"
                            style={{
                              width: '100%',
                              background: 'var(--sl-color-bg)',
                              color: 'var(--sl-color-text)',
                              border: '1px solid var(--sl-color-border)',
                              borderRadius: '4px',
                              padding: '0.4rem 0.6rem',
                              fontSize: '0.85rem',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* EDITOR DE MARKDOWN PURO */
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--sl-color-text-muted)', marginBottom: '0.5rem' }}>
                Edición de código fuente Markdown (.md). Los cambios se reflejarán automáticamente en el editor visual por bloques.
              </p>
              <textarea
                value={rawMarkdown}
                onChange={(e) => updateMarkdownState(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '600px',
                  background: '#0d1117',
                  color: '#f0f6fc',
                  border: '1px solid var(--sl-color-border)',
                  borderRadius: '8px',
                  padding: '1rem',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  resize: 'vertical',
                }}
              />
            </div>
          )}
        </div>

        {/* PREVISUALIZACIÓN EN VIVO (ESTILO STARLIGHT) */}
        {showPreview && (
          <div style={{
            background: 'var(--sl-color-bg-sidebar)',
            border: '1px solid var(--sl-color-border)',
            borderRadius: '10px',
            padding: '1.5rem',
            overflowY: 'auto',
            maxHeight: '800px',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sl-color-accent)', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid var(--sl-color-border)', paddingBottom: '0.4rem' }}>
              👁️ Previsualización en Vivo (Starlight)
            </div>
            <MarkdownRenderer content={rawMarkdown} />
          </div>
        )}
      </div>
    </div>
  );
}
