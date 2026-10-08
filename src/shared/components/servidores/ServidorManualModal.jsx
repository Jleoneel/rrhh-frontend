import { useEffect, useState } from "react";
import {
  UserPlus,
  Pencil,
  X,
  User,
  Hash,
  Building2,
  FileText,
  Layers,
  MapPin,
  Wallet,
  Loader2,
  AlertCircle,
  Mail,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";
import Modal from "../ui/Modal";
import SelectPremium from "../Layout/SelectPremiun";
import api from "../../api/axios";

const initialForm = {
  cedula: "",
  nombres: "",
  email: "",
  fechaIngreso: "",
  regimenLaboralId: null,
  unidadOrganicaId: null,
  denominacionPuestoId: null,
  canton: "",
  escalaOcupacionalId: null,
  grado: null,
  rmuPuesto: null,
  partidaIndividual: "",
};

function validateCedula(cedula) {
  if (!cedula) return "La cédula es requerida";
  if (!/^\d+$/.test(cedula)) return "La cédula debe contener solo números";
  if (cedula.length < 9 || cedula.length > 10)
    return "La cédula debe tener 9 o 10 dígitos";
  return "";
}

function validateEmail(email) {
  if (!email) return "El correo institucional es requerido";
  if (!email.includes("@")) return "Ingrese un correo válido";
  return "";
}

const toOptions = (catalogo) =>
  (catalogo || []).map((x) => ({ value: x.id, label: x.nombre }));

// Un solo formulario para registrar o editar un servidor "MANUAL" (no
// proviene del distributivo oficial) — antes eran dos componentes casi
// idénticos (RegistrarServidorManualModal / EditarServidorManualModal) que
// había que mantener en paralelo a mano.
export default function ServidorManualModal({
  open,
  mode = "crear",
  servidorId = null,
  continuarAccion = true,
  onClose,
  onSuccess,
}) {
  const esEdicion = mode === "editar";

  const [tab, setTab] = useState("personales");
  const [form, setForm] = useState(initialForm);
  const [cedulaError, setCedulaError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(false);
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  const [catRegimenes, setCatRegimenes] = useState([]);
  const [catUnidades, setCatUnidades] = useState([]);
  const [catDenoms, setCatDenoms] = useState([]);
  const [catEscalas, setCatEscalas] = useState([]);
  const [catGrados, setCatGrados] = useState([]);
  const [loadingGrados, setLoadingGrados] = useState(false);
  const [loadingRmu, setLoadingRmu] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (esEdicion && !servidorId) return;
    setForm(initialForm);
    setTab("personales");
    setCedulaError("");
    setEmailError("");
    setCatGrados([]);

    const fetchTodo = async () => {
      setLoadingCatalogos(true);
      if (esEdicion) setLoadingDatos(true);
      try {
        const promesas = [
          api
            .get("/catalogos/regimenes-laborales")
            .catch(() => ({ data: [] })),
          api.get("/catalogos/unidades-organicas").catch(() => ({ data: [] })),
          api.get("/catalogos/denominaciones").catch(() => ({ data: [] })),
          api
            .get("/catalogos/escalas-ocupacionales")
            .catch(() => ({ data: [] })),
        ];
        if (esEdicion) {
          promesas.push(
            api.get(`/servidores/manual/${servidorId}`).then((r) => r.data),
          );
        }

        const [regimenesRes, unidadesRes, denomsRes, escalasRes, servidor] =
          await Promise.all(promesas);

        setCatRegimenes(regimenesRes.data || []);
        setCatUnidades(unidadesRes.data || []);
        setCatDenoms(denomsRes.data || []);
        setCatEscalas(escalasRes.data || []);

        if (esEdicion && servidor) {
          setForm({
            cedula: servidor.numero_identificacion || "",
            nombres: servidor.nombres || "",
            email: servidor.email || "",
            fechaIngreso: servidor.fecha_ingreso || "",
            regimenLaboralId: servidor.regimen_laboral_id || null,
            unidadOrganicaId: servidor.unidad_organica_id || null,
            denominacionPuestoId: servidor.denominacion_puesto_id || null,
            canton: servidor.canton || "",
            escalaOcupacionalId: servidor.escala_ocupacional_id || null,
            grado: servidor.grado || null,
            rmuPuesto: servidor.rmu_puesto ?? null,
            partidaIndividual: servidor.partida_individual || "",
          });

          if (servidor.escala_ocupacional_id) {
            try {
              const { data } = await api.get(`/catalogos/grados`, {
                params: { escala_ocupacional_id: servidor.escala_ocupacional_id },
              });
              setCatGrados(Array.isArray(data) ? data.map((x) => x.grado) : []);
            } catch {
              setCatGrados([]);
            }
          }
        }
      } catch (error) {
        if (esEdicion) {
          Swal.fire({
            title: "Error",
            text:
              error.response?.data?.message ||
              "No se pudieron cargar los datos del servidor",
            icon: "error",
            confirmButtonColor: "#3b82f6",
          });
          onClose();
        }
      } finally {
        setLoadingCatalogos(false);
        if (esEdicion) setLoadingDatos(false);
      }
    };

    fetchTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, servidorId, esEdicion]);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const canSubmit =
    !cedulaError &&
    !emailError &&
    form.cedula.trim() &&
    form.nombres.trim() &&
    form.email.trim() &&
    form.fechaIngreso &&
    form.canton.trim() &&
    form.regimenLaboralId &&
    form.unidadOrganicaId &&
    form.denominacionPuestoId &&
    form.partidaIndividual.trim();

  const handleSubmit = async () => {
    if (saving) return;

    const cedulaErr = validateCedula(form.cedula.trim());
    const emailErr = validateEmail(form.email.trim().toLowerCase());
    if (cedulaErr || emailErr) {
      setCedulaError(cedulaErr);
      setEmailError(emailErr);
      return;
    }
    if (!canSubmit) {
      Swal.fire({
        toast: true,
        text: "Complete los campos obligatorios (*)",
        icon: "error",
        showConfirmButton: false,
        timer: 2200,
        position: "top-end",
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        numero_identificacion: form.cedula.trim(),
        nombres: form.nombres.trim(),
        email: form.email.trim().toLowerCase(),
        fecha_ingreso: form.fechaIngreso,
        regimen_laboral_id: form.regimenLaboralId,
        unidad_organica_id: form.unidadOrganicaId,
        denominacion_puesto_id: form.denominacionPuestoId,
        canton: form.canton.trim() || null,
        escala_ocupacional_id: form.escalaOcupacionalId,
        grado: form.grado ?? null,
        partida_individual: form.partidaIndividual.trim(),
      };

      if (esEdicion) {
        await api.put(`/servidores/manual/${servidorId}`, payload);
      } else {
        await api.post("/servidores/manual", payload);
      }

      Swal.fire({
        toast: true,
        text: esEdicion
          ? "✓ Servidor actualizado correctamente"
          : continuarAccion
            ? "✓ Servidor registrado. Continuando con la Acción de Personal..."
            : "✓ Servidor registrado correctamente",
        icon: "success",
        showConfirmButton: false,
        timer: 2200,
        position: "top-end",
      });

      const cedula = form.cedula.trim();
      if (!esEdicion) setForm(initialForm);
      onSuccess?.(cedula);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          (esEdicion
            ? "No se pudo actualizar el servidor"
            : "No se pudo registrar el servidor"),
        icon: "error",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setSaving(false);
    }
  };

  const Icono = esEdicion ? Pencil : UserPlus;
  const colorIcono = esEdicion
    ? "bg-blue-100 text-blue-600"
    : "bg-amber-100 text-amber-600";
  const colorBoton = esEdicion
    ? "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:hover:from-blue-500 disabled:hover:to-blue-600"
    : "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:hover:from-amber-500 disabled:hover:to-amber-600";
  const colorTabActivo = esEdicion
    ? "border-blue-600 text-blue-600"
    : "border-amber-600 text-amber-600";

  return (
    <Modal open={open} onClose={handleClose} size="2xl" className="max-h-[90vh]">
      <div className="sticky top-0 bg-white z-10 px-8 pt-8 rounded-t-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${colorIcono}`}>
              <Icono className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {esEdicion
                  ? "Editar servidor registrado manualmente"
                  : "Servidor no registrado en el distributivo"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {esEdicion
                  ? "Estos datos son los que se usan al crear una Acción de Personal para este servidor"
                  : continuarAccion
                    ? "Ingrese manualmente los datos necesarios para crear la Acción de Personal"
                    : "Ingrese manualmente los datos del servidor para registrarlo en el sistema"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {!loadingDatos && (
          <div className="flex gap-1 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setTab("personales")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
                tab === "personales"
                  ? colorTabActivo
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <User size={14} />
              Datos personales
            </button>
            <button
              type="button"
              onClick={() => setTab("laboral")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
                tab === "laboral"
                  ? colorTabActivo
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Building2 size={14} />
              Situación laboral
            </button>
          </div>
        )}
      </div>

      {loadingDatos ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-gray-500 text-sm mt-2">Cargando datos...</p>
        </div>
      ) : (
        <>
          <div className="p-8 max-h-[calc(90vh-220px)] overflow-y-auto">
            {tab === "personales" && (
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Cédula <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        value={form.cedula}
                        disabled={saving}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setForm((p) => ({ ...p, cedula: value }));
                          setCedulaError(validateCedula(value));
                        }}
                        className={`w-full border rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 transition-all disabled:bg-gray-100 ${
                          cedulaError
                            ? "border-red-300 focus:ring-red-500 bg-red-50"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="Ej: 1234567890"
                        inputMode="numeric"
                      />
                    </div>
                    {cedulaError && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {cedulaError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Nombres completos <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        value={form.nombres}
                        disabled={saving}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            nombres: e.target.value.toUpperCase(),
                          }))
                        }
                        className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="APELLIDOS Y NOMBRES"
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Correo institucional <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={form.email}
                        disabled={saving}
                        onChange={(e) => {
                          const value = e.target.value;
                          setForm((p) => ({ ...p, email: value }));
                          setEmailError(validateEmail(value.trim().toLowerCase()));
                        }}
                        className={`w-full border rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 transition-all disabled:bg-gray-100 ${
                          emailError
                            ? "border-red-300 focus:ring-red-500 bg-red-50"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="nombre@hpvc.gob.ec"
                      />
                    </div>
                    {emailError && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {emailError}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Es el correo al que llegarán todas las notificaciones del
                      sistema (permisos, vacaciones, acciones de personal).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Fecha de ingreso <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={form.fechaIngreso}
                        disabled={saving}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, fechaIngreso: e.target.value }))
                        }
                        className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Determina el día del mes en que este servidor acumula sus
                      horas de permiso mensuales.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {tab === "laboral" && (
              <div className="bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectPremium
                    label="Régimen laboral"
                    required
                    icon={FileText}
                    placeholder="Seleccione régimen..."
                    isSearchable
                    isLoading={loadingCatalogos}
                    isDisabled={saving}
                    options={toOptions(catRegimenes)}
                    value={
                      toOptions(catRegimenes).find(
                        (o) => o.value === form.regimenLaboralId,
                      ) || null
                    }
                    onChange={(opt) =>
                      setForm((p) => ({ ...p, regimenLaboralId: opt?.value ?? null }))
                    }
                  />

                  <SelectPremium
                    label="Unidad administrativa"
                    required
                    icon={Building2}
                    placeholder="Seleccione unidad..."
                    isSearchable
                    isLoading={loadingCatalogos}
                    isDisabled={saving}
                    options={toOptions(catUnidades)}
                    value={
                      toOptions(catUnidades).find(
                        (o) => o.value === form.unidadOrganicaId,
                      ) || null
                    }
                    onChange={(opt) =>
                      setForm((p) => ({ ...p, unidadOrganicaId: opt?.value ?? null }))
                    }
                  />

                  <SelectPremium
                    label="Denominación de puesto"
                    required
                    icon={FileText}
                    placeholder="Seleccione denominación..."
                    isSearchable
                    isLoading={loadingCatalogos}
                    isDisabled={saving}
                    options={toOptions(catDenoms)}
                    value={
                      toOptions(catDenoms).find(
                        (o) => o.value === form.denominacionPuestoId,
                      ) || null
                    }
                    onChange={(opt) =>
                      setForm((p) => ({
                        ...p,
                        denominacionPuestoId: opt?.value ?? null,
                      }))
                    }
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Partida individual <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        value={form.partidaIndividual}
                        disabled={saving}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            partidaIndividual: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="Ej: 10"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Lugar de trabajo / cantón <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        value={form.canton}
                        disabled={saving}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            canton: e.target.value.toUpperCase(),
                          }))
                        }
                        className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                        placeholder="Ej: PORTOVIEJO"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {/*
                    Escala → Grado → RMU: misma lógica y mismos endpoints que
                    el formulario normal (NuevaAccionModal.jsx, situación
                    propuesta). Al elegir escala se cargan los grados válidos
                    para ella (GET /catalogos/grados); al elegir grado se
                    deriva la RMU (GET /catalogos/rmu). RMU nunca es editable.
                  */}
                  <SelectPremium
                    label="Grupo / escala ocupacional (opcional)"
                    icon={Layers}
                    placeholder="Seleccione escala..."
                    isSearchable
                    isLoading={loadingCatalogos}
                    isDisabled={saving}
                    options={toOptions(catEscalas)}
                    value={
                      toOptions(catEscalas).find(
                        (o) => o.value === form.escalaOcupacionalId,
                      ) || null
                    }
                    onChange={async (opt) => {
                      const escalaId = opt?.value ?? null;

                      setForm((p) => ({
                        ...p,
                        escalaOcupacionalId: escalaId,
                        grado: null,
                        rmuPuesto: null,
                      }));

                      if (!escalaId) {
                        setCatGrados([]);
                        return;
                      }

                      try {
                        setLoadingGrados(true);
                        const { data } = await api.get(`/catalogos/grados`, {
                          params: { escala_ocupacional_id: escalaId },
                        });
                        setCatGrados(
                          Array.isArray(data) ? data.map((x) => x.grado) : [],
                        );
                      } catch (e) {
                        console.error("Error cargando grados:", e);
                        setCatGrados([]);
                      } finally {
                        setLoadingGrados(false);
                      }
                    }}
                  />

                  <SelectPremium
                    label="Grado (opcional)"
                    icon={Hash}
                    placeholder={
                      loadingGrados ? "Cargando grados..." : "Seleccione grado..."
                    }
                    isSearchable
                    isLoading={loadingGrados}
                    isDisabled={saving || !form.escalaOcupacionalId}
                    options={catGrados.map((g) => ({
                      value: g,
                      label: String(g),
                    }))}
                    value={
                      form.grado != null
                        ? { value: form.grado, label: String(form.grado) }
                        : null
                    }
                    onChange={async (opt) => {
                      const grado = opt?.value ?? null;

                      setForm((p) => ({ ...p, grado, rmuPuesto: null }));

                      if (!form.escalaOcupacionalId || grado == null) return;

                      try {
                        setLoadingRmu(true);
                        const { data } = await api.get(`/catalogos/rmu`, {
                          params: {
                            escala_ocupacional_id: form.escalaOcupacionalId,
                            grado,
                          },
                        });
                        setForm((p) => ({ ...p, rmuPuesto: data?.rmu ?? null }));
                      } catch (e) {
                        console.error("Error cargando RMU:", e);
                        setForm((p) => ({ ...p, rmuPuesto: null }));
                      } finally {
                        setLoadingRmu(false);
                      }
                    }}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Remuneración mensual (RMU)
                    </label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        readOnly
                        value={
                          loadingRmu
                            ? "Cargando RMU..."
                            : (form.rmuPuesto ?? "")
                        }
                        className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3.5 bg-gray-50 focus:outline-none"
                        placeholder="Se autocompleta según escala + grado"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-linear-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex items-center justify-between px-8 py-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !canSubmit}
              className={`flex items-center gap-2 px-5 py-2.5 bg-linear-to-r text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-60 disabled:cursor-not-allowed ${colorBoton}`}
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{esEdicion ? "Guardando..." : "Registrando..."}</span>
                </>
              ) : (
                <>
                  <Icono size={18} />
                  <span>
                    {esEdicion
                      ? "Guardar cambios"
                      : continuarAccion
                        ? "Registrar y continuar"
                        : "Registrar servidor"}
                  </span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
