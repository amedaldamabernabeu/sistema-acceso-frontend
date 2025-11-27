import ProtectedClient from '../../components/ProtectedClient';
import UsersList from '../../components/UsersList';

export default function UsersPage() {
  return (
    <ProtectedClient>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <UsersList />
      </div>
    </ProtectedClient>
  );
}
