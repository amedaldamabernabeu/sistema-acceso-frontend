import ProtectedClient from '../../components/ProtectedClient';
import ModoAccesoList from '../../components/ModoAccesoList';

export default function ModoAccesoPage() {
  return (
    <ProtectedClient>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <ModoAccesoList />
      </div>
    </ProtectedClient>
  );
}
