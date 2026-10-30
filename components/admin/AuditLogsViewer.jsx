'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  Filter, 
  Eye, 
  X, 
  Database, 
  Clock, 
  User, 
  ArrowRight,
  Code,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  PlusCircle,
  Edit3,
  Trash2,
  FileText
} from 'lucide-react';

/**
 * Genera una descripción concisa, humana y en lenguaje natural
 * de lo que realizó el usuario en la plataforma.
 */
export function describeAuditAction(log) {
  if (!log) return 'Acción registrada';
  const { tableName, action, oldData, newData } = log;

  // Extraer títulos, nombres o identificadores semánticos
  const targetTitle = newData?.title || oldData?.title;
  const targetSlug = newData?.slug || oldData?.slug;
  const targetName = newData?.name || oldData?.name || newData?.email || oldData?.email;
  const targetFile = newData?.filename || oldData?.filename;
  const targetRole = newData?.role || oldData?.role;

  switch (tableName) {
    case 'documents':
      if (action === 'INSERT') {
        return `Creó el documento "${targetTitle || targetSlug || 'Sin título'}"`;
      }
      if (action === 'DELETE') {
        return `Eliminó el documento "${targetTitle || targetSlug || 'Sin título'}"`;
      }
      if (action === 'UPDATE') {
        const changes = [];
        if (oldData?.title !== newData?.title && newData?.title) {
          changes.push(`renombró a "${newData.title}"`);
        }
        if (oldData?.template_slug !== newData?.template_slug) {
          changes.push(
            newData?.template_slug
              ? `vinculó la plantilla "${newData.template_slug.replace('plantillas/', '')}"`
              : 'desvinculó la plantilla asociada'
          );
        }
        if (oldData?.phase !== newData?.phase && newData?.phase) {
          changes.push(`cambió a Fase ${newData.phase}`);
        }
        if (oldData?.order_index !== newData?.order_index && newData?.order_index !== undefined) {
          changes.push(`cambió el orden (#${newData?.order_index})`);
        }
        if (changes.length > 0) {
          return `Actualizó "${targetTitle || targetSlug || 'Documento'}": ${changes.join(', ')}`;
        }
        return `Modificó contenido o bloques de "${targetTitle || targetSlug || 'Documento'}"`;
      }
      break;

    case 'categories':
      if (action === 'INSERT') return `Creó la categoría "${targetTitle || 'Nueva categoría'}"`;
      if (action === 'UPDATE') return `Modificó la categoría "${targetTitle || 'Categoría'}"`;
      if (action === 'DELETE') return `Eliminó la categoría "${targetTitle || 'Categoría'}"`;
      break;

    case 'users':
      if (action === 'INSERT') return `Registró al usuario "${targetName || 'Nuevo usuario'}"`;
      if (action === 'UPDATE') {
        if (oldData?.is_active !== newData?.is_active) {
          return `${newData?.is_active ? 'Activó' : 'Desactivó'} la cuenta de "${targetName || 'Usuario'}"`;
        }
        return `Actualizó datos del perfil de "${targetName || 'Usuario'}"`;
      }
      if (action === 'DELETE') return `Eliminó al usuario "${targetName || 'Usuario'}"`;
      break;

    case 'user_roles':
      if (action === 'INSERT') return `Asignó el rol ${targetRole || 'ROL'} a un usuario`;
      if (action === 'DELETE') return `Revocó el rol ${targetRole || 'ROL'} a un usuario`;
      if (action === 'UPDATE') return `Modificó rol ${targetRole || 'ROL'} de un usuario`;
      break;

    case 'markdown_files':
      if (action === 'INSERT') return `Subió el archivo Markdown "${targetFile || 'archivo.md'}"`;
      if (action === 'DELETE') return `Eliminó el archivo Markdown "${targetFile || 'archivo.md'}"`;
      if (action === 'UPDATE') return `Actualizó el archivo Markdown "${targetFile || 'archivo.md'}"`;
      break;

    case 'document_revisions':
      if (action === 'INSERT') {
        const summary = newData?.change_summary || 'Nueva versión';
        return `Guardó revisión v${newData?.version || '1'}: ${summary}`;
      }
      break;

    default:
      if (action === 'INSERT') return `Creó un registro nuevo en "${tableName}"`;
      if (action === 'UPDATE') return `Actualizó un registro en "${tableName}"`;
      if (action === 'DELETE') return `Eliminó un registro de "${tableName}"`;
      return `${action} en "${tableName}"`;
  }

  return `${action} en ${tableName}`;
}

