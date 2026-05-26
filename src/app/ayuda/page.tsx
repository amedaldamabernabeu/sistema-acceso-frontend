import ProtectedClient from '@/components/ProtectedClient';
import AyudaUsuarioPanel from '@/components/AyudaUsuarioPanel';

export default function AyudaPage() {
  return (
    <ProtectedClient>
      <AyudaUsuarioPanel />
    </ProtectedClient>
  );
}
