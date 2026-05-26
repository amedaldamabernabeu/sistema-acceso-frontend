'use client';

import ProtectedClient from '@/components/ProtectedClient';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { etiquetaOpcionEventoVisitante } from '@/lib/evento-asignable-visitante';
import {
  filtrarTextoSoloNombre,
  filtrarTextoSoloTelefono,
  PATRON_NOMBRE_VISITANTE_HTML,
  payloadActualizarVisitanteDesdeFormulario,
  payloadRegistroVisitanteDesdeFormulario,
  validarFormularioRegistroVisitante,
} from '@/lib/visitante-validaciones';
import { usuarioTieneAlgunPermiso } from '@/lib/permisosUsuario';
import {
  deleteVisitante,
  getEventos,
  getVisitanteQrBlob,
  getVisitantes,
  getVisitantesCatalogoEventos,
  patchVisitante,
  postVisitante,
  type QueryVisitantesParams,
  type RegistroVisitantePayload,
} from '@/services/api';
import { useAuth } from '@/components/auth/AuthProvider';
import { QrCode, Pencil, Trash2, UserPlus } from 'lucide-react';
import { filtrarPorTexto } from '@/lib/filtrar-por-texto';
import { usePaginacion } from '@/lib/use-paginacion';
import FiltroTabla from '@/components/FiltroTabla';
import PaginacionTabla from '@/components/PaginacionTabla';
import ResponsiveTable, { type ColumnaResponsive } from '@/components/ResponsiveTable';

type VisitanteFila = {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  areaVisitar: string;
  activo: boolean;
  expiraEn: string;
  tokenQr: string;
  eventoId: number | null;
  registroAccesoId: number | null;
  evento: { id: number; nombre: string } | null;
  registroAcceso: { id: number; entrada: string; salida: string } | null;
};

export default function DashboardVisitantesPage() {
  return (
    <ProtectedClient>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 48px' }}>
        <VisitantesGestion />
      </div>
    </ProtectedClient>
  );
}

type EventoCatalogoVisitante = {
  id: number;
  nombre: string;
  fechaHora: string | null;
  ubicacion: string | null;
};

