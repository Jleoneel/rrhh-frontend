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

// Dar de baja / reactivar un servidor (despedido o se retiró del hospital).
// No puede iniciar sesión ni se le pueden crear nuevas Acciones de Personal.
export const toggleActivoServidor = (servidorId, activo) =>
  api
    .patch(`/servidores/${servidorId}/activo`, { activo })
    .then((r) => r.data);

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
export const actualizarSaldo = (id, data) =>
  api.put(`/permisos/saldos/${id}`, data).then((r) => r.data);

// Jefes
export const getJefes = () => api.get("/permisos/jefes").then((r) => r.data);
export const asignarJefe = (data) =>
  api.post("/permisos/jefes", data).then((r) => r.data);

export const crearJefeFirmante = (data) =>
  api.post("/permisos/jefes-firmante", data).then((r) => r.data);

// Unidades orgánicas manuales (no provienen del distributivo)
export const crearUnidadOrganica = (data) =>
  api.post("/permisos/unidades-organicas", data).then((r) => r.data);
export const toggleActivoUnidad = (unidadId, activo) =>
  api
    .patch(`/permisos/unidades-organicas/${unidadId}/activo`, { activo })
    .then((r) => r.data);
export const asignarServidorAUnidad = (unidadId, servidorId) =>
  api
    .post(`/permisos/unidades-organicas/${unidadId}/asignar-servidor`, {
      servidor_id: servidorId,
    })
    .then((r) => r.data);
export const getServidoresDeUnidad = (unidadId) =>
  api
    .get(`/permisos/unidades-organicas/${unidadId}/servidores`)
    .then((r) => r.data);

// Días de vacación anuales que acumula este servidor. diasVacacionAnual=null
// revierte al default del sistema (30).
export const actualizarDiasVacacionServidor = (servidorId, diasVacacionAnual) =>
  api
    .patch(`/permisos/servidores/${servidorId}/dias-vacacion`, {
      dias_vacacion_anual: diasVacacionAnual,
    })
    .then((r) => r.data);

// Posibles duplicados entre unidades manuales y el distributivo oficial
export const getPosiblesDuplicados = () =>
  api.get("/permisos/unidades-posibles-duplicados").then((r) => r.data);
export const descartarDuplicado = (unidadManualId, unidadExcelId) =>
  api
    .post("/permisos/unidades-posibles-duplicados/descartar", {
      unidad_manual_id: unidadManualId,
      unidad_excel_id: unidadExcelId,
    })
    .then((r) => r.data);
