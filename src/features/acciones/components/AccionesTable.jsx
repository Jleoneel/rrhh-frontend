import { Eye, Edit, Filter, Download, Paperclip, FileText, XCircle } from "lucide-react";
import EstadoBadge from "./EstadoBadge";
import { useState } from "react";
import VerAccionModal from "./Modales/VerAccionModal";

export default function AccionesTable({
  acciones,
  onView,
  onEdit,
  onDownload,
  onAnexos,
  esAsistenteUATH,
  esAdmin,
  onInsubsistente,
}) {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortConfig, setSortConfig] = useState({
    key: "codigo_elaboracion",
    direction: "desc",
  });
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedAccion, setSelectedAccion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleView = (accion) => {
    setSelectedAccion(accion);
    setViewOpen(true);
    if (onView) onView(accion);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(paginatedAcciones.map((a) => a.id));
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

  // Ordenar
  const sortedAcciones = [...acciones].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key] ?? "";
    const bValue = b[sortConfig.key] ?? "";
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(sortedAcciones.length / pageSize);

  const paginatedAcciones = sortedAcciones.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
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
              <button
                onClick={() =>
                  setSortConfig((prev) => ({
                    ...prev,
                    direction: prev.direction === "asc" ? "desc" : "asc",
                  }))
                }
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <Filter size={18} />
                <span className="hidden md:inline">
                  {sortConfig.direction === "asc"
                    ? "Más reciente ↓"
                    : "Más antiguo ↑"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-10 px-4 py-2">
                  <input
                    type="checkbox"
                    checked={
                      paginatedAcciones.length > 0 &&
                      paginatedAcciones.every((a) => selectedRows.has(a.id))
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                {[
                  { key: "codigo_elaboracion", label: "Código" },
                  { key: "fecha_elaboracion", label: "Fecha" },
                  { key: "cedula", label: "Cédula" },
                  { key: "servidor", label: "Servidor" },
                  { key: "tipo_accion", label: "Tipo de acción" },
                  { key: "estado", label: "Estado" },
                  { key: "actions", label: "Acciones", sortable: false },
                ].map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${
                      column.sortable !== false
                        ? "cursor-pointer hover:bg-gray-100"
                        : ""
                    }`}
                    onClick={() =>
                      column.sortable !== false && handleSort(column.key)
                    }
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable !== false &&
                        sortConfig.key === column.key && (
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
              {paginatedAcciones.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
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
                paginatedAcciones.map((accion) => {
                  const isSelected = selectedRows.has(accion.id);
                  return (
                    <tr
                      key={accion.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="w-10 px-4 py-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(accion.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-xs break-words max-w-[100px]">
                          {accion.codigo_elaboracion}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <span className="font-medium text-gray-900">
                          {new Date(
                            accion.fecha_elaboracion,
                          ).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-1 py-1">
                        <div className="font-mono text-gray-800">
                          {accion.cedula}
                        </div>
                      </td>
                      <td className="px-1 py-4">
                        <div className="font-medium text-gray-900 text-sm max-w-[180px]">
                          {accion.servidor}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                          {accion.tipo_accion}
                        </span>
                      </td>
                      <td className="px-2 py-4">
                        <EstadoBadge estado={accion.estado} />
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleView(accion)}
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={15} />
                          </button>
                          {accion.estado === "BORRADOR" && esAsistenteUATH && (
                            <button
                              onClick={() => onEdit?.(accion)}
                              className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => onAnexos?.(accion)}
                            className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors group"
                            title="Gestionar anexos"
                          >
                            <Paperclip
                              size={15}
                              className="group-hover:rotate-12 transition-transform"
                            />
                          </button>
                          {esAsistenteUATH && (
                            <button
                              onClick={() => onDownload?.(accion)}
                              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors"
                              title="Descargar PDF"
                            >
                              <Download size={15} />
                            </button>
                          )}
                          {esAdmin && accion.estado !== "INSUBSISTENTE" && (
                            <button
                              onClick={() => onInsubsistente?.(accion)}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                              title="Marcar como insubsistente"
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con paginación */}
        {sortedAcciones.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * pageSize, sortedAcciones.length)}
                </span>{" "}
                de{" "}
                <span className="font-semibold">{sortedAcciones.length}</span>{" "}
                acciones
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Acciones por página:
                  </span>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  {/* Páginas */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1,
                    )
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) {
                        acc.push("...");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "..." ? (
                        <span
                          key={`ellipsis-${i}`}
                          className="px-2 text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === item
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {item}
                        </button>
                      ),
                    )}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <VerAccionModal
        open={viewOpen}
        onClose={() => {
          setViewOpen(false);
          setSelectedAccion(null);
        }}
        accion={selectedAccion}
      />
    </>
  );
}
