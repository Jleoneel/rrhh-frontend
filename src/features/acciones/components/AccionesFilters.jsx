import { Search, X, Calendar, User, FileText } from "lucide-react";

export default function AccionesFilters({ filters, onChange, onBuscar, onLimpiar }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
      {/* Formulario de filtros */}
      <form onSubmit={onBuscar} className="space-y-6">
        {/* Filtros principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User size={16} />
              <span>Cédula / Identificación</span>
            </label>
            <div className="relative">
              <input
                value={filters.cedula}
                onChange={(e) => onChange("cedula", e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ej: 1700000000"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          {/* Estado con colores */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText size={16} />
              <span>Estado de la acción</span>
            </label>
            <select
              value={filters.estado}
              onChange={(e) => onChange("estado", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="">Todos los estados</option>
              <option value="BORRADOR" className="text-gray-600">🟡 Borrador</option>
              <option value="EN_FIRMA" className="text-yellow-600">🟠 En firma</option>
              <option value="APROBADO" className="text-green-600">🟢 Aprobado</option>
              <option value="INSUBSISTENTE" className="text-red-600">🔴 Insubsistente</option>
            </select>
          </div>

          {/* Fecha desde */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar size={16} />
              <span>Fecha desde</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={filters.desde}
                onChange={(e) => onChange("desde", e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          {/* Fecha hasta */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar size={16} />
              <span>Fecha hasta</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={filters.hasta}
                onChange={(e) => onChange("hasta", e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {/* Contadores y acciones */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Mostrando resultados filtrados</span>
            </div>
            <div className="hidden md:block">
              <span className="font-medium">Filtros activos: </span>
              {filters.cedula && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs ml-2">Cédula</span>}
              {filters.estado && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs ml-2">Estado</span>}
              {filters.desde && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs ml-2">Fecha</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLimpiar}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-100 rounded-xl font-medium transition-all duration-300"
            >
              <X size={18} />
              <span>Limpiar filtros</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <Search size={18} className="group-hover:rotate-12 transition-transform" />
              <span>Buscar acciones</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}