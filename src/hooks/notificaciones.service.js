import api from "../api/axios";

// Registrar una nueva notificación
export const registrarNotificacion = async (data) => {
  const {id, accion_id, fecha, hora, medio, nombre, puesto } = data;
  
  const payload = {
    id,
    accion_id,
    fecha,
    hora,
    medio,
    nombre,
    puesto  };
  try {
    const res = await api.post("/notificaciones", payload);
    return res.data;
  } catch (error) {
    console.error("Error en la petición:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Consultar notificación por acción
 */
export const getNotificacionByAccion = async (accionId) => {
  try {
    const res = await api.get(`/notificaciones/${accionId}`);
    return res.data;
  } catch (error) {
    console.error("Error en consulta:", error.response?.data || error.message);
    throw error;
  }
};
