// Ventana de almuerzo institucional (debe coincidir con
// rrhh-backend/src/shared/constants/horario.js): los permisos que se
// traslapen con este rango no descuentan ese tiempo del saldo.
const ALMUERZO_INICIO = "12:00";
const ALMUERZO_FIN = "12:30";

// Réplica del cálculo del backend (calcularHorasPermiso.js) para que la
// vista previa en pantalla coincida con lo que realmente se va a guardar.
export function calcularHorasPermiso(hora_salida, hora_regreso) {
  const salida = new Date(`2000-01-01T${hora_salida}`);
  const regreso = new Date(`2000-01-01T${hora_regreso}`);
  const almuerzoInicio = new Date(`2000-01-01T${ALMUERZO_INICIO}`);
  const almuerzoFin = new Date(`2000-01-01T${ALMUERZO_FIN}`);

  const horasBrutas = (regreso - salida) / (1000 * 60 * 60);

  const traslapeInicio = new Date(Math.max(salida, almuerzoInicio));
  const traslapeFin = new Date(Math.min(regreso, almuerzoFin));
  const traslapeMs = Math.max(0, traslapeFin - traslapeInicio);
  const horasAlmuerzo = traslapeMs / (1000 * 60 * 60);

  return { horasBrutas, horasNetas: horasBrutas - horasAlmuerzo };
}
