import api from "./axios";

const dashboardAPI = {
  getAccionesResumen: async () => {
    try {
      const response = await api.get("/dashboard/acciones-resumen");
      return response.data;
    } catch (error) {
      // log y propaga para que el llamador pueda manejarlo
      console.error("Error al obtener resumen de acciones:", error);
      throw error;
    }
  },
};

export default dashboardAPI;
