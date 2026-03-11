import { useEffect, useState } from "react";
import dashboardAPI from "../hooks/dashboard";
import StatCard from "../components/StatCard";
import GraficoEstado from "../components/GraficoEstado";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiXCircle,
} from "react-icons/fi";


export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);


  // Y en el useEffect:
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resumenData] = await Promise.all([
          dashboardAPI.getAccionesResumen(),
        ]);
        setResumen(resumenData);
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const porcentajeAprobadas =
    resumen.total > 0
      ? Math.round((resumen.aprobadas / resumen.total) * 100)
      : 0;

  const alertas = [];
  if (resumen.en_revision > 5) {
    alertas.push(`${resumen.en_revision} acciones requieren revisión urgente`);
  }
  if (resumen.borrador > 10) {
    alertas.push(`${resumen.borrador} borradores pendientes`);
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard de Acciones de Personal
        </h1>
        <p className="text-gray-600">
          Resumen general del estado de las solicitudes
          {resumen.ultimaActualizacion && (
            <span className="text-sm text-gray-500 ml-2">
              • Actualizado:{" "}
              {new Date(resumen.ultimaActualizacion).toLocaleDateString()}
            </span>
          )}
        </p>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r">
          <div className="flex items-center">
            <FiAlertCircle className="text-yellow-500 mr-3" size={20} />
            <div>
              <h3 className="font-medium text-yellow-800">
                Acciones requeridas
              </h3>
              <ul className="text-sm text-yellow-700 mt-1">
                {alertas.map((alerta, idx) => (
                  <li key={idx}>• {alerta}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total"
          value={resumen.total}
          icon={<FiFileText />}
          trend={resumen.total > 0 ? "positive" : "neutral"}
          description="Total de solicitudes"
        />
        <StatCard
          title="Borrador"
          value={resumen.borrador}
          icon={<FiClock />}
          color="yellow"
          description={`${Math.round((resumen.borrador / resumen.total) * 100)}% del total`}
        />
        <StatCard
          title="En revisión"
          value={resumen.en_revision}
          icon={<FiAlertCircle />}
          color="orange"
          description="Requieren atención"
        />
        <StatCard
          title="Aprobadas"
          value={resumen.aprobadas}
          icon={<FiCheckCircle />}
          color="green"
          description={`${porcentajeAprobadas}% tasa de aprobación`}
        />
        <StatCard
          title="Rechazadas"
          value={resumen.rechazadas}
          icon={<FiXCircle />}
          color="red"
          description={`${Math.round((resumen.rechazadas / resumen.total) * 100)}% del total`}
        />
      </div>

      {/* Gráficos y visualizaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        {/* Gráfico de distribución por estado */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300">
          <h2 className="text-xl font-semibold mb-4">
            Distribución por Estado
          </h2>
          <GraficoEstado data={resumen} />
          <div className="mt-4 text-sm text-gray-600">
            <p>
              La mayoría de las acciones se encuentran en estado{" "}
              <strong>Borrador</strong>.
            </p>
            {resumen.aprobadas === 0 && (
              <p className="text-orange-600 mt-1">
                No hay acciones aprobadas aún.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-300">
        <h2 className="text-xl font-semibold mb-4">Resumen Ejecutivo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-1">Productividad</h3>
            <p className="text-sm text-blue-700">
              {porcentajeAprobadas}% de las acciones han sido procesadas.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-1">Velocidad</h3>
            <p className="text-sm text-green-700">
              {resumen.en_revision === 0
                ? "Sin pendientes"
                : `${resumen.en_revision} en revisión`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
