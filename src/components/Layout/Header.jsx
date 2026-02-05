import { useAuth } from "../../auth/authContext";

export default function Header({ title, showNewAction, onNuevaAccion }) {
  const { user } = useAuth();
  const isUATH = user?.cargo_nombre === "ASISTENTE DE LA UATH";

  return (
    <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">{title}</h1>

      {showNewAction && isUATH && (
        <button
          onClick={onNuevaAccion}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nueva acción
        </button>
      )}
    </header>
  );
}
