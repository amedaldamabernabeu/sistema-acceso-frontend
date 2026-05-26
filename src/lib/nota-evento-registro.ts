export type EventoParaNota = {
  id: number;
  nombre: string;
  fechaHora?: string | Date | null;
  ubicacion?: string | null;
};

export type RegistroParaNota = {
  id: number;
  entrada: string | Date;
  codigoUsuario?: string;
};

export function eventoCoherenteConRegistroEntrada(
  entrada: Date,
  fechaHoraEvento: Date,
): boolean {
  const inicioDia = new Date(entrada);
  inicioDia.setHours(0, 0, 0, 0);
  const finDia = new Date(entrada);
  finDia.setHours(23, 59, 59, 999);
  const tEntrada = entrada.getTime();
  const tEvento = fechaHoraEvento.getTime();
  return (
    tEvento >= inicioDia.getTime() &&
    tEvento <= finDia.getTime() &&
    tEvento >= tEntrada
  );
}

export function eventosParaRegistroAcceso(
  eventos: EventoParaNota[],
  registro: RegistroParaNota | null | undefined,
): EventoParaNota[] {
  if (!registro) return [];
  const entrada = new Date(registro.entrada);
  if (Number.isNaN(entrada.getTime())) return [];

  return eventos.filter((ev) => {
    if (ev.fechaHora == null || ev.fechaHora === '') return false;
    const fh = new Date(ev.fechaHora);
    if (Number.isNaN(fh.getTime())) return false;
    return eventoCoherenteConRegistroEntrada(entrada, fh);
  });
}

export function etiquetaRegistroAccesoNota(r: RegistroParaNota): string {
  const codigo = r.codigoUsuario?.trim() || `Registro #${r.id}`;
  const fecha = new Date(r.entrada).toLocaleString('es-MX');
  return `${codigo} — entrada ${fecha}`;
}

export function etiquetaEventoNota(ev: EventoParaNota): string {
  if (!ev.fechaHora) return ev.nombre;
  return `${ev.nombre} (${new Date(ev.fechaHora).toLocaleString('es-MX')})`;
}
