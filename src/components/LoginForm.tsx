'use client';
import { useState } from 'react';
import { authLogin } from '../services/api';
import { useAuth } from './auth/AuthProvider';

type LoginFormProps = { redirectAfter?: string };

export default function LoginForm({ redirectAfter = '/' }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authLogin({ email, password });
      const token = res.data.access_token ?? res.data.token ?? res.data.accessToken;
      if (!token) throw new Error('Token no recibido');
      await auth.login(token);
      // AuthProvider.login guarda el token y carga user; layout/navbar se actualizarán
    } catch (err:any) {
      alert(err?.response?.data?.message || err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <label><span>Email</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label><span>Contraseña</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <div style={{ display:'flex', gap:8, marginTop: 10 }}>
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Ingresando...' : 'Entrar'}</button>
      </div>
    </form>
  );
}
