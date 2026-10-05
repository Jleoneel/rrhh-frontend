import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { X } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { useNotificacionesCtx } from "../context/NotificacionesContext";
import {
  renderIconoNotificacion,
  renderMensajeNotificacion,
  colorNotificacion,
  rutaParaCategoria,
} from "../utils/notificacionDisplay";

const DURACION_MS = 6000;

// Identificador estable de una notificación: las que llegan por REST traen
// `id` (PK real); las que llegan por SSE solo traen `solicitud_id`/
// `accion_id` (mismo criterio que ya usa useNotificaciones para deduplicar).
const claveNotificacion = (n) =>
  `${n.categoria}:${n.id ?? n.solicitud_id ?? n.accion_id}`;

export default function NotificacionesToaster() {
  const { user } = useAuth();
  const { notificaciones } = useNotificacionesCtx();
  const navigate = useNavigate();

  const [cola, setCola] = useState([]);
  const mostradasRef = useRef(new Set());

  // Encola cualquier notificación que todavía no se haya mostrado como toast
  // en esta sesión (carga inicial + lo que vaya llegando por SSE).
  useEffect(() => {
    const nuevas = notificaciones.filter(
      (n) => !mostradasRef.current.has(claveNotificacion(n)),
    );
    if (nuevas.length === 0) return;
    nuevas.forEach((n) => mostradasRef.current.add(claveNotificacion(n)));
    setCola((prev) => [...prev, ...nuevas]);
  }, [notificaciones]);

  const actual = cola[0] ?? null;

  // Auto-descarte del toast visible, una por una.
  useEffect(() => {
    if (!actual) return;
    const t = setTimeout(() => setCola((prev) => prev.slice(1)), DURACION_MS);
    return () => clearTimeout(t);
  }, [actual]);

  if (!actual) return null;

  const ruta = rutaParaCategoria(actual.categoria, user?.tipo_usuario);

  const irAlModulo = () => {
    setCola((prev) => prev.slice(1));
    if (ruta) navigate(ruta);
  };

  const descartar = (e) => {
    e.stopPropagation();
    setCola((prev) => prev.slice(1));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-80 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={claveNotificacion(actual)}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={irAlModulo}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border border-gray-200 shadow-2xl cursor-pointer ${colorNotificacion(actual)}`}
        >
          <div className="mt-0.5 shrink-0">
            {renderIconoNotificacion(actual)}
          </div>
          <div className="flex-1 min-w-0">
            {renderMensajeNotificacion(actual)}
          </div>
          <button
            onClick={descartar}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
