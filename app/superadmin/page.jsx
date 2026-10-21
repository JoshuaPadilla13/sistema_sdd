'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, ShieldAlert, ShieldCheck, User, ArrowLeft, RefreshCw, Lock, Users, Activity } from 'lucide-react';
import AuditLogsViewer from '../../components/admin/AuditLogsViewer';

const SUPER_ADMIN_EMAILS = [
  'nayeli.carrizales.diaz@gmail.com',
  'joshuapadillags@gmail.com'
];

export default function SuperAdminPage() {
  const [authChecking, setAuthChecking] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'audit'

  useEffect(() => {
    // 1. Validar identidad y privilegios antes de cualquier consulta de datos
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.isAuthenticated && data.isSuperAdmin) {
          setIsSuperAdmin(true);
          setCurrentUserEmail(data.user?.email || '');
          loadUsers();
        } else {
          setIsSuperAdmin(false);
        }
      })
      .catch(() => {
        setIsSuperAdmin(false);
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, []);

  const loadUsers = () => {
    setLoading(true);
    fetch('/api/users/roles')
      .then((res) => {
        if (!res.ok) throw new Error('No autorizado');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(() => {
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  if (authChecking) {
    return (
      <div style={{ maxWidth: '600px', margin: '6rem auto', textAlign: 'center', color: 'var(--sl-color-text-muted)' }}>
        <RefreshCw size={24} className="spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
        <p>Verificando credenciales de Super Administrador...</p>
      </div>
    );
  }

  // Si es un Admin normal u otro usuario, bloquear completamente el renderizado de la vista
  if (!isSuperAdmin) {
    return (
      <div style={{ maxWidth: '640px', margin: '4.5rem auto', padding: '2.5rem', background: 'var(--sl-color-bg-sidebar)', border: '1px solid #da3633', borderRadius: '12px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: 'rgba(218, 54, 51, 0.15)', color: '#ff7b72', marginBottom: '1.25rem' }}>
          <ShieldAlert size={44} />
        </div>
        <h2 style={{ fontSize: '1.6rem', color: 'var(--sl-color-text-title)', marginBottom: '0.85rem' }}>
          Acceso Restringido (403 Prohibido)
        </h2>
        <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
          Un perfil de <strong>Administrador regular</strong> no tiene autorización para acceder a las vistas ni funciones del panel de <strong>Super Administrador</strong>.
          Esta área está estrictamente reservada para el control, asignación de roles y la auditoría transparente del sistema.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link href="/admin" className="sl-btn sl-btn-primary" style={{ padding: '0.6rem 1.4rem' }}>
            <ArrowLeft size={16} />
            <span>Volver al Panel de Administrador</span>
          </Link>
          <Link href="/docs/introduccion/que-es-sdd" className="sl-btn sl-btn-outline" style={{ padding: '0.6rem 1.4rem' }}>
            <span>Ir a Documentación</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleToggleRole = async (userId, roleId, currentlyHasRole) => {
    try {
      const method = currentlyHasRole ? 'DELETE' : 'POST';
      const res = await fetch('/api/users/roles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, roleId }),
      });

      const data = await res.json();
      if (res.ok) {
        loadUsers();
      } else {
        alert(data.error || 'Error al actualizar rol');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* HEADER DEL PANEL */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--sl-color-text-title)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield color="var(--sl-badge-danger)" size={28} />
            <span>Panel de Super Administrador</span>
          </h1>
          <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Super Administradores autorizados: <strong style={{ color: '#ff7b72' }}>{SUPER_ADMIN_EMAILS.join(', ')}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {activeTab === 'roles' && (
            <button onClick={loadUsers} className="sl-btn sl-btn-outline" style={{ fontSize: '0.85rem' }}>
              <RefreshCw size={14} />
              <span>Actualizar Usuarios</span>
            </button>
          )}
          <Link href="/admin" className="sl-btn sl-btn-outline" style={{ fontSize: '0.85rem' }}>
            <ArrowLeft size={14} />
            <span>Panel Admin</span>
          </Link>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN SUPER ADMIN */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--sl-color-border)',
        paddingBottom: '0.25rem'
      }}>
        <button
          onClick={() => setActiveTab('roles')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            background: activeTab === 'roles' ? 'rgba(218, 54, 51, 0.15)' : 'transparent',
            color: activeTab === 'roles' ? '#ff7b72' : 'var(--sl-color-text-muted)',
            border: 'none',
            borderBottom: activeTab === 'roles' ? '2px solid #da3633' : '2px solid transparent',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.2s ease'
          }}
        >
          <Users size={16} />
          <span>Gestión de Roles y Permisos</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.15rem',
            background: activeTab === 'audit' ? 'rgba(88, 166, 255, 0.15)' : 'transparent',
            color: activeTab === 'audit' ? '#58a6ff' : 'var(--sl-color-text-muted)',
            border: 'none',
            borderBottom: activeTab === 'audit' ? '2px solid #58a6ff' : '2px solid transparent',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            borderRadius: '6px 6px 0 0',
            transition: 'all 0.2s ease'
          }}
        >
          <Activity size={16} />
          <span>Auditoría de Base de Datos (Triggers)</span>
        </button>
      </div>

      {/* CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
      {activeTab === 'roles' ? (
        <div style={{ background: 'var(--sl-color-bg-sidebar)', border: '1px solid var(--sl-color-border)', borderRadius: '10px', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--sl-color-border)', background: 'rgba(255, 255, 255, 0.03)' }}>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Usuario</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Email</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem' }}>Roles Asignados</th>
                <th style={{ padding: '0.85rem 1.25rem', color: 'var(--sl-color-text-title)', fontSize: '0.85rem', textAlign: 'right' }}>Gestión de Roles</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--sl-color-text-muted)' }}>
                    Cargando usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--sl-color-text-muted)' }}>
                    <p style={{ marginBottom: '0.5rem' }}>No hay usuarios en la tabla de Neon.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isAdmin = u.roles?.includes('ADMIN');
                  const isSuperAdmin = u.roles?.includes('SUPER_ADMIN');
                  const isDesignatedSuperAdmin = SUPER_ADMIN_EMAILS.includes(u.email?.toLowerCase().trim());

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--sl-color-border)' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--sl-color-text-title)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={16} color="var(--sl-color-text-muted)" />
                          <span>{u.name || 'Sin nombre'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--sl-color-text-muted)', fontSize: '0.88rem' }}>
                        {u.email}
                        {isDesignatedSuperAdmin && (
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#ff7b72', fontWeight: 600 }}>
                            (Super Admin Oficial)
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {u.roles?.map((r) => (
                            <span
                              key={r}
                              className={`sl-badge ${
                                r === 'SUPER_ADMIN' ? 'danger' : r === 'ADMIN' ? 'caution' : 'note'
                              }`}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          {/* Toggle ADMIN */}
                          <button
                            onClick={() => handleToggleRole(u.id, 'ADMIN', isAdmin)}
                            className="sl-btn sl-btn-outline"
                            style={{
                              fontSize: '0.78rem',
                              padding: '0.25rem 0.6rem',
                              borderColor: isAdmin ? 'var(--sl-badge-caution)' : 'var(--sl-color-border)',
                              color: isAdmin ? '#f2cc60' : 'var(--sl-color-text-muted)',
                            }}
                          >
                            {isAdmin ? 'Quitar Admin' : '+ Dar Admin'}
                          </button>

                          {/* Toggle SUPER_ADMIN (Restringido estrictamente a los 2 correos) */}
                          {isDesignatedSuperAdmin ? (
                            <button
                              onClick={() => handleToggleRole(u.id, 'SUPER_ADMIN', isSuperAdmin)}
                              className="sl-btn sl-btn-outline"
                              style={{
                                fontSize: '0.78rem',
                                padding: '0.25rem 0.6rem',
                                borderColor: 'var(--sl-badge-danger)',
                                color: '#ff7b72',
                              }}
                            >
                              {isSuperAdmin ? 'Super Admin Activo' : '+ Activar Super Admin'}
                            </button>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--sl-color-text-muted)',
                                padding: '0.25rem 0.5rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                              title="Solo los correos designados pueden ser Super Admin"
                            >
                              <Lock size={12} />
                              <span>No autorizable</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <AuditLogsViewer />
      )}
    </div>
  );
}
