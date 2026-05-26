const CARACTER_NOMBRE_DISPOSITIVO = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]$/;

export function filtrarTextoNombreDispositivo(valor: string): string {
  return valor
    .split('')
    .filter((c) => CARACTER_NOMBRE_DISPOSITIVO.test(c))
    .join('');
}

export function normalizarNombreDispositivo(nombre: string): string {
  return nombre.trim().replace(/\s+/g, ' ');
}

const NOMBRE_DISPOSITIVO = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]{2,}$/;

export function nombreDispositivoFormatoValido(nombre: string): boolean {
  return NOMBRE_DISPOSITIVO.test(normalizarNombreDispositivo(nombre));
}

export function nombreDispositivoDuplicado(
  dispositivos: { id: number; nombre: string }[],
  nombre: string,
  excluirId = 0,
): boolean {
  const clave = normalizarNombreDispositivo(nombre).toLowerCase();
  if (!clave) return false;
  return dispositivos.some(
    (d) =>
      d.id !== excluirId &&
      normalizarNombreDispositivo(d.nombre).toLowerCase() === clave,
  );
}
