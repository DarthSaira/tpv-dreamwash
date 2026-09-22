import { useRef, useState } from "react";
import Sidebar from "../../components/Sidebar";
import ServicioPersonalizado from "../../components/ServicioPersonalizado";
import Ticket from "../../components/Ticket";
import { esListaParaFacturar } from "../../models/ordenreparacion";

const CLAVE_VENTAS = "ventas";

const formatearEuros = (valor) => {
  if (!Number.isFinite(Number(valor))) {
    return "—";
  }

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(Number(valor));
};

const redondearImporte = (valor) => Math.round(Number(valor) * 100) / 100;

const parsearImporte = (texto) => {
  const normalizado = String(texto ?? "").trim().replace(",", ".");

  if (normalizado === "") {
    return { vacio: true, valido: false, valor: null };
  }

  if (!/^\d+([.]\d{0,2})?$/.test(normalizado)) {
    return { vacio: false, valido: false, valor: null };
  }

  const numero = Number(normalizado);

  if (!Number.isFinite(numero) || numero < 0) {
    return { vacio: false, valido: false, valor: null };
  }

  return { vacio: false, valido: true, valor: redondearImporte(numero) };
};

const crearIdPrueba = () => {
  const aleatorio = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TEST-${Date.now()}-${aleatorio}`;
};

const copiarServicios = (servicios) =>
  (Array.isArray(servicios) ? servicios : []).map((servicio) => ({
    id: servicio.id,
    nombre: servicio.nombre,
    precio: Number(servicio.precio),
    cantidad: Number(servicio.cantidad) || 1,
  }));

const leerVentasGuardadas = () => {
  const guardadas = localStorage.getItem(CLAVE_VENTAS);

  if (!guardadas) {
    return { ventas: [], error: "" };
  }

  try {
    const ventasGuardadas = JSON.parse(guardadas);
    if (!Array.isArray(ventasGuardadas)) {
      return { ventas: [], error: "No se han podido leer las ventas guardadas." };
    }
    return { ventas: ventasGuardadas, error: "" };
  } catch {
    return { ventas: [], error: "No se han podido leer las ventas guardadas." };
  }
};

const obtenerTotalVenta = (venta) => {
  const total = Number(venta?.total);
  return Number.isFinite(total) ? total : 0;
};

const obtenerHoraVenta = (venta) => {
  if (!venta?.fecha) {
    return "—";
  }

  const parseada = new Date(venta.fecha);
  if (!Number.isNaN(parseada.getTime()) && String(venta.fecha).includes("T")) {
    return parseada.toLocaleTimeString("es-ES");
  }

  const partes = String(venta.fecha).split(" ");
  return partes[1] || venta.fecha;
};

const presupuestoCobroEsValido = (orden) => {
  const presupuesto = orden?.presupuesto;

  if (!presupuesto || typeof presupuesto !== "object") {
    return false;
  }

  if (!Array.isArray(presupuesto.conceptos) || presupuesto.conceptos.length === 0) {
    return false;
  }

  return (
    Number.isFinite(Number(presupuesto.subtotal)) &&
    Number.isFinite(Number(presupuesto.iva)) &&
    Number.isFinite(Number(presupuesto.total))
  );
};

const dataInicial = [
  {
    id: 1,
    nombre: "Lavados",
    servicios: [
      { id: 11, nombre: "Lavado básico", precio: 8 },
      { id: 12, nombre: "Lavado completo", precio: 15 },
    ],
  },
  {
    id: 2,
    nombre: "Higienización",
    servicios: [
      { id: 21, nombre: "Interior básico", precio: 12 },
      { id: 22, nombre: "Ozonización", precio: 20 },
    ],
  },
];

export default function CobroRapido({
  pantalla,
  setPantalla,
  ordenesReparacion = [],
}) {
  const [categorias] = useState(dataInicial);
  const [seleccionados, setSeleccionados] = useState([]);

  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [pagoCliente, setPagoCliente] = useState("");
  const [matricula, setMatricula] = useState("");
  const [modeloCoche, setModeloCoche] = useState("");

  const [lecturaInicial] = useState(leerVentasGuardadas);
  const [ventas, setVentas] = useState(lecturaInicial.ventas);
  const [errorLecturaVentas] = useState(lecturaInicial.error);

  const [pasoPago, setPasoPago] = useState(false);
  const [mostrarPersonalizado, setMostrarPersonalizado] = useState(false);
  const [modoCobro, setModoCobro] = useState("venta_rapida");
  const [idOrdenSeleccionada, setIdOrdenSeleccionada] = useState(null);
  const [errorCobro, setErrorCobro] = useState("");
  const [ventaRegistrada, setVentaRegistrada] = useState(null);
  const [confirmando, setConfirmando] = useState(false);
  const confirmandoRef = useRef(false);

  const agregarServicio = (servicio) => {
    if (ventaRegistrada) {
      return;
    }

    setErrorCobro("");
    setSeleccionados((actuales) => {
      const existe = actuales.find((s) => s.id === servicio.id);
      if (existe) {
        return actuales.map((s) =>
          s.id === servicio.id ? { ...s, cantidad: s.cantidad + 1 } : s
        );
      }
      return [...actuales, { ...servicio, cantidad: 1 }];
    });
  };

  const eliminarServicioCompleto = (id) => {
    if (ventaRegistrada) {
      return;
    }

    setSeleccionados((actuales) => actuales.filter((s) => s.id !== id));
  };

  const limpiarTicket = () => {
    setSeleccionados([]);
    setMatricula("");
    setModeloCoche("");
    setPagoCliente("");
    setPasoPago(false);
    setMetodoPago("efectivo");
    setErrorCobro("");
  };

  const total = redondearImporte(
    seleccionados.reduce((acc, s) => acc + Number(s.precio) * (Number(s.cantidad) || 1), 0)
  );

  const importeParseado = parsearImporte(pagoCliente);
  const cambio =
    metodoPago === "efectivo" && importeParseado.valido
      ? redondearImporte(importeParseado.valor - total)
      : 0;

  const totalEfectivo = ventas
    .filter((v) => v.metodoPago === "efectivo")
    .reduce((acc, v) => acc + obtenerTotalVenta(v), 0);

  const totalTarjeta = ventas
    .filter((v) => v.metodoPago === "tarjeta")
    .reduce((acc, v) => acc + obtenerTotalVenta(v), 0);

  const totalCaja = totalEfectivo + totalTarjeta;

  const irAPago = (siguiente) => {
    if (siguiente && seleccionados.length === 0) {
      setErrorCobro("Añade al menos un servicio para cobrar.");
      return;
    }

    setErrorCobro("");
    setPasoPago(siguiente);
  };

  const confirmarVenta = () => {
    if (confirmandoRef.current || ventaRegistrada) {
      return;
    }

    if (seleccionados.length === 0) {
      setErrorCobro("Añade al menos un servicio para cobrar.");
      return;
    }

    if (metodoPago !== "efectivo" && metodoPago !== "tarjeta") {
      setErrorCobro("Elige efectivo o tarjeta.");
      return;
    }

    let importeRecibido = total;
    let cambioFinal = 0;

    if (metodoPago === "efectivo") {
      if (importeParseado.vacio) {
        setErrorCobro("Indica el importe entregado por el cliente.");
        return;
      }

      if (!importeParseado.valido) {
        setErrorCobro("El importe entregado no es válido.");
        return;
      }

      if (importeParseado.valor < total) {
        setErrorCobro("El importe entregado no puede ser menor que el total.");
        return;
      }

      importeRecibido = importeParseado.valor;
      cambioFinal = redondearImporte(importeRecibido - total);
    }

    confirmandoRef.current = true;
    setConfirmando(true);

    const serviciosVendidos = copiarServicios(seleccionados);
    const nuevaVenta = {
      id: crearIdPrueba(),
      fecha: new Date().toISOString(),
      matricula,
      modeloCoche,
      servicios: serviciosVendidos,
      total,
      metodoPago,
      importeRecibido,
      pagoCliente: importeRecibido,
      cambio: cambioFinal,
      esPrueba: true,
      sinValidezFiscal: true,
    };

    const nuevasVentas = [nuevaVenta, ...ventas];

    try {
      localStorage.setItem(CLAVE_VENTAS, JSON.stringify(nuevasVentas));
    } catch {
      confirmandoRef.current = false;
      setConfirmando(false);
      setErrorCobro("No se ha podido guardar la venta. Inténtalo de nuevo.");
      return;
    }

    setVentas(nuevasVentas);
    setVentaRegistrada(nuevaVenta);
    setErrorCobro("");
  };

  const imprimirDocumento = () => {
    window.print();
  };

  const iniciarNuevaVenta = () => {
    confirmandoRef.current = false;
    setConfirmando(false);
    setVentaRegistrada(null);
    limpiarTicket();
  };

  const ordenesListasParaFacturar = ordenesReparacion.filter((orden) =>
    esListaParaFacturar(orden?.estado)
  );
  const ordenSeleccionada =
    ordenesListasParaFacturar.find((orden) => orden.id === idOrdenSeleccionada) ||
    null;
  const presupuestoSeleccionado = ordenSeleccionada?.presupuesto;
  const presupuestoSeleccionadoValido = presupuestoCobroEsValido(ordenSeleccionada);

  const cambiarModoCobro = (modo) => {
    setModoCobro(modo);
    if (modo === "venta_rapida") {
      setIdOrdenSeleccionada(null);
    }
  };

  return (
    <div>
      <div style={styles.selectorModoCobro} className="no-print">
        <button
          type="button"
          onClick={() => cambiarModoCobro("venta_rapida")}
          style={{
            ...styles.btnModoCobro,
            background: modoCobro === "venta_rapida" ? "#10b981" : "#e2e8f0",
            color: modoCobro === "venta_rapida" ? "white" : "#334155",
          }}
        >
          Venta rápida
        </button>
        <button
          type="button"
          onClick={() => cambiarModoCobro("ordenes")}
          style={{
            ...styles.btnModoCobro,
            background: modoCobro === "ordenes" ? "#10b981" : "#e2e8f0",
            color: modoCobro === "ordenes" ? "white" : "#334155",
          }}
        >
          Órdenes de reparación
        </button>
      </div>

      {modoCobro === "venta_rapida" ? (
      <>
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        <Sidebar
          pantalla={pantalla}
          setPantalla={setPantalla}
        />
        
        <div style={styles.columnaIzquierda} className="no-print">
          {ventaRegistrada ? (
            <div style={styles.card}>
              <h2 style={styles.tituloSeccion}>Venta de prueba registrada</h2>
              <p style={{ color: "#475569", marginTop: 0 }}>
                Puedes imprimir el documento o empezar una nueva venta. Cancelar
                el diálogo de impresión no cambia el registro.
              </p>
              <p style={styles.avisoPruebaPanel}>
                DOCUMENTO DE PRUEBA · SIN VALIDEZ FISCAL
              </p>
            </div>
          ) : !pasoPago ? (
            <>
              <div style={styles.gridCategorias}>
                {categorias.map((cat) => (
                  <div key={cat.id} style={styles.card}>
                    <h2 style={styles.tituloSeccion}>{cat.nombre}</h2>
                    {cat.servicios.map((s) => {
                      const enTicket = seleccionados.find((x) => x.id === s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => agregarServicio(s)}
                          style={{
                            ...styles.btnServicio,
                            background: enTicket ? "#d1fae5" : "#f3f4f6",
                            color: "#1f2937",
                            border: enTicket ? "2px solid #10b981" : "1px solid #e5e7eb",
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontWeight: "bold" }}>{s.nombre}</span>
                              <div style={{ opacity: 0.8, fontSize: 13, marginTop: 2 }}>{s.precio.toFixed(2)}€</div>
                            </div>
                            {enTicket && <span style={styles.badgeCantidad}>x{enTicket.cantidad}</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div style={styles.card}>
                {!mostrarPersonalizado ? (
                  <button type="button" onClick={() => setMostrarPersonalizado(true)} style={styles.btnPersonalizadoToggle}>
                    ➕ Añadir Servicio Personalizado
                  </button>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <h2 style={{ ...styles.tituloSeccion, margin: 0, border: 'none' }}>Servicio Personalizado</h2>
                      <button type="button" onClick={() => setMostrarPersonalizado(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>
                        Cancelar
                      </button>
                    </div>
                    <ServicioPersonalizado
                      styles={styles}
                      onAdd={(servicio) => {
                        agregarServicio(servicio);
                        setMostrarPersonalizado(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ ...styles.tituloSeccion, margin: 0, border: 'none' }}>Cobro</h2>
                <button type="button" onClick={() => irAPago(false)} style={styles.btnVolverFlujo}>
                  Volver a servicios
                </button>
              </div>

              <p style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                Total: {formatearEuros(total)}
              </p>

              <div style={{ marginBottom: 16 }}>
                <label style={styles.label}>Forma de pago</label>
                <div style={styles.filaMetodosPago}>
                  <button
                    type="button"
                    onClick={() => {
                      setMetodoPago("efectivo");
                      setErrorCobro("");
                    }}
                    style={{
                      ...styles.btnMetodoPago,
                      background: metodoPago === "efectivo" ? "#10b981" : "#e2e8f0",
                      color: metodoPago === "efectivo" ? "white" : "#334155",
                    }}
                  >
                    Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMetodoPago("tarjeta");
                      setPagoCliente("");
                      setErrorCobro("");
                    }}
                    style={{
                      ...styles.btnMetodoPago,
                      background: metodoPago === "tarjeta" ? "#10b981" : "#e2e8f0",
                      color: metodoPago === "tarjeta" ? "white" : "#334155",
                    }}
                  >
                    Tarjeta
                  </button>
                </div>
              </div>

              {metodoPago === "efectivo" && (
                <div style={{ marginTop: 15, padding: '15px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <label style={styles.label}>Efectivo entregado por el cliente</label>
                  <input
                    style={styles.input}
                    inputMode="decimal"
                    placeholder="Ej: 20,00"
                    value={pagoCliente}
                    onChange={(e) => {
                      setPagoCliente(e.target.value);
                      setErrorCobro("");
                    }}
                  />

                  {importeParseado.valido && (
                    <p style={{ marginTop: 12, fontSize: 16, color: '#374151', margin: "12px 0 0" }}>
                      Cambio a devolver:{" "}
                      <b style={{ color: cambio >= 0 ? "#10b981" : "#ef4444", fontSize: 18 }}>
                        {cambio.toFixed(2)}€
                      </b>
                    </p>
                  )}
                </div>
              )}

              {metodoPago === "tarjeta" && (
                <div style={styles.avisoTarjeta}>
                  Se registrará un cobro de prueba con tarjeta por{" "}
                  <strong>{formatearEuros(total)}</strong>. No hay conexión con
                  datáfono. Confirma para finalizar.
                </div>
              )}

              <div style={{ display: 'flex', gap: '15px', marginTop: 18 }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Matrícula (opcional)</label>
                  <input
                    style={styles.input}
                    placeholder="1234ABC"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value.toUpperCase())}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Modelo del coche (opcional)</label>
                  <input
                    style={styles.input}
                    placeholder="Ej: VW Golf VII"
                    value={modeloCoche}
                    onChange={(e) => setModeloCoche(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={styles.columnaDerecha}>
          <Ticket
            styles={styles}
            seleccionados={seleccionados}
            ventaRegistrada={ventaRegistrada}
            matricula={matricula}
            modeloCoche={modeloCoche}
            total={total}
            pasoPago={pasoPago}
            metodoPago={metodoPago}
            pagoCliente={importeParseado.valido ? importeParseado.valor : ""}
            cambio={cambio}
            errorCobro={errorCobro}
            confirmando={confirmando}
            eliminarServicioCompleto={eliminarServicioCompleto}
            limpiarTicket={limpiarTicket}
            setPasoPago={irAPago}
            onConfirmarVenta={confirmarVenta}
            onImprimir={imprimirDocumento}
            onNuevaVenta={iniciarNuevaVenta}
          />
        </div>
      </div>

      <div style={styles.card} className="no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "1px solid #f3f4f6", paddingBottom: 10, marginBottom: 15 }}>
          <h2 style={{ ...styles.tituloSeccion, border: 'none', margin: 0 }}>Ventas de prueba del día</h2>

          <div style={{ textAlign: 'right', fontSize: 14, color: '#4b5563' }}>
              Efectivo: <b>{totalEfectivo.toFixed(2)}€</b> | Tarjeta: <b>{totalTarjeta.toFixed(2)}€</b> | Total: <b style={{ color: '#2563eb' }}>{totalCaja.toFixed(2)}€</b>
          </div>
        </div>

        {errorLecturaVentas && (
          <p style={styles.errorCobro}>{errorLecturaVentas}</p>
        )}

        {ventas.length === 0 ? (
          <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: 14 }}>No hay ventas de prueba registradas.</p>
        ) : (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb', textAlign: 'left', color: '#6b7280' }}>
                  <th style={{ padding: 8 }}>Hora</th>
                  <th style={{ padding: 8 }}>Referencia</th>
                  <th style={{ padding: 8 }}>Método</th>
                  <th style={{ padding: 8, textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {ventas.map((venta, indice) => (
                  <tr key={venta.id || `venta-${indice}`} style={{ borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                    <td style={{ padding: 8 }}>{obtenerHoraVenta(venta)}</td>
                    <td style={{ padding: 8 }}>{venta.id || "—"}</td>
                    <td style={{ padding: 8, textTransform: 'capitalize' }}>{venta.metodoPago || "—"}</td>
                    <td style={{ padding: 8, textAlign: 'right', fontWeight: 'bold' }}>{formatearEuros(obtenerTotalVenta(venta))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      ) : (
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        <Sidebar
          pantalla={pantalla}
          setPantalla={setPantalla}
        />

        <div style={{ flex: 1 }} className="no-print">
          {ordenSeleccionada ? (
            <div style={styles.card}>
              <button
                type="button"
                onClick={() => setIdOrdenSeleccionada(null)}
                style={styles.btnVolverFlujo}
              >
                ← Volver a las órdenes
              </button>

              <h2 style={{ ...styles.tituloSeccion, marginTop: 18 }}>
                {ordenSeleccionada.id || "Orden sin identificador"}
              </h2>

              <p style={{ color: "#475569", marginTop: 0 }}>
                {ordenSeleccionada.vehiculo?.matricula || "Sin matrícula"}
                {" · "}
                {ordenSeleccionada.cliente?.nombre || "Cliente no indicado"}
              </p>

              {!presupuestoSeleccionadoValido ? (
                <p style={styles.avisoDatosIncompletos}>
                  Esta orden no tiene un presupuesto completo para facturar.
                </p>
              ) : (
                <>
                  <table style={styles.tablaOrdenCobro}>
                    <thead>
                      <tr>
                        <th style={styles.thOrdenCobro}>Concepto</th>
                        <th style={styles.thOrdenCobroNumero}>Cantidad</th>
                        <th style={styles.thOrdenCobroNumero}>Precio unitario</th>
                        <th style={styles.thOrdenCobroNumero}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {presupuestoSeleccionado.conceptos.map((concepto, indice) => (
                        <tr key={concepto.id || indice}>
                          <td style={styles.tdOrdenCobro}>
                            {concepto.descripcion || "Sin descripción"}
                          </td>
                          <td style={styles.tdOrdenCobroNumero}>
                            {concepto.cantidad}
                          </td>
                          <td style={styles.tdOrdenCobroNumero}>
                            {formatearEuros(concepto.precioUnitario)}
                          </td>
                          <td style={styles.tdOrdenCobroNumero}>
                            {formatearEuros(concepto.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={styles.totalesOrdenCobro}>
                    <div style={styles.filaTotalOrden}>
                      <span>Subtotal</span>
                      <strong>{formatearEuros(presupuestoSeleccionado.subtotal)}</strong>
                    </div>
                    <div style={styles.filaTotalOrden}>
                      <span>
                        IVA ({presupuestoSeleccionado.porcentajeIva ?? "—"} %)
                      </span>
                      <strong>{formatearEuros(presupuestoSeleccionado.iva)}</strong>
                    </div>
                    <div style={styles.filaTotalOrdenFinal}>
                      <span>Total</span>
                      <strong>{formatearEuros(presupuestoSeleccionado.total)}</strong>
                    </div>
                  </div>

                  <p style={styles.avisoCobroPosterior}>
                    Registra la factura para continuar con el cobro.
                  </p>
                </>
              )}
            </div>
          ) : ordenesListasParaFacturar.length === 0 ? (
            <div style={styles.card}>
              <h2 style={styles.tituloSeccion}>Órdenes de reparación</h2>
              <p style={{ color: "#9ca3af", fontStyle: "italic", fontSize: 14 }}>
                No hay órdenes listas para facturar.
              </p>
            </div>
          ) : (
            <div>
              <h2 style={{ ...styles.tituloSeccion, marginBottom: 16 }}>
                Órdenes listas para facturar
              </h2>
              {ordenesListasParaFacturar.map((orden) => (
                <article key={orden.id} style={styles.card}>
                  <div style={styles.filaOrdenLista}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#1e293b" }}>
                        {orden.id || "Orden sin identificador"}
                      </div>
                      <div style={{ color: "#475569", marginTop: 6 }}>
                        {orden.vehiculo?.matricula || "Sin matrícula"}
                        {" · "}
                        {orden.cliente?.nombre || "Cliente no indicado"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, color: "#1e293b" }}>
                        {formatearEuros(orden.presupuesto?.total)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIdOrdenSeleccionada(orden.id)}
                        style={styles.btnSeleccionarOrden}
                      >
                        Ver orden
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

const styles = {
  contenedorPrincipal: { display: "flex", gap: "20px", marginBottom: 20 },
  columnaIzquierda: { flex: "3" },
  columnaDerecha: { flex: "2" },
  gridCategorias: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  card: { padding: 20, background: "white", borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: 20 },
  tituloSeccion: { fontSize: 16, fontWeight: "700", margin: "0 0 15px 0", color: "#1e293b", borderBottom: "2px solid #f1f5f9", paddingBottom: 8 },
  btnServicio: { display: "block", width: "100%", marginTop: 10, padding: "14px", borderRadius: 10, cursor: "pointer", fontSize: 14, textAlign: 'left' },
  badgeCantidad: { background: '#10b981', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  btnPersonalizadoToggle: { width: "100%", padding: "12px", background: "#f1f5f9", border: "2px dashed #cbd5e1", borderRadius: 10, color: "#475569", fontWeight: "600", cursor: "pointer" },
  btnPersonalizadoAdd: { padding: "0 20px", background: "#16a34a", color: "white", border: "none", borderRadius: 10, fontWeight: "bold", cursor: "pointer" },
  btnVolverFlujo: { padding: "10px 14px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer", fontWeight: "600", fontSize: 14, minHeight: 44 },
  label: { display: "block", marginBottom: 6, fontSize: 13, fontWeight: "600", color: "#475569" },
  input: { padding: "14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#ffffff", color: "#1e293b", width: "100%", fontSize: 16, boxSizing: "border-box", outline: "none", minHeight: 48 },
  ticketFisico: { background: "white", color: "#000", padding: "30px 24px", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", maxWidth: "380px", margin: "0 auto" },
  ticketCocheBox: { marginTop: 8, background: '#f1f5f9', padding: '8px', borderRadius: '8px', fontSize: '13px', color: '#1e293b', border: '1px solid #e2e8f0' },
  lineaDivisoria: { borderBottom: "1px dashed #cbd5e1", margin: "15px 0" },
  filaTicketContainer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  filaTicket: { display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: 14, color: "#000", flex: 1, marginRight: 10 },
  btnEliminarLinea: { background: '#fee2e2', border: 'none', cursor: 'pointer', padding: '8px 10px', fontSize: '12px', color: '#991b1b', borderRadius: 8, fontWeight: 700, minHeight: 36 },
  btnLimpiarTicket: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textDecoration: 'underline' },
  filaTicketSecundaria: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#000", marginBottom: 5 },
  btnContinuarPago: { display: "block", width: "100%", padding: "16px", background: "#2563eb", color: "white", border: "none", borderRadius: 12, fontWeight: "700", fontSize: 16, cursor: "pointer", minHeight: 52 },
  btnCobrar: { display: "block", width: "100%", padding: "16px", background: "#10b981", color: "white", border: "none", borderRadius: 12, fontWeight: "700", fontSize: 16, cursor: "pointer", minHeight: 52 },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContent: { background: "white", padding: "40px", borderRadius: "20px", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" },
  modalCambioBox: { background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "15px", borderRadius: "12px", marginBottom: "25px" },
  btnCerrarModal: { width: "100%", padding: "14px", background: "#1e293b", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "15px", cursor: "pointer" },
  btnVolverInicio: { padding: "10px 16px", background: "white", color: "#2563eb", border: "1px solid #cbd5e1", borderRadius: 10, cursor: "pointer", fontWeight: "700", },
  selectorModoCobro: { display: "flex", gap: 10, marginBottom: 20 },
  btnModoCobro: { padding: "12px 18px", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: "700", fontSize: 14, minHeight: 48 },
  filaOrdenLista: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 },
  btnSeleccionarOrden: { marginTop: 10, padding: "8px 14px", background: "#10b981", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "700", fontSize: 13 },
  tablaOrdenCobro: { width: "100%", borderCollapse: "collapse", fontSize: 14, marginTop: 10 },
  thOrdenCobro: { padding: "8px 6px", textAlign: "left", color: "#6b7280", borderBottom: "1px solid #e5e7eb" },
  thOrdenCobroNumero: { padding: "8px 6px", textAlign: "right", color: "#6b7280", borderBottom: "1px solid #e5e7eb" },
  tdOrdenCobro: { padding: "10px 6px", color: "#1e293b", borderBottom: "1px solid #f1f5f9" },
  tdOrdenCobroNumero: { padding: "10px 6px", textAlign: "right", color: "#1e293b", borderBottom: "1px solid #f1f5f9" },
  totalesOrdenCobro: { marginTop: 18, maxWidth: 320, marginLeft: "auto", display: "flex", flexDirection: "column", gap: 8 },
  filaTotalOrden: { display: "flex", justifyContent: "space-between", color: "#475569", fontSize: 14 },
  filaTotalOrdenFinal: { display: "flex", justifyContent: "space-between", color: "#0f172a", fontSize: 18, fontWeight: "700", paddingTop: 8, borderTop: "1px solid #e2e8f0" },
  avisoCobroPosterior: { margin: "20px 0 0", color: "#64748b", fontSize: 13 },
  avisoDatosIncompletos: { margin: "16px 0 0", padding: 12, background: "#fef2f2", color: "#dc2626", borderRadius: 10, fontWeight: "600", fontSize: 14 },
  errorCobro: { margin: "10px 0 0", padding: 12, background: "#fef2f2", color: "#dc2626", borderRadius: 10, fontWeight: "600", fontSize: 14 },
  filaMetodosPago: { display: "flex", gap: 10 },
  btnMetodoPago: { flex: 1, padding: "16px", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: "700", fontSize: 16, minHeight: 52 },
  avisoTarjeta: { marginTop: 8, padding: 14, background: "#eff6ff", borderRadius: 10, color: "#1e3a8a", fontSize: 14, lineHeight: 1.45 },
  avisoDocumentoPrueba: { margin: "0 0 4px", fontSize: 13, fontWeight: 800, letterSpacing: "0.04em" },
  avisoSinValidez: { margin: 0, fontSize: 12, fontWeight: 700 },
  avisoVentaRegistrada: { margin: "16px 0 0", textAlign: "center", fontSize: 12, fontWeight: 700 },
  avisoPruebaPanel: { margin: 0, fontWeight: 800, color: "#0f172a" },
};
