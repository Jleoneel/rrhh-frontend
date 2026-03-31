import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, soloFirmante = false, soloServidor = false }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const tipoUsuario = user?.tipo_usuario || "FIRMANTE";

  // Ruta exclusiva para firmantes UATH/Jefes
  if (soloFirmante && tipoUsuario !== "FIRMANTE") {
    return <Navigate to="/servidor/permisos" replace />;
  }

  // Ruta exclusiva para servidores
  if (soloServidor && tipoUsuario !== "SERVIDOR") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;