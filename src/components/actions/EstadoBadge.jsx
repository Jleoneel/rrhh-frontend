const colors = {
  BORRADOR: "bg-gray-200 text-gray-800",
  EN_FIRMA: "bg-yellow-100 text-yellow-800",
  APROBADO: "bg-green-100 text-green-800",
};

export default function EstadoBadge({ estado }) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${colors[estado]}`}
    >
      {estado}
    </span>
  );
}
