import { useState } from "react";
import { Bell } from "lucide-react";
import { useFirmaNotificaciones } from "../../hooks/useFirmaNotificaciones";

export function FirmaNotificacionesBell() {
  const { notificaciones, marcarLeida, marcarTodasLeidas } =
    useFirmaNotificaciones();
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="relative">
      {/* Botón campana */}
      <button
        onClick={() => setAbierto((v) => !v)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell size={20} />
        {notificaciones.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white
                           text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {notificaciones.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {abierto && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl
                        rounded-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm text-gray-700">
              Firmas pendientes
            </span>
            {notificaciones.length > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="text-xs text-blue-500 hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notificaciones.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                Sin notificaciones pendientes
              </div>
            ) : (
              notificaciones.map((n) => (
                <div
                  key={n.id || n.accion_id}
                  className="flex items-start gap-3 px-4 py-3
                             hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => marcarLeida(n.id)}
                >
                  <div className="mt-0.5 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Paso {n.orden}: {n.rol_firma}
                    </p>
                    {n.codigo_elaboracion && (
                      <p className="text-xs text-gray-500">
                        Acción: {n.codigo_elaboracion}
                      </p>
                    )}
                    {n.creada_en && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(n.creada_en).toLocaleString("es-EC")}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
