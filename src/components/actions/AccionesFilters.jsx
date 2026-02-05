export default function AccionesFilters({ filters, onChange, onBuscar, onLimpiar }) {
  return (
    <form onSubmit={onBuscar} className="bg-white p-4 rounded shadow">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-600">Cédula</label>
          <input
            value={filters.cedula}
            onChange={(e) => onChange("cedula", e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Ingrese C.I"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Estado</label>
          <select
            value={filters.estado}
            onChange={(e) => onChange("estado", e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Todos</option>
            <option value="BORRADOR">BORRADOR</option>
            <option value="EN_FIRMA">EN_FIRMA</option>
            <option value="APROBADO">APROBADO</option>
            <option value="RECHAZADO">RECHAZADO</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Desde</label>
          <input
            type="date"
            value={filters.desde}
            onChange={(e) => onChange("desde", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Hasta</label>
          <input
            type="date"
            value={filters.hasta}
            onChange={(e) => onChange("hasta", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>

        <button
          type="button"
          onClick={onLimpiar}
          className="border px-4 py-2 rounded"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}
