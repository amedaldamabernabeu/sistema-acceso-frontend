import ProtectedClient from '@/components/ProtectedClient';
import PaqueteDashboardVista from '@/components/PaqueteDashboardVista';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function DashboardPaquetePage({ params }: Props) {
  const { id } = await params;

  return (
    <ProtectedClient>
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '1.25rem 1rem' }}>
        <PaqueteDashboardVista idPaquete={id} />
      </div>
    </ProtectedClient>
  );
}
