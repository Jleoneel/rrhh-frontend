import { useAuth } from "../../auth/AuthContext";
import { PlusCircle, Calendar } from "lucide-react";
import { FirmaNotificacionesBell } from "../Layout/FirmaNotificacionesBell";

export default function Header({ 
  title, 
  showNewAction = true, 
  onNuevaAccion
}) {
  const { user } = useAuth();
  const isUATH = user?.cargo_nombre === "ASISTENTE DE LA UATH";

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Título */}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

          {/* Lado derecho */}
          <div className="flex items-center gap-4">
            {/* Botón Nueva Acción (solo UATH) */}
            {showNewAction && isUATH && (
              <button
                onClick={onNuevaAccion}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
                <span className="font-semibold hidden sm:inline">Nueva acción</span>
              </button>
            )}

            {/*Notificaciones de firma */}
            <FirmaNotificacionesBell />

            {/* Perfil del usuario */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-300">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {user?.nombre?.charAt(0) || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                  {user?.nombre || "Usuario"}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                  {user?.cargo_nombre || "Rol no asignado"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Barra inferior con fecha */}
        <div className="flex items-center gap-2 mt-3 text-sm">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-gray-600">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>
    </header>
  );
}