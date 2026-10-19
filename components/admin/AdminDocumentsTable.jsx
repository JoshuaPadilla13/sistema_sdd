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
  RefreshCw
} from 'lucide-react';

export default function AdminDocumentsTable({ initialDocuments = [], categories = [] }) {
  const [docs, setDocs] = useState(initialDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savingOrder, setSavingOrder] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }
  const [deletingId, setDeletingId] = useState(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c.title]));

  // Mostrar mensaje temporal de confirmación o alerta
  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  // Mover documento arriba o abajo
  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= docs.length) return;

    // Crear nuevo orden optimista en el estado
    const newDocs = [...docs];
    const [movedItem] = newDocs.splice(index, 1);
    newDocs.splice(targetIndex, 0, movedItem);

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

      showFeedback('success', `Orden actualizado: "${movedItem.title}" movido.`);
    } catch (err) {
      console.error(err);
      // Revertir en caso de falla
      setDocs(docs);
      showFeedback('error', 'No se pudo guardar el nuevo orden.');
    } finally {
      setSavingOrder(false);
    }
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

      {/* TABLA DE DOCUMENTOS */}
      <div style={{ background: 'var(--sl-color-bg-sidebar)', border: '1px solid var(--sl-color-border)', borderRadius: '10px', overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sl-color-border)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <th style={{ padding: '0.85rem 1rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem', width: '110px' }}>Orden</th>
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
              filteredDocs.map((doc, index) => {
                const catTitle = doc.categoryId ? categoryMap.get(doc.categoryId) : 'Sin categoría';
                const isFirst = index === 0;
                const isLast = index === filteredDocs.length - 1;
                const isDeleting = deletingId === doc.id;

                return (
                  <tr 
                    key={doc.id} 
                    style={{ 
                      borderBottom: '1px solid var(--sl-color-border)',
                      opacity: isDeleting ? 0.4 : 1,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* CONTROL DE ORDEN (MOVER ARRIBA / MOVER ABAJO) */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          color: 'var(--sl-color-text-muted)',
                          minWidth: '24px'
                        }}>
                          #{index + 1}
                        </span>

                        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px' }}>
                          <button
                            type="button"
                            onClick={() => handleMove(index, 'up')}
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
                            onClick={() => handleMove(index, 'down')}
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
                        >
                          <Eye size={14} />
                        </Link>
                        <a
                          href={`/api/docs/download/${doc.slug}`}
                          download
                          className="sl-btn sl-btn-outline"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.8rem' }}
                          title="Descargar archivo Markdown (.md)"
                        >
                          <Download size={14} />
                        </a>
                        <Link
                          href={`/admin/documents/${doc.id}`}
                          className="sl-btn sl-btn-outline"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.8rem' }}
                          title="Editar documento"
                        >
                          <Edit size={14} />
                        </Link>

                        {/* BOTÓN ELIMINAR ARCHIVO */}
                        <button
                          type="button"
                          onClick={() => handleDelete(doc)}
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
