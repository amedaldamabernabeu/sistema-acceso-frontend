import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000',
  timeout: 10000,
});

export const getDepartamentos = () => api.get('/academico/departamentos'); // ajusta ruta si es diferente
export const getCarreras = () => api.get('/carreras'); // ajusta ruta si es diferente
export const getCarreraDepartamento = () => api.get('/carrera-departamento');
export const createCarreraDepartamento = (data: { departamentoId: number; carreraId: number }) =>
  api.post('/carrera-departamento', data);
export const deleteCarreraDepartamento = (id: number) =>
  api.delete(`/carrera-departamento/${id}`);

export default api;
