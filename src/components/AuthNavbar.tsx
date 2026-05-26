'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { paquetesDashboardVisiblesParaUsuario } from '@/data/dashboard-paquetes';

export default function AuthNavbar() {
  const pathname = usePathname();
  const { user, token, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const paquetesNav =
    loading && !user
      ? []
      : paquetesDashboardVisiblesParaUsuario(user ?? null);

  if (!token) return null;

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Botón menú móvil */}
        <button
          aria-label="Abrir menú"
          className="hamburger"
          onClick={() => setOpen((s) => !s)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* LOGO */}
        <div className="brand">
          <img src="/logo.png" alt="Logo" className="logo-img" />
        </div>
      </div>

      {/* NAV SIMPLIFICADO */}
      <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main nav">
        <Link
          className={pathname === '/' ? 'active' : ''}
          href="/"
          onClick={() => setOpen(false)}
        >
          Inicio
        </Link>
        {paquetesNav.map((p) => {
          const hrefPaquete = `/dashboard/paquete/${p.id}`;
          return (
            <Link
              key={p.id}
              className={pathname === hrefPaquete ? 'active' : ''}
              href={hrefPaquete}
              onClick={() => setOpen(false)}
            >
              {p.titulo}
            </Link>
          );
        })}
        <Link
          className={pathname === '/ayuda' ? 'active' : ''}
          href="/ayuda"
          onClick={() => setOpen(false)}
        >
          Ayuda
        </Link>
      </nav>

      <div className="nav-actions">
        <div className="user-block">
          {loading ? (
            <div className="small text-muted">Cargando...</div>
          ) : (
            <>
              <div className="user-name">{user?.name ?? user?.email ?? 'Usuario'}</div>
              <div className="small text-muted">
                {(user?.roles || []).map((r:any)=> r.role?.name ?? r.name).join(', ')}
              </div>
            </>
          )}
        </div>

        <button className="btn-ghost" onClick={logout}>Cerrar sesión</button>
      </div>

      {/* Estilos */}
      <style jsx>{`
        /* Layout general */
        .topbar { 
          display:flex; 
          align-items:center; 
          gap:12px; 
          padding:10px 16px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }
        .topbar-left { display:flex; align-items:center; gap:12px; }

        /* Botón menú móvil */
        .hamburger { 
          display:none; 
          background:transparent; 
          border:none; 
          padding:6px; 
          border-radius:8px; 
        }
        .hamburger svg { color: #0b2447; }

        /* Logo */
        .brand { display:flex; align-items:center; }
        .logo-img {
          height: 42px;
          width: auto;
          object-fit: contain;
        }

        /* Navegación */
        .nav-links {
          display:flex;
          gap:12px;
          align-items:center;
        }

        .nav-links a {
          padding: 6px 10px;
          border-radius: 8px;
          transition: background 0.2s, color 0.2s;
        }

        .nav-links a:hover,
        .nav-links a:focus {
          background: #2563eb22;
          color: #2563eb;
        }

        .nav-links a.active {
          background: #2563eb !important;
          color: white !important;
        }

        /* Acciones */
        .nav-actions { 
          display:flex; 
          gap:12px; 
          align-items:center; 
          margin-left:auto; 
        }
        .user-name { font-weight:700; }

        /* Mobile */
        @media (max-width: 900px) {
          .hamburger { display:inline-flex; }

          .nav-links { 
            position: absolute;
            top: 64px;
            left: 8px;
            right: 8px;
            background: rgba(255,255,255,0.98);
            border-radius: 12px;
            padding: 12px;
            display: none;
            flex-direction: column;
            gap: 8px;
            box-shadow: 0 8px 30px rgba(2,6,23,0.08);
            z-index: 60;
          }
          .nav-links.open { display:flex; }
        }
      `}</style>
    </header>
  );
}
