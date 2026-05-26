import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Si es true, el interceptor global no muestra notificación para esta petición. */
    skipNotificacionError?: boolean;
  }
}
