import api from "../../shared/api/axios";

export const getTiposAccion = async () => {
  const res = await api.get("/tipos-accion");
  return res.data;
};
