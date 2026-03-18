import { useEffect, useMemo, useState } from "react";
import {
  Upload,
  FileText,
  X,
  Download,
  Trash2,
  FileUp,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  File,
  Image,
  FileArchive,
  Loader2,
  Paperclip,
} from "lucide-react";
import Swal from "sweetalert2";

const API = `${import.meta.env.VITE_API_URL || ""}/api`;

// Función para formatear bytes a KB o MB
function formatBytes(bytes = 0) {
  const mb = bytes / 1024 / 1024;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

// Función para obtener el ícono según la extensión del archivo
function getFileIcon(filename = "") {
  const ext = filename.split(".").pop()?.toLowerCase() || "";

  if (["pdf"].includes(ext)) return <File className="h-5 w-5 text-red-500" />;
  if (["doc", "docx"].includes(ext))
    return <File className="h-5 w-5 text-blue-500" />;
  if (["jpg", "jpeg", "png", "gif"].includes(ext))
    return <Image className="h-5 w-5 text-green-500" />;
  return <FileArchive className="h-5 w-5 text-gray-500" />;
}

// Componente principal del modal de anexos
export default function AnexosModal({ open, onClose, accion, maxFiles = 5 }) {
  const accionId = accion?.id;
  const canEdit = accion?.estado === "BORRADOR";

  const [anexos, setAnexos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const token = useMemo(() => localStorage.getItem("token"), []);

  const headers = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const remainingSlots = Math.max(0, maxFiles - anexos.length);

  async function loadAnexos() {
    if (!accionId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/acciones/${accionId}/anexos`, {
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error cargando anexos");
      setAnexos(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      Swal.fire({
        toast: true,
        title: "Error",
        text: e.message || "No se pudieron cargar los anexos",
        icon: "error",
        timer: 3000,
        showConfirmButton: false,
        position: "top-end",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      setSelectedFiles([]);
      setUploadProgress(0);
      loadAnexos();
    }
  }, [open, accionId]);

  // Manejo de selección de archivos
  const handleFileSelect = (filesList) => {
    const files = Array.from(filesList || []);
    if (!files.length) return;

    const allowed = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
    const valid = [];
    const errors = [];

    for (const f of files) {
      const name = (f.name || "").toLowerCase();
      const okExt = allowed.some((ext) => name.endsWith(ext));

      if (!okExt) {
        errors.push(`${f.name}: Formato no permitido`);
        continue;
      }

      if (f.size > 10 * 1024 * 1024) {
        errors.push(`${f.name}: Excede 10MB`);
        continue;
      }

      if (valid.length + selectedFiles.length >= remainingSlots) {
        errors.push(`Solo puedes agregar ${remainingSlots} archivo(s) más`);
        break;
      }

      valid.push(f);
    }

    if (errors.length > 0) {
      Swal.fire({
        title: "Archivos no válidos",
        html: `<div class="text-left"><p class="mb-2">Los siguientes archivos no pudieron ser agregados:</p><ul class="list-disc pl-5 text-sm">${errors.map((e) => `<li>${e}</li>`).join("")}</ul></div>`,
        icon: "warning",
        confirmButtonColor: "#3b82f6",
      });
    }

    if (valid.length > 0) {
      setSelectedFiles((prev) => [...prev, ...valid]);
      if (valid.length === 1) {
        Swal.fire({
          toast: true,
          title: "Archivo listo",
          text: `${valid.length} archivo listo para subir`,
          icon: "success",
          timer: 1600,
          showConfirmButton: false,
          timerProgressBar: true,
          position: "top-end",
        });
      } else if (valid.length > 1) {
        Swal.fire({
          toast: true,
          title: "Archivos listos",
          text: `${valid.length} archivos listos para subir`,
          icon: "success",
          timer: 1600,
          showConfirmButton: false,
          timerProgressBar: true,
          position: "top-end",
        });
      }
    }
  };

  // Eliminar un archivo seleccionado antes de subir
  const removeSelected = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAll = async () => {
    if (!canEdit) return;
    if (!accionId) return;
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const total = selectedFiles.length;

      for (let i = 0; i < total; i++) {
        const file = selectedFiles[i];
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch(`${API}/acciones/${accionId}/anexos`, {
          method: "POST",
          headers,
          body: fd,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(data?.message || `Error subiendo: ${file.name}`);

        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }

      setSelectedFiles([]);
      await loadAnexos();

      Swal.fire({
        toast: true,
        title: "¡Éxito!",
        text: "Archivos subidos correctamente",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
        position: "top-end",
      });

      setTimeout(() => {
        setUploadProgress(0);
      }, 500);
    } catch (e) {
      console.error(e);
      Swal.fire({
        title: "Error al subir",
        text: e.message || "Ocurrió un error al subir los archivos",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // Eliminar un anexo guardado
  const onDeleteAnexo = async (anexoId) => {
    if (!canEdit) return;

    const anexo = anexos.find((a) => a.id === anexoId);
    const nombre = anexo?.nombre_original || "este archivo";

    const result = await Swal.fire({
      title: "¿Eliminar anexo?",
      html: `Se eliminará <b>${nombre}</b>.<br/>Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API}/acciones/${accionId}/anexos/${anexoId}`, {
        method: "DELETE",
        headers,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Error eliminando anexo");

      await loadAnexos();

      await Swal.fire({
        toast: true,
        title: "Eliminado",
        text: "El anexo fue eliminado correctamente.",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
        position: "top-end",
      });
    } catch (e) {
      console.error(e);
      Swal.fire({
        title: "Error",
        text: e.message || "No se pudo eliminar el anexo",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const onDownload = (anexoId) => {
    window.open(
      `${import.meta.env.VITE_API_URL || ""}/api/acciones/${accionId}/anexos/${anexoId}/descargar`,
      "_blank",
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute left-1/2 top-1/2 w-[95%] max-w-3xl -translate-x-1/2 -translate-y-1/2">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-md">
                <Paperclip className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Documentos de Apoyo
                </h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Acción #{accion?.numero_elaboracion ?? accionId}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full
                    ${accion?.estado === "BORRADOR" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
                  >
                    {accion?.estado}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
              title="Cerrar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-8 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Sección de subida */}
            <div className="bg-gradient-to-br from-blue-50/50 to-white border border-blue-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-sm">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      Adjuntar documentos
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Máximo {maxFiles} archivos • 10MB c/u • Formatos: PDF,
                      Word, JPG, PNG
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {anexos.length}
                    <span className="text-gray-400 text-lg">/{maxFiles}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    archivos guardados
                  </div>
                </div>
              </div>

              {/* Área de drag & drop */}
              <div
                className={`
                border-3 border-dashed rounded-2xl p-10 text-center transition-all duration-300 mb-6
                ${
                  canEdit
                    ? "border-blue-300 bg-blue-50/50 hover:border-blue-400 hover:bg-blue-50"
                    : "border-gray-300 bg-gray-100"
                }
              `}
              >
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-br from-white to-blue-50 shadow-inner">
                  {uploading ? (
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                  ) : (
                    <FileUp className="h-10 w-10 text-blue-400" />
                  )}
                </div>

                <h4 className="font-bold text-gray-700 text-lg mb-2">
                  {uploading
                    ? "Subiendo archivos..."
                    : "Arrastra o selecciona archivos"}
                </h4>

                <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
                  {remainingSlots === 0
                    ? "Has alcanzado el límite de archivos. Elimina algunos para agregar más."
                    : `Puedes agregar hasta ${remainingSlots} archivo(s) más.`}
                </p>

                <label
                  className={`
                  inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-md
                  ${
                    canEdit
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:shadow-lg cursor-pointer"
                      : "bg-gray-300 text-gray-400 cursor-not-allowed"
                  }
                `}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Seleccionar archivos
                    </>
                  )}
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    disabled={!canEdit || uploading || remainingSlots === 0}
                  />
                </label>

                {!canEdit && (
                  <p className="text-sm text-amber-700 mt-4 bg-amber-50 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Solo lectura. Esta acción no está en estado BORRADOR.
                  </p>
                )}
              </div>

              {/* Barra de progreso */}
              {uploadProgress > 0 && (
                <div className="mb-6 animate-fade-in">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Subiendo archivos...
                    </span>
                    <span className="font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500 shadow-md"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Archivos seleccionados */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Archivos seleccionados ({selectedFiles.length})
                    </h4>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        disabled={uploading}
                        className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Limpiar
                      </button>
                      <button
                        type="button"
                        onClick={uploadAll}
                        disabled={!canEdit || uploading}
                        className={`
                          px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md
                          ${
                            !canEdit || uploading
                              ? "bg-gray-200 text-gray-400"
                              : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg"
                          }
                        `}
                      >
                        {uploading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Subiendo...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Upload className="h-3 w-3" />
                            Subir {selectedFiles.length} archivo(s)
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:bg-blue-50/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.name)}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate max-w-xs">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatBytes(file.size)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSelected(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Quitar"
                          disabled={uploading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lista de anexos guardados */}
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <h4 className="font-bold text-gray-800">Anexos guardados</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadAnexos}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3" />
                        Actualizar
                      </>
                    )}
                  </button>
                  <div className="text-xs text-gray-500">
                    {loading
                      ? "Actualizando..."
                      : anexos.length === 0
                        ? "Vacío"
                        : `${anexos.length} archivo(s)`}
                  </div>
                </div>
              </div>

              {anexos.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No hay anexos guardados todavía.
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Sube tus primeros archivos arriba.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {anexos.map((a) => (
                    <div
                      key={a.id}
                      className="group flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(a.nombre_original)}
                        <div>
                          <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                            {a.nombre_original}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>{formatBytes(a.tamano_bytes)}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>
                              {new Date(a.created_at).toLocaleDateString()}
                            </span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span>
                              {new Date(a.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onDownload(a.id)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="Descargar"
                        >
                          <Download className="h-5 w-5" />
                        </button>

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => onDeleteAnexo(a.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Eliminar"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-colors"
              >
                Cerrar ventana
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
