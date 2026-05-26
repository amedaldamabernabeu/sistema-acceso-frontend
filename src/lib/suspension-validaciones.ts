/** Letras (incl. tildes y ñ) y espacios; sin números ni símbolos. */
const CARACTER_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/;

/**
 * Patrones HTML5: espacio literal en la clase (no `\s`; falla en varios navegadores).
 * Usar en todos los formularios con validación nativa de nombre.
 */
export const PATRON_NOMBRE_HTML = '[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]{2,}';

/** Búsqueda auxiliar dentro de un form (p. ej. buscar usuario en suspensiones). */
export const PATRON_NOMBRE_BUSQUEDA_HTML = '[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]*';

/** Nombre de dispositivo: letras, números y espacios. */
export const PATRON_NOMBRE_ALFANUMERICO_HTML =
  '[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ ]{2,}';

export function filtrarTextoSoloNombre(valor: string): string {
  return valor
    .split('')
    .filter((c) => CARACTER_NOMBRE.test(c))
    .join('');
}

/** Fecha inicio estrictamente anterior a fecha fin (formato YYYY-MM-DD). */
export function fechasSuspensionValidas(inicio: string, fin: string): boolean {
  if (!inicio || !fin) return false;
  return inicio < fin;
}

type SuspensionLista = {
  id: number;
  codigo: string;
  activa?: boolean;
  fechaFin: string;
};

/** true si el código ya tiene suspensión activa que aún no finaliza. */
export function usuarioTieneSuspensionActivaPendiente(
  suspensiones: SuspensionLista[],
  codigo: string | number | null | undefined,
  excluirId?: number,
): boolean {
  const codigoStr = String(codigo ?? '').trim();
  if (!codigoStr) return false;
  const ahora = new Date();
  return suspensiones.some((s) => {
    if (String(s.codigo) !== codigoStr) return false;
    if (excluirId != null && s.id === excluirId) return false;
    if (s.activa === false) return false;
    return new Date(s.fechaFin) >= ahora;
  });
}
