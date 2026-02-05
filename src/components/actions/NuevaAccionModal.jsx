import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import api from "../../api/axios";
import { getTiposAccion } from "../../services/tiposAccion.service";
import { crearAccion } from "../../services/acciones.service";

const STEPS = [
  { id: 1, label: "1. Datos Generales" },
  { id: 2, label: "2. Motivación" },
  { id: 3, label: "3. Situación Laboral" },
  { id: 4, label: "4. Revisión" },
];

const initialForm = {
  // Step 1
  cedula: "",
  servidorNombre: "",
  tipoAccionNombre: "",
  rigeDesde: "",
  rigeHasta: "",

  // Accion creada
  accionId: "",

  // Step 2
  motivo: "",

  // Step 3
  situacionActual: null,
};

export default function NuevaAccionModal({ open, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);

  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(false);

  const [loadingServ, setLoadingServ] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  const [error, setError] = useState("");

  // Reset al abrir/cerrar
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setForm(initialForm);
    setError("");
  }, [open]);

  // Cargar tipos de acción cuando abre el modal
  useEffect(() => {
    if (!open) return;

    const fetchTipos = async () => {
      setLoadingTipos(true);
      try {
        const data = await getTiposAccion();
        setTipos(data);

        setForm((prev) => ({
          ...prev,
          tipoAccionNombre: prev.tipoAccionNombre || data?.[0]?.nombre || "",
        }));
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar los tipos de acción.");
      } finally {
        setLoadingTipos(false);
      }
    };

    fetchTipos();
  }, [open]);

  const handleClose = () => {
    setStep(1);
    setForm(initialForm);
    setError("");
    onClose();
  };

  const fetchSituacionActual = async () => {
    const cedula = form.cedula.trim();
    if (!cedula) return;

    setLoadingServ(true);
    setError("");

    try {
      const { data } = await api.get(`/servidores/${cedula}/situacion-actual`);

      setForm((prev) => ({
        ...prev,
        servidorNombre: data.nombres,
        situacionActual: {
          unidad_organica: data.unidad_organica,
          lugar_trabajo: data.lugar_trabajo,
          denominacion_puesto: data.denominacion_puesto,
          grupo_ocupacional: data.grupo_ocupacional,
          grado: data.grado,
          rmu_puesto: data.rmu_puesto,
          partida_individual: data.partida_individual,
        },
      }));
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        servidorNombre: "",
        situacionActual: null,
      }));
      setError(err.response?.data?.message || "Servidor no encontrado.");
    } finally {
      setLoadingServ(false);
    }
  };

  // Validación Step 1 antes de crear acción
  const canGoStep2 = useMemo(() => {
    return (
      form.cedula.trim() &&
      form.servidorNombre &&
      form.tipoAccionNombre &&
      form.rigeDesde &&
      form.situacionActual
    );
  }, [form]);

  const nextFromStep1 = async () => {
    if (!canGoStep2) {
      setError("Completa la cédula, tipo de acción, RIGE desde y verifica el servidor.");
      return;
    }

    setLoadingNext(true);
    setError("");

    try {
      // Creamos acción con el motivo vacío por ahora (se completa en Step 2)
      const result = await crearAccion({
        cedula: form.cedula.trim(),
        tipoAccionNombre: form.tipoAccionNombre,
        motivo: "PENDIENTE", // placeholder: luego lo actualizamos cuando tengas endpoint PUT/PATCH
      });

      setForm((prev) => ({
        ...prev,
        accionId: result.accion_id,
      }));

      setStep(2);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error creando la acción.");
    } finally {
      setLoadingNext(false);
    }
  };

  const next = () => setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const finish = async () => {
    // Por ahora: cerramos y refrescamos. Luego aquí puedes:
    // - actualizar motivo en backend
    // - generar PDF
    // - etc.
    if (onSuccess) await onSuccess();
    handleClose();
  };

  return (
    <Modal open={open} title="Registrar Nueva Acción de Personal" onClose={handleClose}>
      {/* Tabs */}
      <div className="bg-gray-100 rounded p-2 flex gap-2 text-sm mb-4">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`flex-1 text-center py-2 rounded ${
              step === s.id ? "bg-blue-600 text-white" : "text-gray-600"
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm mb-4">
          {error}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cédula</label>
              <input
                value={form.cedula}
                onChange={(e) => setForm((p) => ({ ...p, cedula: e.target.value }))}
                onBlur={fetchSituacionActual}
                className="w-full border rounded px-3 py-2"
                placeholder="Cédula"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={fetchSituacionActual}
                disabled={loadingServ}
                className="px-4 py-2 border rounded w-full"
              >
                {loadingServ ? "Buscando..." : "Buscar servidor"}
              </button>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Servidor</label>
              <input
                value={form.servidorNombre || ""}
                readOnly
                className="w-full border rounded px-3 py-2 bg-gray-50"
                placeholder="Se autocompleta..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipo de acción</label>
              {loadingTipos ? (
                <div className="text-sm text-gray-500">Cargando...</div>
              ) : (
                <select
                  value={form.tipoAccionNombre || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tipoAccionNombre: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2"
                >
                  {tipos.map((t) => (
                    <option key={t.id} value={t.nombre}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">RIGE desde</label>
              <input
                type="date"
                value={form.rigeDesde || ""}
                onChange={(e) => setForm((p) => ({ ...p, rigeDesde: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                RIGE hasta (cuando aplique)
              </label>
              <input
                type="date"
                value={form.rigeHasta || ""}
                onChange={(e) => setForm((p) => ({ ...p, rigeHasta: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border rounded"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={nextFromStep1}
              disabled={loadingNext || !canGoStep2}
              className="px-5 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loadingNext ? "Creando..." : "Siguiente →"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Motivación</label>
            <textarea
              value={form.motivo}
              onChange={(e) => setForm((p) => ({ ...p, motivo: e.target.value }))}
              rows={5}
              className="w-full border rounded px-3 py-2"
              placeholder="Escriba la motivación..."
            />
          </div>

          {/* (Anexos) placeholder */}
          <div className="border-2 border-dashed rounded p-4 text-center text-gray-500 text-sm">
            Adjuntar anexo (opcional) — lo conectamos después con tu endpoint de documentos.
          </div>

          <div className="flex justify-between pt-2">
            <button type="button" onClick={prev} className="px-4 py-2 border rounded">
              ← Anterior
            </button>

            <button
              type="button"
              onClick={next}
              disabled={!form.motivo.trim()}
              className="px-5 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-4">
          {!form.situacionActual ? (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-sm">
              No hay situación actual cargada. Vuelve al paso 1.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Unidad Administrativa" value={form.situacionActual.unidad_organica} />
              <Field label="Lugar de Trabajo" value={form.situacionActual.lugar_trabajo} />
              <Field label="Denominación de Puesto" value={form.situacionActual.denominacion_puesto} />
              <Field label="Grupo Ocupacional" value={form.situacionActual.grupo_ocupacional} />
              <Field label="Grado" value={form.situacionActual.grado} />
              <Field label="Remuneración Mensual" value={form.situacionActual.rmu_puesto} />
              <Field label="Partida Individual" value={form.situacionActual.partida_individual} />
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button type="button" onClick={prev} className="px-4 py-2 border rounded">
              ← Anterior
            </button>

            <button
              type="button"
              onClick={next}
              className="px-5 py-2 bg-blue-600 text-white rounded"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="border rounded p-4 bg-gray-50">
            <div className="font-semibold mb-2">Revisión</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <ReviewRow label="Acción ID" value={form.accionId || "-"} />
              <ReviewRow label="Estado" value="BORRADOR" />
              <ReviewRow label="Cédula" value={form.cedula} />
              <ReviewRow label="Servidor" value={form.servidorNombre} />
              <ReviewRow label="Tipo de acción" value={form.tipoAccionNombre} />
              <ReviewRow label="RIGE desde" value={form.rigeDesde} />
              <ReviewRow label="RIGE hasta" value={form.rigeHasta || "—"} />
              <ReviewRow label="Motivo" value={form.motivo} />
            </div>
          </div>

          {form.situacionActual && (
            <div className="border rounded p-4">
              <div className="font-semibold mb-2">Situación Actual</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <ReviewRow label="Unidad Administrativa" value={form.situacionActual.unidad_organica} />
                <ReviewRow label="Lugar de Trabajo" value={form.situacionActual.lugar_trabajo} />
                <ReviewRow label="Denominación" value={form.situacionActual.denominacion_puesto} />
                <ReviewRow label="Grupo ocupacional" value={form.situacionActual.grupo_ocupacional} />
                <ReviewRow label="Grado" value={form.situacionActual.grado} />
                <ReviewRow label="RMU" value={form.situacionActual.rmu_puesto} />
                <ReviewRow label="Partida" value={form.situacionActual.partida_individual} />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button type="button" onClick={prev} className="px-4 py-2 border rounded">
              ← Anterior
            </button>

            <button
              type="button"
              onClick={finish}
              className="px-5 py-2 bg-blue-600 text-white rounded"
            >
              Finalizar ✓
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="border rounded px-3 py-2 bg-gray-50">{value || "-"}</div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value || "-"}</div>
    </div>
  );
}
