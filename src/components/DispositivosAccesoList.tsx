'use client';

import { yaTieneNotificacionError } from '@/lib/ya-tiene-notificacion-error';
import { mostrarNotificacion } from '@/lib/notificaciones';
import {
  filtrarTextoNombreDispositivo,
  nombreDispositivoDuplicado,
  nombreDispositivoFormatoValido,
  normalizarNombreDispositivo,
} from '@/lib/dispositivo-acceso-validaciones';
import { PATRON_NOMBRE_ALFANUMERICO_HTML } from '@/lib/suspension-validaciones';
import { useEffect, useMemo, useState } from 'react';
import { filtrarPorTexto } from '@/lib/filtrar-por-texto';
import FiltroTabla from '@/components/FiltroTabla';
import {
  getDispositivos,
  createDispositivo,
  updateDispositivo,
  deleteDispositivo,
  getTiposIngreso,
} from '../services/api';
import { Pencil, Trash2, Copy } from 'lucide-react';
import { usePaginacion } from '@/lib/use-paginacion';
import PaginacionTabla from '@/components/PaginacionTabla';
import ResponsiveTable, { type ColumnaResponsive } from '@/components/ResponsiveTable';

type DispositivoAcceso = {
  id: number;
  nombre: string;
  tokenAcceso?: string;
  activo?: boolean;
  tiposIngreso?: { tipoIngreso?: { nombre?: string }; tipoIngresoId?: number }[];
};

function renderCeldaTokenAcceso(
  d: DispositivoAcceso,
  tokenCopiadoId: number | null,
  copiarTokenAcceso: (token: string | undefined, idDispositivo: number) => void,
) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      <input
        type="text"
        readOnly
        className="input"
        value={String(d.tokenAcceso ?? '')}
        title="Token para el dispositivo"
        onFocus={(e) => e.currentTarget.select()}
        style={{
          flex: '1 1 180px',
          minWidth: 120,
          fontFamily: 'ui-monospace, monospace',
          fontSize: 12,
          wordBreak: 'break-all',
        }}
      />
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        title="Copiar token"
        aria-label="Copiar token de acceso"
        onClick={() => void copiarTokenAcceso(d.tokenAcceso, d.id)}
      >
        <Copy size={16} />
      </button>
      {tokenCopiadoId === d.id && (
        <span className="small" style={{ color: '#15803d', fontWeight: 600 }}>
          Copiado
        </span>
      )}
    </div>
  );
}

function nombresTiposDesdeApi(item: {
  tiposIngreso?: { tipoIngreso?: { nombre?: string } }[];
}): string {
  const lista = item.tiposIngreso ?? [];
  if (lista.length === 0) return '—';
  return lista.map((t) => t.tipoIngreso?.nombre ?? '').filter(Boolean).join(', ');
}

