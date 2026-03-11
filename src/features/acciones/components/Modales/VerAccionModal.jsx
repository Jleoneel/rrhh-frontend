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
  Upload,
  User,
  ShieldCheck,
  Paperclip,
  Building2,
  Calendar,
  Trash2,
  Bell,
  Mail,
  PenTool,
} from "lucide-react";

export default function VerAccionModal({ open, accion, onClose, onChanged }) {
  const accionId = accion?.id;

  const [error, setError] = useState("");
  const [anexos, setAnexos] = useState([]);
  const [loadingAnexos, setLoadingAnexos] = useState(false);
  const [detalleAccion, setDetalleAccion] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  // Estados para notificación
  const [notificacion, setNotificacion] = useState(null);
  const [loadingNotificacion, setLoadingNotificacion] = useState(false);
  const [openNotificacionModal, setOpenNotificacionModal] = useState(false);

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
    return pendiente.cargo_id === user.cargo_id;
  }, [pendiente, user]);

  const puedeNotificar = useMemo(() => {
    if (!user?.cargo_id) return false;

    const estadoActual = (detalleAccion || accion)?.estado;

    if (estadoActual !== "APROBADO") return false;

    const cargosPermitidos = ["ASISTENTE DE LA UATH", "RESPONSABLE DE LA UATH"];

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
      setLoadingNotificacion(true);
      try {
        const data = await getNotificacionByAccion(accionId);
        setNotificacion(data);
      } catch {
        setNotificacion(null);
      } finally {
        setLoadingNotificacion(false);
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

  const handleUploadFirmado = async () => {
    if (!accionId) return;

    const { value: file } = await Swal.fire({
      title: "Subir PDF firmado",
      input: "file",
      inputAttributes: {
        accept: "application/pdf",
        "aria-label": "Subir PDF",
      },
      confirmButtonText: "Subir",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      background: "#1f2937",
      color: "#f9fafb",
      confirmButtonColor: "#10b981",
    });

    if (!file) return;

    if (file.type !== "application/pdf") {
      Swal.fire({
        icon: "error",
        title: "Archivo inválido",
        text: "Debe ser un PDF.",
        background: "#1f2937",
        color: "#f9fafb",
      });
      return;
    }

    const fd = new FormData();
    fd.append("file", file);

    Swal.fire({
      title: "Subiendo...",
      text: "Registrando firma",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      background: "#1f2937",
      color: "#f9fafb",
    });

    try {
      await api.post(`/acciones/${accionId}/firmas/subir`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        toast: true,
        icon: "success",
        title: "Firma registrada",
        showConfirmButton: false,
        timer: 1500,
        position: "top-end",
        background: "#1f2937",
        color: "#f9fafb",
      });

      // Refrescar datos
      await refreshFirmas();
      if (onChanged) await onChanged();
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: e.response?.data?.message || "No se pudo registrar la firma",
        background: "#1f2937",
        color: "#f9fafb",
      });
    }
  };

  const handleDeleteFirmado = async (firmaId) => {
    const result = await Swal.fire({
      title: "¿Eliminar documento firmado?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/firmas/acciones/${accionId}/firmas/${firmaId}`);
        await refreshFirmas();
        if (onChanged) await onChanged();
        Swal.fire({
          toast: true,
          icon: "success",
          title: "Documento eliminado",
          showConfirmButton: false,
          timer: 1500,
          position: "top-end",
        });
      } catch (e) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: e.response?.data?.message || "No se pudo eliminar el documento",
        });
      }
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
                  onClick={handleUploadFirmado}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all flex items-center gap-2 text-sm"
                >
                  <Upload size={16} />
                  Subir PDF firmado
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
                        onDownload={() =>
                          handleDownloadFirmado(f.documento_path)
                        }
                        onDelete={handleDeleteFirmado}
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

function FirmaRow({ firma, isPending, onDownload, onDelete, user }) {
  const isFirmado = firma.estado === "FIRMADO";
  const puedeEliminar = user?.cargo_id === firma.cargo_id;

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

      {isFirmado && firma.documento_path && (
        <div className="flex gap-2">
          {/* Botón Descargar - visible para todos */}
          <button
            onClick={onDownload}
            className="p-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-700 hover:text-blue-600 transition-colors flex-shrink-0"
            title="Ver PDF firmado"
          >
            <Download size={18} />
          </button>

          {/* Botón Eliminar - solo para quien firmó */}
          {puedeEliminar && (
            <button
              onClick={() => onDelete(firma.id)}
              className="p-2.5 bg-white hover:bg-red-50 border border-gray-200 rounded-lg text-gray-700 hover:text-red-600 transition-colors flex-shrink-0"
              title="Eliminar documento"
            >
              <Trash2 size={18} />
            </button>
          )}
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
