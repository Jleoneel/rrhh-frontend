// Sub-componentes presentacionales compartidos entre los pasos 3
// (Situación Laboral) y 4 (Revisión) del wizard de Nueva/Editar Acción de
// Personal.

export function InfoCard({ label, value, icon: Icon, className = "" }) {
  return (
    <div
      className={`bg-gray-50 border border-gray-200 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="h-4 w-4 text-gray-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </div>
          <div className="text-gray-800 font-semibold truncate">
            {value || (
              <span className="text-gray-400 italic">No especificado</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewField({
  label,
  value,
  important = false,
  small = false,
  highlight = false,
}) {
  return (
    <div
      className={`p-3 ${highlight ? "bg-green-50 border border-green-200" : "bg-gray-50"} rounded-lg`}
    >
      <div
        className={`${small ? "text-xs" : "text-sm"} font-medium text-gray-500 mb-1`}
      >
        {label}
      </div>
      <div
        className={`${small ? "text-sm" : "text-base"} font-semibold ${important ? "text-blue-700" : "text-gray-800"}`}
      >
        {value}
      </div>
    </div>
  );
}
