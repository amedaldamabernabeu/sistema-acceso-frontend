export function normalizarNombreEvento(nombre: string): string {
  return nombre.trim().replace(/\s+/g, ' ');
}

export function normalizarUbicacionEvento(ubicacion: string): string {
  const limpio = ubicacion.trim().replace(/\s+/g, ' ');
  return limpio;
}

export function fechaHoraEventoNoPasada(fechaHoraLocal: string): boolean {
  if (!fechaHoraLocal) return false;
  return new Date(fechaHoraLocal).getTime() >= Date.now();
}

/** Valor mínimo para input datetime-local (ahora, sin segundos). */
export function minDatetimeLocalAhora(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function eventoDuplicado(
  eventos: {
    id: number;
    nombre: string;
    fechaHora: string;
    ubicacion?: string | null;
  }[],
  datos: { nombre: string; fechaHora: string; ubicacion: string },
  excluirId = 0,
): boolean {
  const nombre = normalizarNombreEvento(datos.nombre).toLowerCase();
  const ubicacion = normalizarUbicacionEvento(datos.ubicacion).toLowerCase();
  const fechaMs = new Date(datos.fechaHora).getTime();
  if (Number.isNaN(fechaMs)) return false;

  return eventos.some((e) => {
    if (e.id === excluirId) return false;
    const otroNombre = normalizarNombreEvento(e.nombre).toLowerCase();
    const otroUbicacion = normalizarUbicacionEvento(e.ubicacion ?? '').toLowerCase();
    const otroMs = new Date(e.fechaHora).getTime();
    return (
      otroNombre === nombre &&
      otroUbicacion === ubicacion &&
      otroMs === fechaMs
    );
  });
}
