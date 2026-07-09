export default function Ticket({
    styles,
    seleccionados,
    matricula,
    modeloCoche,
    subtotal,
    iva,
    total,
    pasoPago,
    metodoPago,
    pagoCliente,
    cambio,
    eliminarServicioCompleto,
    limpiarTicket,
    setPasoPago,
    handleCobrarEImprimir,
  }) {
    return (
        <div style={styles.ticketFisico}>
  <div style={{ textAlign: "center", marginBottom: 15 }}>
    <h2 style={{ margin: "0 0 5px 0", fontSize: 22, fontWeight: "800", letterSpacing: "0.5px" }}>
    YANLAI WORKSHOP
    </h2>

    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
      Ticket de Venta
    </p>

    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
      Fecha: {new Date().toLocaleDateString()}
    </p>

    {/* VEHÍCULO */}
    {(matricula || modeloCoche) && (
  <div style={styles.ticketCocheBox}>
    <span style={{ fontWeight: "700" }}>VEHÍCULO: </span>
    <span>{matricula || "S/M"}</span>
    {modeloCoche && <span> ({modeloCoche})</span>}
  </div>
)}
  </div>
  <div style={styles.lineaDivisoria}></div>

<div style={{ minHeight: 120, padding: "5px 0" }}>
  {seleccionados.length === 0 ? (
    <p style={{ color: "#9ca3af", fontStyle: "italic", textAlign: "center", marginTop: 40 }}>
      Sin servicios seleccionados
    </p>
  ) : (
    <>
      {seleccionados.map((s) => (
        <div key={s.id} style={styles.filaTicketContainer}>
          <div style={styles.filaTicket}>
  <div>
    <div style={{ fontWeight: "700" }}>
      {s.cantidad}x {s.nombre}
    </div>

    <div
      style={{
        fontSize: 12,
        color: "#64748b",
        fontWeight: "400",
      }}
    >
      {s.precio.toFixed(2)}€ × {s.cantidad}
    </div>
  </div>

  <span>
    {(s.precio * s.cantidad).toFixed(2)}€
  </span>
</div>

          <button
            className="btn-eliminar-ticket"
            onClick={() => eliminarServicioCompleto(s.id)}
            style={styles.btnEliminarLinea}
          >
            ❌
          </button>
        </div>
      ))}

      <div style={{ textAlign: "right", marginTop: 10 }} className="btn-eliminar-ticket">
        <button onClick={limpiarTicket} style={styles.btnLimpiarTicket}>
          🗑️ Limpiar Ticket
        </button>
      </div>
      <div style={styles.lineaDivisoria}></div>

<div style={{ padding: "5px 0" }}>
  <div style={styles.filaTicketSecundaria}>
    <span>Base Imponible:</span>
    <span>{subtotal.toFixed(2)}€</span>
  </div>

  <div style={styles.filaTicketSecundaria}>
    <span>I.V.A. (21%):</span>
    <span>{iva.toFixed(2)}€</span>
  </div>

  <div style={{ ...styles.filaTicket, fontSize: 19, marginTop: 8, color: "#000" }}>
    <span>TOTAL:</span>
    <span>{total.toFixed(2)}€</span>
  </div>

  {seleccionados.length > 0 && pasoPago && (
  <div style={{ marginTop: 10, fontSize: 12, borderTop: "1px dashed #cbd5e1", paddingTop: 8 }}>
    <div style={styles.filaTicketSecundaria}>
      <span>Forma de pago:</span>
      <span style={{ textTransform: "uppercase", fontWeight: "bold" }}>
        {metodoPago}
      </span>
    </div>

    {metodoPago === "efectivo" && pagoCliente && (
      <>
        <div style={styles.filaTicketSecundaria}>
          <span>Entregado:</span>
          <span>{Number(pagoCliente).toFixed(2)}€</span>
        </div>

        <div style={styles.filaTicketSecundaria}>
          <span>Cambio:</span>
          <span>{cambio.toFixed(2)}€</span>
        </div>
      </>
    )}
  </div>
)}
</div>

{seleccionados.length > 0 && (
  <div className="no-imprimir" style={{ marginTop: 20 }}>
    {!pasoPago ? (
      <button
        onClick={() => setPasoPago(true)}
        style={styles.btnContinuarPago}
        className="btn-flujo"
      >
        Continuar al Pago ➡️
      </button>
    ) : (
      <button
        onClick={handleCobrarEImprimir}
        className="btn-cobrar"
        style={styles.btnCobrar}
      >
        💳 Cobrar e Imprimir Ticket
      </button>
    )}
  </div>
)}
<div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#6b7280" }}>
  <p style={{ margin: 0 }}>¡Gracias por su visita!</p>
</div>
    </>
  )}
</div>
</div>
      );
  }
