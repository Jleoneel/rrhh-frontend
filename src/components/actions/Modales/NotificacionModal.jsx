import { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import { registrarNotificacion, getNotificacionByAccion } from "../../../hooks/notificaciones.service";
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
  CheckCircle
} from "lucide-react";

export default function NotificacionModal({ 
  open, 
  onClose, 
  accionId, 
  notificacionExistente, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    medio: "",
    nombre: "",
    puesto: ""  });

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
      setFormData({
        fecha: "",
        hora: "",
        medio: "",
        nombre: "",
        puesto: "",
      });
      setModoEdicion(false);
    }
  }, [notificacionExistente, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fecha || !formData.hora || !formData.medio || 
        !formData.nombre || !formData.puesto ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor complete todos los campos del formulario",
        background: "#1f2937",
        color: "#f9fafb",
      });
      return;
    }

    setLoading(true);
    try {
      await registrarNotificacion({ 
        ...formData, 
        accion_id: accionId 
      });
      
      Swal.fire({
        icon: "success",
        title: modoEdicion ? "Notificación actualizada" : "Notificación registrada",
        text: "Los datos han sido guardados correctamente",
        timer: 2000,
        showConfirmButton: false,
        background: "#1f2937",
        color: "#f9fafb",
        position: "top-end",
        toast: true
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
        background: "#1f2937",
        color: "#f9fafb",
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
      puesto: ""    });
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
{/* Header */}    
<div className="bg-gradient-to-r from-blue-900 to-gray-800 text-white px-4 py-3 rounded-t-xl">
  <div className="flex items-start justify-between">

    {/* Lado izquierdo */}
    <div className="flex items-center gap-2">
      <div className="p-2 bg-white/10 rounded-lg">
        <Bell className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">
          {modoEdicion ? "Ver/Editar Notificación" : "Registrar Notificación"}
        </h2>
        <p className="text-blue-200 text-xs">
          Registro de Notificación
        </p>
      </div>
    </div>

    {/* Botón cerrar */}
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
<div className="p-10 max-h-[85vh] overflow-y-auto">        {/* Referencia legal */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>Base legal:</strong> Primer inciso del art. 22 RGLOSEP, art. 101 COA, art. 66 y 126 ERJAFE
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* COMUNICACIÓN ELECTRÓNICA */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-500" />
              Comunicación Electrónica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Fecha *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Hora *
                </label>
                <input
                  type="time"
                  name="hora"
                  value={formData.hora}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600  focus:outline-none"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Medio *
                </label>
                <input
                  type="text"
                  name="medio"
                  value={formData.medio}
                  onChange={handleChange}
                  placeholder="Ej: Correo electrónico, Oficio, Sistema, etc."
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* DATOS  */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              Datos 
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="inline h-4 w-4 mr-1" />
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Briefcase className="inline h-4 w-4 mr-1" />
                  Puesto *
                </label>
                <input
                  type="text"
                  name="puesto"
                  value={formData.puesto}
                  onChange={handleChange}
                  placeholder="Cargo o puesto "
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          
          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-xl font-medium transition-all flex items-center gap-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
          <Loader2 className="h-5 w-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  {modoEdicion ? "Actualizar Notificación" : "Registrar Notificación"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
