// Formatos para Colombia: pesos colombianos y fechas en español.

const pesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

// 35000 → "$ 35.000"
export function formatoPesos(valor: number): string {
  return pesos.format(valor);
}

// "vie 25 oct"
export function formatoFechaCorta(fecha: string | Date): string {
  return new Date(fecha).toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

// "viernes, 25 de octubre de 2026"
export function formatoFechaLarga(fecha: string | Date): string {
  return new Date(fecha).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// "10:00 a. m."
export function formatoHora(fecha: string | Date): string {
  return new Date(fecha).toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// "María González" → "MG"
export function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");
}
