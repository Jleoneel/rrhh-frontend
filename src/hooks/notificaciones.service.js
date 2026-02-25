import api from "../api/axios";

/**
 * Registrar notificación al servidor público de la acción de personal
 */
export const registrarNotificacion = async (data) => {
  const { accion_id, fecha, hora, medio, nombre, puesto } = data;
  
  const payload = {
    accion_id,
    fecha,
    hora,
    medio,
    nombre,
    puesto  };

  console.log("📤 Enviando datos al backend:", payload);
  console.log("📡 URL:", "/notificaciones");
  
  try {
    const res = await api.post("/notificaciones", payload);
    console.log("✅ Respuesta del backend:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error en la petición:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Consultar notificación por acción
 */
export const getNotificacionByAccion = async (accionId) => {
  console.log("📡 Consultando notificación para accionId:", accionId);
  try {
    const res = await api.get(`/notificaciones/${accionId}`);
    console.log("✅ Respuesta de consulta:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error en consulta:", error.response?.data || error.message);
    throw error;
  }
};
