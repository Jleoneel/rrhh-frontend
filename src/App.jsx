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
        <Route path="/permisos/mis-permisos-jefe" element={<PermisosFirmante />}/>
        <Route path="/permisos/jefes" element={<GestionJefes />} />
        <Route path="/permisos/reporte" element={<ReportePermisos />} />

      </Route>

      {/* RUTAS SERVIDORES */}
      <Route
        element={
          <ProtectedRoute soloServidor>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        { <Route path="/servidor/permisos" element={<PermisosServidor />} /> }
      </Route>

      {/* RUTAS JEFE DE ÁREA — también son firmantes */}
      {/* Las rutas de jefe van dentro del bloque soloFirmante
          y se controlan por cargo_nombre en el componente */}

      {/* Redirección según tipo de usuario */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}