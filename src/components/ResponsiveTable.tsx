'use client';
import React from 'react';

type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

export default function ResponsiveTable<T extends Record<string, any>>(props: {
  columns: Column<T>[];
  rows: T[];
  idKey?: string; // key para el atributo key
}) {
  const { columns, rows, idKey = 'id' } = props;

  return (
    <div className="table-wrapper page-section">
      {/* DESKTOP TABLE */}
      <table>
        <thead>
          <tr>
            {columns.map((c) => <th key={c.key}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r[idKey] ?? JSON.stringify(r))}>
              {columns.map((c) => (
                <td key={c.key}>
                  {c.render ? c.render(r) : String(r[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* MOBILE CARDS */}
      <div className="table-cards" aria-hidden={false}>
        {rows.map((r) => (
          <div className="table-card" key={String(r[idKey] ?? JSON.stringify(r))}>
            {columns.map((c) => (
              <div className="row" key={c.key}>
                <div className="label">{c.header}</div>
                <div className="value">{c.render ? c.render(r) : String(r[c.key] ?? '')}</div>
              </div>
            ))}
            {/* opcional area de acciones (si usas columna key 'actions') */}
          </div>
        ))}
      </div>
    </div>
  );
}
