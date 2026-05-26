'use client';

import { yaTieneNotificacionError } from '@/lib/ya-tiene-notificacion-error';
import { mostrarNotificacion } from '@/lib/notificaciones';
import {
  filtrarTextoSoloNombre,
  nombreTipoIngresoDuplicado,
  nombreTipoIngresoFormatoValido,
  normalizarNombreTipoIngreso,
} from '@/lib/tipo-ingreso-validaciones';
import { PATRON_NOMBRE_HTML } from '@/lib/suspension-validaciones';
import { useEffect, useMemo, useState } from 'react';
import { filtrarPorTexto } from '@/lib/filtrar-por-texto';
import FiltroTabla from '@/components/FiltroTabla';
import {
  getTiposIngreso,
  createTipoIngreso,
  updateTipoIngreso,
  deleteTipoIngreso,
} from '../services/api';
import { Pencil, Trash2 } from 'lucide-react';
import { usePaginacion } from '@/lib/use-paginacion';
import PaginacionTabla from '@/components/PaginacionTabla';
import ResponsiveTable, { type ColumnaResponsive } from '@/components/ResponsiveTable';

type TipoIngreso = { id: number; nombre: string };

export default function TiposIngresoList() {
  const [tipos, setTipos] = useState<TipoIngreso[]>([]);
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const tiposFiltrados = useMemo(
    () => filtrarPorTexto(tipos, busquedaTabla, (t) => t.nombre),
    [tipos, busquedaTabla],
  );
  const paginacion = usePaginacion(tiposFiltrados);

  useEffect(() => {
    paginacion.irAPagina(1);
  }, [busquedaTabla, paginacion.irAPagina]);
  const [formData, setFormData] = useState({ id: 0, nombre: '' });
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function fetchAll() {
    try {
      const res = await getTiposIngreso();
      setTipos(res.data || []);
    } catch (err: unknown) {
      console.error(err);
      if (!yaTieneNotificacionError(err)) alert('Error al cargar tipos de ingreso.');
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
    } catch (err: unknown) {
      console.error(err);
      if (!yaTieneNotificacionError(err)) alert('Error al guardar tipo de ingreso.');
    }
  }

  function handleEdit(item: TipoIngreso) {
    setFormData({ id: item.id, nombre: item.nombre });
    setEditMode(true);
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este tipo de ingreso?')) return;
    try {
      await deleteTipoIngreso(id);
      await fetchAll();
    } catch (err: unknown) {
      console.error(err);
      if (!yaTieneNotificacionError(err)) alert('Error al eliminar tipo de ingreso.');
    }
  }

  const columnas: ColumnaResponsive<TipoIngreso>[] = [
    { key: 'id', header: 'No' },
    { key: 'nombre', header: 'Nombre' },
    {
      key: 'acciones',
      header: 'Acciones',
      apilarEnTarjeta: true,
      render: (t) => (
        <div className="table-actions">
          <button onClick={() => handleEdit(t)} className="btn btn-warning" title="Editar" type="button">
            <Pencil size={16} />
          </button>
          <button onClick={() => handleDelete(t.id)} className="btn btn-danger" title="Eliminar" type="button">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <h2 className="page-heading">Tipos de Ingreso</h2>
      <div className="panel-toolbar">
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-1" type="button">
          Crear Tipo
        </button>
      </div>
      <FiltroTabla
        valor={busquedaTabla}
        onChange={setBusquedaTabla}
        placeholder="Buscar por nombre…"
      />
      <ResponsiveTable
        columnas={columnas}
        filas={paginacion.filasPagina}
        mensajeVacio={
          tipos.length > 0 && tiposFiltrados.length === 0
            ? 'Sin resultados para la búsqueda.'
            : undefined
        }
      />
      <PaginacionTabla paginacion={paginacion} />
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre: filtrarTextoSoloNombre(e.target.value),
                    })
                  }
                  pattern={PATRON_NOMBRE_HTML}
                  title="Solo letras y espacios (mínimo 2 caracteres)"
                  minLength={2}
                  required
                />
              </div>
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
