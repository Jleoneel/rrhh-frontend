import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Settings,
  ChevronLeft,
  ClipboardList,
  ChevronDown,
  Calendar,
  FileSpreadsheet,
  Umbrella,
  UserCog,
  Building2,
  BarChart3,
  FileSignature,
  Bell,
  GitBranch,
  ShieldCheck,
} from "lucide-react";
import LogoutButton from "./logoutButton";
import { useAuth } from "../../../features/auth/AuthContext";
import { useNotificacionesCtx } from "../../../features/notificaciones/context/NotificacionesContext";
import { useState, useEffect } from "react";

// Qué categoría de notificación corresponde a cada ruta del menú — mismas
// categorías que ya usa useNotificaciones() (FIRMA, RECEPCION, PERMISO,
// VACACION). Un solo mapa sirve para todas las variantes del menú (jefe,
// gerente, UATH, servidor) porque las rutas no se repiten entre ramas.
const RUTA_CATEGORIA_NOTIFICACION = {
  "/permisos/bandeja": "PERMISO",
  "/permisos/mis-permisos-jefe": "PERMISO",
  "/servidor/permisos": "PERMISO",
  "/permisos/bandeja-vacaciones": "VACACION",
  "/permisos/mis-vacaciones": "VACACION",
  "/servidor/vacaciones": "VACACION",
  "/acciones": "FIRMA",
  "/servidor/acciones": "RECEPCION",
};

