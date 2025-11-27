'use client';
import { useEffect, useState } from 'react';
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

export default function RolesList() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedPermission, setSelectedPermission] = useState<{ [key: number]: number | '' }>({});
  const [formData, setFormData] = useState({ id: 0, name: '', description: '' });
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Cargar roles y permisos
  async function fetchAll() {
    const [rolesRes, permsRes] = await Promise.all([getRoles(), getPermissions()]);
    setRoles(rolesRes.data || []);
    setPermissions(permsRes.data || []);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  // Crear o actualizar rol
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

  // Editar rol
  function handleEdit(role: any) {
    setFormData(role);
    setEditMode(true);
    setShowModal(true);
  }

  // Eliminar rol
  async function handleDelete(id: number) {
    if (confirm('¿Seguro que deseas eliminar este rol?')) {
      await deleteRole(id);
      await fetchAll();
    }
  }

  // Asignar permiso
  async function handleAssign(roleId: number) {
    const permId = selectedPermission[roleId];
    if (!permId) return alert('Selecciona un permiso antes de asignar.');

    const role = roles.find((r) => r.id === roleId);
    const alreadyHas = role?.permissions?.some((rp: any) => rp.permissionId === permId);
    if (alreadyHas) return alert('⚠️ Este rol ya tiene asignado ese permiso.');

    try {
      await assignPermissionToRole(roleId, permId);
      setSelectedPermission((prev) => ({ ...prev, [roleId]: '' }));
      await fetchAll();
    } catch (error: any) {
      console.error('Error al asignar permiso:', error.response?.data || error.message);
      alert('No se pudo asignar el permiso. Revisa la consola para más detalles.');
    }
  }

  // Quitar permiso
  async function handleRemovePermission(roleId: number, permissionId: number) {
    if (!confirm('¿Seguro que deseas quitar este permiso del rol?')) return;
    try {
      await removePermissionFromRole(roleId, permissionId);
      await fetchAll();
    } catch (error: any) {
      console.error('Error al quitar permiso:', error.response?.data || error.message);
      alert('No se pudo quitar el permiso.');
    }
  }

  return (
    <div className="container">
      
      <h2 className="text-2xl font-bold mb-4">Gestión de Roles</h2>

      {/* Botón crear */}
      <div className="flex justify-end mb-6 mr-10">
          <button
           onClick={() => setShowModal(true)}
             className="btn btn-primary flex items-center gap-1"
          >
             Crear Rol
          </button>
     </div>
     <br></br>

      {/* Tabla */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Permisos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.name}</td>
                <td>{r.description}</td>
                <td>
                  {/* Asignar nuevo permiso */}
                  <div className="table-actions mb-2">
                    <select
                      value={selectedPermission[r.id] ?? ''}
                      onChange={(e) =>
                        setSelectedPermission((prev) => ({
                          ...prev,
                          [r.id]: e.target.value ? Number(e.target.value) : '',
                        }))
                      }
                      className="input"
                    >
                      <option value="">Seleccionar permiso...</option>
                      {permissions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssign(r.id)}
                      className="btn btn-success"
                      title="Asignar permiso"
                    >
                      <ShieldPlus size={16} />
                    </button>
                  </div>

                  {/* Lista de permisos actuales */}
                  <ul className="table-actions">
                    {(r.permissions || []).map((rp: any) => (
                      <li key={rp.permissionId} className="flex items-center justify-between gap-2">
                        <span>{rp.permission?.name ?? 'permiso'}</span>
                        <button
                          onClick={() => handleRemovePermission(r.id, rp.permissionId)}
                          className="btn btn-danger"
                          title="Quitar permiso"
                        >
                          <ShieldX size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </td>

                <td>
                  <div className="table-actions">
                    <button
                      onClick={() => handleEdit(r)}
                      className="btn btn-warning"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="btn btn-danger"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
              <br></br>
              <div className="form-control mb-8">
                <label className="label">Descripción</label>
                <input
                  type="text"
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <br></br>
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
