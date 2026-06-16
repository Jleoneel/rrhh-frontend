import { useEffect, useMemo, useState } from "react";
import Modal from "../../../../shared/components/ui/Modal";
import api from "../../../../shared/api/axios";
import EstadoBadge from "../EstadoBadge";
import useFirmasAccion from "../../hooks/useFirmas";
import NotificacionModal from "./NotificacionModal";
import { getNotificacionByAccion } from "../../../notificaciones/hooks/notificaciones.service";
import Swal from "sweetalert2";
import {
  X,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  User,
  ShieldCheck,
  Paperclip,
  Calendar,
  Bell,
  Loader2,
} from "lucide-react";

const CARGO_IDS_EQUIVALENTES = {
  "78de3b9c-a2f4-41ed-9823-bb72ee56d1f4": [
    "78de3b9c-a2f4-41ed-9823-bb72ee56d1f4",
    "5a7d49dd-926e-4eaa-8127-b05e9dae7e53",
  ],
  "5a7d49dd-926e-4eaa-8127-b05e9dae7e53": [
    "78de3b9c-a2f4-41ed-9823-bb72ee56d1f4",
    "5a7d49dd-926e-4eaa-8127-b05e9dae7e53",
  ],
};

const cargoPuedeActuarComo = (cargoActualId, cargoRequeridoId) =>
  (CARGO_IDS_EQUIVALENTES[cargoRequeridoId] || [cargoRequeridoId]).includes(
    cargoActualId,
  );

