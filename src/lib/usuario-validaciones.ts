import { filtrarTextoSoloNombre } from '@/lib/suspension-validaciones';

export function normalizarEmailUsuario(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_USUARIO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailUsuarioFormatoValido(email: string): boolean {
  return EMAIL_USUARIO.test(normalizarEmailUsuario(email));
}

export function emailUsuarioDuplicado(
  usuarios: { id: number; email: string }[],
  email: string,
  excluirId = 0,
): boolean {
  const clave = normalizarEmailUsuario(email);
  if (!clave) return false;
  return usuarios.some(
    (u) =>
      u.id !== excluirId &&
      normalizarEmailUsuario(u.email) === clave,
  );
}

export function normalizarNombreUsuario(name?: string): string | null {
  const limpio = filtrarTextoSoloNombre(name ?? '').trim();
  if (!limpio) return null;
  return limpio.replace(/\s+/g, ' ');
}

const NOMBRE_USUARIO = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{2,}$/;

export function nombreUsuarioFormatoValido(name?: string): boolean {
  const limpio = normalizarNombreUsuario(name);
  if (limpio === null) return true;
  return NOMBRE_USUARIO.test(limpio);
}

export function nombreUsuarioDuplicado(
  usuarios: { id: number; name?: string | null }[],
  name: string | null,
  excluirId = 0,
): boolean {
  const clave = normalizarNombreUsuario(name ?? undefined);
  if (!clave) return false;
  return usuarios.some((u) => {
    if (u.id === excluirId) return false;
    const otro = normalizarNombreUsuario(u.name ?? undefined);
    return otro !== null && otro.toLowerCase() === clave.toLowerCase();
  });
}
