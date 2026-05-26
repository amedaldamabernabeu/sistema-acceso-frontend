'use client';

import React from 'react';

export type ColumnaResponsive<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  /** En móvil: etiqueta arriba y valor a ancho completo (útil para roles, permisos, etc.). */
  apilarEnTarjeta?: boolean;
  ocultarEnTarjeta?: boolean;
};

type Props<T> = {
  columnas: ColumnaResponsive<T>[];
  filas: T[];
  idCampo?: string;
  className?: string;
  mensajeVacio?: React.ReactNode;
  /** Fila de tabla personalizada (p. ej. encabezados de módulo en permisos). Si devuelve null, se usa el layout por columnas. */
  renderFilaTabla?: (fila: T, indice: number) => React.ReactNode | null;
  /** Tarjeta móvil personalizada. Si devuelve null, se usa el layout por columnas. */
  renderTarjeta?: (fila: T, indice: number) => React.ReactNode | null;
};

function valorCelda<T>(columna: ColumnaResponsive<T>, fila: T): React.ReactNode {
  if (columna.render) return columna.render(fila);
  const raw = (fila as Record<string, unknown>)[columna.key];
  return raw == null || raw === '' ? '—' : String(raw);
}

function claveFila<T extends Record<string, unknown>>(fila: T, idCampo: string, indice: number): string {
  const id = fila[idCampo];
  if (id != null) return String(id);
  return `fila-${indice}`;
}

export default function ResponsiveTable<T extends Record<string, unknown>>({
  columnas,
  filas,
  idCampo = 'id',
  className = '',
  mensajeVacio,
  renderFilaTabla,
  renderTarjeta,
}: Props<T>) {
  const columnasTarjeta = columnas.filter((c) => !c.ocultarEnTarjeta);

  return (
    <div className={`table-wrapper table-wrapper--responsive ${className}`.trim()}>
      <table className="table-desktop">
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c.key}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 && mensajeVacio != null ? (
            <tr>
              <td colSpan={columnas.length}>{mensajeVacio}</td>
            </tr>
          ) : (
            filas.map((fila, indice) => {
              const personalizada = renderFilaTabla?.(fila, indice);
              if (personalizada != null) return personalizada;
              return (
                <tr key={claveFila(fila, idCampo, indice)}>
                  {columnas.map((c) => (
                    <td key={c.key}>{valorCelda(c, fila)}</td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="table-cards">
        {filas.length === 0 && mensajeVacio != null ? (
          <div className="table-card table-card--vacio">{mensajeVacio}</div>
        ) : (
          filas.map((fila, indice) => {
            const tarjetaPersonalizada = renderTarjeta?.(fila, indice);
            if (tarjetaPersonalizada != null) {
              return (
                <div className="table-card" key={`card-${claveFila(fila, idCampo, indice)}`}>
                  {tarjetaPersonalizada}
                </div>
              );
            }
            return (
              <div className="table-card" key={`card-${claveFila(fila, idCampo, indice)}`}>
                {columnasTarjeta.map((c) => (
                  <div
                    key={c.key}
                    className={`table-card-row${c.apilarEnTarjeta ? ' table-card-row--stacked' : ''}`}
                  >
                    <div className="table-card-label">{c.header}</div>
                    <div className="table-card-value">{valorCelda(c, fila)}</div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
