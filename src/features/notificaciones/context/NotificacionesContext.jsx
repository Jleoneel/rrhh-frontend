import { createContext, useContext } from "react";

// Una sola instancia de useNotificaciones() (y por lo tanto de sus conexiones
// SSE) compartida entre Sidebar, la campana y el toaster. Antes cada uno la
// llamaba por su cuenta: con 3 consumidores eso son 6 EventSource abiertos a
// la vez contra el backend, justo el límite de 6 conexiones concurrentes por
// origen de HTTP/1.1 — al tocarlo, cualquier otra petición (incluida la
// propia carga de notificaciones) se quedaba colgada esperando un socket
// libre. Con el contexto queda en 2 conexiones SSE sin importar cuántos
// componentes consuman los datos.
export const NotificacionesContext = createContext(null);

export function useNotificacionesCtx() {
  const ctx = useContext(NotificacionesContext);
  if (!ctx) {
    throw new Error(
      "useNotificacionesCtx debe usarse dentro de <NotificacionesProvider>",
    );
  }
  return ctx;
}
