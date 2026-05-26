'use client';

import { yaTieneNotificacionError } from '@/lib/ya-tiene-notificacion-error';
import { mostrarNotificacion } from '@/lib/notificaciones';
import {
  eventoDuplicado,
  fechaHoraEventoNoPasada,
  minDatetimeLocalAhora,
  normalizarNombreEvento,
  normalizarUbicacionEvento,
} from '@/lib/evento-validaciones';
import { useEffect, useMemo, useState } from 'react';
import { filtrarPorTexto } from '@/lib/filtrar-por-texto';
import FiltroTabla from '@/components/FiltroTabla';
import {
  getEventos,
  createEvento,
  updateEvento,
  deleteEvento,
} from '../services/api';
import { Pencil, Trash2 } from 'lucide-react';
import { usePaginacion } from '@/lib/use-paginacion';
import PaginacionTabla from '@/components/PaginacionTabla';
import ResponsiveTable, { type ColumnaResponsive } from '@/components/ResponsiveTable';

type Evento = { id: number; nombre: string; fechaHora: string; ubicacion: string };

export default function EventoList() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const eventosFiltrados = useMemo(
    () =>
      filtrarPorTexto(eventos, busquedaTabla, (e) =>
        [e.nombre, e.ubicacion, e.fechaHora].join(' '),
      ),
    [eventos, busquedaTabla],
  );
  const paginacion = usePaginacion(eventosFiltrados);

  useEffect(() => {
    paginacion.irAPagina(1);
  }, [busquedaTabla, paginacion.irAPagina]);

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
      if (!yaTieneNotificacionError(err)) alert('Error al cargar los eventos.');
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      nombre: normalizarNombreEvento(formData.nombre),
      fechaHora: formData.fechaHora,
      ubicacion: normalizarUbicacionEvento(formData.ubicacion),
    };

    if (!fechaHoraEventoNoPasada(payload.fechaHora)) {
      mostrarNotificacion({
        tipo: 'error',
        mensaje:
          'La fecha y hora del evento debe ser igual o posterior al momento actual.',
      });
      return;
    }
    if (
      eventoDuplicado(eventos, payload, editMode ? formData.id : 0)
    ) {
      mostrarNotificacion({
        tipo: 'error',
        mensaje:
          'Ya existe un evento con el mismo nombre, fecha, hora y ubicación.',
      });
      return;
    }

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
    } catch (err: unknown) {
      console.error(err);
      if (!yaTieneNotificacionError(err)) alert('Error al guardar evento.');
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
        if (!yaTieneNotificacionError(err)) alert('Error al eliminar evento.');
      }
    }
  }

  const columnas: ColumnaResponsive<Evento>[] = [
    { key: 'id', header: 'No' },
    { key: 'nombre', header: 'Nombre' },
    {
      key: 'fechaHora',
      header: 'Fecha y Hora',
      render: (e) => new Date(e.fechaHora).toLocaleString(),
    },
    { key: 'ubicacion', header: 'Ubicación' },
    {
      key: 'acciones',
      header: 'Acciones',
      apilarEnTarjeta: true,
      render: (e) => (
        <div className="table-actions">
          <button className="btn btn-warning" onClick={() => handleEdit(e)} type="button">
            <Pencil size={16} />
          </button>
          <button className="btn btn-danger" onClick={() => handleDelete(e.id)} type="button">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <h2 className="page-heading">Gestión de Eventos</h2>

      <div className="panel-toolbar">
        <button
          onClick={() => {
            setEditMode(false);
            setFormData({ id: 0, nombre: '', fechaHora: '', ubicacion: '' });
            setShowModal(true);
          }}
          className="btn btn-primary"
          type="button"
        >
          Crear Evento
        </button>
      </div>
      <FiltroTabla
        valor={busquedaTabla}
        onChange={setBusquedaTabla}
        placeholder="Buscar por nombre, ubicación o fecha…"
      />
      <ResponsiveTable
        columnas={columnas}
        filas={paginacion.filasPagina as Evento[]}
        mensajeVacio={
          eventos.length > 0 && eventosFiltrados.length === 0
            ? 'Sin resultados para la búsqueda.'
            : undefined
        }
      />
      <PaginacionTabla paginacion={paginacion} />

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
                  min={editMode ? undefined : minDatetimeLocalAhora()}
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
