import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Guardar token y usuario en el localStorage y actualizar el estado
  const login = (token, firmante) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(firmante));
    setToken(token);
    setUser(firmante);
  };
  // Eliminar token y usuario del localStorage y actualizar el estado
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
