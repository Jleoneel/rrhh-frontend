import api from "../../../shared/api/axios";

export const getAuditoria = (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null)),
  ).toString();
  return api.get(`/auditoria?${query}`).then((r) => r.data);
};

export const getAccionesAuditoria = () =>
  api.get("/auditoria/acciones").then((r) => r.data);
