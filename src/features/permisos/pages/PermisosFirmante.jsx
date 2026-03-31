import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  Clock, Calendar, CheckCircle2, XCircle, AlertCircle,
  Clock as ClockIcon, Plus, RefreshCw, Loader2, FileText
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../shared/api/axios";

const estadoBadge = (estado) => {
  const map = {
    PENDIENTE:  "bg-yellow-100 text-yellow-800 border border-yellow-200",
    APROBADO:   "bg-green-100 text-green-800 border border-green-200",
    RECHAZADO:  "bg-red-100 text-red-800 border border-red-200",
  };
  const icons = {
    PENDIENTE: <ClockIcon size={12} />,
    APROBADO:  <CheckCircle2 size={12} />,
    RECHAZADO: <XCircle size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${map[estado]}`}>
      {icons[estado]} {estado}
    </span>
  );
};

const initialForm = {
  permiso_tipo_id: "", fecha: "", hora_salida: "", hora_regreso: "", motivo: "",
};

export default function PermisosFirmante() {
  const { user } = useAuth();
  const [saldo, setSaldo] = useState(null);
  const [permisos, setPermisos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [saldoData, permisosData, tiposData] = await Promise.all([
        api.get("/permisos/mi-saldo-firmante").then(r => r.data),
        api.get("/permisos/mis-permisos-firmante").then(r => r.data),
        api.get("/permisos/tipos").then(r => r.data),
      ]);
      setSaldo(saldoData);
      setPermisos(permisosData);
      setTipos(tiposData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const horasCalculadas = () => {
    if (!form.hora_salida || !form.hora_regreso) return 0;
    const salida = new Date(`2000-01-01T${form.hora_salida}`);
    const regreso = new Date(`2000-01-01T${form.hora_regreso}`);
    const horas = (regreso - salida) / (1000 * 60 * 60);
    return horas > 0 ? horas.toFixed(2) : 0;
  };

  const handleSubmit = async () => {
    if (!form.permiso_tipo_id || !form.fecha || !form.hora_salida || !form.hora_regreso) {
      Swal.fire({ toast: true, icon: "warning", text: "Completa todos los campos", timer: 2000, showConfirmButton: false, position: "top-end" });
      return;
    }
    if (horasCalculadas() <= 0) {
      Swal.fire({ toast: true, icon: "error", text: "La hora de regreso debe ser posterior", timer: 2000, showConfirmButton: false, position: "top-end" });
      return;
    }

    const confirm = await Swal.fire({
      title: "¿Enviar solicitud?",
      html: `<div class="text-left space-y-2">
        <p><b>Fecha:</b> ${form.fecha}</p>
        <p><b>Horario:</b> ${form.hora_salida} - ${form.hora_regreso}</p>
        <p><b>Horas:</b> ${horasCalculadas()}</p>
      </div>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Revisar",
      confirmButtonColor: "#3b82f6",
    });

    if (!confirm.isConfirmed) return;

    setSubmitting(true);
    try {
      await api.post("/permisos/solicitar-firmante", form);
      Swal.fire({ toast: true, icon: "success", text: "Solicitud enviada correctamente", timer: 2000, showConfirmButton: false, position: "top-end" });
      setModalOpen(false);
      setForm(initialForm);
      cargarDatos();
    } catch (err) {
      Swal.fire({
        icon: "error", title: "Error",
        text: err.response?.data?.message || "No se pudo enviar la solicitud",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const porcentajeUsado = saldo
    ? Math.round((saldo.horas_usadas / saldo.horas_totales) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Permisos</h1>
          <p className="text-gray-500 mt-1">Bienvenido, <span className="font-semibold text-blue-600">{user?.nombre}</span></p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Saldo de Permisos {saldo?.anio}</h3>
                      <p className="text-sm text-gray-500">15 días hábiles anuales</p>
                    </div>
                  </div>
                  <span className="text-3xl font-bold text-blue-600">{saldo?.horas_disponibles ?? 0}h</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Usadas: <b>{saldo?.horas_usadas ?? 0}h</b></span>
                    <span>Total: <b>{saldo?.horas_totales ?? 0}h</b></span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${porcentajeUsado > 80 ? "bg-red-500" : porcentajeUsado > 50 ? "bg-yellow-500" : "bg-blue-500"}`}
                      style={{ width: `${porcentajeUsado}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 text-right">{porcentajeUsado}% utilizado</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-white">
                <Plus className="h-10 w-10 mb-3 opacity-80" />
                <p className="font-bold text-lg mb-1">Nueva Solicitud</p>
                <p className="text-blue-200 text-sm text-center mb-4">Solicita un permiso de ausencia temporal</p>
                <button
                  onClick={() => setModalOpen(true)}
                  disabled={!saldo || parseFloat(saldo.horas_disponibles) <= 0}
                  className="w-full py-2.5 bg-white text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Solicitar permiso
                </button>
                {parseFloat(saldo?.horas_disponibles) <= 0 && (
                  <p className="text-xs text-red-200 mt-2 text-center">Sin saldo disponible</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <h3 className="font-bold text-gray-900">Mis Solicitudes</h3>
                </div>
                <button onClick={cargarDatos} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <RefreshCw size={16} className="text-gray-500" />
                </button>
              </div>

              {permisos.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No tienes solicitudes aún</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {permisos.map((p) => (
                    <div key={p.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Calendar size={18} className="text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{p.tipo_permiso}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(p.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                              {" · "}{p.hora_salida} - {p.hora_regreso}
                              {" · "}<span className="font-medium">{p.horas_solicitadas}h</span>
                            </p>
                            {p.motivo && <p className="text-xs text-gray-400 mt-0.5">{p.motivo}</p>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {estadoBadge(p.estado)}
                          {p.observacion_jefe && (
                            <p className="text-xs text-gray-500 max-w-[200px] text-right">{p.observacion_jefe}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Nueva Solicitud</h2>
                  <p className="text-sm text-gray-500">Disponible: <b className="text-blue-600">{saldo?.horas_disponibles}h</b></p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de permiso <span className="text-red-500">*</span></label>
                <select
                  value={form.permiso_tipo_id}
                  onChange={(e) => setForm(p => ({ ...p, permiso_tipo_id: e.target.value }))}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccione el tipo...</option>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha <span className="text-red-500">*</span></label>
                <input type="date" value={form.fecha}
                  onChange={(e) => setForm(p => ({ ...p, fecha: e.target.value }))}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hora salida <span className="text-red-500">*</span></label>
                  <input type="time" value={form.hora_salida}
                    onChange={(e) => setForm(p => ({ ...p, hora_salida: e.target.value }))}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Hora regreso <span className="text-red-500">*</span></label>
                  <input type="time" value={form.hora_regreso}
                    onChange={(e) => setForm(p => ({ ...p, hora_regreso: e.target.value }))}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {horasCalculadas() > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  <span className="text-sm text-blue-800">Duración: <b>{horasCalculadas()} horas</b></span>
                  {horasCalculadas() > parseFloat(saldo?.horas_disponibles ?? 0) && (
                    <span className="text-xs text-red-600 ml-auto flex items-center gap-1">
                      <AlertCircle size={12} /> Supera el saldo
                    </span>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo (opcional)</label>
                <textarea value={form.motivo}
                  onChange={(e) => setForm(p => ({ ...p, motivo: e.target.value }))}
                  rows={3}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describa brevemente el motivo..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium"
              >Cancelar</button>
              <button onClick={handleSubmit}
                disabled={submitting || horasCalculadas() > parseFloat(saldo?.horas_disponibles ?? 0)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : <><Calendar size={16} /> Enviar solicitud</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}