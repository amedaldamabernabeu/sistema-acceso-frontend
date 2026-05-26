'use client';

import { yaTieneNotificacionError } from '@/lib/ya-tiene-notificacion-error';
import { mostrarNotificacion } from '@/lib/notificaciones';
import {
  etiquetaEventoNota,
  etiquetaRegistroAccesoNota,
  eventosParaRegistroAcceso,
  type EventoParaNota,
  type RegistroParaNota,
} from '@/lib/nota-evento-registro';
import { useEffect, useMemo, useState } from 'react';
import { filtrarPorTexto } from '@/lib/filtrar-por-texto';
import FiltroTabla from '@/components/FiltroTabla';
import {
  getNotas,
  createNota,
  updateNota,
  deleteNota,
  getRegistrosAcceso,
  getEventos,
} from '../services/api';

import { Pencil, Trash2 } from 'lucide-react';
import { usePaginacion } from '@/lib/use-paginacion';
import PaginacionTabla from '@/components/PaginacionTabla';
import ResponsiveTable, { type ColumnaResponsive } from '@/components/ResponsiveTable';

type Nota = {
  id: number;
  asunto: string;
  registroAcceso?: { codigoUsuario?: string };
  evento?: { nombre?: string };
};

export default function NotasList() {
  const [notas, setNotas] = useState<any[]>([]);
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const notasFiltradas = useMemo(
    () =>
      filtrarPorTexto(notas, busquedaTabla, (n) =>
        [n.asunto, n.registroAcceso?.codigoUsuario, n.evento?.nombre].join(' '),
      ),
    [notas, busquedaTabla],
  );
  const paginacion = usePaginacion(notasFiltradas);

  useEffect(() => {
    paginacion.irAPagina(1);
  }, [busquedaTabla, paginacion.irAPagina]);
  const [registros, setRegistros] = useState<RegistroParaNota[]>([]);
  const [eventos, setEventos] = useState<EventoParaNota[]>([]);

  const [formData, setFormData] = useState({
    id: 0,
    asunto: '',
    registros_id: '' as number | '',
    eventos_id: '' as number | '',
  });

  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const registroSeleccionado = useMemo(
    () =>
      formData.registros_id === ''
        ? null
        : registros.find((r) => r.id === formData.registros_id) ?? null,
    [formData.registros_id, registros],
  );

  const eventosFiltrados = useMemo(
    () => eventosParaRegistroAcceso(eventos, registroSeleccionado),
    [eventos, registroSeleccionado],
  );

  const eventosEnSelector = useMemo(() => {
    if (formData.eventos_id === '') return eventosFiltrados;
    const id = Number(formData.eventos_id);
    if (eventosFiltrados.some((e) => e.id === id)) return eventosFiltrados;
    const actual = eventos.find((e) => e.id === id);
    return actual ? [...eventosFiltrados, actual] : eventosFiltrados;
  }, [eventos, eventosFiltrados, formData.eventos_id]);

  async function fetchAll() {
    try {
      const resNotas = await getNotas();
      setNotas(resNotas.data || []);

      const resReg = await getRegistrosAcceso();
      setRegistros(resReg.data || []);

      const resEventos = await getEventos();
      setEventos(resEventos.data || []);
    } catch (err: unknown) {
      console.error(err);
      if (!yaTieneNotificacionError(err)) alert('Error al cargar los datos.');
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function onCambioRegistro(registroId: string) {
    const id = registroId === '' ? '' : Number(registroId);
    setFormData({
      ...formData,
      registros_id: id,
      eventos_id: '',
    });
  }

  function abrirModalCrear() {
    setEditMode(false);
    setFormData({
      id: 0,
      asunto: '',
      registros_id: '',
      eventos_id: '',
    });
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.registros_id === '') {
      mostrarNotificacion({
        tipo: 'error',
        mensaje: 'Seleccione primero el registro de acceso.',
      });
      return;
    }
    const payload = {
      asunto: formData.asunto,
      registroAccesoId: Number(formData.registros_id),
      eventoId:
        formData.eventos_id === '' ? null : Number(formData.eventos_id),
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
        registros_id: '',
        eventos_id: '',
      });

      await fetchAll();
    } catch (err: unknown) {
      console.error(err);
      if (!yaTieneNotificacionError(err)) alert('Error al guardar la nota.');
    }
  }

  function handleEdit(nota: any) {
    setFormData({
      id: nota.id,
      asunto: nota.asunto ?? '',
      registros_id: nota.registroAccesoId ?? '',
      eventos_id: nota.eventoId ?? '',
    });

    setEditMode(true);
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (confirm('¿Eliminar esta nota?')) {
      try {
        await deleteNota(id);
        await fetchAll();
      } catch (err: unknown) {
        console.error(err);
        if (!yaTieneNotificacionError(err)) alert('Error al eliminar la nota.');
      }
    }
  }

  const columnas: ColumnaResponsive<Nota>[] = [
    { key: 'id', header: 'No' },
    { key: 'asunto', header: 'Asunto' },
    {
      key: 'registro',
      header: 'Registro',
      render: (n) => n.registroAcceso?.codigoUsuario ?? '—',
    },
    {
      key: 'evento',
      header: 'Evento',
      render: (n) => n.evento?.nombre ?? '—',
    },
    {
      key: 'acciones',
      header: 'Acciones',
      apilarEnTarjeta: true,
      render: (n) => (
        <div className="table-actions">
          <button className="btn btn-warning" onClick={() => handleEdit(n)} type="button">
            <Pencil size={16} />
          </button>
          <button className="btn btn-danger" onClick={() => handleDelete(n.id)} type="button">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const eventoHabilitado = formData.registros_id !== '';

  return (
    <div className="container">
      <h2 className="page-heading">Gestión de Notas</h2>

      <div className="panel-toolbar">
        <button className="btn btn-primary" onClick={abrirModalCrear} type="button">
          Crear Nota
        </button>
      </div>
      <FiltroTabla
        valor={busquedaTabla}
        onChange={setBusquedaTabla}
        placeholder="Buscar por asunto, registro o evento…"
      />
      <ResponsiveTable
        columnas={columnas}
        filas={paginacion.filasPagina as Nota[]}
        mensajeVacio={
          notas.length > 0 && notasFiltradas.length === 0
            ? 'Sin resultados para la búsqueda.'
            : undefined
        }
      />
      <PaginacionTabla paginacion={paginacion} />

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="font-bold text-lg mb-4">
              {editMode ? 'Editar Nota' : 'Crear Nota'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">Registro de acceso</label>
                <select
                  className="input"
                  value={formData.registros_id === '' ? '' : String(formData.registros_id)}
                  onChange={(e) => onCambioRegistro(e.target.value)}
                  required
                >
                  <option value="">Seleccione un registro</option>
                  {registros.map((r) => (
                    <option key={r.id} value={r.id}>
                      {etiquetaRegistroAccesoNota(r)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control mb-4">
                <label className="label">Evento (opcional)</label>
                <select
                  className="input"
                  value={formData.eventos_id === '' ? '' : String(formData.eventos_id)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      eventos_id: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  disabled={!eventoHabilitado}
                >
                  <option value="">
                    {!eventoHabilitado
                      ? 'Primero seleccione un registro'
                      : 'Sin evento (opcional)'}
                  </option>
                  {eventosEnSelector.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {etiquetaEventoNota(ev)}
                    </option>
                  ))}
                </select>
                {eventoHabilitado && eventosFiltrados.length === 0 && (
                  <p className="small text-muted" style={{ marginTop: 8 }}>
                    No hay eventos del mismo día con hora igual o posterior a la entrada del
                    registro. Puede guardar la nota sin asociar evento.
                  </p>
                )}
              </div>

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

              <div className="table-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formData.registros_id === '' || !formData.asunto.trim()}
                >
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
