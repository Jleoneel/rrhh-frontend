
export default function AccionesFilters({
  filters,
  onChange,
  onBuscar,
  onLimpiar,
}) {
  return (
    <form
      onSubmit={onBuscar}
      className="bg-white rounded-xl shadow-sm p-5 mb-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Cédula
          </label>
          <input
            value={filters.cedula}
            onChange={(e) => onChange("cedula", e.target.value)}
            placeholder="Ingrese C.I"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                        focus:outline-none
                        focus:border-blue-500
                        focus:ring-0 focus:ring-blue-600
                         transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Estado
          </label>
          <select
            value={filters.estado}
            onChange={(e) => onChange("estado", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white
           focus:outline-none
           focus:border-blue-500
           focus:ring-0 focus:ring-blue-600
           transition"
          >
            <option value="">Todos</option>
            <option value="BORRADOR">BORRADOR</option>
            <option value="EN_FIRMA">EN_FIRMA</option>
            <option value="APROBADO">APROBADO</option>
            <option value="RECHAZADO">RECHAZADO</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={filters.desde}
            onChange={(e) => onChange("desde", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white
           focus:outline-none
           focus:border-blue-500
           focus:ring-0 focus:ring-blue-600
                       transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={filters.hasta}
            onChange={(e) => onChange("hasta", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white
           focus:outline-none
           focus:border-blue-500
           focus:ring-0 focus:ring-blue-600
                       transition"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md
                     text-sm font-medium transition"
        >
          Buscar
        </button>

        <button
          type="button"
          onClick={onLimpiar}
          className="border border-gray-200 hover:bg-gray-100 px-5 py-2 rounded-md
                     text-sm font-medium transition"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}
