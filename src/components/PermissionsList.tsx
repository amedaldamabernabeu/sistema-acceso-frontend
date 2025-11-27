'use client';
import { useEffect, useState } from 'react';
import { getPermissions, createPermission, updatePermission, deletePermission } from '../services/api';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';

export default function PermissionsList() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', description: '' });

  async function fetchPermissions() {
    const res = await getPermissions();
    setPermissions(res.data || []);
  }

  useEffect(() => { fetchPermissions(); }, []);

  function openCreateModal() {
    setEditMode(false);
    setFormData({ id: null, name: '', description: '' });
    setShowModal(true);
  }

  function openEditModal(perm: any) {
    setEditMode(true);
    setFormData({ id: perm.id, name: perm.name, description: perm.description });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editMode) {
      await updatePermission(formData.id!, { name: formData.name, description: formData.description });
    } else {
      await createPermission({ name: formData.name, description: formData.description });
    }
    setShowModal(false);
    await fetchPermissions();
  }

  async function handleDelete(id: number) {
    if (confirm('¿Estás seguro de eliminar este permiso?')) {
      await deletePermission(id);
      await fetchPermissions();
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gestión de Permisos</h2>
          <button onClick={openCreateModal} className="btn btn-primary">
            <PlusCircle size={18} /> Nuevo Permiso
          </button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.description}</td>
                  <td>
                    <div className="table-actions">
                      <button
  onClick={() => {
    console.log('Editar permiso:', p);
    openEditModal(p);
  }}
  className="btn btn-warning"
  title="Editar permiso"
>
  <Pencil size={16} />
</button>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-danger" title="Eliminar permiso">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No hay permisos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Crear/Editar */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="text-lg font-semibold mb-3">
              {editMode ? 'Editar Permiso' : 'Nuevo Permiso'}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                className="input"
                placeholder="Nombre del permiso"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <input
                className="input"
                placeholder="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="table-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
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
