import CarreraDepartamentoPageClient from '@/components/CarreraDepartamentoPageClient';
import ProtectedClient from '@/components/ProtectedClient';

export default function CarreraDepartamentoPage() {
  return (
    <ProtectedClient>
      <div className="container">
        <h1 className="text-2xl font-bold mb-2">Carreras — departamentos</h1>
        <p className="text-muted mb-8" style={{ fontSize: 14 }}>
          Asocie carreras a departamentos. Una carrera solo puede pertenecer a un departamento.
        </p>
        <CarreraDepartamentoPageClient />
      </div>
    </ProtectedClient>
  );
}