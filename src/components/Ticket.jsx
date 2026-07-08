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
      DREAMWASH S.L.
    </h2>

    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
      Ticket de Venta
    </p>

    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
      Fecha: {new Date().toLocaleDateString()}
    </p>
  </div>
</div>
      );
  }
