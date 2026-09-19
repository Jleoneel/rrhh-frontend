const COLORS = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  yellow: "from-yellow-500 to-yellow-600",
  red: "from-red-500 to-red-600",
  orange: "from-orange-500 to-orange-600",
  purple: "from-purple-500 to-purple-600",
  amber: "from-amber-500 to-amber-600",
  indigo: "from-indigo-500 to-indigo-600",
  teal: "from-teal-500 to-teal-600",
};

// Tarjeta de resumen ("X pendientes", "Y aprobados", etc.) usada en las
// páginas de reportes, bandejas y gestión. `onClick` la vuelve clickeable
// (usado para filtrar la lista de abajo); `trend` agrega una línea extra
// de texto; `large` reproduce el tamaño de ícono más grande que usa
// GestionFirmantes.
export default function StatCard({
  label,
  value,
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  color = "blue",
  onClick,
  trend,
  large = false,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group${
        onClick ? " cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              {trend}
            </p>
          )}
        </div>
        <div
          className={`${large ? "p-4" : "p-3"} bg-linear-to-br ${COLORS[color]} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className={large ? "h-6 w-6 text-white" : "h-5 w-5 text-white"} />
        </div>
      </div>
    </div>
  );
}
