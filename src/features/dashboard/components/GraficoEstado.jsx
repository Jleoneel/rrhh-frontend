import { useState, useEffect } from "react";

export default function GraficoEstadoDonut({ data }) {
  const total = Number(data.total) || 0;
  const borrador = Number(data.borrador) || 0;
  const en_revision = Number(data.en_revision) || 0;
  const aprobadas = Number(data.aprobadas) || 0;
  const rechazadas = Number(data.rechazadas) || 0;
  
  const [animacion, setAnimacion] = useState(false);

  // setTimeout para evitar el setState síncrono
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimacion(true);
    }, 100); 
    
    return () => clearTimeout(timer);
  }, [data]);

  const estados = [
    { nombre: "Borrador", valor: borrador, color: "#F59E0B" },
    { nombre: "En revisión", valor: en_revision, color: "#F97316" },
    { nombre: "Aprobadas", valor: aprobadas, color: "#10B981" },
    { nombre: "Rechazadas", valor: rechazadas, color: "#EF4444" },
  ];

  const radio = 80;
  const circunferencia = 2 * Math.PI * radio;
  let offsetAcumulado = 0;

  return (
    <div
      className="transition-all duration-1000"
      style={{
        transform: animacion ? "scale(1)" : "scale(0.95)",
        opacity: animacion ? 1 : 0,
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Donut Chart */}
        <div className="relative w-48 h-48">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r={radio}
              fill="transparent"
              stroke="#E5E7EB"
              strokeWidth="20"
            />

            {estados.map((estado, index) => {
              const porcentaje = total > 0 ? (estado.valor / total) * 100 : 0;
              const longitud = (porcentaje / 100) * circunferencia;
              const offset = offsetAcumulado;
              offsetAcumulado += longitud;

              return (
                <circle
                  key={index}
                  cx="100"
                  cy="100"
                  r={radio}
                  fill="transparent"
                  stroke={estado.color}
                  strokeWidth="20"
                  strokeDasharray={`${longitud} ${circunferencia}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              );
            })}

            {/* Texto en el centro */}
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className="text-2xl font-bold fill-gray-800"
            >
              {total}
            </text>
            <text
              x="100"
              y="115"
              textAnchor="middle"
              className="text-sm fill-gray-500"
            >
              Total
            </text>
          </svg>
        </div>

        {/* Leyenda */}
        <div className="flex-1 space-y-3">
          {estados.map((estado, index) => {
            const porcentaje = total > 0 ? (estado.valor / total) * 100 : 0;

            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: estado.color }}
                  />
                  <span className="font-medium text-gray-700">
                    {estado.nombre}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold">{estado.valor}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({Math.round(porcentaje)}%)
                  </span>
                </div>
              </div>
            );
          })}

          {/* Estadísticas adicionales*/}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Procesadas:</span>
              <span className="font-medium">
                {aprobadas + rechazadas} de {total}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-600">Pendientes:</span>
              <span className="font-medium text-amber-600">
                {borrador + en_revision}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}