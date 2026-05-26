'use client';
import { yaTieneNotificacionError } from '@/lib/ya-tiene-notificacion-error';
import React, { useEffect, useMemo, useState } from 'react';
import { filtrarPorTexto } from '@/lib/filtrar-por-texto';
import FiltroTabla from '@/components/FiltroTabla';
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
  const [busquedaTabla, setBusquedaTabla] = useState('');
  const asociacionesFiltradas = useMemo(
    () =>
      filtrarPorTexto(asociaciones, busquedaTabla, (a) =>
        [
          a.departamento?.nombre_depto,
          a.departamento?.nombre,
          a.carrera?.nombre,
          a.carrera?.plan,
          a.carrera?.clave,
        ].join(' '),
      ),
    [asociaciones, busquedaTabla],
  );

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
      if (!yaTieneNotificacionError(err)) {
        alert('Error al cargar datos desde el backend. Revisa la consola.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (departamentoId: number, carreraId: number) => {
    const payload = {
      departamentoId,
      carreraId: Number(carreraId),
    };
    await createCarreraDepartamento(payload);
    await fetchAll();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta asociación carrera — departamento?')) return;
    try {
      await deleteCarreraDepartamento(id);
      await fetchAll();
    } catch (err) {
      console.error(err);
      if (!yaTieneNotificacionError(err)) {
        alert('No se pudo eliminar la asociación.');
      }
    }
  };

  return (
    <div>
      <div className="card">
        <h3>Crear asociación</h3>
        <CarreraDepartamentoForm
          departamentos={departamentos}
          carreras={carreras}
          asociaciones={asociaciones}
          onCreate={handleCreate}
        />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Asociaciones por departamento</h3>
        <p className="text-muted small mb-4">
          Carreras agrupadas bajo cada departamento. Puede eliminar cada vínculo sin afectar al resto del mismo departamento.
        </p>
        <FiltroTabla
          valor={busquedaTabla}
          onChange={setBusquedaTabla}
          placeholder="Buscar por departamento o carrera…"
        />
        {loading ? (
          <p>Cargando…</p>
        ) : asociaciones.length > 0 && asociacionesFiltradas.length === 0 ? (
          <p className="text-muted" style={{ fontSize: 14 }}>
            Sin resultados para la búsqueda.
          </p>
        ) : (
          <CarreraDepartamentoTable
            asociaciones={asociacionesFiltradas}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
