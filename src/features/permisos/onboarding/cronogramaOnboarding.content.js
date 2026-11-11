import {
  Sparkles,
  Plus,
  CalendarRange,
  AlertTriangle,
  Download,
  Bell,
  CheckCircle2,
  Umbrella,
} from "lucide-react";

// Súbele este número cada vez que agreguemos una funcionalidad nueva al
// Cronograma y quieras que el aviso vuelva a aparecer (aunque el usuario ya
// haya visto una versión anterior). El backend guarda, por usuario, la
// última versión que vio (ver src/shared/api/onboarding.service.js).
export const CRONOGRAMA_ONBOARDING_VERSION = 1;
export const CRONOGRAMA_ONBOARDING_MODULO = "cronograma_vacaciones";

export const SLIDES_JEFE = [
  {
    icon: Sparkles,
    titulo: "¡Bienvenido al Cronograma de Vacaciones!",
    descripcion:
      "Te mostramos rápido cómo planificar las vacaciones de tu personal con anticipación, directo desde aquí.",
  },
  {
    icon: Plus,
    titulo: "Planifica un bloque",
    descripcion:
      'Con "+ Nuevo bloque" eliges al servidor y el rango de fechas que le propones para sus vacaciones del año.',
  },
  {
    icon: CalendarRange,
    titulo: "Visualiza a todo tu equipo",
    descripcion:
      'El botón "Ver calendario" te muestra una línea de tiempo con todo tu personal, para evitar que varios coincidan en las mismas fechas.',
  },
  {
    icon: AlertTriangle,
    titulo: "Tope de días por servidor",
    descripcion:
      "Cada servidor tiene su propio tope de días disponibles. Cuando lo alcanza, su fila se resalta en naranja.",
  },
  {
    icon: Download,
    titulo: "Exporta a Excel",
    descripcion:
      "Puedes descargar el cronograma completo en Excel, listo para compartir o imprimir.",
  },
  {
    icon: Bell,
    titulo: "El servidor confirma",
    descripcion:
      "Cuando programas un bloque, el servidor recibe un aviso para confirmar o descartar esas fechas — la solicitud sigue el mismo flujo de firmas de siempre.",
  },
];

export const SLIDES_SERVIDOR = [
  {
    icon: Sparkles,
    titulo: "Nueva función: Cronograma de Vacaciones",
    descripcion:
      "Ahora tu jefe inmediato puede planificar tus vacaciones con anticipación, para organizar mejor a todo el personal.",
  },
  {
    icon: Bell,
    titulo: "Recibirás un aviso",
    descripcion:
      'Cuando tu jefe te proponga fechas, vas a ver un aviso aquí mismo, en "Mis Vacaciones".',
  },
  {
    icon: CheckCircle2,
    titulo: "Tú decides",
    descripcion:
      'Puedes "Solicitar" para enviar la solicitud con esas fechas, o "Descartar" si no te convienen — nada se aprueba automáticamente.',
  },
  {
    icon: Umbrella,
    titulo: "El mismo proceso de siempre",
    descripcion:
      "Una vez que solicitas, la petición sigue el mismo flujo de firmas (jefe, jefe superior, UATH) de cualquier vacación.",
  },
];
