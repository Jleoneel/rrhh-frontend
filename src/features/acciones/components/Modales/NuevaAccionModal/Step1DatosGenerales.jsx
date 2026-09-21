import SelectPremium from "../../../../../shared/components/Layout/SelectPremiun";
import {
  User,
  HelpCircle,
  Search,
  Loader2,
  BadgeCheck,
  FileText,
  Calendar,
  PencilLine,
  AlertCircle,
} from "lucide-react";

// Paso 1 del wizard de Nueva Acción de Personal: búsqueda del servidor por
// cédula (solo en modo "create") y datos generales de la acción (tipo,
// fechas RIGE). Componente controlado — todo el estado vive en
// NuevaAccionModal.jsx, este archivo solo es la vista de este paso.
export default function Step1DatosGenerales({
  mode,
  form,
  setForm,
  cedulaError,
  setCedulaError,
  validateCedula,
  handleCedulaKeyPress,
  fetchSituacionActual,
  loadingServ,
  showServidorFound,
  tipos,
  loadingTipos,
  minRigeHasta,
}) {
  return (
    <div className="space-y-8">
      {/* Card Información del Servidor */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Información del Servidor
            </h3>
            <p className="text-blue-600 text-sm mt-1">
              {mode === "create"
                ? "Busque al servidor por cédula para autocompletar sus datos"
                : "Datos del servidor (solo lectura)"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cedula */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span>Cédula</span>
              <span className="text-red-500">*</span>
              <div className="relative group">
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                <div className="absolute left-6 top-0 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  Ingrese la cédula del servidor (9 o 10 dígitos)
                  <div className="absolute -left-2 top-3 border-4 border-transparent border-r-gray-900"></div>
                </div>
              </div>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={form.cedula}
                readOnly={mode === "edit"}
                onChange={(e) => {
                  if (mode === "edit") return;
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm((p) => ({ ...p, cedula: value }));
                  setCedulaError(validateCedula(value));
                }}
                onKeyPress={
                  mode === "create" ? handleCedulaKeyPress : undefined
                }
                className={`w-full border rounded-xl pl-12 pr-12 py-3.5 focus:outline-none focus:ring-1 transition-all ${
                  cedulaError
                    ? "border-red-300 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                } ${mode === "edit" ? "bg-gray-50 cursor-not-allowed" : ""}`}
                placeholder="Ej: 1234567890"
                inputMode="numeric"
              />

              {mode === "create" && (
                <button
                  type="button"
                  onClick={() => fetchSituacionActual()}
                  disabled={loadingServ || !form.cedula.trim()}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all ${
                    loadingServ
                      ? "bg-gray-100"
                      : form.cedula.trim()
                        ? "bg-blue-100 hover:bg-blue-200 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                  }`}
                  title="Buscar servidor"
                >
                  {loadingServ ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
            {cedulaError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {cedulaError}
              </p>
            )}
          </div>

          {/* Estado búsqueda */}
          <div className="flex items-end">
            {showServidorFound ? (
              <div className="w-full px-5 py-3.5 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BadgeCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">
                      Servidor encontrado
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full px-5 py-4 bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl text-center">
                <p className="text-gray-700 font-medium mb-1">
                  {mode === "edit"
                    ? "Servidor cargado para edición"
                    : "Servidor no encontrado"}
                </p>
              </div>
            )}
          </div>

          {/* Servidor */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Nombre del Servidor
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                value={form.servidorNombre || ""}
                readOnly
                className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 bg-gray-50 focus:outline-none"
                placeholder="Se autocompletará al buscar"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Detalles de la Acción */}
      <div className="bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Detalles de la Acción
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Complete los datos específicos de la acción a{" "}
              {mode === "create" ? "registrar" : "editar"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 focus-ring-1">
          {/* Tipo */}
          <SelectPremium
            options={tipos.map((t) => ({
              value: t.id,
              label: t.nombre,
              icon: FileText,
              data: t,
            }))}
            value={
              form.tipoAccion
                ? {
                    value: form.tipoAccion.id,
                    label: form.tipoAccion.nombre,
                    icon: FileText,
                  }
                : null
            }
            onChange={(selected) => {
              if (!selected) {
                setForm((p) => ({
                  ...p,
                  tipoAccion: null,
                  detalleTipoAccion: "",
                }));
                return;
              }

              const tipoCompleto = tipos.find((t) => t.id === selected.value);

              if (tipoCompleto) {
                setForm((p) => {
                  // Si el tipo nuevo requiere propuesta y la que hay está
                  // vacía, se inicializa con los mismos valores de la
                  // situación actual — igual que ya se hace al buscar la
                  // cédula en modo creación.
                  // OJO: toda acción (incluso las de un tipo que NO
                  // requiere propuesta) ya tiene su fila en
                  // accion_situacion_propuesta creada de fábrica, solo que
                  // con todos los campos en null — por eso no basta con
                  // revisar "!situacionPropuesta" (nunca es null, siempre
                  // es un objeto), hay que revisar si está vacía de verdad.
                  const propuestaVacia =
                    !p.situacionPropuesta?.unidad_organica_id &&
                    !p.situacionPropuesta?.denominacion_puesto_id;
                  const necesitaPropuestaInicial =
                    tipoCompleto.requiere_propuesta &&
                    propuestaVacia &&
                    p.situacionActual;

                  return {
                    ...p,
                    tipoAccion: tipoCompleto,
                    detalleTipoAccion:
                      tipoCompleto.nombre === "Otro"
                        ? p.detalleTipoAccion
                        : "",
                    situacionPropuesta: necesitaPropuestaInicial
                      ? {
                          unidad_organica_id:
                            p.situacionActual.unidad_organica_id,
                          denominacion_puesto_id:
                            p.situacionActual.denominacion_puesto_id,
                          escala_ocupacional_id:
                            p.situacionActual.escala_ocupacional_id,
                          lugar_trabajo: p.situacionActual.lugar_trabajo,
                          grado: p.situacionActual.grado,
                          rmu_puesto: p.situacionActual.rmu_puesto,
                          partida_individual:
                            p.situacionActual.partida_individual,
                        }
                      : p.situacionPropuesta,
                  };
                });
              }
            }}
            label="Tipo de acción"
            required
            placeholder="Seleccione el tipo de acción..."
            isSearchable
            isClearable
            isLoading={loadingTipos}
          />
          {/* RIGE desde */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span>RIGE desde</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={form.rigeDesde || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    rigeDesde: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>
          {/* RIGE hasta */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              RIGE hasta (opcional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={form.rigeHasta || ""}
                min={minRigeHasta}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    rigeHasta: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* "Otro" -> textarea */}
        {form.tipoAccion?.nombre === "Otro" && (
          <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <label className="block text-sm font-semibold text-blue-800 mb-3">
              Especifique el tipo de acción{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <PencilLine className="absolute left-4 top-4 h-5 w-5 text-blue-400" />
              <textarea
                value={form.detalleTipoAccion}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    detalleTipoAccion: e.target.value,
                  }))
                }
                rows={3}
                className="w-full border border-blue-300 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-transparent resize-none bg-white"
                placeholder="Ej.: Revisión por caso especial, cambio de denominación, etc."
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-blue-600">
                Este texto se usará en el documento cuando el tipo sea "Otro"
              </p>
              <p
                className={`text-xs ${
                  form.detalleTipoAccion.length > 2
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {form.detalleTipoAccion.length}/3 caracteres mínimos
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
