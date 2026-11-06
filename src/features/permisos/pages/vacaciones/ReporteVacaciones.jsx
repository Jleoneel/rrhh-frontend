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
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Building2,
  User,
  Umbrella,
  ListFilter,
  CalendarDays,
} from "lucide-react";
import api from "../../../../shared/api/axios";
import Swal from "sweetalert2";
// xlsx-js-style (no "xlsx" a secas, que ignora en silencio cualquier
// estilo) — mismo fork que usa Cronograma de Vacaciones, para que el
// Excel de este reporte tenga el mismo acabado (encabezado con color,
// bordes, franjas alternadas) en vez de una hoja plana sin estilo.
import * as XLSX from "xlsx-js-style";
import StatCard from "../../../../shared/components/ui/StatCard";
import PageNumbers from "../../../../shared/components/ui/PageNumbers";

const ESTADOS = [
  "TODOS",
  "PENDIENTE_JEFE",
  "PENDIENTE_GERENTE",
  "PENDIENTE_UATH",
  "APROBADO",
  "NEGADO",
];

const estadoLabel = {
  PENDIENTE_JEFE: "Pend. Jefe",
  PENDIENTE_GERENTE: "Pend. Jefe Superior",
  PENDIENTE_UATH: "Pend. UATH",
  APROBADO: "Aprobado",
  NEGADO: "Negado",
};

const estadoBadge = (estado) => {
  const map = {
    PENDIENTE_JEFE: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    PENDIENTE_GERENTE: "bg-orange-100 text-orange-800 border border-orange-200",
    PENDIENTE_UATH: "bg-blue-100 text-blue-800 border border-blue-200",
    APROBADO: "bg-green-100 text-green-800 border border-green-200",
    NEGADO: "bg-red-100 text-red-800 border border-red-200",
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
      {icons[estado]} {estadoLabel[estado] || estado}
    </span>
  );
};

// Nombre completo (no la abreviatura de la UI) para que se lea bien en la
// celda del Excel, donde no hay ícono que acompañe al texto.
const ESTADO_LABEL_EXCEL = {
  PENDIENTE_JEFE: "Pendiente Jefe Inmediato",
  PENDIENTE_GERENTE: "Pendiente Jefe Superior",
  PENDIENTE_UATH: "Pendiente UATH",
  APROBADO: "Aprobado",
  NEGADO: "Negado",
};

// Mismos colores que el badge de estado en pantalla (map de arriba, en hex
// de Tailwind) para que la columna Estado del Excel se lea igual de rápido
// que en la UI.
const ESTADO_ESTILO_EXCEL = {
  PENDIENTE_JEFE: { bg: "FEF9C3", texto: "854D0E" },
  PENDIENTE_GERENTE: { bg: "FFEDD5", texto: "9A3412" },
  PENDIENTE_UATH: { bg: "DBEAFE", texto: "1E40AF" },
  APROBADO: { bg: "DCFCE7", texto: "166534" },
  NEGADO: { bg: "FEE2E2", texto: "991B1B" },
};

// Estilos del Excel exportado, calcados del mismo criterio que
// CronogramaVacaciones.jsx (Calibri, títulos centrados con borde fino,
// encabezado con relleno y franjas alternadas) pero en la paleta verde de
// este módulo, para que el archivo se vea como una extensión del sistema.
const BORDE_FINA = { style: "thin", color: { rgb: "94A3B8" } };
const BORDE_COMPLETO = {
  top: BORDE_FINA, bottom: BORDE_FINA, left: BORDE_FINA, right: BORDE_FINA,
};
const VERDE_TEXTO = "065F46";
const VERDE_HEADER = "059669";
const VERDE_SUBHEADER = "D1FAE5";
const GRIS_ZEBRA = "F8FAFC";

const COLUMNAS_EXCEL = [
  "Servidor", "Cédula", "Unidad", "Tipo", "Fecha Solicitud",
  "Fecha Inicio", "Fecha Fin", "Días", "Estado", "Jefe Inmediato",
];

