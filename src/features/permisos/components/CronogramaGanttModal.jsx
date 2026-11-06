import { useEffect, useMemo, useState } from "react";
import { X, Loader2, CalendarDays } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { getCronogramaParaExportar } from "../hooks/cronogramaVacaciones.service";

const MESES_CORTOS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const MESES_LARGOS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

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

function formatearRango(fechaDesde, fechaHasta) {
  const opciones = { day: "numeric", month: "long" };
  const desde = parseLocalDate(fechaDesde).toLocaleDateString("es-ES", opciones);
  const hasta = parseLocalDate(fechaHasta).toLocaleDateString("es-ES", {
    ...opciones,
    year: "numeric",
  });
  return `${desde} – ${hasta}`;
}

// Celdas del mes de `fecha` (día 1 del bloque) para dibujar el minicalendario
// de "entrada al mes": null para el relleno antes del día 1 (semana
// empezando en lunes), y la fecha real para cada día del mes.
function celdasDelMes(fecha) {
  const anio = fecha.getFullYear();
  const mes = fecha.getMonth();
  const primerDia = new Date(anio, mes, 1);
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  let relleno = primerDia.getDay(); // 0=domingo
  relleno = relleno === 0 ? 6 : relleno - 1; // 0=lunes
  const celdas = Array.from({ length: relleno }, () => null);
  for (let d = 1; d <= diasEnMes; d++) celdas.push(new Date(anio, mes, d));
  return celdas;
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
  // Bloque cuya barra fue clickeada: { clave, nombre, fecha_desde,
  // fecha_hasta, dias } o null si ninguna. Al tener la misma `layoutId`
  // que su barra compacta, framer-motion anima la transición entre
  // ambas automáticamente (la barra "entra" al mes).
  const [bloqueActivo, setBloqueActivo] = useState(null);

  useEffect(() => {
    if (!open) return;
    setCargando(true);
    setBloqueActivo(null);
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
      <LayoutGroup>
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
            Haz clic en una barra para entrar al mes
          </span>
        </div>

        <div className="relative overflow-auto flex-1">
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
                          const clave = `${f.servidor_id}-${i}`;
                          const activo = bloqueActivo?.clave === clave;
                          // La barra compacta se deja de renderizar justo
                          // cuando se abre su mes (misma layoutId que la
                          // tarjeta grande) — ese intercambio es lo que
                          // framer-motion anima como una sola transición
                          // continua, la barra "entrando" al calendario.
                          if (activo) return null;
                          return (
                            <motion.div
                              key={i}
                              layoutId={clave}
                              layout
                              onClick={(e) => {
                                e.stopPropagation();
                                setBloqueActivo({
                                  clave,
                                  nombre: f.nombres,
                                  fecha_desde: b.fecha_desde,
                                  fecha_hasta: b.fecha_hasta,
                                  dias: b.dias,
                                });
                              }}
                              whileHover={{ scale: 1.08 }}
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              className="absolute top-0 h-6 bg-blue-500 rounded-md shadow-sm cursor-pointer"
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

      {/* "Entrada al mes" — la barra clickeada se convierte en este
          minicalendario (misma layoutId), con sus días resaltados y
          subrayados dentro del mes completo. Vive fuera de la tarjeta del
          modal (no dentro de su overflow-hidden) para quedar centrada en
          toda la ventana y no recortarse si el modal es más bajo que ella. */}
      <AnimatePresence>
        {bloqueActivo && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBloqueActivo(null)}
          >
            <motion.div
              layoutId={bloqueActivo.clave}
              layout
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden"
            >
              <MesEntrada bloque={bloqueActivo} onClose={() => setBloqueActivo(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}

// Minicalendario del mes donde empieza el bloque, con los días del rango
// resaltados y subrayados — la "entrada al mes" que pidió el usuario en vez
// de solo un texto con las fechas.
function MesEntrada({ bloque, onClose }) {
  const inicio = parseLocalDate(bloque.fecha_desde);
  const fin = parseLocalDate(bloque.fecha_hasta);
  const celdas = celdasDelMes(inicio);

  return (
    <div>
      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-5 py-4 flex items-center justify-between">
        <div>
          <p className="font-bold capitalize">
            {MESES_LARGOS[inicio.getMonth()]} {inicio.getFullYear()}
          </p>
          <p className="text-xs text-blue-100 truncate max-w-[200px]">
            {bloque.nombre}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-all shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DIAS_SEMANA.map((d) => (
            <div
              key={d}
              className="text-center text-[11px] font-semibold text-gray-400"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {celdas.map((fecha, i) => {
            if (!fecha) return <div key={i} />;
            const enRango = fecha >= inicio && fecha <= fin;
            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                  enRango
                    ? "bg-blue-600 text-white font-bold underline decoration-2 underline-offset-2"
                    : "text-gray-600"
                }`}
              >
                {fecha.getDate()}
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-700 font-medium">
            {formatearRango(bloque.fecha_desde, bloque.fecha_hasta)}
          </p>
          <p className="text-xs text-blue-600 font-semibold mt-0.5">
            {bloque.dias} días de vacación
          </p>
        </div>
      </div>
    </div>
  );
}
