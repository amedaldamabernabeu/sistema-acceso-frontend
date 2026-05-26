import ProtectedClient from '@/components/ProtectedClient';
import ReportesPanel from '@/components/ReportesPanel';

export default function ReportesPage() {
  return (
    <ProtectedClient>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <ReportesPanel />
      </div>
    </ProtectedClient>
  );
}
