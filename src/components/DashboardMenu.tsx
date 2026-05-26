'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { getDashboardResumen, type DashboardResumen } from '../services/api';
import { paquetesDashboardVisiblesParaUsuario } from '@/data/dashboard-paquetes';
import PaqueteModulosSeccion from '@/components/PaqueteModulosSeccion';
import { useAuth } from '@/components/auth/AuthProvider';

function maxSerieValor(serie: DashboardResumen['serieUltimosDias']): number {
  let m = 1;
  for (const d of serie) {
    m = Math.max(m, d.entradas, d.salidas);
  }
  return m;
}

export default function DashboardMenu() {
  const { user, loading } = useAuth();
  const [resumen, setResumen] = useState<DashboardResumen | null>(null);
  const [cargandoResumen, setCargandoResumen] = useState(true);
  const [errorResumen, setErrorResumen] = useState<string | null>(null);

  const cargarResumen = useCallback(async () => {
    setCargandoResumen(true);
    setErrorResumen(null);
    try {
      const { data } = await getDashboardResumen();
      setResumen(data);
    } catch {
      setErrorResumen(
        'No se pudieron cargar las métricas. Verifique sesión y API.',
      );
      setResumen(null);
    } finally {
      setCargandoResumen(false);
    }
  }, []);

  useEffect(() => {
    void cargarResumen();
  }, [cargarResumen]);

  const entradasHoy = resumen?.entradasHoy ?? 0;
  const salidasHoy = resumen?.salidasHoy ?? 0;
  const totalHoy = Math.max(1, entradasHoy + salidasHoy);
  const pctEntradas = (entradasHoy / totalHoy) * 360;
  const donutStyle: React.CSSProperties =
    entradasHoy + salidasHoy === 0
      ? {
          background:
            'conic-gradient(#e2e8f0 0deg 360deg)',
        }
      : {
          background: `conic-gradient(#16a34a 0deg ${pctEntradas}deg, #0b5cff ${pctEntradas}deg 360deg)`,
        };

  const serie = resumen?.serieUltimosDias ?? [];
  const maxBar = maxSerieValor(serie);

  return (
    <div
      className="dashboard-menu-root"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}
    >
      <div
        style={{
          width: '100%',
          height: 90,
          borderRadius: 12,
          backgroundImage: "url('/fondo.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              paddingLeft: '100%',
              animation: 'marquee 15s linear infinite',
              fontSize: 28,
              fontWeight: 'bold',
              color: 'white',
              letterSpacing: 1,
            }}
          >
            Sistema de gestión de acceso al Centro Universitario de Los Valles
            (CUVALLES)
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        `}
      </style>

      <div className="dashboard-home">
        <section className="card">
          <h2
            style={{
              margin: '0 0 0.75rem',
              fontSize: '1.15rem',
              color: 'var(--text, #0f172a)',
              textAlign: 'center',
            }}
          >
            Indicadores del día
          </h2>
          {errorResumen && (
            <p style={{ color: '#b91c1c', marginBottom: '0.75rem' }}>
              {errorResumen}
            </p>
          )}
          <div className="dashboard-home-metrics">
            {[
              {
                title: 'Entradas hoy',
                value: cargandoResumen ? '…' : entradasHoy,
                color: '#16a34a',
              },
              {
                title: 'Salidas hoy',
                value: cargandoResumen ? '…' : salidasHoy,
                color: '#0b5cff',
              },
              {
                title: 'Usuarios activos',
                value: cargandoResumen ? '…' : (resumen?.usuariosActivos ?? 0),
                color: '#7c3aed',
              },
              {
                title: 'Suspensiones activas',
                value: cargandoResumen ? '…' : (resumen?.suspensionesActivas ?? 0),
                color: '#dc2626',
              },
            ].map((kpi) => (
              <div
                key={kpi.title}
                className="card"
                style={{ padding: '1rem', margin: 0 }}
              >
                <span
                  style={{
                    fontSize: 14,
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  {kpi.title}
                </span>
                <strong
                  style={{
                    fontSize: 30,
                    color: kpi.color,
                    display: 'block',
                    marginTop: 4,
                  }}
                >
                  {kpi.value}
                </strong>
              </div>
            ))}
          </div>

          <div className="dashboard-home-visual" style={{ marginTop: '1rem' }}>
            <div className="card dashboard-donut-wrap" style={{ margin: 0 }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>
                Hoy: entradas vs salidas
              </span>
              <div className="dashboard-donut" style={donutStyle} />
              <div
                style={{
                  fontSize: 13,
                  color: '#64748b',
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: '#16a34a',
                      marginRight: 6,
                    }}
                  />
                  Entradas {entradasHoy}
                </span>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: 2,
                      background: '#0b5cff',
                      marginRight: 6,
                    }}
                  />
                  Salidas {salidasHoy}
                </span>
              </div>
            </div>

            <div className="card" style={{ margin: 0 }}>
              <span style={{ fontWeight: 600, color: '#475569' }}>
                Últimos 7 días
              </span>
              <div style={{ marginTop: '0.75rem' }}>
                {cargandoResumen && (
                  <p style={{ color: '#64748b', margin: 0 }}>Cargando serie…</p>
                )}
                {!cargandoResumen &&
                  serie.map((d) => (
                    <div key={d.etiqueta} className="dashboard-bars-day">
                      <div className="dashboard-bars-row">
                        <span style={{ width: 88, flexShrink: 0 }}>
                          {d.etiqueta}
                        </span>
                        <span style={{ width: 36, textAlign: 'right' }}>
                          {d.entradas}
                        </span>
                        <div className="dashboard-bars-track">
                          <div
                            className="dashboard-bars-fill-ent"
                            style={{
                              width: `${Math.round((d.entradas / maxBar) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="dashboard-bars-row">
                        <span style={{ width: 88, flexShrink: 0 }} />
                        <span style={{ width: 36, textAlign: 'right' }}>
                          {d.salidas}
                        </span>
                        <div className="dashboard-bars-track">
                          <div
                            className="dashboard-bars-fill-sal"
                            style={{
                              width: `${Math.round((d.salidas / maxBar) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        <h2
          style={{
            margin: 0,
            fontSize: '1.15rem',
            color: 'var(--text, #0f172a)',
            textAlign: 'center',
          }}
        >
          Módulos del sistema
        </h2>

        <div className="dashboard-paquetes-mosaico">
          {(loading && !user
            ? []
            : paquetesDashboardVisiblesParaUsuario(user ?? null)
          ).map((paq) => (
            <PaqueteModulosSeccion key={paq.id} paq={paq} />
          ))}
        </div>
      </div>
    </div>
  );
}
