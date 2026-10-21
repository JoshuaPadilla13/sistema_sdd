'use client';

import React, { useState, useEffect } from 'react';
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
  Code
} from 'lucide-react';

export default function AuditLogsViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableFilter, setTableFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tableFilter !== 'all') params.set('table', tableFilter);
      if (actionFilter !== 'all') params.set('action', actionFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', '100');

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
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [tableFilter, actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

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

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'INSERT':
        return 'success';
      case 'UPDATE':
        return 'note';
      case 'DELETE':
        return 'danger';
      default:
        return 'caution';
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
        borderRadius: '8px',
        border: '1px solid var(--sl-color-border)'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 280px', maxWidth: '420px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Buscar por nombre, correo o ID..."
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
              onChange={(e) => setTableFilter(e.target.value)}
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
              <option value="documents">documents</option>
              <option value="categories">categories</option>
              <option value="users">users</option>
              <option value="user_roles">user_roles</option>
              <option value="markdown_files">markdown_files</option>
              <option value="document_revisions">document_revisions</option>
            </select>
          </div>

          {/* Filtro por Acción */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--sl-color-text-muted)', fontWeight: 600 }}>Acción:</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
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
            title="Refrescar lista"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* TABLA DE AUDITORÍA */}
      <div style={{
        background: 'var(--sl-color-bg-sidebar)',
        border: '1px solid var(--sl-color-border)',
        borderRadius: '10px',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sl-color-border)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Fecha y Hora</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Tabla</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Operación</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>ID Registro</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Usuario Responsable</th>
              <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem', textAlign: 'right' }}>Diff / Detalle</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--sl-color-text-muted)' }}>
                  <RefreshCw size={20} className="spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                  <div>Cargando registros de auditoría de la base de datos...</div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--sl-color-text-muted)' }}>
                  <ShieldCheck size={28} style={{ color: 'var(--sl-color-accent)', marginBottom: '0.5rem' }} />
                  <div>No se encontraron registros de auditoría con los filtros seleccionados.</div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--sl-color-border)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '0.9rem 1.25rem', fontSize: '0.85rem', color: 'var(--sl-color-text-muted)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={13} color="var(--sl-color-text-muted)" />
                      <span>{formatDate(log.changedAt)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <span style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '0.82rem', 
                      background: 'var(--sl-color-bg)', 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px',
                      border: '1px solid var(--sl-color-border)',
                      color: 'var(--sl-color-text-title)'
                    }}>
                      {log.tableName}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem' }}>
                    <span className={`sl-badge ${getActionBadgeClass(log.action)}`} style={{ fontWeight: 700 }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--sl-color-text)' }}>
                    <span title={log.recordId} style={{ display: 'inline-block', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.recordId}
                    </span>
                  </td>
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
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--sl-color-text-title)', fontSize: '0.88rem' }}>
                          {log.userName || 'Sistema / Sin asignar'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--sl-color-text-muted)' }}>
                          {log.userEmail || log.changedBy}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="sl-btn sl-btn-outline"
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                    >
                      <Eye size={13} />
                      <span>Ver Diff</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
            maxWidth: '900px',
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
                  <span className={`sl-badge ${getActionBadgeClass(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--sl-color-text-title)', margin: 0 }}>
                    Registro de Auditoría #{selectedLog.id} en <code>{selectedLog.tableName}</code>
                  </h3>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--sl-color-text-muted)' }}>
                  Modificado por <strong style={{ color: 'var(--sl-color-text-title)' }}>{selectedLog.userName || selectedLog.changedBy}</strong> {selectedLog.userEmail && `(${selectedLog.userEmail})`} el {formatDate(selectedLog.changedAt)} (ID: <code>{selectedLog.recordId}</code>)
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
