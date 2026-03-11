import { useState, useEffect } from "react";
import Modal from "../../../../shared/components/ui/Modal";
import { registrarNotificacion } from "../../../notificaciones/hooks/notificaciones.service";
import { useAuth } from "../../../../features/auth/AuthContext";
import Swal from "sweetalert2";
import {
  Bell,
  X,
  Calendar,
  Clock,
  User,
  Briefcase,
  Loader2,
  Mail,
  CheckCircle,
  AlertCircle,
  FileText,
  Send,
  Edit3
} from "lucide-react";

export default function NotificacionModal({ 
  open, 
  onClose, 
  accionId, 
  notificacionExistente, 
  onSuccess 
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    medio: "",
    nombre: "",
    puesto: ""
  });

  // Cargar datos existentes al abrir o cuando cambie notificacionExistente
  useEffect(() => {
    if (notificacionExistente) {
      setFormData({
        fecha: notificacionExistente.fecha ? notificacionExistente.fecha.split('T')[0] : "",
        hora: notificacionExistente.hora || "",
        medio: notificacionExistente.medio || "",
        nombre: notificacionExistente.nombre || "",
        puesto: notificacionExistente.puesto || "",
      });
      setModoEdicion(true);
    } else {
      // Resetear formulario si no hay notificación existente
      // Auto-completar con datos del usuario logeado
      setFormData({
        fecha: "",
        hora: "",
        medio: "",
        nombre: user?.nombre || "",
        puesto: user?.cargo_nombre || "",
      });
      setModoEdicion(false);
    }
  }, [notificacionExistente, open, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fecha || !formData.hora || !formData.medio || 
        !formData.nombre || !formData.puesto) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor complete todos los campos del formulario",
        background: "#ffffff",
        color: "#1f2937",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setLoading(true);
    try {
      await registrarNotificacion({ 
        ...formData, 
        accion_id: accionId, 
        id: notificacionExistente ?.id || null
      });
      
      Swal.fire({
        toast: true,
        icon: "success",
        title: modoEdicion ? "Notificación actualizada" : "Notificación registrada",
        text: "Los datos han sido guardados correctamente",
        timer: 2000,
        showConfirmButton: false,
        background: "#ffffff",
        color: "#1f2937",
        position: "top-end",
      });
      
      // Recargar datos y cerrar
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Error registrando notificación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "No se pudo registrar la notificación",
        background: "#ffffff",
        color: "#1f2937",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fecha: "",
      hora: "",
      medio: "",
      nombre: "",
      puesto: ""
    });
    setModoEdicion(false);
    onClose();
  };

  return (
    <Modal 
      open={open} 
      onClose={handleClose} 
      size="md"
      className="max-w-2xl"
    >
      {/* Header con gradiente mejorado */}
      <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-6 z-10 rounded-t-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {modoEdicion ? "Editar Notificación" : "Nueva Notificación"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-300">Registro de comunicación oficial</span>
                {modoEdicion && (
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                    Editando
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-8 max-h-[70vh] overflow-y-auto">
        {/* Base legal */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Base legal</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Primer inciso del art. 22 RGLOSEP, art. 101 COA, art. 66 y 126 ERJAFE
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección: Comunicación Electrónica */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Comunicación Electrónica</h3>
                <p className="text-sm text-gray-500">Detalles del envío de la notificación</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Calendar className="inline h-4 w-4 mr-1 text-gray-400" />
                  Fecha de notificación <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Hora */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Clock className="inline h-4 w-4 mr-1 text-gray-400" />
                  Hora de notificación <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Medio */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Send className="inline h-4 w-4 mr-1 text-gray-400" />
                  Medio utilizado <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="medio"
                  value={formData.medio}
                  onChange={handleChange}
                  placeholder="Ej: Correo electrónico institucional, Oficio físico, Sistema de notificaciones"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sección: Datos del Notificado */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Datos del Responsable</h3>
                <p className="text-sm text-gray-500">Información de la persona que notifica</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <User className="inline h-4 w-4 mr-1 text-gray-400" />
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Juan Pérez García"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Puesto */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Briefcase className="inline h-4 w-4 mr-1 text-gray-400" />
                  Puesto / Cargo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="puesto"
                  value={formData.puesto}
                  onChange={handleChange}
                  placeholder="Ej: Analista de Recursos Humanos"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Información importante</p>
                <p className="text-xs text-amber-700 mt-1">
                  Este registro servirá como constancia de la notificación realizada. 
                  Asegúrese de que todos los datos sean correctos antes de guardar.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer con botones */}
      <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-8 py-6 rounded-b-xl">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-xl font-medium transition-all flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                {modoEdicion ? "Actualizar" : "Registrar"}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}