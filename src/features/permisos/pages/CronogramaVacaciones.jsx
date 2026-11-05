import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Umbrella,
  Search,
  Building2,
  Loader2,
  X,
  Plus,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  CalendarRange,
  AlertTriangle,
  Download,
} from "lucide-react";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../../shared/api/axios";
import StatCard from "../../../shared/components/ui/StatCard";
import PageNumbers from "../../../shared/components/ui/PageNumbers";
import {
  getCronograma,
  getBloquesServidor,
  crearBloque,
  actualizarBloque,
  eliminarBloque,
  getCronogramaParaExportar,
} from "../hooks/cronogramaVacaciones.service";

registerLocale("es", es);

const MESES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

// XLSX / Postgres hablan en "YYYY-MM-DD"; new Date("YYYY-MM-DD") lo parsea
// como UTC medianoche, que en zonas UTC-negativas (Ecuador) muestra el día
// anterior — estos helpers arman/leen la fecha en LOCAL, sin ese corrimiento.
function parseLocalDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function formatLocalDate(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CronogramaVacaciones() {
  const { setHeaderConfig } = useOutletContext();

  useEffect(() => {
    setHeaderConfig({
      title: "Cronograma de Vacaciones",
      showNewAction: false,
      onNewAction: null,
    });
  }, [setHeaderConfig]);

  // La planificación es para el año siguiente al actual (así es como lo
  // describieron: a inicio de año se arma el cronograma del año que viene),
  // pero se puede navegar a cualquier otro año desde los controles.
  const anioActual = new Date().getFullYear();
  const [anio, setAnio] = useState(anioActual + 1);
  const [unidades, setUnidades] = useState([]);
  const [unidadFiltro, setUnidadFiltro] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [topeDiasAnual, setTopeDiasAnual] = useState(30);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [resumen, setResumen] = useState({ con_vacaciones: 0, en_tope: 0 });

  // Modal de bloques de un servidor
  const [modalServidor, setModalServidor] = useState(null); // { servidor_id, nombres, cedula }
  const [bloques, setBloques] = useState([]);
  const [totalDiasModal, setTotalDiasModal] = useState(0);
  const [cargandoBloques, setCargandoBloques] = useState(false);
  const [formBloque, setFormBloque] = useState({ fecha_desde: "", fecha_hasta: "" });
  const [editandoId, setEditandoId] = useState(null);
  const [guardandoBloque, setGuardandoBloque] = useState(false);

  const cargar = async (overrides = {}) => {
    const p = { anio, unidadFiltro, search, page, limit, ...overrides };
    setLoading(true);
    try {
      const params = { anio: p.anio, page: p.page, limit: p.limit };
      if (p.unidadFiltro) params.unidad_organica_id = p.unidadFiltro;
      if (p.search) params.search = p.search;
      const res = await getCronograma(params);
      setData(res.data);
      setTopeDiasAnual(res.tope_dias_anual);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setResumen(res.resumen);
    } catch (err) {
      console.error(err);
      Swal.fire({
        toast: true,
        icon: "error",
        text: "No se pudo cargar el cronograma",
        timer: 2500,
        showConfirmButton: false,
        position: "top-end",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    cargar({ anio, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anio]);

  useEffect(() => {
    api
      .get("/catalogos/unidades-organicas")
      .then((r) => setUnidades(r.data))
      .catch(() => setUnidades([]));
  }, []);

  const handleUnidad = (e) => {
    setUnidadFiltro(e.target.value);
    setPage(1);
    cargar({ unidadFiltro: e.target.value, page: 1 });
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
    cargar({ search: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    cargar({ page: newPage });
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    cargar({ limit: newLimit, page: 1 });
  };

  // Reconstruye el formato de 12 meses del Excel original
  // ("CRONOGRAMA DE VACACIONES") a partir de los bloques normalizados —
  // así UATH/dirección siguen viendo el mismo layout de siempre, aunque
  // por debajo los datos ya no estén guardados como esas 36 columnas.
  // Si una persona tiene más de un bloque en el mismo mes (el Excel
  // original no contempla ese caso), se concatenan en la misma celda
  // en vez de perder el segundo bloque.
  const handleExportarExcel = async () => {
    let filas;
    try {
      const params = { anio };
      if (unidadFiltro) params.unidad_organica_id = unidadFiltro;
      if (search) params.search = search;
      const res = await getCronogramaParaExportar(params);
      filas = res.data;
    } catch (err) {
      console.error(err);
      Swal.fire({
        toast: true,
        icon: "error",
        text: "No se pudo generar el Excel",
        timer: 2500,
        showConfirmButton: false,
        position: "top-end",
      });
      return;
    }

    if (!filas.length) {
      Swal.fire({
        toast: true,
        icon: "warning",
        text: "No hay datos para exportar",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      return;
    }

    const aoa = [
      ["", "HOSPITAL PROVINCIAL DE PORTOVIEJO DR. VERDI CEVALLOS BALDA"],
      ["", `CRONOGRAMA DE VACACIONES – AÑO ${anio}`],
      [
        "Nro.", "APELLIDOS Y NOMBRES", "DENOMINACIÓN", "CÉDULA",
        ...MESES.flatMap((m) => [m, "", ""]),
        "TOTAL DÍAS",
      ],
      [
        "", "", "", "",
        ...MESES.flatMap(() => ["DESDE", "HASTA", "TOTAL DIAS"]),
        "",
      ],
    ];

    filas.forEach((f, idx) => {
      const porMes = Array.from({ length: 12 }, () => null);
      f.bloques.forEach((b) => {
        const mes = new Date(b.fecha_desde).getMonth();
        if (!porMes[mes]) {
          porMes[mes] = { desde: b.fecha_desde, hasta: b.fecha_hasta, dias: b.dias };
        } else {
          porMes[mes] = {
            desde: `${porMes[mes].desde}; ${b.fecha_desde}`,
            hasta: `${porMes[mes].hasta}; ${b.fecha_hasta}`,
            dias: porMes[mes].dias + b.dias,
          };
        }
      });
      const totalAnio = f.bloques.reduce((acc, b) => acc + b.dias, 0);

      aoa.push([
        idx + 1,
        f.nombres,
        f.denominacion || "",
        f.cedula,
        ...porMes.flatMap((m) => (m ? [m.desde, m.hasta, m.dias] : ["", "", ""])),
        totalAnio,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!merges"] = [
      { s: { c: 1, r: 0 }, e: { c: 40, r: 0 } },
      { s: { c: 1, r: 1 }, e: { c: 40, r: 1 } },
      { s: { c: 0, r: 2 }, e: { c: 0, r: 3 } },
      { s: { c: 1, r: 2 }, e: { c: 1, r: 3 } },
      { s: { c: 2, r: 2 }, e: { c: 2, r: 3 } },
      { s: { c: 3, r: 2 }, e: { c: 3, r: 3 } },
      ...MESES.map((_, i) => ({
        s: { c: 4 + i * 3, r: 2 },
        e: { c: 6 + i * 3, r: 2 },
      })),
      { s: { c: 40, r: 2 }, e: { c: 40, r: 3 } },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CRONOGRAMA");
    XLSX.writeFile(wb, `cronograma_vacaciones_${anio}.xlsx`);
  };

  // --- Modal de bloques ---
  const abrirModalServidor = async (servidor) => {
    setModalServidor(servidor);
    setFormBloque({ fecha_desde: "", fecha_hasta: "" });
    setEditandoId(null);
    setCargandoBloques(true);
    try {
      const res = await getBloquesServidor(servidor.servidor_id, anio);
      setBloques(res.bloques);
      setTotalDiasModal(res.total_dias);
      setTopeDiasAnual(res.tope_dias_anual);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "No se pudo cargar",
        text: err.response?.data?.message || "Error obteniendo los bloques",
      });
      setModalServidor(null);
    } finally {
      setCargandoBloques(false);
    }
  };

  const cerrarModal = () => {
    setModalServidor(null);
    setBloques([]);
    setEditandoId(null);
  };

  const diasDelFormulario = () => {
    if (!formBloque.fecha_desde || !formBloque.fecha_hasta) return 0;
    const ms =
      new Date(formBloque.fecha_hasta) - new Date(formBloque.fecha_desde);
    if (ms < 0) return 0;
    return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalProyectado = () => {
    const sinEsteBloque = editandoId
      ? bloques.filter((b) => b.id !== editandoId)
      : bloques;
    const sumaResto = sinEsteBloque.reduce((acc, b) => acc + b.dias, 0);
    return sumaResto + diasDelFormulario();
  };

  const handleEditarBloque = (bloque) => {
    setEditandoId(bloque.id);
    setFormBloque({
      fecha_desde: bloque.fecha_desde.split("T")[0],
      fecha_hasta: bloque.fecha_hasta.split("T")[0],
    });
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setFormBloque({ fecha_desde: "", fecha_hasta: "" });
  };

  const handleGuardarBloque = async () => {
    if (!formBloque.fecha_desde || !formBloque.fecha_hasta) {
      Swal.fire({
        toast: true,
        icon: "warning",
        text: "Completa las dos fechas",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      return;
    }
    if (new Date(formBloque.fecha_hasta) < new Date(formBloque.fecha_desde)) {
      Swal.fire({
        toast: true,
        icon: "warning",
        text: "La fecha hasta no puede ser anterior a la fecha desde",
        timer: 2500,
        showConfirmButton: false,
        position: "top-end",
      });
      return;
    }

    setGuardandoBloque(true);
    try {
      if (editandoId) {
        await actualizarBloque(editandoId, formBloque);
      } else {
        await crearBloque({
          servidor_id: modalServidor.servidor_id,
          ...formBloque,
        });
      }
      const res = await getBloquesServidor(modalServidor.servidor_id, anio);
      setBloques(res.bloques);
      setTotalDiasModal(res.total_dias);
      setFormBloque({ fecha_desde: "", fecha_hasta: "" });
      setEditandoId(null);
      cargar();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: err.response?.data?.message || "Error guardando el bloque",
      });
    } finally {
      setGuardandoBloque(false);
    }
  };

  const handleEliminarBloque = async (bloque) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar este bloque?",
      html: `<p class="text-gray-600">${bloque.fecha_desde.split("T")[0]} → ${bloque.fecha_hasta.split("T")[0]} (${bloque.dias} días)</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (!confirm.isConfirmed) return;

    try {
      await eliminarBloque(bloque.id);
      const res = await getBloquesServidor(modalServidor.servidor_id, anio);
      setBloques(res.bloques);
      setTotalDiasModal(res.total_dias);
      if (editandoId === bloque.id) handleCancelarEdicion();
      cargar();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: err.response?.data?.message || "Error eliminando el bloque",
      });
    }
  };

  // total/resumen vienen calculados por el backend sobre TODO lo que
  // coincide con los filtros, no solo la página actual visible.
  const stats = {
    totalPersonas: total,
    conVacacionesPlanificadas: resumen.con_vacaciones,
    enTope: resumen.en_tope,
  };

  const proyectado = totalProyectado();
  const excedeTope = proyectado > topeDiasAnual;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-200">
                <Umbrella className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                  Cronograma de Vacaciones
                </h1>
                <p className="text-gray-500 mt-1">
                  Planifica cuándo se va de vacaciones tu personal — máximo{" "}
                  {topeDiasAnual} días al año por persona
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl border-2 border-gray-200 px-2 py-1.5 shadow-md">
              <button
                onClick={() => setAnio((a) => a - 1)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronLeft size={18} className="text-gray-500" />
              </button>
              <span className="font-bold text-gray-900 text-lg w-16 text-center">
                {anio}
              </span>
              <button
                onClick={() => setAnio((a) => a + 1)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
              >
                <ChevronRight size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              label="Personal visible"
              value={stats.totalPersonas}
              icon={Umbrella}
              color="blue"
            />
            <StatCard
              label="Con vacaciones planificadas"
              value={stats.conVacacionesPlanificadas}
              icon={CalendarRange}
              color="green"
            />
            <StatCard
              label={`En el tope (${topeDiasAnual} días)`}
              value={stats.enTope}
              icon={AlertTriangle}
              color="orange"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 md:flex-none">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={unidadFiltro}
                onChange={handleUnidad}
                className="w-full md:w-[240px] border-2 border-gray-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="">Todas las unidades</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar por nombre o cédula..."
                className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={handleExportarExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md text-sm font-medium shrink-0"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Cargando cronograma...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex p-6 bg-gray-100 rounded-2xl mb-4">
                <Umbrella className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg">
                No hay personal para mostrar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-linear-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                    {["Servidor", "Cédula", "Denominación", "Unidad", `Días (${anio})`, "Acciones"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((sv) => {
                    const enTope = sv.dias_planificados >= topeDiasAnual;
                    return (
                      <tr key={sv.servidor_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {sv.nombres}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{sv.cedula}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {sv.denominacion || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {sv.unidad_organica}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              enTope
                                ? "bg-orange-100 text-orange-800 border border-orange-200"
                                : sv.dias_planificados > 0
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                          >
                            {sv.dias_planificados} / {topeDiasAnual}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => abrirModalServidor(sv)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-all"
                          >
                            <CalendarRange size={14} />
                            Planificar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {!loading && data.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  Mostrando <b className="text-gray-900">{data.length}</b> de{" "}
                  <b className="text-gray-900">{total}</b> personas
                </span>
                <select
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white"
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>

              <PageNumbers page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>

      {/* Modal de bloques de un servidor */}
      {modalServidor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={cerrarModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Umbrella className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{modalServidor.nombres}</h2>
                    <p className="text-sm text-blue-100">
                      {modalServidor.cedula} — Vacaciones {anio}
                    </p>
                  </div>
                </div>
                <button
                  onClick={cerrarModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all hover:rotate-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {cargandoBloques ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <>
                  <div
                    className={`mb-6 p-4 rounded-xl border-2 flex items-center justify-between ${
                      totalDiasModal >= topeDiasAnual
                        ? "bg-orange-50 border-orange-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Total planificado en {anio}
                    </span>
                    <span
                      className={`text-2xl font-bold ${
                        totalDiasModal >= topeDiasAnual ? "text-orange-700" : "text-blue-700"
                      }`}
                    >
                      {totalDiasModal} / {topeDiasAnual} días
                    </span>
                  </div>

                  {/* Lista de bloques */}
                  {bloques.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {bloques.map((b) => (
                        <div
                          key={b.id}
                          className={`flex items-center justify-between p-3 rounded-xl border ${
                            editandoId === b.id
                              ? "border-blue-400 bg-blue-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="text-sm text-gray-700">
                            <strong className="text-gray-900">
                              {b.fecha_desde.split("T")[0]}
                            </strong>{" "}
                            →{" "}
                            <strong className="text-gray-900">
                              {b.fecha_hasta.split("T")[0]}
                            </strong>{" "}
                            <span className="text-gray-500">({b.dias} días)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditarBloque(b)}
                              className="p-1.5 hover:bg-white rounded-lg text-blue-600 transition-all"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleEliminarBloque(b)}
                              className="p-1.5 hover:bg-white rounded-lg text-red-600 transition-all"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulario agregar/editar bloque */}
                  <div className="border-t border-gray-200 pt-5">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      {editandoId ? "Editando bloque" : "Agregar nuevo bloque"}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Periodo de vacaciones
                        </label>
                        <DatePicker
                          locale="es"
                          selectsRange
                          startDate={parseLocalDate(formBloque.fecha_desde)}
                          endDate={parseLocalDate(formBloque.fecha_hasta)}
                          onChange={([inicio, fin]) =>
                            setFormBloque({
                              fecha_desde: formatLocalDate(inicio),
                              fecha_hasta: formatLocalDate(fin),
                            })
                          }
                          openToDate={new Date(anio, 0, 1)}
                          minDate={new Date(anio, 0, 1)}
                          maxDate={new Date(anio, 11, 31)}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Selecciona desde — hasta"
                          isClearable
                          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          wrapperClassName="w-full"
                        />
                      </div>
                      {editandoId && (
                        <button
                          onClick={handleCancelarEdicion}
                          className="px-4 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all shrink-0"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        onClick={handleGuardarBloque}
                        disabled={guardandoBloque || !formBloque.fecha_desde || !formBloque.fecha_hasta}
                        className="px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                      >
                        {guardandoBloque ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : editandoId ? (
                          <Pencil size={16} />
                        ) : (
                          <Plus size={16} />
                        )}
                        {editandoId ? "Guardar cambios" : "Agregar"}
                      </button>
                    </div>
                    {formBloque.fecha_desde && formBloque.fecha_hasta && (
                      <p
                        className={`text-xs mt-2 ${excedeTope ? "text-red-600 font-semibold" : "text-gray-500"}`}
                      >
                        {diasDelFormulario()} días este bloque — total quedaría en{" "}
                        {proyectado} / {topeDiasAnual}
                        {excedeTope && " (supera el tope, no se podrá guardar)"}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
