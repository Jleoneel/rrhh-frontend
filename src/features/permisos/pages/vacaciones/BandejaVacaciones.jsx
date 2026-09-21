import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  User,
  Calendar,
  AlertCircle,
  Download,
  Upload,
  TrendingUp,
  Umbrella,
  Eye,
  X,
  Send,
  ShieldCheck,
  Filter,
  ChevronDown,
  CheckSquare,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../../shared/api/axios";
import FirmaDigitalModal from "../../../../shared/components/ui/FirmaDigitalModal";
import StatCard from "../../../../shared/components/ui/StatCard";

const estadoBadge = (estado) => {
  const map = {
    PENDIENTE_JEFE: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    PENDIENTE_GERENTE: "bg-orange-100 text-orange-800 border border-orange-200",
    PENDIENTE_UATH: "bg-blue-100 text-blue-800 border border-blue-200",
    APROBADO: "bg-green-100 text-green-800 border border-green-200",
    NEGADO: "bg-red-100 text-red-800 border border-red-200",
  };
  const labels = {
    PENDIENTE_JEFE: "Pendiente Jefe",
    PENDIENTE_GERENTE: "Pendiente Jefe Superior",
    PENDIENTE_UATH: "Pendiente UATH",
    APROBADO: "Aprobado",
    NEGADO: "Negado",
  };
  const icons = {
    PENDIENTE_JEFE: <Clock size={11} />,
    PENDIENTE_GERENTE: <Clock size={11} />,
    PENDIENTE_UATH: <Clock size={11} />,
    APROBADO: <CheckCircle size={11} />,
    NEGADO: <XCircle size={11} />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${map[estado] || "bg-gray-100 text-gray-600"}`}
    >
      {icons[estado]} {labels[estado] || estado}
    </span>
  );
};


export default function BandejaVacaciones() {
  const { setHeaderConfig } = useOutletContext();

  useEffect(() => {
    setHeaderConfig({
      title: "Bandeja de Vacaciones",
      showNewAction: false,
      onNewAction: null,
    });
  }, [setHeaderConfig]);

  const { user } = useAuth();
  const [vacaciones, setVacaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("PENDIENTE");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [passwordToken, setPasswordToken] = useState("");
  const [vacacionFirmar, setVacacionFirmar] = useState(null);
  const [firmando, setFirmando] = useState(false);

  const cargarVacaciones = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/permisos/bandeja-vacaciones");
      setVacaciones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVacaciones();
  }, []);

  const stats = useMemo(
    () => ({
      total: vacaciones.length,
      pendientes: vacaciones.filter((v) => v.estado.startsWith("PENDIENTE"))
        .length,
      aprobados: vacaciones.filter((v) => v.estado === "APROBADO").length,
      negados: vacaciones.filter((v) => v.estado === "NEGADO").length,
    }),
    [vacaciones],
  );

  const vacacionesFiltradas = useMemo(() => {
    if (filtroEstado === "TODOS") return vacaciones;
    if (filtroEstado === "PENDIENTE")
      return vacaciones.filter((v) => v.estado.startsWith("PENDIENTE"));
    return vacaciones.filter((v) => v.estado === filtroEstado);
  }, [vacaciones, filtroEstado]);

  const abrirModal = (vacacion, aprobado) => {
    setSelected({ ...vacacion, accion: aprobado });
    setObservacion("");
    setModalOpen(true);
  };

  const handleResponder = async () => {
    if (!selected.accion && !observacion.trim()) {
      Swal.fire({
        toast: true,
        icon: "warning",
        title: "Observación requerida",
        text: "Debes indicar el motivo del rechazo",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/permisos/${selected.id}/responder-vacacion`, {
        aprobado: selected.accion,
        observacion,
      });

      Swal.fire({
        toast: true,
        icon: "success",
        title: "¡Procesado!",
        text: selected.accion
          ? "Solicitud aprobada correctamente"
          : "Solicitud negada",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });

      setModalOpen(false);
      cargarVacaciones();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo procesar",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const labelAccion = (estado) => {
    if (estado === "PENDIENTE_JEFE") return "Jefe Inmediato";
    if (estado === "PENDIENTE_GERENTE") return "Jefe Superior";
    if (estado === "PENDIENTE_UATH") return "UATH";
    return estado;
  };

  const handleDescargar = async (v) => {
    let tipo;

    if (v.estado === "PENDIENTE_JEFE") {
      tipo = v.archivo_solicitante ? "solicitante" : "base";
    } else if (v.estado === "PENDIENTE_GERENTE") {
      tipo = "jefe";
    } else {
      // PENDIENTE_UATH, APROBADO o NEGADO (historial): descargar el
      // archivo más avanzado disponible.
      if (v.archivo_uath) {
        tipo = "uath";
      } else if (v.archivo_superior) {
        tipo = "superior";
      } else if (v.archivo_jefe) {
        tipo = "jefe";
      } else if (v.archivo_solicitante) {
        tipo = "solicitante";
      } else {
        tipo = "base";
      }
    }

    try {
      const token = localStorage.getItem("token");
      const url =
        tipo === "base"
          ? `${import.meta.env.VITE_API_URL}/api/permisos/${v.id}/pdf-vacacion`
          : `${import.meta.env.VITE_API_URL}/api/permisos/${v.id}/descargar-vacacion/${tipo}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Error descargando PDF");
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = `vacacion_${v.servidor_nombre}_${tipo}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(a.href);
      }, 100);
      //eslint-disable-next-line
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo descargar el PDF",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleConfirmar = async (v) => {
    const endpointMap = {
      PENDIENTE_JEFE: "confirmar-firma-jefe",
      PENDIENTE_GERENTE: "confirmar-firma-superior",
      PENDIENTE_UATH: "confirmar-firma-uath",
    };
    const endpoint = endpointMap[v.estado];
    if (!endpoint) return;

    const confirm = await Swal.fire({
      title: "¿Confirmar envío?",
      text: "El PDF firmado será enviado al siguiente paso. Ya no podrás modificarlo.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Revisar",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.post(`/permisos/${v.id}/${endpoint}`);
      Swal.fire({
        toast: true,
        icon: "success",
        text: "Solicitud enviada al siguiente paso",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      cargarVacaciones();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "No se pudo confirmar",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleVerPdf = async (v) => {
    const archivoMap = {
      PENDIENTE_JEFE: v.archivo_jefe,
      PENDIENTE_GERENTE: v.archivo_superior,
      PENDIENTE_UATH: v.archivo_uath,
    };
    const archivo = archivoMap[v.estado];
    if (!archivo) return;

    const token = localStorage.getItem("token");
    const tipoMap = {
      PENDIENTE_JEFE: "jefe",
      PENDIENTE_GERENTE: "superior",
      PENDIENTE_UATH: "uath",
    };
    const tipo = tipoMap[v.estado];

    const url = `${import.meta.env.VITE_API_URL}/api/permisos/${v.id}/descargar-vacacion/${tipo}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await response.blob();
    const a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = `vacacion_revision_${v.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);
    }, 100);
  };

  const handleFirmar = async () => {
    if (!passwordToken.trim()) return;

    const endpointMap = {
      PENDIENTE_JEFE: "confirmar-firma-jefe",
      PENDIENTE_GERENTE: "confirmar-firma-superior",
      PENDIENTE_UATH: "confirmar-firma-uath",
    };
    const endpoint = endpointMap[vacacionFirmar.estado];

    setFirmando(true);
    try {
      await api.post(`/permisos/${vacacionFirmar.id}/${endpoint}`, {
        password: passwordToken,
      });

      Swal.fire({
        toast: true,
        icon: "success",
        title: "¡Firmado y enviado!",
        text: "Solicitud firmada digitalmente y enviada al siguiente paso",
        timer: 3000,
        showConfirmButton: false,
        position: "top-end",
      });

      setModalPassword(false);
      setPasswordToken("");
      setVacacionFirmar(null);
      cargarVacaciones();
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-green-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-linear-to-br from-green-600 to-green-700 rounded-2xl shadow-xl shadow-green-200">
                <Umbrella className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                  Bandeja de Vacaciones
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-500">Responsable:</span>
                  <span className="font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                    {user?.nombre}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={cargarVacaciones}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-md hover:shadow-lg"
              title="Actualizar datos"
            >
              <RefreshCw size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              label="Pendientes"
              value={stats.pendientes}
              icon={Clock}
              color="yellow"
              onClick={() => setFiltroEstado("PENDIENTE")}
            />
            <StatCard
              label="Aprobados"
              value={stats.aprobados}
              icon={CheckCircle}
              color="green"
              onClick={() => setFiltroEstado("APROBADO")}
            />
            <StatCard
              label="Negados"
              value={stats.negados}
              icon={XCircle}
              color="red"
              onClick={() => setFiltroEstado("NEGADO")}
            />
            <StatCard
              label="Total"
              value={stats.total}
              icon={TrendingUp}
              color="blue"
              onClick={() => setFiltroEstado("TODOS")}
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border-2 border-gray-200 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-45"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="APROBADO">Aprobados</option>
              <option value="NEGADO">Negados</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-gray-500">
              {vacacionesFiltradas.length} solicitud
              {vacacionesFiltradas.length !== 1 ? "es" : ""}
            </span>
          </div>
        </div>

        {/* Lista de solicitudes */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">
                Cargando solicitudes...
              </p>
            </div>
          ) : vacacionesFiltradas.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex p-6 bg-gray-100 rounded-2xl mb-4">
                <CheckSquare className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg">
                No hay solicitudes{" "}
                {
                  {
                    TODOS: "",
                    PENDIENTE: "pendientes",
                    APROBADO: "aprobadas",
                    NEGADO: "negadas",
                  }[filtroEstado]
                }
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {filtroEstado === "PENDIENTE"
                  ? "No hay solicitudes pendientes de revisión"
                  : "Las solicitudes de vacaciones que te corresponda revisar aparecerán aquí"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {vacacionesFiltradas.map((v) => (
                <div
                  key={v.id}
                  className="p-6 hover:bg-linear-to-r hover:from-green-50/50 hover:to-transparent transition-all duration-300 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Contenido izquierdo */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-3 bg-linear-to-br from-green-100 to-green-200 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <p className="font-bold text-gray-900 text-lg">
                            {v.servidor_nombre}
                          </p>
                          <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded-lg">
                            {v.cedula}
                          </span>
                          {estadoBadge(v.estado)}
                        </div>
                        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                          {v.unidad_organica}
                        </p>

                        <div className="flex flex-wrap items-center gap-5 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Umbrella size={14} className="text-gray-400" />
                            <span className="font-medium">
                              {v.tipo === "VACACION_PROGRAMADA"
                                ? "Vacación Programada"
                                : "Permiso con Cargo"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} className="text-gray-400" />
                            <span>
                              {new Date(
                                v.fecha_inicio + "T12:00:00",
                              ).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                              })}
                              {" → "}
                              {new Date(
                                v.fecha_fin + "T12:00:00",
                              ).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                              <Calendar size={12} />
                              {v.dias_solicitados} días
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <span className="text-gray-400 flex items-center gap-1">
                            <Clock size={12} />
                            Solicitado el{" "}
                            {new Date(
                              v.fecha_solicitud + "T12:00:00",
                            ).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          {v.estado.startsWith("PENDIENTE") && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                              <Eye size={10} />
                              Pendiente de: {labelAccion(v.estado)}
                            </span>
                          )}
                        </div>

                        {[
                          { label: "Observación del jefe:", texto: v.observacion_jefe },
                          { label: "Observación del gerente:", texto: v.observacion_gerente },
                          { label: "Observación de la UATH:", texto: v.observacion_uath },
                        ]
                          .filter((o) => o.texto)
                          .map((o) => (
                            <div
                              key={o.label}
                              className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 max-w-lg"
                            >
                              <p className="text-xs text-amber-600 mb-1 flex items-center gap-1">
                                <AlertCircle size={10} /> {o.label}
                              </p>
                              <p className="text-sm text-amber-800">
                                {o.texto}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                      {/* Descargar PDF base */}
                      <button
                        onClick={() => handleDescargar(v)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium"
                        title="Descargar PDF para firmar"
                      >
                        <Download size={15} />
                        <span className="hidden sm:inline">Descargar</span>
                      </button>

                      {/* Subir/Resubir PDF firmado — solo si es tu turno
                          ahora mismo (no basta con que el estado general
                          sea "pendiente"; puede estar pendiente de otro
                          paso en el que tú ya participaste antes). */}
                      {v.es_mi_turno && (
                        <button
                          onClick={() => {
                            setVacacionFirmar(v);
                            setPasswordToken("");
                            setModalPassword(true);
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-medium"
                        >
                          <ShieldCheck size={15} />
                          <span className="hidden sm:inline">
                            {v.estado === "PENDIENTE_UATH"
                              ? "Certificar"
                              : "Firmar"}
                          </span>
                        </button>
                      )}

                      {/* Ver PDF subido */}
                      {((v.estado === "PENDIENTE_JEFE" && v.archivo_jefe) ||
                        (v.estado === "PENDIENTE_GERENTE" &&
                          v.archivo_superior) ||
                        (v.estado === "PENDIENTE_UATH" && v.archivo_uath)) && (
                        <button
                          onClick={() => handleVerPdf(v)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-600 border border-green-200 rounded-xl hover:bg-green-100 transition-all text-sm font-medium"
                        >
                          <Eye size={15} />
                          <span className="hidden sm:inline">Ver PDF</span>
                        </button>
                      )}

                      {/* Confirmar envío — solo si ya subió PDF y no es UATH */}
                      {((v.estado === "PENDIENTE_JEFE" && v.archivo_jefe) ||
                        (v.estado === "PENDIENTE_GERENTE" &&
                          v.archivo_superior) ||
                        (v.estado === "PENDIENTE_UATH" && v.archivo_uath)) && ( // ← agregar UATH
                        <button
                          onClick={() => handleConfirmar(v)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm font-medium"
                        >
                          <Send size={15} />
                          <span className="hidden sm:inline">
                            {v.estado === "PENDIENTE_UATH"
                              ? "Certificar"
                              : "Confirmar"}
                          </span>
                        </button>
                      )}

                      {/* Negar */}
                      {v.estado === "PENDIENTE_JEFE" && (
                        <button
                          onClick={() => abrirModal(v, false)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-all text-sm font-medium"
                        >
                          <XCircle size={15} />
                          <span className="hidden sm:inline">Negar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal - Mejorado */}
      {modalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div
              className={`px-6 py-5 ${
                selected.accion
                  ? "bg-linear-to-r from-green-900 to-green-800"
                  : "bg-linear-to-r from-red-900 to-red-800"
              } text-white`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    {selected.accion ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {selected.accion
                        ? selected.estado === "PENDIENTE_UATH"
                          ? "Certificar vacaciones"
                          : "Aprobar vacaciones"
                        : "Negar vacaciones"}
                    </h2>
                    <p className="text-sm opacity-90 mt-0.5">
                      {selected.servidor_nombre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all hover:rotate-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Resumen */}
              <div className="bg-linear-to-r from-gray-50 to-white rounded-xl p-4 mb-6 space-y-3 border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tipo:</span>
                  <span className="font-semibold text-gray-900">
                    {selected.tipo === "VACACION_PROGRAMADA"
                      ? "Vacación Programada"
                      : "Permiso con Cargo"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Período:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(
                      selected.fecha_inicio + "T12:00:00",
                    ).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                    })}
                    {" → "}
                    {new Date(
                      selected.fecha_fin + "T12:00:00",
                    ).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-500">Días solicitados:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {selected.dias_solicitados} días
                  </span>
                </div>
              </div>

              {/* Observación */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observación{" "}
                  {!selected.accion && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  rows={4}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  placeholder={
                    !selected.accion
                      ? "Indique el motivo del rechazo..."
                      : "Observación opcional (se notificará al servidor)..."
                  }
                />
                {!selected.accion && !observacion && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    La observación es requerida al negar la solicitud
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-linear-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-6 py-5">
              <div className="flex gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleResponder}
                  disabled={
                    submitting || (!selected.accion && !observacion.trim())
                  }
                  className={`flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    selected.accion
                      ? "bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      : "bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Procesando...
                    </>
                  ) : selected.accion ? (
                    <>
                      <CheckCircle size={16} />
                      {selected.estado === "PENDIENTE_UATH"
                        ? "Certificar"
                        : "Confirmar aprobación"}
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Confirmar negación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FirmaDigitalModal
        open={modalPassword && !!vacacionFirmar}
        subtitle={vacacionFirmar?.servidor_nombre}
        infoText={
          <>
            Se firmará digitalmente la solicitud de{" "}
            <strong>{vacacionFirmar?.servidor_nombre}</strong> usando tu
            certificado .p12 del BCE Ecuador.
          </>
        }
        password={passwordToken}
        onPasswordChange={setPasswordToken}
        onClose={() => setModalPassword(false)}
        onSubmit={handleFirmar}
        submitting={firmando}
        submitLabel={
          vacacionFirmar?.estado === "PENDIENTE_UATH" ? "Certificar" : "Firmar"
        }
        color="blue"
      />
    </div>
  );
}
