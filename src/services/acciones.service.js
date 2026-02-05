import api from "../api/axios";

export const getAcciones = async (filters = {}) => {
  // Limpia undefined/"" para no mandar basura al backend
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined && v !== null)
  );

  const response = await api.get("/acciones", { params });
  return response.data;
};

export const crearAccion = async ({ cedula, tipoAccionNombre, motivo }) => {
  const res = await api.post("/acciones", { cedula, tipoAccionNombre, motivo });
  return res.data;
};
