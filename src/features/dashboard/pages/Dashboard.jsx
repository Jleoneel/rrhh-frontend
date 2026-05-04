import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import dashboardAPI from "../hooks/dashboard";
import StatCard from "../components/StatCard";
import GraficoEstado from "../components/GraficoEstado";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiXCircle,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";

export default function Dashboard() {
  const { setHeaderConfig } = useOutletContext();

  useEffect(() => {
    setHeaderConfig({
      title: "Dashboard",
      showNewAction: false,
      onNewAction: null,
    });
  }, [setHeaderConfig]);

  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousResumen, setPreviousResumen] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resumenData] = await Promise.all([
          dashboardAPI.getAccionesResumen(),
        ]);
        
        // Guardar datos anteriores para calcular tendencias
        if (resumen) {
          setPreviousResumen(resumen);
        }
        setResumen(resumenData);
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Calcular tendencias entre períodos
  const getTrend = (current, previous) => {
    if (!previous) return { direction: "neutral", value: 0 };
    const diff = current - previous;
    const percent = previous !== 0 ? (diff / previous) * 100 : 0;
    return {
      direction: diff > 0 ? "up" : diff < 0 ? "down" : "neutral",
      value: Math.abs(percent).toFixed(1),
    };
  };

  const tendenciaTotal = previousResumen 
    ? getTrend(resumen?.total || 0, previousResumen.total) 
    : null;
  const tendenciaAprobadas = previousResumen 
    ? getTrend(resumen?.aprobadas || 0, previousResumen.aprobadas) 
    : null;

  const porcentajeAprobadas = resumen?.total > 0
    ? Math.round((resumen.aprobadas / resumen.total) * 100)
    : 0;

  const porcentajeBorrador = resumen?.total > 0
    ? Math.round((resumen.borrador / resumen.total) * 100)
    : 0;

  const porcentajeRechazadas = resumen?.total > 0
    ? Math.round((resumen.rechazadas / resumen.total) * 100)
    : 0;

  const alertas = [];
  if (resumen?.en_revision > 5) {
    alertas.push(`${resumen.en_revision} acciones requieren revisión urgente`);
  }
  if (resumen?.borrador > 10) {
    alertas.push(`${resumen.borrador} borradores pendientes por completar`);
  }
  if (resumen?.rechazadas > 3) {
    alertas.push(`${resumen.rechazadas} acciones fueron insubsistentes`);
  }

  // Datos para el gráfico de tendencias
  const datosTendencia = useMemo(() => {
    if (!resumen) return null;
    return {
      labels: ["Borrador", "En Revisión", "Aprobadas", "Insubsistentes"],
      values: [resumen.borrador, resumen.en_revision, resumen.aprobadas, resumen.rechazadas],
      colors: ["#eab308", "#f97316", "#22c55e", "#ef4444"],
    };
  }, [resumen]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
          <p className="text-sm text-gray-400 mt-1">Obteniendo información actualizada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-200">
              <FiFileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Dashboard de Acciones de Personal
              </h1>
              <p className="text-gray-500 mt-1">
                Resumen general del estado de las solicitudes
                {resumen?.ultimaActualizacion && (
                  <span className="text-sm text-gray-400 ml-2">
                    • Última actualización:{" "}
                    {new Date(resumen.ultimaActualizacion).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 rounded-xl shadow-sm">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FiAlertCircle className="text-amber-600" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">
                    Acciones requeridas
                  </h3>
                  <ul className="text-sm text-amber-700 mt-2 space-y-1">
                    {alertas.map((alerta, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {alerta}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <StatCard
            title="Total Solicitudes"
            value={resumen?.total || 0}
            icon={<FiFileText size={22} />}
            color="blue"
            description="Total de acciones registradas"
            trend={tendenciaTotal?.direction}
            trendValue={tendenciaTotal?.value ? `${tendenciaTotal.value}%` : null}
          />
          <StatCard
            title="Borrador"
            value={resumen?.borrador || 0}
            icon={<FiClock size={22} />}
            color="yellow"
            description={`${porcentajeBorrador}% del total · Pendientes de envío`}
          />
          <StatCard
            title="En Revisión"
            value={resumen?.en_revision || 0}
            icon={<FiAlertCircle size={22} />}
            color="orange"
            description={`${resumen?.en_revision === 0 ? "Sin pendientes" : "Requieren atención inmediata"}`}
          />
          <StatCard
            title="Aprobadas"
            value={resumen?.aprobadas || 0}
            icon={<FiCheckCircle size={22} />}
            color="green"
            description={`${porcentajeAprobadas}% tasa de aprobación`}
            trend={tendenciaAprobadas?.direction}
            trendValue={tendenciaAprobadas?.value ? `${tendenciaAprobadas.value}%` : null}
          />
          <StatCard
            title="Insubsistentes"
            value={resumen?.rechazadas || 0}
            icon={<FiXCircle size={22} />}
            color="red"
            description={`${porcentajeRechazadas}% del total · Requieren revisión`}
          />
        </div>

        {/* Gráficos y visualizaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico de distribución por estado */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Distribución por Estado
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Visualización del flujo de acciones
                </p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <FiTrendingUp className="text-gray-500" size={18} />
              </div>
            </div>
            {datosTendencia && (
              <GraficoEstado data={resumen} />
            )}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Análisis:</span>{" "}
                {resumen?.borrador > resumen?.aprobadas + resumen?.en_revision
                  ? "Hay una alta cantidad de borradores pendientes. Se recomienda completar y enviar a revisión."
                  : resumen?.en_revision > 5
                  ? "Existen varias acciones en revisión que requieren atención prioritaria."
                  : "El flujo de aprobación se encuentra dentro de parámetros normales."}
              </p>
            </div>
          </div>

          {/* Resumen ejecutivo */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiTrendingUp className="text-blue-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Resumen Ejecutivo
              </h2>
            </div>

            <div className="space-y-4">
              {/* Indicador de productividad */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-1">Productividad</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {porcentajeAprobadas}%
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  de las acciones han sido procesadas
                </p>
                <div className="mt-3 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${porcentajeAprobadas}%` }}
                  />
                </div>
              </div>

              {/* Indicador de eficiencia */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-1">Eficiencia</h3>
                <p className="text-sm text-green-700">
                  {resumen?.en_revision === 0
                    ? "✅ Sin acciones pendientes de revisión"
                    : `⏳ ${resumen.en_revision} acciones en proceso de revisión`}
                </p>
                {resumen?.en_revision > 0 && (
                  <div className="mt-2 text-xs text-green-600">
                    Tiempo estimado de respuesta: <strong>24-48 horas</strong>
                  </div>
                )}
              </div>

              {/* Indicador de calidad */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <h3 className="font-semibold text-purple-800 mb-1">Calidad</h3>
                <p className="text-sm text-purple-700">
                  {porcentajeRechazadas < 10
                    ? "✅ Índice de insubsistencias bajo"
                    : "⚠️ Alto índice de insubsistencias. Revisar criterios de aprobación"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}