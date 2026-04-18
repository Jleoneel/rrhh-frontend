import { useEffect, useState } from "react";
import api from "../../../shared/api/axios";
import { useAuth } from "../../auth/AuthContext";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "http://localhost:3001");

export function useNotificaciones() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);

  const tipoUsuario = user?.tipo_usuario;
  const esFirmante = tipoUsuario === "FIRMANTE";
  const esServidor = tipoUsuario === "SERVIDOR";
  const esJefeArea = user?.cargo_nombre === "JEFE DE AREA";

  // Cargar al montar
  useEffect(() => {
    if (!user) return;

    const cargar = async () => {
      try {
        const promesas = [];

        // Firmantes UATH/Gerente/Responsable (no Jefe de Área) → firmas + permisos + vacaciones
        if (esFirmante && !esJefeArea) {
          promesas.push(
            api
              .get("/firma-notificaciones")
              .then((r) => r.data.map((n) => ({ ...n, categoria: "FIRMA" }))),
          );
          promesas.push(
            api
              .get("/permisos/notificaciones/firmante")
              .then((r) => r.data.map((n) => ({ ...n, categoria: "PERMISO" }))),
          );
          promesas.push(
            api.get("/permisos/notificaciones/vacaciones-firmante").then(
              (r) => r.data.map((n) => ({ ...n, categoria: "VACACION" })),
            ),
          );
        }
        // Jefe de área → permisos + vacaciones
        else if (esFirmante && esJefeArea) {
          promesas.push(
            api
              .get("/permisos/notificaciones/firmante")
              .then((r) => r.data.map((n) => ({ ...n, categoria: "PERMISO" }))),
          );
          promesas.push(
            api.get("/permisos/notificaciones/vacaciones-firmante").then(
              (r) => r.data.map((n) => ({ ...n, categoria: "VACACION" })),
            ),
          );
        }
        // Servidor → permisos + vacaciones
        else if (esServidor) {
          promesas.push(
            api
              .get("/permisos/notificaciones/servidor")
              .then((r) => r.data.map((n) => ({ ...n, categoria: "PERMISO" }))),
          );
          promesas.push(
            api.get("/permisos/notificaciones/vacaciones-servidor").then(
              (r) => r.data.map((n) => ({ ...n, categoria: "VACACION" })),
            ),
          );
        }

        const resultados = await Promise.all(promesas);
        const todas = resultados
          .flat()
          .sort((a, b) => new Date(b.creada_en) - new Date(a.creada_en));
        setNotificaciones(todas);
      } catch (err) {
        console.error("[Notificaciones] Error cargando:", err);
      }
    };

    cargar();
  }, [user, esFirmante, esJefeArea, esServidor]);

  // SSE firmas (solo UATH/Gerente/Responsable)
  useEffect(() => {
    if (!esFirmante || esJefeArea) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const es = new EventSource(
      `${API_BASE}/api/firma-notificaciones/stream?token=${token}`,
    );

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setNotificaciones((prev) => {
          const existe = prev.some(
            (n) => n.accion_id === data.accion_id && n.categoria === "FIRMA",
          );
          return existe ? prev : [{ ...data, categoria: "FIRMA" }, ...prev];
        });
      } catch (err) {
        console.error("[SSE Firmas]", err);
      }
    };

    es.onerror = () => es.close();
    return () => es.close();
  }, [esFirmante, esJefeArea]);

  // SSE permisos firmante (jefes y UATH)
  useEffect(() => {
    if (!esFirmante) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const es = new EventSource(
      `${API_BASE}/api/permisos/notificaciones/stream-firmante?token=${token}`,
    );

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setNotificaciones((prev) => {
          const existe = prev.some(
            (n) =>
              n.solicitud_id === data.solicitud_id && n.categoria === "PERMISO",
          );
          return existe ? prev : [{ ...data, categoria: "PERMISO" }, ...prev];
        });
      } catch (err) {
        console.error("[SSE Permisos Firmante]", err);
      }
    };

    es.onerror = () => es.close();
    return () => es.close();
  }, [esFirmante]);

  // SSE permisos servidor
  useEffect(() => {
    if (!esServidor) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const es = new EventSource(
      `${API_BASE}/api/permisos/notificaciones/stream-servidor?token=${token}`,
    );

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setNotificaciones((prev) => {
          const existe = prev.some(
            (n) =>
              n.solicitud_id === data.solicitud_id && n.categoria === "PERMISO",
          );
          return existe ? prev : [{ ...data, categoria: "PERMISO" }, ...prev];
        });
      } catch (err) {
        console.error("[SSE Permisos Servidor]", err);
      }
    };

    es.onerror = () => es.close();
    return () => es.close();
  }, [esServidor]);

  const marcarLeida = async (notif) => {
    if (!notif.id) {
      // Si no tiene id, solo removerla del estado local
      setNotificaciones((prev) => prev.filter((n) => n !== notif));
      return;
    }
    try {
      if (notif.categoria === "FIRMA") {
        await api.patch(`/firma-notificaciones/${notif.id}/leer`);
      } else {
        await api.patch(`/permisos/notificaciones/${notif.id}/leer`);
      }
      setNotificaciones((prev) =>
        prev.filter(
          (n) => !(n.id === notif.id && n.categoria === notif.categoria),
        ),
      );
    } catch (err) {
      console.error("[Notificaciones] Error marcando leída:", err);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      const promesas = [];
      const tieneFirmas = notificaciones.some((n) => n.categoria === "FIRMA");
      const tienePermisosFirmante = notificaciones.some(
        (n) => n.categoria === "PERMISO" && esFirmante,
      );
      const tieneVacacionesFirmante = notificaciones.some(
        (n) => n.categoria === "VACACION" && esFirmante,
      );
      const tieneVacacionesServidor = notificaciones.some(
        (n) => n.categoria === "VACACION" && esServidor,
      );
      const tienePermisosServidor = notificaciones.some(
        (n) => n.categoria === "PERMISO" && esServidor,
      );

      if (tieneFirmas)
        promesas.push(api.patch("/firma-notificaciones/leer-todas"));
      if (tienePermisosFirmante)
        promesas.push(
          api.patch("/permisos/notificaciones/leer-todas-firmante"),
        );
      if (tienePermisosServidor)
        promesas.push(
          api.patch("/permisos/notificaciones/leer-todas-servidor"),
        );
      if (tieneVacacionesFirmante)
        promesas.push(
          api.patch("/permisos/notificaciones/leer-todas-firmante"),
        );
      if (tieneVacacionesServidor)
        promesas.push(
          api.patch("/permisos/notificaciones/leer-todas-servidor"),
        );

      await Promise.all(promesas);
      setNotificaciones([]);
    } catch (err) {
      console.error("[Notificaciones] Error marcando todas leídas:", err);
    }
  };

  return { notificaciones, marcarLeida, marcarTodasLeidas };
}
