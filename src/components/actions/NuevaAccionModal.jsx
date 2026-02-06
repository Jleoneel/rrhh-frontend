// src/components/actions/NuevaAccionModal.jsx
import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import api from "../../api/axios";
import { getTiposAccion } from "../../services/tiposAccion.service";
import { crearAccion } from "../../services/acciones.service";
import Swal from "sweetalert2";
import {
  User,
  FileText,
  Briefcase,
  CheckCircle,
  Calendar,
  ChevronRight,
  ChevronLeft,
  X,
  Search,
  Upload,
  Building2,
  Layers,
  Wallet,
  Hash,
  MapPin,
  BadgeCheck,
  PencilLine,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Datos Generales", icon: User },
  { id: 2, label: "Motivación", icon: FileText },
  { id: 3, label: "Situación Laboral", icon: Briefcase },
  { id: 4, label: "Revisión", icon: CheckCircle },
];

/**
 * Config por tipo de acción:
 * - propuesta: si Step 3 muestra Situación Propuesta
 * - requiereDetalle: si exige textarea adicional (caso "Otro")
 */
const accionConfig = {
  "Incremento RMU": { propuesta: true },
  "Cambio Administrativo": { propuesta: true },
  Traslado: { propuesta: true },
  "Comisión de servicios": { propuesta: true },
  Ascenso: { propuesta: true },
  Reingreso: { propuesta: true },
  Reintegro: { propuesta: true },
  Otro: { propuesta: true, requiereDetalle: true },
  // Tipos que normalmente no cambian la situación (puedes ajustar)
  Licencia: { propuesta: false },
  Vacaciones: { propuesta: false },
  Sanciones: { propuesta: false },
  Destitución: { propuesta: false },
  "Cesación de Funciones": { propuesta: false },
};

const initialForm = {
  cedula: "",
  servidorNombre: "",
  tipoAccionNombre: "",
  detalleTipoAccion: "",
  rigeDesde: "",
  rigeHasta: "",

  accionId: "",

  motivo: "",

  // Default normativos (para Step 3)
  proceso_institucional: "SUSTANTIVO",
  nivel_gestion: "SEGUNDO NIVEL DE GESTIÓN",

  // datos cargados desde /servidores/:cedula/situacion-actual
  situacionActual: null,

  // propuesta (por ahora: clon de actual; luego serán selects reales)
  situacionPropuesta: null,
};

