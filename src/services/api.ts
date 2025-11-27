import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000',
  timeout: 10000,
});

// interceptor para añadir Authorization si hay token en localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


//Para el loguin
export const authLogin = (payload: { email: string; password: string }) =>
  api.post('/auth/login', payload);
export const getMe = () => api.get('/users/me'); // opcional si tienes /users/me

//------------------------------------------------------------------------------------

/* Usuarios */
// Obtener todos los usuarios
export const getUsers = () => api.get('/users');

// Obtener usuario por ID
export const getUserById = (id: number) => api.get(`/users/${id}`);

// Crear usuario
export const createUser = (data: { email: string; password: string; name?: string }) =>
  api.post('/users', data);

// Actualizar usuario
export const updateUser = (id: number, data: { email?: string; name?: string; active?: boolean }) =>
  api.put(`/users/${id}`, data);

// Eliminar usuario
export const deleteUser = (id: number) => api.delete(`/users/${id}`);

//-------------------------------------------------------------------------------------------------------

/* Roles */

// Asignar rol a un usuario
export const assignRoleToUser = (userId: number, roleId: number) =>
  api.post(`/users/${userId}/roles`, { roleId });

// Remover rol de un usuario
export const removeRoleFromUser = (userId: number, roleId: number) =>
  api.delete(`/users/${userId}/roles/${roleId}`);

// Obtener todos los roles
export const getRoles = () => api.get('/roles');

// Crear rol
export const createRole = (data: { name: string; description?: string }) =>
  api.post('/roles', data);

// Obtener rol por ID
export const getRole = (id: number) => api.get(`/roles/${id}`);

// ✅ Actualizar rol
export const updateRole = (id: number, data: { name?: string; description?: string }) =>
  api.put(`/roles/${id}`, data);

// ✅ Eliminar rol
export const deleteRole = (id: number) =>
  api.delete(`/roles/${id}`);

// Asignar permiso a un rol
export const assignPermissionToRole = (roleId: number, permissionId: number) =>
  api.post(`/roles/${roleId}/permissions`, { permissionId });

// 🔄 (Pendiente de implementar en backend) Eliminar permiso de un rol
// Si luego agregas un endpoint DELETE /roles/:id/permissions/:permissionId
// este sería el formato correcto:
export const removePermissionFromRole = (roleId: number, permissionId: number) =>
  api.delete(`/roles/${roleId}/permissions/${permissionId}`);


//------------------------------------------------------------------------------------------------------

/* Permissions */

//Obtener todos los permisos
export const getPermissions = () => api.get('/permissions');

//Crear un Permiso
export const createPermission = (data: { name: string; description?: string }) =>
  api.post('/permissions', data);

//Actualizar un permiso
//export const updatePermission = (id: number, data: any) => axios.put(`${api}/permissions/${id}`, data);
export const updatePermission = (id: number, data: any) => {
  return api.put(`/permissions/${id}`, data);
};

//Eliminar un Permiso
//export const deletePermission = (id: number) => axios.delete(`${api}/permissions/${id}`);
export const deletePermission = (id: number) =>
  api.delete(`/permissions/${id}`);

//---------------------------------------------------------------------------------------------------------------

//Asociacion de carreras y departamento

//Obtener todos los departamentos
export const getDepartamentos = () => api.get('/academico/departamentos'); // ajusta ruta si es diferente

//Obtener todas las carreras
export const getCarreras = () => api.get('/carreras'); // ajusta ruta si es diferente

//Obtener carreras-departamentos
export const getCarreraDepartamento = () => api.get('/carrera-departamento');

//Crear asociación de carreras-departamentos
export const createCarreraDepartamento = (data: { departamentoId: number; carreraId: number }) =>
  api.post('/carrera-departamento', data);

//Eliminar asociación de carreras-departamentos
export const deleteCarreraDepartamento = (id: number) =>
  api.delete(`/carrera-departamento/${id}`);

//-----------------------------------------------------------------------------------------------------------------

/* Modos de Acceso */

// Obtener todos los modos de acceso
export const getModosAcceso = () => api.get('/access-modes');

// Crear modo de acceso
export const createModoAcceso = (data: { name: string}) =>
  api.post('/access-modes', data);

// Obtener modo de acceso por ID
export const getModoAcceso = (id: number) => api.get(`/access-modes/${id}`);

// Actualizar modo de acceso
export const updateModoAcceso = (id: number, data: { name?: string }) =>
  api.patch(`/access-modes/${id}`, data);

// Eliminar modo de acceso
export const deleteModoAcceso = (id: number) => api.delete(`/access-modes/${id}`);

//-----------------------------------------------------------------------------------------------------------------

// Registro de Acceso

//Listar registros de acceso
export const getRegistrosAcceso = () => api.get('/registro-acceso');

//Actualizar registro de acceso
export const updateRegistroAcceso = (id: number, data: any) =>
  api.patch('/registro-acceso/${id}', data);

//Eliminar registro de acceso
export const deleteRegistroAcceso = (id: number) =>
  api.delete(`/registro-acceso/${id}`);

//--------------------------------------------------------------------------------------------------------------------

// --- SUSPENSIONES ---

//Listado de suspensiones
export async function getSuspensiones() {
  return api.get('/suspension');
}

//Crear suspensiones
export async function createSuspension(data: any) {
  return api.post('/suspension', data);
}


//Actualizar suspensiones
export async function updateSuspension(id: number, data: any) {
  return api.patch(`/suspension/${id}`, data);
}

//Elminar suspensiones
export async function deleteSuspension(id: number) {
  return api.delete(`/suspension/${id}`);
}

//Buscar usuario para suspension
export const buscarUsuarios = (nombre: string) =>
  api.get(`/suspension/usuarios?nombre=${nombre}`);

export default api;

//-------------------------------------------------------------------------------------------------------

// TIPOS DE INGRESO

export const getTiposIngreso = () => api.get('/tipo-ingreso');

export const createTipoIngreso = (data: { nombre: string }) =>
  api.post('/tipo-ingreso', data);

export const updateTipoIngreso = (id: number, data: { nombre: string }) =>
  api.put(`/tipo-ingreso/${id}`, data);

export const deleteTipoIngreso = (id: number) =>
  api.delete(`/tipo-ingreso/${id}`);

//------------------------------------------------------------------------------------------------------

// --- Dispositivos de acceso ---
export async function getDispositivos() {
  return api.get('/dispositivos-acceso');
}

export async function createDispositivo(data: any) {
  return api.post('/dispositivos-acceso', data);
}

export async function updateDispositivo(id: number, data: any) {
  return api.patch(`/dispositivos-acceso/${id}`, data);
}

export async function deleteDispositivo(id: number) {
  return api.delete(`/dispositivos-acceso/${id}`);
}

//-----------------------------------------------------------------------------------------------------

// --- Eventos ---
export async function getEventos() {
  return api.get('/eventos');
}

export async function getEvento(id: number) {
  return api.get(`/eventos/${id}`);
}

export async function createEvento(data: any) {
  return api.post('/eventos', data);
}

export async function updateEvento(id: number, data: any) {
  return api.patch(`/eventos/${id}`, data);
}

export async function deleteEvento(id: number) {
  return api.delete(`/eventos/${id}`);
}

//-------------------------------------------------------------------------------------------------------

// --- Notas ---
export async function getNotas() {
  return api.get('/notas');
}

export async function createNota(data: any) {
  return api.post('/notas', data);
}

export async function updateNota(id: number, data: any) {
  return api.patch(`/notas/${id}`, data);
}

export async function deleteNota(id: number) {
  return api.delete(`/notas/${id}`);
}



