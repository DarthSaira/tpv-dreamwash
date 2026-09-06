import { useState } from "react";

import {
  IconoCliente,
  IconoDiagnostico,
  IconoMotivo,
  IconoPresupuesto,
  IconoProgreso,
  IconoVehiculo,
} from "../../components/WorkshopIcons";
import {
  ESTADOS_OR,
  ESTADOS_PRESUPUESTO,
  obtenerColoresEstadoOr,
  obtenerEstadoAlGuardarDiagnostico,
  obtenerEtiquetaEstadoOr,
  obtenerProgresoOr,
} from "../../models/ordenreparacion";

const IVA_POR_DEFECTO = 21;

const parsearNumero = (valor) =>
  Number(String(valor).replace(",", "."));

const redondearImporte = (valor) => Number(Number(valor).toFixed(2));

const formatearEuros = (valor) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(valor);

const TituloSeccion = ({ Icono, titulo }) => (
  <div style={styles.cabeceraSeccion}>
    <Icono />
    <h2 style={styles.tituloSeccion}>{titulo}</h2>
  </div>
);

export default function DetalleOrden({
  orden,
  onActualizarOrden,
  onVolver,
}) {
  const [diagnostico, setDiagnostico] = useState(
    orden.diagnostico?.descripcion || ""
  );
  const [conceptosPresupuesto, setConceptosPresupuesto] = useState(
    orden.presupuesto?.conceptos || []
  );
  const [porcentajeIvaTexto, setPorcentajeIvaTexto] = useState(
    orden.presupuesto?.porcentajeIva == null
      ? String(IVA_POR_DEFECTO)
      : String(orden.presupuesto.porcentajeIva)
  );
  const [fechaCreacionPresupuesto, setFechaCreacionPresupuesto] = useState(
    orden.presupuesto?.fechaCreacion || null
  );
  const [errorPresupuesto, setErrorPresupuesto] = useState("");
  const [mensajePresupuesto, setMensajePresupuesto] = useState("");

  const [nuevoConcepto, setNuevoConcepto] = useState({
    descripcion: "",
    cantidad: 1,
    precioUnitario: "",
  });

  const textoIva = String(porcentajeIvaTexto).trim();
  const porcentajeIva = parsearNumero(textoIva);
  const ivaEsValido =
    textoIva !== "" &&
    Number.isFinite(porcentajeIva) &&
    porcentajeIva >= 0 &&
    porcentajeIva <= 100;

  const subtotal = redondearImporte(
    conceptosPresupuesto.reduce(
      (acumulado, concepto) => acumulado + Number(concepto.total || 0),
      0
    )
  );
  const importeIva = ivaEsValido
    ? redondearImporte((subtotal * porcentajeIva) / 100)
    : 0;
  const totalPresupuesto = ivaEsValido
    ? redondearImporte(subtotal + importeIva)
    : subtotal;

  const puedeGuardarPresupuesto =
    conceptosPresupuesto.length > 0 && ivaEsValido;

  const estadoPresupuesto =
    orden.presupuesto?.estado || ESTADOS_PRESUPUESTO.PENDIENTE;
  const presupuestoAprobado =
    estadoPresupuesto === ESTADOS_PRESUPUESTO.APROBADO;
  const presupuestoRechazado =
    estadoPresupuesto === ESTADOS_PRESUPUESTO.RECHAZADO;
  const presupuestoPendienteDeDecision =
    orden.estado === ESTADOS_OR.PENDIENTE_APROBACION &&
    estadoPresupuesto === ESTADOS_PRESUPUESTO.PENDIENTE;
  const puedeDecidirPresupuesto =
    presupuestoPendienteDeDecision && conceptosPresupuesto.length > 0;
  const presupuestoEditable = !presupuestoAprobado;

  const progresoOr = obtenerProgresoOr(orden.estado);

  const obtenerPresupuestoActualizado = (camposExtra) => ({
    ...(orden.presupuesto || {}),
    conceptos: conceptosPresupuesto,
    subtotal,
    porcentajeIva,
    iva: importeIva,
    total: totalPresupuesto,
    fechaCreacion:
      fechaCreacionPresupuesto ||
      orden.presupuesto?.fechaCreacion ||
      new Date().toISOString(),
    ...camposExtra,
  });

  const agregarConcepto = () => {
    if (!presupuestoEditable) {
      return;
    }

    const descripcion = nuevoConcepto.descripcion.trim();

    const cantidad = parsearNumero(nuevoConcepto.cantidad);
    const precioUnitario = parsearNumero(nuevoConcepto.precioUnitario);

    if (!descripcion) {
      setErrorPresupuesto("Escribe la descripción del concepto.");
      setMensajePresupuesto("");
      return;
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      setErrorPresupuesto("La cantidad debe ser un número mayor que 0.");
      setMensajePresupuesto("");
      return;
    }

    if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
      setErrorPresupuesto(
        "El precio unitario debe ser un número igual o mayor que 0."
      );
      setMensajePresupuesto("");
      return;
    }

    const precioUnitarioRedondeado = redondearImporte(precioUnitario);

    const concepto = {
      id: Date.now(),
      descripcion,
      cantidad,
      precioUnitario: precioUnitarioRedondeado,
      total: redondearImporte(cantidad * precioUnitarioRedondeado),
    };

    setConceptosPresupuesto((conceptosActuales) => [
      ...conceptosActuales,
      concepto,
    ]);

    setNuevoConcepto({
      descripcion: "",
      cantidad: 1,
      precioUnitario: "",
    });
    setErrorPresupuesto("");
    setMensajePresupuesto("");
  };

  const eliminarConcepto = (idConcepto) => {
    if (!presupuestoEditable) {
      return;
    }

    setConceptosPresupuesto((conceptosActuales) =>
      conceptosActuales.filter((concepto) => concepto.id !== idConcepto)
    );
    setErrorPresupuesto("");
    setMensajePresupuesto("");
  };

  const guardarPresupuesto = () => {
    if (!puedeGuardarPresupuesto || !presupuestoEditable) {
      return;
    }

    const fechaCreacion =
      fechaCreacionPresupuesto ||
      orden.presupuesto?.fechaCreacion ||
      new Date().toISOString();

    onActualizarOrden(orden.id, {
      presupuesto: obtenerPresupuestoActualizado({
        estado: ESTADOS_PRESUPUESTO.PENDIENTE,
        fechaCreacion,
        fechaAprobacion: null,
        fechaRechazo: null,
      }),
      estado: ESTADOS_OR.PENDIENTE_APROBACION,
    });

    setFechaCreacionPresupuesto(fechaCreacion);
    setErrorPresupuesto("");
    setMensajePresupuesto("Presupuesto guardado");
  };

  const aprobarPresupuesto = () => {
    if (!puedeDecidirPresupuesto) {
      return;
    }

    const confirmado = window.confirm(
      "¿Confirmas que el cliente ha aprobado este presupuesto?"
    );

    if (!confirmado) {
      return;
    }

    onActualizarOrden(orden.id, {
      presupuesto: obtenerPresupuestoActualizado({
        estado: ESTADOS_PRESUPUESTO.APROBADO,
        fechaAprobacion: new Date().toISOString(),
        fechaRechazo: null,
      }),
      estado: ESTADOS_OR.PRESUPUESTO_APROBADO,
    });

    setErrorPresupuesto("");
    setMensajePresupuesto("");
  };

  const rechazarPresupuesto = () => {
    if (!puedeDecidirPresupuesto) {
      return;
    }

    const confirmado = window.confirm(
      "¿Confirmas que el cliente ha rechazado este presupuesto?"
    );

    if (!confirmado) {
      return;
    }

    onActualizarOrden(orden.id, {
      presupuesto: obtenerPresupuestoActualizado({
        estado: ESTADOS_PRESUPUESTO.RECHAZADO,
        fechaAprobacion: null,
        fechaRechazo: new Date().toISOString(),
      }),
      estado: ESTADOS_OR.PRESUPUESTO_RECHAZADO,
    });

    setErrorPresupuesto("");
    setMensajePresupuesto("");
  };
  const guardarDiagnostico = () => {
    const descripcionLimpia = diagnostico.trim();
  
    if (!descripcionLimpia) {
      return;
    }
  
    onActualizarOrden(orden.id, {
      diagnostico: {
        descripcion: descripcionLimpia,
        fecha: new Date().toISOString(),
      },
      estado: obtenerEstadoAlGuardarDiagnostico(orden.estado),
    });
  
    onVolver();
  };
    return (
      <div style={styles.pagina}>
        <button onClick={onVolver} style={styles.btnVolver}>
          ← Volver a las órdenes
        </button>
  
        <div style={styles.cabecera}>
          <div>
            <p style={styles.etiqueta}>ORDEN DE REPARACIÓN</p>
  
            <h1 style={styles.titulo}>{orden.id}</h1>
  
            <p style={styles.fecha}>
              Creada el{" "}
              {new Date(orden.fechaCreacion).toLocaleString("es-ES")}
            </p>
          </div>
  
          <div
            style={{
              ...styles.estado,
              ...obtenerColoresEstadoOr(orden.estado),
            }}
          >
            {obtenerEtiquetaEstadoOr(orden.estado)}
          </div>
        </div>
  
        <div style={styles.contenido}>
          <section style={styles.tarjeta}>
            <TituloSeccion Icono={IconoVehiculo} titulo="Vehículo" />
  
            <div style={styles.datos}>
              <div>
                <span style={styles.label}>Matrícula</span>
                <strong style={styles.valor}>
                  {orden.vehiculo.matricula}
                </strong>
              </div>
  
              <div>
                <span style={styles.label}>Marca</span>
                <strong style={styles.valor}>
                  {orden.vehiculo.marca}
                </strong>
              </div>
  
              <div>
                <span style={styles.label}>Modelo</span>
                <strong style={styles.valor}>
                  {orden.vehiculo.modelo}
                </strong>
              </div>
            </div>
          </section>
  
          <section style={styles.tarjeta}>
          <TituloSeccion Icono={IconoCliente} titulo="Cliente" />
  
            <div style={styles.datosCliente}>
              <div>
                <span style={styles.label}>Nombre</span>
                <strong style={styles.valor}>
                  {orden.cliente.nombre}
                </strong>
              </div>
  
              <div>
                <span style={styles.label}>Teléfono</span>
                <strong style={styles.valor}>
                  {orden.cliente.telefono}
                </strong>
              </div>
            </div>
          </section>
  
          <section style={styles.tarjetaCompleta}>
          <TituloSeccion Icono={IconoMotivo} titulo="Motivo de entrada" />
  
            <p style={styles.motivo}>{orden.motivoEntrada}</p>
          </section>

          <section style={styles.tarjetaCompleta}>
          <TituloSeccion Icono={IconoDiagnostico} titulo="Diagnóstico" />

  <textarea
    value={diagnostico}
    onChange={(evento) => setDiagnostico(evento.target.value)}
    placeholder="Describe el diagnóstico del vehículo..."
    rows={6}
    style={styles.campoDiagnostico}
  />

  <div style={styles.accionesDiagnostico}>
    <button
      type="button"
      onClick={guardarDiagnostico}
      disabled={!diagnostico.trim()}
      style={{
        ...styles.btnGuardar,
        opacity: diagnostico.trim() ? 1 : 0.5,
        cursor: diagnostico.trim() ? "pointer" : "not-allowed",
      }}
    >
      Guardar diagnóstico
    </button>
  </div>
</section>
  
<section style={styles.tarjetaCompleta}>
  <TituloSeccion
    Icono={IconoPresupuesto}
    titulo="Presupuesto"
  />

  {presupuestoPendienteDeDecision && (
    <div style={styles.avisoPresupuestoPendiente}>
      Pendiente de aprobación
    </div>
  )}

  {presupuestoAprobado && (
    <div style={styles.avisoPresupuestoAprobado}>
      <strong>Presupuesto aprobado</strong>
      {orden.presupuesto?.fechaAprobacion && (
        <span>
          {new Date(orden.presupuesto.fechaAprobacion).toLocaleString("es-ES")}
        </span>
      )}
    </div>
  )}

  {presupuestoRechazado && (
    <div style={styles.avisoPresupuestoRechazado}>
      <strong>Presupuesto rechazado</strong>
      {orden.presupuesto?.fechaRechazo && (
        <span>
          {new Date(orden.presupuesto.fechaRechazo).toLocaleString("es-ES")}
        </span>
      )}
    </div>
  )}

  {presupuestoEditable && (
  <div style={styles.formularioPresupuesto}>
    <label style={styles.labelPresupuesto}>
      Concepto
      <input
        value={nuevoConcepto.descripcion}
        onChange={(evento) =>
          setNuevoConcepto({
            ...nuevoConcepto,
            descripcion: evento.target.value,
          })
        }
        placeholder="Ej: Cambio de aceite"
        style={styles.inputPresupuesto}
      />
    </label>

    <label style={styles.labelPresupuesto}>
      Cantidad
      <input
        type="number"
        min="0.01"
        step="0.01"
        value={nuevoConcepto.cantidad}
        onChange={(evento) =>
          setNuevoConcepto({
            ...nuevoConcepto,
            cantidad: evento.target.value,
          })
        }
        style={styles.inputPresupuesto}
      />
    </label>

    <label style={styles.labelPresupuesto}>
      Precio unitario
      <input
        inputMode="decimal"
        value={nuevoConcepto.precioUnitario}
        onChange={(evento) =>
          setNuevoConcepto({
            ...nuevoConcepto,
            precioUnitario: evento.target.value,
          })
        }
        placeholder="0,00 €"
        style={styles.inputPresupuesto}
      />
    </label>

    <button
      type="button"
      onClick={agregarConcepto}
      style={styles.btnAgregarConcepto}
    >
      Añadir concepto
    </button>
  </div>
  )}

  {errorPresupuesto && (
    <p style={styles.errorPresupuesto}>{errorPresupuesto}</p>
  )}

  {conceptosPresupuesto.length === 0 ? (
    <p style={styles.vacioPresupuesto}>
      Todavía no hay conceptos en el presupuesto.
    </p>
  ) : (
    <div style={styles.tablaPresupuestoContenedor}>
      <table style={styles.tablaPresupuesto}>
        <thead>
          <tr>
            <th style={styles.thPresupuesto}>Concepto</th>
            <th style={styles.thPresupuestoNumero}>Cantidad</th>
            <th style={styles.thPresupuestoNumero}>Precio unitario</th>
            <th style={styles.thPresupuestoNumero}>Total</th>
            {presupuestoEditable && (
              <th style={styles.thPresupuestoAccion}>Acción</th>
            )}
          </tr>
        </thead>
        <tbody>
          {conceptosPresupuesto.map((concepto) => (
            <tr key={concepto.id}>
              <td style={styles.tdPresupuesto}>{concepto.descripcion}</td>
              <td style={styles.tdPresupuestoNumero}>
                {concepto.cantidad}
              </td>
              <td style={styles.tdPresupuestoNumero}>
                {formatearEuros(concepto.precioUnitario)}
              </td>
              <td style={styles.tdPresupuestoNumero}>
                {formatearEuros(concepto.total)}
              </td>
              {presupuestoEditable && (
              <td style={styles.tdPresupuestoAccion}>
                <button
                  type="button"
                  onClick={() => eliminarConcepto(concepto.id)}
                  style={styles.btnEliminarConcepto}
                >
                  Eliminar
                </button>
              </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}

  <div style={styles.totalesPresupuesto}>
    <div style={styles.filaTotal}>
      <span>Subtotal</span>
      <strong>{formatearEuros(subtotal)}</strong>
    </div>

    {presupuestoEditable ? (
    <label style={styles.labelIva}>
      IVA (%)
      <input
        inputMode="decimal"
        value={porcentajeIvaTexto}
        onChange={(evento) => {
          setPorcentajeIvaTexto(evento.target.value);
          setMensajePresupuesto("");
        }}
        style={styles.inputIva}
      />
    </label>
    ) : (
    <div style={styles.filaTotal}>
      <span>IVA (%)</span>
      <strong>{porcentajeIvaTexto}</strong>
    </div>
    )}

    {presupuestoEditable && !ivaEsValido && (
      <p style={styles.errorPresupuesto}>
        El IVA debe ser un número entre 0 y 100.
      </p>
    )}

    <div style={styles.filaTotal}>
      <span>IVA</span>
      <strong>
        {ivaEsValido ? formatearEuros(importeIva) : "—"}
      </strong>
    </div>

    <div style={styles.filaTotalFinal}>
      <span>Total</span>
      <strong>
        {ivaEsValido ? formatearEuros(totalPresupuesto) : "—"}
      </strong>
    </div>
  </div>

  {presupuestoEditable && (
  <div style={styles.accionesPresupuesto}>
    <button
      type="button"
      onClick={guardarPresupuesto}
      disabled={!puedeGuardarPresupuesto}
      style={{
        ...styles.btnGuardar,
        opacity: puedeGuardarPresupuesto ? 1 : 0.5,
        cursor: puedeGuardarPresupuesto ? "pointer" : "not-allowed",
      }}
    >
      Guardar presupuesto
    </button>
  </div>
  )}

  {puedeDecidirPresupuesto && (
    <div style={styles.accionesDecision}>
      <button
        type="button"
        onClick={aprobarPresupuesto}
        style={styles.btnAprobarPresupuesto}
      >
        Aprobar presupuesto
      </button>
      <button
        type="button"
        onClick={rechazarPresupuesto}
        style={styles.btnRechazarPresupuesto}
      >
        Rechazar presupuesto
      </button>
    </div>
  )}

  {mensajePresupuesto && (
    <p style={styles.confirmacionPresupuesto}>{mensajePresupuesto}</p>
  )}
</section>
          <section style={styles.tarjetaCompleta}>
          <TituloSeccion Icono={IconoProgreso} titulo="Progreso de la orden" />
  
            <div style={styles.progreso}>
              <div
                style={
                  progresoOr.recepcion
                    ? styles.pasoActivo
                    : styles.pasoPendiente
                }
              >
                1. Recepción
              </div>
              <div
                style={
                  progresoOr.diagnostico
                    ? styles.pasoActivo
                    : styles.pasoPendiente
                }
              >
                2. Diagnóstico
              </div>
              <div
                style={
                  progresoOr.presupuesto
                    ? styles.pasoActivo
                    : styles.pasoPendiente
                }
              >
                3. Presupuesto
              </div>
              <div
                style={
                  progresoOr.reparacion
                    ? styles.pasoActivo
                    : styles.pasoPendiente
                }
              >
                4. Reparación
              </div>
              <div
                style={
                  progresoOr.cobro
                    ? styles.pasoActivo
                    : styles.pasoPendiente
                }
              >
                5. Cobro
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
  
  const styles = {
    formularioPresupuesto: {
      display: "grid",
      gridTemplateColumns: "2fr 0.7fr 1fr auto",
      gap: 12,
      alignItems: "end",
    },

    labelPresupuesto: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      color: "#3f3f46",
      fontSize: 13,
      fontWeight: "600",
    },

    inputPresupuesto: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px 13px",
      background: "#ffffff",
      color: "#27272a",
      border: "1px solid #d4d4d8",
      borderRadius: 10,
      fontSize: 15,
      fontFamily: "inherit",
      outline: "none",
    },

    btnAgregarConcepto: {
      padding: "12px 16px",
      background: "#f5f3ff",
      color: "#6d28d9",
      border: "1px solid #ddd6fe",
      borderRadius: 10,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: "700",
      whiteSpace: "nowrap",
    },

    errorPresupuesto: {
      margin: "14px 0 0",
      padding: 12,
      background: "#fef2f2",
      color: "#dc2626",
      borderRadius: 10,
      fontWeight: "600",
      fontSize: 14,
    },

    vacioPresupuesto: {
      margin: "18px 0 0",
      color: "#64748b",
      fontSize: 15,
    },

    tablaPresupuestoContenedor: {
      marginTop: 20,
      overflowX: "auto",
    },

    tablaPresupuesto: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 14,
    },

    thPresupuesto: {
      padding: "10px 8px",
      textAlign: "left",
      color: "#64748b",
      borderBottom: "1px solid #e4e4e7",
      fontWeight: "700",
    },

    thPresupuestoNumero: {
      padding: "10px 8px",
      textAlign: "right",
      color: "#64748b",
      borderBottom: "1px solid #e4e4e7",
      fontWeight: "700",
    },

    thPresupuestoAccion: {
      padding: "10px 8px",
      textAlign: "right",
      color: "#64748b",
      borderBottom: "1px solid #e4e4e7",
      fontWeight: "700",
    },

    tdPresupuesto: {
      padding: "12px 8px",
      color: "#27272a",
      borderBottom: "1px solid #f1f5f9",
    },

    tdPresupuestoNumero: {
      padding: "12px 8px",
      textAlign: "right",
      color: "#27272a",
      borderBottom: "1px solid #f1f5f9",
      whiteSpace: "nowrap",
    },

    tdPresupuestoAccion: {
      padding: "12px 8px",
      textAlign: "right",
      borderBottom: "1px solid #f1f5f9",
    },

    btnEliminarConcepto: {
      padding: "8px 12px",
      background: "#ffffff",
      color: "#dc2626",
      border: "1px solid #fecaca",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: "700",
    },

    totalesPresupuesto: {
      marginTop: 22,
      maxWidth: 360,
      marginLeft: "auto",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    },

    filaTotal: {
      display: "flex",
      justifyContent: "space-between",
      color: "#475569",
      fontSize: 15,
    },

    filaTotalFinal: {
      display: "flex",
      justifyContent: "space-between",
      color: "#27272a",
      fontSize: 18,
      fontWeight: "700",
      paddingTop: 8,
      borderTop: "1px solid #e4e4e7",
    },

    labelIva: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      color: "#3f3f46",
      fontSize: 13,
      fontWeight: "600",
    },

    inputIva: {
      width: 90,
      boxSizing: "border-box",
      padding: "10px 12px",
      background: "#ffffff",
      color: "#27272a",
      border: "1px solid #d4d4d8",
      borderRadius: 10,
      fontSize: 15,
      fontFamily: "inherit",
      textAlign: "right",
      outline: "none",
    },

    accionesPresupuesto: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: 20,
    },

    accionesDecision: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 16,
      flexWrap: "wrap",
    },

    btnAprobarPresupuesto: {
      padding: "12px 18px",
      background: "#15803d",
      color: "#ffffff",
      border: "none",
      borderRadius: 10,
      fontSize: 15,
      fontWeight: "700",
      cursor: "pointer",
    },

    btnRechazarPresupuesto: {
      padding: "12px 18px",
      background: "#ffffff",
      color: "#dc2626",
      border: "1px solid #fecaca",
      borderRadius: 10,
      fontSize: 15,
      fontWeight: "700",
      cursor: "pointer",
    },

    avisoPresupuestoPendiente: {
      margin: "0 0 18px",
      padding: 12,
      background: "#f5f3ff",
      color: "#6d28d9",
      borderRadius: 10,
      fontWeight: "700",
      fontSize: 14,
    },

    avisoPresupuestoAprobado: {
      margin: "0 0 18px",
      padding: 12,
      background: "#f0fdf4",
      color: "#15803d",
      borderRadius: 10,
      fontWeight: "700",
      fontSize: 14,
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },

    avisoPresupuestoRechazado: {
      margin: "0 0 18px",
      padding: 12,
      background: "#fef2f2",
      color: "#dc2626",
      borderRadius: 10,
      fontWeight: "700",
      fontSize: 14,
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },

    confirmacionPresupuesto: {
      margin: "14px 0 0",
      padding: 12,
      background: "#f0fdf4",
      color: "#15803d",
      borderRadius: 10,
      fontWeight: "700",
      fontSize: 14,
      textAlign: "right",
    },

    pagina: {
      width: "100%",
      maxWidth: 1180,
      minHeight: "100vh",
      margin: "0 auto",
      padding: "34px 20px 56px",
      boxSizing: "border-box",
    },
  
    btnVolver: {
      padding: "10px 14px",
      background: "#ffffff",
      color: "#6d28d9",
      border: "1px solid #e4e4e7",
      borderRadius: 10,
      cursor: "pointer",
      fontWeight: "600",
      fontSize: 14,
    },
  
    cabecera: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      margin: "54px 0 28px",
    },

    cabeceraSeccion: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom:20,
      paddingBottom: "1px solid #f0f0f2",
    },
  
    etiqueta: {
      margin: "0 0 10px",
      color: "#6d28d9",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1.2,
    },
  
    titulo: {
      margin: 0,
      color: "#27272a",
      fontSize: 36,
      fontWeight: "700",
      letterSpacing: -1,
    },
  
    fecha: {
      margin: "10px 0 0",
      color: "#64748b",
      fontSize: 16,
    },
  
    estado: {
      padding: "10px 16px",
      borderRadius: 999,
      fontSize: 14,
      fontWeight: "800",
      textAlign: "center",
      maxWidth: 200,
      lineHeight: 1.3,
    },
  
    contenido: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20,
    },
  
    tarjeta: {
      padding: 26,
      background: "#ffffff",
      borderRadius: 18,
      border: "1px solid #e4e4e7",
      boxShadow: "0 8px 24px rgba(24, 24, 27, 0.045)",
    },
  
    tarjetaCompleta: {
      gridColumn: "1 / -1",
      padding: 26,
      background: "#ffffff",
      borderRadius: 18,
      border: "1px solid #e4e4e7",
      boxShadow: "0 8px 24px rgba(24, 24, 27, 0.045)",
    },
  
    tituloSeccion: {
      margin: 0,
      color: "#27272a",
      fontSize: 17,
      fontWeight: "700",
      letterSpacing: -0.2,
    },
  
    datos: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 20,
    },
  
    datosCliente: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20,
    },
  
    label: {
      display: "block",
      marginBottom: 6,
      color: "#64748b",
      fontSize: 13,
      fontWeight: "700",
    },
  
    valor: {
      display: "block",
      color: "#1e293b",
      fontSize: 16,
    },
  
    motivo: {
      margin: 0,
      color: "#334155",
      fontSize: 17,
      lineHeight: 1.6,
    },

    campoDiagnostico: {
      width: "100%",
      boxSizing: "border-box",
      padding: 16,
      border: "1px solid #cbd5e1",
      borderRadius: 12,
      color: "#1e293b",
      fontSize: 16,
      fontFamily: "inherit",
      lineHeight: 1.5,
      resize: "vertical",
    },
    
    accionesDiagnostico: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: 16,
    },
    
    btnGuardar: {
      padding: "12px 18px",
      background: "#6d28d9",
      color: "#ffffff",
      border: "none",
      borderRadius: 10,
      fontSize: 15,
      fontWeight: "700",
    },
  
    progreso: {
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: 10,
    },
  
    pasoActivo: {
      padding: "14px 10px",
      background: "#6d28d9",
      color: "#ffffff",
      borderRadius: 10,
      textAlign: "center",
      fontWeight: "700",
      fontSize: 14,
    },
  
    pasoPendiente: {
      padding: "14px 10px",
      background: "#f1f5f9",
      color: "#64748b",
      borderRadius: 10,
      textAlign: "center",
      fontWeight: "700",
    },
  
    aviso: {
      margin: "20px 0 0",
      padding: 14,
      background: "#eff6ff",
      color: "#1d4ed8",
      borderRadius: 10,
      fontSize: 14,
    },
  };