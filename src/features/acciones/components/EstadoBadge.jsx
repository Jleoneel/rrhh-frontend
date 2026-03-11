import { Clock, CheckCircle, AlertCircle, XCircle, FileEdit } from "lucide-react";

export default function EstadoBadge({ estado, showIcon = true, size = "sm" }) {
  const config = {
    BORRADOR: {
      bg: "bg-gray-100",
      text: "text-gray-800",
      border: "border-gray-300",
      icon: <FileEdit size={12} />,
      label: "Borrador",
      color: "#6b7280"
    },
    EN_FIRMA: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-200",
      icon: <Clock size={12} />,
      label: "En Firma",
      color: "#f59e0b"
    },
    APROBADO: {
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-200",
      icon: <CheckCircle size={12} />,
      label: "Aprobado",
      color: "#10b981"
    },
    RECHAZADO: {
      bg: "bg-red-50",
      text: "text-red-800",
      border: "border-red-200",
      icon: <XCircle size={12} />,
      label: "Rechazado",
      color: "#ef4444"
    }
  };

  const estadoConfig = config[estado] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-300",
    icon: <AlertCircle size={14} />,
    label: estado,
    color: "#6b7280"
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <div className={`inline-flex items-center gap-2 ${estadoConfig.bg} ${estadoConfig.text} ${estadoConfig.border} ${sizeClasses[size]} border rounded-full font-medium transition-all hover:shadow-sm`}>
      {showIcon && <span className="flex items-center">{estadoConfig.icon}</span>}
      <span>{estadoConfig.label}</span>
      
      {/* Punto animado para estados activos */}
      {(estado === 'EN_FIRMA' || estado === 'BORRADOR') && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: estadoConfig.color }}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2`} style={{ backgroundColor: estadoConfig.color }}></span>
        </span>
      )}
    </div>
  );
}

// Versión con tooltip (opcional)
export function EstadoBadgeWithTooltip({ estado, tooltip = "" }) {
  return (
    <div className="relative group">
      <EstadoBadge estado={estado} />
      {tooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 whitespace-nowrap">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}