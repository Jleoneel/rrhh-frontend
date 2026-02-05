import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/Layout/MainLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import AccionesList from "./pages/Acciones/AccionesList";

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
      </Route>

      //* REDIRECCION DE ERRORES 404
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
