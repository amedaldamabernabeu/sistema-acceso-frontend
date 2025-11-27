'use client';
import { useEffect, useState } from 'react';
import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  deleteUser,
  assignRoleToUser,
  removeRoleFromUser,
} from '../services/api';
import { Trash2, Edit, Save, Shield, X, AlignCenter } from 'lucide-react';

type UserType = {
  id: number;
  email: string;
  name?: string;
  active?: boolean;
  roles?: Array<{ role: { id: number; name: string } }>;
};

type RoleType = { id: number; name: string };

export default function UsersList() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [selectedRoleForUser, setSelectedRoleForUser] = useState<Record<number, number | ''>>({});

  async function fetchAll() {
    try {
      const [uRes, rRes] = await Promise.all([getUsers(), getRoles()]);
      const usersData: UserType[] = uRes?.data ?? [];
      const rolesData: RoleType[] = rRes?.data ?? [];
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      console.error(err);
      alert('Error al cargar usuarios o roles');
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createUser({ email, password, name });
    setEmail('');
    setPassword('');
    setName('');
    fetchAll();
  }

  async function handleEditSave() {
    if (!editingUser) return;
    await updateUser(editingUser.id, {
      email: editingUser.email,
      name: editingUser.name,
      active: editingUser.active,
    });
    setEditingUser(null);
    fetchAll();
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
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
    if (!confirm('¿Quitar este rol al usuario?')) return;
    await removeRoleFromUser(userId, roleId);
    fetchAll();
  }

  return (
    <div>
      {/* Crear usuario */}
      <div className="flex justify-between items-center mb-10 ml-8">
        <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        <form onSubmit={handleCreate} className="flex gap-3 items-center">
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
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

      {/* Tabla de usuarios */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No </th>
              <th>Email</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Roles</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.name ?? '-'}</td>
                <td>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!u.active}
                      onChange={() =>
                        updateUser(u.id, { active: !u.active }).then(fetchAll)
                      }
                    />
                    <span>{u.active ? 'Activo' : 'Inactivo'}</span>
                  </label>
                </td>
                <td>
                  {(u.roles || []).map((ur, i) => (
                    <div key={i} className="flex justify-between items-center mb-1">
                      <span>{ur.role?.name}</span>
                      <button
                        onClick={() => handleRemove(u.id, ur.role.id)}
                        className="btn btn-danger btn-sm"
                        title="Quitar rol"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="table-actions">
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
                      onClick={() => handleAssign(u.id)}
                      className="btn btn-success ml-3"
                      title="Asignar rol"
                    >
                      <Shield size={14} />
                      
                    </button>
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="btn btn-warning ml-3"
                      title="Editar usuario"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="btn btn-danger ml-3"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {editingUser && (
        <div className="modal-backdrop">
          <div className="modal-content">
            
            <h3 className="text-xl font-semibold mb-3">Editar Usuario</h3>
            <input
              className="input mb-2"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
              placeholder="Email"
            />
            <input
              className="input mb-2"
              value={editingUser.name ?? ''}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
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
