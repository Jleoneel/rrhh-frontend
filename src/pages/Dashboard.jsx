import { useEffect, useState } from "react";
import { getAccionesResumen } from "../api/dashboard";
import StatCard from "../components/dashboard/StatCard";

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const data = await getAccionesResumen();
        setResumen(data);
      } catch (error) {
        console.error("Error cargando dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumen();
  }, []);

  if (loading) return <p className="p-6">Cargando dashboard...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Dashboard de Acciones de Personal
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total" value={resumen.total} />
        <StatCard title="Borrador" value={resumen.borrador} />
        <StatCard title="En revisión" value={resumen.en_revision} />
        <StatCard title="Aprobadas" value={resumen.aprobadas} />
        <StatCard title="Rechazadas" value={resumen.rechazadas} />
      </div>
    </div>
  );
}
