import { useEffect, useState } from "react";
import api from "../../../shared/api/axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function useFirmaNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);

  // Cargar no leídas desde BD al montar
  useEffect(() => {
    api
      .get("/firma-notificaciones")
      .then((res) => setNotificaciones(res.data))
      .catch((err) => console.error("[Notificaciones] Error cargando:", err));
  }, []);

  // SSE en tiempo real
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // endpoint SSE que emite nuevas notificaciones para el usuario autenticado
    const es = new EventSource(
      `${API_BASE}/api/firma-notificaciones/stream?token=${token}`,
    );

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setNotificaciones((prev) => {
          const existe = prev.some((n) => n.accion_id === data.accion_id);
          return existe ? prev : [data, ...prev];
        });
      } catch (err) {console.error("[SSE] Error parseando mensaje:", err);}
    };

    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  const marcarLeida = async (id) => {
    try {
      await api.patch(`/firma-notificaciones/${id}/leer`);
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {console.error("[Notificaciones] Error marcando leída:", e);}
  };

  const marcarTodasLeidas = async () => {
    try {
      await api.patch("/firma-notificaciones/leer-todas");
      setNotificaciones([]);
    } catch (err) {console.error("[Notificaciones] Error marcando todas leídas:", err);}
  };

  return { notificaciones, marcarLeida, marcarTodasLeidas };
}