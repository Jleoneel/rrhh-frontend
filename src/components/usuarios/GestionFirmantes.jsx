import { useEffect, useState } from "react";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Mail,
  Users,
  RefreshCw,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  BadgeCheck,
  UserCheck,
  X,
  Check,
} from "lucide-react";
import api from "../../api/axios";
import Swal from "sweetalert2";
import Modal from "../ui/Modal";

// Componente Badge reutilizable
const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Componente Card de usuario
const UserCard = ({ usuario, onEdit, onToggleActive, onDelete }) => {
  return (
    <tr className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`p-2.5 rounded-xl transition-all duration-200 ${
              usuario.activo 
                ? "bg-gradient-to-br from-blue-100 to-blue-50 group-hover:shadow-md" 
                : "bg-gray-100"
            }`}>
              <UserCheck className={`h-5 w-5 ${usuario.activo ? "text-blue-600" : "text-gray-400"}`} />
            </div>
            {usuario.activo && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{usuario.nombres}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-600 font-mono">{usuario.cedula}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600 truncate max-w-xs">{usuario.email}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex flex-wrap gap-2">
          {usuario.cargos.map((cargo) => (
            <Badge key={cargo.id} variant="info">
              <Shield className="h-3.5 w-3.5" />
              {cargo.nombre}
            </Badge>
          ))}
          {usuario.cargos.length === 0 && (
            <span className="text-gray-400 text-sm italic">Sin cargos asignados</span>
          )}
        </div>
      </td>
      <td className="py-4 px-6">
        {usuario.activo ? (
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
      <td className="py-4 px-6 text-gray-600 text-sm">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5">
            <span className="text-gray-400">Creado:</span>
            <span className="font-medium">{new Date(usuario.created_at).toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}</span>
          </p>
          {usuario.updated_at && usuario.updated_at !== usuario.created_at && (
            <p className="flex items-center gap-1.5 text-gray-500">
              <span className="text-gray-400">Actualizado:</span>
              <span>{new Date(usuario.updated_at).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </p>
          )}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:scale-110"
            title="Editar usuario"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleActive}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
              usuario.activo
                ? "text-orange-600 hover:bg-orange-100"
                : "text-green-600 hover:bg-green-100"
            }`}
            title={usuario.activo ? "Desactivar usuario" : "Activar usuario"}
          >
            {usuario.activo ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-110"
            title="Eliminar usuario"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargosDisponibles, setCargosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActivo, setFilterActivo] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("crear");
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [cedulaBuscada, setCedulaBuscada] = useState("");
  const [buscandoServidor, setBuscandoServidor] = useState(false);
  const [servidorEncontrado, setServidorEncontrado] = useState(null);
  const [form, setForm] = useState({
    cedula: "",
    nombres: "",
    email: "",
    activo: true,
    cargos: [],
    crearComoServidor: false,
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarUsuarios();
    cargarCargos();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/usuarios");
      setUsuarios(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudieron cargar los usuarios",
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarCargos = async () => {
    try {
      const { data } = await api.get("/usuarios/cargos-disponibles");
      setCargosDisponibles(data);
    } catch (error) {
      console.error("Error cargando cargos:", error);
    }
  };

  // Validaciones mejoradas
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarCedula = (cedula) => {
    return cedula.length === 10 && /^\d+$/.test(cedula);
  };

  const buscarServidor = async () => {
    if (!cedulaBuscada.trim()) {
      Swal.fire({
        toast: true,
        text: "Ingrese una cédula para buscar",
        icon: "warning",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
      });
      return;
    }

    if (!validarCedula(cedulaBuscada)) {
      Swal.fire({
        toast: true,
        text: "La cédula debe tener 10 dígitos",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
      });
      return;
    }

    setBuscandoServidor(true);
    try {
      const { data } = await api.get(`/usuarios/buscar-servidor/${cedulaBuscada}`);
      setServidorEncontrado(data);
      
      setForm(prev => ({
        ...prev,
        cedula: data.cedula,
        nombres: data.nombres,
        email: data.email || "",
      }));

      Swal.fire({
        toast: true,
        text: "✓ Servidor encontrado",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
      });
    } catch (error) {
      setServidorEncontrado(null);
      
      const result = await Swal.fire({
        title: "Servidor no encontrado",
        text: "¿Desea crear el usuario manualmente?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, crear manualmente",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#3b82f6",
        cancelButtonColor: "#6b7280",
      });

      if (result.isConfirmed) {
        setForm(prev => ({
          ...prev,
          cedula: cedulaBuscada,
          nombres: "",
          email: "",
          crearComoServidor: true,
        }));
      }
    } finally {
      setBuscandoServidor(false);
    }
  };

  const abrirModalCrear = () => {
    setModalMode("crear");
    setForm({
      cedula: "",
      nombres: "",
      email: "",
      activo: true,
      cargos: [],
      crearComoServidor: false,
    });
    setServidorEncontrado(null);
    setCedulaBuscada("");
    setModalOpen(true);
  };

  const abrirModalEditar = (usuario) => {
    setModalMode("editar");
    setUsuarioEditando(usuario);
    setForm({
      cedula: usuario.cedula,
      nombres: usuario.nombres,
      email: usuario.email,
      activo: usuario.activo,
      cargos: usuario.cargos.map(c => c.id),
      crearComoServidor: false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    // Validaciones mejoradas
    if (!form.cedula.trim() || !form.nombres.trim() || !form.email.trim()) {
      Swal.fire({
        toast: true,
        text: "Complete todos los campos requeridos",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
      });
      return;
    }

    if (!validarEmail(form.email)) {
      Swal.fire({
        toast: true,
        text: "Ingrese un email válido",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
      });
      return;
    }

    if (!validarCedula(form.cedula) && modalMode === "crear") {
      Swal.fire({
        toast: true,
        text: "La cédula debe tener 10 dígitos numéricos",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
      });
      return;
    }

    if (form.cargos.length === 0) {
      Swal.fire({
        toast: true,
        text: "Seleccione al menos un cargo/rol",
        icon: "warning",
        showConfirmButton: false,
        timer: 2000,
        position: "top-end",
      });
      return;
    }

    try {
      if (modalMode === "crear") {
        await api.post("/usuarios", form);
        Swal.fire({
          toast: true,
          text: "✓ Usuario creado exitosamente",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          position: "top-end",
        });
      } else {
        await api.put(`/usuarios/${usuarioEditando.id}`, form);
        Swal.fire({
          toast: true,
          text: "✓ Usuario actualizado exitosamente",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          position: "top-end",
        });
      }

      cargarUsuarios();
      setModalOpen(false);
    } catch (error) {
      const message = error.response?.data?.message || "Error guardando usuario";
      Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const toggleActivo = async (usuario) => {
    const confirm = await Swal.fire({
      title: usuario.activo ? "¿Desactivar usuario?" : "¿Activar usuario?",
      text: usuario.activo 
        ? "El usuario no podrá acceder al sistema"
        : "El usuario podrá acceder al sistema nuevamente",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: usuario.activo ? "Sí, desactivar" : "Sí, activar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: usuario.activo ? "#ef4444" : "#10b981",
      cancelButtonColor: "#6b7280",
    });

    if (confirm.isConfirmed) {
      try {
        // FIX: Usar los datos del usuario actual, no el form global
        await api.put(`/usuarios/${usuario.id}`, {
          cedula: usuario.cedula,
          nombres: usuario.nombres,
          email: usuario.email,
          cargos: usuario.cargos.map(c => c.id),
          activo: !usuario.activo,
        });
        
        cargarUsuarios();
        
        Swal.fire({
          toast: true,
          text: `✓ Usuario ${!usuario.activo ? "activado" : "desactivado"}`,
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          position: "top-end",
        });
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "No se pudo cambiar el estado del usuario",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  const eliminarUsuario = async (usuario) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar usuario?",
      html: `
        <div class="text-left">
          <p class="text-red-600 font-semibold mb-4">⚠️ Esta acción no se puede deshacer</p>
          <div class="p-4 bg-red-50 rounded-lg border border-red-200">
            <p class="text-sm text-red-700 mb-2"><strong>Usuario:</strong> ${usuario.nombres}</p>
            <p class="text-sm text-red-700"><strong>Cédula:</strong> ${usuario.cedula}</p>
          </div>
          <p class="text-gray-600 mt-4 text-sm">El usuario será eliminado permanentemente del sistema.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/usuarios/${usuario.id}`);
        
        cargarUsuarios();
        
        Swal.fire({
          toast: true,
          text: "✓ Usuario eliminado exitosamente",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          position: "top-end",
        });
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: "No se pudo eliminar el usuario",
          icon: "error",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchesSearch = 
      usuario.cedula.includes(search) ||
      usuario.nombres.toLowerCase().includes(search.toLowerCase()) ||
      usuario.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filterActivo === "todos" ||
      (filterActivo === "activos" && usuario.activo) ||
      (filterActivo === "inactivos" && !usuario.activo);
    
    return matchesSearch && matchesFilter;
  });

  const toggleCargo = (cargoId) => {
    setForm(prev => ({
      ...prev,
      cargos: prev.cargos.includes(cargoId)
        ? prev.cargos.filter(id => id !== cargoId)
        : [...prev.cargos, cargoId]
    }));
  };

  // Estadísticas rápidas
  const stats = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.activo).length,
    inactivos: usuarios.filter(u => !u.activo).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600 text-lg">
                Administra los usuarios con acceso al sistema de acciones de personal
              </p>
            </div>
            <button
              onClick={abrirModalCrear}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 hover:scale-105"
            >
              <UserPlus className="h-5 w-5" />
              Nuevo Usuario
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Usuarios</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Activos</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.activos}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Inactivos</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{stats.inactivos}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por cédula, nombre o email..."
                className="w-full bg-white border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={filterActivo}
                onChange={(e) => setFilterActivo(e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all min-w-[180px]"
              >
                <option value="todos">Todos los usuarios</option>
                <option value="activos">Solo activos</option>
                <option value="inactivos">Solo inactivos</option>
              </select>

              <button
                onClick={cargarUsuarios}
                className="px-4 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all shadow-sm flex items-center gap-2 hover:shadow-md"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Cargando usuarios...</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="p-16 text-center">
              <div className="inline-flex p-6 bg-gray-100 rounded-full mb-4">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay usuarios
              </h3>
              <p className="text-gray-500 mb-8">
                {search || filterActivo !== "todos" 
                  ? "No se encontraron usuarios con los filtros aplicados" 
                  : "Comienza creando un nuevo usuario"}
              </p>
              {!search && filterActivo === "todos" && (
                <button
                  onClick={abrirModalCrear}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <UserPlus className="h-5 w-5" />
                  Crear primer usuario
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Cargos/Roles
                    </th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {usuariosFiltrados.map((usuario) => (
                    <UserCard
                      key={usuario.id}
                      usuario={usuario}
                      onEdit={() => abrirModalEditar(usuario)}
                      onToggleActive={() => toggleActivo(usuario)}
                      onDelete={() => eliminarUsuario(usuario)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar usuario */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {modalMode === "crear" ? (
                  <>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserPlus className="h-6 w-6 text-blue-600" />
                    </div>
                    Nuevo Usuario
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Edit className="h-6 w-6 text-blue-600" />
                    </div>
                    Editar Usuario
                  </>
                )}
              </h2>
              <p className="text-gray-600 mt-1">
                {modalMode === "crear" 
                  ? "Registra un nuevo usuario en el sistema" 
                  : "Modifica los datos del usuario"}
              </p>
            </div>
            <button
              onClick={() => setModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Buscar servidor (solo en creación) */}
            {modalMode === "crear" && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Search className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">Buscar servidor existente</h3>
                    <p className="text-blue-700 text-sm">
                      Busca por cédula para autocompletar los datos
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cedulaBuscada}
                    onChange={(e) => setCedulaBuscada(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Ingrese cédula (10 dígitos)"
                    className="flex-1 border-2 border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    maxLength={10}
                  />
                  <button
                    onClick={buscarServidor}
                    disabled={buscandoServidor || !cedulaBuscada.trim()}
                    className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:hover:shadow-md"
                  >
                    {buscandoServidor ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                    Buscar
                  </button>
                </div>
                
                {servidorEncontrado && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-2 mb-3">
                      <BadgeCheck className="h-5 w-5 text-green-600" />
                      <p className="font-semibold text-green-800">✓ Servidor encontrado</p>
                    </div>
                    <div className="text-sm text-green-700 space-y-2 pl-7">
                      <p><span className="font-medium">Nombre:</span> {servidorEncontrado.nombres}</p>
                      <p><span className="font-medium">Unidad:</span> {servidorEncontrado.unidad_organica}</p>
                      <p><span className="font-medium">Puesto:</span> {servidorEncontrado.denominacion_puesto}</p>
                    </div>
                  </div>
                )}

                {servidorEncontrado === null && cedulaBuscada && (
                  <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <p className="text-yellow-800 font-medium">
                        Servidor no encontrado. Complete los datos manualmente.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Cédula <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.cedula}
                  onChange={(e) => setForm(prev => ({ 
                    ...prev, 
                    cedula: e.target.value.replace(/\D/g, "").slice(0, 10)
                  }))}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono transition-all"
                  placeholder="1234567890"
                  disabled={modalMode === "editar"}
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Nombres completos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nombres}
                  onChange={(e) => setForm(prev => ({ ...prev, nombres: e.target.value }))}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Juan Pérez González"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border-2 border-gray-300 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="juan.perez@institucion.gob.ec"
                  />
                </div>
              </div>
            </div>

            {/* Cargos/Roles */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Cargos/Roles asignados <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                {cargosDisponibles.map((cargo) => {
                  const isSelected = form.cargos.includes(cargo.id);
                  return (
                    <div
                      key={cargo.id}
                      onClick={() => toggleCargo(cargo.id)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-blue-400 bg-blue-50 shadow-md scale-[1.02]"
                          : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${
                          isSelected ? "bg-blue-100" : "bg-gray-100"
                        }`}>
                          <Shield className={`h-5 w-5 ${
                            isSelected ? "text-blue-600" : "text-gray-400"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`font-semibold truncate ${
                              isSelected ? "text-blue-900" : "text-gray-800"
                            }`}>
                              {cargo.nombre}
                            </p>
                            {isSelected && (
                              <div className="flex-shrink-0">
                                <Check className="h-5 w-5 text-green-600" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{cargo.descripcion}</p>
                          <p className="text-xs text-gray-500 mt-2 font-mono">Código: {cargo.codigo}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estado (solo en edición) */}
            {modalMode === "editar" && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Estado del usuario</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, activo: true }))}
                    className={`py-4 rounded-xl border-2 transition-all duration-200 ${
                      form.activo
                        ? "border-green-500 bg-green-50 text-green-700 shadow-lg scale-105"
                        : "border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-6 w-6" />
                      <span className="font-semibold">Activo</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, activo: false }))}
                    className={`py-4 rounded-xl border-2 transition-all duration-200 ${
                      !form.activo
                        ? "border-red-500 bg-red-50 text-red-700 shadow-lg scale-105"
                        : "border-gray-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <XCircle className="h-6 w-6" />
                      <span className="font-semibold">Inactivo</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer del modal */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t-2 border-gray-200">
            <button
              onClick={() => setModalOpen(false)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-all font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium hover:scale-105"
            >
              {modalMode === "crear" ? (
                <>
                  <UserPlus className="h-5 w-5" />
                  Crear Usuario
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