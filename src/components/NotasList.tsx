'use client';

import { useEffect, useState } from 'react';
import {
  getNotas,
  createNota,
  updateNota,
  deleteNota,
  getRegistrosAcceso,
  getEventos,
} from '../services/api';

import { Pencil, Trash2 } from 'lucide-react';

export default function NotasList() {
  const [notas, setNotas] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id: 0,
    asunto: '',
    registros_id: 0,
    eventos_id: 0,
  });

  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Cargar datos iniciales
  async function fetchAll() {
    try {
      const resNotas = await getNotas();
      setNotas(resNotas.data || []);

      const resReg = await getRegistrosAcceso();
      setRegistros(resReg.data || []);

      const resEventos = await getEventos();
      setEventos(resEventos.data || []);
    } catch (err: any) {
      console.error('Error cargando datos:', err?.response?.data || err.message);
      alert('Error al cargar los datos.');
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  // Guardar / Actualizar
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      asunto: formData.asunto,
      registroAccesoId: Number(formData.registros_id),
      eventoId: Number(formData.eventos_id),
    };

    try {
      if (editMode) {
        await updateNota(formData.id, payload);
      } else {
        await createNota(payload);
      }

      setShowModal(false);
      setEditMode(false);

      setFormData({
        id: 0,
        asunto: '',
        registros_id: 0,
        eventos_id: 0,
      });

      await fetchAll();
    } catch (err: any) {
      console.error('Error al guardar nota:', err?.response?.data || err.message);
      alert('Error al guardar la nota.');
    }
  }

  function handleEdit(nota: any) {
    setFormData({
      id: nota.id,
      asunto: nota.asunto,
      registros_id: nota.registroAccesoId,
      eventos_id: nota.eventoId,
    });

    setEditMode(true);
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (confirm('¿Eliminar esta nota?')) {
      try {
        await deleteNota(id);
        await fetchAll();
      } catch (err: any) {
        console.error('Error al eliminar:', err?.response?.data || err.message);
        alert('Error al eliminar la nota.');
      }
    }
  }

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Gestión de Notas</h2>

      <div className="flex justify-end mb-6 mr-10">
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Crear Nota
        </button>
      </div>
      <br></br>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Asunto</th>
              <th>Registro</th>
              <th>Evento</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {notas.map((n) => (
              <tr key={n.id}>
                <td>{n.id}</td>
                <td>{n.asunto}</td>
                <td>{n.registroAcceso?.codigoUsuario}</td>
                <td>{n.evento?.nombre}</td>

                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-warning"
                      onClick={() => handleEdit(n)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(n.id)}
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

      {/* --- MODAL --- */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="font-bold text-lg mb-4">
              {editMode ? 'Editar Nota' : 'Crear Nota'}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Asunto */}
              <div className="form-control mb-4">
                <label className="label">Asunto</label>
                <input
                  type="text"
                  className="input"
                  value={formData.asunto}
                  onChange={(e) =>
                    setFormData({ ...formData, asunto: e.target.value })
                  }
                  required
                />
              </div>
              <br></br>
              {/* Registro */}
              <div className="form-control mb-4">
                <label className="label">Registro</label>
                <select
                  className="input"
                  value={formData.registros_id}
                  onChange={(e) =>
                   setFormData({ ...formData, registros_id: Number(e.target.value) }) }
                  required >
                  <option value="">Seleccione un registro</option>
                  {registros.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.id} — {r.entrada}
                    </option>
                  ))}
                </select>
              </div>
              <br></br>
              {/* Evento */}
              <div className="form-control mb-4">
                <label className="label">Evento</label>
                <select
                  className="input"
                  value={formData.eventos_id}
                  onChange={(e) =>
                    setFormData({   ...formData, eventos_id: Number(e.target.value) })
                  }
                  required >
                  <option value="">Seleccione un evento</option>
                  {eventos.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <br></br>
              <div className="table-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
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
