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
  Upload
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Datos Generales", icon: User },
  { id: 2, label: "Motivación", icon: FileText },
  { id: 3, label: "Situación Laboral", icon: Briefcase },
  { id: 4, label: "Revisión", icon: CheckCircle },
];

const initialForm = {
  cedula: "",
  servidorNombre: "",
  tipoAccionNombre: "",
  rigeDesde: "",
  rigeHasta: "",

  accionId: "",

  motivo: "",

  situacionActual: null,
};

export default function NuevaAccionModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);

  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  const [loadingServ, setLoadingServ] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  const [error, setError] = useState("");

  // Reset al abrir/cerrar
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

      setForm((prev) => ({
        ...prev,
        servidorNombre: data.nombres,
        situacionActual: {
          unidad_organica: data.unidad_organica,
          lugar_trabajo: data.lugar_trabajo,
          denominacion_puesto: data.denominacion_puesto,
          grupo_ocupacional: data.grupo_ocupacional,
          grado: data.grado,
          rmu_puesto: data.rmu_puesto,
          partida_individual: data.partida_individual,
        },
      }));
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        servidorNombre: "",
        situacionActual: null,
      }));
      Swal.fire({
        toast: true,
        text: err.response?.data?.message,
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true, 
        position: "top-end",
      });
    } finally {
      setLoadingServ(false);
    }
  };

  // Validación Step 1
  const canGoStep2 = useMemo(() => {
    return (
      form.cedula.trim() &&
      form.servidorNombre &&
      form.tipoAccionNombre &&
      form.rigeDesde &&
      form.situacionActual
    );
  }, [form]);

  const nextFromStep1 = async () => {
    if (!canGoStep2) {
      setError("Completa la cédula, tipo de acción, RIGE desde y verifica el servidor.");
      return;
    }

    setLoadingNext(true);
    setError("");

    try {
      const result = await crearAccion({
        cedula: form.cedula.trim(),
        tipoAccionNombre: form.tipoAccionNombre,
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
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="xl">
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
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2
                      ${isActive ? 'border-blue-600 bg-blue-50 text-blue-600' : 
                        isCompleted ? 'border-green-500 bg-green-50 text-green-600' :
                        'border-gray-300 bg-gray-50 text-gray-400'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={`
                      text-xs mt-2 font-medium
                      ${isActive ? 'text-blue-600' : 
                        isCompleted ? 'text-green-600' : 
                        'text-gray-500'}
                    `}>
                      {s.label}
                    </span>
                  </div>
                  
                  {index < STEPS.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4
                      ${step > s.id ? 'bg-green-500' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
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
                <h3 className="font-medium text-blue-800">Información del Servidor</h3>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Busque al servidor por cédula para autocompletar sus datos
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cédula <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    value={form.cedula}
                    onChange={(e) => setForm((p) => ({ ...p, cedula: e.target.value }))}
                    onBlur={fetchSituacionActual}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingrese la cédula"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={fetchSituacionActual}
                  disabled={loadingServ || !form.cedula.trim()}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loadingServ ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Buscar Servidor
                    </>
                  )}
                </button>
              </div>

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

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
              <h3 className="font-medium text-gray-700 mb-4">Detalles de la Acción</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de acción <span className="text-red-500">*</span>
                  </label>
                  {loadingTipos ? (
                    <div className="text-sm text-gray-500 py-2">Cargando tipos...</div>
                  ) : (
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={form.tipoAccionNombre || ""}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, tipoAccionNombre: e.target.value }))
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    RIGE desde <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={form.rigeDesde || ""}
                      onChange={(e) => setForm((p) => ({ ...p, rigeDesde: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    RIGE hasta (opcional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={form.rigeHasta || ""}
                      onChange={(e) => setForm((p) => ({ ...p, rigeHasta: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-blue-800">Motivación de la Acción</h3>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Describa detalladamente los motivos y fundamentos legales de esta acción
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Motivación <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.motivo}
                onChange={(e) => setForm((p) => ({ ...p, motivo: e.target.value }))}
                rows={8}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Escriba aquí la motivación detallada..."
              />
              <p className="text-xs text-gray-500">
                Mínimo 100 caracteres. Puede incluir fundamentos legales, razones administrativas, etc.
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h4 className="font-medium text-gray-700 mb-1">Adjuntar Documentos</h4>
              <p className="text-sm text-gray-500 mb-4">
                Suba anexos, resoluciones o documentos de apoyo (PDF, JPG, PNG)
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
                <h3 className="font-medium text-blue-800">Situación Laboral Actual</h3>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Revise la situación laboral actual del servidor
              </p>
            </div>

            {!form.situacionActual ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="text-yellow-600 mb-2">⚠️ No hay datos cargados</div>
                <p className="text-sm text-yellow-700 mb-4">
                  Vuelva al paso 1 y busque un servidor para cargar su información
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard label="Unidad Administrativa" value={form.situacionActual.unidad_organica} />
                <InfoCard label="Lugar de Trabajo" value={form.situacionActual.lugar_trabajo} />
                <InfoCard label="Denominación de Puesto" value={form.situacionActual.denominacion_puesto} />
                <InfoCard label="Grupo Ocupacional" value={form.situacionActual.grupo_ocupacional} />
                <InfoCard label="Grado" value={form.situacionActual.grado} />
                <InfoCard label="Remuneración Mensual" value={form.situacionActual.rmu_puesto} />
                <InfoCard label="Partida Individual" value={form.situacionActual.partida_individual} />
              </div>
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
                <ReviewField label="Número de Acción" value={form.accionId || "-"} />
                <ReviewField label="Estado" value={<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">BORRADOR</span>} />
                <ReviewField label="Cédula" value={form.cedula} />
                <ReviewField label="Servidor" value={form.servidorNombre} />
                <ReviewField label="Tipo de Acción" value={form.tipoAccionNombre} />
                <ReviewField label="Fecha Creación" value={new Date().toLocaleDateString()} />
                <ReviewField label="RIGE desde" value={form.rigeDesde} />
                <ReviewField label="RIGE hasta" value={form.rigeHasta || "No aplica"} />
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
                  Situación Laboral Actual
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ReviewField label="Unidad Administrativa" value={form.situacionActual.unidad_organica} />
                  <ReviewField label="Lugar de Trabajo" value={form.situacionActual.lugar_trabajo} />
                  <ReviewField label="Denominación de Puesto" value={form.situacionActual.denominacion_puesto} />
                  <ReviewField label="Grupo Ocupacional" value={form.situacionActual.grupo_ocupacional} />
                  <ReviewField label="Grado" value={form.situacionActual.grado} />
                  <ReviewField label="RMU Puesto" value={form.situacionActual.rmu_puesto} />
                  <ReviewField label="Partida Individual" value={form.situacionActual.partida_individual} />
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <h4 className="font-medium text-green-800">¿Listo para finalizar?</h4>
                  <p className="text-sm text-green-600 mt-1">
                    Esta acción se guardará como borrador y podrá editarla más tarde
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
                disabled={(step === 1 && !canGoStep2) || (step === 2 && !form.motivo.trim())}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {step === 1 ? (
                  loadingNext ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
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

function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-gray-800 font-medium">
        {value || <span className="text-gray-400">No especificado</span>}
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