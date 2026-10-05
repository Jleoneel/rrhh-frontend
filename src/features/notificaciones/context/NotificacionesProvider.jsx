import { useNotificaciones } from "../hooks/useNotificaciones";
import { NotificacionesContext } from "./NotificacionesContext";

export function NotificacionesProvider({ children }) {
  const value = useNotificaciones();
  return (
    <NotificacionesContext.Provider value={value}>
      {children}
    </NotificacionesContext.Provider>
  );
}
