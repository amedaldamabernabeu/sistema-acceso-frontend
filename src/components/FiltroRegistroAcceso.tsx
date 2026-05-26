'use client';

export type FiltrosRegistroAcceso = {
  codigoUsuario: string;
  fechaInicio: string;
  fechaFin: string;
};

type Props = {
  filtros: FiltrosRegistroAcceso;
  onChange: (filtros: FiltrosRegistroAcceso) => void;
};

/** Filtros de registro de acceso: código y rango de fechas de entrada. */
export default function FiltroRegistroAcceso({ filtros, onChange }: Props) {
  const actualizar = (parcial: Partial<FiltrosRegistroAcceso>) => {
    onChange({ ...filtros, ...parcial });
  };

  const hayFiltro =
    filtros.codigoUsuario.trim() !== '' ||
    filtros.fechaInicio !== '' ||
    filtros.fechaFin !== '';

  return (
    <div className="tabla-filtro-bar tabla-filtro-bar--registro-acceso">
      <div className="form-control tabla-filtro-bar__campo">
        <label htmlFor="filtro-reg-codigo">Código usuario</label>
        <input
          id="filtro-reg-codigo"
          type="search"
          className="input"
          value={filtros.codigoUsuario}
          onChange={(e) => actualizar({ codigoUsuario: e.target.value })}
          placeholder="Buscar por código…"
        />
      </div>
      <div className="form-control tabla-filtro-bar__campo">
        <label htmlFor="filtro-reg-desde">Entrada desde</label>
        <input
          id="filtro-reg-desde"
          type="date"
          className="input"
          value={filtros.fechaInicio}
          onChange={(e) => actualizar({ fechaInicio: e.target.value })}
        />
      </div>
      <div className="form-control tabla-filtro-bar__campo">
        <label htmlFor="filtro-reg-hasta">Entrada hasta</label>
        <input
          id="filtro-reg-hasta"
          type="date"
          className="input"
          value={filtros.fechaFin}
          onChange={(e) => actualizar({ fechaFin: e.target.value })}
        />
      </div>
      {hayFiltro && (
        <button
          type="button"
          className="btn tabla-filtro-bar__limpiar"
          onClick={() =>
            onChange({ codigoUsuario: '', fechaInicio: '', fechaFin: '' })
          }
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
