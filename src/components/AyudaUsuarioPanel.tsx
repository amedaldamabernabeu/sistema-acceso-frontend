'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { construirAyudaParaUsuario } from '@/lib/ayuda-usuario';

export default function AyudaUsuarioPanel() {
  const { user, loading } = useAuth();
  const ayuda = useMemo(
    () => (user ? construirAyudaParaUsuario(user) : null),
    [user],
  );

  if (loading || !ayuda) {
    return (
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p className="text-muted">Cargando ayuda…</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem' }}>
          Ayuda del usuario
        </h1>
        <p style={{ margin: 0, color: 'var(--muted)' }}>
          Perfil: <strong>{ayuda.tituloPerfil}</strong>
          {' · '}
          Roles: {ayuda.rolesEtiqueta}
        </p>
      </header>

      <section className="card" style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>Resumen</h2>
        {ayuda.introduccion.map((p) => (
          <p key={p} style={{ margin: '0 0 0.75rem', lineHeight: 1.55 }}>
            {p}
          </p>
        ))}
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.25rem',
        }}
      >
        <section className="card">
          <h2 style={{ marginTop: 0, fontSize: '1.1rem', color: 'var(--accent)' }}>
            Qué puede hacer
          </h2>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.6 }}>
            {ayuda.puedeHacer.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="card">
          <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Qué no puede hacer</h2>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.6 }}>
            {ayuda.noPuedeHacer.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card" style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>Su menú actual</h2>
        <p className="text-muted small" style={{ marginTop: 0 }}>
          Mismos módulos que aparecen en la barra superior y en el inicio.
        </p>
        {ayuda.paquetesVisibles.length === 0 ? (
          <p>No tiene módulos asignados. Contacte a un administrador.</p>
        ) : (
          ayuda.paquetesVisibles.map((paquete) => (
            <div key={paquete.titulo} style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.35rem', fontSize: '1rem' }}>
                {paquete.titulo}
              </h3>
              <p className="small" style={{ margin: '0 0 0.75rem', color: 'var(--text, #0f172a)' }}>
                {paquete.descripcion}
              </p>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                {paquete.modulos.map((mod) => (
                  <li
                    key={mod.href}
                    style={{
                      padding: '0.65rem 0',
                      borderTop: '1px solid var(--border, #e5e7eb)',
                    }}
                  >
                    <Link href={mod.href} className="btn btn-primary" style={{ marginBottom: 6 }}>
                      {mod.titulo}
                    </Link>
                    <div className="small" style={{ color: 'var(--text, #0f172a)' }}>
                      {mod.descripcion}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      {ayuda.permisosPorModulo.length > 0 && (
        <section className="card" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>
            Permisos de su sesión
          </h2>
          <p className="text-muted small" style={{ marginTop: 0 }}>
            Acciones que el sistema autoriza con su usuario actual.
          </p>
          {ayuda.permisosPorModulo.map((bloque) => (
            <div key={bloque.modulo} style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>
                {bloque.modulo}
              </h3>
              <ul
                className="small"
                style={{
                  margin: 0,
                  paddingLeft: '1.25rem',
                  lineHeight: 1.55,
                  color: 'var(--text, #0f172a)',
                }}
              >
                {bloque.permisos.map((perm) => (
                  <li key={perm}>{perm}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {ayuda.modulosNoDisponibles.length > 0 && (
        <section className="card">
          <h2 style={{ marginTop: 0, fontSize: '1.15rem' }}>
            Módulos no disponibles en su perfil
          </h2>
          <p className="text-muted small" style={{ marginTop: 0 }}>
            Existen en el sistema pero no aparecen en su menú. Un administrador puede
            habilitarlos asignando permisos a su rol.
          </p>
          {ayuda.modulosNoDisponibles.map((paquete) => (
            <div key={paquete.titulo} style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem' }}>
                {paquete.titulo}
              </h3>
              <ul className="small" style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text, #0f172a)' }}>
                {paquete.modulos.map((mod) => (
                  <li key={mod.href}>
                    <strong>{mod.titulo}</strong> — {mod.descripcion}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
