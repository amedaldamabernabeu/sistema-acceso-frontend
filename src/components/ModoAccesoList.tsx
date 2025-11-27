'use client';

import { useEffect, useState } from 'react';
import {
  getModosAcceso,
  createModoAcceso,
  updateModoAcceso,
  deleteModoAcceso,
} from '../services/api';
import { Pencil, Trash2 } from 'lucide-react';

export default function ModoAccesoList() {
  const [modos, setModos] = useState<any[]>([]);
  const [formData, setFormData] = useState({ id: 0, name: '' });
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function fetchAll() {
    try {
      const res = await getModosAcceso();
      setModos(res.data || []);
    } catch (err: any) {
      console.error('Error al obtener modos de acceso:', err?.response?.data || err.message);
      alert('Error al cargar los modos de acceso.');
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editMode) {
        await updateModoAcceso(formData.id, { name: formData.name });
      } else {
        await createModoAcceso({ name: formData.name });
      }

      setShowModal(false);
      setEditMode(false);
      setFormData({ id: 0, name: '' });
      await fetchAll();
    } catch (err: any) {
      console.error('Error al guardar modo de acceso:', err?.response?.data || err.message);
      alert('Error al guardar el modo de acceso.');
    }
  }

  function handleEdit(modo: any) {
    setFormData({ id: modo.id, name: modo.name });
    setEditMode(true);
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (confirm('¿Seguro que deseas eliminar este modo de acceso?')) {
      try {
        await deleteModoAcceso(id);
        await fetchAll();
      } catch (err: any) {
        console.error('Error al eliminar modo de acceso:', err?.response?.data || err.message);
        alert('Error al eliminar el modo de acceso.');
      }
    }
  }

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Gestión de Modos de Acceso</h2>

      <div className="flex justify-end mb-6 mr-10">
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-1">
          Crear Modo
        </button>
      </div>
      <br></br>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nombre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {modos.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.name}</td>
                <td>
                  <div className="table-actions">
                    <button
                      onClick={() => handleEdit(m)}
                      className="btn btn-warning"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
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

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="font-bold text-lg mb-4">
              {editMode ? 'Editar Modo de Acceso' : 'Crear Modo de Acceso'}
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
