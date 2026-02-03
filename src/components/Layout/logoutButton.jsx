// components/Sidebar/LogoutButton.jsx
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../auth/authContext";

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="
        flex items-center gap-2
        text-red-400 hover:text-red-500
        px-4 py-2 rounded-lg
        hover:bg-red-500/10
        transition
      "
    >
      <LogOut size={18} />
      <span>Cerrar sesión</span>
    </button>
  );
}
