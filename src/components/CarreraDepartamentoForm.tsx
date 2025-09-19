 'use client'
import React, { useState } from 'react';

type Props = {
  departamentos: any[];
  carreras: any[];
  onCreate: (departamentoId: number, carreraId: number) => Promise<void>;
};

export default function CarreraDepartamentoForm({ departamentos, carreras, onCreate }: Props) {
  const [departamentoId, setDepartamentoId] = useState<number>(0);
  const [carreraId, setCarreraId] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departamentoId || !carreraId) return alert('Selecciona departamento y carrera');
    setLoading(true);
    try {
      await onCreate(departamentoId, carreraId);
      setDepartamentoId(0);
      setCarreraId(0);
    } catch (err) {
      console.error(err);
      alert('Error al crear la asociación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <select value={departamentoId} onChange={(e) => setDepartamentoId(Number(e.target.value))}>
        <option value={0}>Selecciona Departamento</option>
        {departamentos.map((d: any) => (
          <option key={d.clave_depto ?? d.id} value={d.clave_depto ?? d.id}>
            {d.nombre_depto ?? d.nombre}
          </option>
        ))}
      </select>

      <select value={carreraId} onChange={(e) => setCarreraId(Number(e.target.value))}>
        <option value={0}>Selecciona Carrera</option>
        {carreras.map((c: any) => (
          <option key={String(c.id)} value={Number(c.id)}>
            {c.nombre} {c.plan ? `(${c.plan})` : ''} {c.clave ? `- ${c.clave}` : ''}
          </option>
        ))}
      </select>

      <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Asociar'}</button>
    </form>
  );
}
