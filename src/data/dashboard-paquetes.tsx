import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Users,
  ShieldCheck,
  KeyRound,
  Laptop,
  CalendarDays,
  FileSearch,
  Ban,
  ClipboardList,
  NotebookPen,
  FileBarChart,
  UserRound,
  UserPlus,
  QrCode,
  ScanLine,
  Shield,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { usuarioTieneRolAdministrador } from '@/lib/rolesUsuario';
import {
  PERMISOS_MODULO_REGISTRO_VISITA,
  usuarioTieneAlgunPermiso,
  usuarioTieneTodosLosPermisos,
} from '@/lib/permisosUsuario';

export type ModuloDashboardItem = {
  title: string;
  description: string;
  href: string;
  color: string;
  icon: LucideIcon;
  /** Permisos API requeridos (AND) para ver este módulo en el panel. */
  permisosRequeridos: string[];
};

export type PaqueteDashboard = {
  id: string;
  titulo: string;
  descripcion: string;
  icon: LucideIcon;
  color: string;
  modulos: ModuloDashboardItem[];
};

export const PAQUETES_DASHBOARD: PaqueteDashboard[] = [
  {
    id: 'gestion-acceso',
    titulo: 'Gestión de acceso',
    descripcion:
      'Registros de acceso, suspensiones, tipos de ingreso y dispositivos.',
    icon: ScanLine,
    color: '#6a70c2',
    modulos: [
      {
        title: 'Registros de acceso',
        description: 'Consulta y administra los registros de acceso.',
        href: '/registro-acceso',
        color: '#6a70c2',
        icon: FileSearch,
        permisosRequeridos: ['registro_acceso.listar'],
      },
      {
        title: 'Suspensiones',
        description: 'Gestiona las suspensiones activas.',
        href: '/suspension',
        color: '#c26a6a',
        icon: Ban,
        permisosRequeridos: ['suspension.listar'],
      },
      {
        title: 'Tipos de Ingreso',
        description: 'Administra los tipos de dispositivos de ingreso.',
        href: '/tipos-ingreso',
        color: '#7fc26a',
        icon: Laptop,
        permisosRequeridos: ['tipo_ingreso.listar'],
      },
      {
        title: 'Dispositivos de acceso',
        description: 'Controla los dispositivos de acceso.',
        href: '/dispositivos-acceso',
        color: '#64748b',
        icon: CalendarDays,
        permisosRequeridos: ['dispositivos.listar'],
      },
    ],
  },
  {
    id: 'seguridad',
    titulo: 'Seguridad',
    descripcion: 'Usuarios del panel, roles y permisos.',
    icon: Shield,
    color: '#16a34a',
    modulos: [
      {
        title: 'Usuarios',
        description: 'Gestiona las cuentas de usuario registradas en el sistema.',
        href: '/users',
        color: '#16a34a',
        icon: Users,
        permisosRequeridos: ['usuarios.listar'],
      },
      {
        title: 'Roles',
        description: 'Define los roles del sistema y asigna permisos.',
        href: '/roles',
        color: '#f59e0b',
        icon: ShieldCheck,
        permisosRequeridos: ['roles.listar'],
      },
      {
        title: 'Permisos',
        description: 'Consulta los módulos y permisos del sistema.',
        href: '/permissions',
        color: '#7c3aed',
        icon: KeyRound,
        permisosRequeridos: ['permisos.listar'],
      },
    ],
  },
  {
    id: 'visitantes',
    titulo: 'Visitantes',
    descripcion: 'Visitas externas, registro y escáner QR.',
    icon: UserRound,
    color: '#0369a1',
    modulos: [
      {
        title: 'Visitantes',
        description:
          'Visitas externas con QR, registro y escáner para personal autenticado.',
        href: '/dashboard/visitantes',
        color: '#0369a1',
        icon: UserRound,
        permisosRequeridos: ['visitantes.listar'],
      },
      {
        title: 'Registro de visita',
        description:
          'Formulario de registro de visitantes con envío de QR por correo.',
        href: '/visita/nueva',
        color: '#0d9488',
        icon: UserPlus,
        permisosRequeridos: [...PERMISOS_MODULO_REGISTRO_VISITA],
      },
      {
        title: 'Escáner QR visitantes',
        description:
          'Escaneo de QR para oficiales de seguridad con registro de entrada y salida.',
        href: '/seguridad/scanner',
        color: '#4f46e5',
        icon: QrCode,
        permisosRequeridos: ['visitantes.validar_qr'],
      },
    ],
  },
  {
    id: 'operaciones-admin',
    titulo: 'Operaciones administrativas',
    descripcion: 'Eventos y notas operativas.',
    icon: Briefcase,
    color: '#e2510e',
    modulos: [
      {
        title: 'Eventos',
        description: 'Gestiona los eventos del centro.',
        href: '/eventos',
        color: '#e2510e',
        icon: ClipboardList,
        permisosRequeridos: ['eventos.listar'],
      },
      {
        title: 'Notas',
        description: 'Gestiona notas asociadas a eventos y accesos.',
        href: '/notas',
        color: '#392bb6',
        icon: NotebookPen,
        permisosRequeridos: ['notas.listar'],
      },
    ],
  },
  {
    id: 'gestion-academica',
    titulo: 'Gestión académica',
    descripcion: 'Asociaciones académicas del centro.',
    icon: GraduationCap,
    color: '#2563eb',
    modulos: [
      {
        title: 'Carrera - Departamento',
        description:
          'Asociar carreras con sus respectivos departamentos académicos.',
        href: '/carrera-departamento',
        color: '#2563eb',
        icon: BookOpen,
        permisosRequeridos: ['carrera_departamento.listar'],
      },
    ],
  },
  {
    id: 'reportes',
    titulo: 'Reportes',
    descripcion: 'Exportación y vista previa de información del sistema.',
    icon: FileBarChart,
    color: '#0f766e',
    modulos: [
      {
        title: 'Reportes',
        description:
          'Vista previa y exportación PDF/Excel de usuarios, eventos, accesos y más.',
        href: '/reportes',
        color: '#0f766e',
        icon: FileBarChart,
        permisosRequeridos: ['reportes.preview'],
      },
    ],
  },
];

