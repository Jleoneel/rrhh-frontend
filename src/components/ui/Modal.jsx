export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  // En tu Modal.jsx component, agrega tamaños:
  const Modal = ({ open, onClose, children, size = "md" }) => {
    const sizes = {
      sm: "max-w-md",
      md: "max-w-xl",
      lg: "max-w-3xl",
      xl: "max-w-5xl",
      "2xl": "max-w-6xl",
      "3xl": "max-w-7xl",
    };

    return (
      // ... tu código de modal existente
      <div className={`${sizeClasses[size]} w-full`}>{/* contenido */}</div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[90vw] max-w-5xl rounded shadow-lg">
          <h2 className="font-semibold">{title}</h2>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
