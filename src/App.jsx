import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./features/auth/pages/Login";
import Dashboard from "./features/dashboard/pages/Dashboard";
import MainLayout from "./shared/components/Layout/MainLayout";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import AccionesList from "./features/acciones/pages/AccionesList";
import GestionUsuarios from "./features/firmantes/components/GestionFirmantes";
import Distributivo from "./features/distributivo/pages/Distributivo";
import PermisosServidor from "./features/permisos/pages/PermisosServidor";
import GestionPermisos from "./features/permisos/pages/GestionPermisos";
import PermisosFirmante from "./features/permisos/pages/PermisosFirmante";
import BandejaJefe from "./features/permisos/pages/BandejaJefe";
import GestionJefes from "./features/permisos/pages/GestionJefes";
import ReportePermisos from "./features/permisos/pages/ReportePermisos";
import VacacionesServidor from "./features/permisos/pages/VacacionesServidor";
import BandejaVacaciones from "./features/permisos/pages/BandejaVacaciones";
import ReporteVacaciones from "./features/permisos/pages/ReporteVacaciones";
import VacacionesFirmante from "./features/permisos/pages/VacacionesFirmante";


export default function App() {
  return (
    <Routes>
      {/* RUTA PÚBLICA */}
      <Route path="/login" element={<Login />} />

      {/* RUTAS FIRMANTES — Personal UATH */}
      <Route
        element={
          <ProtectedRoute soloFirmante>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/acciones" element={<AccionesList />} />
        <Route path="/GestionUsuarios" element={<GestionUsuarios />} />
        <Route path="/AdjuntarDistributivo" element={<Distributivo />} />
        {<Route path="/permisos/gestion" element={<GestionPermisos />} />}
        <Route path="/permisos/bandeja" element={<BandejaJefe />} />
        <Route path="/permisos/mis-permisos-jefe" element={<PermisosFirmante />} />
        <Route path="/permisos/jefes" element={<GestionJefes />} />
        <Route path="/permisos/reporte" element={<ReportePermisos />} />
        <Route path="/permisos/bandeja-vacaciones" element={<BandejaVacaciones />} />
        <Route path="/permisos/reporte-vacaciones" element={<ReporteVacaciones />} />
        <Route path="/permisos/mis-vacaciones" element={<VacacionesFirmante />} />

      </Route>

      {/* RUTAS SERVIDORES */}
      <Route
        element={
          <ProtectedRoute soloServidor>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {<Route path="/servidor/permisos" element={<PermisosServidor />} />}
        <Route path="/servidor/vacaciones" element={<VacacionesServidor />} />

      </Route>

      {/* Redirección según tipo de usuario */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
