import { useEffect, useMemo, useState } from "react";
import Modal from "../../../../shared/components/ui/Modal";
import api from "../../../../shared/api/axios";
import { getTiposAccion } from "../../hooks/tiposAccion.service";
import { crearAccion } from "../../hooks/acciones.service";
import Swal from "sweetalert2";
import SelectPremium from "../../../../shared/components/Layout/SelectPremiun";
import Step1DatosGenerales from "./NuevaAccionModal/Step1DatosGenerales";
import Step3SituacionLaboral from "./NuevaAccionModal/Step3SituacionLaboral";
import Step4Revision from "./NuevaAccionModal/Step4Revision";
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
  Edit,
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
  presentoDeclaracionJurada: null,
  numeroElaboracion: null,
  documentos: [],
  puestoId: null,
};


export default function NuevaAccionModal({
  open,
  onClose,
  onSuccess,
  mode = "create",
  accionId = null,
  initialCedula = null,
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);
  const [loadingServ, setLoadingServ] = useState(false);
  const [error, setError] = useState("");
  const [cedulaError, setCedulaError] = useState("");
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
  const [loadingAccion, setLoadingAccion] = useState(false);
  const [tipoAccionNombrePendiente, setTipoAccionNombrePendiente] =
    useState(null);

  // Reset al abrir
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setError("");
    setCedulaError("");
    setTipoAccionNombrePendiente(null);

    if (mode === "create") {
      setForm(initialForm);
    } else {
      setForm((p) => ({ ...p, documentos: [] }));
    }
  }, [open, mode]);

  // Precargar datos en modo EDIT
  useEffect(() => {
    if (!open) return;
    if (mode !== "edit") return;
    if (!accionId) return;

    const loadAccion = async () => {
      setLoadingAccion(true);
      setError("");

      try {
        const { data } = await api.get(`/acciones/${accionId}`);
        const { accion, propuesta } = data;
        const procesoActualId = accion.proceso_institucional_id ?? null;
        const nivelActualId = accion.nivel_gestion_id ?? null;
        const procesoPropuestaId = propuesta?.proceso_institucional_id ?? null;
        const nivelPropuestaId = propuesta?.nivel_gestion_id ?? null;

        setForm((p) => ({
          ...p,
          accionId: accion.id,
          cedula: accion.cedula || "",
          servidorNombre: accion.servidor_nombre || "",
          rigeDesde: accion.rige_desde
            ? String(accion.rige_desde).slice(0, 10)
            : "",
          rigeHasta: accion.rige_hasta
            ? String(accion.rige_hasta).slice(0, 10)
            : "",
          motivo: accion.motivo || "",
          presentoDeclaracionJurada: accion.presento_declaracion_jurada ?? null,
          detalleTipoAccion: accion.tipo_accion_otro_detalle || "",
          numeroElaboracion: accion.numero_elaboracion || null,
          proceso_institucional_id: procesoActualId,
          nivel_gestion_id: nivelActualId,

          situacionActual: {
            ...(p.situacionActual || {}),
            proceso_institucional_id: procesoActualId,
            nivel_gestion_id: nivelActualId,
          },

          situacionPropuesta: propuesta
            ? {
                proceso_institucional_id: procesoPropuestaId,
                nivel_gestion_id: nivelPropuestaId,
                unidad_organica_id: propuesta.unidad_organica_id ?? null,
                denominacion_puesto_id:
                  propuesta.denominacion_puesto_id ?? null,
                escala_ocupacional_id: propuesta.escala_ocupacional_id ?? null,
                lugar_trabajo: propuesta.lugar_trabajo || "",
                grado: propuesta.grado ?? null,
                rmu_puesto: propuesta.rmu_puesto ?? null,
                partida_individual: propuesta.partida_individual || null,
              }
            : null,
        }));

        // Guardar el nombre del tipo para resolverlo cuando tipos estén cargados
        if (accion.tipo_accion_nombre) {
          setTipoAccionNombrePendiente(accion.tipo_accion_nombre);
        }
        if (accion.cedula) {
          await cargarSituacionActual(accion.cedula);
        }
      } catch (e) {
        setError(
          e.response?.data?.message || "Error cargando los datos de la acción",
        );
        Swal.fire({
          title: "Error",
          text: "No se pudo cargar la acción para editar",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        }).then(() => handleClose());
      } finally {
        setLoadingAccion(false);
      }
    };

    loadAccion();
  }, [open, mode, accionId]);

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
        setError("Error cargando catálogos");
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

  // mostrar situación actual y propuesta
  useEffect(() => {
    if (mode !== "edit") return;
    if (!form.situacionActual || !form.situacionPropuesta) return;

    // Si ya tenemos ambos, asegurarnos de que los select muestren los valores correctos
    if (form.situacionPropuesta.escala_ocupacional_id) {
      // Cargar grados para la escala de la propuesta
      const loadGradosForPropuesta = async () => {
        try {
          setLoadingGrados(true);
          const { data } = await api.get(`/catalogos/grados`, {
            params: {
              escala_ocupacional_id:
                form.situacionPropuesta.escala_ocupacional_id,
            },
          });
          setCatGrados(Array.isArray(data) ? data.map((x) => x.grado) : []);
        } catch (e) {
          console.error("Error cargando grados:", e);
          setCatGrados([]);
        } finally {
          setLoadingGrados(false);
        }
      };
      loadGradosForPropuesta();
    }
  }, [mode, form.situacionActual, form.situacionPropuesta]);

  // Resolver el tipoAccion cuando ya tengamos los tipos cargados (para modo edit)
  useEffect(() => {
    if (mode !== "edit") return;
    if (!tipoAccionNombrePendiente) return;
    if (!tipos.length) return;

    const tipoEncontrado = tipos.find(
      (x) => x.nombre === tipoAccionNombrePendiente,
    );
    if (tipoEncontrado) {
      setForm((p) => ({ ...p, tipoAccion: tipoEncontrado }));
      setTipoAccionNombrePendiente(null);
    }
  }, [mode, tipos, tipoAccionNombrePendiente]);

  const handleClose = () => {
    setStep(1);
    setForm(initialForm);
    setError("");
    setCedulaError("");
    setTipoAccionNombrePendiente(null);
    onClose();
  };

  const cargarSituacionActual = async (cedula) => {
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

      setForm((prev) => {
        // En modo edit: respetar los IDs que ya vienen de la acción guardada
        // En modo create: usar los que vienen del servidor
        const procesoId =
          mode === "edit"
            ? (prev.proceso_institucional_id ?? data.proceso_institucional_id)
            : data.proceso_institucional_id;

        const nivelId =
          mode === "edit"
            ? (prev.nivel_gestion_id ?? data.nivel_gestion_id)
            : data.nivel_gestion_id;

        return {
          ...prev,
          servidorId: data.servidor_id,
          puestoId: data.puesto_id,
          situacionActual: {
            ...actual,
            proceso_institucional_id: procesoId,
            nivel_gestion_id: nivelId,
          },
          proceso_institucional_id: procesoId,
          nivel_gestion_id: nivelId,
        };
      });
    } catch (err) {
      console.error("Error cargando situación actual:", err);
    }
  };

  const validateCedula = (cedula) => {
    if (!cedula) return "La cédula es requerida";
    if (!/^\d+$/.test(cedula)) return "La cédula debe contener solo números";
    if (cedula.length < 9 || cedula.length > 10)
      return "La cédula debe tener 9 o 10 dígitos";
    return "";
  };

  const fetchSituacionActual = async (cedulaParam = null, showToast = true) => {
    if (mode === "edit") {
      return;
    }

    const cedula = cedulaParam || form.cedula.trim();
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

      // En modo CREATE: creamos propuesta inicial desde situación actual
      // En modo EDIT: mantenemos lo que ya está
      const nuevaPropuesta =
        mode === "create"
          ? {
              unidad_organica_id: data.unidad_organica_id,
              denominacion_puesto_id: data.denominacion_puesto_id,
              escala_ocupacional_id: data.escala_ocupacional_id,
              lugar_trabajo: data.lugar_trabajo,
              grado: data.grado,
              rmu_puesto: data.rmu_puesto,
              partida_individual: data.partida_individual,
            }
          : form.situacionPropuesta || {
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

      if (showToast) {
        Swal.fire({
          toast: true,
          text: "Datos cargados exitosamente",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          position: "top-end",
        });
      }
    } catch (err) {
      if (mode === "create") {
        setForm((prev) => ({
          ...prev,
          servidorNombre: "",
          situacionActual: null,
          situacionPropuesta: null,
        }));

        if (showToast) {
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
        }
      }
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

  // Si el modal se abre en modo create con una cédula ya conocida (por
  // ejemplo, un servidor recién registrado como "no distributivo"),
  // precarga el campo y dispara la misma búsqueda que el botón/Enter.
  useEffect(() => {
    if (!open || mode !== "create" || !initialCedula) return;
    setForm((p) => ({ ...p, cedula: initialCedula }));
    fetchSituacionActual(initialCedula, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, initialCedula]);

  // Validación Step 1
  const canGoStep2 = useMemo(() => {
    if (
      !form.cedula.trim() ||
      !form.servidorNombre ||
      !form.tipoAccion ||
      !form.rigeDesde
    ) {
      return false;
    }

    // En modo CREATE requiere situacionActual
    if (mode === "create" && !form.situacionActual) {
      return false;
    }

    if (form.tipoAccion?.nombre === "Otro") {
      return form.detalleTipoAccion.trim().length > 3;
    }

    return true;
  }, [form, mode]);

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

  const finish = async () => {
    // Validaciones finales
    if (!form.motivo.trim() || form.motivo.length < 25) {
      setError("La motivación debe tener al menos 25 caracteres.");
      setStep(2);
      return;
    }

    // Validar que se haya seleccionado SI/NO
    if (form.presentoDeclaracionJurada === null) {
      setError(
        "Debe seleccionar SI o NO para 'Presentó la declaración jurada'.",
      );
      return;
    }

    const confirmText =
      mode === "create"
        ? {
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
            </div>
          `,
            confirmButton: "Sí, registrar como borrador",
          }
        : {
            title: "¿Guardar cambios?",
            html: `
            <div class="text-left space-y-3">
              <p>Se actualizará la acción <span class="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold">${form.numeroElaboracion || ""}</span></p>
              <div class="bg-blue-50 p-3 rounded text-sm">
                <p class="font-medium text-blue-800">📝 Cambios:</p>
                <ul class="list-disc pl-5 text-blue-700 mt-2">
                  <li>Motivación actualizada</li>
                  <li>Fechas modificadas</li>
                  <li>Propuesta de situación laboral</li>
                </ul>
              </div>
            </div>
          `,
            confirmButton: "Sí, guardar cambios",
          };

    const confirm = await Swal.fire({
      title: confirmText.title,
      html: confirmText.html,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: confirmText.confirmButton,
      cancelButtonText: "Revisar nuevamente",
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      background: "#1f2937",
      color: "#f9fafb",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) {
      return;
    }

    // Mostrar loading
    const loadingSwal = Swal.fire({
      title: mode === "create" ? "Guardando..." : "Actualizando...",
      text:
        mode === "create"
          ? "Registrando la acción en el sistema"
          : "Guardando los cambios",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // 1. Construir datos básicos de la acción
      const datosAccion = {
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
        procesoInstitucionalId:
          form.situacionActual?.proceso_institucional_id ?? null,
        nivelGestionId: form.situacionActual?.nivel_gestion_id ?? null,
      };

      // 2. Construir datos de propuesta
      const datosPropuesta =
        form.tipoAccion?.requiere_propuesta && form.situacionPropuesta
          ? {
              proceso_institucional_id:
                form.situacionPropuesta?.proceso_institucional_id ?? null,
              nivel_gestion_id:
                form.situacionPropuesta?.nivel_gestion_id ?? null,
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
            }
          : null;

      if (mode === "create") {
        // 1. Crear la acción principal
        const result = await crearAccion(datosAccion);

        // 2. Si requiere propuesta, enviar por separado
        if (datosPropuesta) {
          try {
            await api.put(`/acciones/${result.accion_id}/propuesta`, {
              proceso_institucional: datosPropuesta.proceso_institucional_id,
              nivel_gestion: datosPropuesta.nivel_gestion_id,
              unidad_organica_id: datosPropuesta.unidad_organica_id,
              denominacion_puesto_id: datosPropuesta.denominacion_puesto_id,
              escala_ocupacional_id: datosPropuesta.escala_ocupacional_id,
              lugar_trabajo: datosPropuesta.lugar_trabajo,
              grado: datosPropuesta.grado,
              rmu_puesto: datosPropuesta.rmu_puesto,
              partida_individual: datosPropuesta.partida_individual,
            });
          } catch (propuestaError) {
            console.error("Error guardando propuesta:", propuestaError);
          }
        }
        // 3. Subir documentos si hay
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
            console.error("Error subiendo documentos:", docError);
          }
        }

        // Cerrar loading
        await loadingSwal.close();

        // Mostrar éxito CREATE
        const successMessage = {
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
        };

        await Swal.fire({
          ...successMessage,
          showConfirmButton: false,
          timer: 2500,
          position: "top-end",
          timerProgressBar: true,
        });

        if (onSuccess) await onSuccess();
        handleClose();
      } else {
        const payloadEdit = {
          ...datosAccion,
          propuesta: datosPropuesta,
        };

        await api.put(`/acciones/${accionId}`, payloadEdit);

        // Cerrar loading
        await loadingSwal.close();

        // Mostrar éxito EDIT
        const successMessage = {
          toast: true,
          icon: "success",
          html: `
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 rounded-full">
              <CheckCircle class="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p class="font-semibold text-blue-800">¡Cambios guardados!</p>
              <p class="text-sm text-blue-700">Acción ${form.numeroElaboracion} actualizada</p>
            </div>
          </div>
        `,
        };

        await Swal.fire({
          ...successMessage,
          showConfirmButton: false,
          timer: 2500,
          position: "top-end",
          timerProgressBar: true,
        });

        if (onSuccess) await onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error(
        `Error al ${mode === "create" ? "crear" : "actualizar"} acción:`,
        error,
      );

      // Cerrar loading y mostrar error
      await loadingSwal.close();

      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          `Error al ${mode === "create" ? "guardar" : "actualizar"} la acción`,
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
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
      <div className="sticky top-0 bg-linear-to-r from-gray-900 to-gray-800 text-white px-8 py-6 z-10 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            {mode === "edit" ? (
              <>
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Editar Acción de Personal
                  </h2>
                  <p className="text-gray-300 text-sm">
                    {form.numeroElaboracion
                      ? `N° ${form.numeroElaboracion}`
                      : "Cargando..."}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-green-500 rounded-lg">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    Nueva Acción de Personal
                  </h2>
                  <p className="text-gray-300 text-sm">
                    Complete el formulario paso a paso
                  </p>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              const isClickable = isCompleted;

              return (
                <div
                  key={s.id}
                  className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}
                >
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-h-[calc(90vh-260px)] overflow-y-auto">
        {loadingAccion && mode === "edit" ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Cargando datos de la acción...
              </p>
              <p className="text-sm text-gray-500 mt-2">Por favor espere</p>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 bg-linear-to-r from-red-500/10 to-red-600/5 border-l-4 border-red-500 p-5 rounded-r-xl animate-fadeIn">
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

            {step === 1 && (
              <Step1DatosGenerales
                mode={mode}
                form={form}
                setForm={setForm}
                cedulaError={cedulaError}
                setCedulaError={setCedulaError}
                validateCedula={validateCedula}
                handleCedulaKeyPress={handleCedulaKeyPress}
                fetchSituacionActual={fetchSituacionActual}
                loadingServ={loadingServ}
                showServidorFound={showServidorFound}
                tipos={tipos}
                loadingTipos={loadingTipos}
                minRigeHasta={minRigeHasta}
              />
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-8">
                {/* Card Motivación */}
                <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Motivación de la Acción
                      </h3>
                      <p className="text-blue-600 text-sm mt-1">
                        Describa los motivos y fundamentos legales de esta
                        acción
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Motivación detallada{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={form.motivo}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, motivo: e.target.value }))
                        }
                        rows={8}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent resize-none"
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
              </div>
            )}

            {step === 3 && (
              <Step3SituacionLaboral
                mode={mode}
                setStep={setStep}
                form={form}
                setForm={setForm}
                catProcesos={catProcesos}
                catNiveles={catNiveles}
                catUnidades={catUnidades}
                catDenoms={catDenoms}
                catEscalas={catEscalas}
                catGrados={catGrados}
                setCatGrados={setCatGrados}
                loadingGrados={loadingGrados}
                setLoadingGrados={setLoadingGrados}
                loadingRmu={loadingRmu}
                setLoadingRmu={setLoadingRmu}
                catLugares={catLugares}
                loadingCatalogos={loadingCatalogos}
              />
            )}

            {step === 4 && (
              <Step4Revision
                mode={mode}
                form={form}
                setForm={setForm}
                catProcesos={catProcesos}
                catNiveles={catNiveles}
                catUnidades={catUnidades}
                catDenoms={catDenoms}
                catEscalas={catEscalas}
              />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-linear-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-8 py-6">
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
                className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center gap-2"
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
                disabled={form.presentoDeclaracionJurada === null}
                className="px-8 py-3.5 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center gap-3"
              >
                <CheckCircle className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-bold">
                    {mode === "create"
                      ? "Finalizar Registro"
                      : "Guardar Cambios"}
                  </div>
                  <div className="text-xs opacity-90">
                    Estado: {mode === "create" ? "BORRADOR" : "ACTUALIZADO"}
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
