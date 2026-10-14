import { useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../api/axios";
import { useAuth } from "../../../features/auth/AuthContext";

// Toda cuenta nace con password = cédula (ver INSERTs en
// usuarios-servidor.routes.js, jefes.routes.js, firmantes.controller.js) y
// un reset administrativo vuelve a dejarla así. El backend marca
// debe_cambiar_password = true en esos casos y lo manda en el login
// (ver auth.controller.js). Este modal, montado una sola vez en
// MainLayout, se muestra mientras ese flag siga en true y, a diferencia
// del "Cambiar contraseña" del Header, no se puede cerrar sin completarlo
// (sin botón X, sin click afuera, sin Cancelar).
export default function CambioPasswordObligatorio() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    passwordActual: "",
    passwordNueva: "",
    confirmar: "",
  });
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user?.debe_cambiar_password) return null;

  const handleSubmit = async () => {
    if (!form.passwordActual || !form.passwordNueva || !form.confirmar) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (form.passwordNueva !== form.confirmar) {
      Swal.fire({
        icon: "error",
        title: "Contraseñas no coinciden",
        text: "La nueva contraseña y su confirmación deben ser iguales",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (form.passwordNueva.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Contraseña muy corta",
        text: "La nueva contraseña debe tener al menos 6 caracteres",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setLoading(true);
    try {
      await api.put("/auth/cambiar-password", {
        passwordActual: form.passwordActual,
        passwordNueva: form.passwordNueva,
      });

      updateUser({ debe_cambiar_password: false });

      await Swal.fire({
        icon: "success",
        title: "¡Contraseña actualizada!",
        text: "Tu contraseña ha sido cambiada exitosamente",
        confirmButtonColor: "#10b981",
        timer: 2000,
        timerProgressBar: true,
      });

      setForm({ passwordActual: "", passwordNueva: "", confirmar: "" });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "";
      Swal.fire({
        icon: "error",
        title: errorMessage.toLowerCase().includes("incorrecta")
          ? "Contraseña actual incorrecta"
          : "No se pudo actualizar",
        text: errorMessage || "Intenta de nuevo",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-100 rounded-xl">
            <KeyRound className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Debes cambiar tu contraseña
            </h2>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Por seguridad, antes de continuar debes establecer una contraseña
          propia (distinta de tu cédula).
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Contraseña actual (tu cédula)
            </label>
            <div className="relative">
              <input
                type={showActual ? "text" : "password"}
                value={form.passwordActual}
                onChange={(e) =>
                  setForm((p) => ({ ...p, passwordActual: e.target.value }))
                }
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowActual((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showActual ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showNueva ? "text" : "password"}
                value={form.passwordNueva}
                onChange={(e) =>
                  setForm((p) => ({ ...p, passwordNueva: e.target.value }))
                }
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNueva((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNueva ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmar}
                onChange={(e) =>
                  setForm((p) => ({ ...p, confirmar: e.target.value }))
                }
                className={`w-full border-2 rounded-xl px-4 py-3 pr-11 focus:outline-none focus:ring-2 focus:border-transparent ${
                  form.confirmar && form.passwordNueva !== form.confirmar
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.confirmar && form.passwordNueva !== form.confirmar && (
              <p className="text-xs text-red-500">
                Las contraseñas no coinciden
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-8 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Actualizando...
            </span>
          ) : (
            <>
              <KeyRound size={16} />
              Cambiar contraseña
            </>
          )}
        </button>
      </div>
    </div>
  );
}
