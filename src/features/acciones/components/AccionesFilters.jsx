import { useState } from "react";
import {
  Search,
  X,
  Calendar,
  User,
  FileText,
  Tag,
  Plus,
  Loader2,
  ListOrdered,
  AlertTriangle,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../shared/api/axios";
import Modal from "../../../shared/components/ui/Modal";

const initialDenominacionForm = { codigo_legacy: "", nombre: "" };

function toastSwal(text, icon) {
  Swal.fire({
    toast: true,
    text,
    icon,
    showConfirmButton: false,
    timer: 2000,
    position: "top-end",
    background: "#ffffff",
    color: "#1f2937",
  });
}

export default function AccionesFilters({
  filters,
  onChange,
  onBuscar,
  onLimpiar,
  puedeConfigurarNumeracion,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialDenominacionForm);
  const [saving, setSaving] = useState(false);

  const [numeracionModalOpen, setNumeracionModalOpen] = useState(false);
  const [proximoNumero, setProximoNumero] = useState(null);
  const [loadingProximo, setLoadingProximo] = useState(false);
  const [nuevoNumero, setNuevoNumero] = useState("");
  const [savingNumeracion, setSavingNumeracion] = useState(false);

  const abrirModal = () => {
    setForm(initialDenominacionForm);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleSubmitDenominacion = async () => {
    if (saving) return;

    const codigoLegacy = form.codigo_legacy.trim();
    const nombre = form.nombre.trim();

    if (!codigoLegacy || !nombre) {
      toastSwal("Complete el código legacy y el nombre", "error");
      return;
    }

    setSaving(true);
    try {
      await api.post("/catalogos/denominaciones", {
        codigo_legacy: codigoLegacy,
        nombre,
      });

      toastSwal("✓ Denominación creada exitosamente", "success");
      setForm(initialDenominacionForm);
      setModalOpen(false);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          "No se pudo crear la denominación",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setSaving(false);
    }
  };

  const abrirModalNumeracion = async () => {
    setNumeracionModalOpen(true);
    setNuevoNumero("");
    setLoadingProximo(true);
    try {
      const { data } = await api.get("/acciones/numeracion/proximo");
      setProximoNumero(data?.proximo_numero_elaboracion ?? null);
    } catch (error) {
      setProximoNumero(null);
      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          "No se pudo consultar la numeración actual",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
      setNumeracionModalOpen(false);
    } finally {
      setLoadingProximo(false);
    }
  };

  const cerrarModalNumeracion = () => {
    if (savingNumeracion) return;
    setNumeracionModalOpen(false);
  };

  const handleConfirmarNumeracion = async () => {
    if (savingNumeracion) return;

    const valor = Number(nuevoNumero);
    if (!nuevoNumero.trim() || !Number.isInteger(valor) || valor < 1) {
      toastSwal("Ingrese un número de elaboración válido", "error");
      return;
    }

    const confirm = await Swal.fire({
      title: "Confirmar cambio de numeración",
      html: `
        <div class="text-left space-y-2">
          <p>Próximo número actual: <b>${proximoNumero ?? "—"}</b></p>
          <p>Nuevo próximo número: <b>${valor}</b></p>
          <p class="text-sm text-gray-600 mt-2">La próxima Acción de Personal utilizará el número ${valor}. Esta operación modifica la secuencia de numeración.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    setSavingNumeracion(true);
    try {
      const { data } = await api.put("/acciones/numeracion", {
        restart_with: valor,
      });
      const nuevoProximo = data?.proximo_numero_elaboracion ?? valor;
      setProximoNumero(nuevoProximo);
      toastSwal(
        `✓ Numeración configurada. Próximo número: ${nuevoProximo}`,
        "success",
      );
      setNumeracionModalOpen(false);
      setNuevoNumero("");
    } catch (error) {
      Swal.fire({
        title: "No se pudo configurar la numeración",
        text:
          error.response?.data?.message ||
          "Ocurrió un error al configurar la numeración",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSavingNumeracion(false);
    }
  };

  return (
    <div className="bg-linear-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
      {/* Formulario de filtros */}
      <form onSubmit={onBuscar} className="space-y-6">
        {/* Filtros principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User size={16} />
              <span>Cédula / Identificación</span>
            </label>
            <div className="relative">
              <input
                value={filters.cedula}
                onChange={(e) => onChange("cedula", e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ej: 1700000000"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          {/* Estado con colores */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText size={16} />
              <span>Estado de la acción</span>
            </label>
            <select
              value={filters.estado}
              onChange={(e) => onChange("estado", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="">Todos los estados</option>
              <option value="BORRADOR" className="text-gray-600">🟡 Borrador</option>
              <option value="EN_FIRMA" className="text-yellow-600">🟠 En firma</option>
              <option value="APROBADO" className="text-green-600">🟢 Aprobado</option>
              <option value="INSUBSISTENTE" className="text-red-600">🔴 Insubsistente</option>
            </select>
          </div>

          {/* Fecha desde */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar size={16} />
              <span>Fecha desde</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={filters.desde}
                onChange={(e) => onChange("desde", e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          {/* Fecha hasta */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar size={16} />
              <span>Fecha hasta</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={filters.hasta}
                onChange={(e) => onChange("hasta", e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {/* Contadores y acciones */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Mostrando resultados filtrados</span>
            </div>
            <div className="hidden md:block">
              <span className="font-medium">Filtros activos: </span>
              {filters.cedula && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ml-2">Cédula</span>}
              {filters.estado && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs ml-2">Estado</span>}
              {filters.desde && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs ml-2">Fecha</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={abrirModal}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-100 rounded-xl font-medium transition-all duration-300"
            >
              <Tag size={18} />
              <span>Nueva denominación</span>
            </button>

            {puedeConfigurarNumeracion && (
              <button
                type="button"
                onClick={abrirModalNumeracion}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-100 rounded-xl font-medium transition-all duration-300"
              >
                <ListOrdered size={18} />
                <span>Configurar numeración</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLimpiar}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-100 rounded-xl font-medium transition-all duration-300"
            >
              <X size={18} />
              <span>Limpiar filtros</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-3 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <Search size={18} className="group-hover:rotate-12 transition-transform" />
              <span>Buscar acciones</span>
            </button>
          </div>
        </div>
      </form>

      {/* Modal: nueva denominación de puesto */}
      <Modal open={modalOpen} onClose={cerrarModal} size="sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <Tag className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Nueva denominación de puesto
              </h2>
            </div>
            <button
              type="button"
              onClick={cerrarModal}
              disabled={saving}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Código legacy <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.codigo_legacy}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    codigo_legacy: e.target.value.toUpperCase(),
                  }))
                }
                disabled={saving}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                placeholder="Ej: H02"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Nombre de la denominación <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    nombre: e.target.value.toUpperCase(),
                  }))
                }
                disabled={saving}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                placeholder="Ej: RESPONSABLE DEL ARCHIVO PASIVO"
                maxLength={200}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={cerrarModal}
              disabled={saving}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-medium disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmitDenominacion}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Crear denominación</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: configurar numeración de elaboración */}
      <Modal open={numeracionModalOpen} onClose={cerrarModalNumeracion} size="sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-xl">
                <ListOrdered className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Configurar numeración
              </h2>
            </div>
            <button
              type="button"
              onClick={cerrarModalNumeracion}
              disabled={savingNumeracion}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-sm text-gray-500">
                Próximo número de elaboración actual
              </p>
              <p className="text-lg font-bold text-gray-900">
                {loadingProximo ? (
                  <span className="inline-flex items-center gap-2 text-sm font-normal text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    Consultando...
                  </span>
                ) : (
                  (proximoNumero ?? "—")
                )}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Nuevo próximo número de elaboración{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={nuevoNumero}
                onChange={(e) => setNuevoNumero(e.target.value)}
                disabled={savingNumeracion || loadingProximo}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                placeholder="Ej: 111"
              />
            </div>

            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Esta operación modificará la numeración de futuras Acciones
                de Personal. Si el número elegido ya está en uso, la
                operación será rechazada.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={cerrarModalNumeracion}
              disabled={savingNumeracion}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-medium disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirmarNumeracion}
              disabled={savingNumeracion || loadingProximo}
              className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700"
            >
              {savingNumeracion ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <ListOrdered size={18} />
                  <span>Continuar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}