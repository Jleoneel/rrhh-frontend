// Convierte una cantidad de horas al formato detallado "X días y Y horas"
// (1 día laboral = 8 horas). Usado en todas las pantallas que muestran
// saldo de Permisos/Vacaciones, para mostrar siempre el mismo desglose en
// vez de un decimal ambiguo (ej. "9.8 días").
export function horasADias(horas) {
  if (horas === null || horas === undefined) return "0";

  const diasCompletos = Math.floor(horas / 8);
  const horasRestantes = horas % 8;

  if (horasRestantes === 0) {
    return `${diasCompletos}`;
  }
  if (diasCompletos === 0) {
    return `${horasRestantes} horas`;
  }
  return `${diasCompletos} días y ${horasRestantes} horas`;
}
