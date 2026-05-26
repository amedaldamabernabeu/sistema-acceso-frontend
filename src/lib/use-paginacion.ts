'use client';

import { useCallback, useMemo, useState } from 'react';

/** Registros por página en tablas del panel. */
export const TAMANO_PAGINA_TABLA = 10;

export type PaginacionResultado<T> = {
  pagina: number;
  irAPagina: (pagina: number) => void;
  filasPagina: T[];
  total: number;
  totalPaginas: number;
  tamanoPagina: number;
  puedeAnterior: boolean;
  puedeSiguiente: boolean;
  irAnterior: () => void;
  irSiguiente: () => void;
  indiceDesde: number;
  indiceHasta: number;
};

/**
 * Paginación en cliente sobre un arreglo ya cargado (no altera APIs).
 */
export function usePaginacion<T>(
  items: readonly T[],
  tamanoPagina: number = TAMANO_PAGINA_TABLA,
): PaginacionResultado<T> {
  const [paginaSolicitada, setPaginaSolicitada] = useState(1);

  const total = items.length;
  const totalPaginas = Math.max(1, Math.ceil(total / tamanoPagina) || 1);
  const pagina = Math.min(Math.max(1, paginaSolicitada), totalPaginas);

  const filasPagina = useMemo(() => {
    const inicio = (pagina - 1) * tamanoPagina;
    return items.slice(inicio, inicio + tamanoPagina);
  }, [items, pagina, tamanoPagina]);

  const irAPagina = useCallback(
    (nueva: number) => {
      setPaginaSolicitada((prev) => {
        const tp = Math.max(1, Math.ceil(items.length / tamanoPagina) || 1);
        const destino = Math.min(Math.max(1, nueva), tp);
        return destino;
      });
    },
    [items.length, tamanoPagina],
  );

  const irAnterior = useCallback(() => {
    setPaginaSolicitada((prev) => Math.max(1, prev - 1));
  }, []);

  const irSiguiente = useCallback(() => {
    setPaginaSolicitada((prev) => {
      const tp = Math.max(1, Math.ceil(items.length / tamanoPagina) || 1);
      return Math.min(tp, prev + 1);
    });
  }, [items.length, tamanoPagina]);

  return {
    pagina,
    irAPagina,
    filasPagina,
    total,
    totalPaginas,
    tamanoPagina,
    puedeAnterior: pagina > 1,
    puedeSiguiente: pagina < totalPaginas,
    irAnterior,
    irSiguiente,
    indiceDesde: total === 0 ? 0 : (pagina - 1) * tamanoPagina + 1,
    indiceHasta: Math.min(pagina * tamanoPagina, total),
  };
}
