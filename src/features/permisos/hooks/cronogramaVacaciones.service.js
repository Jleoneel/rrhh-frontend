import api from "../../../shared/api/axios";

export const getCronograma = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/cronograma-vacaciones?${query}`).then((r) => r.data);
};

export const getBloquesServidor = (servidorId, anio) =>
  api
    .get(`/cronograma-vacaciones/servidor/${servidorId}?anio=${anio}`)
    .then((r) => r.data);

export const crearBloque = (data) =>
  api.post("/cronograma-vacaciones", data).then((r) => r.data);

export const actualizarBloque = (id, data) =>
  api.put(`/cronograma-vacaciones/${id}`, data).then((r) => r.data);

export const eliminarBloque = (id) =>
  api.delete(`/cronograma-vacaciones/${id}`).then((r) => r.data);

export const getCronogramaParaExportar = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return api.get(`/cronograma-vacaciones/exportar?${query}`).then((r) => r.data);
};

export const getUnidadesResumen = (anio) =>
  api
    .get(`/cronograma-vacaciones/unidades-resumen?anio=${anio}`)
    .then((r) => r.data);

// Solo lectura: el propio servidor consultando sus bloques planificados.
export const getMiCronograma = (anio) =>
  api
    .get(`/cronograma-vacaciones/mi-cronograma?anio=${anio}`)
    .then((r) => r.data);
