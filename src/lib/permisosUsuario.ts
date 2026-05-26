/** Nombres de permiso devueltos por GET /users/me (roles → permissions). */
export function permisosDelUsuario(user: unknown): Set<string> {
  const conjunto = new Set<string>();
  if (!user || typeof user !== 'object') return conjunto;
  const u = user as {
    roles?: Array<{
      role?: {
        permissions?: Array<{ permission?: { name?: string } }>;
      };
    }>;
  };
  for (const ur of u.roles ?? []) {
    for (const rp of ur.role?.permissions ?? []) {
      const n = rp.permission?.name;
      if (n) conjunto.add(n);
    }
  }
  return conjunto;
}

export function usuarioTieneTodosLosPermisos(
  user: unknown,
  permisos: string[],
): boolean {
  if (!permisos.length) return false;
  const conjunto = permisosDelUsuario(user);
  return permisos.every((p) => conjunto.has(p));
}

/** Basta con tener al menos uno de los permisos listados. */
export function usuarioTieneAlgunPermiso(
  user: unknown,
  permisos: string[],
): boolean {
  if (!permisos.length) return false;
  const conjunto = permisosDelUsuario(user);
  return permisos.some((p) => conjunto.has(p));
}

/** Permisos que habilitan el módulo /visita/nueva (seguridad, panel con alta, etc.). */
export const PERMISOS_MODULO_REGISTRO_VISITA = [
  'visitantes.registro_publico',
  'visitantes.catalogo_eventos',
  'visitantes.crear',
] as const;
