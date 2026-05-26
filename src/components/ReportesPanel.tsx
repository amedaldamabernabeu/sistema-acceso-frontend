'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import {
  getReportePreview,
  getReporteExportBlob,
  type TipoReporteApi,
  type ConsultaReporteParams,
} from '@/services/api';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  ImageDown,
  RotateCcw,
  Search,
  Table2,
} from 'lucide-react';
import { usePaginacion } from '@/lib/use-paginacion';
import PaginacionTabla from '@/components/PaginacionTabla';
import ResponsiveTable, { type ColumnaResponsive } from '@/components/ResponsiveTable';
import ReporteCarreraDepartamentoVista, {
  type GrupoReporteCarreraDepartamento,
} from '@/components/ReporteCarreraDepartamentoVista';
import ReporteGraficaVista from '@/components/ReporteGraficaVista';
import {
  agregarCarreraDepartamentoParaGrafica,
  agregarFilasParaGrafica,
} from '@/lib/reportes-agregar-grafica';
import {
  campoAgrupacionGrafica,
  configGraficaReporte,
  type TipoGraficaReporte,
} from '@/lib/reportes-graficas.config';

const TIPOS_REPORTE: { value: TipoReporteApi; label: string }[] = [
  { value: 'usuarios', label: 'Usuarios del sistema' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'registros-acceso', label: 'Registros de acceso' },
  { value: 'suspensiones', label: 'Suspensiones' },
  { value: 'dispositivos-acceso', label: 'Dispositivos de acceso' },
  { value: 'visitantes', label: 'Visitantes' },
  { value: 'notas', label: 'Notas' },
  { value: 'roles', label: 'Roles' },
  { value: 'tipos-ingreso', label: 'Tipos de ingreso' },
  { value: 'carrera-departamento', label: 'Carrera — departamento' },
];

type VistaResultadoReporte = 'tabla' | 'grafica';

