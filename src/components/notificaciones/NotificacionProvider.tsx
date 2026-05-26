'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  mostrarNotificacion,
  suscribirNotificaciones,
  type NotificacionPayload,
  type TipoNotificacion,
} from '@/lib/notificaciones';

type NotificacionEnPantalla = NotificacionPayload & {
  id: string;
};

const ETIQUETAS_TIPO: Record<TipoNotificacion, string> = {
  error: 'Error',
  success: 'Éxito',
  info: 'Información',
  warning: 'Aviso',
};

export function NotificacionProvider({ children }: { children: React.ReactNode }) {
  const [notificaciones, setNotificaciones] = useState<NotificacionEnPantalla[]>([]);

  const quitarNotificacion = useCallback((id: string) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const agregarNotificacion = useCallback(
    (payload: NotificacionPayload) => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      const duracion = payload.duracionMs ?? 5500;

      setNotificaciones((prev) => [...prev, { ...payload, id }]);

      window.setTimeout(() => {
        quitarNotificacion(id);
      }, duracion);
    },
    [quitarNotificacion],
  );

  useEffect(() => {
    return suscribirNotificaciones(agregarNotificacion);
  }, [agregarNotificacion]);

  return (
    <>
      {children}
      <div
        className="notificaciones-contenedor"
        role="region"
        aria-label="Notificaciones del sistema"
        aria-live="polite"
      >
        {notificaciones.map((notificacion) => (
          <div
            key={notificacion.id}
            className={`notificacion notificacion--${notificacion.tipo}`}
            role="alert"
          >
            <div className="notificacion__cabecera">
              <span className="notificacion__tipo">
                {ETIQUETAS_TIPO[notificacion.tipo]}
              </span>
              <button
                type="button"
                className="notificacion__cerrar"
                aria-label="Cerrar notificación"
                onClick={() => quitarNotificacion(notificacion.id)}
              >
                ×
              </button>
            </div>
            <p className="notificacion__mensaje">{notificacion.mensaje}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/** Hook para mostrar notificaciones desde componentes (éxito, avisos locales). */
export function useNotificacion() {
  return {
    mostrarError: (mensaje: string) =>
      mostrarNotificacion({ tipo: 'error', mensaje }),
    mostrarExito: (mensaje: string) =>
      mostrarNotificacion({ tipo: 'success', mensaje }),
    mostrarInfo: (mensaje: string) =>
      mostrarNotificacion({ tipo: 'info', mensaje }),
    mostrarAviso: (mensaje: string) =>
      mostrarNotificacion({ tipo: 'warning', mensaje }),
    mostrarNotificacion,
  };
}
