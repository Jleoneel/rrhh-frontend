import { useAuth } from "../../auth/AuthContext";
import { 
  PlusCircle, 
  Bell, 
  Search, 
  HelpCircle,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  User,
  Menu
} from "lucide-react";
import { useState } from "react";

export default function Header({ 
  title, 
  showNewAction = true, 
  onNuevaAccion,
  showSearch = false,
  showFilters = false,
  onSearch,
  onFilter,
  showNotifications = true
}) {
  const { user } = useAuth();
  const [notifications] = useState([
    { id: 1, text: "Nueva solicitud de vacaciones", time: "2 min", unread: true },
    { id: 2, text: "Acción aprobada por gerencia", time: "1 hora", unread: true },
    { id: 3, text: "Recordatorio: Revisar pendientes", time: "3 horas", unread: false },
  ]);
  
  const unreadCount = notifications.filter(n => n.unread).length;
  const isUATH = user?.cargo_nombre === "ASISTENTE DE LA UATH";

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 shadow-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Lado izquierdo: Título y breadcrumb */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
            
            {showSearch && (
              <div className="hidden md:block relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar acciones, empleados..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onChange={(e) => onSearch && onSearch(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Lado derecho: Acciones y usuario */}
          <div className="flex items-center gap-3">
            {/* Botones de acción */}
            {showFilters && (
              <button
                onClick={onFilter}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Filtrar"
              >
                <Filter size={18} />
                <span className="text-sm font-medium">Filtrar</span>
              </button>
            )}
            
            
            {/* Notificaciones 
            {showNotifications && (
              <div className="relative group">
                <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Dropdown de notificaciones 
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                    <p className="text-sm text-gray-500">{unreadCount} sin leer</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={`p-4 border-b hover:bg-gray-50 ${notif.unread ? 'bg-blue-50' : ''}`}
                      >
                        <p className="text-sm font-medium">{notif.text}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">{notif.time}</span>
                          {notif.unread && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              </div>
            )}*/}
            
            {/* Botón Nueva Acción */}
            {showNewAction && isUATH && (
              <button
                onClick={onNuevaAccion}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" />
                <span className="font-semibold">Nueva acción</span>
              </button>
            )}
            
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
        
        {/* Barra de estado/indicadores */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="hidden md:flex items-center gap-2">
            <Calendar size={14} />
            <span className="text-gray-600">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 ml-auto">
            

          </div>
        </div>
      </div>
    </header>
  );
}