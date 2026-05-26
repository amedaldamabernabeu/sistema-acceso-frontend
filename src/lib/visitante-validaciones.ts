import { filtrarTextoSoloNombre } from '@/lib/suspension-validaciones';
import { eventoEsAsignableAVisitante } from '@/lib/evento-asignable-visitante';

export {
  filtrarTextoSoloNombre,
  PATRON_NOMBRE_HTML as PATRON_NOMBRE_VISITANTE_HTML,
} from '@/lib/suspension-validaciones';

const REGEX_NOMBRE_VISITANTE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,}$/;

export function filtrarTextoSoloTelefono(valor: string): string {
  return valor.replace(/\D/g, '');
}

const EMAIL_VISITANTE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizarCorreoVisitante(correo: string): string {
  return correo.trim().toLowerCase();
}

export function correoVisitanteValido(correo: string): boolean {
  return EMAIL_VISITANTE.test(normalizarCorreoVisitante(correo));
}

export function telefonoVisitanteValido(telefono: string): boolean {
  const digitos = filtrarTextoSoloTelefono(telefono);
  return /^\d{10,15}$/.test(digitos);
}

export function validarFormularioRegistroVisitante(datos: {
  nombre: string;
  correo: string;
  telefono: string;
  areaVisitar: string;
  eventoId?: string;
  eventosCatalogo?: { id: number; fechaHora?: string | null }[];
}): string | null {
  const nombre = filtrarTextoSoloNombre(datos.nombre).trim();
  if (nombre.length < 2) {
    return 'El nombre solo puede contener letras y espacios (mínimo 2 caracteres).';
  }
  if (!REGEX_NOMBRE_VISITANTE.test(nombre)) {
    return 'El nombre solo puede contener letras y espacios (mínimo 2 caracteres).';
  }
  if (!correoVisitanteValido(datos.correo)) {
    return 'El correo electrónico no tiene un formato válido.';
  }
  if (!telefonoVisitanteValido(datos.telefono)) {
    return 'El teléfono debe tener al menos 10 dígitos numéricos.';
  }
  if (!datos.areaVisitar.trim()) {
    return 'Indique el área a visitar.';
  }
  if (datos.eventoId) {
    const seleccionado = datos.eventosCatalogo?.find(
      (ev) => String(ev.id) === datos.eventoId,
    );
    if (seleccionado && !eventoEsAsignableAVisitante(seleccionado.fechaHora)) {
      return 'No se puede asignar un evento que ya finalizó.';
    }
  }
  return null;
}

export function payloadRegistroVisitanteDesdeFormulario(datos: {
  nombre: string;
  correo: string;
  telefono: string;
  areaVisitar: string;
  eventoId?: string;
}) {
  return {
    nombre: filtrarTextoSoloNombre(datos.nombre).trim().replace(/\s+/g, ' '),
    correo: normalizarCorreoVisitante(datos.correo),
    telefono: filtrarTextoSoloTelefono(datos.telefono),
    areaVisitar: datos.areaVisitar.trim(),
    ...(datos.eventoId ? { eventoId: Number(datos.eventoId) } : {}),
  };
}

/** Payload PATCH: permite quitar evento con `eventoId: null`. */
export function payloadActualizarVisitanteDesdeFormulario(datos: {
  nombre: string;
  correo: string;
  telefono: string;
  areaVisitar: string;
  eventoId?: string;
}) {
  return {
    ...payloadRegistroVisitanteDesdeFormulario(datos),
    eventoId: datos.eventoId ? Number(datos.eventoId) : null,
  };
}
