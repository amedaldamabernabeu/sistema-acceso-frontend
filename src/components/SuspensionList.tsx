'use client';
import { useEffect, useState } from 'react';
import {
  getSuspensiones,
  createSuspension,
  updateSuspension,
  deleteSuspension,
  buscarUsuarios, // 👈 nuevo servicio
} from '../services/api';
import { Pencil, Trash2 } from 'lucide-react';

export default function SuspensionList() {
  const [suspensiones, setSuspensiones] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');

  const [formData, setFormData] = useState({
    id: 0,
    codigo: '',
    motivo: '',
    fechaInicio: '',
    fechaFin: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function fetchAll() {
    const res = await getSuspensiones();
    setSuspensiones(res.data || []);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  // ==========================
  // 🔍 Buscar usuarios externos
  // ==========================
  async function handleBuscarUsuario(nombre: string) {
    setBusqueda(nombre);

    if (nombre.trim().length < 2) {
      setUsuarios([]);
      return;
    }

    const res = await buscarUsuarios(nombre);
    setUsuarios(res.data || []);
  }

  // ==========================
  // Seleccionar usuario
  // ==========================
  function seleccionarUsuario(u: any) {
    setFormData({ ...formData, codigo: u.codigo ?? u.usuario });
    setBusqueda(`${u.nombre}`);
    setUsuarios([]);
  }

  // ==========================
  // Guardar o actualizar
  // ==========================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editMode) {
        await updateSuspension(formData.id, {
          codigo: formData.codigo,
          motivo: formData.motivo,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin,
        });
      } else {
        await createSuspension({
          codigo: formData.codigo,
          motivo: formData.motivo,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin,
        });
      }

      setShowModal(false);
      setEditMode(false);
      setFormData({
        id: 0,
        codigo: '',
        motivo: '',
        fechaInicio: '',
        fechaFin: '',
      });

      await fetchAll();
    } catch (err: any) {
      console.error(err);
      alert('Error al guardar la suspensión');
    }
  }

  // ==========================
  // Editar
  // ==========================
  function handleEdit(s: any) {
    setFormData({
      id: s.id,
      codigo: s.codigo,
      motivo: s.motivo,
      fechaInicio: s.fechaInicio.substring(0, 10),
      fechaFin: s.fechaFin.substring(0, 10),
    });
    setEditMode(true);
    setShowModal(true);
  }

  // ==========================
  // Eliminar
  // ==========================
  async function handleDelete(id: number) {
    if (confirm('¿Eliminar esta suspensión?')) {
      await deleteSuspension(id);
      await fetchAll();
    }
  }

  return (
    <div className="container">
      <h2 className="text-2xl font-bold mb-4">Gestión de Suspensiones</h2>

      <div className="flex justify-end mb-6 mr-10">
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          Crear Suspensión
        </button>
      </div>
      <br></br>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Código</th>
              <th>Motivo</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {suspensiones.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.codigo}</td>
                <td>{s.motivo}</td>
                <td>{s.fechaInicio.substring(0, 10)}</td>
                <td>{s.fechaFin.substring(0, 10)}</td>
                <td>
                  <div className="table-actions">
                      <button className="btn btn-warning" onClick={() => handleEdit(s)}>
                            <Pencil size={16} />
                       </button>
                       <button className="btn btn-danger" onClick={() => handleDelete(s.id)}>
                           <Trash2 size={16} />
                        </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========================================= */}
      {/* MODAL */}
      {/* ========================================= */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">

            <h3 className="font-bold text-lg mb-4">
              {editMode ? 'Editar Suspensión' : 'Crear Suspensión'}
            </h3>

            <form onSubmit={handleSubmit}>

              {/* Buscador de usuarios */}
              <div className="form-control mb-3">
                <label>Buscar usuario</label>
                <input
                  type="text"
                  className="input"
                  value={busqueda}
                  onChange={(e) => handleBuscarUsuario(e.target.value)}
                />

                {/* Dropdown resultados */}
                {usuarios.length > 0 && (
                  <ul className="dropdown-list">
                    {usuarios.map((u, idx) => (
                      <li
                        key={idx}
                        onClick={() => seleccionarUsuario(u)}
                        className="dropdown-item"
                      >
                        {u.codigo ?? u.usuario} — {u.nombre}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <br></br>
              {/* Código seleccionado */}
              <div className="form-control mb-2">
                <label>Código</label>
                <input
                  type="text"
                  className="input"
                  value={formData.codigo}
                  readOnly
                />
              </div>
              <br></br>
              <div className="form-control mb-2">
                <label>Motivo</label>
                <input
                  type="text"
                  className="input"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                />
              </div>
              <br></br>
              <div className="form-control mb-2">
                <label>Fecha inicio</label>
                <input
                  type="date"
                  className="input"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                />
              </div>
              <br></br>
              <div className="form-control mb-4">
                <label>Fecha fin</label>
                <input
                  type="date"
                  className="input"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
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
