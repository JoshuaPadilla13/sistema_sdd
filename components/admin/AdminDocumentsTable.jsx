'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Eye, 
  Download, 
  Edit, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  RefreshCw,
  GripVertical
} from 'lucide-react';

export default function AdminDocumentsTable({ initialDocuments = [], categories = [] }) {
  const [docs, setDocs] = useState(initialDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savingOrder, setSavingOrder] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }
  const [deletingId, setDeletingId] = useState(null);

  // Estados para Drag & Drop con el mouse
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c.title]));

  // Mostrar mensaje temporal de confirmación o alerta
  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  // Función común para persistir el nuevo orden en el backend
  const saveNewOrder = async (newDocs, movedTitle) => {
    setDocs(newDocs);
    setSavingOrder(true);

    try {
      const res = await fetch('/api/docs/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: newDocs.map((d) => d.id) }),
      });

      if (!res.ok) {
        throw new Error('Error al guardar el nuevo orden');
      }

      showFeedback('success', `Orden actualizado: "${movedTitle}" movido.`);
    } catch (err) {
      console.error(err);
      setDocs(docs); // Revertir en caso de falla
      showFeedback('error', 'No se pudo guardar el nuevo orden.');
    } finally {
      setSavingOrder(false);
    }
  };

  // Mover documento arriba o abajo mediante botones
  const handleMove = async (actualIndex, direction) => {
    const targetIndex = direction === 'up' ? actualIndex - 1 : actualIndex + 1;
    if (targetIndex < 0 || targetIndex >= docs.length) return;

    const newDocs = [...docs];
    const [movedItem] = newDocs.splice(actualIndex, 1);
    newDocs.splice(targetIndex, 0, movedItem);

    await saveNewOrder(newDocs, movedItem.title);
  };

  // Eventos de Drag and Drop con el mouse
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e, id) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = (e, id) => {
    if (dragOverId === id) {
      setDragOverId(null);
    }
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    setDragOverId(null);
    const sourceId = draggedId || e.dataTransfer.getData('text/plain');
    setDraggedId(null);

    if (!sourceId || sourceId === targetId) return;

    const fromIndex = docs.findIndex((d) => d.id === sourceId);
    const toIndex = docs.findIndex((d) => d.id === targetId);

    if (fromIndex === -1 || toIndex === -1) return;

    const newDocs = [...docs];
    const [movedItem] = newDocs.splice(fromIndex, 1);
    newDocs.splice(toIndex, 0, movedItem);

    await saveNewOrder(newDocs, movedItem.title);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Eliminar un archivo/documento
  const handleDelete = async (doc) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente el archivo "${doc.title}"?\n\nEsta acción eliminará el contenido Markdown, los bloques y sus revisiones asociadas.`
    );

    if (!confirmed) return;

    setDeletingId(doc.id);

    try {
      const res = await fetch(`/api/docs/${doc.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar el archivo');
      }

      // Remover documento del estado
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      showFeedback('success', `Archivo "${doc.title}" eliminado correctamente.`);
    } catch (err) {
      console.error(err);
      showFeedback('error', err.message || 'Error de conexión al eliminar archivo.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtrado reactivo por texto y categoría
  const filteredDocs = docs.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'all' || doc.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* BARRA DE MENSAJES DE ESTADO (TOASTS) */}
      {feedback && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
            background: feedback.type === 'success' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(248, 81, 73, 0.15)',
            border: `1px solid ${feedback.type === 'success' ? '#2ea043' : '#f85149'}`,
            color: feedback.type === 'success' ? '#7ee787' : '#ff7b72',
            animation: 'slSlideDown 0.2s ease',
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* CONTROLES DE FILTRADO Y BÚSQUEDA */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        background: 'var(--sl-color-bg-sidebar)',
        border: '1px solid var(--sl-color-border)',
        borderRadius: '10px',
        padding: '0.85rem 1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--sl-color-text-muted)" />
          <input
            type="text"
            placeholder="Buscar por título o slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--sl-color-text)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--sl-color-text-muted)', fontSize: '0.85rem' }}>
            <Filter size={14} />
            <span>Fase:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              background: 'var(--sl-color-bg)',
              color: 'var(--sl-color-text)',
              border: '1px solid var(--sl-color-border)',
              borderRadius: '6px',
              padding: '0.4rem 0.65rem',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">Todas las fases ({docs.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>

          {savingOrder && (
            <span style={{ fontSize: '0.8rem', color: 'var(--sl-color-accent)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <RefreshCw size={13} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Guardando orden...</span>
            </span>
          )}
        </div>
      </div>

      {/* AVISO INFORMATIVO DE REORDENAMIENTO */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.8rem',
        color: 'var(--sl-color-text-muted)',
        marginBottom: '0.75rem',
        paddingLeft: '0.25rem'
      }}>
        <GripVertical size={14} color="var(--sl-color-accent)" />
        <span>Puedes mover el orden <strong>arrastrando cualquier fila con el ratón</strong> o usando los botones <strong>↑ ↓</strong>.</span>
      </div>

      {/* TABLA DE DOCUMENTOS */}
      <div style={{ background: 'var(--sl-color-bg-sidebar)', border: '1px solid var(--sl-color-border)', borderRadius: '10px', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sl-color-border)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <th style={{ padding: '0.85rem 1rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem', width: '135px' }}>Orden</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Título</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Fase / Categoría</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Slug</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Estado</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--sl-color-text-muted)' }}>
                  <FileText size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p>No se encontraron archivos con los criterios seleccionados.</p>
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => {
                const actualIndex = docs.findIndex((d) => d.id === doc.id);
                const catTitle = doc.categoryId ? categoryMap.get(doc.categoryId) : 'Sin categoría';
                const isFirst = actualIndex === 0;
                const isLast = actualIndex === docs.length - 1;
                const isDeleting = deletingId === doc.id;
                const isBeingDragged = draggedId === doc.id;
                const isDragOver = dragOverId === doc.id;

                return (
                  <tr 
                    key={doc.id}
                    draggable={!savingOrder}
                    onDragStart={(e) => handleDragStart(e, doc.id)}
                    onDragOver={(e) => handleDragOver(e, doc.id)}
                    onDragLeave={(e) => handleDragLeave(e, doc.id)}
                    onDrop={(e) => handleDrop(e, doc.id)}
                    onDragEnd={handleDragEnd}
                    style={{ 
                      borderBottom: '1px solid var(--sl-color-border)',
                      opacity: isDeleting ? 0.3 : isBeingDragged ? 0.45 : 1,
                      background: isDragOver
                        ? 'rgba(88, 166, 255, 0.12)'
                        : isBeingDragged
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'transparent',
                      outline: isDragOver ? '2px dashed var(--sl-color-accent)' : 'none',
                      transition: 'background 0.15s ease, opacity 0.15s ease',
                      cursor: 'move',
                    }}
                  >
                    {/* CONTROL DE ORDEN (MANIJA DE ARRASTRE + NÚMERO + BOTONES ARRIBA/ABAJO) */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {/* ICONO MANIJA ARRASTRAR CON EL MOUSE */}
                        <span 
                          style={{ 
                            cursor: 'grab', 
                            color: isBeingDragged ? 'var(--sl-color-accent)' : 'var(--sl-color-text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px',
                            borderRadius: '4px',
                            transition: 'color 0.15s'
                          }}
                          title="Arrastrar fila para cambiar de orden"
                        >
                          <GripVertical size={16} />
                        </span>

                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          color: 'var(--sl-color-text-muted)',
                          minWidth: '22px'
                        }}>
                          #{actualIndex + 1}
                        </span>

                        {/* BOTONES ORIGINALES (ARRIBA Y ABAJO) */}
                        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(actualIndex, 'up');
                            }}
                            disabled={isFirst || savingOrder}
                            className="sl-btn sl-btn-outline"
                            style={{
                              padding: '2px 5px',
                              fontSize: '0.65rem',
                              lineHeight: 1,
                              borderRadius: '3px',
                              opacity: isFirst ? 0.25 : 1,
                              cursor: isFirst ? 'not-allowed' : 'pointer',
                            }}
                            title="Mover arriba"
                          >
                            <ArrowUp size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(actualIndex, 'down');
                            }}
                            disabled={isLast || savingOrder}
                            className="sl-btn sl-btn-outline"
                            style={{
                              padding: '2px 5px',
                              fontSize: '0.65rem',
                              lineHeight: 1,
                              borderRadius: '3px',
                              opacity: isLast ? 0.25 : 1,
                              cursor: isLast ? 'not-allowed' : 'pointer',
                            }}
                            title="Mover abajo"
                          >
                            <ArrowDown size={11} />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* TÍTULO */}
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--sl-color-text-title)' }}>
                      {doc.title}
                    </td>

                    {/* FASE / CATEGORÍA */}
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--sl-color-text-muted)', fontSize: '0.88rem' }}>
                      {catTitle}
                    </td>

                    {/* SLUG */}
                    <td style={{ padding: '1rem 1.25rem', color: 'var(--sl-color-accent)', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                      /{doc.slug}
                    </td>

                    {/* ESTADO */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="sl-badge success">Publicado</span>
                    </td>

                    {/* ACCIONES (VER, DESCARGAR, EDITAR, ELIMINAR) */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.45rem' }}>
                        <Link
                          href={`/docs/${doc.slug}`}
                          className="sl-btn sl-btn-outline"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.8rem' }}
                          title="Ver en vista pública"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye size={14} />
                        </Link>
                        <a
                          href={`/api/docs/download/${doc.slug}`}
                          download
                          className="sl-btn sl-btn-outline"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.8rem' }}
                          title="Descargar archivo Markdown (.md)"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download size={14} />
                        </a>
                        <Link
                          href={`/admin/documents/${doc.id}`}
                          className="sl-btn sl-btn-outline"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.8rem' }}
                          title="Editar documento"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Edit size={14} />
                        </Link>

                        {/* BOTÓN ELIMINAR ARCHIVO */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc);
                          }}
                          disabled={isDeleting}
                          className="sl-btn sl-btn-outline"
                          style={{
                            padding: '0.3rem 0.55rem',
                            fontSize: '0.8rem',
                            borderColor: 'rgba(248, 81, 73, 0.4)',
                            color: '#ff7b72',
                          }}
                          title="Eliminar archivo permanentemente"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
