import { useEffect, useState, useCallback } from "react";
import api from "../../../shared/api/axios";

export default function useFirmasAccion(accionId, enabled = true) {
  const [firmas, setFirmas] = useState([]);
  const [pendiente, setPendiente] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFirmas = useCallback(async () => {
    if (!accionId) return;

    setLoading(true);
    try {
      const rFirmas = await api.get(`/firmas/acciones/${accionId}`);
      setFirmas(rFirmas.data.items || []);

      const rPend = await api.get(`/firmas/acciones/${accionId}/pendiente`);
      setPendiente(rPend.data);
    } catch (err) {
      console.error("Error cargando firmas:", err);
    } finally {
      setLoading(false);
    }
  }, [accionId]);

  useEffect(() => {
    if (enabled && accionId) {
      fetchFirmas();
    }
  }, [accionId, enabled, fetchFirmas]);

  return {
    firmas,
    pendiente,
    loading,
    refresh: fetchFirmas,
  };
}
