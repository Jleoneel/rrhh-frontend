// Convierte una cantidad de horas al formato detallado "X días, Y horas
// y Z minutos" (1 día laboral = 8 horas), omitiendo cualquier parte en
// cero. Usado en todas las pantallas que muestran saldo o duración de
// Permisos/Vacaciones, para mostrar siempre el mismo desglose en vez de
// un decimal ambiguo (ej. "9.8 días" o "0.50 horas").
//
// Si la cantidad es un múltiplo exacto de 8 horas (días completos, sin
// resto), devuelve solo el número de días — así se ve el mismo en los
// lugares donde ya se agrega la palabra "días" por contexto (ej. "de 15").
export function horasADias(horas) {
  if (horas === null || horas === undefined) return "0";

  const totalHoras = Number(horas);
  if (Number.isNaN(totalHoras)) return "0";

  // Trabajar en minutos evita errores de precisión de punto flotante
  // (ej. 2.5 * 60 no siempre da exactamente 150 en aritmética de coma
  // flotante).
  const minutosPorDia = 8 * 60;
  const totalMinutos = Math.round(totalHoras * 60);

  const dias = Math.floor(totalMinutos / minutosPorDia);
  const minutosRestantes = totalMinutos % minutosPorDia;

  if (minutosRestantes === 0) {
    return `${dias}`;
  }

  const horasEnteras = Math.floor(minutosRestantes / 60);
  const minutos = minutosRestantes % 60;

  const plural = (n, singular, pluralForm) =>
    n === 1 ? singular : pluralForm;

  const partes = [];
  if (dias > 0) partes.push(`${dias} ${plural(dias, "día", "días")}`);
  if (horasEnteras > 0)
    partes.push(`${horasEnteras} ${plural(horasEnteras, "hora", "horas")}`);
  if (minutos > 0)
    partes.push(`${minutos} ${plural(minutos, "minuto", "minutos")}`);

  if (partes.length === 1) return partes[0];
  if (partes.length === 2) return partes.join(" y ");
  return `${partes[0]}, ${partes[1]} y ${partes[2]}`;
}
