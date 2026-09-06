export const ESTADOS_PRESUPUESTO = {
  PENDIENTE: "pendiente",
  APROBADO: "aprobado",
  RECHAZADO: "rechazado",
};

export const ESTADOS_OR = {
  RECIBIDA: "recibida",
  DIAGNOSTICADA: "diagnosticada",
  PENDIENTE_APROBACION: "pendiente_aprobacion",
  PRESUPUESTO_APROBADO: "presupuesto_aprobado",
  PRESUPUESTO_RECHAZADO: "presupuesto_rechazado",
  EN_REPARACION: "en_reparacion",
  LISTA_PARA_COBRO: "lista_para_cobro",
  CERRADA: "cerrada",
};

const ETIQUETAS_ESTADO_OR = {
  [ESTADOS_OR.RECIBIDA]: "Recibida",
  [ESTADOS_OR.DIAGNOSTICADA]: "Diagnosticada",
  [ESTADOS_OR.PENDIENTE_APROBACION]: "Pendiente de aprobación",
  [ESTADOS_OR.PRESUPUESTO_APROBADO]: "Presupuesto aprobado",
  [ESTADOS_OR.PRESUPUESTO_RECHAZADO]: "Presupuesto rechazado",
  [ESTADOS_OR.EN_REPARACION]: "En reparación",
  [ESTADOS_OR.LISTA_PARA_COBRO]: "Lista para cobro",
  [ESTADOS_OR.CERRADA]: "Cerrada",
};

const ESTADOS_CONOCIDOS_OR = new Set(Object.values(ESTADOS_OR));

const ESTADOS_DIAGNOSTICO_ACTIVO = new Set([
  ESTADOS_OR.DIAGNOSTICADA,
  ESTADOS_OR.PENDIENTE_APROBACION,
  ESTADOS_OR.PRESUPUESTO_APROBADO,
  ESTADOS_OR.PRESUPUESTO_RECHAZADO,
  ESTADOS_OR.EN_REPARACION,
  ESTADOS_OR.LISTA_PARA_COBRO,
  ESTADOS_OR.CERRADA,
]);

const ESTADOS_PRESUPUESTO_ACTIVO = new Set([
  ESTADOS_OR.PENDIENTE_APROBACION,
  ESTADOS_OR.PRESUPUESTO_APROBADO,
  ESTADOS_OR.PRESUPUESTO_RECHAZADO,
  ESTADOS_OR.EN_REPARACION,
  ESTADOS_OR.LISTA_PARA_COBRO,
  ESTADOS_OR.CERRADA,
]);

const ESTADOS_REPARACION_ACTIVA = new Set([
  ESTADOS_OR.EN_REPARACION,
  ESTADOS_OR.LISTA_PARA_COBRO,
  ESTADOS_OR.CERRADA,
]);

export function obtenerEtiquetaEstadoOr(estado) {
  return ETIQUETAS_ESTADO_OR[estado] || "Estado desconocido";
}

export function obtenerProgresoOr(estado) {
  return {
    recepcion: ESTADOS_CONOCIDOS_OR.has(estado),
    diagnostico: ESTADOS_DIAGNOSTICO_ACTIVO.has(estado),
    presupuesto: ESTADOS_PRESUPUESTO_ACTIVO.has(estado),
    reparacion: ESTADOS_REPARACION_ACTIVA.has(estado),
    cobro: estado === ESTADOS_OR.CERRADA,
  };
}

export function obtenerColoresEstadoOr(estado) {
  if (estado === ESTADOS_OR.DIAGNOSTICADA) {
    return {
      background: "#dcfce7",
      color: "#15803d",
    };
  }

  return {
    background: "#f5f3ff",
    color: "#6d28d9",
  };
}

export function obtenerEstadoAlGuardarDiagnostico(estadoActual) {
  if (estadoActual === ESTADOS_OR.RECIBIDA) {
    return ESTADOS_OR.DIAGNOSTICADA;
  }

  return estadoActual;
}

export function crearOrdenReparacion({
    numero,
    vehiculo,
    cliente,
    motivoEntrada,
  }) {
    const fechaCreacion = new Date();
    const anio = fechaCreacion.getFullYear();
    const numeroFormateado = String(numero).padStart(6, "0");
  
    return {
      id: `OR-${anio}-${numeroFormateado}`,
      fechaCreacion: fechaCreacion.toISOString(),
      estado: ESTADOS_OR.RECIBIDA,
  
      vehiculo: {
        matricula: vehiculo.matricula.trim().toUpperCase(),
        marca: vehiculo.marca.trim(),
        modelo: vehiculo.modelo.trim(),
      },
  
      cliente: {
        nombre: cliente.nombre.trim(),
        telefono: cliente.telefono.trim(),
      },
  
      motivoEntrada: motivoEntrada.trim(),
      diagnostico: {
        descripcion: "",
        fecha: null,
      },

      presupuesto: {
        conceptos: [],
        subtotal: 0,
        porcentajeIva: 21,
        iva: 0,
        total: 0,
        estado: ESTADOS_PRESUPUESTO.PENDIENTE,
        fechaCreacion: null,
        fechaAprobacion: null,
        fechaRechazo: null,
      },
    };
  }