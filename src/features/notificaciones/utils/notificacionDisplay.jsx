import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  FileSignature,
  FileText,
} from "lucide-react";

// Lógica de presentación compartida entre la campana de notificaciones y el
// toaster — un único lugar para el ícono/mensaje/color de cada categoría
// (FIRMA, RECEPCION, PERMISO, VACACION) evita que ambos componentes diverjan.

export function renderIconoNotificacion(n) {
  if (n.categoria === "FIRMA")
    return <FileText size={14} className="text-blue-500" />;
  if (n.categoria === "RECEPCION")
    return <FileSignature size={14} className="text-blue-500" />;
  if (n.categoria === "VACACION")
    return <Calendar size={14} className="text-green-500" />;
  if (n.tipo === "APROBADO")
    return <CheckCircle size={14} className="text-green-500" />;
  if (n.tipo === "RECHAZADO")
    return <XCircle size={14} className="text-red-500" />;
  return <Clock size={14} className="text-yellow-500" />;
}

export function renderMensajeNotificacion(n) {
  if (n.categoria === "FIRMA") {
    return (
      <>
        <p className="text-sm font-medium text-gray-800">
          Firma pendiente — Paso {n.orden}: {n.rol_firma}
        </p>
        {n.codigo_elaboracion && (
          <p className="text-xs text-gray-500">
            Acción: {n.codigo_elaboracion}
          </p>
        )}
      </>
    );
  }
  if (n.categoria === "RECEPCION") {
    return (
      <>
        <p className="text-sm font-medium text-gray-800">
          Acción de Personal para firmar como recibida
        </p>
        {n.tipo_accion && (
          <p className="text-xs text-gray-500">{n.tipo_accion}</p>
        )}
        {n.codigo_elaboracion && (
          <p className="text-xs text-gray-400">{n.codigo_elaboracion}</p>
        )}
      </>
    );
  }
  if (n.categoria === "VACACION") {
    return (
      <>
        <p className="text-sm font-medium text-gray-800">
          {n.tipo === "APROBADO" && "Tus vacaciones fueron aprobadas"}
          {n.tipo === "NEGADO" && "Tu solicitud de vacaciones fue negada"}
          {n.tipo === "NUEVA_SOLICITUD" && "Nueva solicitud de vacaciones"}
        </p>
        {n.servidor_nombre && (
          <p className="text-xs text-gray-500">{n.servidor_nombre}</p>
        )}
        {n.fecha_inicio && (
          <p className="text-xs text-gray-400">
            {new Date(n.fecha_inicio + "T12:00:00").toLocaleDateString(
              "es-ES",
              { day: "2-digit", month: "short" },
            )}
            {" → "}
            {new Date(n.fecha_fin + "T12:00:00").toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
            {" · "}
            {n.dias_solicitados} días
          </p>
        )}
      </>
    );
  }
  return (
    <>
      <p className="text-sm font-medium text-gray-800">
        {n.tipo === "APROBADO" && "Tu permiso fue aprobado"}
        {n.tipo === "RECHAZADO" && "Tu permiso fue rechazado"}
        {n.tipo === "NUEVA_SOLICITUD" && "Nueva solicitud de permiso"}
      </p>
      {n.servidor_nombre && (
        <p className="text-xs text-gray-500">{n.servidor_nombre}</p>
      )}
    </>
  );
}

export function colorNotificacion(n) {
  if (n.categoria === "FIRMA")
    return "bg-blue-100 border-l-4 border-blue-400";
  if (n.categoria === "RECEPCION")
    return "bg-blue-100 border-l-4 border-blue-400";
  if (n.categoria === "VACACION")
    return "bg-green-50 border-l-4 border-green-400";
  if (n.tipo === "APROBADO") return "bg-green-50 border-l-4 border-green-400";
  if (n.tipo === "RECHAZADO") return "bg-red-50 border-l-4 border-red-400";
  return "bg-yellow-50 border-l-4 border-yellow-400";
}

// A qué ruta debe navegar un click sobre la notificación, según el tipo de
// usuario actual (independiente de si es Jefe de Área/Gerente/UATH: esas
// variantes comparten las mismas rutas de bandeja, solo el servidor difiere).
export function rutaParaCategoria(categoria, tipoUsuario) {
  const esServidor = tipoUsuario === "SERVIDOR";
  if (categoria === "RECEPCION") return "/servidor/acciones";
  if (categoria === "FIRMA") return "/acciones";
  if (categoria === "PERMISO")
    return esServidor ? "/servidor/permisos" : "/permisos/bandeja";
  if (categoria === "VACACION")
    return esServidor ? "/servidor/vacaciones" : "/permisos/bandeja-vacaciones";
  return null;
}
