import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/axios";
import { useAuth } from "../../../features/auth/AuthContext";

// Muchos usuarios no saben que el sistema permite subir su firma
// electrónica (.p12) para que sus solicitudes vayan firmadas digitalmente.
// Este componente, montado una sola vez en MainLayout, revisa al iniciar
// sesión si el usuario (firmante o servidor, GET /firmas/mi-certificado ya
// soporta ambos) todavía no tiene una, y si no, se lo ofrece una vez por
// sesión de navegador — sessionStorage evita que se repita en cada
// navegación entre los distintos grupos de rutas (MainLayout se vuelve a
// montar al cruzar entre ellos) y se limpia en el logout para que, si otro
// usuario inicia sesión en la misma pestaña, sí le aparezca a él.
const FLAG_KEY = "p12_warning_shown";

export default function AvisoCertificadoP12() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem(FLAG_KEY)) return;
    sessionStorage.setItem(FLAG_KEY, "1");

    const verificar = async () => {
      try {
        const { data } = await api.get("/firmas/mi-certificado");
        if (data?.p12_activo) return;

        const result = await Swal.fire({
          icon: "info",
          title: "Firma electrónica pendiente",
          text: "Aún no tienes una firma electrónica (.p12) subida. ¿Quieres subirla ahora?",
          showCancelButton: true,
          confirmButtonText: "Sí, subir ahora",
          cancelButtonText: "Ahora no",
          confirmButtonColor: "#3b82f6",
          cancelButtonColor: "#6b7280",
        });

        if (result.isConfirmed) {
          navigate("/permisos/mi-certificado");
        }
      } catch {
        // Silencioso — no bloquear el login por esto.
      }
    };

    verificar();
  }, [user, navigate]);

  return null;
}
