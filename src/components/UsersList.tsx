'use client';
import { yaTieneNotificacionError } from '@/lib/ya-tiene-notificacion-error';
import { mostrarNotificacion } from '@/lib/notificaciones';
import {
  emailUsuarioDuplicado,
  emailUsuarioFormatoValido,
  nombreUsuarioDuplicado,
  nombreUsuarioFormatoValido,
  normalizarEmailUsuario,
  normalizarNombreUsuario,
} from '@/lib/usuario-validaciones';
import { filtrarTextoSoloNombre } from '@/lib/suspension-validaciones';
import { useEffect, useMemo, useState } from 'react';
import { filtrarPorTexto } from '@/lib/filtrar-por-texto';
import FiltroTabla from '@/components/FiltroTabla';
import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  deleteUser,
  assignRoleToUser,
  removeRoleFromUser,
} from '../services/api';
import { Trash2, Edit, Save, Shield, X } from 'lucide-react';
import { usePaginacion } from '@/lib/use-paginacion';
import PaginacionTabla from '@/components/PaginacionTabla';
import ResponsiveTable, { type ColumnaResponsive } from '@/components/ResponsiveTable';

type UserType = {
  id: number;
  email: string;
  name?: string;
  active?: boolean;
  roles?: Array<{ role: { id: number; name: string } }>;
};

type RoleType = { id: number; name: string };

