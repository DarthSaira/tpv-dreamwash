const formatearImporte = (valor) => {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return "—";
  }

  return `${numero.toFixed(2)}€`;
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return new Date().toLocaleString("es-ES");
  }

  const parseada = new Date(fecha);
  if (!Number.isNaN(parseada.getTime()) && String(fecha).includes("T")) {
    return parseada.toLocaleString("es-ES");
  }

  return String(fecha);
};

const etiquetaMetodoPago = (metodoPago) => {
  if (metodoPago === "tarjeta") {
    return "Tarjeta";
  }

  if (metodoPago === "efectivo") {
    return "Efectivo";
  }

  return metodoPago || "—";
};

export default function Ticket({
  styles,
  seleccionados,
  ventaRegistrada,
  matricula,
  modeloCoche,
  total,
  pasoPago,
  metodoPago,
  pagoCliente,
  cambio,
  errorCobro,
  confirmando,
  eliminarServicioCompleto,
  limpiarTicket,
  setPasoPago,
  onConfirmarVenta,
  onImprimir,
  onNuevaVenta,
}) {
  const esResultado = Boolean(ventaRegistrada);
  const lineas = esResultado
    ? ventaRegistrada.servicios || []
    : seleccionados;
  const totalMostrado = esResultado ? ventaRegistrada.total : total;
  const metodoMostrado = esResultado ? ventaRegistrada.metodoPago : metodoPago;
  const matriculaMostrada = esResultado
    ? ventaRegistrada.matricula
    : matricula;
  const modeloMostrado = esResultado
    ? ventaRegistrada.modeloCoche
    : modeloCoche;
  const mostrarPago =
    esResultado || (seleccionados.length > 0 && pasoPago);
  const entregado = esResultado
    ? ventaRegistrada.importeRecibido
    : pagoCliente;
  const cambioMostrado = esResultado ? ventaRegistrada.cambio : cambio;

  return (
    <div className="documento-prueba" style={styles.ticketFisico}>
      <div style={{ textAlign: "center", marginBottom: 15 }}>
        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: 20,
            fontWeight: "800",
            letterSpacing: "0.5px",
          }}
        >
          YANLAI WORKSHOP
        </h2>

        <p style={styles.avisoDocumentoPrueba}>DOCUMENTO DE PRUEBA</p>
        <p style={styles.avisoSinValidez}>SIN VALIDEZ FISCAL</p>

        <p style={{ margin: "8px 0 0 0", fontSize: 12 }}>
          Fecha: {formatearFecha(esResultado ? ventaRegistrada.fecha : null)}
        </p>

        {esResultado && (
          <p style={{ margin: "6px 0 0 0", fontSize: 12 }}>
            Referencia de prueba: {ventaRegistrada.id}
          </p>
        )}

        {(matriculaMostrada || modeloMostrado) && (
          <div style={styles.ticketCocheBox}>
            <span style={{ fontWeight: "700" }}>VEHÍCULO: </span>
            <span>{matriculaMostrada || "S/M"}</span>
            {modeloMostrado && <span> ({modeloMostrado})</span>}
          </div>
        )}
      </div>

      <div style={styles.lineaDivisoria}></div>

      <div style={{ minHeight: 80, padding: "5px 0" }}>
        {lineas.length === 0 ? (
          <p
            style={{
              color: "#333",
              fontStyle: "italic",
              textAlign: "center",
              marginTop: 24,
            }}
          >
            Sin servicios seleccionados
          </p>
        ) : (
          lineas.map((s) => {
            const cantidad = Number(s.cantidad) || 1;
            const precio = Number(s.precio);
            const importeLinea = Number.isFinite(precio)
              ? precio * cantidad
              : null;

            return (
              <div key={s.id} style={styles.filaTicketContainer}>
                <div style={styles.filaTicket} className="linea-documento">
                  <div>
                    <div style={{ fontWeight: "700" }}>
                      {cantidad}x {s.nombre || "Servicio"}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: "400" }}>
                      {formatearImporte(precio)} × {cantidad}
                    </div>
                  </div>
                  <span>{formatearImporte(importeLinea)}</span>
                </div>

                {!esResultado && (
                  <button
                    type="button"
                    className="no-print"
                    onClick={() => eliminarServicioCompleto(s.id)}
                    style={styles.btnEliminarLinea}
                    aria-label={`Quitar ${s.nombre}`}
                  >
                    Quitar
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {!esResultado && seleccionados.length > 0 && (
        <div
          style={{ textAlign: "right", marginTop: 10 }}
          className="no-print"
        >
          <button
            type="button"
            onClick={limpiarTicket}
            style={styles.btnLimpiarTicket}
          >
            Vaciar selección
          </button>
        </div>
      )}

      {lineas.length > 0 && (
        <>
          <div style={styles.lineaDivisoria}></div>

          <div style={{ padding: "5px 0" }} className="bloque-totales-documento">
            <div style={{ ...styles.filaTicket, fontSize: 19, marginTop: 8 }}>
              <span>TOTAL:</span>
              <span>{formatearImporte(totalMostrado)}</span>
            </div>

            {mostrarPago && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  borderTop: "1px dashed #000",
                  paddingTop: 8,
                }}
              >
                <div style={styles.filaTicketSecundaria}>
                  <span>Forma de pago:</span>
                  <span style={{ fontWeight: "bold" }}>
                    {etiquetaMetodoPago(metodoMostrado)}
                  </span>
                </div>

                {metodoMostrado === "efectivo" &&
                  Number.isFinite(Number(entregado)) && (
                    <>
                      <div style={styles.filaTicketSecundaria}>
                        <span>Entregado:</span>
                        <span>{formatearImporte(entregado)}</span>
                      </div>
                      <div style={styles.filaTicketSecundaria}>
                        <span>Cambio:</span>
                        <span>{formatearImporte(cambioMostrado)}</span>
                      </div>
                    </>
                  )}
              </div>
            )}
          </div>
        </>
      )}

      {esResultado && (
        <p style={styles.avisoVentaRegistrada}>Venta de prueba registrada</p>
      )}

      <div className="no-print" style={{ marginTop: 20 }}>
        {errorCobro && <p style={styles.errorCobro}>{errorCobro}</p>}

        {!esResultado && seleccionados.length > 0 && (
          <>
            {!pasoPago ? (
              <button
                type="button"
                onClick={() => setPasoPago(true)}
                style={styles.btnContinuarPago}
              >
                Continuar al cobro
              </button>
            ) : (
              <button
                type="button"
                onClick={onConfirmarVenta}
                disabled={confirmando}
                style={{
                  ...styles.btnCobrar,
                  opacity: confirmando ? 0.6 : 1,
                }}
              >
                {confirmando ? "Registrando…" : "Confirmar venta"}
              </button>
            )}
          </>
        )}

        {esResultado && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              type="button"
              onClick={onImprimir}
              style={styles.btnCobrar}
            >
              Imprimir documento de prueba
            </button>
            <button
              type="button"
              onClick={onNuevaVenta}
              style={styles.btnContinuarPago}
            >
              Nueva venta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