export default function AuditLogsViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  // Estados de Paginación (10 registros por página predeterminado)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tableFilter !== 'all') params.set('table', tableFilter);
      if (actionFilter !== 'all') params.set('action', actionFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', '500'); // Traer lote amplio para paginación fluida

      const res = await fetch(`/api/superadmin/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error('Error al consultar logs de auditoría:', err);
      setLogs([]);
    } finally {
      setLoading(false);
      setCurrentPage(1); // Regresar a la página 1 tras nueva consulta
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [tableFilter, actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  // Cálculo de paginación (10 registros por página)
  const totalPages = Math.ceil(logs.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, logs.length);
  const paginatedLogs = useMemo(() => {
    return logs.slice(startIndex, endIndex);
  }, [logs, startIndex, endIndex]);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'medium'
      });
    } catch {
      return isoString;
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'INSERT':
        return {
          variant: 'success',
          label: 'INSERT',
          icon: <PlusCircle size={12} color="#56d364" />
        };
      case 'UPDATE':
        return {
          variant: 'note',
          label: 'UPDATE',
          icon: <Edit3 size={12} color="#58a6ff" />
        };
      case 'DELETE':
        return {
          variant: 'danger',
          label: 'DELETE',
          icon: <Trash2 size={12} color="#ff7b72" />
        };
      default:
        return {
          variant: 'caution',
          label: action,
          icon: <FileText size={12} color="#f2cc60" />
        };
    }
  };

  return (
    <div>
      {/* BARRA DE HERRAMIENTAS Y FILTROS */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: '1.25rem',
        background: 'var(--sl-color-bg-sidebar)',
        padding: '1rem 1.25rem',
        borderRadius: '10px',
        border: '1px solid var(--sl-color-border)'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 280px', maxWidth: '420px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Buscar por descripción, usuario, correo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2rem',
                borderRadius: '6px',
                background: 'var(--sl-color-bg)',
                color: 'var(--sl-color-text)',
                border: '1px solid var(--sl-color-border)',
                fontSize: '0.85rem'
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--sl-color-text-muted)' }} />
          </div>
          <button type="submit" className="sl-btn sl-btn-outline" style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}>
            Buscar
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Filtro por Tabla */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--sl-color-text-muted)', fontWeight: 600 }}>Tabla:</label>
            <select
              value={tableFilter}
              onChange={(e) => {
                setTableFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.45rem 0.65rem',
                borderRadius: '6px',
                background: 'var(--sl-color-bg)',
                color: 'var(--sl-color-text)',
                border: '1px solid var(--sl-color-border)',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">Todas las tablas</option>
              <option value="documents">documents (Documentos)</option>
              <option value="categories">categories (Categorías)</option>
              <option value="users">users (Usuarios)</option>
              <option value="user_roles">user_roles (Roles)</option>
              <option value="markdown_files">markdown_files (.md)</option>
              <option value="document_revisions">document_revisions (Revisiones)</option>
            </select>
          </div>

          {/* Filtro por Acción */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--sl-color-text-muted)', fontWeight: 600 }}>Acción:</label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.45rem 0.65rem',
                borderRadius: '6px',
                background: 'var(--sl-color-bg)',
                color: 'var(--sl-color-text)',
                border: '1px solid var(--sl-color-border)',
                fontSize: '0.85rem'
              }}
            >
              <option value="all">Todas las acciones</option>
              <option value="INSERT">INSERT (Creación)</option>
              <option value="UPDATE">UPDATE (Modificación)</option>
              <option value="DELETE">DELETE (Eliminación)</option>
            </select>
          </div>

          <button
            onClick={fetchLogs}
            className="sl-btn sl-btn-outline"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
            title="Refrescar registros"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA CON DESCRIPCIÓN BREVE */}
      <div style={{
        background: 'var(--sl-color-bg-sidebar)',
        border: '1px solid var(--sl-color-border)',
        borderRadius: '10px',
        overflowX: 'auto',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
      }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sl-color-border)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem', width: '160px' }}>Fecha y Hora</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem', width: '220px' }}>Usuario Responsable</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>¿Qué hizo? (Descripción Breve)</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem', width: '150px' }}>Operación & Tabla</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem', textAlign: 'right', width: '110px' }}>Diff / Detalle</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--sl-color-text-muted)' }}>
                  <RefreshCw size={24} className="spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                  <div>Cargando registros de auditoría de Neon PostgreSQL...</div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--sl-color-text-muted)' }}>
                  <ShieldCheck size={32} style={{ color: 'var(--sl-color-accent)', marginBottom: '0.5rem' }} />
                  <div style={{ fontWeight: 600, color: 'var(--sl-color-text)' }}>No se encontraron registros de auditoría</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Prueba ajustando los filtros de búsqueda o tabla.</div>
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => {
                const badgeInfo = getActionBadge(log.action);
                const description = describeAuditAction(log);

                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--sl-color-border)', transition: 'background 0.2s' }}>
                    {/* FECHA Y HORA */}
                    <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.82rem', color: 'var(--sl-color-text-muted)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={13} color="var(--sl-color-text-muted)" />
                        <span>{formatDate(log.changedAt)}</span>
                      </div>
                    </td>

                    {/* USUARIO RESPONSABLE */}
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {log.userPicture ? (
                          <img
                            src={log.userPicture}
                            alt={log.userName || 'Usuario'}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '1px solid var(--sl-color-border)',
                              flexShrink: 0
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(88, 166, 255, 0.15)',
                            color: '#58a6ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            flexShrink: 0
                          }}>
                            {(log.userName || log.changedBy || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: 'var(--sl-color-text-title)', fontSize: '0.86rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {log.userName || 'Sistema / Sin asignar'}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--sl-color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {log.userEmail || log.changedBy}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ¿QUÉ HIZO? (DESCRIPCIÓN BREVE) */}
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ marginTop: '2px', flexShrink: 0 }}>
                          {badgeInfo.icon}
                        </span>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--sl-color-text-title)', lineHeight: '1.4' }}>
                            {description}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--sl-color-text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                            ID: {log.recordId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* OPERACIÓN & TABLA */}
                    <td style={{ padding: '0.9rem 1.25rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                        <span className={`sl-badge ${badgeInfo.variant}`} style={{ fontWeight: 700, fontSize: '0.72rem' }}>
                          {log.action}
                        </span>
                        <span style={{ 
                          fontFamily: 'monospace', 
                          fontSize: '0.76rem', 
                          background: 'var(--sl-color-bg)', 
                          padding: '0.15rem 0.45rem', 
                          borderRadius: '4px',
                          border: '1px solid var(--sl-color-border)',
                          color: 'var(--sl-color-text-muted)'
                        }}>
                          {log.tableName}
                        </span>
                      </div>
                    </td>

                    {/* ACCIONES (VER DIFF) */}
                    <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="sl-btn sl-btn-outline"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', gap: '0.35rem' }}
                        title="Ver comparativa JSON de cambios (Diff)"
                      >
                        <Eye size={13} />
                        <span>Ver Diff</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* BARRA DE PAGINACIÓN A 10 REGISTROS */}
      {!loading && logs.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginTop: '1.25rem',
          padding: '0.85rem 1.25rem',
          background: 'var(--sl-color-bg-sidebar)',
          border: '1px solid var(--sl-color-border)',
          borderRadius: '10px'
        }}>
          {/* INFORMACIÓN DE REGISTROS VISIBLES */}
          <div style={{ fontSize: '0.85rem', color: 'var(--sl-color-text-muted)' }}>
            Mostrando <strong style={{ color: 'var(--sl-color-text-title)' }}>{startIndex + 1}</strong> a{' '}
            <strong style={{ color: 'var(--sl-color-text-title)' }}>{endIndex}</strong> de{' '}
            <strong style={{ color: 'var(--sl-color-accent)' }}>{logs.length}</strong> registros
            <span style={{ marginLeft: '0.75rem', color: 'var(--sl-color-border)' }}>|</span>
            <span style={{ marginLeft: '0.75rem' }}>
              Página <strong style={{ color: 'var(--sl-color-text-title)' }}>{safeCurrentPage}</strong> de{' '}
              <strong style={{ color: 'var(--sl-color-text-title)' }}>{totalPages}</strong>
            </span>
          </div>

          {/* SELECTOR DE TAMAÑO Y BOTONES DE PÁGINA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Selector de registros por página */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginRight: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--sl-color-text-muted)' }}>Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8rem',
                  borderRadius: '4px',
                  background: 'var(--sl-color-bg)',
                  color: 'var(--sl-color-text)',
                  border: '1px solid var(--sl-color-border)',
                  cursor: 'pointer'
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Botón Primera Página */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="sl-btn sl-btn-outline"
              style={{
                padding: '0.3rem 0.55rem',
                fontSize: '0.78rem',
                opacity: safeCurrentPage === 1 ? 0.35 : 1,
                cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer'
              }}
              title="Primera página"
            >
              <ChevronsLeft size={14} />
            </button>

            {/* Botón Anterior */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="sl-btn sl-btn-outline"
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                opacity: safeCurrentPage === 1 ? 0.35 : 1,
                cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <ChevronLeft size={14} />
              <span>Anterior</span>
            </button>

            {/* Números de página interactivos */}
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  return (
                    p === 1 ||
                    p === totalPages ||
                    (p >= safeCurrentPage - 2 && p <= safeCurrentPage + 2)
                  );
                })
                .map((p, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && p - prevPage > 1;

                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && (
                        <span style={{ padding: '0 0.25rem', color: 'var(--sl-color-text-muted)', fontSize: '0.8rem' }}>
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => setCurrentPage(p)}
                        style={{
                          minWidth: '28px',
                          height: '28px',
                          padding: '0 0.4rem',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          fontWeight: p === safeCurrentPage ? 700 : 500,
                          background: p === safeCurrentPage ? 'var(--sl-color-accent)' : 'var(--sl-color-bg)',
                          color: p === safeCurrentPage ? '#ffffff' : 'var(--sl-color-text)',
                          border: `1px solid ${p === safeCurrentPage ? 'var(--sl-color-accent)' : 'var(--sl-color-border)'}`,
                          cursor: 'pointer'
                        }}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            {/* Botón Siguiente */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
              className="sl-btn sl-btn-outline"
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                opacity: safeCurrentPage === totalPages ? 0.35 : 1,
                cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>Siguiente</span>
              <ChevronRight size={14} />
            </button>

            {/* Botón Última Página */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="sl-btn sl-btn-outline"
              style={{
                padding: '0.3rem 0.55rem',
                fontSize: '0.78rem',
                opacity: safeCurrentPage === totalPages ? 0.35 : 1,
                cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
              title="Última página"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE Y DIFF JSON */}
      {selectedLog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--sl-color-bg-sidebar)',
            border: '1px solid var(--sl-color-border)',
            borderRadius: '12px',
            maxWidth: '920px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden'
          }}>
            {/* Header del Modal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--sl-color-border)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <span className={`sl-badge ${getActionBadge(selectedLog.action).variant}`}>
                    {selectedLog.action}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--sl-color-text-title)', margin: 0 }}>
                    {describeAuditAction(selectedLog)}
                  </h3>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--sl-color-text-muted)' }}>
                  Tabla <code>{selectedLog.tableName}</code> · Modificado por <strong style={{ color: 'var(--sl-color-text-title)' }}>{selectedLog.userName || selectedLog.changedBy}</strong> {selectedLog.userEmail && `(${selectedLog.userEmail})`} el {formatDate(selectedLog.changedAt)} (ID: <code>{selectedLog.recordId}</code>)
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--sl-color-text-muted)',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido del Modal (Diff) */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: selectedLog.action === 'UPDATE' ? '1fr 1fr' : '1fr', gap: '1.25rem' }}>
                {/* ESTADO ANTERIOR (OLD_DATA) */}
                {(selectedLog.action === 'UPDATE' || selectedLog.action === 'DELETE') && (
                  <div style={{
                    background: 'var(--sl-color-bg)',
                    border: '1px solid var(--sl-color-border)',
                    borderRadius: '8px',
                    padding: '1rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ff7b72', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>🔴 Estado Anterior (OLD)</span>
                    </div>
                    <pre style={{
                      margin: 0,
                      padding: '0.85rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--sl-color-text)',
                      overflowX: 'auto',
                      maxHeight: '400px',
                      lineHeight: '1.4'
                    }}>
                      <code>{JSON.stringify(selectedLog.oldData, null, 2)}</code>
                    </pre>
                  </div>
                )}

                {/* ESTADO NUEVO (NEW_DATA) */}
                {(selectedLog.action === 'INSERT' || selectedLog.action === 'UPDATE') && (
                  <div style={{
                    background: 'var(--sl-color-bg)',
                    border: '1px solid var(--sl-color-border)',
                    borderRadius: '8px',
                    padding: '1rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#56d364', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>🟢 Estado Nuevo (NEW)</span>
                    </div>
                    <pre style={{
                      margin: 0,
                      padding: '0.85rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--sl-color-text)',
                      overflowX: 'auto',
                      maxHeight: '400px',
                      lineHeight: '1.4'
                    }}>
                      <code>{JSON.stringify(selectedLog.newData, null, 2)}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Footer del Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--sl-color-border)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <button
                onClick={() => setSelectedLog(null)}
                className="sl-btn sl-btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