function renderCeldaRolesUsuario(
  u: UserType,
  roles: RoleType[],
  selectedRoleForUser: Record<number, number | ''>,
  setSelectedRoleForUser: React.Dispatch<
    React.SetStateAction<Record<number, number | ''>>
  >,
  onAssign: (userId: number) => void,
  onRemove: (userId: number, roleId: number) => void,
) {
  return (
    <div className="usuario-roles-celda">
      {(u.roles || []).length === 0 ? (
        <p className="usuario-roles-sin">Sin roles asignados</p>
      ) : (
        <div className="usuario-roles-chips">
          {(u.roles || []).map((ur, i) => (
            <span
              key={ur.role?.id ?? i}
              className="usuario-rol-chip"
              title={ur.role?.name}
            >
              <span className="usuario-rol-chip__nombre">{ur.role?.name ?? 'Rol'}</span>
              <button
                type="button"
                onClick={() => onRemove(u.id, ur.role.id)}
                className="usuario-rol-chip__quitar"
                title={`Quitar rol ${ur.role?.name ?? ''}`}
                aria-label={`Quitar rol ${ur.role?.name ?? ''}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="usuario-roles-asignar">
        <select
          value={selectedRoleForUser[u.id] ?? ''}
          onChange={(e) =>
            setSelectedRoleForUser((prev) => ({
              ...prev,
              [u.id]: e.target.value ? Number(e.target.value) : '',
            }))
          }
          className="input"
        >
          <option value="">Seleccionar rol...</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onAssign(u.id)}
          className="btn btn-success"
          title="Asignar rol"
          style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          <Shield size={14} />
          Asignar
        </button>
      </div>
    </div>
  );
}

export default function UsersList() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [selectedRoleForUser, setSelectedRoleForUser] = useState<Record<number, number | ''>>({});
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const usersFiltrados = useMemo(
    () =>
      filtrarPorTexto(users, busquedaTabla, (u) => {
        const rolesTxt = (u.roles ?? []).map((ur) => ur.role?.name).join(' ');
        return [u.email, u.name, rolesTxt, u.active === false ? 'inactivo' : 'activo'].join(' ');
      }),
    [users, busquedaTabla],
  );
  const paginacion = usePaginacion(usersFiltrados);

  useEffect(() => {
    paginacion.irAPagina(1);
  }, [busquedaTabla, paginacion.irAPagina]);

  async function fetchAll() {
    try {
      const [uRes, rRes] = await Promise.all([getUsers(), getRoles()]);
      const usersData: UserType[] = uRes?.data ?? [];
      const rolesData: RoleType[] = rRes?.data ?? [];
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      console.error(err);
      if (!yaTieneNotificacionError(err)) {
        alert('Error al cargar usuarios o roles');
      }
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function validarDatosUsuario(
    datos: { email: string; name?: string },
    excluirId = 0,
  ): boolean {
    const correo = normalizarEmailUsuario(datos.email);
    if (!emailUsuarioFormatoValido(correo)) {
      mostrarNotificacion({
        tipo: 'error',
        mensaje: 'El correo electrónico no tiene un formato válido.',
      });
      return false;
    }
    if (emailUsuarioDuplicado(users, correo, excluirId)) {
      mostrarNotificacion({
        tipo: 'error',
        mensaje: 'Ya existe un usuario con ese correo electrónico.',
      });
      return false;
    }
    const nombre = normalizarNombreUsuario(datos.name);
    if (!nombreUsuarioFormatoValido(datos.name)) {
      mostrarNotificacion({
        tipo: 'error',
        mensaje:
          'El nombre solo puede contener letras y espacios (mínimo 2 caracteres).',
      });
      return false;
    }
    if (nombreUsuarioDuplicado(users, nombre, excluirId)) {
      mostrarNotificacion({
        tipo: 'error',
        mensaje: 'Ya existe un usuario con ese nombre.',
      });
      return false;
    }
    return true;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const correo = normalizarEmailUsuario(email);
    const nombre = normalizarNombreUsuario(name);
    if (!validarDatosUsuario({ email: correo, name: nombre ?? undefined })) return;

    try {
      await createUser({
        email: correo,
        password,
        name: nombre ?? undefined,
      });
      setEmail('');
      setPassword('');
      setName('');
      await fetchAll();
    } catch (err: unknown) {
      console.error(err);
      if (!yaTieneNotificacionError(err)) alert('Error al crear usuario.');
    }
  }

  async function handleEditSave() {
    if (!editingUser) return;
    const correo = normalizarEmailUsuario(editingUser.email);
    const nombre = normalizarNombreUsuario(editingUser.name);
    if (
      !validarDatosUsuario(
        { email: correo, name: nombre ?? undefined },
        editingUser.id,
      )
    ) {
      return;
    }

    try {
      await updateUser(editingUser.id, {
        email: correo,
        name: nombre ?? undefined,
        active: editingUser.active,
      });
      setEditingUser(null);
      await fetchAll();
    } catch (err: unknown) {
      console.error(err);
      if (!yaTieneNotificacionError(err)) alert('Error al guardar usuario.');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Â¿Eliminar este usuario?')) return;
    await deleteUser(id);
    fetchAll();
  }

  async function handleAssign(userId: number) {
    const roleId = selectedRoleForUser[userId];
    if (!roleId) return alert('Selecciona un rol');
    await assignRoleToUser(userId, Number(roleId));
    fetchAll();
  }

  async function handleRemove(userId: number, roleId: number) {
    if (!confirm('Â¿Quitar este rol al usuario?')) return;
    await removeRoleFromUser(userId, roleId);
    fetchAll();
  }

  const columnas: ColumnaResponsive<UserType>[] = [
    { key: 'id', header: 'No' },
    { key: 'email', header: 'Email' },
    {
      key: 'name',
      header: 'Nombre',
      render: (u) => u.name ?? '-',
    },
    {
      key: 'active',
      header: 'Estado',
      render: (u) => (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!u.active}
            onChange={() => updateUser(u.id, { active: !u.active }).then(fetchAll)}
          />
          <span>{u.active ? 'Activo' : 'Inactivo'}</span>
        </label>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      apilarEnTarjeta: true,
      render: (u) =>
        renderCeldaRolesUsuario(
          u,
          roles,
          selectedRoleForUser,
          setSelectedRoleForUser,
          handleAssign,
          handleRemove,
        ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      apilarEnTarjeta: true,
      render: (u) => (
        <div className="table-actions">
          <button
            onClick={() => setEditingUser(u)}
            className="btn btn-warning ml-3"
            title="Editar usuario"
            type="button"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => handleDelete(u.id)}
            className="btn btn-danger ml-3"
            title="Eliminar usuario"
            type="button"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-10 ml-8">
        <h2 className="page-heading">Gestión de Usuarios</h2>
        <form onSubmit={handleCreate} className="flex gap-3 items-center">
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            required
            className="input"
          />
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) =>
              setName(filtrarTextoSoloNombre(e.target.value))
            }
            className="input"
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />
          <button type="submit" className="btn btn-primary flex items-center gap-1">
            <Save size={18} /> Crear
          </button>
        </form>
      </div>

      <FiltroTabla
        valor={busquedaTabla}
        onChange={setBusquedaTabla}
        placeholder="Buscar por correo, nombre o rol…"
      />
      <ResponsiveTable
        columnas={columnas}
        filas={paginacion.filasPagina as UserType[]}
        mensajeVacio={
          users.length > 0 && usersFiltrados.length === 0
            ? 'Sin resultados para la búsqueda.'
            : undefined
        }
      />
      <PaginacionTabla paginacion={paginacion} />

      {editingUser && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="text-xl font-semibold mb-3">Editar Usuario</h3>
            <input
              className="input mb-2"
              type="email"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  email: e.target.value.trim(),
                })
              }
              placeholder="Email"
            />
            <input
              className="input mb-2"
              value={editingUser.name ?? ''}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  name: filtrarTextoSoloNombre(e.target.value),
                })
              }
              placeholder="Nombre"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!editingUser.active}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, active: e.target.checked })
                }
              />
              Activo
            </label>

            <div className="table-actions">
              <button onClick={handleEditSave} className="btn btn-primary flex items-center gap-1">
                <Save size={18} /> Guardar
              </button>
              <button onClick={() => setEditingUser(null)} className="btn btn-secondary flex items-center gap-1">
                <X size={18} /> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
