'use client';

import { useEffect, useState } from 'react';
import {
  getDispositivos,
  createDispositivo,
  updateDispositivo,
  deleteDispositivo,
  getTiposIngreso,
} from '../services/api';
import { Pencil, Trash2 } from 'lucide-react';

export default function DispositivoAccesoList() {
  const [dispositivos, setDispositivos] = useState<any[]>([]);
  const [tiposIngreso, setTiposIngreso] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id: 0,
    nombre: '',
    tipoIngresoId: 0,
    activo: true,
  });

  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function fetchAll() {
    try {
      const res = await getDispositivos();
      setDispositivos(res.data || []);

      const tipos = await getTiposIngreso();
      setTiposIngreso(tipos.data || []);
    } catch (err: any) {
      console.error('Error al cargar dispositivos:', err?.response?.data || err.message);
      alert('Error al cargar dispositivos.');
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const payload = {
        nombre: formData.nombre,
        tipoIngresoId: Number(formData.tipoIngresoId),
        activo: Boolean(formData.activo),
      };

      if (editMode) {
        await updateDispositivo(formData.id, payload);
      } else {
        await createDispositivo(payload);
      }

      setShowModal(false);
      setEditMode(false);
      setFormData({ id: 0, nombre: '', tipoIngresoId: 0, activo: true });
      await fetchAll();
    } catch (err: any) {
      console.error('Error al guardar dispositivo:', err?.response?.data || err.message);
      alert('Error al guardar dispositivo.');
    }
  }

  function handleEdit(item: any) {
    setFormData({
      id: item.id,
      nombre: item.nombre,
      tipoIngresoId: item.tipoIngreso?.id || 0,
      activo: item.activo ?? true,
    });

    setEditMode(true);
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (confirm('¿Seguro que deseas eliminar este dispositivo?')) {
      try {
        await deleteDispositivo(id);
        await fetchAll();
      } catch (err: any) {
        console.error('Error al eliminar:', err?.response?.data || err.message);
        alert('Error al eliminar.');
      }
    }
  }

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Gestión de Dispositivos de Acceso</h2>

      <div className="flex justify-end mb-6 mr-10">
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          Crear Dispositivo
        </button>
      </div>
      <br></br>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nombre</th>
              <th>Tipo de Ingreso</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {dispositivos.map((d) => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.nombre}</td>
                <td>{d.tipoIngreso?.nombre || '—'}</td>
                <td>
                  {d.activo ? (
                    <span className="text-green-600 font-bold">Sí</span>
                  ) : (
                    <span className="text-red-600 font-bold">No</span>
                  )}
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-warning" onClick={() => handleEdit(d)}>
                      <Pencil size={16} />
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(d.id)}>
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
              {editMode ? 'Editar Dispositivo' : 'Crear Dispositivo'}
            </h3>

            <form onSubmit={handleSubmit}>
              
              {/* NOMBRE */}
              <div className="form-control mb-2">
                <label className="label">Nombre</label>
                <input
                  type="text"
                  className="input"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <br></br>
              {/* TIPO INGRESO */}
              <div className="form-control mb-4">
                <label className="label">Tipo de Ingreso</label>
                <select
                  className="input"
                  value={formData.tipoIngresoId} 
                 onChange={(e) => setFormData({ ...formData, tipoIngresoId: Number(e.target.value) }) } required >
                  <option value="">Seleccione...</option>
                  {tiposIngreso.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <br></br>
              {/* ACTIVO */}
              <div className="form-control mb-4">
                <label className="label">¿Activo?</label>
                <select
                  className="input"
                  value={formData.activo ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({ ...formData, activo: e.target.value === "true" })
                  }
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
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
