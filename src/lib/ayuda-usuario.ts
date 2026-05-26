import {
  PAQUETES_DASHBOARD,
  paquetesDashboardVisiblesParaUsuario,
  type PaqueteDashboard,
} from '@/data/dashboard-paquetes';
import {
  agruparPermisosPorModulo,
  etiquetaModuloPermiso,
  prefijoModuloPermiso,
} from '@/lib/permisos-modulo-ui';
import { permisosDelUsuario } from '@/lib/permisosUsuario';
import {
  nombresRolesDesdeUsuario,
  usuarioTieneRolAdministrador,
  usuarioTieneRolSeguridadProteccion,
} from '@/lib/rolesUsuario';

export type ModuloAyudaResumen = {
  titulo: string;
  descripcion: string;
  href: string;
};

export type PaqueteAyudaResumen = {
  titulo: string;
  descripcion: string;
  modulos: ModuloAyudaResumen[];
};

export type PermisosModuloAyuda = {
  modulo: string;
  permisos: string[];
};

export type AyudaUsuarioContenido = {
  rolesEtiqueta: string;
  tituloPerfil: string;
  introduccion: string[];
  puedeHacer: string[];
  noPuedeHacer: string[];
  paquetesVisibles: PaqueteAyudaResumen[];
  permisosPorModulo: PermisosModuloAyuda[];
  modulosNoDisponibles: PaqueteAyudaResumen[];
};

const ACCION_PERMISO: Record<string, string> = {
  listar: 'Listar registros en',
  ver: 'Ver detalle en',
  ver_detalle: 'Ver detalle en',
  crear: 'Crear en',
  editar: 'Editar en',
  eliminar: 'Eliminar en',
  asignar_roles: 'Asignar roles en',
  permisos_asignar: 'Asignar permisos a roles en',
  preview: 'Vista previa en',
  export: 'Exportar desde',
  validar_qr: 'Validar QR de visitantes (escáner)',
  registro_publico: 'Registrar visitas (formulario público del panel)',
  catalogo_eventos: 'Consultar catálogo de eventos para visitas',
  qr_png: 'Descargar imagen QR de visitantes',
  buscar_usuarios: 'Buscar usuarios para suspensiones en',
  por_registro: 'Consultar notas por registro en',
  metricas: 'Ver métricas del inicio (dashboard)',
  perfil: 'Consultar su perfil de sesión',
  divisiones: 'Consultar divisiones académicas',
  departamentos: 'Consultar departamentos académicos',
};

function etiquetaPermisoHumano(nombrePermiso: string): string {
  const punto = nombrePermiso.indexOf('.');
  if (punto === -1) return nombrePermiso;
  const accion = nombrePermiso.slice(punto + 1);
  const modulo = etiquetaModuloPermiso(prefijoModuloPermiso(nombrePermiso));
  const verbo = ACCION_PERMISO[accion];
  if (verbo) {
    if (
      accion === 'validar_qr' ||
      accion === 'registro_publico' ||
      accion === 'catalogo_eventos' ||
      accion === 'metricas' ||
      accion === 'perfil'
    ) {
      return verbo;
    }
    return `${verbo} ${modulo}`;
  }
  return `${accion.replace(/_/g, ' ')} (${modulo})`;
}

function mapearPaquete(p: PaqueteDashboard): PaqueteAyudaResumen {
  return {
    titulo: p.titulo,
    descripcion: p.descripcion,
    modulos: p.modulos.map((m) => ({
      titulo: m.title,
      descripcion: m.description,
      href: m.href,
    })),
  };
}

function modulosNoDisponibles(user: unknown): PaqueteAyudaResumen[] {
  if (usuarioTieneRolAdministrador(user)) return [];
  const hrefsVisibles = new Set(
    paquetesDashboardVisiblesParaUsuario(user).flatMap((p) =>
      p.modulos.map((m) => m.href),
    ),
  );
  return PAQUETES_DASHBOARD.map((p) => ({
    titulo: p.titulo,
    descripcion: p.descripcion,
    modulos: p.modulos
      .filter((m) => !hrefsVisibles.has(m.href))
      .map((m) => ({
        titulo: m.title,
        descripcion: m.description,
        href: m.href,
      })),
  })).filter((p) => p.modulos.length > 0);
}

