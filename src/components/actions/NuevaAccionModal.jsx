// src/components/actions/NuevaAccionModal.jsx
import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import api from "../../api/axios";
import { getTiposAccion } from "../../services/tiposAccion.service";
import { crearAccion } from "../../services/acciones.service";
import Swal from "sweetalert2";
import SelectPremium from "../ui/selectPremiun";
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
  AlertCircle,
  Loader2,
  Info,
  Shield,
  Clock,
  FileCheck,
  BookOpen,
  HelpCircle,
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
  tipoAccion: null,
  detalleTipoAccion: "",
  rigeDesde: "",
  rigeHasta: "",
  accionId: "",
  motivo: "",
  proceso_institucional_id: null,
  nivel_gestion_id: null,
  situacionActual: null,
  situacionPropuesta: null,
  presentoDeclaracionJurada: null, // Este campo se mantiene
  numeroElaboracion: null,
  documentos: [],
};

// Función helper para selects
const getSelectValue = (catalogo, id, icon) => {
  if (!id || !catalogo || !Array.isArray(catalogo)) return null;
  const item = catalogo.find((x) => x.id === id);
  return item ? { value: item.id, label: item.nombre, icon } : null;
};

export default function NuevaAccionModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [loadingServ, setLoadingServ] = useState(false);
  const [error, setError] = useState("");
  const [cedulaError, setCedulaError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [catUnidades, setCatUnidades] = useState([]);
  const [catDenoms, setCatDenoms] = useState([]);
  const [catEscalas, setCatEscalas] = useState([]);
  const [catLugares, setCatLugares] = useState([]);
  const [catGrados, setCatGrados] = useState([]);
  const [catProcesos, setCatProcesos] = useState([]);
  const [catNiveles, setCatNiveles] = useState([]);
  const [loadingGrados, setLoadingGrados] = useState(false);
  const [loadingRmu, setLoadingRmu] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  // Reset al abrir
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setForm(initialForm);
    setError("");
    setCedulaError("");
  }, [open]);

  // Cargar tipos de acción y catálogos cuando abre el modal
  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoadingTipos(true);
      setLoadingCatalogos(true);
      setError("");

      try {
        const tiposData = await getTiposAccion();
        setTipos(Array.isArray(tiposData) ? tiposData : []);

        const [
          unidadesRes,
          denomsRes,
          escalasRes,
          lugaresRes,
          procesosRes,
          nivelesRes,
        ] = await Promise.all([
          api.get("/catalogos/unidades-organicas").catch(() => ({ data: [] })),
          api.get("/catalogos/denominaciones").catch(() => ({ data: [] })),
          api
            .get("/catalogos/escalas-ocupacionales")
            .catch(() => ({ data: [] })),
          api.get("/catalogos/lugares-trabajo").catch(() => ({ data: [] })),
          api
            .get("/catalogos/procesos-institucionales")
            .catch(() => ({ data: [] })),
          api.get("/catalogos/niveles-gestion").catch(() => ({ data: [] })),
        ]);

        setCatUnidades(Array.isArray(unidadesRes.data) ? unidadesRes.data : []);
        setCatDenoms(Array.isArray(denomsRes.data) ? denomsRes.data : []);
        setCatEscalas(Array.isArray(escalasRes.data) ? escalasRes.data : []);
        setCatLugares(Array.isArray(lugaresRes.data) ? lugaresRes.data : []);
        setCatProcesos(Array.isArray(procesosRes.data) ? procesosRes.data : []);
        setCatNiveles(Array.isArray(nivelesRes.data) ? nivelesRes.data : []);
      } catch (e) {
        console.error(e);
        setError("Error cargando datos");
        setTipos([]);
        setCatUnidades([]);
        setCatDenoms([]);
        setCatEscalas([]);
        setCatLugares([]);
        setCatProcesos([]);
        setCatNiveles([]);
      } finally {
        setLoadingTipos(false);
        setLoadingCatalogos(false);
      }
    };

    fetchData();
  }, [open]);

  const handleClose = () => {
    setStep(1);
    setForm(initialForm);
    setError("");
    setCedulaError("");
    onClose();
  };

  const validateCedula = (cedula) => {
    if (!cedula) return "La cédula es requerida";
    if (!/^\d+$/.test(cedula)) return "La cédula debe contener solo números";
    if (cedula.length < 9 || cedula.length > 10)
      return "La cédula debe tener 9 o 10 dígitos";
    return "";
  };

  const fetchSituacionActual = async () => {
    const cedula = form.cedula.trim();
    if (!cedula) return;

    const validationError = validateCedula(cedula);
    if (validationError) {
      setCedulaError(validationError);
      return;
    }

    setCedulaError("");
    setLoadingServ(true);
    setError("");

    try {
      const { data } = await api.get(`/servidores/${cedula}/situacion-actual`);

      const actual = {
        unidad_organica_id: data.unidad_organica_id,
        unidad_organica: data.unidad_organica,
        denominacion_puesto_id: data.denominacion_puesto_id,
        denominacion_puesto: data.denominacion_puesto,
        escala_ocupacional_id: data.escala_ocupacional_id,
        grupo_ocupacional: data.grupo_ocupacional,
        lugar_trabajo: data.lugar_trabajo,
        grado: data.grado,
        rmu_puesto: data.rmu_puesto,
        partida_individual: data.partida_individual,
        proceso_institucional: data.proceso_institucional,
        nivel_gestion: data.nivel_gestion,
        proceso_institucional_id: data.proceso_institucional_id,
        nivel_gestion_id: data.nivel_gestion_id,
        
      };

      const nuevaPropuesta = {
        unidad_organica_id: data.unidad_organica_id,
        denominacion_puesto_id: data.denominacion_puesto_id,
        escala_ocupacional_id: data.escala_ocupacional_id,
        lugar_trabajo: data.lugar_trabajo,
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
        situacionPropuesta: nuevaPropuesta,
        proceso_institucional_id: data.proceso_institucional_id,
        nivel_gestion_id: data.nivel_gestion_id,
        accionId: data.accion_id,
        numeroElaboracion: data.numero_elaboracion,

      }));

      Swal.fire({
        toast: true,
        text: "Datos cargados exitosamente",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        position: "top-end",
      });
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        servidorNombre: "",
        situacionActual: null,
        situacionPropuesta: null,
      }));

      Swal.fire({
        toast: true,
        text:
          err.response?.data?.message ||
          "Servidor no encontrado en el sistema.",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        position: "top-end",
        background: "#fef2f2",
        iconColor: "#dc2626",
      });
    } finally {
      setLoadingServ(false);
    }
  };

  const handleCedulaKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchSituacionActual();
    }
  };

  // Validación Step 1
  const canGoStep2 = useMemo(() => {
    if (
      !form.cedula.trim() ||
      !form.servidorNombre ||
      !form.tipoAccion ||
      !form.rigeDesde ||
      !form.situacionActual
    ) {
      return false;
    }

    if (form.tipoAccion?.nombre === "Otro") {
      return form.detalleTipoAccion.trim().length > 3;
    }

    return true;
  }, [form]);

  const nextFromStep1 = async () => {
    if (!canGoStep2) {
      setError(
        "Completa todos los campos obligatorios (*) y verifica que el servidor haya sido encontrado.",
      );
      return;
    }

    const rigeDesde = new Date(form.rigeDesde);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (rigeDesde < hoy) {
      setError("La fecha 'RIGE desde' no puede ser anterior a hoy.");
      return;
    }

    if (form.rigeHasta) {
      const rigeHasta = new Date(form.rigeHasta);
      if (rigeHasta <= rigeDesde) {
        setError("La fecha 'RIGE hasta' debe ser posterior a 'RIGE desde'.");
        return;
      }
    }

    setError("");
    setStep(2);
  };

  const next = () => {
    if (step === 2 && !form.motivo.trim()) {
      setError("La motivación es obligatoria.");
      return;
    }
    if (step === 3 && !form.situacionActual) {
      setError("Debes completar la información del servidor.");
      return;
    }
    setError("");
    setStep((s) => Math.min(4, s + 1));
  };

  const prev = () => {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError("Máximo 5 archivos permitidos");
      return;
    }

    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          setForm((prevForm) => ({
            ...prevForm,
            documentos: [
              ...prevForm.documentos,
              ...files
                .filter(
                  (file) =>
                    !prevForm.documentos.some(
                      (doc) => doc.nombre === file.name,
                    ),
                )
                .map((file) => ({
                  nombre: file.name,
                  tamaño: file.size,
                  tipo: file.type,
                  archivo: file,
                })),
            ],
          }));

          Swal.fire({
            toast: true,
            text: `Archivos cargados exitosamente (${files.length})`,
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
            position: "top-end",
          });

          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const removeDocument = (index) => {
    setForm((prev) => ({
      ...prev,
      documentos: prev.documentos.filter((_, i) => i !== index),
    }));
  };

  const finish = async () => {
    // Validaciones finales
    if (!form.motivo.trim() || form.motivo.length < 25) {
      setError("La motivación debe tener al menos 25 caracteres.");
      setStep(2);
      return;
    }

    // Validar que se haya seleccionado SI/NO (ahora es obligatorio)
    if (form.presentoDeclaracionJurada === null) {
      setError(
        "Debe seleccionar SI o NO para 'Presentó la declaración jurada'.",
      );
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Confirmar registro?",
      html: `
        <div class="text-left space-y-3">
          <p>La acción será registrada como <span class="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-bold">BORRADOR</span></p>
          <div class="bg-blue-50 p-3 rounded text-sm">
            <p class="font-medium text-blue-800">📌 Podrás:</p>
            <ul class="list-disc pl-5 text-blue-700 mt-2">
              <li>Editar la acción más tarde</li>
              <li>Agregar más documentos</li>
              <li>Enviar a revisión cuando esté lista</li>
            </ul>
          </div>
          <div class="mt-3 p-2 bg-${form.presentoDeclaracionJurada ? "green" : "red"}-50 border border-${form.presentoDeclaracionJurada ? "green" : "red"}-200 rounded">
            <p class="text-sm"><span class="font-bold">Declaración jurada:</span> ${form.presentoDeclaracionJurada ? "SÍ presentó" : "NO presentó"}</p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, registrar como borrador",
      cancelButtonText: "Revisar nuevamente",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      background: "#1f2937",
      color: "#f9fafb",
      reverseButtons: true,
    });

    if (confirm.isConfirmed) {
      Swal.fire({
        title: "Guardando...",
        text: "Registrando la acción en el sistema",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        // PREPARAR DATOS 
        const datosParaEnviar = {
          cedula: form.cedula.trim(),
          puestoId: form.puestoId || null,
          tipoAccionNombre: form.tipoAccion?.nombre || "",
          tipoAccionOtroDetalle:
            form.tipoAccion?.nombre === "Otro"
              ? form.detalleTipoAccion.trim()
              : null,
          rigeDesde: form.rigeDesde,
          rigeHasta: form.rigeHasta || null,
          motivo: form.motivo.trim() === "" ? null : form.motivo.trim(),
          presentoDeclaracionJurada: form.presentoDeclaracionJurada, 
          
        };
        // 1. Crear la acción principal
        const result = await crearAccion(datosParaEnviar);

        // 2. Si requiere propuesta, enviar la propuesta
        if (form.tipoAccion?.requiere_propuesta && form.situacionPropuesta) {
          try {
            await api.put(`/acciones/${result.accion_id}/propuesta`, {
              proceso_institucional: form.proceso_institucional_id,
              nivel_gestion: form.nivel_gestion_id,
              unidad_organica_id:
                form.situacionPropuesta.unidad_organica_id || null,
              denominacion_puesto_id:
                form.situacionPropuesta.denominacion_puesto_id || null,
              escala_ocupacional_id:
                form.situacionPropuesta.escala_ocupacional_id || null,
              lugar_trabajo: form.situacionPropuesta.lugar_trabajo || null,
              grado: form.situacionPropuesta.grado || null,
              rmu_puesto: form.situacionPropuesta.rmu_puesto || null,
              partida_individual:
                form.situacionPropuesta.partida_individual || null,
            });
          } catch (propuestaError) {
          }
        }

        // 3. Si hay documentos, subirlos
        if (form.documentos.length > 0) {
          try {
            const formData = new FormData();
            form.documentos.forEach((doc, index) => {
              if (doc.archivo) {
                formData.append(`documentos[${index}]`, doc.archivo);
              }
            });

            await api.post(
              `/acciones/${result.accion_id}/documentos`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              },
            );
          } catch (docError) {
          }
        }

        Swal.fire({
          toast: true,
          icon: "success",
          html: `
              <div class="flex items-center gap-3">
                <div class="p-2 bg-green-100 rounded-full">
                  <CheckCircle class="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p class="font-semibold text-green-800">¡Acción registrada!</p>
                  <p class="text-sm text-green-700">N° ${result.numero_elaboracion} - Estado: BORRADOR</p>
                </div>
              </div>
            `,
          showConfirmButton: false,
          timer: 2500,
          position: "top-end",
          timerProgressBar: true,
        });

        if (onSuccess) await onSuccess();
        handleClose();
      } catch (error) {
        console.error("Error al crear acción:", error);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Error al guardar la acción",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  const showServidorFound = !!form.servidorNombre;
  const today = new Date().toISOString().split("T")[0];
  const minRigeHasta = form.rigeDesde || today;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="3xl"
      className="max-h-[90vh]"
    >
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-6 z-10">
        {/* Progress Steps */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              const isClickable = isCompleted;

              return (
                <div key={s.id} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => isClickable && setStep(s.id)}
                    className={`flex flex-col items-center ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <div
                      className={`
                          flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-300
                          ${
                            isActive
                              ? "border-blue-400 bg-blue-500 shadow-lg shadow-blue-500/30"
                              : isCompleted
                                ? "border-green-500 bg-green-600 shadow-lg shadow-green-500/30"
                                : "border-gray-600 bg-gray-700/50"
                          }
                        `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon
                          className={`h-6 w-6 ${isActive ? "text-white" : "text-gray-300"}`}
                        />
                      )}
                    </div>
                    <span
                      className={`
                          text-sm font-medium mt-3 transition-colors
                          ${
                            isActive
                              ? "text-blue-300"
                              : isCompleted
                                ? "text-green-300"
                                : "text-gray-400"
                          }
                        `}
                    >
                      {s.label}
                    </span>
                    <span
                      className={`
                          text-xs mt-1
                          ${
                            isActive
                              ? "text-blue-400"
                              : isCompleted
                                ? "text-green-400"
                                : "text-gray-500"
                          }
                        `}
                    >
                      Paso {s.id}
                    </span>
                  </button>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                          flex-1 h-1 mx-4 rounded-full transition-all duration-300
                          ${step > s.id ? "bg-green-500" : "bg-gray-600"}
                        `}
                    />
                  )}
                </div>
              );
            })}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-h-[calc(90vh-260px)] overflow-y-auto">
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-500/10 to-red-600/5 border-l-4 border-red-500 p-5 rounded-r-xl animate-fadeIn">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">
                  Revisa los siguientes detalles:
                </p>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-8">
            {/* Card Información del Servidor */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Información del Servidor
                  </h3>
                  <p className="text-blue-600 text-sm mt-1">
                    Busque al servidor por cédula para autocompletar sus datos
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cedula */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>Cédula</span>
                    <span className="text-red-500">*</span>
                    <div className="relative group">
                      <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                      <div className="absolute left-6 top-0 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        Ingrese la cédula del servidor (9 o 10 dígitos)
                        <div className="absolute -left-2 top-3 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      value={form.cedula}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setForm((p) => ({ ...p, cedula: value }));
                        setCedulaError(validateCedula(value));
                      }}
                      onKeyPress={handleCedulaKeyPress}
                      className={`w-full border rounded-xl pl-12 pr-12 py-3.5 focus:outline-none focus:ring-2 transition-all ${
                        cedulaError
                          ? "border-red-300 focus:ring-red-500 bg-red-50"
                          : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                      }`}
                      placeholder="Ej: 1234567890"
                      inputMode="numeric"
                    />

                    <button
                      type="button"
                      onClick={fetchSituacionActual}
                      disabled={loadingServ || !form.cedula.trim()}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all ${
                        loadingServ
                          ? "bg-gray-100"
                          : form.cedula.trim()
                            ? "bg-blue-100 hover:bg-blue-200 text-blue-600"
                            : "bg-gray-100 text-gray-400"
                      }`}
                      title="Buscar servidor"
                    >
                      {loadingServ ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Search className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {cedulaError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {cedulaError}
                    </p>
                  )}
                </div>

                {/* Estado búsqueda */}
                <div className="flex items-end">
                  {showServidorFound ? (
                    <div className="w-full px-5 py-3.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <BadgeCheck className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">
                            Servidor encontrado
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-center">
                      <p className="text-gray-700 font-medium mb-1">
                        Servidor no encontrado
                      </p>
                    </div>
                  )}
                </div>

                {/* Servidor */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nombre del Servidor
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      value={form.servidorNombre || ""}
                      readOnly
                      className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 bg-gray-50 focus:outline-none"
                      placeholder="Se autocompletará al buscar"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Detalles de la Acción */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Detalles de la Acción
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Complete los datos específicos de la acción a registrar
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tipo */}
                <SelectPremium
                  options={tipos.map((t) => ({
                    value: t.id,
                    label: t.nombre,
                    icon: FileText,
                    data: t,
                  }))}
                  value={
                    form.tipoAccion
                      ? {
                          value: form.tipoAccion.id,
                          label: form.tipoAccion.nombre,
                          icon: FileText,
                        }
                      : null
                  }
                  onChange={(selected) => {
                    if (!selected) {
                      setForm((p) => ({
                        ...p,
                        tipoAccion: null,
                        detalleTipoAccion: "",
                      }));
                      return;
                    }

                    const tipoCompleto = tipos.find(
                      (t) => t.id === selected.value,
                    );

                    if (tipoCompleto) {
                      setForm((p) => ({
                        ...p,
                        tipoAccion: tipoCompleto,
                        detalleTipoAccion:
                          tipoCompleto.nombre === "Otro"
                            ? p.detalleTipoAccion
                            : "",
                      }));
                    }
                  }}
                  label="Tipo de acción"
                  required
                  placeholder="Seleccione el tipo de acción..."
                  isSearchable
                  isClearable
                  isLoading={loadingTipos}
                />
                {/* RIGE desde */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span>RIGE desde</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={form.rigeDesde || ""}
                      min={today}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, rigeDesde: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                {/* RIGE hasta */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    RIGE hasta (opcional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={form.rigeHasta || ""}
                      min={minRigeHasta}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, rigeHasta: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* "Otro" -> textarea */}
              {form.tipoAccion?.nombre === "Otro" && (
                <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                  <label className="block text-sm font-semibold text-blue-800 mb-3">
                    Especifique el tipo de acción{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <PencilLine className="absolute left-4 top-4 h-5 w-5 text-blue-400" />
                    <textarea
                      value={form.detalleTipoAccion}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          detalleTipoAccion: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full border border-blue-300 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                      placeholder="Ej.: Revisión por caso especial, cambio de denominación, etc."
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-blue-600">
                      Este texto se usará en el documento cuando el tipo sea
                      "Otro"
                    </p>
                    <p
                      className={`text-xs ${form.detalleTipoAccion.length > 2 ? "text-green-600" : "text-red-600"}`}
                    >
                      {form.detalleTipoAccion.length}/3 caracteres mínimos
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-8">
            {/* Card Motivación */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Motivación de la Acción
                  </h3>
                  <p className="text-blue-600 text-sm mt-1">
                    Describa los motivos y fundamentos legales de esta acción
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motivación detallada <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.motivo}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, motivo: e.target.value }))
                    }
                    rows={8}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describa aquí los motivos específicos de esta acción de personal..."
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Mínimo 25 caracteres.
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        form.motivo.length >= 25
                          ? "text-green-600"
                          : form.motivo.length > 0
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {form.motivo.length}/25 caracteres
                    </p>
                  </div>
                </div>       
              </div>
            </div>

            {/* Card Documentos */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Documentos de Apoyo
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Adjunte documentos relacionados con esta acción
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {form.documentos.length}/5 archivos
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors mb-6">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="font-bold text-gray-700 text-lg mb-2">
                  Arrastra y suelta archivos aquí
                </h4>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  O haz clic para seleccionar archivos desde tu computadora
                </p>

                <label className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload className="h-5 w-5" />
                  Seleccionar archivos
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>

                <p className="text-xs text-gray-400 mt-4">
                  Formatos: PDF, Word, JPG, PNG • Máximo 5 archivos • 10MB por
                  archivo
                </p>
              </div>

              {/* Progress Bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Subiendo archivos...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Lista de documentos */}
              {form.documentos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700">
                    Archivos seleccionados:
                  </h4>
                  {form.documentos.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {doc.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(doc.tamaño / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        title="Eliminar archivo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-8">
            {/* Card Situación Laboral */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Situación Laboral
                  </h3>
                  <p className="text-blue-600 text-sm mt-1">
                    Revise la situación actual y, si aplica, complete la
                    situación propuesta
                  </p>
                </div>
              </div>

              {!form.situacionActual ? (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h4 className="text-xl font-bold text-yellow-800 mb-2">
                    ⚠️ No hay datos cargados
                  </h4>
                  <p className="text-yellow-700 mb-6 max-w-md mx-auto">
                    Vuelva al paso 1 y busque un servidor para cargar su
                    información laboral actual
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md"
                  >
                    Volver al paso 1
                  </button>
                </div>
              ) : (
                <>
                  {/* Situación Actual */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            Situación Actual
                          </h4>
                          <p className="text-sm text-gray-500">
                            Estado laboral actual del servidor
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                        Solo lectura
                      </span>
                    </div>
                    {/* Información normativa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-5 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-300">
                              Proceso Institucional
                            </p>
                            <p className="text-lg font-bold mt-1">
                              {form.situacionActual?.proceso_institucional ||
                                "No especificado"}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          Situación actual del servidor
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-xl p-5 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Building2 className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-300">
                              Nivel de Gestión
                            </p>
                            <p className="text-lg font-bold mt-1">
                              {form.situacionActual?.nivel_gestion ||
                                "No especificado"}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-blue-400">
                          Situación actual del servidor
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        value={`$${form.situacionActual.rmu_puesto}`}
                        icon={Wallet}
                      />
                      <InfoCard
                        label="Partida Individual"
                        value={form.situacionActual.partida_individual}
                        icon={Hash}
                        className="md:col-span-2 lg:col-span-1"
                      />
                    </div>
                  </div>

                  {/* Situación Propuesta */}
                  {form.tipoAccion?.requiere_propuesta ? (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                      {/* Proceso Institucional y Nivel de Gestión */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <SelectPremium
                          label="Proceso Institucional"
                          required
                          placeholder="Seleccione proceso..."
                          isSearchable
                          options={catProcesos.map((x) => ({
                            value: x.id,
                            label: x.nombre,
                          }))}
                          value={getSelectValue(
                            catProcesos,
                            form.proceso_institucional_id,
                          )}
                          onChange={(opt) =>
                            setForm((p) => ({
                              ...p,
                              proceso_institucional_id: opt?.value ?? null,
                            }))
                          }
                        />

                        <SelectPremium
                          label="Nivel de Gestión"
                          required
                          placeholder="Seleccione nivel..."
                          isSearchable
                          options={catNiveles.map((x) => ({
                            value: x.id,
                            label: x.nombre,
                          }))}
                          value={getSelectValue(
                            catNiveles,
                            form.nivel_gestion_id,
                          )}
                          onChange={(opt) =>
                            setForm((p) => ({
                              ...p,
                              nivel_gestion_id: opt?.value ?? null,
                            }))
                          }
                        />
                      </div>
                      {loadingCatalogos ? (
                        <div className="text-center py-8">
                          <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
                          <p className="text-gray-600">Cargando catálogos...</p>
                        </div>
                      ) : !form.situacionPropuesta ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p>
                            No hay propuesta inicial. Vuelva a cargar el
                            servidor.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* 1) SELECTS PRINCIPALES */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Unidad Administrativa */}
                            <SelectPremium
                              label="Unidad Administrativa"
                              required
                              placeholder="Seleccione unidad..."
                              isSearchable
                              options={catUnidades.map((x) => ({
                                value: x.id,
                                label: x.nombre,
                                icon: Building2,
                              }))}
                              value={getSelectValue(
                                catUnidades,
                                form.situacionPropuesta.unidad_organica_id,
                                Building2,
                              )}
                              onChange={(opt) =>
                                setForm((p) => ({
                                  ...p,
                                  situacionPropuesta: {
                                    ...p.situacionPropuesta,
                                    unidad_organica_id: opt?.value ?? null,
                                  },
                                }))
                              }
                            />

                            {/* Denominación de Puesto */}
                            <SelectPremium
                              label="Denominación de Puesto"
                              required
                              placeholder="Seleccione denominación..."
                              isSearchable
                              options={catDenoms.map((x) => ({
                                value: x.id,
                                label: x.nombre,
                                icon: FileText,
                              }))}
                              value={getSelectValue(
                                catDenoms,
                                form.situacionPropuesta.denominacion_puesto_id,
                                FileText,
                              )}
                              onChange={(opt) =>
                                setForm((p) => ({
                                  ...p,
                                  situacionPropuesta: {
                                    ...p.situacionPropuesta,
                                    denominacion_puesto_id: opt?.value ?? null,
                                  },
                                }))
                              }
                            />

                            {/* Escala Ocupacional */}
                            <SelectPremium
                              label="Grupo / Escala Ocupacional"
                              required
                              placeholder="Seleccione escala..."
                              isSearchable
                              options={catEscalas.map((x) => ({
                                value: x.id,
                                label: x.nombre,
                                icon: Layers,
                              }))}
                              value={getSelectValue(
                                catEscalas,
                                form.situacionPropuesta.escala_ocupacional_id,
                                Layers,
                              )}
                              onChange={async (opt) => {
                                const escalaId = opt?.value ?? null;

                                setForm((p) => ({
                                  ...p,
                                  situacionPropuesta: {
                                    ...p.situacionPropuesta,
                                    escala_ocupacional_id: escalaId,
                                    grado: null,
                                    rmu_puesto: null,
                                  },
                                }));

                                if (!escalaId) {
                                  setCatGrados([]);
                                  return;
                                }

                                try {
                                  setLoadingGrados(true);
                                  const { data } = await api.get(
                                    `/catalogos/grados`,
                                    {
                                      params: {
                                        escala_ocupacional_id: escalaId,
                                      },
                                    },
                                  );

                                  setCatGrados(
                                    Array.isArray(data)
                                      ? data.map((x) => x.grado)
                                      : [],
                                  );
                                } catch (e) {
                                  console.error("Error cargando grados:", e);
                                  setCatGrados([]);
                                } finally {
                                  setLoadingGrados(false);
                                }
                              }}
                            />

                            {/* Lugar de Trabajo (select) */}
                            <div className="space-y-3">
                              <SelectPremium
                                label="Lugar de Trabajo"
                                required
                                placeholder="Seleccione lugar..."
                                isSearchable
                                options={catLugares.map((x) => ({
                                  value: x.nombre,
                                  label: x.nombre,
                                  icon: MapPin,
                                }))}
                                value={
                                  form.situacionPropuesta?.lugar_trabajo
                                    ? {
                                        value:
                                          form.situacionPropuesta.lugar_trabajo,
                                        label:
                                          form.situacionPropuesta.lugar_trabajo,
                                        icon: MapPin,
                                      }
                                    : null
                                }
                                onChange={(opt) =>
                                  setForm((p) => ({
                                    ...p,
                                    situacionPropuesta: {
                                      ...p.situacionPropuesta,
                                      lugar_trabajo: opt?.value ?? "",
                                    },
                                  }))
                                }
                              />
                            </div>
                          </div>

                          {/* 2) CAMPOS NUMÉRICOS / TEXTO */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Grado */}
                            <SelectPremium
                              label="Grado"
                              required
                              placeholder={
                                loadingGrados
                                  ? "Cargando grados..."
                                  : "Seleccione grado..."
                              }
                              isSearchable
                              isLoading={loadingGrados}
                              options={catGrados.map((g) => ({
                                value: g,
                                label: String(g),
                                icon: Hash,
                              }))}
                              value={
                                form.situacionPropuesta?.grado != null
                                  ? {
                                      value: form.situacionPropuesta.grado,
                                      label: String(
                                        form.situacionPropuesta.grado,
                                      ),
                                      icon: Hash,
                                    }
                                  : null
                              }
                              onChange={async (opt) => {
                                const grado = opt?.value ?? null;

                                setForm((p) => ({
                                  ...p,
                                  situacionPropuesta: {
                                    ...p.situacionPropuesta,
                                    grado,
                                    rmu_puesto: null,
                                  },
                                }));

                                const escalaId =
                                  form.situacionPropuesta
                                    ?.escala_ocupacional_id;
                                if (!escalaId || grado == null) return;

                                try {
                                  setLoadingRmu(true);
                                  const { data } = await api.get(
                                    `/catalogos/rmu`,
                                    {
                                      params: {
                                        escala_ocupacional_id: escalaId,
                                        grado,
                                      },
                                    },
                                  );

                                  setForm((p) => ({
                                    ...p,
                                    situacionPropuesta: {
                                      ...p.situacionPropuesta,
                                      rmu_puesto: data?.rmu ?? null,
                                    },
                                  }));
                                } catch (e) {
                                  console.error("Error cargando RMU:", e);
                                  setForm((p) => ({
                                    ...p,
                                    situacionPropuesta: {
                                      ...p.situacionPropuesta,
                                      rmu_puesto: null,
                                    },
                                  }));
                                } finally {
                                  setLoadingRmu(false);
                                }
                              }}
                            />

                            {/* RMU Puesto */}
                            <div className="space-y-3">
                              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Wallet className="h-4 w-4 text-gray-400" />
                                RMU Puesto
                              </label>
                              <input
                                readOnly
                                value={
                                  loadingRmu
                                    ? "Cargando RMU..."
                                    : (form.situacionPropuesta.rmu_puesto ?? "")
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none"
                                placeholder="Se autocompleta según escala + grado"
                              />
                            </div>

                            {/* Partida Individual */}
                            <div className="space-y-3">
                              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Hash className="h-4 w-4 text-gray-400" />
                                Partida Individual
                              </label>
                              <input
                                readOnly
                                value={
                                  form.situacionPropuesta.partida_individual ??
                                  ""
                                }
                                onChange={(e) =>
                                  setForm((p) => ({
                                    ...p,
                                    situacionPropuesta: {
                                      ...p.situacionPropuesta,
                                      partida_individual: e.target.value,
                                    },
                                  }))
                                }
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Ej: 1234-567-..."
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-2xl p-6">
                      <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="font-bold text-gray-800 mb-1">
                            Este tipo de acción no modifica la situación laboral
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Acciones como "{form.tipoAccion?.nombre}"
                            normalmente no requieren cambios en la situación
                            laboral del servidor.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-8">
            {/* Card Revisión Final */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Revisión Final
                  </h3>
                  <p className="text-blue-600 text-sm mt-1">
                    Revise todos los datos antes de finalizar el registro
                  </p>
                </div>
              </div>

              {/* Declaración Jurada - MOVIDO AL PASO 4 */}
              {/* En el paso 4, reemplaza el checkbox por esto: */}
              <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <FileCheck className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-amber-900 mb-2">
                      Confirmación de Documentación
                    </h4>
                    <p className="text-amber-700 mb-4">
                      Seleccione si presentó la declaración jurada (Art. 3
                      RLCSP)
                    </p>

                    {/* Radio buttons para SI/NO */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <input
                              type="radio"
                              id="declaracionSi"
                              name="declaracionJurada"
                              value="SI"
                              checked={form.presentoDeclaracionJurada === true}
                              onChange={() =>
                                setForm((p) => ({
                                  ...p,
                                  presentoDeclaracionJurada: true,
                                }))
                              }
                              className="sr-only"
                            />
                            <label
                              htmlFor="declaracionSi"
                              className={`
                    flex items-center justify-center w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-200
                    ${
                      form.presentoDeclaracionJurada === true
                        ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/30"
                        : "bg-white border-gray-300 hover:border-green-400"
                    }
                  `}
                            >
                              {form.presentoDeclaracionJurada === true && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </label>
                          </div>
                          <label
                            htmlFor="declaracionSi"
                            className="font-medium text-gray-800 cursor-pointer flex items-center gap-2"
                          >
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                              SI
                            </span>
                            <span>Sí, presentó la declaración jurada</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <input
                              type="radio"
                              id="declaracionNo"
                              name="declaracionJurada"
                              value="NO"
                              checked={form.presentoDeclaracionJurada === false}
                              onChange={() =>
                                setForm((p) => ({
                                  ...p,
                                  presentoDeclaracionJurada: false,
                                }))
                              }
                              className="sr-only"
                            />
                            <label
                              htmlFor="declaracionNo"
                              className={`
                    flex items-center justify-center w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-200
                    ${
                      form.presentoDeclaracionJurada === false
                        ? "bg-red-500 border-red-500 shadow-lg shadow-red-500/30"
                        : "bg-white border-gray-300 hover:border-red-400"
                    }
                  `}
                            >
                              {form.presentoDeclaracionJurada === false && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </label>
                          </div>
                          <label
                            htmlFor="declaracionNo"
                            className="font-medium text-gray-800 cursor-pointer flex items-center gap-2"
                          >
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                              NO
                            </span>
                            <span>No presentó la declaración jurada</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Nota de validación */}
                    {form.presentoDeclaracionJurada === null && (
                      <p className="text-sm text-red-600 mt-4 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Debe seleccionar SI o NO para continuar
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Información General */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Información General
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ReviewField
                    label="Número de Acción"
                    value={form.accionId || "Por asignar"}
                    important
                  />
                  <ReviewField
                    label="Estado"
                    value={
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                        <Clock className="h-3 w-3" />
                        BORRADOR
                      </span>
                    }
                  />
                  <ReviewField label="Cédula" value={form.cedula} />
                  <ReviewField label="Servidor" value={form.servidorNombre} />
                  <ReviewField
                    label="Tipo de Acción"
                    value={
                      <div className="flex items-center gap-2">
                        <span>
                          {form.tipoAccion?.nombre || "No seleccionado"}
                        </span>
                        {form.tipoAccion?.nombre === "Otro" && (
                          <span className="text-xs text-gray-500">
                            ({form.detalleTipoAccion})
                          </span>
                        )}
                      </div>
                    }
                  />
                  <ReviewField
                    label="RIGE desde"
                    value={
                      form.rigeDesde ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(form.rigeDesde).toLocaleDateString(
                            "es-ES",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">No especificado</span>
                      )
                    }
                  />
                  <ReviewField
                    label="RIGE hasta"
                    value={
                      form.rigeHasta ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(form.rigeHasta).toLocaleDateString(
                            "es-ES",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">No aplica</span>
                      )
                    }
                  />
                </div>
              </div>

              {/* Motivación */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Motivación
                </h4>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {form.motivo || (
                      <span className="text-gray-400 italic">
                        No se ha ingresado motivación
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Documentos */}
              {form.documentos.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-blue-500" />
                    Documentos Adjuntos ({form.documentos.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {form.documentos.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {doc.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(doc.tamaño / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Situación Laboral */}
              {form.situacionActual && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    Situación Laboral
                  </h4>

                  {/* Proceso Institucional y Nivel de Gestión */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm font-medium text-blue-700 mb-1">
                        Proceso Institucional
                      </p>
                      <p className="text-lg font-bold text-blue-900">
                        {catProcesos.find(
                          (p) => p.id === form.proceso_institucional_id,
                        )?.nombre || "No especificado"}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm font-medium text-blue-700 mb-1">
                        Nivel de Gestión
                      </p>
                      <p className="text-lg font-bold text-blue-900">
                        {catNiveles.find((n) => n.id === form.nivel_gestion_id)
                          ?.nombre || "No especificado"}
                      </p>
                    </div>
                  </div>

                  {/* Situación Actual */}
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      Situación Actual
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <ReviewField
                        small
                        label="Unidad Administrativa"
                        value={
                          form.situacionActual.unidad_organica ||
                          "No especificado"
                        }
                      />
                      <ReviewField
                        small
                        label="Lugar de Trabajo"
                        value={
                          form.situacionActual.lugar_trabajo ||
                          "No especificado"
                        }
                      />
                      <ReviewField
                        small
                        label="Denominación de Puesto"
                        value={
                          form.situacionActual.denominacion_puesto ||
                          "No especificado"
                        }
                      />
                      <ReviewField
                        small
                        label="Grupo Ocupacional"
                        value={
                          form.situacionActual.grupo_ocupacional ||
                          "No especificado"
                        }
                      />
                      <ReviewField
                        small
                        label="Grado"
                        value={form.situacionActual.grado || "No especificado"}
                      />
                      <ReviewField
                        small
                        label="Remuneración"
                        value={
                          form.situacionActual.rmu_puesto
                            ? `$${form.situacionActual.rmu_puesto}`
                            : "No especificado"
                        }
                      />
                      <ReviewField
                        small
                        label="Partida Individual"
                        value={
                          form.situacionActual.partida_individual ||
                          "No especificado"
                        }
                      />
                    </div>
                  </div>

                  {/* Situación Propuesta */}
                  {form.tipoAccion?.requiere_propuesta &&
                    form.situacionPropuesta && (
                      <div className="pt-6 border-t border-gray-200">
                        <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <PencilLine className="h-4 w-4 text-gray-500" />
                          Situación Propuesta ({form.tipoAccion?.nombre})
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <ReviewField
                            small
                            label="Unidad Administrativa"
                            value={
                              catUnidades.find(
                                (u) =>
                                  u.id ===
                                  form.situacionPropuesta.unidad_organica_id,
                              )?.nombre || "No especificado"
                            }
                            highlight
                          />
                          <ReviewField
                            small
                            label="Lugar de Trabajo"
                            value={
                              form.situacionPropuesta.lugar_trabajo ||
                              "No especificado"
                            }
                            highlight
                          />
                          <ReviewField
                            small
                            label="Denominación de Puesto"
                            value={
                              catDenoms.find(
                                (d) =>
                                  d.id ===
                                  form.situacionPropuesta
                                    .denominacion_puesto_id,
                              )?.nombre || "No especificado"
                            }
                            highlight
                          />
                          <ReviewField
                            small
                            label="Grupo Ocupacional"
                            value={
                              catEscalas.find(
                                (e) =>
                                  e.id ===
                                  form.situacionPropuesta.escala_ocupacional_id,
                              )?.nombre || "No especificado"
                            }
                            highlight
                          />
                          <ReviewField
                            small
                            label="Grado"
                            value={
                              form.situacionPropuesta.grado || "No especificado"
                            }
                            highlight
                          />
                          <ReviewField
                            small
                            label="Remuneración"
                            value={
                              form.situacionPropuesta.rmu_puesto
                                ? `$${form.situacionPropuesta.rmu_puesto}`
                                : "No especificado"
                            }
                            highlight
                          />
                          <ReviewField
                            small
                            label="Partida Individual"
                            value={
                              form.situacionPropuesta.partida_individual ||
                              "No especificado"
                            }
                            highlight
                          />
                          <ReviewField
                            small
                            label="Proceso Institucional"
                            value={
                              catProcesos.find(
                                (p) => p.id === form.proceso_institucional_id,
                              )?.nombre || "No especificado"
                            }
                            highlight
                          />
                          <ReviewField
                            small
                            label="Nivel de Gestión"
                            value={
                              catNiveles.find(
                                (n) => n.id === form.nivel_gestion_id,
                              )?.nombre || "No especificado"
                            }
                            highlight
                          />
                        </div>
                      </div>
                    )}

                  {!form.tipoAccion?.requiere_propuesta && form.tipoAccion && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Info className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-gray-700 font-medium">
                            Tipo "{form.tipoAccion.nombre}" no requiere
                            modificación laboral
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Este tipo de acción mantiene la situación laboral
                            actual del servidor
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resumen final */}
              <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FileCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900 text-lg mb-2">
                      ¿Todo listo para continuar?
                    </h4>
                    <p className="text-green-700">
                      Esta acción será registrada como{" "}
                      <span className="font-bold">BORRADOR</span> y podrás:
                    </p>
                    <ul className="list-disc pl-5 text-green-600 mt-2 text-sm">
                      <li>Editarla más tarde desde la lista de acciones</li>
                      <li>Agregar más documentos si es necesario</li>
                      <li>Enviarla a revisión cuando esté completa</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl font-medium transition-all duration-300"
            >
              Cancelar
            </button>

            {step > 1 && (
              <button
                type="button"
                onClick={prev}
                className="px-5 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl font-medium transition-all duration-300 flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Paso anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 4 && (
              <button
                type="button"
                onClick={step === 1 ? nextFromStep1 : next}
                disabled={
                  (step === 1 && !canGoStep2) ||
                  (step === 2 && form.motivo.length < 25) ||
                  (step === 3 && !form.situacionActual)
                }
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center gap-2"
              >
                {step === 1 ? (
                  <>
                    Continuar al paso {step + 1}
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Siguiente paso
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={finish}
                disabled={form.presentoDeclaracionJurada === null} // Deshabilitar si no ha seleccionado
                className="px-8 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center gap-3"
              >
                <CheckCircle className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-bold">Finalizar Registro</div>
                  <div className="text-xs opacity-90">Estado: BORRADOR</div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/** Componentes auxiliares */
function InfoCard({ label, value, icon: Icon, className = "" }) {
  return (
    <div
      className={`bg-gray-50 border border-gray-200 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="h-4 w-4 text-gray-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </div>
          <div className="text-gray-800 font-semibold truncate">
            {value || (
              <span className="text-gray-400 italic">No especificado</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewField({
  label,
  value,
  important = false,
  small = false,
  highlight = false,
}) {
  return (
    <div
      className={`p-3 ${highlight ? "bg-green-50 border border-green-200" : "bg-gray-50"} rounded-lg`}
    >
      <div
        className={`${small ? "text-xs" : "text-sm"} font-medium text-gray-500 mb-1`}
      >
        {label}
      </div>
      <div
        className={`${small ? "text-sm" : "text-base"} font-semibold ${important ? "text-blue-700" : "text-gray-800"}`}
      >
        {value}
      </div>
    </div>
  );
}
