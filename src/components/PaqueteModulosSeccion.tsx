'use client';

import { useRouter } from 'next/navigation';
import type { PaqueteDashboard } from '@/data/dashboard-paquetes';

type Props = {
  paq: PaqueteDashboard;
};

/** Una tarjeta de paquete con la rejilla de módulos (mismo patrón que el dashboard). */
export default function PaqueteModulosSeccion({ paq }: Props) {
  const router = useRouter();
  const IconPaquete = paq.icon;

  return (
    <section className="card dashboard-paquete">
      <div className="dashboard-paquete-head">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${paq.color}22`,
          }}
        >
          <IconPaquete size={22} color={paq.color} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{paq.titulo}</h3>
          <p
            style={{
              margin: '0.15rem 0 0',
              fontSize: 13,
              color: '#64748b',
            }}
          >
            {paq.descripcion}
          </p>
        </div>
      </div>
      <div className="dashboard-paquete-grid">
        {paq.modulos.map((m) => {
          const ModIcon = m.icon;
          return (
            <div
              key={m.href}
              role="button"
              tabIndex={0}
              className="card dashboard-modulo-card"
              onClick={() => router.push(m.href)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push(m.href);
                }
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${m.color}20`,
                }}
              >
                <ModIcon size={26} color={m.color} />
              </div>
              <h4 style={{ margin: 0, fontSize: 16 }}>{m.title}</h4>
              <p
                style={{
                  margin: 0,
                  color: '#64748b',
                  fontSize: 13,
                  lineHeight: 1.35,
                }}
              >
                {m.description}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  marginTop: 8,
                  background: m.color,
                  borderColor: m.color,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(m.href);
                }}
              >
                Ir al módulo
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
