import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function StatCard({ 
  title, 
  value, 
  icon, 
  color = "blue", 
  description,
  trend,
  trendValue,
  onClick,
  loading = false,
  suffix = "",
  prefix = "",
}) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      hover: "hover:border-blue-300",
      gradient: "from-blue-500 to-blue-600",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      hover: "hover:border-green-300",
      gradient: "from-green-500 to-green-600",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      hover: "hover:border-red-300",
      gradient: "from-red-500 to-red-600",
    },
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      hover: "hover:border-yellow-300",
      gradient: "from-yellow-500 to-yellow-600",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      hover: "hover:border-orange-300",
      gradient: "from-orange-500 to-orange-600",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      hover: "hover:border-purple-300",
      gradient: "from-purple-500 to-purple-600",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      hover: "hover:border-indigo-300",
      gradient: "from-indigo-500 to-indigo-600",
    },
    gray: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      hover: "hover:border-gray-300",
      gradient: "from-gray-500 to-gray-600",
    },
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend) {
      case "up":
        return <TrendingUp size={14} className="text-green-600" />;
      case "down":
        return <TrendingDown size={14} className="text-red-600" />;
      default:
        return <Minus size={14} className="text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";
    switch (trend) {
      case "up":
        return "text-green-600 bg-green-50";
      case "down":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const displayValue = loading ? (
    <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse mt-1" />
  ) : (
    <span>
      {prefix && <span className="text-lg font-normal mr-0.5">{prefix}</span>}
      {typeof value === "number" ? value.toLocaleString("es-EC") : value}
      {suffix && <span className="text-lg font-normal ml-0.5">{suffix}</span>}
    </span>
  );

  return (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl shadow-md border border-gray-200 transition-all duration-300 ${
        onClick ? "cursor-pointer hover:shadow-xl hover:scale-105" : "hover:shadow-lg"
      } ${colorClasses[color].hover}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {title}
            </p>
            {trendValue && (
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-gray-900">{displayValue}</p>
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400" />
              {description}
            </p>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${colorClasses[color].bg} shadow-sm`}>
          <div className={`${colorClasses[color].text}`}>
            {icon}
          </div>
        </div>
      </div>

      {/* Barra de progreso opcional */}
      {typeof value === "number" && color === "blue" && value > 0 && (
        <div className="mt-4">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, (value / 100) * 100)}%`,
                background: `linear-gradient(90deg, ${colorClasses[color].gradient})`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}