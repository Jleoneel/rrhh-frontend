import { LogOut } from "lucide-react";
import { useAuth } from "../../auth/authContext";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function LogoutButton({ expanded = true }) {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    const result = await MySwal.fire({
      title: <span className="text-xl font-bold">¿Cerrar sesión?</span>,
      html: (
        <div className="text-center">
          <p className="mb-2">Vas a salir del sistema de Talento Humano</p>
          {user && (
            <p className="text-sm text-gray-400">
              Usuario: <span className="font-semibold">{user.nombre}</span>
            </p>
          )}
        </div>
      ),
      icon: "question",
      iconColor: "#3b82f6",
      showCancelButton: true,
      confirmButtonText: (
        <div className="flex items-center gap-2">
          <LogOut size={16} />
          <span>Sí, salir</span>
        </div>
      ),
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      background: "#1f2937",
      color: "#f9fafb",
      showClass: {
        popup: "animate__animated animate__fadeInDown animate__faster"
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp animate__faster"
      },
      buttonsStyling: true,
      reverseButtons: true,
      customClass: {
        confirmButton: "rounded-lg px-6 py-2 font-medium",
        cancelButton: "rounded-lg px-6 py-2 font-medium",
        popup: "rounded-xl border border-gray-700"
      }
    });

    if (result.isConfirmed) {
      // Mostrar loading antes de cerrar
      MySwal.fire({
        title: "Cerrando sesión...",
        text: "Por favor espera",
        allowOutsideClick: false,
        didOpen: () => {
          MySwal.showLoading();
        }
      });
      
      // Pequeño delay para mejor UX
      setTimeout(() => {
        logout();
        MySwal.close();
      }, 800);
    }
  };

  // Estilo diferente si está contraído
  if (!expanded) {
    return (
      <button
        onClick={handleLogout}
        className="relative p-3 bg-gradient-to-br from-red-500/20 to-red-600/10 hover:from-red-500/30 hover:to-red-600/20 text-red-300 hover:text-white rounded-xl transition-all duration-300 hover:scale-105 group"
        title="Cerrar sesión"
      >
        <LogOut size={20} />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
          !
        </div>
      </button>
    );
  }

  // Estilo expandido
  return (
    <button
      onClick={handleLogout}
      className="relative w-full flex items-center justify-between p-3 bg-gradient-to-r from-red-500/10 via-red-600/5 to-transparent hover:from-red-500/20 hover:via-red-600/10 hover:to-transparent text-red-300 hover:text-white rounded-xl transition-all duration-300 group overflow-hidden"
    >
      {/* Efecto de fondo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
        </div>
        <div className="text-left">
          <span className="font-medium block">Cerrar sesión</span>
          <span className="text-xs text-gray-400 block">Salir del sistema</span>
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="px-3 py-1 bg-red-500/20 rounded-full text-xs font-medium group-hover:bg-red-500/30 transition-colors">
          Salir
        </div>
      </div>
    </button>
  );
}