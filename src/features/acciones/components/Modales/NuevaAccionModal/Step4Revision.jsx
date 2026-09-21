import { ReviewField } from "./shared";
import {
  CheckCircle,
  FileCheck,
  User,
  Clock,
  FileText,
  Calendar,
  Briefcase,
  PencilLine,
  Info,
  AlertCircle,
} from "lucide-react";

// Paso 4 (final) del wizard de Nueva Acción de Personal: declaración
// jurada (único campo editable de este paso) + resumen de solo lectura de
// todo lo capturado en los pasos anteriores.
export default function Step4Revision({
  mode,
  form,
  setForm,
  catProcesos,
  catNiveles,
  catUnidades,
  catDenoms,
  catEscalas,
}) {
  return (
    <div className="space-y-8">
      {/* Card Revisión Final */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <CheckCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Revisión Final
            </h3>
            <p className="text-blue-600 text-sm mt-1">
              Revise todos los datos antes de{" "}
              {mode === "create"
                ? "finalizar el registro"
                : "guardar los cambios"}
            </p>
          </div>
        </div>

        {/* Declaración Jurada */}
        <div className="mb-8 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-amber-100 rounded-xl">
                <FileCheck className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-amber-900 mb-2">
                Confirmación de Documentación
              </h4>
              <p className="text-amber-700 mb-4">
                Seleccione si presentó la declaración jurada (Art. 3 RLCSP)
              </p>

              {/* Radio buttons para SI/NO */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="radio"
                        id="declaracionSi"
                        name="declaracionJurada"
                        value="SI"
                        checked={form.presentoDeclaracionJurada === true}
                        onChange={() =>
                          setForm((p) => ({
                            ...p,
                            presentoDeclaracionJurada: true,
                          }))
                        }
                        className="sr-only"
                      />
                      <label
                        htmlFor="declaracionSi"
                        className={`
                                    flex items-center justify-center w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-200
                                    ${
                                      form.presentoDeclaracionJurada === true
                                        ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/30"
                                        : "bg-white border-gray-300 hover:border-green-400"
                                    }
                                  `}
                      >
                        {form.presentoDeclaracionJurada === true && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </label>
                    </div>
                    <label
                      htmlFor="declaracionSi"
                      className="font-medium text-gray-800 cursor-pointer flex items-center gap-2"
                    >
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                        SI
                      </span>
                      <span>Sí, presentó la declaración jurada</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="radio"
                        id="declaracionNo"
                        name="declaracionJurada"
                        value="NO"
                        checked={form.presentoDeclaracionJurada === false}
                        onChange={() =>
                          setForm((p) => ({
                            ...p,
                            presentoDeclaracionJurada: false,
                          }))
                        }
                        className="sr-only"
                      />
                      <label
                        htmlFor="declaracionNo"
                        className={`
                                    flex items-center justify-center w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-200
                                    ${
                                      form.presentoDeclaracionJurada === false
                                        ? "bg-red-500 border-red-500 shadow-lg shadow-red-500/30"
                                        : "bg-white border-gray-300 hover:border-red-400"
                                    }
                                  `}
                      >
                        {form.presentoDeclaracionJurada === false && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </label>
                    </div>
                    <label
                      htmlFor="declaracionNo"
                      className="font-medium text-gray-800 cursor-pointer flex items-center gap-2"
                    >
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                        NO
                      </span>
                      <span>No presentó la declaración jurada</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Nota de validación */}
              {form.presentoDeclaracionJurada === null && (
                <p className="text-sm text-red-600 mt-4 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Debe seleccionar SI o NO para continuar
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información General */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Información General
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ReviewField
              label="Número de Acción"
              value={form.numeroElaboracion || "Por asignar"}
              important
            />
            <ReviewField
              label="Estado"
              value={
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                  <Clock className="h-3 w-3" />
                  BORRADOR
                </span>
              }
            />
            <ReviewField label="Cédula" value={form.cedula} />
            <ReviewField label="Servidor" value={form.servidorNombre} />
            <ReviewField
              label="Tipo de Acción"
              value={
                <div className="flex items-center gap-2">
                  <span>{form.tipoAccion?.nombre || "No seleccionado"}</span>
                  {form.tipoAccion?.nombre === "Otro" && (
                    <span className="text-xs text-gray-500">
                      ({form.detalleTipoAccion})
                    </span>
                  )}
                </div>
              }
            />
            <ReviewField
              label="RIGE desde"
              value={
                form.rigeDesde ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(form.rigeDesde).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                ) : (
                  <span className="text-gray-500">No especificado</span>
                )
              }
            />
            <ReviewField
              label="RIGE hasta"
              value={
                form.rigeHasta ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(form.rigeHasta).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                ) : (
                  <span className="text-gray-500">No aplica</span>
                )
              }
            />
          </div>
        </div>

        {/* Motivación */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Motivación
          </h4>
          <div className="bg-gray-50 rounded-xl p-5">
            <p className="text-gray-700 whitespace-pre-wrap">
              {form.motivo || (
                <span className="text-gray-400 italic">
                  No se ha ingresado motivación
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Situación Laboral */}
        {form.situacionActual && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              Situación Laboral
            </h4>

            {/* Proceso Institucional y Nivel de Gestión */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-medium text-blue-700 mb-1">
                  Proceso Institucional
                </p>
                <p className="text-lg font-bold text-blue-900">
                  {catProcesos.find(
                    (p) =>
                      p.id === form.situacionActual?.proceso_institucional_id,
                  )?.nombre || "No especificado"}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm font-medium text-blue-700 mb-1">
                  Nivel de Gestión
                </p>
                <p className="text-lg font-bold text-blue-900">
                  {catNiveles.find(
                    (n) => n.id === form.situacionActual?.nivel_gestion_id,
                  )?.nombre || "No especificado"}
                </p>
              </div>
            </div>

            {/* Situación Actual */}
            <div className="mb-6">
              <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                Situación Actual
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ReviewField
                  small
                  label="Unidad Administrativa"
                  value={
                    form.situacionActual.unidad_organica || "No especificado"
                  }
                />
                <ReviewField
                  small
                  label="Lugar de Trabajo"
                  value={
                    form.situacionActual.lugar_trabajo || "No especificado"
                  }
                />
                <ReviewField
                  small
                  label="Denominación de Puesto"
                  value={
                    form.situacionActual.denominacion_puesto ||
                    "No especificado"
                  }
                />
                <ReviewField
                  small
                  label="Grupo Ocupacional"
                  value={
                    form.situacionActual.grupo_ocupacional ||
                    "No especificado"
                  }
                />
                <ReviewField
                  small
                  label="Grado"
                  value={form.situacionActual.grado || "No especificado"}
                />
                <ReviewField
                  small
                  label="Remuneración"
                  value={
                    form.situacionActual.rmu_puesto
                      ? `$${form.situacionActual.rmu_puesto}`
                      : "No especificado"
                  }
                />
                <ReviewField
                  small
                  label="Partida Individual"
                  value={
                    form.situacionActual.partida_individual ||
                    "No especificado"
                  }
                />
              </div>
            </div>

            {/* Situación Propuesta */}
            {form.tipoAccion?.requiere_propuesta &&
              form.situacionPropuesta && (
                <div className="pt-6 border-t border-gray-200">
                  <h5 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <PencilLine className="h-4 w-4 text-gray-500" />
                    Situación Propuesta ({form.tipoAccion?.nombre})
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ReviewField
                      small
                      label="Unidad Administrativa"
                      value={
                        catUnidades.find(
                          (u) =>
                            u.id === form.situacionPropuesta.unidad_organica_id,
                        )?.nombre || "No especificado"
                      }
                      highlight
                    />
                    <ReviewField
                      small
                      label="Lugar de Trabajo"
                      value={
                        form.situacionPropuesta.lugar_trabajo ||
                        "No especificado"
                      }
                      highlight
                    />
                    <ReviewField
                      small
                      label="Denominación de Puesto"
                      value={
                        catDenoms.find(
                          (d) =>
                            d.id ===
                            form.situacionPropuesta.denominacion_puesto_id,
                        )?.nombre || "No especificado"
                      }
                      highlight
                    />
                    <ReviewField
                      small
                      label="Grupo Ocupacional"
                      value={
                        catEscalas.find(
                          (e) =>
                            e.id ===
                            form.situacionPropuesta.escala_ocupacional_id,
                        )?.nombre || "No especificado"
                      }
                      highlight
                    />
                    <ReviewField
                      small
                      label="Grado"
                      value={
                        form.situacionPropuesta.grado || "No especificado"
                      }
                      highlight
                    />
                    <ReviewField
                      small
                      label="Remuneración"
                      value={
                        form.situacionPropuesta.rmu_puesto
                          ? `$${form.situacionPropuesta.rmu_puesto}`
                          : "No especificado"
                      }
                      highlight
                    />
                    <ReviewField
                      small
                      label="Partida Individual"
                      value={
                        form.situacionPropuesta.partida_individual ||
                        "No especificado"
                      }
                      highlight
                    />
                    <ReviewField
                      small
                      label="Proceso Institucional"
                      value={
                        catProcesos.find(
                          (p) =>
                            p.id ===
                            form.situacionPropuesta?.proceso_institucional_id,
                        )?.nombre || "No especificado"
                      }
                      highlight
                    />
                    <ReviewField
                      small
                      label="Nivel de Gestión"
                      value={
                        catNiveles.find(
                          (n) =>
                            n.id === form.situacionPropuesta?.nivel_gestion_id,
                        )?.nombre || "No especificado"
                      }
                      highlight
                    />
                  </div>
                </div>
              )}

            {!form.tipoAccion?.requiere_propuesta && form.tipoAccion && (
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-gray-700 font-medium">
                      Tipo "{form.tipoAccion.nombre}" no requiere
                      modificación laboral
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Este tipo de acción mantiene la situación laboral
                      actual del servidor
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Resumen final */}
        <div className="mt-8 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <FileCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-bold text-green-900 text-lg mb-2">
                {mode === "create"
                  ? "¿Todo listo para continuar?"
                  : "¿Guardar los cambios?"}
              </h4>
              <p className="text-green-700">
                {mode === "create"
                  ? "Esta acción será registrada como BORRADOR y podrás:"
                  : `Se actualizará la acción ${form.numeroElaboracion} y podrás:`}
              </p>
              <ul className="list-disc pl-5 text-green-600 mt-2 text-sm">
                <li>Editarla más tarde desde la lista de acciones</li>
                <li>Agregar más documentos si es necesario</li>
                <li>Enviarla a revisión cuando esté completa</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
