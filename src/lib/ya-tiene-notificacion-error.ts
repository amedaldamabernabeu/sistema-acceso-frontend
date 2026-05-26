/** Indica si el interceptor global ya mostró un toast para este error. */
export function yaTieneNotificacionError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'notificacionGlobalMostrada' in error &&
      (error as { notificacionGlobalMostrada?: boolean }).notificacionGlobalMostrada,
  );
}
