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
    <main className="min-h-screen bg-[url('/fondo.jpg')] bg-cover bg-center p-10">
      <div className="bg-white/70 rounded-3xl shadow-lg p-10">
        
        <DashboardMenu />
      </div>
    </main>
  );
}
