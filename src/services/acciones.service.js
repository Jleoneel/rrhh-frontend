import api from "../api/axios";

/**
 * Listar acciones (tabla principal)
 */
export const getAcciones = async (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== "" && v !== undefined && v !== null
    )
  );

  const response = await api.get("/acciones", { params });
  return response.data;
};

/**
 * Crear acción de personal (BORRADOR)
 */
export const crearAccion = async ({
  cedula,
  puestoId = null,
  tipoAccionNombre,
  tipoAccionOtroDetalle = null,
  rigeDesde,
  rigeHasta = null,
  motivo,
}) => {
  const payload = {
    cedula,
    puestoId,
    tipoAccionNombre,
    tipoAccionOtroDetalle,
    rigeDesde,
    rigeHasta,
    motivo,
  };

  const res = await api.post("/acciones", payload);
  return res.data;
};

/**
 * Obtener situación propuesta (Step 3)
 */
export const getSituacionPropuesta = async (accionId) => {
  const res = await api.get(`/acciones/${accionId}/propuesta`);
  return res.data;
};

/**
 * Guardar / actualizar situación propuesta (BORRADOR)
 */
export const saveSituacionPropuesta = async (accionId, data) => {
  const res = await api.put(`/acciones/${accionId}/propuesta`, data);
  return res.data;
};