export default function NuevaAccionModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);

  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  const [loadingServ, setLoadingServ] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  const [error, setError] = useState("");

  const config = accionConfig[form.tipoAccionNombre] || { propuesta: false };

  // Reset al abrir
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setForm(initialForm);
    setError("");
  }, [open]);

  // Cargar tipos de acción cuando abre el modal
  useEffect(() => {
    if (!open) return;

    const fetchTipos = async () => {
      setLoadingTipos(true);
      try {
        const data = await getTiposAccion();
        setTipos(data);

        setForm((prev) => ({
          ...prev,
          tipoAccionNombre: prev.tipoAccionNombre || data?.[0]?.nombre || "",
        }));
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar los tipos de acción.");
      } finally {
        setLoadingTipos(false);
      }
    };

    fetchTipos();
  }, [open]);

  const handleClose = () => {
    setStep(1);
    setForm(initialForm);
    setError("");
    onClose();
  };

  const fetchSituacionActual = async () => {
    const cedula = form.cedula.trim();
    if (!cedula) return;

    setLoadingServ(true);
    setError("");

    try {
      const { data } = await api.get(`/servidores/${cedula}/situacion-actual`);

      const actual = {
        unidad_organica: data.unidad_organica,
        lugar_trabajo: data.lugar_trabajo,
        denominacion_puesto: data.denominacion_puesto,
        grupo_ocupacional: data.grupo_ocupacional,
        grado: data.grado,
        rmu_puesto: data.rmu_puesto,
        partida_individual: data.partida_individual,
      };

      setForm((prev) => ({
        ...prev,
        servidorId: data.servidor_id,
        puestoId: data.puesto_id,
        servidorNombre: data.nombres,
        situacionActual: actual,
        situacionPropuesta: prev.situacionPropuesta || { ...actual },
      }));
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        servidorNombre: "",
        situacionActual: null,
        situacionPropuesta: null,
      }));

      Swal.fire({
        toast: true,
        text: err.response?.data?.message || "Servidor no encontrado.",
        icon: "error",
        showConfirmButton: false,
        timer: 1700,
        timerProgressBar: true,
        position: "top-end",
      });
    } finally {
      setLoadingServ(false);
    }
  };

  // Validación Step 1
  const canGoStep2 = useMemo(() => {
    const baseOk =
      form.cedula.trim() &&
      form.servidorNombre &&
      form.tipoAccionNombre &&
      form.rigeDesde &&
      form.situacionActual;

    // si tipo = Otro, exige detalle
    if (form.tipoAccionNombre === "Otro") {
      return baseOk && form.detalleTipoAccion.trim().length > 0;
    }

    return baseOk;
  }, [form]);

  const nextFromStep1 = async () => {
    if (!canGoStep2) {
      setError("Completa los campos obligatorios y verifica el servidor.");
      return;
    }

    setLoadingNext(true);
    setError("");

    try {
      const result = await crearAccion({
        cedula: form.cedula.trim(),
        puestoId: form.puestoId || null,
        tipoAccionNombre: form.tipoAccionNombre,
        tipoAccionOtroDetalle:
          form.tipoAccionNombre === "Otro"
            ? form.detalleTipoAccion.trim()
            : null,
        rigeDesde: form.rigeDesde,
        rigeHasta: form.rigeHasta || null,
        motivo: "PENDIENTE",
      });

      setForm((prev) => ({
        ...prev,
        accionId: result.accion_id,
      }));

      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error creando la acción.");
    } finally {
      setLoadingNext(false);
    }
  };

  const next = () => setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const finish = async () => {
    if (onSuccess) await onSuccess();
    Swal.fire({
      toast: true,
      icon: "success",
      text: "Acción registrada como BORRADOR.",
      showConfirmButton: false,
      timer: 1600,
      position: "top-end",
      timerProgressBar: true,
    });
    handleClose();
  };

  const showServidorFound = !!form.servidorNombre;

  return (
    <Modal open={open} onClose={handleClose} size="2xl">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Registrar Nueva Acción de Personal
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Complete los siguientes pasos para registrar una nueva acción
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;

              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2
                        ${
                          isActive
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : isCompleted
                              ? "border-green-500 bg-green-50 text-green-600"
                              : "border-gray-300 bg-gray-50 text-gray-400"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`
                        text-xs mt-2 font-medium
                        ${
                          isActive
                            ? "text-blue-600"
                            : isCompleted
                              ? "text-green-600"
                              : "text-gray-500"
                        }
                      `}
                    >
                      {s.label}
                    </span>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                        flex-1 h-0.5 mx-4
                        ${step > s.id ? "bg-green-500" : "bg-gray-300"}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[calc(100vh-260px)] overflow-y-auto">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-800">
                  Información del Servidor
                </h3>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Busque al servidor por cédula para autocompletar sus datos
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cedula */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cédula <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    value={form.cedula}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, cedula: e.target.value }))
                    }
                    onBlur={fetchSituacionActual}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingrese la cédula"
                    maxLength={10}
                    inputMode="numeric"
                  />

                  {/* Botón icono dentro del input */}
                  <button
                    type="button"
                    onClick={fetchSituacionActual}
                    disabled={loadingServ || !form.cedula.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    aria-label="Buscar servidor"
                    title="Buscar servidor"
                  >
                    {loadingServ ? (
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    ) : (
                      <Search className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Estado búsqueda */}
              <div className="flex items-end">
                {showServidorFound ? (
                  <div className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center text-green-700 font-medium">
                    <BadgeCheck className="h-5 w-5 mr-2" />
                    Servidor encontrado
                  </div>
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-sm text-gray-500">
                    Busque para cargar datos
                  </div>
                )}
              </div>

              {/* Servidor */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Servidor
                </label>
                <input
                  value={form.servidorNombre || ""}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 bg-gray-50 focus:outline-none"
                  placeholder="Se autocompletará al buscar"
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-4">
                Detalles de la Acción
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tipo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de acción <span className="text-red-500">*</span>
                  </label>
                  {loadingTipos ? (
                    <div className="text-sm text-gray-500 py-2">
                      Cargando tipos...
                    </div>
                  ) : (
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={form.tipoAccionNombre || ""}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            tipoAccionNombre: e.target.value,
                            // si cambian tipo, limpiamos detalle si no es "Otro"
                            detalleTipoAccion:
                              e.target.value === "Otro"
                                ? p.detalleTipoAccion
                                : "",
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        {tipos.map((t) => (
                          <option key={t.id} value={t.nombre}>
                            {t.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* RIGE desde */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    RIGE desde <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={form.rigeDesde || ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, rigeDesde: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* RIGE hasta */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    RIGE hasta (opcional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={form.rigeHasta || ""}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, rigeHasta: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* "Otro" -> textarea */}
              {form.tipoAccionNombre === "Otro" && (
                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700">
                    Especifique el tipo de acción{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-2">
                    <PencilLine className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                    <textarea
                      value={form.detalleTipoAccion}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          detalleTipoAccion: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Ej.: Revisión por caso especial, etc."
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Este texto se usará en el documento cuando el tipo sea
                    “Otro”.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-800">
                  Motivación de la Acción
                </h3>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Describa los motivos y fundamentos legales de esta acción
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Motivación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.motivo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, motivo: e.target.value }))
                }
                rows={8}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Escriba aquí la motivación detallada..."
              />
              <p className="text-xs text-gray-500">(Min 100 caracteres)</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-700 mb-1">
                Adjuntar Documentos
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Suba anexos o documentos de apoyo (se conectará al endpoint
                luego)
              </p>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Seleccionar archivos
              </button>
              <p className="text-xs text-gray-400 mt-3">
                Máximo 5 archivos • 10MB por archivo
              </p>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-800">Situación Laboral</h3>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Revise la situación actual y, si aplica, complete la situación
                propuesta
              </p>
            </div>

            {!form.situacionActual ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="text-yellow-600 mb-2">
                  ⚠️ No hay datos cargados
                </div>
                <p className="text-sm text-yellow-700 mb-4">
                  Vuelva al paso 1 y busque un servidor para cargar su
                  información
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
                >
                  Volver al paso 1
                </button>
              </div>
            ) : (
              <>
                {/* Defaults normativos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoCard
                    icon={Layers}
                    label="Proceso Institucional"
                    value={form.proceso_institucional}
                  />
                  <InfoCard
                    icon={Building2}
                    label="Nivel de Gestión"
                    value={form.nivel_gestion}
                  />
                </div>

                {/* Actual */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                      Situación Actual
                    </h4>
                    <span className="text-xs text-gray-500">Solo lectura</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      label="Unidad Administrativa"
                      value={form.situacionActual.unidad_organica}
                      icon={Building2}
                    />
                    <InfoCard
                      label="Lugar de Trabajo"
                      value={form.situacionActual.lugar_trabajo}
                      icon={MapPin}
                    />
                    <InfoCard
                      label="Denominación de Puesto"
                      value={form.situacionActual.denominacion_puesto}
                      icon={FileText}
                    />
                    <InfoCard
                      label="Grupo Ocupacional"
                      value={form.situacionActual.grupo_ocupacional}
                      icon={Layers}
                    />
                    <InfoCard
                      label="Grado"
                      value={form.situacionActual.grado}
                      icon={Hash}
                    />
                    <InfoCard
                      label="Remuneración Mensual"
                      value={form.situacionActual.rmu_puesto}
                      icon={Wallet}
                    />
                    <InfoCard
                      label="Partida Individual"
                      value={form.situacionActual.partida_individual}
                      icon={Hash}
                    />
                  </div>
                </div>

                {/* Propuesta (solo si aplica por tipo) */}
                {config.propuesta ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 flex items-center">
                        <PencilLine className="h-5 w-5 text-gray-400 mr-2" />
                        Situación Propuesta
                      </h4>
                      <span className="text-xs text-gray-500">
                        (Por ahora: prellenada con actual; luego serán selects)
                      </span>
                    </div>

                    {!form.situacionPropuesta ? (
                      <div className="text-sm text-gray-500">
                        No hay propuesta inicial. Vuelva a cargar el servidor.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* NOTA: ahora son inputs simples; luego los cambiamos por selects reales */}
                        <EditableField
                          label="Unidad Administrativa"
                          value={form.situacionPropuesta.unidad_organica}
                          onChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              situacionPropuesta: {
                                ...p.situacionPropuesta,
                                unidad_organica: v,
                              },
                            }))
                          }
                        />
                        <EditableField
                          label="Lugar de Trabajo"
                          value={form.situacionPropuesta.lugar_trabajo}
                          onChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              situacionPropuesta: {
                                ...p.situacionPropuesta,
                                lugar_trabajo: v,
                              },
                            }))
                          }
                        />
                        <EditableField
                          label="Denominación de Puesto"
                          value={form.situacionPropuesta.denominacion_puesto}
                          onChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              situacionPropuesta: {
                                ...p.situacionPropuesta,
                                denominacion_puesto: v,
                              },
                            }))
                          }
                        />
                        <EditableField
                          label="Grupo Ocupacional"
                          value={form.situacionPropuesta.grupo_ocupacional}
                          onChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              situacionPropuesta: {
                                ...p.situacionPropuesta,
                                grupo_ocupacional: v,
                              },
                            }))
                          }
                        />
                        <EditableField
                          label="Grado"
                          value={form.situacionPropuesta.grado}
                          onChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              situacionPropuesta: {
                                ...p.situacionPropuesta,
                                grado: v,
                              },
                            }))
                          }
                        />
                        <EditableField
                          label="Remuneración Mensual"
                          value={form.situacionPropuesta.rmu_puesto}
                          onChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              situacionPropuesta: {
                                ...p.situacionPropuesta,
                                rmu_puesto: v,
                              },
                            }))
                          }
                        />
                        <EditableField
                          label="Partida Individual"
                          value={form.situacionPropuesta.partida_individual}
                          onChange={(v) =>
                            setForm((p) => ({
                              ...p,
                              situacionPropuesta: {
                                ...p.situacionPropuesta,
                                partida_individual: v,
                              },
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                    Este tipo de acción normalmente <b>no modifica</b> la
                    situación laboral. Puedes continuar.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-800">Revisión Final</h3>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Revise todos los datos antes de finalizar el registro
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                Información General
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReviewField
                  label="Número de Acción"
                  value={form.accionId || "-"}
                />
                <ReviewField
                  label="Estado"
                  value={
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      BORRADOR
                    </span>
                  }
                />
                <ReviewField label="Cédula" value={form.cedula} />
                <ReviewField label="Servidor" value={form.servidorNombre} />
                <ReviewField
                  label="Tipo de Acción"
                  value={form.tipoAccionNombre}
                />
                {form.tipoAccionNombre === "Otro" && (
                  <ReviewField
                    label="Detalle (Otro)"
                    value={form.detalleTipoAccion}
                  />
                )}
                <ReviewField label="RIGE desde" value={form.rigeDesde} />
                <ReviewField
                  label="RIGE hasta"
                  value={form.rigeHasta || "No aplica"}
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-2" />
                Motivación
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {form.motivo || "No se ha ingresado motivación"}
                </p>
              </div>
            </div>

            {form.situacionActual && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 text-gray-400 mr-2" />
                  Situación Laboral
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <ReviewField
                    label="Proceso Institucional"
                    value={form.proceso_institucional}
                  />
                  <ReviewField
                    label="Nivel de Gestión"
                    value={form.nivel_gestion}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ReviewField
                    label="Unidad Administrativa (Actual)"
                    value={form.situacionActual.unidad_organica}
                  />
                  <ReviewField
                    label="Lugar de Trabajo (Actual)"
                    value={form.situacionActual.lugar_trabajo}
                  />
                  <ReviewField
                    label="Denominación (Actual)"
                    value={form.situacionActual.denominacion_puesto}
                  />
                  <ReviewField
                    label="Grupo ocupacional (Actual)"
                    value={form.situacionActual.grupo_ocupacional}
                  />
                  <ReviewField
                    label="Grado (Actual)"
                    value={form.situacionActual.grado}
                  />
                  <ReviewField
                    label="RMU (Actual)"
                    value={form.situacionActual.rmu_puesto}
                  />
                  <ReviewField
                    label="Partida (Actual)"
                    value={form.situacionActual.partida_individual}
                  />
                </div>

                {config.propuesta && form.situacionPropuesta && (
                  <div className="mt-6 border-t pt-4">
                    <div className="font-semibold text-gray-800 mb-3">
                      Situación Propuesta
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ReviewField
                        label="Unidad Administrativa (Prop.)"
                        value={form.situacionPropuesta.unidad_organica}
                      />
                      <ReviewField
                        label="Lugar de Trabajo (Prop.)"
                        value={form.situacionPropuesta.lugar_trabajo}
                      />
                      <ReviewField
                        label="Denominación (Prop.)"
                        value={form.situacionPropuesta.denominacion_puesto}
                      />
                      <ReviewField
                        label="Grupo ocupacional (Prop.)"
                        value={form.situacionPropuesta.grupo_ocupacional}
                      />
                      <ReviewField
                        label="Grado (Prop.)"
                        value={form.situacionPropuesta.grado}
                      />
                      <ReviewField
                        label="RMU (Prop.)"
                        value={form.situacionPropuesta.rmu_puesto}
                      />
                      <ReviewField
                        label="Partida (Prop.)"
                        value={form.situacionPropuesta.partida_individual}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <h4 className="font-medium text-green-800">
                    ¿Listo para finalizar?
                  </h4>
                  <p className="text-sm text-green-600 mt-1">
                    Esta acción se guardará como borrador y podrá editarla más
                    tarde
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>

            {step > 1 && (
              <button
                type="button"
                onClick={prev}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {step < 4 && (
              <button
                type="button"
                onClick={step === 1 ? nextFromStep1 : next}
                disabled={
                  (step === 1 && !canGoStep2) ||
                  (step === 2 && !form.motivo.trim()) ||
                  (step === 3 && !form.situacionActual)
                }
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {step === 1 ? (
                  loadingNext ? (
                    <>
                      <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Creando...
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={finish}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar Registro
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** Componentes auxiliares */
function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-start">
        {Icon ? <Icon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" /> : null}
        <div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </div>
          <div className="text-gray-800 font-medium">
            {value || <span className="text-gray-400">No especificado</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewField({ label, value }) {
  return (
    <div>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  );
}

function EditableField({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={label}
      />
      <p className="text-xs text-gray-400">
        (Temporal) Luego este campo será un select/autocomplete según catálogo.
      </p>
    </div>
  );
}
