import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  Users,
  UserCheck,
  X,
  Check,
  Shield,
  Lock,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  Filter,
  Download,
  AlertCircle,
} from "lucide-react";
import api from "../../api/axios";
import Swal from "sweetalert2";
import Modal from "../ui/Modal";

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 border border-gray-200",
    success: "bg-green-100 text-green-800 border border-green-200",
    error: "bg-red-100 text-red-800 border border-red-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200",
    warning: "bg-amber-100 text-amber-800 border border-amber-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm ${variants[variant]}`}>
      {children}
    </span>
  );
};

const StatCard = ({ label, value, icon: Icon, color = "blue", trend }) => {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-4 bg-gradient-to-br ${colors[color]} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const FirmanteRow = ({ firmante, onEdit, onToggleActive, onDisable }) => {
  return (
    <tr className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-300">
      <td className="py-5 px-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={`p-3 rounded-xl transition-all duration-300 ${
                firmante.activo 
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200" 
                  : "bg-gray-200"
              }`}
            >
              <UserCheck className={`h-5 w-5 ${firmante.activo ? "text-white" : "text-gray-500"}`} />
            </div>
            {firmante.activo && (
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-900 text-lg">{firmante.nombre}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded-lg">
                {firmante.cedula}
              </span>
              <span className="text-xs text-gray-400">ID: {firmante.id?.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </td>

      <td className="py-5 px-6">
        <Badge variant="info">
          <Shield className="h-4 w-4" />
          ASISTENTE UATH
        </Badge>
      </td>

      <td className="py-5 px-6">
        {firmante.activo ? (
          <Badge variant="success">
            <CheckCircle className="h-4 w-4" />
            Activo
          </Badge>
        ) : (
          <Badge variant="error">
            <XCircle className="h-4 w-4" />
            Inactivo
          </Badge>
        )}
      </td>

      <td className="py-5 px-6">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={onEdit}
            className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
            title="Editar firmante"
          >
            <Edit className="h-4 w-4" />
          </button>

          <button
            onClick={onToggleActive}
            className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md ${
              firmante.activo 
                ? "bg-orange-50 text-orange-600 hover:bg-orange-100" 
                : "bg-green-50 text-green-600 hover:bg-green-100"
            }`}
            title={firmante.activo ? "Desactivar" : "Activar"}
          >
            {firmante.activo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>

          <button
            onClick={onDisable}
            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
            title="Desactivar permanentemente"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function GestionFirmantesUATH() {
  const [firmantes, setFirmantes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterActivo, setFilterActivo] = useState("todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("crear");
  const [editando, setEditando] = useState(null);

  const [form, setForm] = useState({
    cedula: "",
    nombre: "",
    password: "",
    activo: true,
  });

  useEffect(() => {
    cargarFirmantes();
  }, []);

  const cargarFirmantes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/firmantes/uath");
      setFirmantes(data);
    } catch (error) {
      console.error("Error cargando firmantes:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudieron cargar los firmantes UATH",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#ffffff",
        color: "#1f2937",
      });
    } finally {
      setLoading(false);
    }
  };

  const validarCedula = (cedula) => /^\d{10}$/.test(cedula);

  const abrirCrear = () => {
    setModalMode("crear");
    setEditando(null);
    setForm({ cedula: "", nombre: "", password: "", activo: true });
    setModalOpen(true);
  };

  const abrirEditar = (f) => {
    setModalMode("editar");
    setEditando(f);
    setForm({
      cedula: f.cedula,
      nombre: f.nombre,
      password: "",
      activo: !!f.activo,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.cedula.trim() || !form.nombre.trim()) {
      Swal.fire({
        toast: true,
        text: "Complete cédula y nombre",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });
      return;
    }

    if (!validarCedula(form.cedula)) {
      Swal.fire({
        toast: true,
        text: "La cédula debe tener 10 dígitos numéricos",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });
      return;
    }

    if (modalMode === "crear" && !form.password.trim()) {
      Swal.fire({
        toast: true,
        text: "Ingrese una contraseña para el nuevo firmante",
        icon: "warning",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });
      return;
    }

    try {
      if (modalMode === "crear") {
        await api.post("/firmantes/uath", {
          cedula: form.cedula,
          nombre: form.nombre,
          password: form.password,
        });

        Swal.fire({
          toast: true,
          text: "✓ Firmante UATH creado exitosamente",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          position: "top-end",
          background: "#ffffff",
          color: "#1f2937",
        });
      } else {
        await api.put(`/firmantes/${editando.id}`, {
          nombre: form.nombre,
          activo: form.activo,
        });

        Swal.fire({
          toast: true,
          text: "✓ Firmante actualizado correctamente",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          position: "top-end",
          background: "#ffffff",
          color: "#1f2937",
        });
      }

      setModalOpen(false);
      cargarFirmantes();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Error guardando firmante",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#ffffff",
        color: "#1f2937",
      });
    }
  };

  const toggleActivo = async (f) => {
    const confirm = await Swal.fire({
      title: f.activo ? "¿Desactivar firmante?" : "¿Activar firmante?",
      text: f.activo 
        ? "No podrá iniciar sesión ni realizar acciones en el sistema." 
        : "Podrá acceder al sistema y realizar acciones nuevamente.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: f.activo ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: f.activo ? "#ef4444" : "#10b981",
      cancelButtonColor: "#6b7280",
      background: "#ffffff",
      color: "#1f2937",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.put(`/firmantes/${f.id}`, { activo: !f.activo });
      Swal.fire({
        toast: true,
        text: `✓ Firmante ${!f.activo ? "activado" : "desactivado"} correctamente`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });
      cargarFirmantes();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo cambiar el estado",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#ffffff",
        color: "#1f2937",
      });
    }
  };

  const desactivarComoEliminar = async (f) => {
    const confirm = await Swal.fire({
      title: "¿Desactivar firmante?",
      html: `
        <div class="text-left">
          <div class="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 mb-4">
            <AlertCircle class="h-6 w-6 text-amber-600 flex-shrink-0" />
            <p class="text-sm text-amber-800 font-medium">Recomendamos desactivar en lugar de eliminar para mantener la integridad de los registros históricos.</p>
          </div>
          <div class="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
            <p class="text-sm text-gray-600 mb-3"><span class="font-semibold text-gray-900">Nombre:</span> ${f.nombre}</p>
            <p class="text-sm text-gray-600"><span class="font-semibold text-gray-900">Cédula:</span> ${f.cedula}</p>
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      background: "#ffffff",
      color: "#1f2937",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.put(`/firmantes/${f.id}`, { activo: false });
      Swal.fire({
        toast: true,
        text: "✓ Firmante desactivado permanentemente",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
        background: "#ffffff",
        color: "#1f2937",
      });
      cargarFirmantes();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "No se pudo desactivar",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        background: "#ffffff",
        color: "#1f2937",
      });
    }
  };

  const firmantesFiltrados = useMemo(() => {
    return firmantes.filter((f) => {
      const text = `${f.cedula} ${f.nombre}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());

      const matchesFilter =
        filterActivo === "todos" ||
        (filterActivo === "activos" && f.activo) ||
        (filterActivo === "inactivos" && !f.activo);

      return matchesSearch && matchesFilter;
    });
  }, [firmantes, search, filterActivo]);

  const stats = useMemo(() => {
    const total = firmantes.length;
    const activos = firmantes.filter((f) => f.activo).length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [firmantes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-200">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                    Firmantes UATH
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="info">
                      <Shield className="h-4 w-4" />
                      ASISTENTES DE LA UATH
                    </Badge>
                    <span className="text-gray-300">|</span>
                    <p className="text-gray-600">
                      Gestión de cuentas con permisos especiales
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={abrirCrear}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105 font-medium"
            >
              <UserPlus className="h-5 w-5" />
              Nuevo firmante
            </button>
          </div>

          {/* Stats Cards - Mejoradas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              label="Total Firmantes" 
              value={stats.total} 
              icon={Users} 
              color="blue"
              trend="Registros históricos"
            />
            <StatCard 
              label="Activos" 
              value={stats.activos} 
              icon={UserCheck} 
              color="green"
              trend="Pueden crear acciones"
            />
            <StatCard 
              label="Inactivos" 
              value={stats.inactivos} 
              icon={EyeOff} 
              color="red"
              trend="Sin acceso al sistema"
            />
          </div>

          {/* Filtros - Más elegantes */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por cédula o nombre..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterActivo}
                  onChange={(e) => setFilterActivo(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl pl-9 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all appearance-none cursor-pointer min-w-[160px]"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activos">Activos</option>
                  <option value="inactivos">Inactivos</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={cargarFirmantes}
                className="px-5 py-3.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden md:inline">Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <div className="relative">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              </div>
              <p className="text-gray-600 font-medium text-lg">Cargando firmantes...</p>
              <p className="text-sm text-gray-400 mt-2">Por favor espere</p>
            </div>
          ) : firmantesFiltrados.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl mb-6">
                <Users className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">No hay firmantes</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {search || filterActivo !== "todos"
                  ? "No se encontraron firmantes con los filtros aplicados. Prueba con otros criterios de búsqueda."
                  : "Comienza creando el primer firmante UATH para gestionar las acciones de personal."}
              </p>
              {!search && filterActivo === "todos" && (
                <button
                  onClick={abrirCrear}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 font-medium"
                >
                  <UserPlus className="h-5 w-5" />
                  Crear primer firmante
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <tr>
                      <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Firmante
                      </th>
                      <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {firmantesFiltrados.map((f) => (
                      <FirmanteRow
                        key={f.id}
                        firmante={f}
                        onEdit={() => abrirEditar(f)}
                        onToggleActive={() => toggleActivo(f)}
                        onDisable={() => desactivarComoEliminar(f)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer de tabla */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Mostrando <span className="font-semibold text-gray-900">{firmantesFiltrados.length}</span> de{" "}
                    <span className="font-semibold text-gray-900">{firmantes.length}</span> firmantes
                  </span>
                  <div className="flex items-center gap-4">
                    <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50" disabled>
                      Anterior
                    </button>
                    <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium">1</span>
                    <button className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50" disabled>
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal - Mejorado */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 rounded-xl ${
                  modalMode === "crear" ? "bg-blue-100" : "bg-amber-100"
                }`}>
                  {modalMode === "crear" ? (
                    <UserPlus className={`h-6 w-6 ${
                      modalMode === "crear" ? "text-blue-600" : "text-amber-600"
                    }`} />
                  ) : (
                    <Edit className="h-6 w-6 text-amber-600" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {modalMode === "crear" ? "Nuevo Firmante UATH" : "Editar Firmante"}
                </h2>
              </div>
              <p className="text-gray-600 ml-16">
                Rol: <span className="font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg ml-2">ASISTENTE DE LA UATH</span>
              </p>
            </div>

            <button 
              onClick={() => setModalOpen(false)} 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Cédula <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.cedula}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        cedula: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    className={`w-full border-2 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono transition-all ${
                      modalMode === "editar" ? "bg-gray-100 border-gray-200" : "border-gray-300"
                    }`}
                    placeholder="1234567890"
                    disabled={modalMode === "editar"}
                    maxLength={10}
                  />
                  {modalMode === "editar" && (
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value.toUpperCase() }))}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="NOMBRES APELLIDOS"
                />
              </div>
            </div>

            {modalMode === "crear" && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Contraseña inicial <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full border-2 border-gray-300 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  El firmante podrá cambiar su contraseña después del primer inicio de sesión
                </p>
              </div>
            )}

            {modalMode === "editar" && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Estado de la cuenta</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, activo: true }))}
                    className={`py-5 rounded-xl border-2 transition-all duration-300 ${
                      form.activo
                        ? "border-green-500 bg-gradient-to-br from-green-50 to-green-100 text-green-700 shadow-lg scale-105"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className={`h-8 w-8 ${form.activo ? "text-green-600" : "text-gray-400"}`} />
                      <span className="font-semibold">Activo</span>
                      <span className="text-xs opacity-75">Puede iniciar sesión</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, activo: false }))}
                    className={`py-5 rounded-xl border-2 transition-all duration-300 ${
                      !form.activo
                        ? "border-red-500 bg-gradient-to-br from-red-50 to-red-100 text-red-700 shadow-lg scale-105"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <XCircle className={`h-8 w-8 ${!form.activo ? "text-red-600" : "text-gray-400"}`} />
                      <span className="font-semibold">Inactivo</span>
                      <span className="text-xs opacity-75">Acceso bloqueado</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-8 mt-8 border-t-2 border-gray-200">
            <button
              onClick={() => setModalOpen(false)}
              className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-medium hover:border-gray-400"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium hover:scale-105"
            >
              {modalMode === "crear" ? (
                <>
                  <UserPlus className="h-5 w-5" />
                  Crear Firmante
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}