function textosPerfil(user: unknown): {
  tituloPerfil: string;
  introduccion: string[];
  puedeHacer: string[];
  noPuedeHacer: string[];
} {
  if (usuarioTieneRolAdministrador(user)) {
    return {
      tituloPerfil: 'Administrador',
      introduccion: [
        'Su cuenta tiene el rol de Administrador. Puede usar todos los módulos que aparecen en el menú superior y en el inicio del panel.',
        'Es responsable de la configuración del sistema: usuarios, roles, permisos, dispositivos, reportes y el resto de catálogos.',
      ],
      puedeHacer: [
        'Gestionar usuarios, roles y permisos del panel.',
        'Consultar y administrar registros de acceso, suspensiones, dispositivos y tipos de ingreso.',
        'Administrar visitantes, eventos, notas, datos académicos y reportes.',
        'Ver todas las métricas del inicio.',
      ],
      noPuedeHacer: [
        'No hay restricciones de módulo en el panel; cualquier límite sería por política institucional, no por el sistema.',
      ],
    };
  }
  if (usuarioTieneRolSeguridadProteccion(user)) {
    return {
      tituloPerfil: 'Seguridad y protección',
      introduccion: [
        'Su cuenta está orientada al control de visitantes en el centro: registro de visitas y validación de códigos QR en el escáner.',
        'El menú y las secciones siguientes reflejan sus permisos actuales; si necesita otro módulo, un administrador debe asignárselo.',
      ],
      puedeHacer: [
        'Registrar nuevas visitas y enviar el QR por correo (si tiene acceso a Registro de visita).',
        'Escanear QR para registrar entrada y salida de visitantes (Escáner QR).',
        'Ver el inicio con métricas, si su perfil incluye ese permiso.',
        'Asociar eventos al registrar visitas, cuando el catálogo esté habilitado.',
      ],
      noPuedeHacer: [
        'Por defecto no gestiona usuarios, roles ni permisos del panel.',
        'No administra el listado completo de visitantes, registros de acceso institucional, dispositivos, suspensiones ni reportes, salvo que se le hayan asignado permisos adicionales.',
      ],
    };
  }
  return {
    tituloPerfil: 'Usuario del panel',
    introduccion: [
      'Su acceso al sistema depende de los roles y permisos asignados por un administrador.',
      'Solo verá en el menú los paquetes y módulos para los que tenga autorización.',
    ],
    puedeHacer: [
      'Usar los módulos listados en «Su menú actual».',
      'Consultar las acciones permitidas en «Permisos de su sesión».',
    ],
    noPuedeHacer: [
      'Acceder a rutas o módulos que no aparecen en su menú (el sistema lo redirigirá al inicio).',
      'Modificar roles o permisos de otros usuarios, salvo que tenga esos permisos explícitos.',
    ],
  };
}

export function construirAyudaParaUsuario(user: unknown): AyudaUsuarioContenido {
  const roles = nombresRolesDesdeUsuario(user);
  const rolesEtiqueta =
    roles.length > 0 ? roles.join(', ') : 'Sin rol asignado';
  const perfil = textosPerfil(user);
  const paquetes = paquetesDashboardVisiblesParaUsuario(user).map(mapearPaquete);

  const nombresPermisos = [...permisosDelUsuario(user)].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );
  const agrupados = agruparPermisosPorModulo(
    nombresPermisos.map((name) => ({ name })),
  );
  const permisosPorModulo: PermisosModuloAyuda[] = [...agrupados.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([clave, lista]) => ({
      modulo: etiquetaModuloPermiso(clave),
      permisos: lista.map((p) => etiquetaPermisoHumano(p.name)),
    }));

  return {
    rolesEtiqueta,
    tituloPerfil: perfil.tituloPerfil,
    introduccion: perfil.introduccion,
    puedeHacer: perfil.puedeHacer,
    noPuedeHacer: perfil.noPuedeHacer,
    paquetesVisibles: paquetes,
    permisosPorModulo,
    modulosNoDisponibles: modulosNoDisponibles(user),
  };
}
