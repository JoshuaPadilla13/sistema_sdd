'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Upload, ArrowLeft, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function UploadMarkdownPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [uploadedDoc, setUploadedDoc] = useState(null);

  useEffect(() => {
    // Cargar categorías disponibles
    fetch('/api/docs/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.name.toLowerCase().endsWith('.md')) {
        setFile(selected);
        setStatusMessage(null);
      } else {
        alert('Por favor selecciona un archivo con extensión .md');
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Debes seleccionar un archivo Markdown (.md)');
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    if (selectedCategory) {
      formData.append('categoryId', selectedCategory);
    }

    try {
      const res = await fetch('/api/docs/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        setUploadedDoc(data.document);
        setFile(null);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Error al subir el archivo' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error de conexión al subir el archivo' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" className="sl-btn sl-btn-outline" style={{ fontSize: '0.85rem' }}>
          <ArrowLeft size={14} />
          <span>Volver al panel</span>
        </Link>
      </div>

      <div style={{ background: 'var(--sl-color-bg-sidebar)', border: '1px solid var(--sl-color-border)', borderRadius: '12px', padding: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--sl-color-text-title)', marginBottom: '0.5rem' }}>
          📤 Subir Archivo Markdown (.md)
        </h1>
        <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.92rem', marginBottom: '2rem' }}>
          Sube tus archivos de especificación, plantillas o requerimientos. El sistema procesará el Frontmatter YAML, extraerá el título y guardará la versión en Neon PostgreSQL.
        </p>

        {statusMessage && (
          <div style={{
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: statusMessage.type === 'success' ? '#23863622' : '#f8514922',
            border: `1px solid ${statusMessage.type === 'success' ? '#238636' : '#f85149'}`,
            color: statusMessage.type === 'success' ? '#7ee787' : '#ff7b72',
          }}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span style={{ fontSize: '0.9rem' }}>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--sl-color-text-title)', marginBottom: '0.5rem' }}>
              Fase o Categoría (Opcional):
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '6px',
                background: 'var(--sl-color-bg)',
                color: 'var(--sl-color-text)',
                border: '1px solid var(--sl-color-border)',
                fontSize: '0.9rem',
              }}
            >
              <option value="">-- Asignar automáticamente o sin categoría --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sl-dropzone" onClick={() => document.getElementById('md-file-input').click()}>
            <input
              id="md-file-input"
              type="file"
              accept=".md"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Upload size={38} color="var(--sl-color-accent)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--sl-color-text-title)', marginBottom: '0.5rem' }}>
              {file ? file.name : 'Haz clic para seleccionar o arrastra tu archivo .md'}
            </h3>
            <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.85rem' }}>
              Formatos soportados: Markdown (.md) estándar o con Frontmatter YAML.
            </p>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading || !file}
              className="sl-btn sl-btn-primary"
              style={{ opacity: loading || !file ? 0.6 : 1 }}
            >
              {loading ? 'Procesando...' : 'Subir y Procesar Archivo'}
            </button>
          </div>
        </form>

        {uploadedDoc && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--sl-color-border)', paddingTop: '1.5rem' }}>
            <h4 style={{ color: 'var(--sl-color-text-title)', marginBottom: '0.5rem' }}>
              Documento disponible:
            </h4>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href={`/docs/${uploadedDoc.slug}`} className="sl-btn sl-btn-primary" style={{ fontSize: '0.85rem' }}>
                Ver en la Documentación
              </Link>
              <Link href={`/admin/documents/${uploadedDoc.docId}`} className="sl-btn sl-btn-outline" style={{ fontSize: '0.85rem' }}>
                Editar Documento
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
