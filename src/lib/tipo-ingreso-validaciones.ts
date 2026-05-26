import { filtrarTextoSoloNombre } from '@/lib/suspension-validaciones';

export { filtrarTextoSoloNombre };

export function normalizarNombreTipoIngreso(nombre: string): string {
  return nombre.trim().replace(/\s+/g, ' ');
}

const NOMBRE_TIPO_INGRESO = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,}$/;

export function nombreTipoIngresoFormatoValido(nombre: string): boolean {
  return NOMBRE_TIPO_INGRESO.test(normalizarNombreTipoIngreso(nombre));
}

export function nombreTipoIngresoDuplicado(
  tipos: { id: number; nombre: string }[],
  nombre: string,
  excluirId = 0,
): boolean {
  const clave = normalizarNombreTipoIngreso(nombre).toLowerCase();
  if (!clave) return false;
  return tipos.some(
    (t) =>
      t.id !== excluirId &&
      normalizarNombreTipoIngreso(t.nombre).toLowerCase() === clave,
  );
}
