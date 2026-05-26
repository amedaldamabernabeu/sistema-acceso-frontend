'use client';

import { Trash2 } from 'lucide-react';
import {
  agruparAsociacionesPorDepartamento,
  type AsociacionCarreraDepartamento,
} from '@/lib/carrera-departamento-agrupar';

type Props = {
  asociaciones: AsociacionCarreraDepartamento[];
  onDelete: (id: number) => Promise<void>;
};

function etiquetaCarrera(asoc: AsociacionCarreraDepartamento): string {
  const c = asoc.carrera;
  if (!c?.nombre) return 'Carrera sin nombre en catálogo';
  const partes = [c.nombre];
  if (c.plan) partes.push(`(${c.plan})`);
  if (c.clave) partes.push(`— ${c.clave}`);
  return partes.join(' ');
}

export default function CarreraDepartamentoTable({ asociaciones, onDelete }: Props) {
  const grupos = agruparAsociacionesPorDepartamento(asociaciones);

  if (grupos.length === 0) {
    return (
      <p className="text-muted" style={{ fontSize: 14 }}>
        No hay asociaciones registradas.
      </p>
    );
  }

  return (
    <div className="carrera-depto-grupos">
      {grupos.map((grupo) => (
        <div key={grupo.departamentoId} className="card mb-4">
          <h4 className="font-semibold mb-3" style={{ fontSize: 16 }}>
            {grupo.nombreDepartamento}
            <span className="text-muted font-normal" style={{ fontSize: 13, marginLeft: 8 }}>
              ({grupo.asociaciones.length}{' '}
              {grupo.asociaciones.length === 1 ? 'carrera' : 'carreras'})
            </span>
          </h4>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Carrera</th>
                  <th>Plan</th>
                  <th>Clave</th>
                  <th style={{ width: 120 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {grupo.asociaciones.map((asoc) => (
                  <tr key={asoc.id}>
                    <td>{asoc.carrera?.nombre ?? '—'}</td>
                    <td>{asoc.carrera?.plan ?? '—'}</td>
                    <td>{asoc.carrera?.clave ?? '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        title={etiquetaCarrera(asoc)}
                        onClick={() => void onDelete(asoc.id)}
                      >
                        Eliminar
                      </button>
                    </td>
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
