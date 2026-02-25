import { NavLink, useLocation } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  FileText,
  Settings,
  Users,
  ChevronLeft,
} from "lucide-react";
import LogoutButton from "./logoutButton";
import { useAuth } from "../../auth/AuthContext";
import { useState } from "react";

export default function Sidebar() {
  const { user: Firmante } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const puedeVerUsuarios = Firmante?.cargo_nombre === "ADMINISTRADOR DEL SISTEMA";


  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      title: "Acciones de Personal",
      path: "/acciones",
      icon: <FileText size={20} />,
    },
    ...(puedeVerUsuarios ? [{
      title: "Usuarios",
      path: "/GestionUsuarios",
      icon: <Users size={20} />,
    }]: []),
    {
      title: "Configuración",
      path: "/configuracion",
      icon: <Settings size={20} />,
      submenu: [
        { title: "Perfil", path: "/configuracion/perfil" },
        { title: "Permisos", path: "/configuracion/permisos" },
      ],
    },
  ];

  return (
    <aside
      className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen flex flex-col transition-all duration-300 ${expanded ? "w-64" : "w-20"}`}
    >
      {/* Header con toggle */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div
          className={`flex items-center gap-3 ${!expanded && "justify-center"}`}
        >
            <img
              src="/msp2.png"
              alt="Logo"
              className={`${expanded ? "w-10 h-10" : "w-5 h-5"} object-contain`}
            />


          {expanded && (
            <div>
              <h1 className="font-bold text-lg">Talento Humano</h1>
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 hover:bg-gray-700 rounded-md"
          title={expanded ? "Contraer menú" : "Expandir menú"}
        >
          <ChevronLeft
            className={`transition-transform ${expanded ? "" : "rotate-180"}`}
          />
        </button>
      </div>

      {/* Menú principal */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          const isActive =
            location.pathname === item.path ||
            (item.submenu &&
              item.submenu.some((sub) => location.pathname === sub.path));

          return (
            <div key={index}>
              <NavLink
                to={item.path}
                className={`
                  flex items-center justify-between p-3 rounded-lg transition-all
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "hover:bg-gray-700 text-gray-300"
                  }
                  ${!expanded && "justify-center"}
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`${isActive ? "text-white" : "text-gray-400"}`}
                  >
                    {item.icon}
                  </div>
                  {expanded && <span>{item.title}</span>}
                </div>

                {/* Badges y notificaciones */}
                {expanded && (
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="bg-gray-700 text-xs px-2 py-1 rounded">
                        {item.badge}
                      </span>
                    )}
                    {item.notification && (
                      <span className="bg-red-500 text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                        {item.notification}
                      </span>
                    )}
                  </div>
                )}

                {/* Solo mostrar badge cuando está contraído */}
                {!expanded && item.badge && (
                  <span className="absolute top-1 right-1 bg-red-500 text-xs w-4 h-4 flex items-center justify-center rounded-full animate-pulse"></span>
                )}
              </NavLink>

              {/* Submenú (solo cuando está expandido) */}
              {expanded && item.submenu && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.submenu.map((sub, subIndex) => (
                    <NavLink
                      key={subIndex}
                      to={sub.path}
                      className={`
                        block py-2 px-3 text-sm rounded transition-colors
                        ${
                          location.pathname === sub.path
                            ? "bg-blue-900/50 text-blue-300"
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                        }
                      `}
                    >
                      • {sub.title}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700 p-4">
        {expanded ? (
          <div className="space-y-3">
            <LogoutButton expanded={true} />
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">           
            <LogoutButton expanded={false} />
          </div>
        )}
      </div>
    </aside>
  );
}
