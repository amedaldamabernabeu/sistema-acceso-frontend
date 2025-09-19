import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from 'react';
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Sistema de Gestión de Acceso',
  description: 'Panel administrativo',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <nav className="navbar">
          <div style={{ fontWeight: 700 }}>Sistema de Acceso</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
            <Link href="/">Inicio</Link>
            <Link href="/carrera-departamento">Carrera - Departamento</Link>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  )
}
