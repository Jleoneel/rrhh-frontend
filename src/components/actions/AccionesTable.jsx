import { useState } from "react";
import EstadoBadge from "./EstadoBadge";

export default function AccionesTable({ acciones }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const closeMenu = () => setOpenMenuId(null);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">
              Fecha
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">
              Cédula
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">
              Servidor
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">
              Tipo de acción
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">
              Estado
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-600">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {acciones.map((accion) => (
            <tr
              key={accion.id}
              className="hover:bg-gray-50 transition-colors relative"
            >
              <td className="px-4 py-3 text-gray-700">
                {new Date(accion.fecha_elaboracion).toLocaleDateString()}
              </td>

              <td className="px-4 py-3 text-gray-700">
                {accion.cedula}
              </td>

              <td className="px-4 py-3 text-gray-800 font-medium">
                {accion.servidor}
              </td>

              <td className="px-4 py-3 text-gray-700">
                {accion.tipo_accion}
              </td>

              <td className="px-4 py-3">
                <EstadoBadge estado={accion.estado} />
              </td>

              {/* Acciones */}
              <td className="px-4 py-3 text-center relative">
                <button
                  onClick={() => toggleMenu(accion.id)}
                  className="
                    rounded-md p-2
                    text-gray-500
                    hover:bg-gray-100 hover:text-gray-900
                    focus:outline-none
                    transition
                  "
                >
                  ⋮
                </button>

                {openMenuId === accion.id && (
                  <>
                    {/* Overlay para cerrar */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={closeMenu}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-6 top-10 z-20 w-40 rounded-md border border-gray-200 bg-white shadow-lg">
                      <button
                        onClick={() => {
                          console.log("Ver", accion.id);
                          closeMenu();
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Ver detalle
                      </button>

                      <button
                        onClick={() => {
                          console.log("Editar", accion.id);
                          closeMenu();
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Editar
                      </button>
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}

          {acciones.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-6 text-center text-gray-500"
              >
                No existen acciones registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
