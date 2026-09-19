const ACTIVE_COLOR = {
  blue: "bg-blue-600",
  green: "bg-green-600",
};

// Navegador "Anterior / números / Siguiente" reutilizado en todas las
// tablas y reportes paginados. Muestra como máximo 5 números de página,
// centrados alrededor de la página actual. Es un componente controlado:
// quien lo usa mantiene `page`/`totalPages` y responde a `onPageChange`.
export default function PageNumbers({ page, totalPages, onPageChange, color = "blue" }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Anterior
      </button>
      <div className="flex items-center gap-1">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                page === pageNum
                  ? `${ACTIVE_COLOR[color]} text-white shadow-md`
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Siguiente
      </button>
    </div>
  );
}
