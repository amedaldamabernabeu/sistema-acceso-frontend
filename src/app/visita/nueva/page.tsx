'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  getVisitantesCatalogoEventos,
  postVisitanteRegistroPublico,
} from '@/services/api';
import ProtectedClient from '@/components/ProtectedClient';
import {
  etiquetaOpcionEventoVisitante,
  filtrarEventosAsignablesVisitante,
} from '@/lib/evento-asignable-visitante';
import {
  filtrarTextoSoloNombre,
  filtrarTextoSoloTelefono,
  PATRON_NOMBRE_VISITANTE_HTML,
  payloadRegistroVisitanteDesdeFormulario,
  validarFormularioRegistroVisitante,
} from '@/lib/visitante-validaciones';

type EventoOpcion = {
  id: number;
  nombre: string;
  fechaHora: string | null;
  ubicacion: string | null;
};

export default function NuevaVisitaPage() {
  const [eventos, setEventos] = useState<EventoOpcion[]>([]);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [areaVisitar, setAreaVisitar] = useState('');
  const [eventoId, setEventoId] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [correoEnviado, setCorreoEnviado] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const res = await getVisitantesCatalogoEventos();
        if (!cancelado) {
          const lista = Array.isArray(res.data) ? res.data : [];
          setEventos(filtrarEventosAsignablesVisitante(lista as EventoOpcion[]));
        }
      } catch {
        if (!cancelado) setEventos([]);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  function limpiarFormulario() {
    setNombre('');
    setCorreo('');
    setTelefono('');
    setAreaVisitar('');
    setEventoId('');
    setError(null);
    setExito(false);
    setCorreoEnviado(null);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setExito(false);
    setCorreoEnviado(null);
    const errorValidacion = validarFormularioRegistroVisitante({
      nombre,
      correo,
      telefono,
      areaVisitar,
      eventoId,
      eventosCatalogo: eventos,
    });
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setCargando(true);
    try {
      const payload = payloadRegistroVisitanteDesdeFormulario({
        nombre,
        correo,
        telefono,
        areaVisitar,
        eventoId,
      });
      const res = await postVisitanteRegistroPublico(payload);
      const data = res.data as { correoEnviado?: boolean };
      setCorreoEnviado(data.correoEnviado ?? true);
      setExito(true);
      setNombre('');
      setCorreo('');
      setTelefono('');
      setAreaVisitar('');
      setEventoId('');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string | string[] } } };
      const msg = ax.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg.join(', ') : typeof msg === 'string' ? msg : 'No se pudo completar el registro.',
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <ProtectedClient>
      <div className="container">
        <div className="formulario-pagina-shell">
          <div className="modal-content modal-content--wide">
            <h3>Registro de visita</h3>
            <p className="formulario-descripcion">
              Complete los datos. Recibirá un correo con su código QR de acceso temporal (72 horas).
            </p>

            {exito && (
              <div className="modal-alerta modal-alerta--exito" role="status">
                <p>Registro exitoso.</p>
                <p className="modal-alerta__detalle">
                  {correoEnviado
                    ? 'Se envió el código QR a su correo electrónico.'
                    : 'Su visita quedó registrada, pero no se pudo enviar el correo (SMTP no configurado). Contacte a recepción o seguridad.'}
                </p>
              </div>
            )}

            {error && (
              <div className="modal-alerta modal-alerta--error" role="alert">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={(e) => void enviar(e)}>
              <div className="form-control">
                <label className="label">Nombre completo</label>
                <input
                  className="input"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(filtrarTextoSoloNombre(e.target.value))}
                  maxLength={200}
                  pattern={PATRON_NOMBRE_VISITANTE_HTML}
                  title="Solo letras y espacios"
                />
              </div>
              <div className="form-control">
                <label className="label">Correo electrónico</label>
                <input
                  className="input"
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value.trim())}
                />
              </div>
              <div className="form-control">
                <label className="label">Teléfono</label>
                <input
                  className="input"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(filtrarTextoSoloTelefono(e.target.value))}
                  inputMode="numeric"
                  maxLength={15}
                  pattern="\d{10,15}"
                  title="Mínimo 10 dígitos numéricos"
                />
              </div>
              <div className="form-control">
                <label className="label">Área a visitar</label>
                <input
                  className="input"
                  required
                  value={areaVisitar}
                  onChange={(e) => setAreaVisitar(e.target.value)}
                  maxLength={300}
                />
              </div>
              <div className="form-control">
                <label className="label">Evento (opcional)</label>
                <select
                  className="input"
                  value={eventoId}
                  onChange={(e) => setEventoId(e.target.value)}
                >
                  <option value="">— Sin evento asociado —</option>
                  {eventos.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {etiquetaOpcionEventoVisitante(ev)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="table-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={limpiarFormulario}
                  disabled={cargando}
                >
                  Limpiar
                </button>
                <button type="submit" className="btn btn-primary" disabled={cargando}>
                  {cargando ? 'Enviando…' : 'Registrar visita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedClient>
  );
}
