'use client';

import { yaTieneNotificacionError } from '@/lib/ya-tiene-notificacion-error';
import { useEffect, useState } from 'react';
import FiltroRegistroAcceso from '@/components/FiltroRegistroAcceso';
import {
  getRegistrosAcceso,
  updateRegistroAcceso,
  deleteRegistroAcceso,
  getTiposIngreso,
} from '@/services/api';
import { Pencil, Trash2 } from 'lucide-react';
import { usePaginacion } from '@/lib/use-paginacion';
import PaginacionTabla from '@/components/PaginacionTabla';
import ResponsiveTable, { type ColumnaResponsive } from '@/components/ResponsiveTable';

type FormState = {
  id: number;
  codigoUsuario: string;
  tipoIngresoEntradaId: string;
  tipoIngresoSalidaId: string;
  entrada: string;
  salida: string;
};

type RegistroAcceso = {
  id: number;
  codigoUsuario: string;
  entrada: string;
  salida: string;
  tipoIngresoEntrada?: { nombre?: string };
  tipoIngresoSalida?: { nombre?: string };
  dispositivoEntrada?: { nombre?: string };
  dispositivoSalida?: { nombre?: string };
};

const vacioForm: FormState = {
  id: 0,
  codigoUsuario: '',
  tipoIngresoEntradaId: '',
  tipoIngresoSalidaId: '',
  entrada: '',
  salida: '',
};

export default function RegistroAccesoList() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [tiposIngreso, setTiposIngreso] = useState<any[]>([]);

  const [formData, setFormData] = useState<FormState>({ ...vacioForm });

  const [filters, setFilters] = useState({
    codigoUsuario: '',
    fechaInicio: '',
    fechaFin: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const paginacion = usePaginacion(filtered);

  useEffect(() => {
    paginacion.irAPagina(1);
  }, [filters.codigoUsuario, filters.fechaInicio, filters.fechaFin, paginacion.irAPagina]);

  async function fetchAll() {
    try {
      const [resReg, resTipos] = await Promise.all([
        getRegistrosAcceso(),
        getTiposIngreso(),
      ]);
      setRegistros(resReg.data || []);
      setFiltered(resReg.data || []);
      setTiposIngreso(resTipos.data || []);
    } catch (error) {
      console.error('Error al obtener registros de acceso:', error);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function applyFilters() {
    let data = [...registros];

    if (filters.codigoUsuario.trim() !== '') {
      data = data.filter((r) =>
        r.codigoUsuario.toLowerCase().includes(filters.codigoUsuario.toLowerCase()),
      );
    }

    if (filters.fechaInicio !== '') {
      const start = new Date(filters.fechaInicio);
      data = data.filter((r) => new Date(r.entrada) >= start);
    }

    if (filters.fechaFin !== '') {
      const end = new Date(filters.fechaFin);
      data = data.filter((r) => new Date(r.entrada) <= end);
    }

    setFiltered(data);
  }

  useEffect(() => {
    applyFilters();
  }, [filters, registros]);

  function opcionTipo(valor: string, onChange: (v: string) => void) {
    return (
      <select className="input" value={valor} onChange={(e) => onChange(e.target.value)}>
        <option value="">(sin asignar)</option>
        {tiposIngreso.map((t) => (
          <option key={t.id} value={String(t.id)}>
            {t.nombre}
          </option>
        ))}
      </select>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload: Record<string, unknown> = {
        codigoUsuario: formData.codigoUsuario,
        entrada: new Date(formData.entrada),
        salida: new Date(formData.salida),
        tipoIngresoEntradaId:
          formData.tipoIngresoEntradaId === ''
            ? null
            : Number(formData.tipoIngresoEntradaId),
        tipoIngresoSalidaId:
          formData.tipoIngresoSalidaId === ''
            ? null
            : Number(formData.tipoIngresoSalidaId),
      };

      await updateRegistroAcceso(formData.id, payload);

      setShowModal(false);
      setEditMode(false);
      setFormData({ ...vacioForm });
      await fetchAll();
    } catch (err: any) {
      console.error('Error al actualizar registro de acceso:', err?.response?.data || err.message);
      if (!yaTieneNotificacionError(err)) alert('Error al actualizar registro.');
    }
  }

  function handleEdit(registro: any) {
    setFormData({
      id: registro.id,
      codigoUsuario: registro.codigoUsuario,
      tipoIngresoEntradaId:
        registro.tipoIngresoEntradaId != null ? String(registro.tipoIngresoEntradaId) : '',
      tipoIngresoSalidaId:
        registro.tipoIngresoSalidaId != null ? String(registro.tipoIngresoSalidaId) : '',
      entrada: registro.entrada ? registro.entrada.substring(0, 16) : '',
      salida: registro.salida ? registro.salida.substring(0, 16) : '',
    });
    setEditMode(true);
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (confirm('¿Seguro que deseas eliminar este registro de acceso?')) {
      await deleteRegistroAcceso(id);
      await fetchAll();
    }
  }

  const columnas: ColumnaResponsive<RegistroAcceso>[] = [
    { key: 'id', header: 'No' },
    { key: 'codigoUsuario', header: 'Código Usuario' },
    {
      key: 'tipoIngresoEntrada',
      header: 'Tipo ingreso (entrada)',
      render: (r) => r.tipoIngresoEntrada?.nombre ?? '—',
    },
    {
      key: 'dispositivoEntrada',
      header: 'Torniquete (entrada)',
      render: (r) => r.dispositivoEntrada?.nombre ?? '—',
    },
    {
      key: 'entrada',
      header: 'Entrada',
      render: (r) => new Date(r.entrada).toLocaleString(),
    },
    {
      key: 'tipoIngresoSalida',
      header: 'Tipo ingreso (salida)',
      render: (r) => r.tipoIngresoSalida?.nombre ?? '—',
    },
    {
      key: 'dispositivoSalida',
      header: 'Torniquete (salida)',
      render: (r) => r.dispositivoSalida?.nombre ?? '—',
    },
    {
      key: 'salida',
      header: 'Salida',
      render: (r) => new Date(r.salida).toLocaleString(),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      apilarEnTarjeta: true,
      render: (r) => (
        <div className="table-actions">
          <button onClick={() => handleEdit(r)} className="btn btn-warning" type="button">
            <Pencil size={16} />
          </button>
          <button onClick={() => handleDelete(r.id)} className="btn btn-danger" type="button">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <h2 className="page-heading">Registros de Acceso</h2>

      <FiltroRegistroAcceso filtros={filters} onChange={setFilters} />

      <ResponsiveTable
        columnas={columnas}
        filas={paginacion.filasPagina as RegistroAcceso[]}
        mensajeVacio={
          filtered.length === 0
            ? 'No se encontraron registros con los filtros aplicados.'
            : undefined
        }
      />
      <PaginacionTabla paginacion={paginacion} />

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="font-bold text-lg mb-4">Editar Registro de Acceso</h3>

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
                <label className="label">Tipo de ingreso (entrada)</label>
                {opcionTipo(formData.tipoIngresoEntradaId, (v) =>
                  setFormData({ ...formData, tipoIngresoEntradaId: v }),
                )}
              </div>

              <div className="form-control mb-3">
                <label className="label">Tipo de ingreso (salida)</label>
                {opcionTipo(formData.tipoIngresoSalidaId, (v) =>
                  setFormData({ ...formData, tipoIngresoSalidaId: v }),
                )}
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
