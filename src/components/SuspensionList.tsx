'use client';
import { yaTieneNotificacionError } from '@/lib/ya-tiene-notificacion-error';
import { mostrarNotificacion } from '@/lib/notificaciones';
import {
  fechasSuspensionValidas,
  filtrarTextoSoloNombre,
  PATRON_NOMBRE_BUSQUEDA_HTML,
  usuarioTieneSuspensionActivaPendiente,
} from '@/lib/suspension-validaciones';
import { useEffect, useMemo, useState } from 'react';
import { filtrarPorTexto } from '@/lib/filtrar-por-texto';
import FiltroTabla from '@/components/FiltroTabla';
import {
  getSuspensiones,
  createSuspension,
  updateSuspension,
  deleteSuspension,
  buscarUsuarios, // 👈 nuevo servicio
} from '../services/api';
import { Pencil, Trash2 } from 'lucide-react';
import { usePaginacion } from '@/lib/use-paginacion';
import PaginacionTabla from '@/components/PaginacionTabla';
import ResponsiveTable, { type ColumnaResponsive } from '@/components/ResponsiveTable';

type Suspension = {
  id: number;
  codigo: string;
  motivo: string;
  fechaInicio: string;
  fechaFin: string;
};

export default function SuspensionList() {
  const [suspensiones, setSuspensiones] = useState<any[]>([]);
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const suspensionesFiltradas = useMemo(
    () =>
      filtrarPorTexto(suspensiones, busquedaTabla, (s) =>
        [
          s.codigo,
          s.motivo,
          s.fechaInicio,
          s.fechaFin,
          s.activa === false ? 'inactiva' : 'activa',
        ].join(' '),
      ),
    [suspensiones, busquedaTabla],
  );
  const paginacion = usePaginacion(suspensionesFiltradas);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    paginacion.irAPagina(1);
  }, [busquedaTabla, paginacion.irAPagina]);

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
  async function handleBuscarUsuario(valorCrudo: string) {
    const nombre = filtrarTextoSoloNombre(valorCrudo);
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
    setFormData({
      ...formData,
      codigo: String(u.codigo ?? u.usuario ?? '').trim(),
    });
    setBusqueda(`${u.nombre}`);
    setUsuarios([]);
  }

  // ==========================
  // Guardar o actualizar
  // ==========================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const codigo = String(formData.codigo ?? '').trim();
    if (!codigo) {
      mostrarNotificacion({
        tipo: 'error',
        mensaje: 'Seleccione un usuario de la lista para asignar el código.',
      });
      return;
    }

    if (!fechasSuspensionValidas(formData.fechaInicio, formData.fechaFin)) {
      mostrarNotificacion({
        tipo: 'error',
        mensaje: 'La fecha de inicio debe ser anterior a la fecha de fin.',
      });
      return;
    }

    if (
      usuarioTieneSuspensionActivaPendiente(
        suspensiones,
        codigo,
        editMode ? formData.id : undefined,
      )
    ) {
      mostrarNotificacion({
        tipo: 'error',
        mensaje:
          'El usuario ya tiene una suspensión activa. No se puede registrar otra hasta que finalice la vigente.',
      });
      return;
    }

    try {
      if (editMode) {
        await updateSuspension(formData.id, {
          codigo,
          motivo: formData.motivo,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin,
        });
      } else {
        await createSuspension({
          codigo,
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
      if (!yaTieneNotificacionError(err)) alert('Error al guardar la suspensión');
    }
  }

  // ==========================
  // Editar
  // ==========================
  function handleEdit(s: any) {
    setFormData({
      id: s.id,
      codigo: String(s.codigo ?? '').trim(),
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

  const columnas: ColumnaResponsive<Suspension>[] = [
    { key: 'id', header: 'No' },
    { key: 'codigo', header: 'Código' },
    { key: 'motivo', header: 'Motivo' },
    {
      key: 'fechaInicio',
      header: 'Inicio',
      render: (s) => s.fechaInicio.substring(0, 10),
    },
    {
      key: 'fechaFin',
      header: 'Fin',
      render: (s) => s.fechaFin.substring(0, 10),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      apilarEnTarjeta: true,
      render: (s) => (
        <div className="table-actions">
          <button className="btn btn-warning" onClick={() => handleEdit(s)} type="button">
            <Pencil size={16} />
          </button>
          <button className="btn btn-danger" onClick={() => handleDelete(s.id)} type="button">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <h2 className="page-heading">Gestión de Suspensiones</h2>

      <div className="panel-toolbar">
        <button onClick={() => setShowModal(true)} className="btn btn-primary" type="button">
          Crear Suspensión
        </button>
      </div>
      <FiltroTabla
        valor={busquedaTabla}
        onChange={setBusquedaTabla}
        placeholder="Buscar por código, motivo o fechas…"
      />
      <ResponsiveTable
        columnas={columnas}
        filas={paginacion.filasPagina as Suspension[]}
        mensajeVacio={
          suspensiones.length > 0 && suspensionesFiltradas.length === 0
            ? 'Sin resultados para la búsqueda.'
            : undefined
        }
      />
      <PaginacionTabla paginacion={paginacion} />

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
                  pattern={PATRON_NOMBRE_BUSQUEDA_HTML}
                  title="Solo letras y espacios"
                  autoComplete="off"
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
                  min={formData.fechaInicio || undefined}
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
