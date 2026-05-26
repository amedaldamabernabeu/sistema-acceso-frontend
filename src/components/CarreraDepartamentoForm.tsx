'use client';

import { yaTieneNotificacionError } from '@/lib/ya-tiene-notificacion-error';
import { idsCarrerasAsociadas } from '@/lib/carrera-departamento-agrupar';
import React, { useMemo, useState } from 'react';

type Props = {
  departamentos: { clave_depto?: number; id?: number; nombre_depto?: string; nombre?: string }[];
  carreras: { id: number | string; nombre?: string; plan?: string; clave?: string }[];
  asociaciones: { carreraId: number | string | bigint }[];
  onCreate: (departamentoId: number, carreraId: number) => Promise<void>;
};

export default function CarreraDepartamentoForm({
  departamentos,
  carreras,
  asociaciones,
  onCreate,
}: Props) {
  const [departamentoId, setDepartamentoId] = useState(0);
  const [carreraId, setCarreraId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const carrerasDisponibles = useMemo(() => {
    const ocupadas = idsCarrerasAsociadas(asociaciones);
    return carreras.filter((c) => !ocupadas.has(String(c.id)));
  }, [carreras, asociaciones]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    if (!departamentoId || !carreraId) {
      setMensaje('Seleccione departamento y carrera.');
      return;
    }
    setLoading(true);
    try {
      await onCreate(departamentoId, carreraId);
      setDepartamentoId(0);
      setCarreraId(0);
    } catch (err: unknown) {
      if (!yaTieneNotificacionError(err)) {
        const ax = err as { response?: { data?: { message?: string | string[] } } };
        const msg = ax.response?.data?.message;
        setMensaje(
          Array.isArray(msg)
            ? msg.join(', ')
            : typeof msg === 'string'
              ? msg
              : 'Error al crear la asociación.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)}>
      {mensaje && (
        <p className="small mb-3" style={{ color: '#b45309' }} role="alert">
          {mensaje}
        </p>
      )}
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <div className="form-control mb-0" style={{ flex: '1 1 220px' }}>
          <label>Departamento</label>
          <select
            className="input"
            value={departamentoId}
            onChange={(e) => setDepartamentoId(Number(e.target.value))}
          >
            <option value={0}>Selecciona departamento</option>
            {departamentos.map((d) => (
              <option key={d.clave_depto ?? d.id} value={d.clave_depto ?? d.id}>
                {d.nombre_depto ?? d.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-control mb-0" style={{ flex: '1 1 280px' }}>
          <label>Carrera</label>
          <select
            className="input"
            value={carreraId}
            onChange={(e) => setCarreraId(Number(e.target.value))}
          >
            <option value={0}>
              {carrerasDisponibles.length === 0
                ? 'No hay carreras disponibles'
                : 'Selecciona carrera'}
            </option>
            {carrerasDisponibles.map((c) => (
              <option key={String(c.id)} value={Number(c.id)}>
                {c.nombre} {c.plan ? `(${c.plan})` : ''} {c.clave ? `— ${c.clave}` : ''}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary mb-0"
          disabled={loading || carrerasDisponibles.length === 0}
        >
          {loading ? 'Guardando…' : 'Asociar'}
        </button>
      </div>
      <p className="text-muted small mt-2 mb-0">
        Cada carrera solo puede pertenecer a un departamento. Las ya asignadas no aparecen en la lista.
      </p>
    </form>
  );
}
