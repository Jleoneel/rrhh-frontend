import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { X } from "lucide-react";
import Modal from "./Modal";

const TEMAS = {
  green: {
    fondo: "bg-green-50",
    icono: "text-green-600",
    boton: "bg-green-600 hover:bg-green-700",
    puntoActivo: "bg-green-600",
  },
  blue: {
    fondo: "bg-blue-50",
    icono: "text-blue-600",
    boton: "bg-blue-600 hover:bg-blue-700",
    puntoActivo: "bg-blue-600",
  },
};

// Carrusel de bienvenida tipo "qué hay de nuevo": una tarjeta por
// funcionalidad, con "Siguiente" para avanzar. Cerrarlo (con la X o en la
// última tarjeta) cuenta como "ya lo vi" — el llamador decide qué hacer con
// eso (guardar la versión vista en base de datos).
export default function OnboardingModal({
  open,
  onFinish,
  slides,
  tema = "green",
}) {
  const [paso, setPaso] = useState(0);
  const colores = TEMAS[tema] || TEMAS.green;
  const esUltimo = paso === slides.length - 1;
  const slide = slides[paso];

  const cerrar = () => {
    setPaso(0);
    onFinish?.();
  };

  const siguiente = () => {
    if (esUltimo) {
      cerrar();
    } else {
      setPaso((p) => p + 1);
    }
  };

  if (!slide) return null;
  const Icono = slide.icon;

  return (
    <Modal open={open} onClose={cerrar} size="sm">
      <div className="relative overflow-hidden rounded-2xl">
        <button
          onClick={cerrar}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
          title="Cerrar"
        >
          <X size={20} />
        </button>

        <div className={`px-8 pt-10 pb-6 ${colores.fondo}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={paso}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5">
                <Icono size={30} className={colores.icono} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {slide.titulo}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {slide.descripcion}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === paso ? `w-5 ${colores.puntoActivo}` : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>
          <button
            onClick={siguiente}
            className={`px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors ${colores.boton}`}
          >
            {esUltimo ? "Entendido" : "Siguiente"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
