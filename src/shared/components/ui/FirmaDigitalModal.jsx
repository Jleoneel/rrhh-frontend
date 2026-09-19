import { ShieldCheck, X, AlertCircle, Loader2 } from "lucide-react";

const THEME = {
  blue: {
    header: "from-blue-900 to-blue-800",
    banner: "bg-blue-50 border-blue-200",
    bannerText: "text-blue-800",
    focusRing: "focus:ring-blue-500",
    button: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
  },
  green: {
    header: "from-green-700 to-green-600",
    banner: "bg-green-50 border-green-200",
    bannerText: "text-green-800",
    focusRing: "focus:ring-green-500",
    button: "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
  },
};

// Modal de contraseña para firmar con certificado P12, usado en todos los
// flujos de firma digital (acciones de personal, vacaciones — tanto al
// solicitar como al aprobar). Es un componente controlado: quien lo usa
// mantiene el valor de la contraseña y decide qué pasa al confirmar.
export default function FirmaDigitalModal({
  open,
  subtitle,
  infoText,
  extra,
  password,
  onPasswordChange,
  onClose,
  onSubmit,
  submitting = false,
  submitLabel = "Firmar",
  color = "blue",
}) {
  if (!open) return null;
  const theme = THEME[color];

  const handleClose = () => {
    if (!submitting) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className={`bg-linear-to-r ${theme.header} text-white px-6 py-5`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Firma Digital</h2>
                {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className={`p-4 rounded-xl border ${theme.banner}`}>
            <p className={`text-sm font-medium ${theme.bannerText}`}>
              {infoText}
            </p>
            {extra}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña del token <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
              placeholder="Ingresa la contraseña de tu certificado"
              className={`w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent`}
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              Tu contraseña no se guarda — solo se usa para firmar este
              documento
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              disabled={submitting}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onSubmit}
              disabled={!password?.trim() || submitting}
              className={`flex-1 px-4 py-3 bg-linear-to-r ${theme.button} text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg`}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Firmando...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
