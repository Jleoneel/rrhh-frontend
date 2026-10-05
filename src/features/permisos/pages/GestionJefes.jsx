import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Search,
  Shield,
  RefreshCw,
  Loader2,
  Edit,
  CheckCircle,
  ChevronDown,
  Users,
  Building2,
  UserCheck,
  X,
  AlertCircle,
  TrendingUp,
  Plus,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../shared/api/axios";
import StatCard from "../../../shared/components/ui/StatCard";
import SelectPremium from "../../../shared/components/Layout/SelectPremiun";
import {
  crearUnidadOrganica,
  asignarServidorAUnidad,
  getPosiblesDuplicados,
  descartarDuplicado,
} from "../hooks/permisos.uath.service";

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 border border-gray-200",
    success: "bg-green-100 text-green-800 border border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default function GestionJefes() {
  const { setHeaderConfig } = useOutletContext();

  useEffect(() => {
    setHeaderConfig({
      title: "Gestión de Jefes",
      showNewAction: false,
      onNewAction: null,
    });
  }, [setHeaderConfig]);

  const [unidades, setUnidades] = useState([]);
  const [firmantes, setFirmantes] = useState([]);
  const [todosServidores, setTodosServidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ jefe_id: "", jefe_superior_id: "" });
  const [submitting, setSubmitting] = useState(false);

  // Crear unidad orgánica manual
  const [modalCrearUnidad, setModalCrearUnidad] = useState(false);
  const [formCrearUnidad, setFormCrearUnidad] = useState({
    nombre: "",
    unidad_padre_id: "",
    jefe_id: "",
    jefe_superior_id: "",
  });
  const [submittingCrear, setSubmittingCrear] = useState(false);

  // Asignar (trasladar) un servidor existente a una unidad
  const [modalAsignarServidor, setModalAsignarServidor] = useState(false);
  const [unidadParaAsignar, setUnidadParaAsignar] = useState(null);
  const [servidorSeleccionado, setServidorSeleccionado] = useState(null);
  const [filtroSelectServidor, setFiltroSelectServidor] = useState("");
  const [submittingAsignar, setSubmittingAsignar] = useState(false);

  // Posibles duplicados entre unidades manuales y el distributivo oficial
  const [posiblesDuplicados, setPosiblesDuplicados] = useState([]);
  const [descartandoId, setDescartandoId] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [unidadesData, firmantesData, servidoresData, duplicadosData] =
        await Promise.all([
          api.get("/permisos/jefes").then((r) => r.data),
          api.get("/permisos/firmantes-disponibles").then((r) => r.data),
          api
            .get("/permisos/usuarios-servidor?limit=1000")
            .then((r) => r.data),
          getPosiblesDuplicados(),
        ]);
      setUnidades(unidadesData);
      setFirmantes(firmantesData);
      setTodosServidores(servidoresData.data || []);
      setPosiblesDuplicados(duplicadosData);
    } catch (err) {
      console.error(err);
      Swal.fire({
        toast: true,
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los datos",
        timer: 3000,
        showConfirmButton: false,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const unidadesFiltradas = useMemo(() => {
    return unidades.filter((u) =>
      u.unidad_organica.toLowerCase().includes(search.toLowerCase()),
    );
  }, [unidades, search]);

  const stats = useMemo(() => {
    const total = unidades.length;
    const conJefe = unidades.filter((u) => u.jefe_id).length;
    const conJefeSuperior = unidades.filter((u) => u.jefe_superior_id).length;
    const completas = unidades.filter((u) => u.jefe_id && u.jefe_superior_id).length;
    return { total, conJefe, conJefeSuperior, completas };
  }, [unidades]);

  const abrirModal = (unidad) => {
    setSelected(unidad);
    setForm({
      jefe_id: unidad.jefe_id || "",
      jefe_superior_id: unidad.jefe_superior_id || "",
    });
    setModalOpen(true);
  };

  const handleGuardar = async () => {
    setSubmitting(true);
    try {
      await api.put(`/permisos/jefes/${selected.id}`, {
        jefe_id: form.jefe_id || null,
        jefe_superior_id: form.jefe_superior_id || null,
      });
      Swal.fire({
        toast: true,
        icon: "success",
        title: "¡Guardado!",
        text: "Jefes asignados correctamente",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });
      setModalOpen(false);
      cargarDatos();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Error guardando los jefes",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const abrirModalCrearUnidad = () => {
    setFormCrearUnidad({
      nombre: "",
      unidad_padre_id: "",
      jefe_id: "",
      jefe_superior_id: "",
    });
    setModalCrearUnidad(true);
  };

  const handleCrearUnidad = async () => {
    if (!formCrearUnidad.nombre.trim()) {
      Swal.fire({
        toast: true,
        icon: "warning",
        text: "El nombre de la unidad es requerido",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      return;
    }
    setSubmittingCrear(true);
    try {
      await crearUnidadOrganica({
        nombre: formCrearUnidad.nombre.trim(),
        unidad_padre_id: formCrearUnidad.unidad_padre_id || null,
        jefe_id: formCrearUnidad.jefe_id || null,
        jefe_superior_id: formCrearUnidad.jefe_superior_id || null,
      });
      Swal.fire({
        toast: true,
        icon: "success",
        title: "¡Unidad creada!",
        text: "La unidad orgánica se creó correctamente",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });
      setModalCrearUnidad(false);
      cargarDatos();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Error creando la unidad",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setSubmittingCrear(false);
    }
  };

  const abrirModalAsignarServidor = (unidad) => {
    setUnidadParaAsignar(unidad);
    setServidorSeleccionado(null);
    setFiltroSelectServidor("");
    setModalAsignarServidor(true);
  };

  const opcionesServidores = useMemo(() => {
    // Solo mostrar opciones a partir de 5 caracteres, mismo criterio que
    // en Gestión de Permisos, para no listar 748 servidores de una vez.
    if (filtroSelectServidor.length < 5) return [];
    const searchLower = filtroSelectServidor.toLowerCase();
    return todosServidores
      .filter(
        (s) =>
          s.cedula.toLowerCase().includes(searchLower) ||
          s.nombres.toLowerCase().includes(searchLower),
      )
      .map((s) => ({
        value: s.servidor_id,
        label: `${s.nombres} — ${s.cedula}${s.unidad_organica ? ` (actualmente: ${s.unidad_organica})` : ""}`,
      }));
  }, [filtroSelectServidor, todosServidores]);

  const handleAsignarServidor = async () => {
    if (!servidorSeleccionado) {
      Swal.fire({
        toast: true,
        icon: "warning",
        text: "Selecciona un servidor",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      return;
    }
    setSubmittingAsignar(true);
    try {
      await asignarServidorAUnidad(unidadParaAsignar.id, servidorSeleccionado);
      Swal.fire({
        toast: true,
        icon: "success",
        title: "¡Servidor trasladado!",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });
      setModalAsignarServidor(false);
      cargarDatos();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Error trasladando al servidor",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setSubmittingAsignar(false);
    }
  };

  const handleDescartarDuplicado = async (unidadManualId, unidadExcelId) => {
    const key = `${unidadManualId}-${unidadExcelId}`;
    setDescartandoId(key);
    try {
      await descartarDuplicado(unidadManualId, unidadExcelId);
      setPosiblesDuplicados((prev) =>
        prev.filter(
          (d) =>
            !(
              d.unidad_manual_id === unidadManualId &&
              d.unidad_excel_id === unidadExcelId
            ),
        ),
      );
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Error descartando",
        confirmButtonColor: "#ef4444",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setDescartandoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-200">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                  Gestión de Jefes por Unidad
                </h1>
                <p className="text-gray-500 mt-1">
                  Asigna el jefe inmediato y el jefe superior de cada unidad orgánica para el flujo de aprobación de permisos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={abrirModalCrearUnidad}
                className="px-5 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Plus size={18} />
                Nueva Unidad
              </button>
              <button
                onClick={cargarDatos}
                className="p-3 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-md hover:shadow-lg"
                title="Actualizar datos"
              >
                <RefreshCw size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard label="Total Unidades" value={stats.total} icon={Building2} color="blue" />
            <StatCard label="Con Jefe Inmediato" value={stats.conJefe} icon={UserCheck} color="green" />
            <StatCard label="Con Jefe Superior" value={stats.conJefeSuperior} icon={Users} color="purple" />
            <StatCard label="Completas" value={stats.completas} icon={CheckCircle} color="orange" />
          </div>
        </div>

        {/* Aviso de posibles duplicados con el distributivo oficial */}
        {posiblesDuplicados.length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">
                  {posiblesDuplicados.length} unidad
                  {posiblesDuplicados.length !== 1 ? "es" : ""} manual
                  {posiblesDuplicados.length !== 1 ? "es" : ""} podría
                  {posiblesDuplicados.length !== 1 ? "n" : ""} coincidir con
                  el distributivo oficial
                </h3>
                <p className="text-sm text-amber-700 mt-0.5">
                  Revisa si son la misma unidad. Si no lo son, descártalo
                  para dejar de verlo aquí.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {posiblesDuplicados.map((d) => {
                const key = `${d.unidad_manual_id}-${d.unidad_excel_id}`;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 bg-white border border-amber-200 rounded-xl px-4 py-3"
                  >
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">
                        {d.unidad_manual_nombre}
                      </span>{" "}
                      <span className="text-gray-400">↔</span>{" "}
                      <span className="font-semibold">
                        {d.unidad_excel_nombre}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        ({Math.round(d.similitud * 100)}% similar)
                      </span>
                    </p>
                    <button
                      onClick={() =>
                        handleDescartarDuplicado(
                          d.unidad_manual_id,
                          d.unidad_excel_id,
                        )
                      }
                      disabled={descartandoId === key}
                      className="px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-300 rounded-lg hover:bg-amber-50 transition-all disabled:opacity-50 flex-shrink-0"
                    >
                      {descartandoId === key ? "..." : "No es la misma"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Buscador */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar unidad orgánica..."
            className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
          />
        </div>

        {/* Lista de unidades */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Cargando unidades...</p>
          </div>
        ) : unidadesFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-16 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron unidades</h3>
            <p className="text-gray-500">
              {search ? "No hay unidades que coincidan con tu búsqueda" : "No hay unidades registradas en el sistema"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {unidadesFiltradas.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="font-bold text-gray-900 text-lg truncate">
                          {u.unidad_organica}
                        </p>
                        {u.origen === "MANUAL" && (
                          <Badge variant="warning">Manual</Badge>
                        )}
                      </div>
                      {u.unidad_padre_nombre && (
                        <p className="text-xs text-gray-400 ml-11 mb-2">
                          Dentro de {u.unidad_padre_nombre}
                        </p>
                      )}

                      <div className="space-y-4 mt-4">
                        {/* Jefe inmediato */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <UserCheck className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">
                              Jefe Inmediato
                            </p>
                            <p className={`text-sm font-medium mt-0.5 ${u.jefe_nombre ? "text-gray-800" : "text-red-400 italic"}`}>
                              {u.jefe_nombre || "Sin asignar"}
                            </p>
                            {u.jefe_nombre && (
                              <Badge variant="success" className="mt-1">
                                <CheckCircle size={10} /> Aprobador nivel 1
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Jefe superior */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">
                              Jefe Superior
                            </p>
                            <p className={`text-sm font-medium mt-0.5 ${u.jefe_superior_nombre ? "text-gray-800" : "text-red-400 italic"}`}>
                              {u.jefe_superior_nombre || "Sin asignar"}
                            </p>
                            {u.jefe_superior_nombre && (
                              <Badge variant="info" className="mt-1">
                                <Shield size={10} /> Aprobador nivel 2
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => abrirModal(u)}
                        className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all hover:scale-110 group-hover:shadow-md"
                        title="Editar jefes"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => abrirModalAsignarServidor(u)}
                        className="p-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all hover:scale-110 group-hover:shadow-md"
                        title="Asignar servidor a esta unidad"
                      >
                        <UserPlus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Barra de estado */}
                <div className="h-1 bg-gray-100">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      u.jefe_id && u.jefe_superior_id 
                        ? "w-full bg-linear-to-r from-green-500 to-green-600" 
                        : u.jefe_id 
                          ? "w-1/2 bg-linear-to-r from-yellow-500 to-yellow-600" 
                          : "w-0"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - MEJORADO */}
      {modalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Asignar Jefes</h2>
                    <p className="text-sm text-gray-300 truncate max-w-[250px]">
                      {selected.unidad_organica}
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
              <div className="space-y-5">
                {/* Jefe inmediato */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jefe inmediato
                  </label>
                  <div className="relative">
                    <select
                      value={form.jefe_id}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, jefe_id: e.target.value }))
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white"
                    >
                      <option value="">Sin asignar</option>
                      {firmantes.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nombre} — {f.cargo_nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <UserCheck size={12} />
                    Aprueba permisos de esta unidad
                  </p>
                </div>

                {/* Jefe superior */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jefe superior
                  </label>
                  <div className="relative">
                    <select
                      value={form.jefe_superior_id}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          jefe_superior_id: e.target.value,
                        }))
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white"
                    >
                      <option value="">Sin asignar</option>
                      {firmantes.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nombre} — {f.cargo_nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <TrendingUp size={12} />
                    Aprueba el permiso del jefe de esta unidad
                  </p>
                </div>
              </div>

              {/* Nota informativa */}
              <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    El flujo de aprobación sigue: <span className="font-semibold">Servidor → Jefe Inmediato → Jefe Superior</span>
                  </p>
                </div>
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
                  onClick={handleGuardar}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Crear unidad orgánica manual */}
      {modalCrearUnidad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalCrearUnidad(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Nueva Unidad Orgánica</h2>
                    <p className="text-sm text-gray-300">
                      Para unidades que no constan en el distributivo
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalCrearUnidad(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all hover:rotate-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la unidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCrearUnidad.nombre}
                    onChange={(e) =>
                      setFormCrearUnidad((p) => ({
                        ...p,
                        nombre: e.target.value,
                      }))
                    }
                    placeholder="Ej: Banco de Leche"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <SelectPremium
                    label="Unidad padre (opcional)"
                    placeholder="Sin unidad padre..."
                    isSearchable
                    isClearable
                    options={unidades.map((u) => ({
                      value: u.id,
                      label: u.unidad_organica,
                    }))}
                    value={
                      formCrearUnidad.unidad_padre_id
                        ? {
                            value: formCrearUnidad.unidad_padre_id,
                            label: unidades.find(
                              (u) => u.id === formCrearUnidad.unidad_padre_id,
                            )?.unidad_organica,
                          }
                        : null
                    }
                    onChange={(opt) =>
                      setFormCrearUnidad((p) => ({
                        ...p,
                        unidad_padre_id: opt?.value || "",
                      }))
                    }
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Solo para mostrar dónde encaja dentro de la estructura —
                    no afecta las aprobaciones.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jefe inmediato
                  </label>
                  <div className="relative">
                    <select
                      value={formCrearUnidad.jefe_id}
                      onChange={(e) =>
                        setFormCrearUnidad((p) => ({
                          ...p,
                          jefe_id: e.target.value,
                        }))
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white"
                    >
                      <option value="">Sin asignar</option>
                      {firmantes.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nombre} — {f.cargo_nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jefe superior
                  </label>
                  <div className="relative">
                    <select
                      value={formCrearUnidad.jefe_superior_id}
                      onChange={(e) =>
                        setFormCrearUnidad((p) => ({
                          ...p,
                          jefe_superior_id: e.target.value,
                        }))
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer bg-white"
                    >
                      <option value="">Sin asignar</option>
                      {firmantes.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nombre} — {f.cargo_nombre}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-6 py-5">
              <div className="flex gap-3">
                <button
                  onClick={() => setModalCrearUnidad(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearUnidad}
                  disabled={submittingCrear}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingCrear ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Crear Unidad
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Asignar (trasladar) servidor a una unidad */}
      {modalAsignarServidor && unidadParaAsignar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModalAsignarServidor(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Asignar Servidor</h2>
                    <p className="text-sm text-gray-300 truncate max-w-[250px]">
                      {unidadParaAsignar.unidad_organica}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalAsignarServidor(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all hover:rotate-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <SelectPremium
                label="Servidor"
                required
                placeholder="Escribe cédula o nombres (5+ caracteres)..."
                options={opcionesServidores}
                value={
                  todosServidores
                    .map((s) => ({
                      value: s.servidor_id,
                      label: `${s.nombres} — ${s.cedula}`,
                    }))
                    .find((o) => o.value === servidorSeleccionado) || null
                }
                onChange={(opt) => setServidorSeleccionado(opt?.value || null)}
                onInputChange={(val) => setFiltroSelectServidor(val || "")}
              />
              {filtroSelectServidor.length > 0 &&
                filtroSelectServidor.length < 5 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} /> Escribe al menos 5 caracteres de
                    cédula o nombres para ver resultados
                  </p>
                )}

              <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Si el servidor ya tiene una asignación activa, se cerrará
                    y quedará trasladado a esta unidad — no queda con dos
                    asignaciones a la vez.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-6 py-5">
              <div className="flex gap-3">
                <button
                  onClick={() => setModalAsignarServidor(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAsignarServidor}
                  disabled={submittingAsignar}
                  className="flex-1 px-4 py-3 bg-linear-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingAsignar ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Trasladando...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Trasladar Servidor
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
