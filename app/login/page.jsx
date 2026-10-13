'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleManualLogin = (e) => {
    e.preventDefault();
    // Redirige al flujo de login de Auth0 (puede pre-cargar el correo si se desea)
    const loginUrl = email 
      ? `/auth/login?login_hint=${encodeURIComponent(email)}` 
      : '/auth/login';
    window.location.href = loginUrl;
  };

  const handleGoogleLogin = () => {
    // Redirige directamente a la conexión social de Google en Auth0
    window.location.href = '/auth/login?connection=google-oauth2';
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(circle at 35% 25%, #42163b 0%, transparent 45%), radial-gradient(circle at 75% 35%, #231644 0%, transparent 50%), radial-gradient(circle at 50% 85%, #14213d 0%, #090a14 75%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Botón flotante para regresar al inicio */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
        <Link 
          href="/" 
          className="sl-btn sl-btn-outline"
          style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            fontSize: '0.85rem'
          }}
        >
          <ArrowLeft size={15} />
          <span>Volver al Portal</span>
        </Link>
      </div>

      {/* TARJETA GLASSMORPHISM PRINCIPAL (RÉPLICA DEL DISEÑO) */}
      <div style={{
        width: '100%',
        maxWidth: '410px',
        background: 'rgba(255, 255, 255, 0.045)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '34px',
        padding: '3rem 2.25rem 2.5rem',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}>
        {/* AVATAR SILUETA CON RESPLANDOR */}
        <div style={{
          width: '92px',
          height: '92px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 0 40px rgba(186, 24, 88, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2.5rem',
        }}>
          <User size={46} color="rgba(255, 255, 255, 0.55)" strokeWidth={1.5} />
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleManualLogin} style={{ width: '100%' }}>
          {/* CAMPO EMAIL */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1.5px solid rgba(255, 255, 255, 0.3)',
            paddingBottom: '0.6rem',
            marginBottom: '1.75rem',
            transition: 'border-color 0.2s',
          }}>
            <Mail size={18} color="rgba(255, 255, 255, 0.7)" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email ID"
              required
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '0.95rem',
                marginLeft: '0.85rem',
                letterSpacing: '0.02em',
              }}
            />
          </div>

          {/* CAMPO PASSWORD */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1.5px solid rgba(255, 255, 255, 0.3)',
            paddingBottom: '0.6rem',
            marginBottom: '1.5rem',
            transition: 'border-color 0.2s',
          }}>
            <Lock size={18} color="rgba(255, 255, 255, 0.7)" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '0.95rem',
                marginLeft: '0.85rem',
                letterSpacing: '0.02em',
              }}
            />
          </div>

          {/* REMEMBER ME & FORGOT PASSWORD */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            fontSize: '0.82rem',
            color: 'rgba(255, 255, 255, 0.65)',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: '#8a2be2',
                  cursor: 'pointer',
                  width: '14px',
                  height: '14px',
                }}
              />
              <span>Remember me</span>
            </label>
            <a 
              href="/auth/login" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.65)', 
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = '#ffffff'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.65)'}
            >
              Forgot Password?
            </a>
          </div>

          {/* BOTÓN LOGIN (DEGRADADO GLOWING) */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'linear-gradient(135deg, #3d1b4b 0%, #201a4f 55%, #182859 100%)',
              boxShadow: '0 12px 28px rgba(32, 26, 79, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
              marginBottom: '1.75rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 16px 32px rgba(45, 30, 95, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(32, 26, 79, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.25)';
            }}
          >
            LOGIN
          </button>
        </form>

        {/* SEPARADOR "O CONTINUAR CON" */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            O continuar con
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.15)' }} />
        </div>

        {/* BOTÓN INICIAR SESIÓN CON GOOGLE */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '0.8rem 1rem',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            background: 'rgba(255, 255, 255, 0.07)',
            backdropFilter: 'blur(10px)',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {/* LOGO OFICIAL DE GOOGLE (SVG) */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.87c2.27-2.09 3.67-5.17 3.67-9.14z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.04c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.13C3.25 21.31 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.25c-.25-.72-.39-1.49-.39-2.25s.14-1.53.39-2.25V6.62H1.27C.46 8.24 0 10.06 0 12s.46 3.76 1.27 5.38l4-3.13z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.69 1.27 6.62l4 3.13c.95-2.85 3.6-4.96 6.73-4.96z"
            />
          </svg>
          <span>Iniciar sesión con Google</span>
        </button>
      </div>
    </div>
  );
}
