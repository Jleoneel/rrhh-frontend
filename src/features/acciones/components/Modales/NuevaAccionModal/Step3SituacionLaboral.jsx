import SelectPremium from "../../../../../shared/components/Layout/SelectPremiun";
import api from "../../../../../shared/api/axios";
import { getSelectValue } from "./selectHelpers";
import { InfoCard } from "./shared";
import {
  Briefcase,
  AlertCircle,
  Clock,
  Shield,
  Building2,
  Loader2,
  FileText,
  Layers,
  MapPin,
  Hash,
  Wallet,
  Info,
} from "lucide-react";

// Paso 3 del wizard de Nueva Acción de Personal: situación laboral actual
// (solo lectura) y, si el tipo de acción lo requiere, la situación
// propuesta (con la cascada escala ocupacional -> grados -> RMU, que
// consulta /catalogos/grados y /catalogos/rmu en vivo).
export default function Step3SituacionLaboral({
  mode,
  setStep,
  form,
  setForm,
  catProcesos,
  catNiveles,
  catUnidades,
  catDenoms,
  catEscalas,
  catGrados,
  setCatGrados,
  loadingGrados,
  setLoadingGrados,
  loadingRmu,
  setLoadingRmu,
  catLugares,
  loadingCatalogos,
}) {
  return (
    <div className="space-y-8">
      {/* Card Situación Laboral */}
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Situación Laboral
            </h3>
            <p className="text-blue-600 text-sm mt-1">
              Revise la situación actual y, si aplica, complete la situación
              propuesta
            </p>
          </div>
        </div>

        {!form.situacionActual ? (
          <div className="bg-linear-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h4 className="text-xl font-bold text-yellow-800 mb-2">
              ⚠️ No hay datos cargados
            </h4>
            <p className="text-yellow-700 mb-6 max-w-md mx-auto">
              {mode === "create"
                ? "Vuelva al paso 1 y busque un servidor para cargar su información laboral actual"
                : "No se pudo cargar la situación actual del servidor"}
            </p>
            {mode === "create" && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-linear-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-md"
              >
                Volver al paso 1
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Situación Actual */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      Situación Actual
                    </h4>
                    <p className="text-sm text-gray-500">
                      Estado laboral actual del servidor
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                  Solo lectura
                </span>
              </div>
              {/* Información normativa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-linear-to-r from-gray-900 to-gray-800 text-white rounded-xl p-5 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">
                        Proceso Institucional
                      </p>
                      <div className="mt-1">
                        <SelectPremium
                          options={catProcesos.map((x) => ({
                            value: x.id,
                            label: x.nombre,
                          }))}
                          value={getSelectValue(
                            catProcesos,
                            form.situacionActual?.proceso_institucional_id,
                          )}
                          onChange={(opt) =>
                            setForm((p) => ({
                              ...p,
                              situacionActual: {
                                ...p.situacionActual,
                                proceso_institucional_id: opt?.value ?? null,
                                proceso_institucional: opt?.label ?? null,
                              },
                            }))
                          }
                          placeholder="Seleccione..."
                          isSearchable
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Situación actual del servidor
                  </p>
                </div>

                <div className="bg-linear-to-r from-blue-900 to-blue-800 text-white rounded-xl p-5 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">
                        Nivel de Gestión
                      </p>
                      <div className="mt-1">
                        <SelectPremium
                          options={catNiveles.map((x) => ({
                            value: x.id,
                            label: x.nombre,
                          }))}
                          value={getSelectValue(
                            catNiveles,
                            form.situacionActual?.nivel_gestion_id,
                          )}
                          onChange={(opt) =>
                            setForm((p) => ({
                              ...p,
                              situacionActual: {
                                ...p.situacionActual,
                                nivel_gestion_id: opt?.value ?? null,
                                nivel_gestion: opt?.label ?? null,
                              },
                            }))
                          }
                          placeholder="Seleccione..."
                          isSearchable
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-400">
                    Situación actual del servidor
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard
                  label="Unidad Administrativa"
                  value={form.situacionActual.unidad_organica}
                  icon={Building2}
                />
                <InfoCard
                  label="Lugar de Trabajo"
                  value={form.situacionActual.lugar_trabajo}
                  icon={MapPin}
                />
                <InfoCard
                  label="Denominación de Puesto"
                  value={form.situacionActual.denominacion_puesto}
                  icon={FileText}
                />
                <InfoCard
                  label="Grupo Ocupacional"
                  value={form.situacionActual.grupo_ocupacional}
                  icon={Layers}
                />
                <InfoCard
                  label="Grado"
                  value={form.situacionActual.grado}
                  icon={Hash}
                />
                <InfoCard
                  label="Remuneración Mensual"
                  value={`$${form.situacionActual.rmu_puesto}`}
                  icon={Wallet}
                />
                <InfoCard
                  label="Partida Individual"
                  value={form.situacionActual.partida_individual}
                  icon={Hash}
                  className="md:col-span-2 lg:col-span-1"
                />
              </div>
            </div>

            {/* Situación Propuesta */}
            {form.tipoAccion?.requiere_propuesta ? (
              <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                {/* Proceso Institucional y Nivel de Gestión */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <SelectPremium
                    label="Proceso Institucional"
                    required
                    placeholder="Seleccione proceso..."
                    isSearchable
                    options={catProcesos.map((x) => ({
                      value: x.id,
                      label: x.nombre,
                    }))}
                    value={getSelectValue(
                      catProcesos,
                      form.situacionPropuesta?.proceso_institucional_id,
                    )}
                    onChange={(opt) =>
                      setForm((p) => ({
                        ...p,
                        situacionPropuesta: {
                          ...p.situacionPropuesta,
                          proceso_institucional_id: opt?.value ?? null,
                        },
                      }))
                    }
                  />

                  <SelectPremium
                    label="Nivel de Gestión"
                    required
                    placeholder="Seleccione nivel..."
                    isSearchable
                    options={catNiveles.map((x) => ({
                      value: x.id,
                      label: x.nombre,
                    }))}
                    value={getSelectValue(
                      catNiveles,
                      form.situacionPropuesta?.nivel_gestion_id,
                    )}
                    onChange={(opt) =>
                      setForm((p) => ({
                        ...p,
                        situacionPropuesta: {
                          ...p.situacionPropuesta,
                          nivel_gestion_id: opt?.value ?? null,
                        },
                      }))
                    }
                  />
                </div>
                {loadingCatalogos ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Cargando catálogos...</p>
                  </div>
                ) : !form.situacionPropuesta ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p>
                      No hay propuesta inicial. Vuelva a cargar el servidor.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 1) SELECTS PRINCIPALES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {/* Unidad Administrativa */}
                      <SelectPremium
                        label="Unidad Administrativa"
                        required
                        placeholder="Seleccione unidad..."
                        isSearchable
                        options={catUnidades.map((x) => ({
                          value: x.id,
                          label: x.nombre,
                          icon: Building2,
                        }))}
                        value={getSelectValue(
                          catUnidades,
                          form.situacionPropuesta.unidad_organica_id,
                          Building2,
                        )}
                        onChange={(opt) =>
                          setForm((p) => ({
                            ...p,
                            situacionPropuesta: {
                              ...p.situacionPropuesta,
                              unidad_organica_id: opt?.value ?? null,
                            },
                          }))
                        }
                      />

                      {/* Denominación de Puesto */}
                      <SelectPremium
                        label="Denominación de Puesto"
                        required
                        placeholder="Seleccione denominación..."
                        isSearchable
                        options={catDenoms.map((x) => ({
                          value: x.id,
                          label: x.nombre,
                          icon: FileText,
                        }))}
                        value={getSelectValue(
                          catDenoms,
                          form.situacionPropuesta.denominacion_puesto_id,
                          FileText,
                        )}
                        onChange={(opt) =>
                          setForm((p) => ({
                            ...p,
                            situacionPropuesta: {
                              ...p.situacionPropuesta,
                              denominacion_puesto_id: opt?.value ?? null,
                            },
                          }))
                        }
                      />

                      {/* Escala Ocupacional */}
                      <SelectPremium
                        label="Grupo / Escala Ocupacional"
                        required
                        placeholder="Seleccione escala..."
                        isSearchable
                        options={catEscalas.map((x) => ({
                          value: x.id,
                          label: x.nombre,
                          icon: Layers,
                        }))}
                        value={getSelectValue(
                          catEscalas,
                          form.situacionPropuesta.escala_ocupacional_id,
                          Layers,
                        )}
                        onChange={async (opt) => {
                          const escalaId = opt?.value ?? null;

                          setForm((p) => ({
                            ...p,
                            situacionPropuesta: {
                              ...p.situacionPropuesta,
                              escala_ocupacional_id: escalaId,
                              grado: null,
                              rmu_puesto: null,
                            },
                          }));

                          if (!escalaId) {
                            setCatGrados([]);
                            return;
                          }

                          try {
                            setLoadingGrados(true);
                            const { data } = await api.get(
                              `/catalogos/grados`,
                              {
                                params: {
                                  escala_ocupacional_id: escalaId,
                                },
                              },
                            );

                            setCatGrados(
                              Array.isArray(data)
                                ? data.map((x) => x.grado)
                                : [],
                            );
                          } catch (e) {
                            console.error("Error cargando grados:", e);
                            setCatGrados([]);
                          } finally {
                            setLoadingGrados(false);
                          }
                        }}
                      />

                      {/* Lugar de Trabajo (select) */}
                      <div className="space-y-3">
                        <SelectPremium
                          label="Lugar de Trabajo"
                          required
                          placeholder="Seleccione lugar..."
                          isSearchable
                          options={catLugares.map((x) => ({
                            value: x.nombre,
                            label: x.nombre,
                            icon: MapPin,
                          }))}
                          value={
                            form.situacionPropuesta?.lugar_trabajo
                              ? {
                                  value: form.situacionPropuesta.lugar_trabajo,
                                  label: form.situacionPropuesta.lugar_trabajo,
                                  icon: MapPin,
                                }
                              : null
                          }
                          onChange={(opt) =>
                            setForm((p) => ({
                              ...p,
                              situacionPropuesta: {
                                ...p.situacionPropuesta,
                                lugar_trabajo: opt?.value ?? "",
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* 2) CAMPOS NUMÉRICOS / TEXTO */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Grado */}
                      <SelectPremium
                        label="Grado"
                        required
                        placeholder={
                          loadingGrados
                            ? "Cargando grados..."
                            : "Seleccione grado..."
                        }
                        isSearchable
                        isLoading={loadingGrados}
                        options={catGrados.map((g) => ({
                          value: g,
                          label: String(g),
                          icon: Hash,
                        }))}
                        value={
                          form.situacionPropuesta?.grado != null
                            ? {
                                value: form.situacionPropuesta.grado,
                                label: String(form.situacionPropuesta.grado),
                                icon: Hash,
                              }
                            : null
                        }
                        onChange={async (opt) => {
                          const grado = opt?.value ?? null;

                          setForm((p) => ({
                            ...p,
                            situacionPropuesta: {
                              ...p.situacionPropuesta,
                              grado,
                              rmu_puesto: null,
                            },
                          }));

                          const escalaId =
                            form.situacionPropuesta?.escala_ocupacional_id;
                          if (!escalaId || grado == null) return;

                          try {
                            setLoadingRmu(true);
                            const { data } = await api.get(`/catalogos/rmu`, {
                              params: {
                                escala_ocupacional_id: escalaId,
                                grado,
                              },
                            });

                            setForm((p) => ({
                              ...p,
                              situacionPropuesta: {
                                ...p.situacionPropuesta,
                                rmu_puesto: data?.rmu ?? null,
                              },
                            }));
                          } catch (e) {
                            console.error("Error cargando RMU:", e);
                            setForm((p) => ({
                              ...p,
                              situacionPropuesta: {
                                ...p.situacionPropuesta,
                                rmu_puesto: null,
                              },
                            }));
                          } finally {
                            setLoadingRmu(false);
                          }
                        }}
                      />

                      {/* RMU Puesto */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-gray-400" />
                          RMU Puesto
                        </label>
                        <input
                          readOnly
                          value={
                            loadingRmu
                              ? "Cargando RMU..."
                              : (form.situacionPropuesta.rmu_puesto ?? "")
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 focus:outline-none"
                          placeholder="Se autocompleta según escala + grado"
                        />
                      </div>

                      {/* Partida Individual */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          Partida Individual
                        </label>
                        <input
                          readOnly
                          value={
                            form.situacionPropuesta.partida_individual ?? ""
                          }
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              situacionPropuesta: {
                                ...p.situacionPropuesta,
                                partida_individual: e.target.value,
                              },
                            }))
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-transparent"
                          placeholder="Ej: 1234-567-..."
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-linear-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">
                      Este tipo de acción no modifica la situación laboral
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Acciones como "{form.tipoAccion?.nombre}" normalmente no
                      requieren cambios en la situación laboral del servidor.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
