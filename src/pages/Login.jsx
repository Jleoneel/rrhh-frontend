import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/authContext";
import { useNavigate } from "react-router-dom";
import { User, LockKeyhole, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        cedula,
        password,
      });

      // Guardar token y usuario
      login(res.data.token, res.data.firmante);

      // Redirigir después de login exitoso
      navigate("/dashboard", { replace: true });
      Swal.fire({
        toast: true,
        title: "Sesión iniciada, bienvenido!",
        position: "top-end",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: err.response?.data?.message,
        icon: "error",
        width: 500,
        confirmButtonColor: "#ff0000",
      });
    } finally {
      setLoading(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-black-100 p-4 bg-gradient-to-b from-blue-700 to-blue-800">
    <div className="w-full max-w-4xl flex overflow-hidden rounded-3xl shadow-2xl">
      {/* Panel izquierdo - Branding institucional */}
      <div className="hidden md:flex md:w-2/5 bg-gradient-to-b from-blue-700 to-blue-800 p-8 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/20 rounded-lg">
              <img 
                src="/msp.jpg" 
                alt="Logo MSP" 
                className="h-12 w-auto"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">MINISTERIO</h2>
              <h3 className="text-lg">SALUD PÚBLICA</h3>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Sistema de Talento Humano</h1>
          <p className="text-blue-100 mb-6">
            Plataforma integral para la gestión de recursos humanos del MSP
          </p>
          
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <span>Gestión de personal centralizada</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <span>Acceso seguro con autenticación</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                </svg>
              </div>
              <span>Reportes y estadísticas en tiempo real</span>
            </div>
          </div>
        </div>
        
        <div className="text-blue-200 text-sm">
          <p>© {new Date().getFullYear()} Ministerio de Salud Pública</p>
          <p className="mt-1">Todos los derechos reservados</p>
        </div>
      </div>
      
      {/* Panel derecho - Formulario */}
      <div className="w-full md:w-3/5 bg-white p-8 md:p-12 flex flex-col justify-center">
        <div className="md:hidden mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/msp.jpg" 
              alt="Logo MSP" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MINISTERIO DE SALUD PÚBLICA</h1>
          <p className="text-gray-600 mt-1">Talento Humano</p>
        </div>
        
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="text-gray-600 mt-2">Ingrese sus credenciales para acceder al sistema</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campos del formulario (tus campos actuales) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ingresa tu cédula"
                  value={cedula}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    setCedula(onlyNumbers.slice(0, 10));
                  }}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
                {cedula.length > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className={`text-xs ${cedula.length === 10 ? 'text-green-600' : 'text-gray-400'}`}>
                      {cedula.length}/10
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {/* Recordar y olvidó contraseña */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Recordar usuario
                </label>
              </div>
            </div>
            
            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>
          
          {/* Información de contacto */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 mt-4">
                  v1.1.1 • Acceso restringido al personal autorizado
                </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Login;
