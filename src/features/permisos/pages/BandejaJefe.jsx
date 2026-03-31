import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  CheckCircle, XCircle, Clock, RefreshCw, Loader2,
  User, Calendar, FileText, Filter, ChevronDown,
  CheckSquare, AlertCircle
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../shared/api/axios";

const estadoBadge = (estado) => {
  const map = {
    PENDIENTE: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    APROBADO:  "bg-green-100 text-green-800 border border-green-200",
    RECHAZADO: "bg-red-100 text-red-800 border border-red-200",
  };
  const icons = {
    PENDIENTE: <Clock size={12} />,
    APROBADO:  <CheckCircle size={12} />,
    RECHAZADO: <XCircle size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${map[estado]}`}>
      {icons[estado]} {estado}
    </span>
  );
};

export default function BandejaJefe() {
  const { user } = useAuth();
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("PENDIENTE");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cargarPermisos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/permisos/bandeja");
      setPermisos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarPermisos(); }, []);

  const permisosFiltrados = useMemo(() => {
    if (filtroEstado === "TODOS") return permisos;
    return permisos.filter(p => p.estado === filtroEstado);
  }, [permisos, filtroEstado]);

  // Stats
  const stats = useMemo(() => ({
    pendientes: permisos.filter(p => p.estado === "PENDIENTE").length,
    aprobados:  permisos.filter(p => p.estado === "APROBADO").length,
    rechazados: permisos.filter(p => p.estado === "RECHAZADO").length,
  }), [permisos]);

  const abrirModal = (permiso, accion) => {
    setSelected({ ...permiso, accion });
    setObservacion("");
    setModalOpen(true);
  };

  const handleResponder = async () => {
    if (!selected) return;

    const confirm = await Swal.fire({
      title: selected.accion === "APROBADO" ? "¿Aprobar permiso?" : "¿Rechazar permiso?",
      html: `
        <div class="text-left space-y-2">
          <p><b>Servidor:</b> ${selected.servidor_nombre}</p>
          <p><b>Fecha:</b> ${new Date(selected.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</p>
          <p><b>Horas:</b> ${selected.horas_solicitadas}h</p>
        </div>
      `,
      icon: selected.accion === "APROBADO" ? "question" : "warning",
      showCancelButton: true,
      confirmButtonText: selected.accion === "APROBADO" ? "Sí, aprobar" : "Sí, rechazar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: selected.accion === "APROBADO" ? "#10b981" : "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    setSubmitting(true);
    try {
      await api.put(`/permisos/${selected.id}/responder`, {
        estado: selected.accion,
        observacion,
      });

      Swal.fire({
        toast: true,
        icon: "success",
        text: `Permiso ${selected.accion === "APROBADO" ? "aprobado" : "rechazado"} correctamente`,
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });

      setModalOpen(false);
      cargarPermisos();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo procesar la solicitud",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bandeja de Permisos</h1>
            <p className="text-gray-500 mt-1">
              Solicitudes de permiso de tu área — <span className="font-medium text-blue-600">{user?.nombre}</span>
            </p>
          </div>
          <button onClick={cargarPermisos} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pendientes", value: stats.pendientes, color: "yellow", icon: Clock },
            { label: "Aprobados",  value: stats.aprobados,  color: "green",  icon: CheckCircle },
            { label: "Rechazados", value: stats.rechazados, color: "red",    icon: XCircle },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                onClick={() => setFiltroEstado(s.label.toUpperCase().slice(0, -1) === "PENDIENTE" ? "PENDIENTE" : s.label.toUpperCase())}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className={`text-3xl font-bold mt-1 text-${s.color}-600`}>{s.value}</p>
                  </div>
                  <div className={`p-3 bg-${s.color}-100 rounded-xl`}>
                    <Icon className={`h-6 w-6 text-${s.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="TODOS">Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="APROBADO">Aprobados</option>
              <option value="RECHAZADO">Rechazados</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <span className="text-sm text-gray-500">
            {permisosFiltrados.length} solicitud{permisosFiltrados.length !== 1 ? "es" : ""}
          </span>
        </div>

        {/* Lista de permisos */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
          ) : permisosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No hay solicitudes {filtroEstado !== "TODOS" ? filtroEstado.toLowerCase() + "s" : ""}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {permisosFiltrados.map((p) => (
                <div key={p.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-semibold text-gray-900">{p.servidor_nombre}</p>
                          <span className="text-xs text-gray-400 font-mono">{p.cedula}</span>
                          {estadoBadge(p.estado)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{p.unidad_organica}</p>

                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Calendar size={14} className="text-gray-400" />
                            {new Date(p.fecha).toLocaleDateString("es-ES", {
                              day: "2-digit", month: "long", year: "numeric"
                            })}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Clock size={14} className="text-gray-400" />
                            {p.hora_salida} - {p.hora_regreso}
                            <span className="font-semibold text-blue-600">{p.horas_solicitadas}h</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <FileText size={14} className="text-gray-400" />
                            {p.tipo_permiso}
                          </div>
                        </div>

                        {p.motivo && (
                          <p className="text-sm text-gray-500 mt-2 italic">"{p.motivo}"</p>
                        )}

                        {p.observacion_jefe && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Tu observación: <span className="text-gray-700">{p.observacion_jefe}</span></p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones solo para PENDIENTE */}
                    {p.estado === "PENDIENTE" && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => abrirModal(p, "APROBADO")}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm text-sm font-medium"
                        >
                          <CheckCircle size={16} /> Aprobar
                        </button>
                        <button
                          onClick={() => abrirModal(p, "RECHAZADO")}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-all text-sm font-medium"
                        >
                          <XCircle size={16} /> Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación con observación */}
      {modalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-xl ${selected.accion === "APROBADO" ? "bg-green-100" : "bg-red-100"}`}>
                {selected.accion === "APROBADO"
                  ? <CheckCircle className="h-6 w-6 text-green-600" />
                  : <XCircle className="h-6 w-6 text-red-600" />
                }
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selected.accion === "APROBADO" ? "Aprobar permiso" : "Rechazar permiso"}
                </h2>
                <p className="text-sm text-gray-500">{selected.servidor_nombre}</p>
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tipo:</span>
                <span className="font-medium">{selected.tipo_permiso}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fecha:</span>
                <span className="font-medium">
                  {new Date(selected.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Horario:</span>
                <span className="font-medium">{selected.hora_salida} - {selected.hora_regreso}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Horas:</span>
                <span className="font-bold text-blue-600">{selected.horas_solicitadas}h</span>
              </div>
            </div>

            {/* Observación */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Observación {selected.accion === "RECHAZADO" && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                rows={3}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder={selected.accion === "RECHAZADO" ? "Indique el motivo del rechazo..." : "Observación opcional..."}
              />
              {selected.accion === "RECHAZADO" && !observacion && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> La observación es requerida al rechazar
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleResponder}
                disabled={submitting || (selected.accion === "RECHAZADO" && !observacion)}
                className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  selected.accion === "APROBADO"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Procesando...</>
                ) : selected.accion === "APROBADO" ? (
                  <><CheckCircle size={16} /> Confirmar aprobación</>
                ) : (
                  <><XCircle size={16} /> Confirmar rechazo</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}