function descargarBlob(blob: Blob, nombreArchivo: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function nombreArchivoExport(tipo: TipoReporteApi, formato: 'pdf' | 'excel') {
  const slug = tipo.replace(/[^a-z0-9-]/gi, '-');
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const ext = formato === 'pdf' ? 'pdf' : 'xlsx';
  return `reporte-${slug}-${ts}.${ext}`;
}

function nombreArchivoGrafica(tipo: TipoReporteApi, campo: string) {
  const slug = tipo.replace(/[^a-z0-9-]/gi, '-');
  const campoSlug = campo.replace(/[^a-z0-9-]/gi, '-');
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `grafica-${slug}-${campoSlug}-${ts}.png`;
}

function formatearFechaFiltro(valor: string): string {
  if (valor.length >= 10 && valor[4] === '-' && valor[7] === '-') {
    const [anio, mes, dia] = valor.slice(0, 10).split('-');
    return `${dia}/${mes}/${anio}`;
  }
  return valor;
}

function textoFechaReporteGrafica(fechaDesde: string, fechaHasta: string): string {
  const generado = new Date().toLocaleString('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  let texto = `Fecha del reporte: ${generado}`;
  if (fechaDesde || fechaHasta) {
    const desde = fechaDesde ? formatearFechaFiltro(fechaDesde) : '—';
    const hasta = fechaHasta ? formatearFechaFiltro(fechaHasta) : '—';
    texto += ` · Periodo consultado: ${desde} — ${hasta}`;
  }
  return texto;
}

export default function ReportesPanel() {
  const [tipo, setTipo] = useState<TipoReporteApi>('registros-acceso');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [nombre, setNombre] = useState('');
  const [cargando, setCargando] = useState(false);
  const [filas, setFilas] = useState<Record<string, string | number | boolean>[]>([]);
  const [agrupadoCarreraDepto, setAgrupadoCarreraDepto] = useState<
    GrupoReporteCarreraDepartamento[]
  >([]);
  const [truncado, setTruncado] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [vistaResultado, setVistaResultado] = useState<VistaResultadoReporte>('tabla');
  const [tipoGrafica, setTipoGrafica] = useState<TipoGraficaReporte>('barra');
  const [campoAgrupacion, setCampoAgrupacion] = useState('tipoIngresoEntrada');
  const graficaRef = useRef<HTMLDivElement>(null);
  const paginacion = usePaginacion(filas);

  const configGrafica = useMemo(() => configGraficaReporte(tipo), [tipo]);

  useEffect(() => {
    paginacion.irAPagina(1);
  }, [filas, paginacion.irAPagina]);

  useEffect(() => {
    setFilas([]);
    setAgrupadoCarreraDepto([]);
    setTruncado(false);
    setMensaje(null);
    setVistaResultado('tabla');
    setTipoGrafica(configGrafica.tipoGraficaPorDefecto);
    setCampoAgrupacion(configGrafica.campoPorDefecto);
  }, [tipo, configGrafica.campoPorDefecto, configGrafica.tipoGraficaPorDefecto]);

  const paramsConsulta = useMemo((): ConsultaReporteParams => {
    const p: ConsultaReporteParams = {};
    if (fechaDesde) p.fechaDesde = fechaDesde;
    if (fechaHasta) p.fechaHasta = fechaHasta;
    if (nombre.trim()) p.nombre = nombre.trim();
    return p;
  }, [fechaDesde, fechaHasta, nombre]);

  const hayDatos = useMemo(
    () =>
      tipo === 'carrera-departamento'
        ? agrupadoCarreraDepto.length > 0
        : filas.length > 0,
    [tipo, filas.length, agrupadoCarreraDepto.length],
  );

  const puntosGrafica = useMemo(() => {
    if (!hayDatos) return [];
    if (tipo === 'carrera-departamento') {
      return agregarCarreraDepartamentoParaGrafica(agrupadoCarreraDepto);
    }
    const meta = campoAgrupacionGrafica(configGrafica, campoAgrupacion);
    return agregarFilasParaGrafica(filas, campoAgrupacion, {
      agruparPorDia: meta?.agruparPorDia,
    });
  }, [
    hayDatos,
    tipo,
    filas,
    agrupadoCarreraDepto,
    configGrafica,
    campoAgrupacion,
  ]);

  const tituloGrafica = useMemo(() => {
    const etiquetaTipo =
      TIPOS_REPORTE.find((t) => t.value === tipo)?.label ?? tipo;
    const etiquetaCampo =
      campoAgrupacionGrafica(configGrafica, campoAgrupacion)?.etiqueta ??
      campoAgrupacion;
    return `${etiquetaTipo} — ${etiquetaCampo}`;
  }, [tipo, configGrafica, campoAgrupacion]);

  const fechaReporteGrafica = useMemo(
    () => textoFechaReporteGrafica(fechaDesde, fechaHasta),
    [fechaDesde, fechaHasta],
  );

  const columnas = useMemo(() => {
    if (!filas.length) return [] as string[];
    return Object.keys(filas[0]);
  }, [filas]);

  const columnasTabla = useMemo((): ColumnaResponsive<
    Record<string, string | number | boolean>
  >[] => {
    if (columnas.length === 0) {
      return [{ key: '_vista', header: 'Vista previa' }];
    }
    return columnas.map((c) => ({
      key: c,
      header: c,
      render: (fila) => String(fila[c] ?? ''),
    }));
  }, [columnas]);

  const mensajeTablaVacia = cargando
    ? 'Cargando…'
    : 'Sin datos. Usa «Vista previa» para cargar resultados antes de exportar.';

  function limpiarFiltrosYTabla() {
    setFechaDesde('');
    setFechaHasta('');
    setNombre('');
    setFilas([]);
    setAgrupadoCarreraDepto([]);
    setTruncado(false);
    setMensaje(null);
    setVistaResultado('tabla');
  }

  async function cargarVistaPrevia() {
    setMensaje(null);
    setCargando(true);
    try {
      const res = await getReportePreview(tipo, paramsConsulta);
      const data = res.data as {
        filas?: Record<string, string | number | boolean>[];
        agrupado?: GrupoReporteCarreraDepartamento[];
        truncado?: boolean;
      };
      setFilas(Array.isArray(data.filas) ? data.filas : []);
      setAgrupadoCarreraDepto(
        Array.isArray(data.agrupado) ? data.agrupado : [],
      );
      setTruncado(Boolean(data.truncado));
    } catch (e: unknown) {
      console.error(e);
      setFilas([]);
      setAgrupadoCarreraDepto([]);
      setTruncado(false);
      setMensaje('No se pudo cargar la vista previa. Verifica la sesión y los filtros.');
    } finally {
      setCargando(false);
    }
  }

  async function exportar(formato: 'pdf' | 'excel') {
    if (!hayDatos) {
      setMensaje('No hay resultados en la vista previa para exportar.');
      return;
    }
    setMensaje(null);
    setCargando(true);
    try {
      const res = await getReporteExportBlob(tipo, formato, paramsConsulta);
      const blob = res.data as Blob;
      const ctype = res.headers['content-type'] ?? '';
      if (ctype.includes('application/json')) {
        const texto = await blob.text();
        try {
          const err = JSON.parse(texto) as { message?: string | string[] };
          const msg = Array.isArray(err.message)
            ? err.message.join(', ')
            : err.message ?? texto;
          setMensaje(msg);
        } catch {
          setMensaje(texto || 'Error al exportar');
        }
        return;
      }
      descargarBlob(blob, nombreArchivoExport(tipo, formato));
    } catch (e: unknown) {
      console.error(e);
      setMensaje('Error al descargar el archivo.');
    } finally {
      setCargando(false);
    }
  }

  async function descargarGraficaComoImagen() {
    if (!hayDatos || puntosGrafica.length === 0) {
      setMensaje('No hay datos en la gráfica para descargar.');
      return;
    }
    if (!graficaRef.current) {
      setMensaje('No se pudo capturar la gráfica.');
      return;
    }
    setMensaje(null);
    setCargando(true);
    try {
      const dataUrl = await toPng(graficaRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = nombreArchivoGrafica(tipo, campoAgrupacion);
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e: unknown) {
      console.error(e);
      setMensaje('No se pudo generar la imagen de la gráfica.');
    } finally {
      setCargando(false);
    }
  }

  const puedeDescargarImagen =
    vistaResultado === 'grafica' && hayDatos && puntosGrafica.length > 0 && !cargando;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">Reportes</h2>
      <p className="text-muted mb-10">
        Filtra por fechas y/o texto, consulta la vista previa en tabla o gráfica, exporta PDF/Excel
        (tablas) o descarga la gráfica actual como imagen PNG.
      </p>

      <div className="card mb-12">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'flex-end',
          }}
        >
          <div className="form-control mb-0" style={{ flex: '1 1 200px', minWidth: 180 }}>
            <label>Tipo de reporte</label>
            <select
              className="input"
              style={{ width: '100%' }}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoReporteApi)}
            >
              {TIPOS_REPORTE.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control mb-0" style={{ flex: '1 1 160px', minWidth: 140 }}>
            <label>Fecha desde</label>
            <input
              type="date"
              className="input"
              style={{ width: '100%' }}
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
            />
          </div>
          <div className="form-control mb-0" style={{ flex: '1 1 160px', minWidth: 140 }}>
            <label>Fecha hasta</label>
            <input
              type="date"
              className="input"
              style={{ width: '100%' }}
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
            />
          </div>
          <div className="form-control mb-0" style={{ flex: '2 1 220px', minWidth: 200 }}>
            <label>Nombre / código / texto</label>
            <input
              type="text"
              placeholder="Búsqueda parcial"
              className="input"
              style={{ width: '100%' }}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="mr-10 flex flex-wrap items-center justify-between gap-3 pt-8 pb-2 mb-6 border-t border-black/[0.06]">
        <button
          type="button"
          disabled={cargando}
          onClick={limpiarFiltrosYTabla}
          className="btn btn-ghost"
        >
          <RotateCcw size={18} /> Limpiar filtros
        </button>
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={cargando}
            onClick={() => void cargarVistaPrevia()}
            className="btn btn-primary"
          >
            <Search size={18} /> Vista previa
          </button>
          <button
            type="button"
            disabled={cargando || !hayDatos}
            onClick={() => setVistaResultado('tabla')}
            className={`btn ${vistaResultado === 'tabla' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Table2 size={18} /> Tabla
          </button>
          <button
            type="button"
            disabled={cargando || !hayDatos}
            onClick={() => setVistaResultado('grafica')}
            className={`btn ${vistaResultado === 'grafica' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <BarChart3 size={18} /> Gráfica
          </button>
          <button
            type="button"
            disabled={!puedeDescargarImagen}
            onClick={() => void descargarGraficaComoImagen()}
            className="btn btn-ghost"
            title="Descarga la gráfica visible como PNG"
          >
            <ImageDown size={18} /> Descargar imagen
          </button>
          <button
            type="button"
            disabled={cargando}
            onClick={() => void exportar('excel')}
            className="btn btn-success"
          >
            <FileSpreadsheet size={18} /> Exportar Excel
          </button>
          <button
            type="button"
            disabled={cargando}
            onClick={() => void exportar('pdf')}
            className="btn btn-danger"
          >
            <FileText size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {vistaResultado === 'grafica' && hayDatos && (
        <div
          className="card mb-6"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'flex-end',
          }}
        >
          <div className="form-control mb-0" style={{ flex: '1 1 180px', minWidth: 160 }}>
            <label>Tipo de gráfica</label>
            <select
              className="input"
              style={{ width: '100%' }}
              value={tipoGrafica}
              onChange={(e) => setTipoGrafica(e.target.value as TipoGraficaReporte)}
            >
              <option value="barra">Barras</option>
              <option value="pastel">Pastel</option>
            </select>
          </div>
          {configGrafica.campos.length > 1 && (
            <div className="form-control mb-0" style={{ flex: '2 1 240px', minWidth: 200 }}>
              <label>Agrupar por</label>
              <select
                className="input"
                style={{ width: '100%' }}
                value={campoAgrupacion}
                onChange={(e) => setCampoAgrupacion(e.target.value)}
              >
                {configGrafica.campos.map((c) => (
                  <option key={c.clave} value={c.clave}>
                    {c.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="mt-2 space-y-6">
        {mensaje && (
          <div
            className="card mb-0"
            role="alert"
            style={{ borderColor: 'rgba(245, 158, 11, 0.45)' }}
          >
            <p className="small" style={{ margin: 0, color: '#92400e' }}>
              {mensaje}
            </p>
          </div>
        )}

        {truncado && (
          <p
            className="hint mb-0"
            style={{
              padding: '10px 12px',
              background: 'rgba(245, 247, 250, 0.9)',
              borderRadius: 8,
            }}
          >
            El resultado alcanza el límite máximo de filas del servidor. Ajusta los filtros para
            acotar.
          </p>
        )}

        {vistaResultado === 'grafica' ? (
          <ReporteGraficaVista
            ref={graficaRef}
            puntos={puntosGrafica}
            tipoGrafica={tipoGrafica}
            titulo={tituloGrafica}
            fechaReporte={fechaReporteGrafica}
          />
        ) : tipo === 'carrera-departamento' ? (
          <ReporteCarreraDepartamentoVista
            grupos={agrupadoCarreraDepto}
            mensajeVacio={mensajeTablaVacia}
          />
        ) : (
          <>
            <ResponsiveTable
              className="pt-2"
              columnas={columnasTabla}
              filas={paginacion.filasPagina}
              mensajeVacio={filas.length === 0 ? mensajeTablaVacia : undefined}
            />
            <PaginacionTabla paginacion={paginacion} />
          </>
        )}
      </div>
    </div>
  );
}
