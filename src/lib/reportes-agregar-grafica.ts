import type { GrupoReporteCarreraDepartamento } from '@/components/ReporteCarreraDepartamentoVista';

export type PuntoGraficaReporte = {
  etiqueta: string;
  valor: number;
};

const MAX_CATEGORIAS = 12;
const ETIQUETA_OTROS = 'Otros';

function normalizarEtiqueta(valor: string | number | boolean | undefined | null): string {
  if (valor === undefined || valor === null) return 'Sin dato';
  const t = String(valor).trim();
  return t === '' ? 'Sin dato' : t;
}

function valorCelda(
  fila: Record<string, string | number | boolean>,
  campo: string,
  agruparPorDia?: boolean,
): string {
  const crudo = fila[campo];
  if (agruparPorDia) {
    const texto = normalizarEtiqueta(crudo);
    if (texto === 'Sin dato') return texto;
    const soloFecha = texto.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) {
      const [anio, mes, dia] = soloFecha.split('-');
      return `${dia}/${mes}/${anio}`;
    }
    try {
      return new Date(texto).toLocaleDateString('es-MX');
    } catch {
      return texto;
    }
  }
  return normalizarEtiqueta(crudo);
}

/** Agrupa filas del reporte y limita categorías para legibilidad en gráficas. */
export function agregarFilasParaGrafica(
  filas: Record<string, string | number | boolean>[],
  campo: string,
  opciones?: { agruparPorDia?: boolean; maxCategorias?: number },
): PuntoGraficaReporte[] {
  const max = opciones?.maxCategorias ?? MAX_CATEGORIAS;
  const conteo = new Map<string, number>();
  for (const fila of filas) {
    const etiqueta = valorCelda(fila, campo, opciones?.agruparPorDia);
    conteo.set(etiqueta, (conteo.get(etiqueta) ?? 0) + 1);
  }
  const ordenados = [...conteo.entries()]
    .map(([etiqueta, valor]) => ({ etiqueta, valor }))
    .sort((a, b) => b.valor - a.valor);
  if (ordenados.length <= max) return ordenados;
  const principales = ordenados.slice(0, max - 1);
  const resto = ordenados.slice(max - 1).reduce((s, p) => s + p.valor, 0);
  return [...principales, { etiqueta: ETIQUETA_OTROS, valor: resto }];
}

export function agregarCarreraDepartamentoParaGrafica(
  grupos: GrupoReporteCarreraDepartamento[],
): PuntoGraficaReporte[] {
  const puntos = grupos.map((g) => ({
    etiqueta: g.nombreDepartamento.trim() || `Departamento ${g.departamentoId}`,
    valor: g.filas.length,
  }));
  return puntos.sort((a, b) => b.valor - a.valor);
}
