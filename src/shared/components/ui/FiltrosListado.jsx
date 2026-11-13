import {
  Calendar,
  CalendarDays,
  ListFilter,
  Filter,
  Building2,
  Search,
  ChevronDown,
} from "lucide-react";

const TEMAS = {
  green: {
    toggleActivo: "bg-green-600 border-green-600 text-white",
    icono: "text-green-500",
    anillo: "focus:ring-green-500",
  },
  blue: {
    toggleActivo: "bg-blue-600 border-blue-600 text-white",
    icono: "text-blue-500",
    anillo: "focus:ring-blue-500",
  },
};

// Barra de filtros reutilizable: toggle de fecha (por día o por rango) +
// estado + unidad + búsqueda por nombre/cédula — el mismo set de filtros
// que ya usan los Reporte de Vacaciones/Permisos, para no repetir esta
// misma barra a mano en cada pantalla nueva que la necesite.
export default function FiltrosListado({
  color = "green",
  // Fecha
  verTodos,
  onToggleVerTodos,
  // labelFiltrar: texto del botón cuando NO hay filtro de fecha activo
  // (verTodos=true) — invita a activarlo. labelVerTodos: texto cuando el
  // filtro YA está activo (verTodos=false) — invita a quitarlo.
  labelFiltrar = "Filtrar por fecha",
  labelVerTodos = "Ver todas",
  modoFecha = "rango", // "rango" (desde/hasta) | "dia" (un solo input)
  fechaDesde,
  onFechaDesde,
  fechaHasta,
  onFechaHasta,
  fechaHelpText,
  // Estado
  estado,
  onEstadoChange,
  opcionesEstado = [],
  // Unidad
  unidadFiltro,
  onUnidadChange,
  opcionesUnidad = [],
  // Búsqueda
  search,
  onSearchChange,
  searchPlaceholder = "Buscar por nombre o cédula...",
  // Slot para botones extra (ej. Exportar Excel) alineados a la derecha
  children,
}) {
  const colores = TEMAS[color] || TEMAS.green;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Toggle día/rango vs todos */}
        <button
          onClick={onToggleVerTodos}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all text-sm font-medium shrink-0 ${
            verTodos
              ? colores.toggleActivo
              : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {verTodos ? (
            <>
              <CalendarDays size={16} />
              {labelFiltrar}
            </>
          ) : (
            <>
              <ListFilter size={16} />
              {labelVerTodos}
            </>
          )}
        </button>

        {!verTodos && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200">
            <Calendar size={18} className={colores.icono} />
            <input
              type="date"
              value={fechaDesde}
              onChange={onFechaDesde}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium"
            />
            {modoFecha === "rango" && (
              <>
                <span className="text-gray-400 text-sm">→</span>
                <input
                  type="date"
                  value={fechaHasta}
                  min={fechaDesde}
                  onChange={onFechaHasta}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium"
                />
              </>
            )}
          </div>
        )}
      </div>

      {!verTodos && fechaHelpText && (
        <p className="text-xs text-gray-400 mt-2 ml-1">{fechaHelpText}</p>
      )}

      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* Estado */}
        {opcionesEstado.length > 0 && (
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={estado}
              onChange={onEstadoChange}
              className={`w-full md:w-[180px] border-2 border-gray-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 ${colores.anillo} focus:border-transparent appearance-none bg-white cursor-pointer`}
            >
              {opcionesEstado.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Unidad */}
        {opcionesUnidad.length > 0 && (
          <div className="relative flex-1 md:flex-none">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={unidadFiltro}
              onChange={onUnidadChange}
              className={`w-full md:w-[200px] border-2 border-gray-200 rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-2 ${colores.anillo} focus:border-transparent appearance-none bg-white cursor-pointer`}
            >
              <option value="">Todas las unidades</option>
              {opcionesUnidad.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        )}

        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className={`w-full border-2 border-gray-200 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 ${colores.anillo} focus:border-transparent transition-all`}
          />
        </div>

        {children}
      </div>
    </div>
  );
}
