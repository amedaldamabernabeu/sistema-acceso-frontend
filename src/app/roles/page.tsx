import ProtectedClient from '../../components/ProtectedClient';
import RolesList from '../../components/RolesList';

export default function RolesPage() {
  return (
    <ProtectedClient>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <RolesList />
      </div>
    </ProtectedClient>
  );
}
