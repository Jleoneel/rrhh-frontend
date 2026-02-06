import api from "./axios";

const dashboardAPI = {
  getAccionesResumen: async () => {
    try {
      const response = await api.get("/dashboard/acciones-resumen");
      return response.data;
    } catch (error) {
    }
  },
};

export default dashboardAPI;