/** Normaliza texto para búsqueda insensible a mayúsculas y acentos. */
export function normalizarTextoBusqueda(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/**
 * Filtra filas en cliente por coincidencia parcial en el texto devuelto por `obtenerTexto`.
 */
export function filtrarPorTexto<T>(
  items: readonly T[],
  termino: string,
  obtenerTexto: (item: T) => string,
): T[] {
  const clave = normalizarTextoBusqueda(termino);
  if (!clave) return [...items];
  return items.filter((item) =>
    normalizarTextoBusqueda(obtenerTexto(item)).includes(clave),
  );
}
