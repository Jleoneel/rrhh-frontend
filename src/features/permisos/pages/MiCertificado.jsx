import { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import {
  ShieldCheck,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileKey,
  RefreshCw,
  X,
  Loader2,
  Lock,
  Key,
  Info,
  FileText,
  Download,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../shared/api/axios";

export default function MiCertificado() {
  const { setHeaderConfig } = useOutletContext();
  const inputRef = useRef(null);

  useEffect(() => {
    setHeaderConfig({
      title: "Mi Certificado Digital",
      showNewAction: false,
      onNewAction: null,
    });
  }, [setHeaderConfig]);

  const [certificado, setCertificado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);

  const cargarCertificado = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/firmas/mi-certificado");
      setCertificado(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCertificado();
  }, []);

  const handleSubir = async () => {
    if (!file) return;

    const confirm = await Swal.fire({
      title: "¿Subir certificado digital?",
      html: `
        <div class="text-left space-y-4 mt-2">
          <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
            </div>
            <div>
              <p class="font-semibold text-gray-800">${file.name}</p>
              <p class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <div class="space-y-2">
            <p class="text-sm text-gray-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Acción a realizar:
            </p>
            <ul class="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
              <li>${certificado?.tiene_certificado ? "Reemplazar certificado existente" : "Registrar nuevo certificado"}</li>
            </ul>
          </div>
          <div class="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p class="text-xs text-amber-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
              <span>${certificado?.tiene_certificado ? "El certificado anterior dejará de funcionar automáticamente." : "Podrás firmar documentos digitalmente una vez registrado."}</span>
            </p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, subir certificado",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      background: "#ffffff",
      color: "#1f2937",
    });

    if (!confirm.isConfirmed) return;

    setUploading(true);
    Swal.fire({
      title: "Procesando archivo",
      html: `
        <div class="flex flex-col items-center gap-4 py-4">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div class="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <div>
            <p class="font-medium text-gray-800">Subiendo certificado...</p>
            <p class="text-sm text-gray-500 mt-1">Validando archivo .p12</p>
          </div>
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      background: "#ffffff",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/firmas/subir-p12", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.close();
      Swal.fire({
        toast: true,
        icon: "success",
        title: "¡Certificado registrado!",
        text: "Tu certificado digital ha sido guardado correctamente",
        timer: 3000,
        showConfirmButton: false,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });

      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      cargarCertificado();
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo subir el certificado",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-200">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Mi Certificado Digital
            </h1>
            <p className="text-gray-500 mt-1">
              Gestiona tu certificado .p12 del BCE Ecuador
            </p>
          </div>
        </div>

        {/* Estado actual del certificado */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Estado del certificado
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="text-gray-500">Verificando certificado...</span>
            </div>
          ) : certificado?.tiene_certificado ? (
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-800">Certificado registrado</p>
                <p className="text-sm text-green-600 mt-0.5">
                  Tu certificado digital está activo y listo para firmar documentos
                </p>
                {certificado?.detalles && (
                  <div className="mt-2 text-xs text-green-600 space-y-0.5">
                    <p>📧 {certificado.detalles.email || "—"}</p>
                    <p>🏢 {certificado.detalles.organizacion || "—"}</p>
                  </div>
                )}
              </div>
              <button
                onClick={cargarCertificado}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                title="Actualizar"
              >
                <RefreshCw size={16} className="text-green-600" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-800">Sin certificado registrado</p>
                <p className="text-sm text-red-600 mt-0.5">
                  No podrás firmar solicitudes hasta registrar tu certificado digital
                </p>
              </div>
              <button
                onClick={cargarCertificado}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                title="Actualizar"
              >
                <RefreshCw size={16} className="text-red-600" />
              </button>
            </div>
          )}
        </div>

        {/* Subir nuevo certificado */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Upload className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              {certificado?.tiene_certificado ? "Actualizar certificado" : "Registrar certificado"}
            </h2>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".p12"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <div className="space-y-4">
            {/* Área de drop */}
            <div
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                file
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
              }`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileKey size={20} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                    className="ml-auto p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X size={16} className="text-red-500" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Haz clic para seleccionar tu archivo .p12</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Certificado digital emitido por el BCE Ecuador
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de subida */}
            <button
              onClick={handleSubir}
              disabled={!file || uploading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Subiendo certificado...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  {certificado?.tiene_certificado ? "Actualizar certificado" : "Registrar certificado"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info importante - Mejorada */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Info size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800 mb-2">Información importante</p>
              <ul className="space-y-2 text-sm text-amber-700">
                <li className="flex items-start gap-2">
                  <Lock size={14} className="flex-shrink-0 mt-0.5" />
                  <span>El archivo <strong>.p12</strong> es tu certificado digital personal emitido por el BCE Ecuador</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
                  <span>Tu contraseña del token <strong>nunca se guarda</strong> — solo la ingresas al momento de firmar</span>
                </li>
                <li className="flex items-start gap-2">
                  <FileText size={14} className="flex-shrink-0 mt-0.5" />
                  <span>Cada vez que apruebes una solicitud se te pedirá la contraseña del token</span>
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCw size={14} className="flex-shrink-0 mt-0.5" />
                  <span>Si cambias tu certificado, el anterior dejará de funcionar automáticamente</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}