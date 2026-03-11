import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Dashboard from "./features/dashboard/pages/Dashboard";
import MainLayout from "./shared/components/Layout/MainLayout";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import AccionesList from "./features/acciones/pages/AccionesList";
import GestionUsuarios from "./features/firmantes/components/GestionFirmantes";
import Distributivo from "./features/distributivo/pages/Distributivo";

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
        <Route path="/AdjuntarDistributivo" element={<Distributivo />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}