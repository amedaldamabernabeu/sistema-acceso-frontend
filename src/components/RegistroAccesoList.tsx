'use client';
import { useEffect, useState } from 'react';
import {
  getRegistrosAcceso,
  updateRegistroAcceso,
  deleteRegistroAcceso,
} from '@/services/api';
import { Pencil, Trash2, Search } from 'lucide-react';

export default function RegistroAccesoList() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    id: 0,
    codigoUsuario: '',
    modoAccesoId: '',
    entrada: '',
    salida: '',
  });

  const [filters, setFilters] = useState({
    codigoUsuario: '',
    fechaInicio: '',
    fechaFin: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 🔹 Obtener todos los registros
  async function fetchAll() {
    try {
      const res = await getRegistrosAcceso();
      setRegistros(res.data || []);
      setFiltered(res.data || []);
    } catch (error) {
      console.error('Error al obtener registros de acceso:', error);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  // 🔍 Filtros
  function applyFilters() {
    let data = [...registros];

    // Código usuario
    if (filters.codigoUsuario.trim() !== '') {
      data = data.filter(r =>
        r.codigoUsuario.toLowerCase().includes(filters.codigoUsuario.toLowerCase())
      );
    }

    // Fecha inicio
    if (filters.fechaInicio !== '') {
      const start = new Date(filters.fechaInicio);
      data = data.filter(r => new Date(r.entrada) >= start);
    }

    // Fecha fin
    if (filters.fechaFin !== '') {
      const end = new Date(filters.fechaFin);
      data = data.filter(r => new Date(r.entrada) <= end);
    }

    setFiltered(data);
  }

  useEffect(() => {
    applyFilters();
  }, [filters, registros]);

  // 🔹 Guardar cambios (editar)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateRegistroAcceso(formData.id, {
        codigoUsuario: formData.codigoUsuario,
        modoAccesoId: Number(formData.modoAccesoId),
        entrada: new Date(formData.entrada),
        salida: new Date(formData.salida),
      });

      setShowModal(false);
      setEditMode(false);
      setFormData({ id: 0, codigoUsuario: '', modoAccesoId: '', entrada: '', salida: '' });
      await fetchAll();
    } catch (err: any) {
      console.error('Error al actualizar registro de acceso:', err?.response?.data || err.message);
      alert('Error al actualizar registro.');
    }
  }

  // 🔹 Editar registro
  function handleEdit(registro: any) {
    setFormData({
      id: registro.id,
      codigoUsuario: registro.codigoUsuario,
      modoAccesoId: registro.modoAccesoId,
      entrada: registro.entrada ? registro.entrada.substring(0, 16) : '',
      salida: registro.salida ? registro.salida.substring(0, 16) : '',
    });
    setEditMode(true);
    setShowModal(true);
  }

  // 🔹 Eliminar registro
  async function handleDelete(id: number) {
    if (confirm('¿Seguro que deseas eliminar este registro de acceso?')) {
      await deleteRegistroAcceso(id);
      await fetchAll();
    }
  }

  return (
    <div className="container">

      {/* TÍTULO */}
      <h2 className="text-2xl font-bold mb-4">Registros de Acceso</h2>

      {/* 📌 FILTROS */}
      {/*<div className="p-4 mb-6 rounded-xl border bg-gray-50">
  <h3 className="font-semibold mb-3 flex items-center gap-2">
    <Search size={18} /> Filtros
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

    <div>
      <label className="label">Código Usuario</label>
      <input
        type="text"
        className="input"
        value={filters.codigoUsuario}
        onChange={e => setFilters({ ...filters, codigoUsuario: e.target.value })}
      />
    </div>

    <div>
      <label className="label">Fecha Inicio</label>
      <input
        type="date"
        className="input"
        value={filters.fechaInicio}
        onChange={e => setFilters({ ...filters, fechaInicio: e.target.value })}
      />
    </div>

    <div>
      <label className="label">Fecha Fin</label>
      <input
        type="date"
        className="input"
        value={filters.fechaFin}
        onChange={e => setFilters({ ...filters, fechaFin: e.target.value })}
      />
    </div>

  </div>
    </div> */}
      
      {/* TABLA */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Código Usuario</th>
              <th>Modo Acceso</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.codigoUsuario}</td>
                <td>{r.accessMode?.name || r.modoAccesoId}</td>
                <td>{new Date(r.entrada).toLocaleString()}</td>
                <td>{new Date(r.salida).toLocaleString()}</td>
                <td>
                  <div className="table-actions">
                    <button
                      onClick={() => handleEdit(r)}
                      className="btn btn-warning"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="btn btn-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No se encontraron registros con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL EDICIÓN */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="font-bold text-lg mb-4">
              Editar Registro de Acceso
            </h3>

            <form onSubmit={handleSubmit}>

              <div className="form-control mb-3">
                <label className="label">Código Usuario</label>
                <input
                  type="text"
                  className="input"
                  value={formData.codigoUsuario}
                  onChange={(e) => setFormData({ ...formData, codigoUsuario: e.target.value })}
                  required
                />
              </div>

              <div className="form-control mb-3">
                <label className="label">Modo Acceso ID</label>
                <input
                  type="number"
                  className="input"
                  value={formData.modoAccesoId}
                  onChange={(e) => setFormData({ ...formData, modoAccesoId: e.target.value })}
                  required
                />
              </div>

              <div className="form-control mb-3">
                <label className="label">Entrada</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.entrada}
                  onChange={(e) => setFormData({ ...formData, entrada: e.target.value })}
                />
              </div>

              <div className="form-control mb-3">
                <label className="label">Salida</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.salida}
                  onChange={(e) => setFormData({ ...formData, salida: e.target.value })}
                />
              </div>

              <div className="table-actions">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Actualizar
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
