import type { TipoReporteApi } from '@/services/api';

export type TipoGraficaReporte = 'barra' | 'pastel';

export type CampoAgrupacionGrafica = {
  clave: string;
  etiqueta: string;
  agruparPorDia?: boolean;
};

export type ConfigGraficaReporte = {
  campos: CampoAgrupacionGrafica[];
  campoPorDefecto: string;
  tipoGraficaPorDefecto: TipoGraficaReporte;
};

const CONFIG_GRAFICA: Record<TipoReporteApi, ConfigGraficaReporte> = {
  usuarios: {
    campos: [{ clave: 'activo', etiqueta: 'Activo / inactivo' }],
    campoPorDefecto: 'activo',
    tipoGraficaPorDefecto: 'pastel',
  },
  eventos: {
    campos: [
      { clave: 'ubicacion', etiqueta: 'Ubicación' },
      {
        clave: 'fechaHora',
        etiqueta: 'Por día (fecha del evento)',
        agruparPorDia: true,
      },
    ],
    campoPorDefecto: 'ubicacion',
    tipoGraficaPorDefecto: 'barra',
  },
  'registros-acceso': {
    campos: [
      { clave: 'tipoIngresoEntrada', etiqueta: 'Tipo de ingreso (entrada)' },
      { clave: 'dispositivoEntrada', etiqueta: 'Torniquete (entrada)' },
      {
        clave: 'entrada',
        etiqueta: 'Por día (fecha de entrada)',
        agruparPorDia: true,
      },
    ],
    campoPorDefecto: 'tipoIngresoEntrada',
    tipoGraficaPorDefecto: 'barra',
  },
  suspensiones: {
    campos: [
      { clave: 'activa', etiqueta: 'Suspensión activa' },
      { clave: 'motivo', etiqueta: 'Motivo' },
    ],
    campoPorDefecto: 'activa',
    tipoGraficaPorDefecto: 'pastel',
  },
  'dispositivos-acceso': {
    campos: [
      { clave: 'activo', etiqueta: 'Dispositivo activo' },
      { clave: 'tiposIngreso', etiqueta: 'Tipos de ingreso' },
    ],
    campoPorDefecto: 'activo',
    tipoGraficaPorDefecto: 'barra',
  },
  visitantes: {
    campos: [
      { clave: 'evento', etiqueta: 'Evento' },
      { clave: 'areaVisitar', etiqueta: 'Área a visitar' },
      { clave: 'activo', etiqueta: 'Visitante activo' },
    ],
    campoPorDefecto: 'evento',
    tipoGraficaPorDefecto: 'barra',
  },
  notas: {
    campos: [
      { clave: 'evento', etiqueta: 'Evento' },
      { clave: 'asunto', etiqueta: 'Asunto' },
    ],
    campoPorDefecto: 'evento',
    tipoGraficaPorDefecto: 'barra',
  },
  roles: {
    campos: [{ clave: 'nombre', etiqueta: 'Rol' }],
    campoPorDefecto: 'nombre',
    tipoGraficaPorDefecto: 'barra',
  },
  'tipos-ingreso': {
    campos: [
      { clave: 'nombre', etiqueta: 'Tipo de ingreso' },
      { clave: 'dispositivos', etiqueta: 'Uso en dispositivos' },
    ],
    campoPorDefecto: 'nombre',
    tipoGraficaPorDefecto: 'barra',
  },
  'carrera-departamento': {
    campos: [
      {
        clave: '_porDepartamento',
        etiqueta: 'Carreras asociadas por departamento',
      },
    ],
    campoPorDefecto: '_porDepartamento',
    tipoGraficaPorDefecto: 'barra',
  },
};

export function configGraficaReporte(tipo: TipoReporteApi): ConfigGraficaReporte {
  return CONFIG_GRAFICA[tipo];
}

export function campoAgrupacionGrafica(
  config: ConfigGraficaReporte,
  clave: string,
): CampoAgrupacionGrafica | undefined {
  return config.campos.find((c) => c.clave === clave);
}
