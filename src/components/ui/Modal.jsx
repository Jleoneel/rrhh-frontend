import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const sizes = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
  "3xl": "max-w-7xl",
  "4xl": "max-w-5xl", // ← cambia esto, era lo que tenías antes
};

export default function Modal({
  open,
  onClose,
  children,
  size = "md",
  className = "",
}) {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && open) onClose?.();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.25,
                ease: [0.16, 1, 0.3, 1], // ease out expo
              }}
              className={`
                 ${sizes[size]} w-full bg-white rounded-2xl shadow-2xl
                  pointer-events-auto ${className}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
