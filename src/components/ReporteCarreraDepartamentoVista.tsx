'use client';

type FilaReporte = Record<string, string | number | boolean>;

export type GrupoReporteCarreraDepartamento = {
  departamentoId: number;
  nombreDepartamento: string;
  filas: FilaReporte[];
};

type Props = {
  grupos: GrupoReporteCarreraDepartamento[];
  mensajeVacio?: string;
};

export default function ReporteCarreraDepartamentoVista({
  grupos,
  mensajeVacio = 'Sin datos. Usa «Vista previa» para cargar resultados.',
}: Props) {
  if (grupos.length === 0) {
    return (
      <p className="text-muted" style={{ fontSize: 14 }}>
        {mensajeVacio}
      </p>
    );
  }

  return (
    <div className="carrera-depto-grupos">
      {grupos.map((grupo) => (
        <div key={grupo.departamentoId} className="card mb-4">
          <h4 className="font-semibold mb-3" style={{ fontSize: 16 }}>
            {grupo.nombreDepartamento}
            <span
              className="text-muted font-normal"
              style={{ fontSize: 13, marginLeft: 8 }}
            >
              ({grupo.filas.length}{' '}
              {grupo.filas.length === 1 ? 'carrera' : 'carreras'})
            </span>
          </h4>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Carrera</th>
                  <th>Plan</th>
                  <th>Clave</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {grupo.filas.map((fila) => (
                  <tr key={String(fila.id)}>
                    <td>{String(fila.id ?? '—')}</td>
                    <td>{String(fila.nombreCarrera ?? '—')}</td>
                    <td>{String(fila.planCarrera ?? '—')}</td>
                    <td>{String(fila.claveCarrera ?? '—')}</td>
                    <td>{String(fila.creado ?? '—')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