export function paquetesDashboardVisiblesParaUsuario(
  user: unknown,
): PaqueteDashboard[] {
  if (user == null) {
    return PAQUETES_DASHBOARD;
  }
  if (usuarioTieneRolAdministrador(user)) {
    return PAQUETES_DASHBOARD;
  }
  return PAQUETES_DASHBOARD.map((paquete) => ({
    ...paquete,
    modulos: paquete.modulos.filter((m) => {
      if (m.href === '/visita/nueva') {
        return usuarioTieneAlgunPermiso(user, m.permisosRequeridos);
      }
      return usuarioTieneTodosLosPermisos(user, m.permisosRequeridos);
    }),
  })).filter((paquete) => paquete.modulos.length > 0);
}

export function paqueteDashboardPorId(id: string): PaqueteDashboard | undefined {
  return PAQUETES_DASHBOARD.find((p) => p.id === id);
}

export function paqueteDashboardParaUsuario(
  idPaquete: string,
  user: unknown,
): PaqueteDashboard | undefined {
  if (user == null) {
    return paqueteDashboardPorId(idPaquete);
  }
  return paquetesDashboardVisiblesParaUsuario(user).find((p) => p.id === idPaquete);
}

function normalizarPathname(pathname: string): string {
  return (pathname.split('?')[0] ?? '/').replace(/\/+$/, '') || '/';
}

/** Control de rutas del panel (Next) según permisos del perfil. */
export function puedeAccederUsuarioPathnamePanel(
  user: unknown,
  pathname: string,
): boolean {
  if (!user) return false;
  if (usuarioTieneRolAdministrador(user)) return true;
  const base = normalizarPathname(pathname);
  if (base === '/' || base === '/login') return true;
  if (base.startsWith('/dashboard/paquete/')) {
    const idPaquete = base.slice('/dashboard/paquete/'.length);
    const visibles = paquetesDashboardVisiblesParaUsuario(user);
    return visibles.some((p) => p.id === idPaquete);
  }
  const rutas: Record<string, string[]> = {
    '/registro-acceso': ['registro_acceso.listar'],
    '/suspension': ['suspension.listar'],
    '/tipos-ingreso': ['tipo_ingreso.listar'],
    '/dispositivos-acceso': ['dispositivos.listar'],
    '/users': ['usuarios.listar'],
    '/roles': ['roles.listar'],
    '/permissions': ['permisos.listar'],
    '/dashboard/visitantes': ['visitantes.listar'],
    '/visita/nueva': [...PERMISOS_MODULO_REGISTRO_VISITA],
    '/seguridad/scanner': ['visitantes.validar_qr'],
    '/eventos': ['eventos.listar'],
    '/notas': ['notas.listar'],
    '/carrera-departamento': ['carrera_departamento.listar'],
    '/reportes': ['reportes.preview'],
  };
  const req = rutas[base];
  if (!req) return false;
  if (base === '/visita/nueva') {
    return usuarioTieneAlgunPermiso(user, req);
  }
  return usuarioTieneTodosLosPermisos(user, req);
}
