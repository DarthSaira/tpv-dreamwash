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
      estado: "recibida",
  
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
        iva: 0,
        total: 0,
        estado: "pendiente",
        fechaCreacion: null,
        fechaAprobacion: null,
      },

diagnostico: {
  descripcion: "",
  fecha: null,
},
    };
  }