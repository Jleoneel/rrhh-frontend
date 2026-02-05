import { NavLink } from "react-router-dom";
import { Building2 } from "lucide-react";
import LogoutButton from "./logoutButton";
import { useAuth } from "../../auth/authContext";

export default function Sidebar() {

  const { user: Firmante } = useAuth();

  return (
    <aside className="w-70 bg-white border-r">
      
      <div className="px-6 py-4 border-b flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Building2 size={42} className="text-blue-600" />
          <div>
            <h1 className="font-bold text-xl text-gray-900">Talento humano</h1>
            <p className="text-sm text-gray-500 ">
              Bienvenido, {Firmante ? Firmante.nombre : "Usuario"}
            </p>
          </div>
        </div>
      </div>

      <nav className="px-4 space-y-2">
        <NavLink
          to="/dashboard"
          className="block px-3 py-2 rounded hover:bg-blue-50 "
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/acciones"
          className="block px-3 py-2 rounded hover:bg-blue-50"
        >
          Acción de personal
        </NavLink>

        <NavLink
          to="/configuracion"
          className="block px-3 py-2 rounded hover:bg-blue-50"
        >
          Configuración
        </NavLink>
      </nav>

      <div className="mt-auto p-4 absolute bottom-0 ">
        <LogoutButton />
      </div>
    </aside>
  );
}
