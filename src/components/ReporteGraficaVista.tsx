'use client';

import { forwardRef } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PuntoGraficaReporte } from '@/lib/reportes-agregar-grafica';
import type { TipoGraficaReporte } from '@/lib/reportes-graficas.config';

const COLORES_GRAFICA = [
  '#2563eb',
  '#16a34a',
  '#0d9488',
  '#7c3aed',
  '#e2510e',
  '#c26a6a',
  '#64748b',
  '#0369a1',
  '#f59e0b',
  '#4f46e5',
  '#6a70c2',
  '#392bb6',
];

type Props = {
  puntos: PuntoGraficaReporte[];
  tipoGrafica: TipoGraficaReporte;
  titulo: string;
  fechaReporte: string;
};

const ReporteGraficaVista = forwardRef<HTMLDivElement, Props>(
  function ReporteGraficaVista({ puntos, tipoGrafica, titulo, fechaReporte }, ref) {
    if (puntos.length === 0) {
      return (
        <p style={{ color: 'var(--text, #0f172a)', margin: 0 }}>
          Sin datos para graficar con los filtros actuales.
        </p>
      );
    }

    const datos = puntos.map((p) => ({
      nombre: p.etiqueta,
      cantidad: p.valor,
    }));

    const usarPastel = tipoGrafica === 'pastel' && puntos.length <= 10;

    return (
      <div ref={ref} className="card" style={{ margin: 0, background: '#fff' }}>
        <h3 style={{ margin: '0 0 0.35rem', fontSize: '1rem', color: 'var(--text, #0f172a)' }}>
          {titulo}
        </h3>
        <p
          style={{
            margin: '0 0 1rem',
            fontSize: '0.9rem',
            color: 'var(--text, #0f172a)',
          }}
        >
          {fechaReporte}
        </p>
        {tipoGrafica === 'pastel' && puntos.length > 10 && (
          <p className="small" style={{ color: '#92400e', marginBottom: 12 }}>
            Hay muchas categorías para un pastel; use gráfica de barras o reduzca filtros.
          </p>
        )}
        <div style={{ width: '100%', height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            {usarPastel ? (
              <PieChart>
                <Pie
                  data={datos}
                  dataKey="cantidad"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={(props) => {
                    const fila = props.payload as {
                      nombre?: string;
                      cantidad?: number;
                    };
                    return `${String(fila?.nombre ?? '').slice(0, 18)}: ${fila?.cantidad ?? 0}`;
                  }}
                >
                  {datos.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORES_GRAFICA[i % COLORES_GRAFICA.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : (
              <BarChart
                data={datos}
                margin={{ top: 8, right: 16, left: 8, bottom: 64 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="nombre"
                  tick={{ fontSize: 11, fill: '#0f172a' }}
                  interval={0}
                  angle={-28}
                  textAnchor="end"
                  height={72}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#0f172a' }}
                />
                <Tooltip />
                <Bar dataKey="cantidad" name="Cantidad" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  },
);

export default ReporteGraficaVista;
