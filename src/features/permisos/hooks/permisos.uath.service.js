import api from "../../../shared/api/axios";

// Usuarios servidor
export const getUsuariosServidor = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/permisos/usuarios-servidor?${query}`).then((r) => r.data);
};
export const crearUsuarioServidor = (data) =>
  api.post("/permisos/usuarios-servidor", data).then((r) => r.data);
export const toggleUsuarioServidor = (id, activo) =>
  api.put(`/permisos/usuarios-servidor/${id}`, { activo }).then((r) => r.data);

// Reset contraseña
export const resetPasswordServidor = (servidorId, password) =>
  api.patch(`/servidores/${servidorId}/reset-password`, { password }).then((r) => r.data);

// Servidor manual (origen='MANUAL'): edición de los datos con los que
// se creó, usados luego al generar una Acción de Personal.
export const getServidorManual = (servidorId) =>
  api.get(`/servidores/manual/${servidorId}`).then((r) => r.data);
export const actualizarServidorManual = (servidorId, data) =>
  api.put(`/servidores/manual/${servidorId}`, data).then((r) => r.data);

// Saldos
export const getSaldos = () => api.get("/permisos/saldos").then((r) => r.data);
export const crearSaldo = (data) =>
  api.post("/permisos/saldos", data).then((r) => r.data);

// Jefes
export const getJefes = () => api.get("/permisos/jefes").then((r) => r.data);
export const asignarJefe = (data) =>
  api.post("/permisos/jefes", data).then((r) => r.data);

export const crearJefeFirmante = (data) =>
  api.post("/permisos/jefes-firmante", data).then((r) => r.data);
