import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, Settings, ChevronLeft,ClipboardList, ChevronDown, ClipboardCheck,} from "lucide-react";
import LogoutButton from "./logoutButton";
import { useAuth } from "../../../features/auth/AuthContext";
import { useState } from "react";

export default function Sidebar() {
  const { user: Firmante } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const [openMenus, setOpenMenus] = useState({});

  const tipoUsuario = Firmante?.tipo_usuario || "FIRMANTE";
  const cargoNombre = Firmante?.cargo_nombre || "";
  const puedeVerUsuarios = cargoNombre === "ADMINISTRADOR DEL SISTEMA";
  const es_jefe = Firmante?.es_jefe || false;

  const toggleMenu = (title) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isSubmenuActive = (submenu) =>
    submenu?.some(sub => location.pathname === sub.path);

  const menuItems = tipoUsuario === "SERVIDOR"
    ? [
        {
          title: "Mis Permisos",
          path: "/servidor/permisos",
          icon: <ClipboardList size={20} />,
        },
      ]
    : [
        {
          title: "Dashboard",
          path: "/dashboard",
          icon: <LayoutDashboard size={20} />,
        },
        {
          title: "Acciones de Personal",
          icon: <FileText size={20} />,
          submenu: [
            { title: "Lista de Acciones", path: "/acciones" },
          ],
        },
        {
          title: "Permisos",
          icon: <ClipboardCheck size={20} />,
          submenu: [
            { title: "Gestión Permisos", path: "/permisos/gestion" },
            { title: "Jefes por Unidad", path: "/permisos/jefes" },
            ...(es_jefe ? [
              { title: "Bandeja de Aprobación", path: "/permisos/bandeja" },
              { title: "Mis Permisos", path: "/permisos/mis-permisos-jefe" },
            ] : []),
          ],
        },
        {
          title: "Configuración",
          icon: <Settings size={20} />,
          submenu: [
            { title: "Adjuntar Distributivo", path: "/AdjuntarDistributivo" },
            ...(puedeVerUsuarios ? [
              { title: "Usuarios UATH", path: "/GestionUsuarios" },
            ] : []),
          ],
        },
      ];

  return (
    <aside className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen flex flex-col transition-all duration-300 ${expanded ? "w-64" : "w-20"}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className={`flex items-center gap-3 ${!expanded && "justify-center"}`}>
          <img src="/msp2.png" alt="Logo" className={`${expanded ? "w-10 h-10" : "w-5 h-5"} object-contain`} />
          {expanded && (
            <div>
              <h1 className="font-bold text-lg">Talento Humano</h1>
              <p className="text-xs text-gray-400">
                {tipoUsuario === "SERVIDOR" ? "Portal Servidor" : "Panel UATH"}
              </p>
            </div>
          )}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-gray-700 rounded-md">
          <ChevronLeft className={`transition-transform ${expanded ? "" : "rotate-180"}`} />
        </button>
      </div>

      {/* Menú */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          // Item sin submenu
          if (!item.submenu) {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all
                  ${isActive ? "bg-blue-600 text-white shadow-lg" : "hover:bg-gray-700 text-gray-300"}
                  ${!expanded && "justify-center"}`}
              >
                <span className={isActive ? "text-white" : "text-gray-400"}>{item.icon}</span>
                {expanded && <span>{item.title}</span>}
              </NavLink>
            );
          }

          // Item con submenu
          const isOpen = openMenus[item.title] ?? isSubmenuActive(item.submenu);
          const isGroupActive = isSubmenuActive(item.submenu);

          return (
            <div key={index}>
              <button
                onClick={() => expanded && toggleMenu(item.title)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all
                  ${isGroupActive ? "bg-gray-700/80 text-white" : "hover:bg-gray-700 text-gray-300"}
                  ${!expanded && "justify-center"}`}
              >
                <div className="flex items-center gap-3">
                  <span className={isGroupActive ? "text-blue-400" : "text-gray-400"}>{item.icon}</span>
                  {expanded && <span className="font-medium">{item.title}</span>}
                </div>
                {expanded && (
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                )}
              </button>

              {expanded && isOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-3">
                  {item.submenu.map((sub, subIndex) => {
                    const isSubActive = location.pathname === sub.path;
                    return (
                      <NavLink
                        key={subIndex}
                        to={sub.path}
                        className={`flex items-center gap-2 py-2 px-3 text-sm rounded-lg transition-colors
                          ${isSubActive
                            ? "bg-blue-600/20 text-blue-300 font-medium"
                            : "text-gray-400 hover:text-white hover:bg-gray-700/50"}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSubActive ? "bg-blue-400" : "bg-gray-600"}`} />
                        {sub.title}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-700 p-4">
        {expanded
          ? <LogoutButton expanded={true} />
          : <div className="flex justify-center"><LogoutButton expanded={false} /></div>
        }
      </div>
    </aside>
  );
}