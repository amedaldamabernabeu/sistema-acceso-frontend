 'use client'
import React, { useEffect, useState } from 'react';
import {
  getDepartamentos,
  getCarreras,
  getCarreraDepartamento,
  createCarreraDepartamento,
  deleteCarreraDepartamento,
} from '../services/api';
import CarreraDepartamentoForm from './CarreraDepartamentoForm';
import CarreraDepartamentoTable from './CarreraDepartamentoTable';

export default function CarreraDepartamentoPageClient() {
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [carreras, setCarreras] = useState<any[]>([]);
  const [asociaciones, setAsociaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [depRes, carRes, relRes] = await Promise.all([
        getDepartamentos(),
        getCarreras(),
        getCarreraDepartamento(),
      ]);
      setDepartamentos(depRes.data || []);
      setCarreras(carRes.data || []);
      setAsociaciones(relRes.data || []);
    } catch (err) {
      console.error(err);
      alert('Error al cargar datos desde el backend. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (departamentoId: number, carreraId: number) => {
    // Carrera.id puede venir como string (bigint) o number. Aseguramos Number.
    const payload = {
      departamentoId,
      carreraId: Number(carreraId),
    };
    await createCarreraDepartamento(payload);
    await fetchAll();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Eliminar asociación?')) return;
    await deleteCarreraDepartamento(id);
    await fetchAll();
  };

  return (
    <div>
      <div className="card">
        <h3>Crear asociación</h3>
        <CarreraDepartamentoForm departamentos={departamentos} carreras={carreras} onCreate={handleCreate} />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Asociaciones</h3>
        {loading ? <p>Cargando...</p> : <CarreraDepartamentoTable asociaciones={asociaciones} onDelete={handleDelete} />}
      </div>
    </div>
  );
}
