'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, ShieldCheck, User, ArrowLeft, RefreshCw, Lock } from 'lucide-react';

const SUPER_ADMIN_EMAILS = [
  'nayeli.carrizales.diaz@gmail.com',
  'joshuapadillags@gmail.com'
];

export default function SuperAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    fetch('/api/users/roles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--sl-color-text-title)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield color="var(--sl-badge-danger)" size={28} />
            <span>Panel de Super Administrador: Control de Roles</span>
          </h1>
          <p style={{ color: 'var(--sl-color-text-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Super Administradores únicos autorizados: <strong style={{ color: '#ff7b72' }}>{SUPER_ADMIN_EMAILS.join(', ')}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadUsers} className="sl-btn sl-btn-outline" style={{ fontSize: '0.85rem' }}>
            <RefreshCw size={14} />
            <span>Actualizar</span>
          </button>
          <Link href="/admin" className="sl-btn sl-btn-outline" style={{ fontSize: '0.85rem' }}>
            <ArrowLeft size={14} />
            <span>Panel Admin</span>
          </Link>
        </div>
      </div>

      <div style={{ background: 'var(--sl-color-bg-sidebar)', border: '1px solid var(--sl-color-border)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
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
    </div>
  );
}