function aplicarEstiloReporteVacaciones(ws, filas) {
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
        // "REPORTE DE VACACIONES" + descripción del filtro aplicado
        ws[ref].s = {
          font: { name: "Calibri", sz: 11, bold: true, color: { rgb: VERDE_TEXTO } },
          alignment: { horizontal: "center", vertical: "center" },
          border: BORDE_COMPLETO,
          fill: { fgColor: { rgb: VERDE_SUBHEADER } },
        };
      } else if (r === 2) {
        // Encabezados de columna
        ws[ref].s = {
          font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
          alignment: { horizontal: "center", vertical: "center", wrapText: true },
          border: BORDE_COMPLETO,
          fill: { fgColor: { rgb: VERDE_HEADER } },
        };
      } else {
        // Filas de datos
        const idxFila = r - 3;
        const zebra = idxFila % 2 === 1;
        const esTexto = c === 0 || c === 2 || c === 9; // Servidor/Unidad/Jefe
        const esEstado = c === 8;
        const esDias = c === 7;
        const colorEstado = esEstado ? ESTADO_ESTILO_EXCEL[filas[idxFila].estado] : null;

        ws[ref].s = {
          font: {
            name: "Calibri",
            sz: 10,
            bold: esDias || esEstado,
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
    { wch: 30 }, { wch: 14 }, { wch: 30 }, { wch: 18 }, { wch: 14 },
    { wch: 13 }, { wch: 13 }, { wch: 8 }, { wch: 24 }, { wch: 28 },
  ];
  ws["!rows"] = [
    { hpt: 26 }, { hpt: 22 }, { hpt: 24 },
    ...Array.from({ length: filas.length }, () => ({ hpt: 20 })),
  ];
}

export default function ReporteVacaciones() {
  const { setHeaderConfig } = useOutletContext();

  useEffect(() => {
    setHeaderConfig({
      title: "Reporte de Vacaciones",
      showNewAction: false,
      onNewAction: null,
    });
  }, [setHeaderConfig]);

  const hoy = new Date().toISOString().split("T")[0];
  const [fechaDesde, setFechaDesde] = useState(hoy);
  const [fechaHasta, setFechaHasta] = useState(hoy);
  const [estado, setEstado] = useState("TODOS");
  const [verTodos, setVerTodos] = useState(true);
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
    NEGADO: 0,
  });

  const cargarReporte = async (overrides = {}) => {
    const p = {
      fechaDesde,
      fechaHasta,
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
        // El backend solo filtra por fecha cuando "todos" llega como
        // "false" literal — antes se omitía este parámetro en modo
        // filtro, así que el filtro de fecha nunca se aplicaba.
        todos: p.verTodos ? "true" : "false",
      });
      if (!p.verTodos) {
        params.append("fecha_desde", p.fechaDesde);
        params.append("fecha_hasta", p.fechaHasta);
      }
      if (p.estado !== "TODOS") params.append("estado", p.estado);
      if (p.unidadFiltro) params.append("unidad_organica_id", p.unidadFiltro);
      if (p.search) params.append("search", p.search);

      const res = await api.get(`/permisos/reporte-vacaciones?${params}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setResumen(res.data.resumen || { PENDIENTE: 0, APROBADO: 0, NEGADO: 0 });
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

  const handleFechaDesde = (e) => {
    const nuevaDesde = e.target.value;
    setFechaDesde(nuevaDesde);
    setPage(1);
    // Si "hasta" queda antes que "desde", lo empujamos para que el rango
    // siga siendo válido.
    const nuevaHasta = fechaHasta < nuevaDesde ? nuevaDesde : fechaHasta;
    if (nuevaHasta !== fechaHasta) setFechaHasta(nuevaHasta);
    cargarReporte({ fechaDesde: nuevaDesde, fechaHasta: nuevaHasta, page: 1 });
  };

  const handleFechaHasta = (e) => {
    setFechaHasta(e.target.value);
    setPage(1);
    cargarReporte({ fechaHasta: e.target.value, page: 1 });
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

  const stats = {
    total,
    aprobados: resumen.APROBADO,
    pendientes: resumen.PENDIENTE,
    negados: resumen.NEGADO,
  };

  const handleDescargarPdf = async (v) => {
    try {
      const token = localStorage.getItem("token");

      // Si está aprobado, descargar el PDF final firmado por UATH
      const url =
        v.estado === "APROBADO" && v.archivo_uath
          ? `${import.meta.env.VITE_API_URL}/api/permisos/${v.id}/descargar-vacacion/uath`
          : `${import.meta.env.VITE_API_URL}/api/permisos/${v.id}/pdf-vacacion`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error generando PDF");

      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(blob);
      a.download = `vacacion_${v.servidor_nombre}_${v.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(a.href);
      }, 100);

      Swal.fire({
        toast: true,
        icon: "success",
        text: "PDF descargado correctamente",
        timer: 2000,
        showConfirmButton: false,
        position: "top-end",
      });
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo descargar el PDF",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleExportarExcel = async () => {
    let datosExportar = data;
    try {
      const params = new URLSearchParams({
        page: 1,
        limit: 100000,
        todos: verTodos ? "true" : "false",
      });
      if (!verTodos) {
        params.append("fecha_desde", fechaDesde);
        params.append("fecha_hasta", fechaHasta);
      }
      if (estado !== "TODOS") params.append("estado", estado);
      if (unidadFiltro) params.append("unidad_organica_id", unidadFiltro);
      if (search) params.append("search", search);
      const res = await api.get(`/permisos/reporte-vacaciones?${params}`);
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
    partesFiltro.push(
      verTodos
        ? "Todas las solicitudes"
        : `Fecha de solicitud: ${fechaDesde} → ${fechaHasta}`,
    );
    if (estado !== "TODOS") partesFiltro.push(estadoLabel[estado] || estado);
    if (unidadFiltro) {
      const nombreUnidad = unidades.find((u) => u.id === unidadFiltro)?.nombre;
      if (nombreUnidad) partesFiltro.push(nombreUnidad);
    }
    if (search) partesFiltro.push(`Búsqueda: "${search}"`);
    const subtitulo = `REPORTE DE VACACIONES — ${partesFiltro.join(" · ")}`;

    const aoa = [
      ["HOSPITAL PROVINCIAL DE PORTOVIEJO DR. VERDI CEVALLOS BALDA"],
      [subtitulo],
      COLUMNAS_EXCEL,
      ...datosExportar.map((v) => [
        v.servidor_nombre,
        v.cedula,
        v.unidad_organica,
        v.tipo === "VACACION_PROGRAMADA" ? "Vacación Programada" : "Permiso con Cargo",
        v.fecha_solicitud,
        v.fecha_inicio,
        v.fecha_fin,
        v.dias_solicitados,
        ESTADO_LABEL_EXCEL[v.estado] || v.estado,
        v.jefe_nombre || "",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!merges"] = [
      { s: { c: 0, r: 0 }, e: { c: COLUMNAS_EXCEL.length - 1, r: 0 } },
      { s: { c: 0, r: 1 }, e: { c: COLUMNAS_EXCEL.length - 1, r: 1 } },
    ];
    aplicarEstiloReporteVacaciones(ws, datosExportar);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vacaciones");
    XLSX.writeFile(
      wb,
      `reporte_vacaciones_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-green-50 p-4 sm:p-6 lg:p-8">
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
                  Reporte de Vacaciones
                </h1>
                <p className="text-gray-500 mt-1">
                  Consulta y gestión de solicitudes de vacaciones
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Solicitudes"
              value={stats.total}
              icon={Users}
              color="blue"
            />
            <StatCard
              label="Aprobadas"
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
              label="Negadas"
              value={stats.negados}
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
                  ? "bg-green-600 border-green-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {verTodos ? (
                <>
                  <CalendarDays size={16} />
                  Filtrar por fecha de solicitud
                </>
              ) : (
                <>
                  <ListFilter size={16} />
                  Ver todas las solicitudes
                </>
              )}
            </button>

            {/* Rango de fecha de solicitud (solo si el filtro está activo) */}
            {!verTodos && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
                <Calendar size={18} className="text-green-500" />
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={handleFechaDesde}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium"
                />
                <span className="text-gray-400 text-sm">→</span>
                <input
                  type="date"
                  value={fechaHasta}
                  min={fechaDesde}
                  onChange={handleFechaHasta}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium"
                />
              </div>
            )}
          </div>

          {!verTodos && (
            <p className="text-xs text-gray-400 mt-2 ml-1">
              Filtra por la fecha en que se hizo la solicitud, no por el
              período de vacación.
            </p>
          )}

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            {/* Estado */}
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={estado}
                onChange={handleEstado}
                className="w-full md:w-[180px] border-2 border-gray-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e === "TODOS" ? "Todos los estados" : estadoLabel[e]}
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
                className="w-full md:w-[200px] border-2 border-gray-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white cursor-pointer"
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
                className="w-full border-2 border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Exportar Excel */}
            <button
              onClick={handleExportarExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md text-sm font-medium"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* Tabla de vacaciones */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText size={18} className="text-green-600" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">
                  {total} solicitud
                  {total !== 1 ? "es" : ""}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Registros encontrados
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Cargando reporte...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-20 text-center">
              <div className="inline-flex p-6 bg-gray-100 rounded-2xl mb-4">
                <Umbrella className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg">
                No hay solicitudes de vacaciones
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Prueba con otros filtros de búsqueda
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-linear-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                    {[
                      "Servidor",
                      "Cédula",
                      "Unidad",
                      "Tipo",
                      "Período",
                      "Días",
                      "Jefe",
                      "Estado",
                      "PDF",
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
                  {data.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-linear-to-r hover:from-green-50/50 hover:to-transparent transition-all duration-200 group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User size={14} className="text-green-600" />
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {v.servidor_nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">
                        {v.cedula}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-[150px]">
                            {v.unidad_organica}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                            v.tipo === "VACACION_PROGRAMADA"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {v.tipo === "VACACION_PROGRAMADA"
                            ? "Programada"
                            : "Con Cargo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700 font-medium">
                            {new Date(
                              v.fecha_inicio + "T12:00:00",
                            ).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </span>
                          <span className="text-xs text-gray-400">
                            →{" "}
                            {new Date(
                              v.fecha_fin + "T12:00:00",
                            ).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                          <Calendar size={12} />
                          {v.dias_solicitados} días
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Users size={12} className="text-gray-400" />
                          <span className="text-sm text-gray-600 truncate max-w-[120px]">
                            {v.jefe_nombre || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{estadoBadge(v.estado)}</td>
                      <td className="px-6 py-4">
                        {v.estado === "APROBADO" && (
                          <button
                            onClick={() => handleDescargarPdf(v)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg text-xs font-medium"
                            title="Descargar PDF de vacaciones"
                          >
                            <Download size={13} />
                            PDF
                          </button>
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
                  <b className="text-gray-900">{total}</b> solicitudes
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
                color="green"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
