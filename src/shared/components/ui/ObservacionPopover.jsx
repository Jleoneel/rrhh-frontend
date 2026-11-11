import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { MessageSquareText } from "lucide-react";

// Burbuja tipo "nube" que muestra el texto completo de una observación al
// hacer clic, para celdas de tabla donde el texto se corta con truncate.
// Usa position:fixed calculado desde el botón disparador (no un portal) para
// que no quede recortada por el overflow-x-auto del contenedor de la tabla.
export default function ObservacionPopover({ texto }) {
  const [abierto, setAbierto] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;

    const cerrarSiEsAfuera = (e) => {
      if (
        popoverRef.current?.contains(e.target) ||
        triggerRef.current?.contains(e.target)
      ) {
        return;
      }
      setAbierto(false);
    };
    const cerrar = () => setAbierto(false);

    document.addEventListener("mousedown", cerrarSiEsAfuera);
    // capture:true para detectar el scroll del contenedor de la tabla
    // (overflow-x-auto), que no hace bubbling como evento normal.
    window.addEventListener("scroll", cerrar, true);
    window.addEventListener("resize", cerrar);
    return () => {
      document.removeEventListener("mousedown", cerrarSiEsAfuera);
      window.removeEventListener("scroll", cerrar, true);
      window.removeEventListener("resize", cerrar);
    };
  }, [abierto]);

  if (!texto) {
    return <span className="text-sm text-gray-400">—</span>;
  }

  const handleClick = () => {
    const rect = triggerRef.current.getBoundingClientRect();
    const anchoPopover = 288;
    let left = rect.left;
    if (left + anchoPopover > window.innerWidth - 16) {
      left = Math.max(16, window.innerWidth - anchoPopover - 16);
    }
    setPos({ top: rect.bottom + 8, left });
    setAbierto((v) => !v);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1.5 max-w-[200px] text-left group/obs"
        title="Ver observación completa"
      >
        <MessageSquareText
          size={13}
          className="shrink-0 text-gray-400 group-hover/obs:text-green-600"
        />
        <span className="text-sm text-gray-600 truncate group-hover/obs:text-green-700 group-hover/obs:underline underline-offset-2">
          {texto}
        </span>
      </button>

      <AnimatePresence>
        {abierto && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 w-[288px] rounded-2xl bg-white shadow-xl border border-gray-200 p-4"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Observación
            </p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {texto}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