function VisitantesGestion() {
  const { user } = useAuth();
  const puedeEditarVisitante = usuarioTieneAlgunPermiso(user, ['visitantes.editar']);
  const [filas, setFilas] = useState<VisitanteFila[]>([]);
  const [eventosFiltro, setEventosFiltro] = useState<{ id: number; nombre: string }[]>([]);
  const [eventosCatalogo, setEventosCatalogo] = useState<EventoCatalogoVisitante[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [filtroEventoId, setFiltroEventoId] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('');
  const [modalCrear, setModalCrear] = useState(false);
  const [visitanteEditar, setVisitanteEditar] = useState<VisitanteFila | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrTitulo, setQrTitulo] = useState('');
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const filasFiltradas = useMemo(
    () =>
      filtrarPorTexto(filas, busquedaTabla, (v) =>
        [
          v.nombre,
          v.correo,
          v.telefono,
          v.areaVisitar,
          v.evento?.nombre,
          v.activo ? 'activo' : 'inactivo',
        ].join(' '),
      ),
    [filas, busquedaTabla],
  );
  const paginacion = usePaginacion(filasFiltradas);

  useEffect(() => {
    paginacion.irAPagina(1);
  }, [busquedaTabla, paginacion.irAPagina]);

  const paramsConsulta = useMemo((): QueryVisitantesParams => {
    const p: QueryVisitantesParams = {};
    if (fechaDesde) p.fechaDesde = fechaDesde;
    if (fechaHasta) p.fechaHasta = fechaHasta;
    if (filtroEventoId) p.eventoId = Number(filtroEventoId);
    if (filtroActivo === 'si') p.activo = 'true';
    if (filtroActivo === 'no') p.activo = 'false';
    return p;
  }, [fechaDesde, fechaHasta, filtroEventoId, filtroActivo]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setMensaje(null);
    try {
      const res = await getVisitantes(paramsConsulta);
      const data = res.data;
      setFilas(Array.isArray(data) ? data : []);
    } catch {
      setFilas([]);
      setMensaje('No se pudo cargar la lista. Verifique su sesión.');
    } finally {
      setCargando(false);
    }
  }, [paramsConsulta]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    paginacion.irAPagina(1);
  }, [paramsConsulta, paginacion.irAPagina]);

  useEffect(() => {
    (async () => {
      try {
        const [resFiltro, resCatalogo] = await Promise.all([
          getEventos(),
          getVisitantesCatalogoEventos(),
        ]);
        const listFiltro = resFiltro.data as { id: number; nombre: string }[];
        const listCatalogo = resCatalogo.data as EventoCatalogoVisitante[];
        setEventosFiltro(Array.isArray(listFiltro) ? listFiltro : []);
        setEventosCatalogo(Array.isArray(listCatalogo) ? listCatalogo : []);
      } catch {
        setEventosFiltro([]);
        setEventosCatalogo([]);
      }
    })();
  }, []);

  async function verQr(v: VisitanteFila) {
    setMensaje(null);
    try {
      const res = await getVisitanteQrBlob(v.id);
      const blob = res.data as Blob;
      const url = URL.createObjectURL(blob);
      if (qrUrl) URL.revokeObjectURL(qrUrl);
      setQrUrl(url);
      setQrTitulo(v.nombre);
    } catch {
      setMensaje('No se pudo obtener el código QR.');
    }
  }

  function cerrarQr() {
    if (qrUrl) URL.revokeObjectURL(qrUrl);
    setQrUrl(null);
    setQrTitulo('');
  }

  async function eliminar(id: number) {
    if (!confirm('¿Eliminar este visitante?')) return;
    setMensaje(null);
    try {
      await deleteVisitante(id);
      await cargar();
    } catch {
      setMensaje('No se pudo eliminar el registro.');
    }
  }

  const columnas: ColumnaResponsive<VisitanteFila>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'correo', header: 'Correo' },
    { key: 'areaVisitar', header: 'Área' },
    {
      key: 'evento',
      header: 'Evento',
      render: (v) => v.evento?.nombre ?? '—',
    },
    {
      key: 'activo',
      header: 'Activo',
      render: (v) => (v.activo ? 'Sí' : 'No'),
    },
    {
      key: 'expiraEn',
      header: 'Expira',
      render: (v) => new Date(v.expiraEn).toLocaleString('es-MX'),
    },
    {
      key: 'acceso',
      header: 'Acceso',
      render: (v) => (v.registroAccesoId ? `Reg. #${v.registroAccesoId}` : '—'),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      apilarEnTarjeta: true,
      render: (v) => (
        <div className="flex gap-2 flex-wrap">
          {puedeEditarVisitante && v.registroAccesoId == null && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              title="Editar (solo antes del primer escaneo del QR)"
              onClick={() => setVisitanteEditar(v)}
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            title="Ver QR"
            onClick={() => void verQr(v)}
          >
            <QrCode size={16} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            title="Eliminar"
            onClick={() => void eliminar(v.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Visitantes</h2>
      <p className="text-muted mb-8" style={{ fontSize: 14 }}>
        Gestión de visitas externas con QR temporal. Los registros de entrada y salida quedan en «Registros de acceso».
      </p>

      <div className="card mb-8">
        <p className="font-semibold mb-3">Filtros</p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'flex-end',
          }}
        >
          <div className="form-control mb-0" style={{ flex: '1 1 140px' }}>
            <label>Desde</label>
            <input
              type="date"
              className="input"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>
          <div className="form-control mb-0" style={{ flex: '1 1 140px' }}>
            <label>Hasta</label>
            <input
              type="date"
              className="input"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
          <div className="form-control mb-0" style={{ flex: '2 1 200px' }}>
            <label>Evento</label>
            <select
              className="input"
              value={filtroEventoId}
              onChange={(e) => setFiltroEventoId(e.target.value)}
            >
              <option value="">Todos</option>
              {eventosFiltro.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control mb-0" style={{ flex: '1 1 160px' }}>
            <label>Activo</label>
            <select
              className="input"
              value={filtroActivo}
              onChange={(e) => setFiltroActivo(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
          <button type="button" className="btn btn-primary mb-0" onClick={() => void cargar()} disabled={cargando}>
            Aplicar
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
        <button type="button" className="btn btn-success" onClick={() => setModalCrear(true)}>
          <UserPlus size={18} /> Nuevo visitante
        </button>
      </div>

      {mensaje && (
        <div className="card mb-4" role="alert" style={{ borderColor: 'rgba(245, 158, 11, 0.45)' }}>
          <p className="small mb-0" style={{ color: '#92400e' }}>
            {mensaje}
          </p>
        </div>
      )}

      <FiltroTabla
        valor={busquedaTabla}
        onChange={setBusquedaTabla}
        placeholder="Buscar por nombre, correo, teléfono o área…"
      />

      <ResponsiveTable
        columnas={columnas}
        filas={paginacion.filasPagina}
        mensajeVacio={
          cargando
            ? 'Cargando…'
            : filas.length === 0
              ? 'Sin visitantes con los filtros actuales.'
              : filasFiltradas.length === 0
                ? 'Sin resultados para la búsqueda.'
                : undefined
        }
      />
      <PaginacionTabla paginacion={paginacion} />

      {modalCrear && (
        <ModalCrearVisitante
          eventos={eventosCatalogo}
          onCerrar={() => setModalCrear(false)}
          onCreado={async () => {
            setModalCrear(false);
            await cargar();
          }}
          onError={(t) => setMensaje(t)}
        />
      )}

      {visitanteEditar && (
        <ModalEditarVisitante
          visitante={visitanteEditar}
          eventos={eventosCatalogo}
          onCerrar={() => setVisitanteEditar(null)}
          onGuardado={async () => {
            setVisitanteEditar(null);
            await cargar();
          }}
          onError={(t) => setMensaje(t)}
        />
      )}

      {qrUrl && (
        <div
          className="card"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            maxWidth: 420,
            margin: 'auto',
            height: 'fit-content',
            textAlign: 'center',
          }}
        >
          <p className="font-semibold mb-2">QR — {qrTitulo}</p>
          <img src={qrUrl} alt="Código QR" style={{ maxWidth: '100%', height: 'auto' }} />
          <button type="button" className="btn btn-primary mt-4" onClick={cerrarQr}>
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}

function ModalCrearVisitante({
  eventos,
  onCerrar,
  onCreado,
  onError,
}: {
  eventos: EventoCatalogoVisitante[];
  onCerrar: () => void;
  onCreado: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [areaVisitar, setAreaVisitar] = useState('');
  const [eventoId, setEventoId] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const errorValidacion = validarFormularioRegistroVisitante({
      nombre,
      correo,
      telefono,
      areaVisitar,
      eventoId,
      eventosCatalogo: eventos,
    });
    if (errorValidacion) {
      onError(errorValidacion);
      return;
    }
    setEnviando(true);
    const payload: RegistroVisitantePayload = payloadRegistroVisitanteDesdeFormulario({
      nombre,
      correo,
      telefono,
      areaVisitar,
      eventoId,
    });
    try {
      await postVisitante(payload);
      await onCreado();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string | string[] } } };
      const msg = ax.response?.data?.message;
      onError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al crear.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal
      onClick={onCerrar}
    >
      <div
        className="modal-content modal-content--wide"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Nuevo visitante</h3>
        <form onSubmit={(e) => void enviar(e)}>
          <CamposFormularioVisitante
            nombre={nombre}
            setNombre={setNombre}
            correo={correo}
            setCorreo={setCorreo}
            telefono={telefono}
            setTelefono={setTelefono}
            areaVisitar={areaVisitar}
            setAreaVisitar={setAreaVisitar}
            eventoId={eventoId}
            setEventoId={setEventoId}
            eventos={eventos}
          />
          <div className="table-actions">
            <button type="button" className="btn btn-ghost" onClick={onCerrar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Guardando…' : 'Guardar y enviar QR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalEditarVisitante({
  visitante,
  eventos,
  onCerrar,
  onGuardado,
  onError,
}: {
  visitante: VisitanteFila;
  eventos: EventoCatalogoVisitante[];
  onCerrar: () => void;
  onGuardado: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [nombre, setNombre] = useState(visitante.nombre);
  const [correo, setCorreo] = useState(visitante.correo);
  const [telefono, setTelefono] = useState(visitante.telefono);
  const [areaVisitar, setAreaVisitar] = useState(visitante.areaVisitar);
  const [eventoId, setEventoId] = useState(
    visitante.eventoId != null ? String(visitante.eventoId) : '',
  );
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const errorValidacion = validarFormularioRegistroVisitante({
      nombre,
      correo,
      telefono,
      areaVisitar,
      eventoId,
      eventosCatalogo: eventos,
    });
    if (errorValidacion) {
      onError(errorValidacion);
      return;
    }
    setEnviando(true);
    const payload = payloadActualizarVisitanteDesdeFormulario({
      nombre,
      correo,
      telefono,
      areaVisitar,
      eventoId,
    });
    try {
      await patchVisitante(visitante.id, payload);
      await onGuardado();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string | string[] } } };
      const msg = ax.response?.data?.message;
      onError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al guardar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal
      onClick={onCerrar}
    >
      <div
        className="modal-content modal-content--wide"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Editar visitante</h3>
        <p className="text-muted small mb-4">
          Solo puede corregir datos antes de que el QR registre la primera entrada. El código QR no cambia.
        </p>
        <form onSubmit={(e) => void enviar(e)}>
          <CamposFormularioVisitante
            nombre={nombre}
            setNombre={setNombre}
            correo={correo}
            setCorreo={setCorreo}
            telefono={telefono}
            setTelefono={setTelefono}
            areaVisitar={areaVisitar}
            setAreaVisitar={setAreaVisitar}
            eventoId={eventoId}
            setEventoId={setEventoId}
            eventos={eventos}
          />
          <div className="table-actions">
            <button type="button" className="btn btn-ghost" onClick={onCerrar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={enviando}>
              {enviando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CamposFormularioVisitante({
  nombre,
  setNombre,
  correo,
  setCorreo,
  telefono,
  setTelefono,
  areaVisitar,
  setAreaVisitar,
  eventoId,
  setEventoId,
  eventos,
}: {
  nombre: string;
  setNombre: (v: string) => void;
  correo: string;
  setCorreo: (v: string) => void;
  telefono: string;
  setTelefono: (v: string) => void;
  areaVisitar: string;
  setAreaVisitar: (v: string) => void;
  eventoId: string;
  setEventoId: (v: string) => void;
  eventos: EventoCatalogoVisitante[];
}) {
  return (
    <>
      <div className="form-control">
        <label>Nombre</label>
        <input
          className="input"
          required
          value={nombre}
          onChange={(e) => setNombre(filtrarTextoSoloNombre(e.target.value))}
          maxLength={200}
          pattern={PATRON_NOMBRE_VISITANTE_HTML}
          title="Solo letras y espacios"
        />
      </div>
      <div className="form-control">
        <label>Correo</label>
        <input
          className="input"
          type="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value.trim())}
        />
      </div>
      <div className="form-control">
        <label>Teléfono</label>
        <input
          className="input"
          required
          value={telefono}
          onChange={(e) => setTelefono(filtrarTextoSoloTelefono(e.target.value))}
          inputMode="numeric"
          maxLength={15}
          pattern="\d{10,15}"
          title="Mínimo 10 dígitos numéricos"
        />
      </div>
      <div className="form-control">
        <label>Área a visitar</label>
        <input
          className="input"
          required
          value={areaVisitar}
          onChange={(e) => setAreaVisitar(e.target.value)}
        />
      </div>
      <div className="form-control">
        <label>Evento (opcional)</label>
        <select className="input" value={eventoId} onChange={(e) => setEventoId(e.target.value)}>
          <option value="">— Sin evento (opcional) —</option>
          {eventos.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {etiquetaOpcionEventoVisitante(ev)}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