// Burbuja con el conteo de notificaciones sin leer, para un ítem del menú.
// className por defecto la empuja al extremo derecho (ml-auto); se puede
// pisar cuando el badge va junto a otro elemento (ej. el chevron) en vez
// de solo.
function BadgeNotificaciones({ count, className = "ml-auto" }) {
  if (!count) return null;
  return (
    <span
      className={`${className} flex-shrink-0 min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function Sidebar() {
  const { user: Firmante } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const { notificaciones, marcarLeida } = useNotificacionesCtx();

  const contarPorRuta = (path) => {
    const categoria = RUTA_CATEGORIA_NOTIFICACION[path];
    if (!categoria) return 0;
    return notificaciones.filter((n) => n.categoria === categoria).length;
  };

  // Al entrar a una ruta que tiene notificaciones pendientes de su
  // categoría, se marcan como leídas automáticamente — así el badge
  // desaparece solo al abrir ese módulo, sin un botón aparte. No se
  // incluye marcarLeida en las dependencias a propósito: se redefine en
  // cada render del hook y no hace falta reaccionar a eso, solo a que
  // cambie la ruta o la lista de notificaciones.
  useEffect(() => {
    const categoria = RUTA_CATEGORIA_NOTIFICACION[location.pathname];
    if (!categoria) return;
    const pendientes = notificaciones.filter((n) => n.categoria === categoria);
    pendientes.forEach((n) => marcarLeida(n));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, notificaciones]);

  const isSubmenuActive = (submenu) =>
    submenu?.some((sub) => location.pathname === sub.path);

  const tipoUsuario = Firmante?.tipo_usuario || "FIRMANTE";
  const cargoNombre = Firmante?.cargo_nombre || "";
  const esAdmin = Firmante?.es_admin === true;
  const puedeVerUsuarios = esAdmin;
  const es_jefe = Firmante?.es_jefe || false;
  const esJefeArea = cargoNombre === "JEFE DE AREA";
  const esGerente = cargoNombre === "GERENTE HOSPITALARIO ENCARGADO";
  const esResponsableUATH = cargoNombre === "RESPONSABLE DE LA UATH";
  const esAsistenteUATH = [
    "ASISTENTE DE LA UATH",
    "TRABAJADORA SOCIAL INSTITUCIONAL",
    "ANALISTA DE TALENTO HUMANO",
  ].includes(cargoNombre);

  const menuItems =
    tipoUsuario === "SERVIDOR"
      ? [
          {
            title: "Mis Permisos",
            path: "/servidor/permisos",
            icon: <ClipboardList size={20} />,
          },
          {
            title: "Mis Vacaciones",
            path: "/servidor/vacaciones",
            icon: <Umbrella size={20} />,
          },
          {
            title: "Mis Acciones de Personal",
            path: "/servidor/acciones",
            icon: <FileSignature size={20} />,
          },
          {
            title: "Configuración",
            icon: <Settings size={20} />,
            submenu: [
              {
                title: "Mi Certificado",
                path: "/permisos/mi-certificado",
                icon: <ShieldCheck size={16} />,
              },
            ],
          },
        ]
      : esJefeArea
        ? [
            {
              title: "Bandeja Permisos",
              path: "/permisos/bandeja",
              icon: <Bell size={20} />,
            },
            {
              title: "Mis Permisos",
              path: "/permisos/mis-permisos-jefe",
              icon: <ClipboardList size={20} />,
            },
            {
              title: "Bandeja Vacaciones",
              path: "/permisos/bandeja-vacaciones",
              icon: <Umbrella size={20} />,
            },
            {
              title: "Mis Vacaciones",
              path: "/permisos/mis-vacaciones",
              icon: <Calendar size={20} />,
            },
            {
              title: "Mis Acciones de Personal",
              path: "/servidor/acciones",
              icon: <FileSignature size={20} />,
            },
            {
              title: "Configuración",
              icon: <Settings size={20} />,
              submenu: [
                {
                  title: "Mi Certificado",
                  path: "/permisos/mi-certificado",
                  icon: <ShieldCheck size={16} />,
                },
              ],
            },
          ]
        : esGerente
          ? [
              {
                title: "Dashboard",
                path: "/dashboard",
                icon: <LayoutDashboard size={20} />,
              },
              {
                title: "Acciones de Personal",
                icon: <FileSignature size={20} />,
                submenu: [
                  {
                    title: "Lista de Acciones",
                    path: "/acciones",
                    icon: <FileText size={16} />,
                  },
                  {
                    title: "Mis Acciones de Personal",
                    path: "/servidor/acciones",
                    icon: <FileSignature size={16} />,
                  },
                ],
              },
              {
                title: "Permisos",
                icon: <GitBranch size={20} />,
                submenu: [
                  {
                    title: "Bandeja de Aprobación",
                    path: "/permisos/bandeja",
                    icon: <Bell size={16} />,
                  },
                  {
                    title: "Mis Permisos",
                    path: "/permisos/mis-permisos-jefe",
                    icon: <ClipboardList size={16} />,
                  },
                  {
                    title: "Bandeja Vacaciones",
                    path: "/permisos/bandeja-vacaciones",
                    icon: <Umbrella size={16} />,
                  },
                  {
                    title: "Mis Vacaciones",
                    path: "/permisos/mis-vacaciones",
                    icon: <Calendar size={16} />,
                  },
                ],
              },
              {
                title: "Configuración",
                icon: <Settings size={20} />,
                submenu: [
                  {
                    title: "Mi Certificado",
                    path: "/permisos/mi-certificado",
                    icon: <ShieldCheck size={16} />,
                  },
                ],
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
                icon: <FileSignature size={20} />,
                submenu: [
                  {
                    title: "Lista de Acciones",
                    path: "/acciones",
                    icon: <FileText size={16} />,
                  },
                  {
                    title: "Mis Acciones de Personal",
                    path: "/servidor/acciones",
                    icon: <FileSignature size={16} />,
                  },
                ],
              },
              {
                title: "Permisos",
                icon: <GitBranch size={20} />,
                submenu: [
                  // Gestión solo para UATH y Admin
                  ...(esAsistenteUATH || esResponsableUATH || esAdmin
                    ? [
                        {
                          title: "Gestión Permisos",
                          path: "/permisos/gestion",
                          icon: <Settings size={16} />,
                        },
                        {
                          title: "Jefes por Unidad",
                          path: "/permisos/jefes",
                          icon: <Building2 size={16} />,
                        },
                        {
                          title: "Reporte Permisos",
                          path: "/permisos/reporte",
                          icon: <BarChart3 size={16} />,
                        },
                      ]
                    : []),
                  {
                    title: "Mis Permisos",
                    path: "/permisos/mis-permisos-jefe",
                    icon: <ClipboardList size={16} />,
                  },
                  // Reporte vacaciones para todos
                  {
                    title: "Reporte Vacaciones",
                    path: "/permisos/reporte-vacaciones",
                    icon: <BarChart3 size={16} />,
                  },
                  {
                    title: "Mis Vacaciones",
                    path: "/permisos/mis-vacaciones",
                    icon: <Calendar size={16} />,
                  },
                  // Bandeja vacaciones solo Responsable UATH y Admin
                  ...(esResponsableUATH || esAdmin
                    ? [
                        {
                          title: "Bandeja Vacaciones",
                          path: "/permisos/bandeja-vacaciones",
                          icon: <Umbrella size={16} />,
                        },
                      ]
                    : []),
                  // Bandeja permisos para jefes y para el admin
                  ...(es_jefe || esAdmin
                    ? [
                        {
                          title: "Bandeja de Aprobación",
                          path: "/permisos/bandeja",
                          icon: <Bell size={16} />,
                        },
                      ]
                    : []),
                ],
              },
              {
                title: "Configuración",
                icon: <Settings size={20} />,
                submenu: [
                  {
                    title: "Adjuntar Distributivo",
                    path: "/AdjuntarDistributivo",
                    icon: <FileSpreadsheet size={16} />,
                  },
                  {
                    title: "Mi Certificado",
                    path: "/permisos/mi-certificado",
                    icon: <ShieldCheck size={16} />,
                  },
                  ...(puedeVerUsuarios || esAsistenteUATH
                    ? [
                        {
                          title: "Usuarios UATH",
                          path: "/GestionUsuarios",
                          icon: <UserCog size={16} />,
                        },
                      ]
                    : []),
                ],
              },
            ];

  return (
    <aside
      className={`bg-linear-to-b from-gray-900 to-gray-800 text-white h-screen flex flex-col transition-all duration-300 shadow-xl ${expanded ? "w-64" : "w-20"}`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
        <div
          className={`flex items-center gap-3 ${!expanded && "justify-center w-full"}`}
        >
          <img
            src="/msp2.png"
            alt="Logo"
            className={`${expanded ? "w-10 h-10" : "w-8 h-8"} object-contain`}
          />
          {expanded && (
            <div className="flex-1">
              <h1 className="font-bold text-lg tracking-tight">
                Talento Humano
              </h1>
              <p className="text-xs text-gray-400">
                {tipoUsuario === "SERVIDOR"
                  ? "Portal Servidor"
                  : esJefeArea
                    ? "Portal Jefe de Área"
                    : esGerente
                      ? "Gerencia Hospitalaria"
                      : "Panel UATH"}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 hover:bg-gray-700/70 rounded-lg transition-all duration-200"
        >
          <ChevronLeft
            size={18}
            className={`transition-transform duration-200 ${expanded ? "" : "rotate-180"}`}
          />
        </button>
      </div>

      {/* Menú */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => {
          // Item sin submenu
          if (!item.submenu) {
            const isActive = location.pathname === item.path;
            const count = contarPorRuta(item.path);
            return (
              <NavLink
                key={index}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20"
                      : "hover:bg-gray-700/70 text-gray-300"
                  }
                  ${!expanded && "justify-center"}`}
              >
                <span
                  className={`relative ${isActive ? "text-white" : "text-gray-400"} transition-colors`}
                >
                  {item.icon}
                  {!expanded && count > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-gray-900" />
                  )}
                </span>
                {expanded && (
                  <span className="text-sm font-medium">{item.title}</span>
                )}
                {expanded && <BadgeNotificaciones count={count} />}
                {expanded && isActive && count === 0 && (
                  <div className="ml-auto w-1.5 h-8 rounded-full bg-white/50" />
                )}
              </NavLink>
            );
          }

          // Item con submenu
          const isOpen = openMenus[item.title] ?? isSubmenuActive(item.submenu);
          const isGroupActive = isSubmenuActive(item.submenu);
          const countGrupo = item.submenu.reduce(
            (acc, sub) => acc + contarPorRuta(sub.path),
            0,
          );

          return (
            <div key={index} className="space-y-1">
              <button
                onClick={() => expanded && toggleMenu(item.title)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200
                  ${
                    isGroupActive
                      ? "bg-gray-700/80 text-white"
                      : "hover:bg-gray-700/70 text-gray-300"
                  }
                  ${!expanded && "justify-center"}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`relative ${isGroupActive ? "text-blue-400" : "text-gray-400"}`}
                  >
                    {item.icon}
                    {!expanded && countGrupo > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-gray-900" />
                    )}
                  </span>
                  {expanded && (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </div>
                {expanded && (
                  <div className="flex items-center gap-2">
                    <BadgeNotificaciones count={countGrupo} className="" />
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                )}
              </button>

              {expanded && isOpen && (
                <div className="ml-6 space-y-1 border-l-2 border-gray-700/50 pl-3">
                  {item.submenu.map((sub, subIndex) => {
                    const isSubActive = location.pathname === sub.path;
                    const countSub = contarPorRuta(sub.path);
                    return (
                      <NavLink
                        key={subIndex}
                        to={sub.path}
                        className={`flex items-center gap-3 py-2.5 px-3 text-sm rounded-lg transition-all duration-200
                          ${
                            isSubActive
                              ? "bg-blue-600/20 text-blue-300 font-medium"
                              : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                          }`}
                      >
                        <span
                          className={
                            isSubActive ? "text-blue-400" : "text-gray-500"
                          }
                        >
                          {sub.icon || (
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                          )}
                        </span>
                        <span className="flex-1">{sub.title}</span>
                        <BadgeNotificaciones count={countSub} />
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
      <div className="border-t border-gray-700/50 p-4">
        {expanded ? (
          <LogoutButton expanded={true} />
        ) : (
          <div className="flex justify-center">
            <LogoutButton expanded={false} />
          </div>
        )}
      </div>
    </aside>
  );
}
