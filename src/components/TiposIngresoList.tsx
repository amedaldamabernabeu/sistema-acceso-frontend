'use client';

import { useEffect, useState } from 'react';
import {
  getTiposIngreso,
  createTipoIngreso,
  updateTipoIngreso,
  deleteTipoIngreso,
} from '../services/api';

import { Pencil, Trash2 } from 'lucide-react';

export default function TiposIngresoList() {
  const [tipos, setTipos] = useState<any[]>([]);
  const [formData, setFormData] = useState({ id: 0, nombre: '' });
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function fetchAll() {
    try {
      const res = await getTiposIngreso();
      setTipos(res.data || []);
    } catch (err: any) {
      console.error('Error al obtener tipos ingreso:', err?.response?.data || err.message);
      alert('Error al cargar tipos de ingreso.');
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editMode) {
        await updateTipoIngreso(formData.id, { nombre: formData.nombre });
      } else {
        await createTipoIngreso({ nombre: formData.nombre });
      }

      setShowModal(false);
      setEditMode(false);
      setFormData({ id: 0, nombre: '' });
      await fetchAll();
    } catch (err: any) {
      console.error('Error al guardar tipo ingreso:', err?.response?.data || err.message);
      alert('Error al guardar tipo de ingreso.');
    }
  }

  function handleEdit(item: any) {
    setFormData({ id: item.id, nombre: item.nombre });
    setEditMode(true);
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (confirm('¿Seguro que deseas eliminar este tipo de ingreso?')) {
      try {
        await deleteTipoIngreso(id);
        await fetchAll();
      } catch (err: any) {
        console.error('Error al eliminar tipo ingreso:', err?.response?.data || err.message);
        alert('Error al eliminar tipo de ingreso.');
      }
    }
  }

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Tipos de Ingreso</h2>

      <div className="flex justify-end mb-6 mr-10">
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-1">
          Crear Tipo
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
            {tipos.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.nombre}</td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => handleEdit(t)} className="btn btn-warning" title="Editar">
                      <Pencil size={16} />
                    </button>

                    <button onClick={() => handleDelete(t.id)} className="btn btn-danger" title="Eliminar">
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
              {editMode ? 'Editar Tipo Ingreso' : 'Crear Tipo Ingreso'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-control mb-2">
                <label className="label mb-3">Nombre</label>
                <input
                  type="text"
                  className="input"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <br></br>
              <div className="table-actions mt-4">
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
