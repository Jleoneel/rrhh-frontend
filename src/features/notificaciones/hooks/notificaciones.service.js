import api from "../../../shared/api/axios";

export const registrarNotificacion = async (data) => {
  const { id, accion_id, fecha, hora, medio, nombre, puesto } = data;
  const payload = { id, accion_id, fecha, hora, medio, nombre, puesto };
  const res = await api.post("/notificaciones", payload);
  return res.data;
};

export const getNotificacionByAccion = async (accionId) => {
  const res = await api.get(`/notificaciones/${accionId}`);
  return res.data;
};