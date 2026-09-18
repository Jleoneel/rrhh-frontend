import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  FileSignature,
  ShieldCheck,
  Download,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../shared/api/axios";

const estadoBadge = (estado) => {
  if (estado === "FIRMADO")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
        <CheckCircle2 size={12} /> Recibido
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
      <Clock size={12} /> Pendiente de tu firma
    </span>
  );
};

export default function AccionesRecepcionServidor() {
  const { setHeaderConfig } = useOutletContext();

  useEffect(() => {
    setHeaderConfig({
      title: "Mis Acciones de Personal",
      showNewAction: false,
      onNewAction: null,
    });
  }, [setHeaderConfig]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalFirma, setModalFirma] = useState(false);
  const [accionSeleccionada, setAccionSeleccionada] = useState(null);
  const [passwordToken, setPasswordToken] = useState("");
  const [firmando, setFirmando] = useState(false);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/firmas/recepciones");
      setItems(data || []);
    } catch (err) {
      console.error("Error cargando recepciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleDownload = (archivoPath) => {
    if (!archivoPath) return;
    const apiBase = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
    window.open(`${apiBase}${archivoPath}`, "_blank");
  };

  const abrirModalFirma = (item) => {
    setAccionSeleccionada(item);
    setPasswordToken("");
    setModalFirma(true);
  };

  const handleFirmar = async () => {
    if (!passwordToken.trim() || !accionSeleccionada) return;

    setFirmando(true);
    try {
      await api.post(
        `/firmas/acciones/${accionSeleccionada.accion_id}/firmar-recepcion`,
        { password: passwordToken },
      );

      Swal.fire({
        toast: true,
        icon: "success",
        title: "¡Recepción firmada!",
        text: "Quedó registrada tu firma de recibido",
        timer: 3000,
        showConfirmButton: false,
        position: "top-end",
      });

      setModalFirma(false);
      setPasswordToken("");
      setAccionSeleccionada(null);
      await cargarDatos();
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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <FileSignature className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Mis Acciones de Personal
            </h1>
            <p className="text-sm text-gray-500">
              Acciones ya aprobadas que requieren tu firma de recepción
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-gray-500 text-sm mt-3">Cargando...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 py-24 text-center">
            <FileSignature className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              No tienes acciones de personal pendientes de recepción
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.accion_id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900">
                      {item.tipo_accion}
                    </h3>
                    {estadoBadge(item.estado_recepcion)}
                  </div>
                  <p className="text-sm text-gray-500 font-mono">
                    {item.codigo_elaboracion || item.accion_id}
                  </p>
                  {item.firmado_en && (
                    <p className="text-xs text-gray-400 mt-1">
                      Recibido el{" "}
                      {new Date(item.firmado_en).toLocaleDateString("es-EC", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.estado_recepcion === "PENDIENTE" ? (
                    <>
                      {item.archivo_aprueba_autoridad && (
                        <button
                          onClick={() =>
                            handleDownload(item.archivo_aprueba_autoridad)
                          }
                          className="p-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                          title="Ver documento aprobado"
                        >
                          <Download size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => abrirModalFirma(item)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                      >
                        <ShieldCheck size={16} /> Firmar como recibido
                      </button>
                    </>
                  ) : (
                    item.archivo_recibido && (
                      <button
                        onClick={() => handleDownload(item.archivo_recibido)}
                        className="flex items-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                      >
                        <Download size={16} /> Descargar
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalFirma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !firmando && setModalFirma(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Firma de Recepción</h2>
                    <p className="text-sm opacity-90">
                      {accionSeleccionada?.tipo_accion}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !firmando && setModalFirma(false)}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800">
                  Se firmará digitalmente el documento aprobado usando tu
                  certificado .p12 propio, confirmando que aceptas y recibes
                  esta Acción de Personal.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña del certificado{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={passwordToken}
                  disabled={firmando}
                  onChange={(e) => setPasswordToken(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFirmar()}
                  placeholder="Ingresa la contraseña de tu certificado"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
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
                  disabled={firmando}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFirmar}
                  disabled={!passwordToken.trim() || firmando}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
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
    </div>
  );
}
