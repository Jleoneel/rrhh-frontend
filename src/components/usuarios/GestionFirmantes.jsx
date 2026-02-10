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
  Key,
  Users,
  Filter,
  RefreshCw,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  BadgeCheck,
  UserCheck,
  UserX,
} from "lucide-react";
import api from "../../api/axios";
import Swal from "sweetalert2";
import Modal from "../ui/Modal";

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargosDisponibles, setCargosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActivo, setFilterActivo] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("crear"); // 'crear' | 'editar'
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

  const buscarServidor = async () => {
    if (!cedulaBuscada.trim()) {
      Swal.fire({
        toast: true,
        text: "Ingrese una cédula para buscar",
        icon: "warning",
        showConfirmButton: false,
        timer: 1500,
        position: "top-end",
      });
      return;
    }

    setBuscandoServidor(true);
    try {
      const { data } = await api.get(`/usuarios/buscar-servidor/${cedulaBuscada}`);
      setServidorEncontrado(data);
      
      // Autocompletar formulario con datos del servidor
      setForm(prev => ({
        ...prev,
        cedula: data.cedula,
        nombres: data.nombres,
        email: data.email || "",
      }));

      Swal.fire({
        toast: true,
        text: "Servidor encontrado",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        position: "top-end",
      });
    } catch (error) {
      setServidorEncontrado(null);
      
      // Preguntar si quiere crear manualmente
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
        // Permitir creación manual
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
    // Validaciones
    if (!form.cedula.trim() || !form.nombres.trim() || !form.email.trim()) {
      Swal.fire({
        toast: true,
        text: "Complete todos los campos requeridos",
        icon: "error",
        showConfirmButton: false,
        timer: 1500,
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
        timer: 1500,
        position: "top-end",
      });
      return;
    }

    try {
      if (modalMode === "crear") {
        await api.post("/usuarios", form);
        Swal.fire({
          toast: true,
          text: "Usuario creado exitosamente",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          position: "top-end",
        });
      } else {
        await api.put(`/usuarios/${usuarioEditando.id}`, form);
        Swal.fire({
          toast: true,
          text: "Usuario actualizado exitosamente",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
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
        await api.put(`/usuarios/${usuario.id}`, {
          ...form,
          activo: !usuario.activo,
        });
        
        cargarUsuarios();
        
        Swal.fire({
          toast: true,
          text: `Usuario ${!usuario.activo ? "activado" : "desactivado"} exitosamente`,
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
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
          <p class="text-red-600 font-semibold">Esta acción no se puede deshacer</p>
          <div class="mt-4 p-3 bg-red-50 rounded-lg">
            <p class="text-sm text-red-700">Usuario: <strong>${usuario.nombres}</strong></p>
            <p class="text-sm text-red-700">Cédula: <strong>${usuario.cedula}</strong></p>
          </div>
          <p class="text-gray-600 mt-3">El usuario será desactivado y no podrá acceder al sistema.</p>
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
          text: "Usuario eliminado exitosamente",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-2">
              Administra los usuarios con acceso al sistema de acciones de personal
            </p>
          </div>
          <button
            onClick={abrirModalCrear}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <UserPlus className="h-5 w-5" />
            Nuevo Usuario
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cédula, nombre o email..."
              className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterActivo}
              onChange={(e) => setFilterActivo(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos los usuarios</option>
              <option value="activos">Solo activos</option>
              <option value="inactivos">Solo inactivos</option>
            </select>

            <button
              onClick={cargarUsuarios}
              className="px-4 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No hay usuarios
            </h3>
            <p className="text-gray-500 mb-6">
              {search || filterActivo !== "todos" 
                ? "No se encontraron usuarios con los filtros aplicados" 
                : "Comienza creando un nuevo usuario"}
            </p>
            {!search && filterActivo === "todos" && (
              <button
                onClick={abrirModalCrear}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all inline-flex items-center gap-2"
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
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Usuario</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Cargos/Roles</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{usuario.nombres}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-gray-600">{usuario.cedula}</p>
                            <span className="text-gray-400">•</span>
                            <p className="text-sm text-gray-600 truncate max-w-xs">{usuario.email}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-2">
                        {usuario.cargos.map((cargo) => (
                          <span
                            key={cargo.id}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            <Shield className="h-3 w-3" />
                            {cargo.nombre}
                          </span>
                        ))}
                        {usuario.cargos.length === 0 && (
                          <span className="text-gray-400 text-sm">Sin cargos asignados</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {usuario.activo ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              Activo
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-500" />
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                              Inactivo
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      <div>
                        <p>Creado: {new Date(usuario.created_at).toLocaleDateString('es-ES')}</p>
                        {usuario.updated_at && (
                          <p className="text-gray-500">Actualizado: {new Date(usuario.updated_at).toLocaleDateString('es-ES')}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => abrirModalEditar(usuario)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleActivo(usuario)}
                          className={`p-2 rounded-lg transition-colors ${
                            usuario.activo
                              ? "text-yellow-600 hover:bg-yellow-50"
                              : "text-green-600 hover:bg-green-50"
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
                          onClick={() => eliminarUsuario(usuario)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para crear/editar usuario */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            {modalMode === "crear" ? (
              <>
                <UserPlus className="h-6 w-6 text-blue-600" />
                Nuevo Usuario
              </>
            ) : (
              <>
                <Edit className="h-6 w-6 text-blue-600" />
                Editar Usuario
              </>
            )}
          </h2>
          <p className="text-gray-600 mb-6">
            {modalMode === "crear" 
              ? "Registra un nuevo usuario en el sistema" 
              : "Modifica los datos del usuario"}
          </p>

          <div className="space-y-6">
            {/* Buscar servidor (solo en creación) */}
            {modalMode === "crear" && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Buscar servidor existente</h3>
                    <p className="text-blue-600 text-sm">
                      Busca por cédula para autocompletar los datos
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={cedulaBuscada}
                      onChange={(e) => setCedulaBuscada(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="Ingrese cédula (solo números)"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={buscarServidor}
                    disabled={buscandoServidor || !cedulaBuscada.trim()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {buscandoServidor ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Buscar
                  </button>
                </div>
                
                {servidorEncontrado && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BadgeCheck className="h-4 w-4 text-green-600" />
                      <p className="font-medium text-green-800">Servidor encontrado</p>
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><span className="font-medium">Nombre:</span> {servidorEncontrado.nombres}</p>
                      <p><span className="font-medium">Unidad:</span> {servidorEncontrado.unidad_organica}</p>
                      <p><span className="font-medium">Puesto:</span> {servidorEncontrado.denominacion_puesto}</p>
                    </div>
                  </div>
                )}

                {servidorEncontrado === null && cedulaBuscada && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <p className="text-yellow-700">
                        Servidor no encontrado. Complete los datos manualmente.
                      </p>
                    </div>
                    {form.crearComoServidor && (
                      <div className="mt-2 text-sm text-yellow-600">
                        <p>⚠️ Se creará también como servidor en el sistema.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cédula <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.cedula}
                  onChange={(e) => setForm(prev => ({ ...prev, cedula: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234567890"
                  disabled={modalMode === "editar"}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombres completos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nombres}
                  onChange={(e) => setForm(prev => ({ ...prev, nombres: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Juan Pérez González"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="juan.perez@institucion.gob.ec"
                />
              </div>
            </div>

            {/* Cargos/Roles */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Cargos/Roles asignados <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cargosDisponibles.map((cargo) => (
                  <div
                    key={cargo.id}
                    onClick={() => toggleCargo(cargo.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      form.cargos.includes(cargo.id)
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        form.cargos.includes(cargo.id)
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}>
                        <Shield className={`h-4 w-4 ${
                          form.cargos.includes(cargo.id)
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${
                            form.cargos.includes(cargo.id)
                              ? "text-blue-800"
                              : "text-gray-800"
                          }`}>
                            {cargo.nombre}
                          </p>
                          {form.cargos.includes(cargo.id) && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{cargo.descripcion}</p>
                        <p className="text-xs text-gray-500 mt-2">Código: {cargo.codigo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estado (solo en edición) */}
            {modalMode === "editar" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, activo: true }))}
                    className={`flex-1 py-3 rounded-lg border transition-colors ${
                      form.activo
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Activo
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, activo: false }))}
                    className={`flex-1 py-3 rounded-lg border transition-colors ${
                      !form.activo
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Inactivo
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer del modal */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center gap-2"
            >
              {modalMode === "crear" ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Crear Usuario
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
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