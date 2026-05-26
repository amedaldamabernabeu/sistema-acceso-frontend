'use client';

import { Suspense } from 'react';
import ScannerVisitantes from '@/components/ScannerVisitantes';
import ProtectedClient from '@/components/ProtectedClient';

export default function SeguridadScannerPage() {
  return (
    <ProtectedClient>
      <Suspense
        fallback={
          <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Cargando…</p>
          </div>
        }
      >
        <ScannerVisitantes />
      </Suspense>
    </ProtectedClient>
  );
}
