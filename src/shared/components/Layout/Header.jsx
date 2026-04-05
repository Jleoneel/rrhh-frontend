import { useAuth } from "../../../features/auth/AuthContext";
import {
  PlusCircle,
  Calendar,
  KeyRound,
  LogOut,
  ChevronDown,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import api from "../../api/axios";
import Swal from "sweetalert2";
import LogoutButton from "../Layout/logoutButton";
import { NotificacionesBell } from "../../../features/notificaciones/components/FirmaNotificacionesBell";

export default function Header({ title, showNewAction = true, onNuevaAccion }) {
  const { user } = useAuth();
  const isUATH = user?.cargo_nombre === "ASISTENTE DE LA UATH";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    passwordActual: "",
    passwordNueva: "",
    confirmar: "",
  });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCambiarPassword = async () => {
    if (!form.passwordActual || !form.passwordNueva || !form.confirmar) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos",
        confirmButtonColor: "#3b82f6",
        timer: 2000,
        timerProgressBar: true,
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

      await Swal.fire({
        icon: "success",
        title: "¡Contraseña actualizada!",
        text: "Tu contraseña ha sido cambiada exitosamente",
        confirmButtonColor: "#10b981",
        timer: 2000,
        timerProgressBar: true,
      });

      setModalOpen(false);
      setForm({ passwordActual: "", passwordNueva: "", confirmar: "" });
    } catch (error) {
      // Verificar si el error es por contraseña actual incorrecta
      const errorMessage = error.response?.data?.message || "";

      if (
        errorMessage.toLowerCase().includes("contraseña actual incorrecta") ||
        errorMessage.toLowerCase().includes("password actual incorrecto") ||
        error.response?.status === 401
      ) {
        Swal.fire({
          icon: "error",
          title: "Contraseña incorrecta",
          text: "La contraseña actual que ingresaste no es correcta",
          confirmButtonColor: "#ef4444",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage || "No se pudo cambiar la contraseña",
          confirmButtonColor: "#ef4444",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaAccion = async () => {
    const result = await Swal.fire({
      title: "¿Crear nueva acción?",
      text: "Serás redirigido al formulario de creación",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
      background: "#ffffff",
      color: "#1f2937",
    });

    if (result.isConfirmed && onNuevaAccion) {
      onNuevaAccion();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

            <div className="flex items-center gap-4">
              {showNewAction && isUATH && (
                <button
                  onClick={handleNuevaAccion}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                  <PlusCircle
                    size={20}
                    className="group-hover:rotate-90 transition-transform"
                  />
                  <span className="font-semibold hidden sm:inline">
                    Nueva acción
                  </span>
                </button>
              )}

             <NotificacionesBell />



              {/* Perfil con dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-3 pl-3 border-l border-gray-300 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {user?.nombre?.charAt(0) || "U"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>

                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                      {user?.nombre || "Usuario"}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">
                      {user?.cargo_nombre || "Rol no asignado"}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs text-gray-500">Sesión activa</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.nombre}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <KeyRound size={16} />
                      Cambiar contraseña
                    </button>

                    <div className="border-t border-gray-100">
                      <div className="border-t border-gray-100 p-1">
                        <LogoutButton expanded={false} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 text-sm">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-gray-600">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </header>

      {/* Modal cambiar contraseña */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <KeyRound className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Cambiar contraseña
                  </h2>
                  <p className="text-sm text-gray-500">
                    Actualiza tu contraseña de acceso
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Contraseña actual */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Contraseña actual
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

              {/* Nueva contraseña */}
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

              {/* Confirmar contraseña */}
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

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCambiarPassword}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Actualizando...
                  </span>
                ) : (
                  <>
                    <KeyRound size={16} />
                    Actualizar contraseña
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
