import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Calendar,
  RefreshCw,
  Loader2,
  FileText,
  Search,
  Filter,
  ChevronDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Building2,
  User,
  Download,
  ListFilter,
  CalendarDays,
} from "lucide-react";
import api from "../../../shared/api/axios";
// xlsx-js-style (no "xlsx" a secas, que ignora en silencio cualquier
// estilo) — mismo fork que Cronograma y Reporte de Vacaciones, para que
// este Excel tenga el mismo acabado (encabezado con color, bordes,
// franjas alternadas) en vez de una hoja plana sin estilo.
import * as XLSX from "xlsx-js-style";
import Swal from "sweetalert2";
import { horasADias } from "../../../shared/utils/horasADias";
import StatCard from "../../../shared/components/ui/StatCard";
import PageNumbers from "../../../shared/components/ui/PageNumbers";
import ObservacionPopover from "../../../shared/components/ui/ObservacionPopover";

const ESTADOS = ["TODOS", "PENDIENTE", "APROBADO", "RECHAZADO", "CANCELADO"];

const estadoBadge = (estado) => {
  const map = {
    PENDIENTE: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    APROBADO: "bg-green-100 text-green-800 border border-green-200",
    RECHAZADO: "bg-red-100 text-red-800 border border-red-200",
    CANCELADO: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  const icons = {
    PENDIENTE: <Clock size={11} />,
    APROBADO: <CheckCircle size={11} />,
    RECHAZADO: <XCircle size={11} />,
    CANCELADO: <XCircle size={11} />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${map[estado] || "bg-gray-100 text-gray-600"}`}
    >
      {icons[estado]} {estado}
    </span>
  );
};

// Mismos colores que el badge de estado en pantalla (map de arriba, en hex
// de Tailwind) para que la columna Estado del Excel se lea igual de rápido
// que en la UI.
const ESTADO_ESTILO_EXCEL = {
  PENDIENTE: { bg: "FEF9C3", texto: "854D0E" },
  APROBADO: { bg: "DCFCE7", texto: "166534" },
  RECHAZADO: { bg: "FEE2E2", texto: "991B1B" },
  CANCELADO: { bg: "F3F4F6", texto: "4B5563" },
};

// Estilos del Excel exportado, mismo criterio que CronogramaVacaciones.jsx
// y el Reporte de Vacaciones (Calibri, títulos centrados con borde fino,
// encabezado con relleno y franjas alternadas) pero en la paleta azul de
// este módulo, para que el archivo se vea como una extensión del sistema.
const BORDE_FINA = { style: "thin", color: { rgb: "94A3B8" } };
const BORDE_COMPLETO = {
  top: BORDE_FINA, bottom: BORDE_FINA, left: BORDE_FINA, right: BORDE_FINA,
};
const AZUL_TEXTO = "1E3A8A";
const AZUL_HEADER = "2563EB";
const AZUL_SUBHEADER = "DBEAFE";
const GRIS_ZEBRA = "F8FAFC";

const COLUMNAS_EXCEL = [
  "Servidor", "Cédula", "Unidad", "Tipo Permiso", "Fecha",
  "Hora Salida", "Hora Regreso", "Horas", "Estado", "Observación", "Jefe",
];

function aplicarEstiloReportePermisos(ws, filas) {
  const totalColumnas = COLUMNAS_EXCEL.length;
  const totalFilas = 3 + filas.length; // 2 títulos + 1 encabezado + datos

  for (let r = 0; r < totalFilas; r++) {
    for (let c = 0; c < totalColumnas; c++) {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (!ws[ref]) ws[ref] = { t: "s", v: "" };

      if (r === 0) {
        // Título del hospital
        ws[ref].s = {
          font: { name: "Calibri", sz: 14, bold: true, color: { rgb: "1E293B" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: BORDE_COMPLETO,
        };
      } else if (r === 1) {
        // "REPORTE DE PERMISOS" + descripción del filtro aplicado
        ws[ref].s = {
          font: { name: "Calibri", sz: 11, bold: true, color: { rgb: AZUL_TEXTO } },
          alignment: { horizontal: "center", vertical: "center" },
          border: BORDE_COMPLETO,
          fill: { fgColor: { rgb: AZUL_SUBHEADER } },
        };
      } else if (r === 2) {
        // Encabezados de columna
        ws[ref].s = {
          font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: BORDE_COMPLETO,
          fill: { fgColor: { rgb: AZUL_HEADER } },
        };
      } else {
        // Filas de datos
        const idxFila = r - 3;
        const zebra = idxFila % 2 === 1;
        const esTexto = c === 0 || c === 2 || c === 9 || c === 10; // Servidor/Unidad/Observación/Jefe
        const esEstado = c === 8;
        const esHoras = c === 7;
        const colorEstado = esEstado ? ESTADO_ESTILO_EXCEL[filas[idxFila].estado] : null;

        ws[ref].s = {
          font: {
            name: "Calibri",
            sz: 10,
            bold: esHoras || esEstado,
            color: { rgb: colorEstado ? colorEstado.texto : "1E293B" },
          },
          alignment: {
            horizontal: esTexto ? "left" : "center",
            vertical: "center",
            wrapText: esTexto,
          },
          border: BORDE_COMPLETO,
          fill: {
            fgColor: { rgb: colorEstado ? colorEstado.bg : zebra ? GRIS_ZEBRA : "FFFFFF" },
          },
        };
      }
    }
  }

  ws["!cols"] = [
    { wch: 30 }, { wch: 14 }, { wch: 30 }, { wch: 20 }, { wch: 13 },
    { wch: 12 }, { wch: 12 }, { wch: 9 }, { wch: 14 }, { wch: 28 }, { wch: 28 },
  ];
  ws["!rows"] = [
    { hpt: 26 }, { hpt: 22 }, { hpt: 24 },
    ...Array.from({ length: filas.length }, () => ({ hpt: 20 })),
  ];
}

export default function ReportePermisos() {
  const { setHeaderConfig } = useOutletContext();

  useEffect(() => {
    setHeaderConfig({
      title: "Reporte de Permisos",
      showNewAction: false,
      onNewAction: null,
    });
  }, [setHeaderConfig]);

  const hoy = new Date().toISOString().split("T")[0];
  const [fecha, setFecha] = useState(hoy);
  const [estado, setEstado] = useState("TODOS");
  const [verTodos, setVerTodos] = useState(false);
  const [unidades, setUnidades] = useState([]);
  const [unidadFiltro, setUnidadFiltro] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [resumen, setResumen] = useState({
    PENDIENTE: 0,
    APROBADO: 0,
    RECHAZADO: 0,
    CANCELADO: 0,
  });

  const cargarReporte = async (overrides = {}) => {
    const p = {
      fecha,
      estado,
      verTodos,
      unidadFiltro,
      search,
      page,
      limit,
      ...overrides,
    };
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: p.page,
        limit: p.limit,
      });
      if (p.verTodos) {
        params.append("todos", "true");
      } else {
        params.append("fecha", p.fecha);
      }
      if (p.estado !== "TODOS") params.append("estado", p.estado);
      if (p.unidadFiltro) params.append("unidad_organica_id", p.unidadFiltro);
      if (p.search) params.append("search", p.search);

      const res = await api.get(`/permisos/reporte?${params}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setResumen(
        res.data.resumen || {
          PENDIENTE: 0,
          APROBADO: 0,
          RECHAZADO: 0,
          CANCELADO: 0,
        },
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
    api
      .get("/catalogos/unidades-organicas")
      .then((r) => setUnidades(r.data))
      .catch(() => setUnidades([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFecha = (e) => {
    setFecha(e.target.value);
    setPage(1);
    cargarReporte({ fecha: e.target.value, page: 1 });
  };

  const handleEstado = (e) => {
    setEstado(e.target.value);
    setPage(1);
    cargarReporte({ estado: e.target.value, page: 1 });
  };

  const handleUnidad = (e) => {
    setUnidadFiltro(e.target.value);
    setPage(1);
    cargarReporte({ unidadFiltro: e.target.value, page: 1 });
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
    cargarReporte({ search: value, page: 1 });
  };

  const handleToggleVerTodos = () => {
    const nuevo = !verTodos;
    setVerTodos(nuevo);
    setPage(1);
    cargarReporte({ verTodos: nuevo, page: 1 });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    cargarReporte({ page: newPage });
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    cargarReporte({ limit: newLimit, page: 1 });
  };

  const handleExportarExcel = async () => {
    let datosExportar = data;
    try {
      const params = new URLSearchParams({ page: 1, limit: 100000 });
      if (verTodos) {
        params.append("todos", "true");
      } else {
        params.append("fecha", fecha);
      }
      if (estado !== "TODOS") params.append("estado", estado);
      if (unidadFiltro) params.append("unidad_organica_id", unidadFiltro);
      if (search) params.append("search", search);
      const res = await api.get(`/permisos/reporte?${params}`);
      datosExportar = res.data.data;
    } catch (err) {
      console.error(err);
    }

    if (!datosExportar.length) {
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

    // Línea de contexto bajo el título: qué filtro quedó aplicado al
    // momento de exportar, para que el archivo tenga sentido por sí solo
    // aunque se comparta fuera del sistema.
    const partesFiltro = [];
    partesFiltro.push(verTodos ? "Todos los permisos registrados" : `Fecha: ${fecha}`);
    if (estado !== "TODOS") partesFiltro.push(estado);
    if (unidadFiltro) {
      const nombreUnidad = unidades.find((u) => u.id === unidadFiltro)?.nombre;
      if (nombreUnidad) partesFiltro.push(nombreUnidad);
    }
    if (search) partesFiltro.push(`Búsqueda: "${search}"`);
    const subtitulo = `REPORTE DE PERMISOS — ${partesFiltro.join(" · ")}`;

    const aoa = [
      ["HOSPITAL PROVINCIAL DE PORTOVIEJO DR. VERDI CEVALLOS BALDA"],
      [subtitulo],
      COLUMNAS_EXCEL,
      ...datosExportar.map((p) => [
        p.servidor_nombre,
        p.cedula,
        p.unidad_organica,
        p.tipo_permiso,
        p.fecha,
        p.hora_salida,
        p.hora_regreso,
        p.horas_solicitadas,
        p.estado,
        p.observacion_jefe || "",
        p.jefe_nombre || "",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!merges"] = [
      { s: { c: 0, r: 0 }, e: { c: COLUMNAS_EXCEL.length - 1, r: 0 } },
      { s: { c: 0, r: 1 }, e: { c: COLUMNAS_EXCEL.length - 1, r: 1 } },
    ];
    aplicarEstiloReportePermisos(ws, datosExportar);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Permisos");
    XLSX.writeFile(
      wb,
      `reporte_permisos_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  // Los stats se calculan en el backend sobre TODOS los registros que
  // coinciden con los filtros (no solo la página actual visible).
  const stats = {
    total,
    aprobados: resumen.APROBADO,
    pendientes: resumen.PENDIENTE,
    rechazados: resumen.RECHAZADO,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-linear-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-200">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                  Reporte de Permisos
                </h1>
                <p className="text-gray-500 mt-1">
                  {verTodos ? (
                    "Consulta de todos los permisos registrados"
                  ) : (
                    <>
                      Consulta de permisos por día —{" "}
                      <span className="font-medium text-blue-600">
                        {new Date(fecha + "T12:00:00").toLocaleDateString(
                          "es-ES",
                          {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => cargarReporte()}
              className="p-3 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-md hover:shadow-lg"
              title="Actualizar datos"
            >
              <RefreshCw size={18} className="text-gray-500" />
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              label="Total Permisos"
              value={stats.total}
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              label="Aprobados"
              value={stats.aprobados}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              label="Pendientes"
              value={stats.pendientes}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              label="Rechazados"
              value={stats.rechazados}
              icon={XCircle}
              color="red"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Toggle día / todos */}
            <button
              onClick={handleToggleVerTodos}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium shrink-0 ${
                verTodos
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {verTodos ? (
                <>
                  <CalendarDays size={16} />
                  Ver por día
                </>
              ) : (
                <>
                  <ListFilter size={16} />
                  Ver todos los permisos
                </>
              )}
            </button>

            {/* Fecha (solo en modo "por día") */}
            {!verTodos && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
                <Calendar size={18} className="text-blue-500" />
                <input
                  type="date"
                  value={fecha}
                  onChange={handleFecha}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium"
                />
              </div>
            )}

            {/* Estado */}
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={estado}
                onChange={handleEstado}
                className="w-full md:w-[170px] border-2 border-gray-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e === "TODOS" ? "Todos los estados" : e}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Unidad */}
            <div className="relative flex-1 md:flex-none">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={unidadFiltro}
                onChange={handleUnidad}
                className="w-full md:w-[200px] border-2 border-gray-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                <option value="">Todas las unidades</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Búsqueda */}
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
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* Aviso explícito de qué se está mostrando/exportando — el filtro de
            fecha de arriba pasa desapercibido, esto lo deja claro antes de
            la tabla y del botón Exportar Excel. */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={15} className="text-blue-500" />
          {verTodos ? (
            <span>
              Mostrando <strong className="text-gray-900">todos</strong> los permisos registrados (sin filtro de fecha)
            </span>
          ) : (
            <span>
              Mostrando permisos del{" "}
              <strong className="text-blue-600">
                {new Date(fecha + "T12:00:00").toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </span>
          )}
        </div>

        {/* Tabla de permisos */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={18} className="text-blue-600" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {total} permiso{total !== 1 ? "s" : ""}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Registros encontrados
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Cargando reporte...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex p-6 bg-gray-100 rounded-2xl mb-4">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg">
                {verTodos
                  ? "No hay permisos registrados"
                  : "No hay permisos para este día"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Prueba con otro filtro o término de búsqueda
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-linear-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                    {[
                      "Fecha",
                      "Servidor",
                      "Cédula",
                      "Unidad",
                      "Tipo",
                      "Horario",
                      "Horas",
                      "Jefe",
                      "Estado",
                      "Observación",
                      "Acciones",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-linear-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-medium">
                          {new Date(p.fecha + "T12:00:00").toLocaleDateString(
                            "es-ES",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User size={14} className="text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {p.servidor_nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">
                        {p.cedula}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-[150px]">
                            {p.unidad_organica}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                          {p.tipo_permiso}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded-lg">
                          {p.hora_salida} - {p.hora_regreso}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                          <Clock size={12} />
                          {horasADias(p.horas_solicitadas)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Users size={12} className="text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-[120px]">
                            {p.jefe_nombre || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{estadoBadge(p.estado)}</td>
                      <td className="px-6 py-4">
                        <ObservacionPopover texto={p.observacion_jefe} />
                      </td>
                      <td className="px-6 py-4">
                        {p.tipo_permiso === "Calamidad Doméstica" &&
                        p.archivo_evidencia ? (
                          <a
                            href={`${import.meta.env.VITE_API_URL}${p.archivo_evidencia}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all text-xs font-medium"
                          >
                            <FileText size={13} />
                            Ver evidencia
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
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
                  <b className="text-gray-900">{total}</b> permisos
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

              <PageNumbers
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
