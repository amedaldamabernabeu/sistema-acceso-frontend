'use client';
import LoginForm from '../components/LoginForm';
import DashboardMenu from '../components/DashboardMenu';
import { useAuth } from '../components/auth/AuthProvider';

export default function HomePage() {
  const { token } = useAuth();

  if (!token) {
    return (
      <div className="center-page" style={{ backgroundImage: "url('/fondo.jpg')" }}>
        <div className="card">
          <h2>Iniciar sesión</h2>
          <LoginForm redirectAfter="/" />
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen w-full"
      style={{
        backgroundImage: "url('/fondo.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
        imageRendering: 'auto',
      }}
    >
      <div className="dashboard-page-shell min-h-screen w-full p-3 sm:p-5 lg:p-6">
        <div className="dashboard-page-panel w-full rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 lg:p-8">
          <DashboardMenu />
        </div>
      </div>
    </main>
  );
}
