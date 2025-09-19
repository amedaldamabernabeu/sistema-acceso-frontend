 'use client'
import React from 'react';

type Props = {
  asociaciones: any[];
  onDelete: (id: number) => Promise<void>;
};

export default function CarreraDepartamentoTable({ asociaciones, onDelete }: Props) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>ID</th>
          <th style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>Departamento</th>
          <th style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>Carrera</th>
          <th style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>Plan</th>
          <th style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>Clave</th>
          <th style={{ borderBottom: '1px solid #eee' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {asociaciones.map((a) => (
          <tr key={a.id}>
            <td style={{ padding: '8px 4px' }}>{a.id}</td>
            <td style={{ padding: '8px 4px' }}>{a.departamento?.nombre_depto ?? a.departamento?.nombre}</td>
            <td style={{ padding: '8px 4px' }}>{a.carrera?.nombre}</td>
            <td style={{ padding: '8px 4px' }}>{a.carrera?.plan ?? '-'}</td>
            <td style={{ padding: '8px 4px' }}>{a.carrera?.clave ?? '-'}</td>
            <td style={{ padding: '8px 4px' }}>
              <button
                onClick={() => onDelete(a.id)}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 6 }}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
