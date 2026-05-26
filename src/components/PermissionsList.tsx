'use client';

import { useEffect, useMemo, useState } from 'react';
import { getPermissions } from '../services/api';
import { agruparPermisosPorModulo, etiquetaModuloPermiso } from '../lib/permisos-modulo-ui';
import { usePaginacion } from '@/lib/use-paginacion';
import PaginacionTabla from '@/components/PaginacionTabla';
import ResponsiveTable, { type ColumnaResponsive } from '@/components/ResponsiveTable';

type PermisoFila = {
  id: number;
  name: string;
  description: string | null;
};

type FilaTablaPermiso =
  | { tipo: 'modulo'; key: string; modulo: string; cantidad: number }
  | { tipo: 'permiso'; key: string; permiso: PermisoFila };

/**
 * Catálogo de permisos del sistema (solo lectura).
 * Los permisos se gestionan en base de datos y se asignan a roles desde «Roles».
 */
export default function PermissionsList() {
  const [permissions, setPermissions] = useState<PermisoFila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setCargando(true);
      setError(null);
      try {
        const res = await getPermissions();
        if (!cancelado) {
          setPermissions(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        if (!cancelado) {
          setError('No se pudieron cargar los permisos.');
          setPermissions([]);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const gruposPorModulo = useMemo(
    () => agruparPermisosPorModulo(permissions),
    [permissions],
  );
  const modulosOrdenados = useMemo(
    () => [...gruposPorModulo.keys()].sort((a, b) => a.localeCompare(b, 'es')),
    [gruposPorModulo],
  );

  const filasTabla = useMemo((): FilaTablaPermiso[] => {
    const out: FilaTablaPermiso[] = [];
    for (const modulo of modulosOrdenados) {
      const filas = gruposPorModulo.get(modulo) ?? [];
      out.push({ tipo: 'modulo', key: `h-${modulo}`, modulo, cantidad: filas.length });
      for (const p of filas) {
        out.push({ tipo: 'permiso', key: `p-${p.id}`, permiso: p });
      }
    }
    return out;
  }, [modulosOrdenados, gruposPorModulo]);

  const paginacion = usePaginacion(filasTabla);

  const columnas: ColumnaResponsive<FilaTablaPermiso>[] = [
    {
      key: 'id',
      header: 'No',
      render: (f) => (f.tipo === 'permiso' ? f.permiso.id : '—'),
    },
    {
      key: 'identificador',
      header: 'Identificador',
      render: (f) =>
        f.tipo === 'permiso' ? (
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13 }}>{f.permiso.name}</span>
        ) : (
          '—'
        ),
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (f) =>
        f.tipo === 'permiso' ? (f.permiso.description ?? '—') : '—',
    },
  ];

  function renderFilaTabla(fila: FilaTablaPermiso) {
    if (fila.tipo === 'modulo') {
      return (
        <tr key={fila.key} className="table-section-header">
          <td
            colSpan={3}
            style={{
              textAlign: 'left',
              fontWeight: 600,
              paddingTop: '0.85rem',
              paddingBottom: '0.35rem',
              borderBottom: '1px solid var(--border, #e5e7eb)',
              background: 'var(--card-bg, transparent)',
            }}
          >
            {etiquetaModuloPermiso(fila.modulo)}
            <span className="text-muted small" style={{ fontWeight: 400, marginLeft: 8 }}>
              ({fila.cantidad})
            </span>
          </td>
        </tr>
      );
    }
    return null;
  }

  function renderTarjeta(fila: FilaTablaPermiso) {
    if (fila.tipo === 'modulo') {
      return (
        <div className="table-card--modulo">
          {etiquetaModuloPermiso(fila.modulo)}
          <span className="text-muted small" style={{ fontWeight: 400, marginLeft: 8 }}>
            ({fila.cantidad})
          </span>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">Permisos y módulos del sistema</h2>
        <p className="text-muted small mb-4" style={{ maxWidth: 720 }}>
          Lista de permisos disponibles para asignar a cada rol. Para conceder acceso a un
          módulo, use la pantalla de <strong>Roles</strong> y agregue el permiso correspondiente
          al rol del usuario.
        </p>

        {error && (
          <p className="small" style={{ color: '#b91c1c', marginBottom: '0.75rem' }}>
            {error}
          </p>
        )}

        {cargando && <p className="text-muted">Cargando…</p>}

        <ResponsiveTable
          columnas={columnas}
          filas={paginacion.filasPagina as FilaTablaPermiso[]}
          idCampo="key"
          renderFilaTabla={renderFilaTabla}
          renderTarjeta={renderTarjeta}
          mensajeVacio={
            !cargando && permissions.length === 0
              ? 'No hay permisos en el catálogo. Ejecute las migraciones de base de datos.'
              : undefined
          }
        />
        <PaginacionTabla paginacion={paginacion} />
      </div>
    </div>
  );
}
