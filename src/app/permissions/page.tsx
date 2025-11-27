import ProtectedClient from '../../components/ProtectedClient';
import PermissionsList from '../../components/PermissionsList';

export default function PermissionsPage() {
  return (
    <ProtectedClient>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <PermissionsList />
      </div>
    </ProtectedClient>
  );
}
