import LoginForm from '../../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="center-page">
      <div className="card"><h2>Iniciar sesión</h2><LoginForm redirectAfter="/" /></div>
    </div>
  );
}