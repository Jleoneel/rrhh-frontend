import { useAuth } from "../auth/authContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">
        Bienvenido, {user?.nombre}
      </h1>

      <p className="text-gray-500 mt-2">
        Cargo: {user?.cargo_nombre}
      </p>

      <button
        onClick={logout}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default Dashboard;