export default function VerAccionModal({ open, accion, onClose, onChanged }) {
  const accionId = accion?.id;

  const [error, setError] = useState("");
  const [anexos, setAnexos] = useState([]);
  const [loadingAnexos, setLoadingAnexos] = useState(false);
  const [detalleAccion, setDetalleAccion] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [archivosAccion, setArchivosAccion] = useState({});

  // Estados para notificación
  const [notificacion, setNotificacion] = useState(null);
  const [openNotificacionModal, setOpenNotificacionModal] = useState(false);

  // Estados para firma
  const [modalFirma, setModalFirma] = useState(false);
  const [passwordToken, setPasswordToken] = useState("");
  const [firmando, setFirmando] = useState(false);

  //HOOK DE FIRMAS
  const {
    firmas,
    pendiente,
    loading: loadingFirmas,
    refresh: refreshFirmas,
  } = useFirmasAccion(accionId, open);

  // user del localStorage
  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const puedeSubirFirmado = useMemo(() => {
    if (!pendiente || !user?.cargo_id) return false;
    return cargoPuedeActuarComo(user.cargo_id, pendiente.cargo_id);
  }, [pendiente, user]);

  const puedeNotificar = useMemo(() => {
    if (!user?.cargo_id) return false;

    const estadoActual = (detalleAccion || accion)?.estado;

    if (estadoActual !== "APROBADO") return false;

    const cargosPermitidos = [
      "ASISTENTE DE LA UATH",
      "TRABAJADORA SOCIAL INSTITUCIONAL",
      "RESPONSABLE DE LA UATH",
    ];

    return cargosPermitidos.includes(user.cargo_nombre);
  }, [user, detalleAccion, accion]);

  const progreso = useMemo(() => {
    const total = firmas.length || 0;
    const firmadas = firmas.filter((f) => f.estado === "FIRMADO").length;
    return { total, firmadas };
  }, [firmas]);

  // Cargar detalle completo de la acción
  useEffect(() => {
    if (!open || !accionId) return;

    const cargarDetalle = async () => {
      setLoadingDetalle(true);
      try {
        const { data } = await api.get(`/acciones/${accionId}`);
        setDetalleAccion(data.accion);

        // Cargar archivos firmados
        const archivos = {
          ELABORA: data.accion.archivo_elabora,
          REGISTRA_CONTROLA: data.accion.archivo_registra,
          REVISA: data.accion.archivo_revisa,
          APRUEBA_TH: data.accion.archivo_aprueba_th,
          APRUEBA_AUTORIDAD: data.accion.archivo_aprueba_autoridad,
        };
        setArchivosAccion(archivos);
      } catch (error) {
        console.error("Error cargando detalle:", error);
      } finally {
        setLoadingDetalle(false);
      }
    };

    cargarDetalle();
  }, [open, accionId]);

  // Cargar anexos
  useEffect(() => {
    if (!open || !accionId) return;

    const cargarAnexos = async () => {
      setLoadingAnexos(true);
      try {
        const { data } = await api.get(`/acciones/${accionId}/anexos`);
        setAnexos(Array.isArray(data) ? data : []);
      } catch {
        setAnexos([]);
      } finally {
        setLoadingAnexos(false);
      }
    };

    cargarAnexos();
  }, [open, accionId]);

  // Cargar notificación — SOLO si está APROBADO
  useEffect(() => {
    if (!open || !accionId) return;

    //no consultar si no está aprobado
    const estadoActual = (detalleAccion || accion)?.estado;
    if (estadoActual !== "APROBADO") return;

    const cargarNotificacion = async () => {
      try {
        const data = await getNotificacionByAccion(accionId);
        setNotificacion(data);
      } catch {
        setNotificacion(null);
      }
    };

    cargarNotificacion();
  }, [open, accionId, detalleAccion, accion]);

  const handleNotificacionSuccess = async () => {
    const estadoActual = (detalleAccion || accion)?.estado;
    if (estadoActual !== "APROBADO") return;

    try {
      const data = await getNotificacionByAccion(accionId);
      setNotificacion(data);
    } catch {
      setNotificacion(null);
    }
  };

  const handleDownloadFirmado = (archivo_path) => {
    if (!archivo_path) return;
    const apiBase = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
    window.open(`${apiBase}${archivo_path}`, "_blank");
  };

  const handleFirmarDigital = async () => {
    if (!passwordToken.trim()) return;

    setFirmando(true);
    try {
      await api.post(`/firmas/acciones/${accionId}/firmar`, {
        password: passwordToken,
      });

      Swal.fire({
        toast: true,
        icon: "success",
        title: "¡Firmado digitalmente!",
        text: "La acción fue firmada con tu certificado BCE Ecuador",
        timer: 3000,
        showConfirmButton: false,
        position: "top-end",
      });

      setModalFirma(false);
      setPasswordToken("");
      await refreshFirmas();
      if (onChanged) await onChanged();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo firmar",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setFirmando(false);
    }
  };


  const handleDownloadAnexo = async (anexoId) => {
    try {
      const response = await api.get(
        `/acciones/${accionId}/anexos/${anexoId}/descargar`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        response.headers["filename"] || "anexo.pdf",
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando anexo:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo descargar el anexo",
        background: "#1f2937",
        color: "#f9fafb",
      });
    }
  };

  const handleClose = () => {
    setError("");
    setAnexos([]);
    setDetalleAccion(null);
    onClose?.();
  };

  if (!accion) return null;

  const detalles = detalleAccion || accion;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="4xl"
      className="max-h-[90vh]"
    >
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-6 z-10 rounded-t-xl">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl">
                <FileText className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold truncate">
                    Detalle de Acción
                  </h2>
                  {detalles.codigo_elaboracion && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm font-mono">
                      {detalles.codigo_elaboracion}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-gray-300">
                    {detalles.tipo_accion || "Sin tipo"}
                  </span>
                  <span className="text-gray-500">•</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">Estado:</span>
                    <EstadoBadge estado={detalles.estado} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <MiniInfo
                icon={User}
                label="Servidor"
                value={detalles.servidor || detalles.servidor_nombre || "—"}
              />
              <MiniInfo
                icon={ShieldCheck}
                label="Cédula"
                value={detalles.cedula || "—"}
              />
              <MiniInfo
                icon={Calendar}
                label="Fecha elaboración"
                value={
                  detalles.fecha_elaboracion
                    ? new Date(detalles.fecha_elaboracion).toLocaleDateString(
                        "es-ES",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "—"
                }
              />
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-3 hover:bg-white/10 rounded-xl transition-all hover:rotate-90 flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-h-[calc(90vh-200px)] overflow-y-auto">
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-500/10 to-red-600/5 border-l-4 border-red-500 p-5 rounded-r-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800">Ocurrió un error</p>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Información de Fechas */}
        {!loadingDetalle && detalles.rige_desde && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Rige desde
              </p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {new Date(detalles.rige_desde).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            {detalles.rige_hasta && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Rige hasta
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {new Date(detalles.rige_hasta).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Estado + Timeline de firmas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Columna 1: Estado actual y siguiente firma */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Estado de Firmas</h3>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Progreso</p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">
                  {progreso.firmadas}/{progreso.total || 0}
                </span>
                <span className="text-sm text-gray-600">
                  {progreso.total > 0
                    ? `${Math.round((progreso.firmadas / progreso.total) * 100)}%`
                    : "Sin flujo"}
                </span>
              </div>
            </div>

            {loadingFirmas ? (
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 animate-pulse rounded-lg" />
                <div className="h-10 bg-gray-200 animate-pulse rounded-lg" />
              </div>
            ) : (
              <>
                {pendiente?.cargo_nombre && (
                  <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full animate-pulse" />
                      <div>
                        <p className="text-sm font-semibold text-blue-800">
                          Siguiente en firmar
                        </p>
                        <p className="text-blue-700 font-medium mt-1">
                          {pendiente.cargo_nombre}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Orden #{pendiente.orden} · {pendiente.rol_firma}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!pendiente && progreso.total > 0 && (
                  <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">
                          ¡Flujo completado!
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Todas las firmas han sido registradas
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {progreso.total === 0 && (
                  <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-sm text-gray-600">
                      {detalles.estado === "BORRADOR"
                        ? "Esta acción no ha iniciado el flujo de firmas"
                        : "No hay firmantes configurados"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Columna 2-3: Línea de firmas */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Línea de firmas</h3>
              </div>

              {puedeSubirFirmado && (
                <button
                  onClick={() => {
                    setPasswordToken("");
                    setModalFirma(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all flex items-center gap-2 text-sm"
                >
                  <ShieldCheck size={16} />
                  Firmar digitalmente
                </button>
              )}
            </div>

            {loadingFirmas ? (
              <div className="space-y-3">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {firmas.length > 0 ? (
                  firmas
                    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                    .map((f) => (
                      <FirmaRow
                        key={f.id || `${f.orden}-${f.rol_firma}`}
                        firma={f}
                        isPending={
                          pendiente?.orden === f.orden && f.estado !== "FIRMADO"
                        }
                        onDownload={() => {
                          const archivo = archivosAccion?.[f.rol_firma];
                          if (archivo) handleDownloadFirmado(archivo);
                        }}
                        tieneArchivo={!!archivosAccion?.[f.rol_firma]}
                        user={user}
                      />
                    ))
                ) : (
                  <div className="p-8 bg-gray-50 border border-gray-200 rounded-xl text-center">
                    <ShieldCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">
                      No hay firmas registradas
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {detalles.estado === "BORRADOR"
                        ? "Al enviar a revisión se generará el flujo de firmas"
                        : "Esta acción no requiere firmas"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!puedeSubirFirmado &&
              pendiente &&
              detalles.estado === "EN_FIRMA" && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    No te corresponde firmar este paso.
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Anexos */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-gray-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Anexos</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Documentos de soporte
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
              {loadingAnexos
                ? "..."
                : `${anexos.length} anexo${anexos.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {loadingAnexos ? (
            <div className="space-y-3">
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : anexos.length === 0 ? (
            <div className="p-8 bg-gray-50 border border-gray-200 rounded-xl text-center">
              <Paperclip className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                No hay anexos para esta acción
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Los documentos de soporte aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anexos.map((a) => (
                <div
                  key={a.id}
                  className="p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {a.nombre_original || a.nombre || "Anexo"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {a.created_at
                          ? new Date(a.created_at).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </p>
                      {a.tamano_bytes && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {(a.tamano_bytes / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDownloadAnexo(a.id)}
                      className="p-2 bg-white hover:bg-purple-50 border border-gray-200 rounded-lg text-gray-600 hover:text-purple-700 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Descargar anexo"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-8 py-5 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400 rounded-xl font-medium transition-all flex items-center gap-2"
            >
              <X size={18} />
              Cerrar
            </button>
            {puedeNotificar && (
              <button
                onClick={() => setOpenNotificacionModal(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all flex items-center gap-2"
              >
                <Bell size={18} />
                {notificacion ? "Ver Notificación" : "Registrar Notificación"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/60 px-4 py-2 rounded-lg">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Vista de solo lectura
          </div>
        </div>
      </div>

      {modalFirma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalFirma(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Firma Digital</h2>
                    <p className="text-sm opacity-90">Acción de Personal</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalFirma(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  Se firmará digitalmente este documento usando tu certificado
                  .p12 del BCE Ecuador.
                </p>
                {pendiente && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    Rol: {pendiente.rol_firma} — Orden #{pendiente.orden}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña del token <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordToken}
                  onChange={(e) => setPasswordToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFirmarDigital()}
                  placeholder="Ingresa la contraseña de tu certificado"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Tu contraseña no se guarda — solo se usa para firmar este
                  documento
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModalFirma(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFirmarDigital}
                  disabled={!passwordToken.trim() || firmando}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {firmando ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Firmando...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Firmar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notificación */}
      <NotificacionModal
        open={openNotificacionModal}
        onClose={() => setOpenNotificacionModal(false)}
        accionId={accionId}
        notificacionExistente={notificacion}
        onSuccess={handleNotificacionSuccess}
      />
    </Modal>
  );
}

// Componentes auxiliares
function MiniInfo({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 text-gray-300 text-xs uppercase tracking-wide">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </div>
      <div className="text-white font-semibold mt-1 truncate" title={value}>
        {value}
      </div>
    </div>
  );
}

function FirmaRow({
  firma,
  isPending,
  onDownload,
  tieneArchivo,
}) {
  const isFirmado = firma.estado === "FIRMADO";

  return (
    <div
      className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
        isFirmado
          ? "bg-green-50 border-green-200 hover:bg-green-100"
          : isPending
            ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200 ring-offset-1"
            : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-start gap-4 min-w-0 flex-1">
        {/* Número de orden */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
            isFirmado
              ? "bg-green-100 text-green-700"
              : isPending
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-200 text-gray-700"
          }`}
        >
          {firma.orden}
        </div>

        {/* Información del firmante */}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 truncate">
            {firma.cargo_nombre ||
              firma.cargo_requerido ||
              "Cargo sin especificar"}
          </p>
          <p className="text-sm text-gray-600 mt-0.5">
            <span className="font-medium">Rol:</span>{" "}
            {firma.rol_firma || "Firmante"}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isFirmado
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {isFirmado ? (
                <>
                  <CheckCircle2 size={12} />
                  Firmado
                </>
              ) : (
                <>
                  <Clock size={12} />
                  {isPending ? "Pendiente (actual)" : "Pendiente"}
                </>
              )}
            </span>
            {firma.firmado_en && (
              <span className="text-xs text-gray-500">
                {new Date(firma.firmado_en).toLocaleString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botón de descarga */}
      {isFirmado && tieneArchivo && (
        <div className="flex gap-2">
          {/* Botón Descargar - visible para todos */}
          <button
            onClick={onDownload}
            className="p-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:text-blue-600 transition-colors flex-shrink-0"
            title="Ver PDF firmado"
          >
            <Download size={18} />
          </button>

        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="p-4 rounded-xl border bg-gray-50 border-gray-200">
      <div className="animate-pulse flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
}
