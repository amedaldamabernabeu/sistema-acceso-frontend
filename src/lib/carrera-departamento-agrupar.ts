export type AsociacionCarreraDepartamento = {
  id: number;
  carreraId: number | string | bigint;
  departamentoId: number;
  departamento?: {
    nombre_depto?: string;
    nombre?: string;
    clave_depto?: number;
  };
  carrera?: {
    nombre?: string;
    plan?: string;
    clave?: string;
  };
};

export type GrupoDepartamentoCarreras = {
  departamentoId: number;
  nombreDepartamento: string;
  asociaciones: AsociacionCarreraDepartamento[];
};

export function agruparAsociacionesPorDepartamento(
  asociaciones: AsociacionCarreraDepartamento[],
): GrupoDepartamentoCarreras[] {
  const mapa = new Map<number, GrupoDepartamentoCarreras>();

  for (const asoc of asociaciones) {
    const depId = asoc.departamentoId;
    let grupo = mapa.get(depId);
    if (!grupo) {
      grupo = {
        departamentoId: depId,
        nombreDepartamento:
          asoc.departamento?.nombre_depto ??
          asoc.departamento?.nombre ??
          `Departamento #${depId}`,
        asociaciones: [],
      };
      mapa.set(depId, grupo);
    }
    grupo.asociaciones.push(asoc);
  }

  return [...mapa.values()].sort((a, b) =>
    a.nombreDepartamento.localeCompare(b.nombreDepartamento, 'es'),
  );
}

export function idsCarrerasAsociadas(
  asociaciones: { carreraId: number | string | bigint }[],
): Set<string> {
  return new Set(asociaciones.map((a) => String(a.carreraId)));
}
