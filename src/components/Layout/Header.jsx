import { useAuth } from "../../auth/authContext";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">
        Acciones de Personal
      </h1>

      {user?.cargo_nombre === "ASISTENTE DE LA UATH" && (
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          + Nueva acción
        </button>
      )}
    </header>
  );
}
