// Las ventas antiguas guardadas en localStorage con la clave "ventas"
// pertenecen al prototipo anterior. No se leen, no se migran y no se mezclan
// con la base central.

const eurosACentimos = (euros) => Math.round(Number(euros) * 100);

const centimosAEuros = (centimos) => Number(centimos) / 100;

export function crearReferenciaPrueba() {
  const aleatorio = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TEST-${Date.now()}-${aleatorio}`;
}

export function prepararVentaParaApi({
  id,
  createdAt,
  matricula,
  modeloCoche,
  metodoPago,
  servicios,
  importeRecibidoEuros,
}) {
  return {
    id,
    createdAt,
    licensePlate: matricula.trim(),
    vehicleModel: modeloCoche.trim(),
    paymentMethod: metodoPago === "tarjeta" ? "card" : "cash",
    receivedCents: eurosACentimos(importeRecibidoEuros),
    isTest: true,
    noFiscalValidity: true,
    items: servicios.map((servicio) => ({
      description: servicio.nombre,
      quantity: Number(servicio.cantidad) || 1,
      unitPriceCents: eurosACentimos(servicio.precio),
    })),
  };
}

export function ventaDesdeApi(sale) {
  const recibido =
    sale.receivedCents == null ? null : centimosAEuros(sale.receivedCents);

  return {
    id: sale.id,
    fecha: sale.createdAt,
    matricula: sale.licensePlate || "",
    modeloCoche: sale.vehicleModel || "",
    servicios: (sale.items || []).map((item) => ({
      id: `${sale.id}-${item.position}`,
      nombre: item.description,
      precio: centimosAEuros(item.unitPriceCents),
      cantidad: item.quantity,
    })),
    total: centimosAEuros(sale.totalCents),
    metodoPago: sale.paymentMethod === "card" ? "tarjeta" : "efectivo",
    importeRecibido: recibido,
    pagoCliente: recibido,
    cambio: centimosAEuros(sale.changeCents),
    esPrueba: sale.isTest === true,
    sinValidezFiscal: sale.noFiscalValidity === true,
  };
}

export async function obtenerVentas() {
  const respuesta = await fetch("/api/sales");
  if (!respuesta.ok) {
    throw new Error("No se ha podido cargar el historial de ventas.");
  }

  const datos = await respuesta.json();
  if (!datos || !Array.isArray(datos.sales)) {
    throw new Error("La respuesta del historial no es válida.");
  }

  return datos.sales.map(ventaDesdeApi);
}

export async function registrarVentaRemota(payload) {
  let respuesta;

  try {
    respuesta = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "No se ha podido conectar con el servidor del taller. La venta no se ha registrado."
    );
  }

  let datos;
  try {
    datos = await respuesta.json();
  } catch {
    datos = {};
  }

  if (!datos || typeof datos !== "object") {
    datos = {};
  }

  if (!respuesta.ok) {
    throw new Error(datos.error || "No se ha podido registrar la venta. Inténtalo de nuevo.");
  }

  if (!datos.sale) {
    throw new Error("El servidor no ha confirmado la venta.");
  }

  return ventaDesdeApi(datos.sale);
}