export default function DispositivoAccesoList() {
  const [dispositivos, setDispositivos] = useState<any[]>([]);
  const [tiposIngreso, setTiposIngreso] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id: 0,
    nombre: '',
    tipoIngresoIds: [] as number[],
    activo: true,
  });

  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const dispositivosFiltrados = useMemo(
    () =>
      filtrarPorTexto(dispositivos, busquedaTabla, (d) =>
        [
          d.nombre,
          nombresTiposDesdeApi(d),
          d.activo === false ? 'inactivo' : 'activo',
          d.tokenAcceso,
        ].join(' '),
      ),
    [dispositivos, busquedaTabla],
  );
  const paginacion = usePaginacion(dispositivosFiltrados);
  const [tokenCopiadoId, setTokenCopiadoId] = useState<number | null>(null);

  useEffect(() => {
    paginacion.irAPagina(1);
  }, [busquedaTabla, paginacion.irAPagina]);

  async function fetchAll() {
    try {
      const res = await getDispositivos();
      setDispositivos(res.data || []);

      const tipos = await getTiposIngreso();
      setTiposIngreso(tipos.data || []);
    } catch (err: any) {
      console.error('Error al cargar dispositivos:', err?.response?.data || err.message);
      if (!yaTieneNotificacionError(err)) alert('Error al cargar dispositivos.');
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function alternarTipoIngreso(id: number) {
    setFormData((prev) => {
      const tiene = prev.tipoIngresoIds.includes(id);
      return {
        ...prev,
        tipoIngresoIds: tiene
          ? prev.tipoIngresoIds.filter((x) => x !== id)
          : [...prev.tipoIngresoIds, id],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (formData.tipoIngresoIds.length === 0) {
      mostrarNotificacion({
        tipo: 'error',
        mensaje: 'Seleccione al menos un tipo de ingreso.',
      });
      return;
    }

    const nombre = normalizarNombreDispositivo(formData.nombre);
    if (!nombreDispositivoFormatoValido(nombre)) {
      mostrarNotificacion({
        tipo: 'error',
        mensaje:
          'El nombre solo puede contener letras, números y espacios (mínimo 2 caracteres).',
      });
      return;
    }
    if (
      nombreDispositivoDuplicado(
        dispositivos,
        nombre,
        editMode ? formData.id : 0,
      )
    ) {
      mostrarNotificacion({
        tipo: 'error',
        mensaje: 'Ya existe un dispositivo de acceso con ese nombre.',
      });
      return;
    }

    try {
      const payload = {
        nombre,
        tipoIngresoIds: formData.tipoIngresoIds,
        activo: Boolean(formData.activo),
      };

      if (editMode) {
        await updateDispositivo(formData.id, payload);
      } else {
        await createDispositivo(payload);
      }

      setShowModal(false);
      setEditMode(false);
      setFormData({ id: 0, nombre: '', tipoIngresoIds: [], activo: true });
      await fetchAll();
    } catch (err: unknown) {
      console.error(err);
      if (!yaTieneNotificacionError(err)) {
        alert('Error al guardar dispositivo.');
      }
    }
  }

  function handleEdit(item: any) {
    const ids =
      item.tiposIngreso?.map((row: { tipoIngresoId: number }) => row.tipoIngresoId) ??
      item.tiposIngreso?.map((row: { tipoIngreso: { id: number } }) => row.tipoIngreso?.id) ??
      [];
    setFormData({
      id: item.id,
      nombre: item.nombre,
      tipoIngresoIds: ids.filter((n: number) => Number.isFinite(n)),
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
        if (!yaTieneNotificacionError(err)) alert('Error al eliminar.');
      }
    }
  }

  async function copiarTokenAcceso(token: string | undefined, idDispositivo: number) {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      setTokenCopiadoId(idDispositivo);
      window.setTimeout(() => {
        setTokenCopiadoId((cur) => (cur === idDispositivo ? null : cur));
      }, 2000);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = token;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setTokenCopiadoId(idDispositivo);
        window.setTimeout(() => {
          setTokenCopiadoId((cur) => (cur === idDispositivo ? null : cur));
        }, 2000);
      } catch {
        alert('No se pudo copiar. Seleccione el token manualmente.');
      }
    }
  }

  const columnas: ColumnaResponsive<DispositivoAcceso>[] = [
    { key: 'id', header: 'No' },
    { key: 'nombre', header: 'Nombre' },
    {
      key: 'tiposIngreso',
      header: 'Tipos de ingreso',
      render: (d) => nombresTiposDesdeApi(d),
    },
    {
      key: 'tokenAcceso',
      header: 'Token de acceso',
      apilarEnTarjeta: true,
      render: (d) => renderCeldaTokenAcceso(d, tokenCopiadoId, copiarTokenAcceso),
    },
    {
      key: 'activo',
      header: 'Activo',
      render: (d) =>
        d.activo ? (
          <span className="text-green-600 font-bold">Sí</span>
        ) : (
          <span className="text-red-600 font-bold">No</span>
        ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      apilarEnTarjeta: true,
      render: (d) => (
        <div className="table-actions">
          <button className="btn btn-warning" onClick={() => handleEdit(d)} type="button">
            <Pencil size={16} />
          </button>
          <button className="btn btn-danger" onClick={() => handleDelete(d.id)} type="button">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="container">
      <h2 className="page-heading">Gestión de Dispositivos de Acceso</h2>

      <div className="panel-toolbar">
        <button
          onClick={() => {
            setEditMode(false);
            setFormData({ id: 0, nombre: '', tipoIngresoIds: [], activo: true });
            setShowModal(true);
          }}
          className="btn btn-primary"
          type="button"
        >
          Crear Dispositivo
        </button>
      </div>
      <FiltroTabla
        valor={busquedaTabla}
        onChange={setBusquedaTabla}
        placeholder="Buscar por nombre, tipo de ingreso o estado…"
      />
      <ResponsiveTable
        columnas={columnas}
        filas={paginacion.filasPagina as DispositivoAcceso[]}
        mensajeVacio={
          dispositivos.length > 0 && dispositivosFiltrados.length === 0
            ? 'Sin resultados para la búsqueda.'
            : undefined
        }
      />
      <PaginacionTabla paginacion={paginacion} />

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 className="font-bold text-lg mb-4">
              {editMode ? 'Editar Dispositivo' : 'Crear Dispositivo'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-control mb-2">
                <label className="label">Nombre</label>
                <input
                  type="text"
                  className="input"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre: filtrarTextoNombreDispositivo(e.target.value),
                    })
                  }
                  pattern={PATRON_NOMBRE_ALFANUMERICO_HTML}
                  title="Solo letras, números y espacios (mínimo 2 caracteres)"
                  minLength={2}
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">Tipos de ingreso</label>
                <div className="card" style={{ padding: '0.75rem', maxHeight: 220, overflowY: 'auto' }}>
                  {tiposIngreso.length === 0 ? (
                    <p className="small">No hay tipos en el catálogo. Cree tipos en Tipos de Ingreso.</p>
                  ) : (
                    tiposIngreso.map((t) => (
                      <label
                        key={t.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.tipoIngresoIds.includes(t.id)}
                          onChange={() => alternarTipoIngreso(t.id)}
                        />
                        <span>{t.nombre}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="form-control mb-4">
                <label className="label">¿Activo?</label>
                <select
                  className="input"
                  value={formData.activo ? 'true' : 'false'}
                  onChange={(e) =>
                    setFormData({ ...formData, activo: e.target.value === 'true' })
                  }
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>

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
