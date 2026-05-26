'use client';
import { yaTieneNotificacionError } from '@/lib/ya-tiene-notificacion-error';
import { useEffect, useMemo, useState } from 'react';
import { filtrarPorTexto } from '@/lib/filtrar-por-texto';
import FiltroTabla from '@/components/FiltroTabla';
import {
  getRoles,
  getPermissions,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionToRole,
  removePermissionFromRole,
} from '../services/api';
import { Pencil, Trash2, ShieldPlus, ShieldX } from 'lucide-react';
import { agruparPermisosPorModulo, etiquetaModuloPermiso } from '../lib/permisos-modulo-ui';
import { usePaginacion } from '@/lib/use-paginacion';
import PaginacionTabla from '@/components/PaginacionTabla';
import ResponsiveTable, { type ColumnaResponsive } from '@/components/ResponsiveTable';

type PermisoCatalogo = { id: number; name: string; description?: string | null };
type PermisoAsignado = {
  permissionId: number;
  permission?: { name?: string; description?: string | null };
};

/** Parte acción del identificador (p. ej. `usuarios.listar` → `listar`). */
function sufijoAccionPermiso(nombre: string): string {
  const i = nombre.indexOf('.');
  return i === -1 ? nombre : nombre.slice(i + 1);
}

function agruparPermisosAsignadosAlRol(asignados: PermisoAsignado[]) {
  const filas = asignados.map((rp) => ({
    permissionId: rp.permissionId,
    name: rp.permission?.name ?? 'permiso',
    description: rp.permission?.description ?? null,
  }));
  return agruparPermisosPorModulo(filas);
}

function permisosDisponiblesParaRol(
  catalogo: PermisoCatalogo[],
  asignados: PermisoAsignado[],
): PermisoCatalogo[] {
  const idsAsignados = new Set(asignados.map((rp) => rp.permissionId));
  return catalogo.filter((p) => !idsAsignados.has(p.id));
}

type Rol = {
  id: number;
  name: string;
  description?: string;
  permissions?: PermisoAsignado[];
};

