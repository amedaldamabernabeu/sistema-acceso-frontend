'use client';

import Link from 'next/link';
import {
  paqueteDashboardParaUsuario,
} from '@/data/dashboard-paquetes';
import PaqueteModulosSeccion from '@/components/PaqueteModulosSeccion';
import { useAuth } from '@/components/auth/AuthProvider';

type Props = {
  idPaquete: string;
};

export default function PaqueteDashboardVista({ idPaquete }: Props) {
  const { user, loading } = useAuth();

  if (loading && !user) {
    return (
      <p style={{ margin: 0, padding: '1rem', textAlign: 'center', color: '#64748b' }}>
        Cargando perfil…
      </p>
    );
  }

  const paq = paqueteDashboardParaUsuario(idPaquete, user ?? null);

  if (!paq) {
    return (
      <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
        <p style={{ marginTop: 0 }}>No se encontró el paquete solicitado.</p>
        <Link href="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <>
      <p style={{ margin: '0 0 1rem' }}>
        <Link href="/" style={{ color: 'var(--accent, #0b5cff)' }}>
          ← Inicio
        </Link>
      </p>
      <PaqueteModulosSeccion paq={paq} />
    </>
  );
}
