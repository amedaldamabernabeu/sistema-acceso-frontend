// src/components/NavbarWrapper.tsx
'use client';
import React from 'react';
import { useAuth } from './auth/AuthProvider';
import AuthNavbar from './AuthNavbar';

/**
 * Wrapper cliente que decide si renderizar la navbar.
 * IMPORTANTE: este archivo **es client** y por eso puede usar useAuth().
 */
export default function NavbarWrapper() {
  const { token } = useAuth();

  // Solo mostramos la navbar si hay token (logueado)
  if (!token) return null;
  return <AuthNavbar />;
}
