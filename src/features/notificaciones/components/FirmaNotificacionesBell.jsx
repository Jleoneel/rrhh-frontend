import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotificacionesCtx } from "../context/NotificacionesContext";
import {
  renderIconoNotificacion,
  renderMensajeNotificacion,
  colorNotificacion,
} from "../utils/notificacionDisplay";

export function NotificacionesBell() {
  const { notificaciones, marcarLeida, marcarTodasLeidas } =
    useNotificacionesCtx();
  const [abierto, setAbierto] = useState(false);

  const renderIcono = renderIconoNotificacion;
  const renderMensaje = renderMensajeNotificacion;
  const colorBadge = colorNotificacion;

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell size={20} />
        {notificaciones.length > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white
                           text-xs rounded-full w-4 h-4 flex items-center justify-center"
          >
            {notificaciones.length > 9 ? "9+" : notificaciones.length}
          </span>
        )}
      </button>

      {abierto && (
        <div
          className="absolute right-0 mt-2 w-96 bg-white shadow-xl
                        rounded-xl border border-gray-100 z-50 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <span className="font-semibold text-sm text-gray-700">
              Notificaciones
              {notificaciones.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                  {notificaciones.length}
                </span>
              )}
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

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notificaciones.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">
                  Sin notificaciones pendientes
                </p>
              </div>
            ) : (
              notificaciones.map((n, i) => (
                <div
                  key={`${n.categoria}-${n.id}-${i}`}
                  className={`flex items-start gap-3 px-4 py-3 hover:brightness-95 cursor-pointer transition ${colorBadge(n)}`}
                  onClick={() => marcarLeida(n)}
                >
                  <div className="mt-0.5 shrink-0">{renderIcono(n)}</div>
                  <div className="flex-1 min-w-0">
                    {renderMensaje(n)}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {n.creada_en ? new Date(n.creada_en).toLocaleString("es-EC") : ""}
                    </p>
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
