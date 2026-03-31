import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Shield,
  RefreshCw,
  Loader2,
  Edit,
  CheckCircle,
  ChevronDown,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../shared/api/axios";

export default function GestionJefes() {
  const [unidades, setUnidades] = useState([]);
  const [firmantes, setFirmantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ jefe_id: "", jefe_superior_id: "" });
  const [submitting, setSubmitting] = useState(false);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [unidadesData, firmantesData] = await Promise.all([
        api.get("/permisos/jefes").then((r) => r.data),
        api.get("/permisos/firmantes-disponibles").then((r) => r.data),
      ]);
      setUnidades(unidadesData);
      setFirmantes(firmantesData);
    } catch (err) {
      console.error(err);
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
        text: "Jefes asignados correctamente",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      setModalOpen(false);
      cargarDatos();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Error guardando",
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
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Jefes por Unidad
            </h1>
            <p className="text-gray-500 mt-1">
              Asigna el jefe y jefe superior de cada unidad orgánica
            </p>
          </div>
          <button
            onClick={cargarDatos}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Buscador */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar unidad orgánica..."
            className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unidadesFiltradas.map((u) => (
              <div
                key={u.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">
                      {u.unidad_organica}
                    </p>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield
                          size={14}
                          className="text-blue-500 flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs text-gray-400">
                            Jefe inmediato
                          </p>
                          <p
                            className={`text-sm font-medium ${u.jefe_nombre ? "text-gray-800" : "text-red-400 italic"}`}
                          >
                            {u.jefe_nombre || "Sin asignar"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users
                          size={14}
                          className="text-purple-500 flex-shrink-0"
                        />
                        <div>
                          <p className="text-xs text-gray-400">Jefe superior</p>
                          <p
                            className={`text-sm font-medium ${u.jefe_superior_nombre ? "text-gray-800" : "text-gray-400 italic"}`}
                          >
                            {u.jefe_superior_nombre || "Sin asignar"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => abrirModal(u)}
                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors flex-shrink-0"
                    title="Editar jefes"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Asignar Jefes
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {selected.unidad_organica}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jefe inmediato
                  <span className="text-xs text-gray-400 ml-1">
                    (aprueba permisos de esta unidad)
                  </span>
                </label>
                <div className="relative">
                  <select
                    value={form.jefe_id}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, jefe_id: e.target.value }))
                    }
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Sin asignar</option>
                    {firmantes.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nombre} — {f.cargo_nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jefe superior
                  <span className="text-xs text-gray-400 ml-1">
                    (aprueba el permiso del jefe de esta unidad)
                  </span>
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
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Sin asignar</option>
                    {firmantes.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nombre} — {f.cargo_nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
