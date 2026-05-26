export type TipoNotificacion = 'error' | 'success' | 'info' | 'warning';

export type NotificacionPayload = {
  tipo: TipoNotificacion;
  mensaje: string;
  duracionMs?: number;
};

type EscuchadorNotificacion = (payload: NotificacionPayload) => void;

const escuchadores = new Set<EscuchadorNotificacion>();

let ultimoMensaje = '';
let ultimoTiempo = 0;

/** Evita toasts duplicados por reintentos o Strict Mode en ventana corta. */
function esDuplicadoReciente(mensaje: string): boolean {
  const ahora = Date.now();
  if (mensaje === ultimoMensaje && ahora - ultimoTiempo < 1500) {
    return true;
  }
  ultimoMensaje = mensaje;
  ultimoTiempo = ahora;
  return false;
}

export function suscribirNotificaciones(
  escuchador: EscuchadorNotificacion,
): () => void {
  escuchadores.add(escuchador);
  return () => {
    escuchadores.delete(escuchador);
  };
}

export function mostrarNotificacion(payload: NotificacionPayload): void {
  if (typeof window === 'undefined') return;
  if (esDuplicadoReciente(payload.mensaje)) return;
  escuchadores.forEach((escuchador) => escuchador(payload));
}
