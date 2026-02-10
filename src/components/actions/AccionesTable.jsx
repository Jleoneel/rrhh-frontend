import {
  Eye,
  Edit,
  Filter,
  Download,
  MoreVertical,
  Paperclip,
  FileText,
  Share2,
} from "lucide-react";
import EstadoBadge from "./EstadoBadge";
import { useState } from "react";

export default function AccionesTable({
  acciones,
  onView,
  onEdit,
  onDownload,
  onAnexos,
}) {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(acciones.map((a) => a.id));
      setSelectedRows(allIds);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // Ordenar acciones si hay configuración de orden
  const sortedAcciones = [...acciones].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header de la tabla */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Acciones de Personal
              </h2>
              <p className="text-sm text-gray-500">
                {acciones.length} acciones encontradas • {selectedRows.size}{" "}
                seleccionadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedRows.size > 0 && (
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
                <span className="font-medium">
                  {selectedRows.size} seleccionadas
                </span>
              </div>
            )}

            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
              <Filter size={18} />
              <span className="hidden md:inline">Ordenar</span>
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors">
              <Download size={18} />
              <span className="hidden md:inline">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === acciones.length &&
                      acciones.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </th>

              {[
                { key: "fecha_elaboracion", label: "Fecha", sortable: true },
                { key: "cedula", label: "Cédula", sortable: true },
                { key: "servidor", label: "Servidor", sortable: true },
                { key: "tipo_accion", label: "Tipo de acción", sortable: true },
                { key: "estado", label: "Estado", sortable: true },
                { key: "actions", label: "Acciones", sortable: false },
              ].map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && sortConfig.key === column.key && (
                      <span className="text-blue-600">
                        {sortConfig.direction === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {sortedAcciones.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p className="text-lg font-medium text-gray-500">
                      No se encontraron acciones
                    </p>
                    <p className="text-sm mt-1">
                      Intenta con otros filtros o crea una nueva acción
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedAcciones.map((accion) => {
                const isSelected = selectedRows.has(accion.id);

                return (
                  <tr
                    key={accion.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(accion.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {new Date(
                            accion.fecha_elaboracion,
                          ).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-mono text-gray-800">
                        {accion.cedula}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-[200px]">
                        <div className="font-medium text-gray-900 truncate">
                          {accion.servidor}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {accion.tipo_accion}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <EstadoBadge estado={accion.estado} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Botón Ver */}
                        <button
                          onClick={() => onView && onView(accion)}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Botón Editar (solo en BORRADOR) */}
                        {accion.estado === "BORRADOR" && (
                          <button
                            onClick={() => onEdit && onEdit(accion)}
                            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                        )}

                        {/* Botón Descargar PDF */}
                        <button
                          onClick={() => onDownload && onDownload(accion)}
                          className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
                          title="Descargar PDF"
                        >
                          <Download size={18} />
                        </button>

                        {/* Botón Anexos separado - Estilo consistente */}
                        <button
                          onClick={() => onAnexos?.(accion)}
                          className="flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors group"
                          title="Gestionar anexos"
                        >
                          <Paperclip
                            size={16}
                            className="group-hover:rotate-12 transition-transform"
                          />
                          <span className="text-sm font-medium">Anexos</span>
                        </button>

                        {/* Menú de 3 puntos (opcional ahora) */}
                        <button className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer de la tabla */}
      {sortedAcciones.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Mostrando{" "}
              <span className="font-semibold">{sortedAcciones.length}</span> de{" "}
              <span className="font-semibold">{sortedAcciones.length}</span>{" "}
              acciones
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Acciones por página:
                </span>
                <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100">
                  Anterior
                </button>
                <span className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">
                  1
                </span>
                <button className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100">
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
