import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

//ADJUNTA TOKEN
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//MANEJO DE TOKENS EXPIRADOS
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      localStorage.clear();
      then(() => {
        window.location.href = "/login";
      });
    }
    return Promise.reject(error);
  },
);

export default api;
