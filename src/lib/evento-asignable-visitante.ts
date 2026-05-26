/** Evento que puede asociarse a un visitante (vigente o sin fecha programada). */
export function eventoEsAsignableAVisitante(
  fechaHora: string | Date | null | undefined,
): boolean {
  if (fechaHora == null || fechaHora === '') return true;
  const instante = fechaHora instanceof Date ? fechaHora : new Date(fechaHora);
  if (Number.isNaN(instante.getTime())) return true;
  return instante.getTime() >= Date.now();
}

export function filtrarEventosAsignablesVisitante<
  T extends { fechaHora?: string | Date | null },
>(lista: T[]): T[] {
  return lista.filter((ev) => eventoEsAsignableAVisitante(ev.fechaHora));
}

export function etiquetaOpcionEventoVisitante(ev: {
  nombre: string;
  fechaHora?: string | Date | null;
  ubicacion?: string | null;
}): string {
  if (!ev.fechaHora) return ev.nombre;
  const textoFecha = new Date(ev.fechaHora).toLocaleString('es-MX');
  return `${ev.nombre} (${textoFecha})`;
}
