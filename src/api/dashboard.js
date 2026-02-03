import api from "./axios";

export const getAccionesResumen = async () => {
  const response = await api.get("/dashboard/acciones-resumen");
  return response.data;
};
