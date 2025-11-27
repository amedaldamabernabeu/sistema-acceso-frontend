'use client';

import { useEffect, useState } from 'react';
import {
  getEventos,
  createEvento,
  updateEvento,
  deleteEvento,
} from '../services/api';
import { Pencil, Trash2 } from 'lucide-react';

export default function EventoList() {
  const [eventos, setEventos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id: 0,
    nombre: '',
    fechaHora: '',
    ubicacion: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function fetchAll() {
    try {
      const res = await getEventos();
      setEventos(res.data || []);
    } catch (err: any) {
      console.error('Error al obtener eventos:', err?.response?.data || err.message);
      alert('Error al cargar los eventos.');
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      nombre: formData.nombre,
      fechaHora: formData.fechaHora,
      ubicacion: formData.ubicacion,
    };

    try {
      if (editMode) {
        await updateEvento(formData.id, payload);
      } else {
        await createEvento(payload);
      }

      setShowModal(false);
      setEditMode(false);
      setFormData({ id: 0, nombre: '', fechaHora: '', ubicacion: '' });

      await fetchAll();
    } catch (err: any) {
      console.error('Error al guardar evento:', err?.response?.data || err.message);
      alert('Error al guardar evento.');
    }
  }

  function handleEdit(evento: any) {
    setFormData({
      id: evento.id,
      nombre: evento.nombre,
      fechaHora: evento.fechaHora?.slice(0, 16) || '',
      ubicacion: evento.ubicacion || '',
    });

    setEditMode(true);
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (confirm('¿Seguro que deseas eliminar este evento?')) {
      try {
        await deleteEvento(id);
        await fetchAll();
      } catch (err: any) {
        console.error('Error al eliminar evento:', err?.response?.data || err.message);
        alert('Error al eliminar evento.');
      }
    }
  }

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Gestión de Eventos</h2>

      <div className="flex justify-end mb-6 mr-10">
        <button
          onClick={() => {
            setEditMode(false);
            setFormData({ id: 0, nombre: '', fechaHora: '', ubicacion: '' });
            setShowModal(true);
          }}
          className="btn btn-primary"
        >
          Crear Evento
        </button>
      </div>
      <br></br>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Fecha y Hora</th>
              <th>Ubicación</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {eventos.map((e) => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.nombre}</td>
                <td>{new Date(e.fechaHora).toLocaleString()}</td>
                <td>{e.ubicacion}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEdit(e)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(e.id)}
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

      {/* MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="font-bold text-lg mb-4">
              {editMode ? 'Editar Evento' : 'Crear Evento'}
            </h3>
            
            <form onSubmit={handleSubmit}>

              {/* NOMBRE */}
              <div className="form-control mb-4">
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
              {/* FECHA HORA */}
              <div className="form-control mb-4">
                <label className="label">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.fechaHora}
                  onChange={(e) => setFormData({ ...formData, fechaHora: e.target.value })}
                  required
                />
              </div>
              <br></br>
              {/* UBICACION */}
              <div className="form-control mb-4">
                <label className="label">Ubicación</label>
                <input
                  type="text"
                  className="input"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
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
