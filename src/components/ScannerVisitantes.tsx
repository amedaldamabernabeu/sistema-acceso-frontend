'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { postVisitanteValidarQr, type ResultadoValidacionQr } from '@/services/api';

const COOLDOWN_MS = 3000;

function extraerToken(texto: string): string {
  const t = texto.trim();
  try {
    const u = new URL(t);
    const param = u.searchParams.get('t') ?? u.searchParams.get('token');
    if (param) return param.trim();
  } catch {
    /* no es URL absoluta */
  }
  return t;
}

type Pantalla =
  | { tipo: 'inicio' }
  | { tipo: 'cargando' }
  | {
      tipo: 'resultado';
      resultado: ResultadoValidacionQr;
      mensaje: string;
      visitante?: {
        nombre: string;
        correo: string;
        telefono: string;
        areaVisitar: string;
        eventoNombre: string | null;
        expiraEn: string;
      };
    };

export default function ScannerVisitantes() {
  const params = useSearchParams();
  const tokenUrl = params.get('t') ?? params.get('token');
  const [pantalla, setPantalla] = useState<Pantalla>({ tipo: 'inicio' });
  const ultimoEscaneo = useRef(0);
  const procesando = useRef(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const validar = useCallback(async (textoCrudo: string) => {
    const ahora = Date.now();
    if (ahora - ultimoEscaneo.current < COOLDOWN_MS || procesando.current) {
      return;
    }
    ultimoEscaneo.current = ahora;
    const token = extraerToken(textoCrudo);
    if (!token) return;
    procesando.current = true;
    setPantalla({ tipo: 'cargando' });
    try {
      const res = await postVisitanteValidarQr(token);
      const body = res.data;
      setPantalla({
        tipo: 'resultado',
        resultado: body.resultado,
        mensaje: body.mensaje,
        visitante: body.visitante,
      });
    } catch {
      setPantalla({
        tipo: 'resultado',
        resultado: 'denegado',
        mensaje: 'Error de conexión con el servidor.',
      });
    } finally {
      procesando.current = false;
    }
  }, []);

  useEffect(() => {
    if (!tokenUrl?.trim()) return;
    void validar(tokenUrl);
  }, [tokenUrl, validar]);

  useEffect(() => {
    if (tokenUrl?.trim()) return;
    if (pantalla.tipo !== 'inicio') return;
    const id = 'qr-reader-visitantes';
    const scanner = new Html5QrcodeScanner(
      id,
      { fps: 8, qrbox: { width: 260, height: 260 }, rememberLastUsedCamera: true },
      false,
    );
    scannerRef.current = scanner;
    scanner.render(
      (decoded) => {
        void validar(decoded);
      },
      () => {},
    );
    return () => {
      scanner.clear().catch(() => {});
      scannerRef.current = null;
    };
  }, [tokenUrl, validar, pantalla.tipo]);

  useEffect(() => {
    if (pantalla.tipo !== 'resultado') return;
    if (tokenUrl?.trim()) return;
    const t = setTimeout(() => {
      setPantalla({ tipo: 'inicio' });
    }, COOLDOWN_MS);
    return () => clearTimeout(t);
  }, [pantalla, tokenUrl]);

  function colorFondo(): string {
    if (pantalla.tipo !== 'resultado') return '#0f172a';
    if (pantalla.resultado === 'entrada') return '#14532d';
    if (pantalla.resultado === 'salida') return '#1e3a5f';
    return '#7f1d1d';
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colorFondo(),
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: 16,
        transition: 'background 0.35s ease',
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', margin: 0, fontWeight: 700 }}>
          Escáner visitantes
        </h1>
        <p style={{ opacity: 0.85, fontSize: 14, marginTop: 8 }}>
          {tokenUrl ? 'Validando enlace…' : 'Enfoque el código QR en el recuadro'}
        </p>
      </header>

      {pantalla.tipo === 'cargando' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)', fontWeight: 700 }}>Validando…</p>
        </div>
      )}

      {pantalla.tipo === 'resultado' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
            textAlign: 'center',
            padding: '12px 8px',
          }}
        >
          <p style={{ fontSize: 'clamp(1.75rem, 7vw, 3rem)', fontWeight: 800, lineHeight: 1.2 }}>
            {pantalla.resultado === 'entrada' && 'Entrada permitida'}
            {pantalla.resultado === 'salida' && 'Salida registrada'}
            {pantalla.resultado === 'denegado' && 'Acceso denegado'}
          </p>
          <p style={{ fontSize: 'clamp(1rem, 4vw, 1.35rem)', opacity: 0.95 }}>{pantalla.mensaje}</p>
          {pantalla.visitante && (
            <div
              style={{
                textAlign: 'left',
                maxWidth: 420,
                margin: '0 auto',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: 12,
                padding: 16,
                fontSize: 'clamp(0.95rem, 3.5vw, 1.1rem)',
              }}
            >
              <p style={{ margin: '6px 0' }}>
                <strong>Nombre:</strong> {pantalla.visitante.nombre}
              </p>
              <p style={{ margin: '6px 0' }}>
                <strong>Correo:</strong> {pantalla.visitante.correo}
              </p>
              <p style={{ margin: '6px 0' }}>
                <strong>Teléfono:</strong> {pantalla.visitante.telefono}
              </p>
              <p style={{ margin: '6px 0' }}>
                <strong>Área:</strong> {pantalla.visitante.areaVisitar}
              </p>
              {pantalla.visitante.eventoNombre && (
                <p style={{ margin: '6px 0' }}>
                  <strong>Evento:</strong> {pantalla.visitante.eventoNombre}
                </p>
              )}
              <p style={{ margin: '6px 0' }}>
                <strong>Vence:</strong>{' '}
                {new Date(pantalla.visitante.expiraEn).toLocaleString('es-MX')}
              </p>
            </div>
          )}
          <p className="small" style={{ opacity: 0.75 }}>
            Próximo escaneo disponible en {COOLDOWN_MS / 1000} segundos.
          </p>
        </div>
      )}

      {pantalla.tipo === 'inicio' && !tokenUrl && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div id="qr-reader-visitantes" style={{ width: '100%', maxWidth: 520, margin: '0 auto' }} />
        </div>
      )}
    </div>
  );
}
