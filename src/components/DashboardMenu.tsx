'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import {
  BookOpen,
  Users,
  ShieldCheck,
  KeyRound,
  Laptop,
  CalendarDays,
  FileSearch,
  Ban,
  Cog,
  ClipboardList,
  NotebookPen,
} from 'lucide-react';

type ModuleItem = {
  title: string;
  description: string;
  href: string;
  color: string;
  icon: any;
};

const modules: ModuleItem[] = [
  {
    title: 'Carrera - Departamento',
    description: 'Asociar carreras con sus respectivos departamentos académicos.',
    href: '/carrera-departamento',
    color: '#2563eb',
    icon: BookOpen,
  },
  {
    title: 'Usuarios',
    description: 'Gestiona las cuentas de usuario registradas en el sistema.',
    href: '/users',
    color: '#16a34a',
    icon: Users,
  },
  {
    title: 'Roles',
    description: 'Define los roles del sistema y asigna permisos.',
    href: '/roles',
    color: '#f59e0b',
    icon: ShieldCheck,
  },
  {
    title: 'Permisos',
    description: 'Controla qué acciones puede realizar cada rol.',
    href: '/permissions',
    color: '#7c3aed',
    icon: KeyRound,
  },
  {
    title: 'Modos de acceso',
    description: 'Gestiona los modos de entrada y salida del centro.',
    href: '/modo-acceso',
    color: '#c91862',
    icon: Cog,
  },
  {
    title: 'Registros de acceso',
    description: 'Consulta y administra los registros de acceso.',
    href: '/registro-acceso',
    color: '#6a70c2',
    icon: FileSearch,
  },
  {
    title: 'Suspensiones',
    description: 'Gestiona las suspensiones activas.',
    href: '/suspension',
    color: '#c26a6a',
    icon: Ban,
  },
  {
    title: 'Tipos de Ingreso',
    description: 'Administra los tipos de dispositivos de ingreso.',
    href: '/tipos-ingreso',
    color: '#7fc26a',
    icon: Laptop,
  },
  {
    title: 'Dispositivos de acceso',
    description: 'Controla los dispositivos de acceso.',
    href: '/dispositivos-acceso',
    color: '#d0d4ce',
    icon: CalendarDays,
  },
  {
    title: 'Eventos',
    description: 'Gestiona los eventos del centro.',
    href: '/eventos',
    color: '#e2510e',
    icon: ClipboardList,
  },
  {
    title: 'Notas',
    description: 'Gestiona notas asociadas a eventos y accesos.',
    href: '/notas',
    color: '#392bb6',
    icon: NotebookPen,
  }
];

export default function DashboardMenu() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>

      {/* ======================= ENCABEZADO ======================= */}
      <div
        style={{
          width: "100%",
          height: 90,
          borderRadius: 12,
          backgroundImage: "url('/tu-imagen.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* Capa oscura para suavizar */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(2px)",
          }}
        />

        {/* LETRERO MARQUEE */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "inline-block",
              paddingLeft: "100%",
              animation: "marquee 15s linear infinite",
              fontSize: 28,
              fontWeight: "bold",
              color: "white",
              letterSpacing: 1,
            }}
          >
            Sistema de gestión de acceso al Centro Universitario de Los Valles (CUVALLES)
          </div>
        </div>
      </div>

      <style>
        {`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        `}
      </style>

      {/* ======================= TARJETAS SUPERIORES ======================= */}
      <div
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}
      >
        {[
          { title: 'Entradas hoy', value: 0, color: '#16a34a' },
          { title: 'Salidas hoy', value: 0, color: '#2563eb' },
          { title: 'Usuarios activos', value: 0, color: '#7c3aed' },
          { title: 'Suspensiones', value: 0, color: '#dc2626' },
        ].map((kpi) => (
          <div
            key={kpi.title}
            style={{
              padding: 20,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 8px 20px rgba(2,6,23,0.08)',
              border: '1px solid rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 16, color: '#6b7280', fontWeight: "bold" }}>
              {kpi.title}
            </span>
            <strong style={{ fontSize: 32, color: kpi.color }}>{kpi.value}</strong>
          </div>
        ))}
      </div>

      {/* ======================= MODULOS ======================= */}
      <div
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        }}
      >
        {modules.map((m) => (
          <div
            key={m.href}
            role="button"
            onClick={() => router.push(m.href)}
            onKeyDown={(e) => { if (e.key === 'Enter') router.push(m.href); }}
            tabIndex={0}
            style={{
              cursor: 'pointer',
              padding: 20,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 8px 20px rgba(2,6,23,0.08)',
              border: '1px solid rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 10,
              transition: 'transform .12s ease, box-shadow .12s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 34px rgba(2,6,23,0.12)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(2,6,23,0.08)';
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `${m.color}20`,
              }}
            >
              <m.icon size={28} color={m.color} />
            </div>

            <h3 style={{ margin: 0, fontSize: 18 }}>{m.title}</h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
              {m.description}
            </p>

            <button
              onClick={(e) => { e.stopPropagation(); router.push(m.href); }}
              style={{
                marginTop: 12,
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                background: m.color,
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Ir al módulo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
