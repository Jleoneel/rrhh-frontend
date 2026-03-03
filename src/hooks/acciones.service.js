import api from "../api/axios";

//* Servicio para manejar acciones de personal */
export const getAcciones = async (filters = {}) => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== "" && v !== undefined && v !== null
    )
  );

  const response = await api.get("/acciones", { params });
  return response.data;
};

//crear acción principal (BORRADOR)
export const crearAccion = async ({
  cedula,
  puestoId = null,
  tipoAccionNombre,
  tipoAccionOtroDetalle = null,
  rigeDesde,
  rigeHasta = null,
  motivo,
  presentoDeclaracionJurada = false,
  procesoInstitucionalId = null,
  nivelGestionId = null,

}) => {
  const procesoId = procesoInstitucionalId  || null;

  const payload = {
    cedula,
    puestoId,
    tipoAccionNombre,
    tipoAccionOtroDetalle,
    rigeDesde,
    rigeHasta,
    motivo,
    presentoDeclaracionJurada,
    procesoInstitucionalId: procesoId,
    nivelGestionId: nivelGestionId,
  };

  const res = await api.post("/acciones", payload);
  return res.data;
};

 // Obtener situación propuesta (Step 3)
export const getSituacionPropuesta = async (accionId) => {
  const res = await api.get(`/acciones/${accionId}/propuesta`);
  return res.data;
};
/**
 * Actualizar acción principal (BORRADOR)
 */
export const updateAccion = async (accionId, data) => {
  const payload = {
    tipoAccionNombre: data.tipoAccionNombre,
    tipoAccionOtroDetalle: data.tipoAccionOtroDetalle,
    rigeDesde: data.rigeDesde,
    rigeHasta: data.rigeHasta,
    motivo: data.motivo,
    presentoDeclaracionJurada: data.presentoDeclaracionJurada,

    // 🔥 ESTA ES LA CLAVE
    procesoInstitucionalId:
      data.situacionActual?.proceso_institucional_id ?? null,
    nivelGestionId: data.situacionActual?.nivel_gestion_id ?? null,
  };

  const res = await api.put(`/acciones/${accionId}`, payload);
  return res.data;
};

/**
 * Guardar / actualizar situación propuesta (BORRADOR)
 */
export const saveSituacionPropuesta = async (accionId, data) => {
  const res = await api.put(`/acciones/${accionId}/propuesta`, data);
  return res.data;
};
