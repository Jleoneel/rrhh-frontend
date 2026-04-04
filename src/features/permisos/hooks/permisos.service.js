import api from "../../../shared/api/axios";

export const getMiSaldo = () => api.get("/permisos/mi-saldo").then(r => r.data);
export const getMisPermisos = () => api.get("/permisos/mis-permisos").then(r => r.data);
export const getTiposPermiso = () => api.get("/permisos/tipos").then(r => r.data);
export const solicitarPermiso = (data) => api.post("/permisos/solicitar", data).then(r => r.data);
export const cancelarPermiso = (id) => api.put(`/permisos/${id}/cancelar`).then(r => r.data);