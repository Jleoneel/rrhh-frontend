export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  // En tu Modal.jsx component, agrega tamaños:
  const Modal = ({ open, onClose, children, size = "md" }) => {
    const sizeClasses = {
      sm: "max-w-md",
      md: "max-w-lg",
      lg: "max-w-2xl",
      xl: "max-w-4xl",
      full: "max-w-full mx-4",
    };

    return (
      // ... tu código de modal existente
      <div className={`${sizeClasses[size]} w-full`}>{/* contenido */}</div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded shadow-lg">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
