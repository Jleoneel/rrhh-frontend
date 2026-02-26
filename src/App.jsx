import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/Layout/MainLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import AccionesList from "./pages/Acciones/AccionesList";
import GestionUsuarios from "./components/usuarios/GestionFirmantes";
import Distributivo from "./pages/Distributivo";

export default function App() {
  return (
    <Routes>

      {/* RUTA PÚBLICA */}
      <Route path="/login" element={<Login />} />

      {/* RUTAS PROTEGIDAS */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/acciones" element={<AccionesList />} />
        <Route path="/GestionUsuarios" element={<GestionUsuarios />} />
        <Route path="/configuracion/perfil" element={<Distributivo />} />
      </Route>

      //* REDIRECCION DE ERRORES 404
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