function renderCeldaPermisosRol(
  r: Rol,
  permissions: PermisoCatalogo[],
  selectedPermission: { [key: number]: number | '' },
  setSelectedPermission: React.Dispatch<
    React.SetStateAction<{ [key: number]: number | '' }>
  >,
  onAssign: (roleId: number) => void,
  onRemove: (roleId: number, permissionId: number) => void,
) {
  const asignados = (r.permissions || []) as PermisoAsignado[];
  const disponibles = permisosDisponiblesParaRol(permissions, asignados);
  const gruposDisponibles = agruparPermisosPorModulo(disponibles);
  const modulosDisponibles = [...gruposDisponibles.keys()].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );
  const gruposAsignados = agruparPermisosAsignadosAlRol(asignados);
  const modulosAsignados = [...gruposAsignados.keys()].sort((a, b) => a.localeCompare(b, 'es'));

  return (
    <div className="roles-permisos-celda">
      <div
        className="card"
        style={{
          padding: '12px 14px',
          margin: 0,
          boxShadow: 'none',
          border: '1px solid rgba(0,0,0,0.06)',
          background: 'var(--card-bg, #fafbfc)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 8,
            marginBottom: 10,
          }}
        >
          <span className="small" style={{ fontWeight: 600, color: 'inherit' }}>
            Permisos del rol
          </span>
          <span className="text-muted small">
            {asignados.length} asignado{asignados.length === 1 ? '' : 's'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <select
            value={selectedPermission[r.id] ?? ''}
            onChange={(e) =>
              setSelectedPermission((prev) => ({
                ...prev,
                [r.id]: e.target.value ? Number(e.target.value) : '',
              }))
            }
            className="input"
            style={{ flex: '1 1 200px', minWidth: 0, fontSize: 13 }}
            disabled={disponibles.length === 0}
          >
            <option value="">
              {disponibles.length === 0
                ? 'Todos los permisos ya están asignados'
                : 'Seleccionar permiso…'}
            </option>
            {modulosDisponibles.map((modulo) => (
              <optgroup key={modulo} label={etiquetaModuloPermiso(modulo)}>
                {(gruposDisponibles.get(modulo) ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {sufijoAccionPermiso(p.name)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onAssign(r.id)}
            className="btn btn-success"
            title="Asignar permiso"
            disabled={disponibles.length === 0}
            style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            <ShieldPlus size={16} />
            Asignar
          </button>
        </div>

        {asignados.length === 0 ? (
          <p className="text-muted small" style={{ margin: 0 }}>
            Este rol aún no tiene permisos. Use el selector para agregar uno.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {modulosAsignados.map((modulo) => {
              const filas = gruposAsignados.get(modulo) ?? [];
              return (
                <section key={modulo}>
                  <div
                    className="small"
                    style={{
                      fontWeight: 600,
                      marginBottom: 6,
                      color: 'var(--muted, #64748b)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.03em',
                      fontSize: 11,
                    }}
                  >
                    {etiquetaModuloPermiso(modulo)}
                    <span style={{ fontWeight: 500, marginLeft: 6 }}>({filas.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {filas.map((p) => (
                      <span
                        key={p.permissionId}
                        title={p.description ?? p.name}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 6px 4px 10px',
                          borderRadius: 999,
                          fontSize: 12,
                          lineHeight: 1.3,
                          background: '#fff',
                          border: '1px solid rgba(0,0,0,0.1)',
                          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'ui-monospace, monospace',
                            maxWidth: 140,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {sufijoAccionPermiso(p.name)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onRemove(r.id, p.permissionId)}
                          className="btn btn-danger"
                          title={`Quitar ${p.name}`}
                          style={{
                            padding: '2px 5px',
                            minWidth: 24,
                            minHeight: 24,
                            borderRadius: 999,
                            lineHeight: 0,
                          }}
                        >
                          <ShieldX size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RolesList() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<PermisoCatalogo[]>([]);
  const [selectedPermission, setSelectedPermission] = useState<{ [key: number]: number | '' }>({});
  const [formData, setFormData] = useState({ id: 0, name: '', description: '' });
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const rolesFiltrados = useMemo(
    () =>
      filtrarPorTexto(roles, busquedaTabla, (r) => {
        const permisos =
          r.permissions?.map((rp: { permission?: { name?: string } }) => rp.permission?.name).join(' ') ?? '';
        return [r.name, r.description, permisos].join(' ');
      }),
    [roles, busquedaTabla],
  );
  const paginacion = usePaginacion(rolesFiltrados);

  useEffect(() => {
    paginacion.irAPagina(1);
  }, [busquedaTabla, paginacion.irAPagina]);

  async function fetchAll() {
    const [rolesRes, permsRes] = await Promise.all([getRoles(), getPermissions()]);
    setRoles(rolesRes.data || []);
    setPermissions(permsRes.data || []);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editMode) {
      await updateRole(formData.id, { name: formData.name, description: formData.description });
    } else {
      await createRole({ name: formData.name, description: formData.description });
    }
    setShowModal(false);
    setEditMode(false);
    setFormData({ id: 0, name: '', description: '' });
    await fetchAll();
  }

  function handleEdit(role: any) {
    setFormData(role);
    setEditMode(true);
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (confirm('¿Seguro que deseas eliminar este rol?')) {
      await deleteRole(id);
      await fetchAll();
    }
  }

  async function handleAssign(roleId: number) {
    const permId = selectedPermission[roleId];
    if (!permId) return alert('Selecciona un permiso antes de asignar.');

    const role = roles.find((r) => r.id === roleId);
    const alreadyHas = role?.permissions?.some((rp: any) => rp.permissionId === permId);
    if (alreadyHas) return alert('Este rol ya tiene asignado ese permiso.');

    try {
      await assignPermissionToRole(roleId, permId);
      setSelectedPermission((prev) => ({ ...prev, [roleId]: '' }));
      await fetchAll();
    } catch (error: any) {
      console.error('Error al asignar permiso:', error.response?.data || error.message);
      if (!yaTieneNotificacionError(error)) {
        alert('No se pudo asignar el permiso. Revisa la consola para más detalles.');
      }
    }
  }

  async function handleRemovePermission(roleId: number, permissionId: number) {
    if (!confirm('¿Seguro que deseas quitar este permiso del rol?')) return;
    try {
      await removePermissionFromRole(roleId, permissionId);
      await fetchAll();
    } catch (error: any) {
      console.error('Error al quitar permiso:', error.response?.data || error.message);
      if (!yaTieneNotificacionError(error)) alert('No se pudo quitar el permiso.');
    }
  }

  const columnas: ColumnaResponsive<Rol>[] = [
    { key: 'id', header: 'No' },
    { key: 'name', header: 'Nombre' },
    { key: 'description', header: 'Descripción' },
    {
      key: 'permisos',
      header: 'Permisos',
      apilarEnTarjeta: true,
      render: (r) =>
        renderCeldaPermisosRol(
          r,
          permissions,
          selectedPermission,
          setSelectedPermission,
          handleAssign,
          handleRemovePermission,
        ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      apilarEnTarjeta: true,
      render: (r) => (
        <div className="table-actions">
          <button onClick={() => handleEdit(r)} className="btn btn-warning" title="Editar" type="button">
            <Pencil size={16} />
          </button>
          <button onClick={() => handleDelete(r.id)} className="btn btn-danger" title="Eliminar" type="button">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <h2 className="page-heading">Gestión de Roles</h2>

      <div className="panel-toolbar">
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-1"
        >
          Crear Rol
        </button>
      </div>

      <FiltroTabla
        valor={busquedaTabla}
        onChange={setBusquedaTabla}
        placeholder="Buscar por nombre, descripción o permiso…"
      />
      <ResponsiveTable
        columnas={columnas}
        filas={paginacion.filasPagina as Rol[]}
        mensajeVacio={
          roles.length > 0 && rolesFiltrados.length === 0
            ? 'Sin resultados para la búsqueda.'
            : undefined
        }
      />
      <PaginacionTabla paginacion={paginacion} />


      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="font-bold text-lg mb-4">
              {editMode ? 'Editar Rol' : 'Crear Rol'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-control mb-2">
                <label className="label mb-3">Nombre</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <br />
              <div className="form-control mb-8">
                <label className="label">Descripción</label>
                <input
                  type="text"
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <br />
              <div className="table-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editMode ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
