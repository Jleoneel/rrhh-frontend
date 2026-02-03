import { NavLink } from "react-router-dom";
import LogoutButton from "./logoutButton";
export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-6 font-semibold text-lg">
        Talento humano
      </div>

      <nav className="px-4 space-y-2">
        <NavLink
          to="/dashboard"
          className="block px-3 py-2 rounded hover:bg-blue-50"
        >
          Acciones de personal
        </NavLink>

        <NavLink
          to="/servidores"
          className="block px-3 py-2 rounded hover:bg-blue-50"
        >
          Servidores
        </NavLink>

        <NavLink
          to="/configuracion"
          className="block px-3 py-2 rounded hover:bg-blue-50"
        >
          Configuración
        </NavLink>
      </nav>
      
      <div className="mt-auto p-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
