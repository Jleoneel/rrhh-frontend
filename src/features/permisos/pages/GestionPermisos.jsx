import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Clock,
  Shield,
  Search,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Edit,
  ChevronDown,
  UserCheck,
  Settings,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../shared/api/axios";
import {
  getUsuariosServidor,
  crearUsuarioServidor,
  toggleUsuarioServidor,
  getSaldos,
  crearSaldo,
  getJefes,
  crearJefeFirmante,
} from "../hooks/permisos.uath.service";

const TABS = [
  { id: "usuarios", label: "Usuarios Servidor", icon: Users },
  { id: "saldos", label: "Saldos", icon: Clock },
  { id: "jefes", label: "Jefes de Área", icon: Shield },
];

export default function GestionPermisos() {
  const [tab, setTab] = useState("usuarios");
  const [loading, setLoading] = useState(true);

  // Datos
  const [servidores, setServidores] = useState([]);
  const [saldos, setSaldos] = useState([]);
  const [jefes, setJefes] = useState([]);
  const [unidades, setUnidades] = useState([]);

  // Filtros
  const [search, setSearch] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("todos");

  // Modales
  const [modalSaldo, setModalSaldo] = useState(false);
  const [modalJefe, setModalJefe] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [servidorSeleccionado, setServidorSeleccionado] = useState(null);

  const [formJefeFirmante, setFormJefeFirmante] = useState({
    cedula: "",
    nombre: "",
    password: "",
    unidad_organica_id: "",
  });

  const handleCrearJefeFirmante = async () => {
    if (
      !formJefeFirmante.cedula ||
      !formJefeFirmante.nombre ||
      !formJefeFirmante.password ||
      !formJefeFirmante.unidad_organica_id
    ) {
      Swal.fire({
        toast: true,
        icon: "warning",
        text: "Completa todos los campos",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      return;
    }
    try {
      await crearJefeFirmante(formJefeFirmante);
      Swal.fire({
        toast: true,
        icon: "success",
        text: "Jefe de área creado correctamente",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      setModalJefe(false);
      setFormJefeFirmante({
        cedula: "",
        nombre: "",
        password: "",
        unidad_organica_id: "",
      });
      cargarDatos();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Error creando jefe",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Forms
  const [formSaldo, setFormSaldo] = useState({
    servidor_id: "",
    horas_totales: 120,
    descripcion: "",
  });
  const [formPassword, setFormPassword] = useState("");

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [srv, sal, jef, uni] = await Promise.all([
        getUsuariosServidor(),
        getSaldos(),
        getJefes(),
        api.get("/catalogos/unidades-organicas").then((r) => r.data),
      ]);
      setServidores(srv);
      setSaldos(sal);
      setJefes(jef);
      setUnidades(uni);
    } catch (err) {
      console.error("Error cargando datos:", err);
      Swal.fire({
        toast: true,
        icon: "error",
        text: "Error cargando datos: " + err.message,
        timer: 3000,
        showConfirmButton: false,
        position: "top-end",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrado de servidores
  const servidoresFiltrados = useMemo(() => {
    return servidores.filter((s) => {
      const texto = `${s.nombres} ${s.cedula}`.toLowerCase();
      const matchSearch = texto.includes(search.toLowerCase());
      const matchFiltro =
        filtroUsuario === "todos" ||
        (filtroUsuario === "con_usuario" && s.usuario_id) ||
        (filtroUsuario === "sin_usuario" && !s.usuario_id);
      return matchSearch && matchFiltro;
    });
  }, [servidores, search, filtroUsuario]);

  // Stats
  const stats = useMemo(
    () => ({
      total: servidores.length,
      conUsuario: servidores.filter((s) => s.usuario_id).length,
      sinUsuario: servidores.filter((s) => !s.usuario_id).length,
      conSaldo: saldos.length,
    }),
    [servidores, saldos],
  );

  const handleCrearUsuario = async () => {
    if (!formPassword || formPassword.length < 6) {
      Swal.fire({
        toast: true,
        icon: "warning",
        text: "La contraseña debe tener al menos 6 caracteres",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      return;
    }
    try {
      await crearUsuarioServidor({
        servidor_id: servidorSeleccionado.servidor_id,
        password: formPassword,
      });
      Swal.fire({
        toast: true,
        icon: "success",
        text: "Usuario creado correctamente",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      setModalUsuario(false);
      setFormPassword("");
      cargarDatos();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Error creando usuario",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleToggleUsuario = async (servidor) => {
    const confirm = await Swal.fire({
      title: servidor.activo ? "¿Desactivar usuario?" : "¿Activar usuario?",
      text: `${servidor.nombres}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: servidor.activo ? "Desactivar" : "Activar",
      confirmButtonColor: servidor.activo ? "#ef4444" : "#10b981",
      cancelButtonColor: "#6b7280",
    });
    if (!confirm.isConfirmed) return;
    try {
      await toggleUsuarioServidor(servidor.usuario_id, !servidor.activo);
      Swal.fire({
        toast: true,
        icon: "success",
        text: "Estado actualizado",
        timer: 1500,
        showConfirmButton: false,
        position: "top-end",
      });
      cargarDatos();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleCrearSaldo = async () => {
    if (!formSaldo.servidor_id || !formSaldo.horas_totales) {
      Swal.fire({
        toast: true,
        icon: "warning",
        text: "Completa todos los campos",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      return;
    }
    try {
      await crearSaldo(formSaldo);
      Swal.fire({
        toast: true,
        icon: "success",
        text: "Saldo asignado correctamente",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      setModalSaldo(false);
      setFormSaldo({ servidor_id: "", horas_totales: 120, descripcion: "" });
      cargarDatos();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Error asignando saldo",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Permisos
            </h1>
            <p className="text-gray-500 mt-1">
              Administración de usuarios, saldos y jefes de área
            </p>
          </div>
          <button
            onClick={cargarDatos}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Servidores", value: stats.total, color: "blue" },
            { label: "Con Usuario", value: stats.conUsuario, color: "green" },
            { label: "Sin Usuario", value: stats.sinUsuario, color: "yellow" },
            { label: "Con Saldo", value: stats.conSaldo, color: "purple" },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5"
            >
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 text-${s.color}-600`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                    tab === t.id
                      ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="p-6">
              {/* TAB: USUARIOS */}
              {tab === "usuarios" && (
                <div>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o cédula..."
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <select
                        value={filtroUsuario}
                        onChange={(e) => setFiltroUsuario(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 min-w-[160px]"
                      >
                        <option value="todos">Todos</option>
                        <option value="con_usuario">Con usuario</option>
                        <option value="sin_usuario">Sin usuario</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {[
                            "Servidor",
                            "Cédula",
                            "Unidad",
                            "Usuario",
                            "Estado",
                            "Acciones",
                          ].map((h) => (
                            <th
                              key={h}
                              className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {servidoresFiltrados.map((s) => (
                          <tr
                            key={s.servidor_id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {s.nombres}
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-gray-600">
                              {s.cedula}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {s.unidad_organica || "—"}
                            </td>
                            <td className="px-4 py-3">
                              {s.usuario_id ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  <CheckCircle size={12} /> Creado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                  <XCircle size={12} /> Sin usuario
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {s.usuario_id &&
                                (s.activo ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    Activo
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                    Inactivo
                                  </span>
                                ))}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {!s.usuario_id ? (
                                  <button
                                    onClick={() => {
                                      setServidorSeleccionado(s);
                                      setModalUsuario(true);
                                    }}
                                    className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Crear usuario"
                                  >
                                    <Plus size={15} />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleUsuario(s)}
                                    className={`p-1.5 rounded-lg transition-colors ${s.activo ? "bg-orange-50 text-orange-600 hover:bg-orange-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                                    title={s.activo ? "Desactivar" : "Activar"}
                                  >
                                    {s.activo ? (
                                      <EyeOff size={15} />
                                    ) : (
                                      <Eye size={15} />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: SALDOS */}
              {tab === "saldos" && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setModalSaldo(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md"
                    >
                      <Plus size={16} /> Asignar saldo
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {[
                            "Servidor",
                            "Cédula",
                            "Unidad",
                            "Total",
                            "Usadas",
                            "Disponibles",
                            "Año",
                          ].map((h) => (
                            <th
                              key={h}
                              className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {saldos.map((s) => (
                          <tr
                            key={s.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {s.nombres}
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-gray-600">
                              {s.cedula}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {s.unidad_organica || "—"}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {s.horas_totales}h
                            </td>
                            <td className="px-4 py-3 text-orange-600 font-medium">
                              {s.horas_usadas}h
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`font-bold ${s.horas_disponibles <= 0 ? "text-red-600" : "text-green-600"}`}
                              >
                                {s.horas_disponibles}h
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {s.anio}
                            </td>
                          </tr>
                        ))}
                        {saldos.length === 0 && (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-12 text-center text-gray-400"
                            >
                              No hay saldos asignados aún
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB: JEFES */}
              {tab === "jefes" && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setModalJefe(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md"
                    >
                      <Plus size={16} /> Asignar jefe
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jefes.map((j) => (
                      <div
                        key={j.id}
                        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <UserCheck className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {j.jefe_nombre}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {j.cargo_jefe}
                            </p>
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500">Unidad:</p>
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {j.unidad_organica}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${j.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {j.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>
                    ))}
                    {jefes.length === 0 && (
                      <div className="col-span-3 py-12 text-center text-gray-400">
                        No hay jefes asignados aún
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal crear usuario */}
      {modalUsuario && servidorSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalUsuario(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Crear Usuario
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {servidorSeleccionado.nombres}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña inicial
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Recomendado: usar la cédula como contraseña inicial
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalUsuario(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearUsuario}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal asignar saldo */}
      {modalSaldo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalSaldo(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Asignar Saldo
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Servidor
                </label>
                <select
                  value={formSaldo.servidor_id}
                  onChange={(e) =>
                    setFormSaldo((p) => ({ ...p, servidor_id: e.target.value }))
                  }
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccione...</option>
                  {servidores.map((s) => (
                    <option key={s.servidor_id} value={s.servidor_id}>
                      {s.nombres} — {s.cedula}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Horas totales
                </label>
                <input
                  type="number"
                  value={formSaldo.horas_totales}
                  onChange={(e) =>
                    setFormSaldo((p) => ({
                      ...p,
                      horas_totales: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={1}
                />
                <p className="text-xs text-gray-400 mt-1">
                  15 días × 8 horas = 120 horas
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={formSaldo.descripcion}
                  onChange={(e) =>
                    setFormSaldo((p) => ({ ...p, descripcion: e.target.value }))
                  }
                  placeholder="Ej: Saldo inicial 2026"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalSaldo(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearSaldo}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal asignar jefe */}
      {modalJefe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalJefe(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Crear Jefe de Área
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Unidad Orgánica
                </label>
                <select
                  value={formJefeFirmante.unidad_organica_id}
                  onChange={(e) =>
                    setFormJefeFirmante((p) => ({
                      ...p,
                      unidad_organica_id: e.target.value,
                    }))
                  }
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccione unidad...</option>
                  {unidades.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cédula
                </label>
                <input
                  type="text"
                  value={formJefeFirmante.cedula}
                  onChange={(e) =>
                    setFormJefeFirmante((p) => ({
                      ...p,
                      cedula: e.target.value.replace(/\D/g, "").slice(0, 10),
                    }))
                  }
                  placeholder="1234567890"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formJefeFirmante.nombre}
                  onChange={(e) =>
                    setFormJefeFirmante((p) => ({
                      ...p,
                      nombre: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="NOMBRES APELLIDOS"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña inicial
                </label>
                <input
                  type="password"
                  value={formJefeFirmante.password}
                  onChange={(e) =>
                    setFormJefeFirmante((p) => ({
                      ...p,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalJefe(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearJefeFirmante}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
              >
                Crear Jefe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
