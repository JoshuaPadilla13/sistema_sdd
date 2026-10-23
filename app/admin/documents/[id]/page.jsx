'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Download, Eye, CheckCircle2 } from 'lucide-react';
import BlockEditor from '../../../../components/admin/BlockEditor';

export default function EditDocumentPage() {
  const { id } = useParams();
  const router = useRouter();

  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [rawMarkdown, setRawMarkdown] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/docs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setDocument(data);
          setTitle(data.title || '');
          setSlug(data.slug || '');
          setBlocks(Array.isArray(data.blocks) ? data.blocks : []);
          setRawMarkdown(data.rawMarkdown || '');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleEditorChange = ({ title: newTitle, blocks: newBlocks, rawMarkdown: newMd }) => {
    if (newTitle !== undefined) {
      setTitle(newTitle);
    }
    setBlocks(newBlocks);
    setRawMarkdown(newMd);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/docs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, blocks, rawMarkdown }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Error al guardar el documento: ${errorData.error || res.statusText || 'Error inesperado del servidor'}`);
      }
    } catch (err) {
      alert(`Error de conexión: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--sl-color-text-muted)' }}>
        Cargando editor de bloques...
      </div>
    );
  }

  if (!document) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2>Documento no encontrado</h2>
        <Link href="/admin" className="sl-btn sl-btn-outline" style={{ marginTop: '1rem' }}>
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* HEADER DE ACCIONES */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/admin" className="sl-btn sl-btn-outline" style={{ fontSize: '0.85rem' }}>
            <ArrowLeft size={14} />
            <span>Volver</span>
          </Link>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--sl-color-text-title)' }}>
            Editor Visual por Bloques: <span style={{ color: 'var(--sl-color-accent)' }}>{title}</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href={`/docs/${slug}`} className="sl-btn sl-btn-outline" style={{ fontSize: '0.85rem' }}>
            <Eye size={14} />
            <span>Ver en Web</span>
          </Link>
          <a
            href={`/api/docs/download/${slug}`}
            download
            className="sl-btn sl-btn-outline"
            style={{ fontSize: '0.85rem' }}
          >
            <Download size={14} />
            <span>Descargar .md</span>
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="sl-btn sl-btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <Save size={14} />
            <span>{saving ? 'Guardando...' : 'Guardar Bloques'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          background: '#23863622',
          border: '1px solid #238636',
          color: '#7ee787',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
        }}>
          <CheckCircle2 size={18} />
          <span>Bloques y contenido Markdown guardados exitosamente en Neon PostgreSQL.</span>
        </div>
      )}

      {/* METADATOS BÁSICOS (TÍTULO Y SLUG) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--sl-color-text-muted)', marginBottom: '0.35rem' }}>
            Título del Documento:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              borderRadius: '6px',
              background: 'var(--sl-color-bg-sidebar)',
              color: 'var(--sl-color-text)',
              border: '1px solid var(--sl-color-border)',
              fontSize: '0.9rem',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--sl-color-text-muted)', marginBottom: '0.35rem' }}>
            Slug (Ruta URL):
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              borderRadius: '6px',
              background: 'var(--sl-color-bg-sidebar)',
              color: 'var(--sl-color-text)',
              border: '1px solid var(--sl-color-border)',
              fontSize: '0.9rem',
            }}
          />
        </div>
      </div>

      {/* EDITOR VISUAL POR BLOQUES */}
      <BlockEditor
        title={title}
        onTitleChange={setTitle}
        initialBlocks={blocks}
        initialMarkdown={rawMarkdown}
        onChange={handleEditorChange}
      />
    </div>
  );
}
