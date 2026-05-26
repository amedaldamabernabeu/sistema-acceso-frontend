/** Prefijo de módulo antes del primer punto (p. ej. `visitantes.listar` → `visitantes`). */
export function prefijoModuloPermiso(nombre: string): string {
  const i = nombre.indexOf('.');
  return i === -1 ? nombre : nombre.slice(0, i);
}

const ETIQUETA_MODULO: Record<string, string> = {
  sistema: 'Sistema',
  dashboard: 'Dashboard',
  usuarios: 'Usuarios',
  roles: 'Roles',
  permisos: 'Permisos',
  visitantes: 'Visitantes',
  registro_acceso: 'Registro de acceso',
  dispositivos: 'Dispositivos',
  suspension: 'Suspensiones',
  tipo_ingreso: 'Tipos de ingreso',
  eventos: 'Eventos',
  notas: 'Notas',
  reportes: 'Reportes',
  academico: 'Datos académicos',
  carreras: 'Carreras',
  carrera_departamento: 'Carrera — departamento',
};

export function etiquetaModuloPermiso(prefijo: string): string {
  return ETIQUETA_MODULO[prefijo] ?? prefijo.replace(/_/g, ' ');
}

export function agruparPermisosPorModulo<T extends { name: string }>(
  permisos: T[],
): Map<string, T[]> {
  const ordenados = [...permisos].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return ordenados.reduce<Map<string, T[]>>((mapa, p) => {
    const clave = prefijoModuloPermiso(p.name);
    const lista = mapa.get(clave) ?? [];
    lista.push(p);
    mapa.set(clave, lista);
    return mapa;
  }, new Map());
}
