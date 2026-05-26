'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { mostrarNotificacion } from '@/lib/notificaciones';
import { usuarioTieneRolAdministrador } from '@/lib/rolesUsuario';
import { puedeAccederUsuarioPathnamePanel } from '@/data/dashboard-paquetes';

/**
 * Redirige al inicio si la ruta del panel no está permitida según los permisos del usuario.
 */
export default function GuardRutaSeguridad() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, user, loading } = useAuth();
  const ultimaRutaDenegadaRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) return;
    if (loading) return;
    if (!user) return;
    if (usuarioTieneRolAdministrador(user)) return;
    if (puedeAccederUsuarioPathnamePanel(user, pathname)) return;

    if (ultimaRutaDenegadaRef.current !== pathname) {
      ultimaRutaDenegadaRef.current = pathname;
      mostrarNotificacion({
        tipo: 'error',
        mensaje: 'No tiene permisos para acceder a esta sección.',
      });
    }

    router.replace('/');
  }, [token, loading, user, pathname, router]);

  return null;
}
