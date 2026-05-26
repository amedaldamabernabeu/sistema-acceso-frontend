import type { AxiosInstance } from 'axios';
import { isAxiosError } from 'axios';
import {
  extraerMensajeErrorApi,
  mensajeErrorPorEstadoHttp,
} from '@/lib/extraer-mensaje-error-api';
import { mostrarNotificacion } from '@/lib/notificaciones';

const RUTAS_SIN_NOTIFICACION = ['/auth/login', '/users/me'];

function debeOmitirNotificacion(url: string | undefined, skip?: boolean): boolean {
  if (skip) return true;
  if (!url) return false;
  return RUTAS_SIN_NOTIFICACION.some((ruta) => url.includes(ruta));
}

let interceptorRegistrado = false;

export function registrarInterceptorErroresApi(api: AxiosInstance): void {
  if (interceptorRegistrado) return;
  interceptorRegistrado = true;

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (isAxiosError(error)) {
        const config = error.config;
        const url = config?.url;

        if (!debeOmitirNotificacion(url, config?.skipNotificacionError)) {
          const status = error.response?.status;
          const mensajeServidor = extraerMensajeErrorApi(error);

          if (!error.response) {
            mostrarNotificacion({
              tipo: 'error',
              mensaje:
                'No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo.',
            });
          } else {
            const mensaje = mensajeErrorPorEstadoHttp(status, mensajeServidor);
            mostrarNotificacion({ tipo: 'error', mensaje });
          }

          Object.assign(error, { notificacionGlobalMostrada: true });
        }
      }

      return Promise.reject(error);
    },
  );
}
