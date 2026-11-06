import { useEffect, useMemo, useState } from "react";
import { X, Loader2, CalendarDays } from "lucide-react";
import { getCronogramaParaExportar } from "../hooks/cronogramaVacaciones.service";

const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function parseLocalDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function diasEnAnio(anio) {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0 ? 366 : 365;
}

// Día del año (1-indexado) de una fecha "YYYY-MM-DD", para ubicar la barra
// dentro de la línea de tiempo como % del ancho total.
function diaDelAnio(fechaStr, anio) {
  const fecha = parseLocalDate(fechaStr);
  const inicio = new Date(anio, 0, 1);
  return Math.round((fecha - inicio) / 86400000) + 1;
}

// % acumulado de días hasta el inicio de cada mes, para dibujar las líneas
// guía verticales de Ene/Feb/.../Dic sobre la línea de tiempo.
function offsetsMeses(anio) {
  const total = diasEnAnio(anio);
  let acumulado = 0;
  return MESES_CORTOS.map((_, i) => {
    const pct = (acumulado / total) * 100;
    acumulado += new Date(anio, i + 1, 0).getDate();
    return pct;
  });
}

// Vista "línea de tiempo" (Gantt) de todo el personal visible para quien
// consulta (mismo scoping que la tabla/export: unidad propia para jefe de
// área, todo el hospital para UATH/admin) — una fila por servidor con sus
// bloques de vacaciones del año marcados sobre el calendario, para comparar
// de un vistazo quién se va cuándo.
export default function CronogramaGanttModal({
  open, onClose, anio, unidadFiltro, search,
}) {
  const [cargando, setCargando] = useState(false);
  const [filas, setFilas] = useState([]);
  const [soloConVacaciones, setSoloConVacaciones] = useState(true);

  useEffect(() => {
    if (!open) return;
    setCargando(true);
    const params = { anio };
    if (unidadFiltro) params.unidad_organica_id = unidadFiltro;
    if (search) params.search = search;
    getCronogramaParaExportar(params)
      .then((res) => setFilas(res.data))
      .catch(() => setFilas([]))
      .finally(() => setCargando(false));
  }, [open, anio, unidadFiltro, search]);

  const marcasMeses = useMemo(() => offsetsMeses(anio), [anio]);
  const totalDiasAnio = useMemo(() => diasEnAnio(anio), [anio]);

  const filasVisibles = soloConVacaciones
    ? filas.filter((f) => f.bloques.length > 0)
    : filas;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-6 py-5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Calendario de vacaciones {anio}</h2>
                <p className="text-sm text-blue-100">
                  Quién se va y cuándo, de un vistazo
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-all hover:rotate-90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={soloConVacaciones}
              onChange={(e) => setSoloConVacaciones(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            Mostrar solo quienes tienen vacaciones planificadas
          </label>
          <span className="text-xs text-gray-400">
            Pasa el cursor sobre una barra para ver las fechas exactas
          </span>
        </div>

        <div className="overflow-auto flex-1">
          {cargando ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filasVisibles.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              No hay personal con vacaciones planificadas en {anio}
            </div>
          ) : (
            <div className="min-w-[900px]">
              {/* Encabezado de meses */}
              <div className="flex sticky top-0 bg-white z-10 border-b border-gray-200">
                <div className="w-56 shrink-0 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Servidor
                </div>
                <div className="flex-1 relative h-8">
                  {MESES_CORTOS.map((m, i) => (
                    <span
                      key={m}
                      className="absolute top-2 text-xs font-semibold text-gray-500"
                      style={{ left: `${marcasMeses[i]}%` }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Filas */}
              <div className="divide-y divide-gray-100">
                {filasVisibles.map((f) => (
                  <div key={f.servidor_id} className="flex items-stretch hover:bg-gray-50">
                    <div className="w-56 shrink-0 px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {f.nombres}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {f.denominacion || f.cedula}
                      </p>
                    </div>
                    <div className="flex-1 relative py-3 pr-4">
                      {/* Líneas guía de cada mes */}
                      {marcasMeses.map((pct, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-l border-gray-100"
                          style={{ left: `${pct}%` }}
                        />
                      ))}
                      {/* Pista */}
                      <div className="relative h-6 bg-gray-50 rounded-lg">
                        {f.bloques.map((b, i) => {
                          const inicio = diaDelAnio(b.fecha_desde, anio);
                          const finCrudo = diaDelAnio(b.fecha_hasta, anio);
                          const fin = Math.min(finCrudo, totalDiasAnio);
                          const left = Math.max(0, ((inicio - 1) / totalDiasAnio) * 100);
                          const width = Math.max(
                            ((fin - inicio + 1) / totalDiasAnio) * 100,
                            0.8,
                          );
                          return (
                            <div
                              key={i}
                              title={`${b.fecha_desde} → ${b.fecha_hasta} (${b.dias} días)`}
                              className="absolute top-0 h-6 bg-blue-500 hover:bg-blue-600 rounded-md shadow-sm transition-colors cursor-default"
                              style={{ left: `${left}%`, width: `${width}%` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
