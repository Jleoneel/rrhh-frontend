import EstadoBadge from "./EstadoBadge";

export default function AccionesTable({ acciones }) {
  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="px-4 py-2">Fecha</th>
            <th className="px-4 py-2">Cédula</th>
            <th className="px-4 py-2">Servidor</th>
            <th className="px-4 py-2">Tipo de acción</th>
            <th className="px-4 py-2">Estado</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {acciones.map((accion) => (
            <tr key={accion.id} className="border-t">
              <td className="px-4 py-2">
                {new Date(accion.fecha_elaboracion).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">{accion.cedula}</td>
              <td className="px-4 py-2">{accion.servidor}</td>
              <td className="px-4 py-2">{accion.tipo_accion}</td>
              <td className="px-4 py-2">
                <EstadoBadge estado={accion.estado} />
              </td>
              <td className="px-4 py-2">
                <button className="text-blue-600 hover:underline">
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
