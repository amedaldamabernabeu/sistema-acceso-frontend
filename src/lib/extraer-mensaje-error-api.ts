import { AxiosError, isAxiosError } from 'axios';

type CuerpoErrorNest = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

function normalizarMensaje(message: string | string[] | undefined): string | null {
  if (!message) return null;
  if (Array.isArray(message)) {
    const unidos = message.filter(Boolean).join('. ');
    return unidos || null;
  }
  return message.trim() || null;
}

/** Obtiene el mensaje legible del cuerpo de error de NestJS / axios. */
export function extraerMensajeErrorApi(error: unknown): string | null {
  if (!isAxiosError(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return null;
  }

  const axiosError = error as AxiosError<CuerpoErrorNest | string>;
  const data = axiosError.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }

  if (data && typeof data === 'object' && 'message' in data) {
    return normalizarMensaje(data.message);
  }

  return null;
}

export function mensajeErrorPorEstadoHttp(
  status: number | undefined,
  mensajeServidor: string | null,
): string {
  if (mensajeServidor) return mensajeServidor;

  switch (status) {
    case 400:
      return 'La solicitud no es válida. Revise los datos enviados.';
    case 401:
      return 'Su sesión ha expirado o no está autenticado.';
    case 403:
      return 'No tiene permisos para realizar esta acción.';
    case 404:
      return 'No se encontró el recurso solicitado.';
    case 409:
      return 'La operación no se puede completar por un conflicto de datos.';
    case 422:
      return 'Los datos enviados no cumplen las validaciones requeridas.';
    case 500:
      return 'Error interno del servidor. Intente más tarde.';
    case 502:
    case 503:
    case 504:
      return 'El servicio no está disponible en este momento. Intente más tarde.';
    default:
      if (status && status >= 500) {
        return 'Error del servidor. Intente más tarde.';
      }
      return 'Ocurrió un error al procesar la solicitud.';
  }
}
