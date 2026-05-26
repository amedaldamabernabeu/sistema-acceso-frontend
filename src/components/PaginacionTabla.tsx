'use client';

import { useMemo } from 'react';
import type { PaginacionResultado } from '@/lib/use-paginacion';

type Props<T> = {
  paginacion: PaginacionResultado<T>;
  className?: string;
};

/** Números de página visibles (ventana alrededor de la actual si hay muchas). */
function numerosPaginaVisibles(pagina: number, totalPaginas: number): number[] {
  if (totalPaginas <= 12) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }
  const ventana = 2;
  let inicio = Math.max(1, pagina - ventana);
  let fin = Math.min(totalPaginas, pagina + ventana);
  if (pagina <= 3) {
    inicio = 1;
    fin = Math.min(7, totalPaginas);
  } else if (pagina >= totalPaginas - 2) {
    fin = totalPaginas;
    inicio = Math.max(1, totalPaginas - 6);
  }
  return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
}

/**
 * Controles de paginación bajo tablas del panel (10 filas por página).
 */
export default function PaginacionTabla<T>({ paginacion, className = '' }: Props<T>) {
  const {
    pagina,
    totalPaginas,
    total,
    indiceDesde,
    indiceHasta,
    puedeAnterior,
    puedeSiguiente,
    irAnterior,
    irSiguiente,
    irAPagina,
  } = paginacion;

  const numeros = useMemo(
    () => numerosPaginaVisibles(pagina, totalPaginas),
    [pagina, totalPaginas],
  );

  if (total === 0) {
    return null;
  }

  return (
    <nav
      className={`pagination-bar ${className}`.trim()}
      aria-label="Paginación de la tabla"
    >
      <p className="pagination-info text-muted small">
        Mostrando {indiceDesde}–{indiceHasta} de {total}
      </p>
      <div className="pagination-controls">
        <button
          type="button"
          className="btn"
          onClick={irAnterior}
          disabled={!puedeAnterior}
          aria-label="Página anterior"
        >
          Anterior
        </button>

        <div className="pagination-page-list" role="group" aria-label="Ir a página">
          {numeros[0] > 1 && (
            <>
              <button
                type="button"
                className="btn pagination-page-btn"
                onClick={() => irAPagina(1)}
                aria-label="Página 1"
              >
                1
              </button>
              {numeros[0] > 2 && <span className="pagination-ellipsis">…</span>}
            </>
          )}
          {numeros.map((n) => (
            <button
              key={n}
              type="button"
              className={`btn pagination-page-btn${n === pagina ? ' pagination-page-btn--activa' : ''}`}
              onClick={() => irAPagina(n)}
              aria-label={`Página ${n}`}
              aria-current={n === pagina ? 'page' : undefined}
            >
              {n}
            </button>
          ))}
          {numeros[numeros.length - 1] < totalPaginas && (
            <>
              {numeros[numeros.length - 1] < totalPaginas - 1 && (
                <span className="pagination-ellipsis">…</span>
              )}
              <button
                type="button"
                className="btn pagination-page-btn"
                onClick={() => irAPagina(totalPaginas)}
                aria-label={`Página ${totalPaginas}`}
              >
                {totalPaginas}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="btn"
          onClick={irSiguiente}
          disabled={!puedeSiguiente}
          aria-label="Página siguiente"
        >
          Siguiente
        </button>
      </div>
      <p className="pagination-resumen small text-muted">
        Página {pagina} de {totalPaginas}
      </p>
    </nav>
  );
}
