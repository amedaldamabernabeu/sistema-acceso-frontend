/**
 * Nombres canónicos de roles (alineados con backend `roles-sistema.ts` y `Role.name` en BD).
 */
export const ROL_ADMINISTRADOR_NOMBRE = 'Administrador';

export function normalizarNombreRol(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function nombresRolesDesdeUsuario(user: unknown): string[] {
  if (!user || typeof user !== 'object') return [];
  const u = user as {
    roles?: Array<{ role?: { name?: string }; name?: string }>;
  };
  return (u.roles ?? [])
    .map((r) => (r.role?.name ?? r.name ?? '').toString())
    .filter(Boolean);
}

export function usuarioTieneRolAdministrador(user: unknown): boolean {
  const conjunto = new Set(
    nombresRolesDesdeUsuario(user).map(normalizarNombreRol),
  );
  return conjunto.has(normalizarNombreRol(ROL_ADMINISTRADOR_NOMBRE));
}
