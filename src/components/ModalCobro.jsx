export default function ModalCobro({
    styles,
    metodoPago,
    cambioFinalModal,
    onCerrar,
  }) {
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <span style={{ fontSize: "50px" }}>✅</span>
  
          <h2
            style={{
              margin: "10px 0",
              color: "#1e293b",
              fontSize: "24px",
            }}
          >
            ¡Venta Completada!
          </h2>
  
          <p style={{ color: "#64748b", margin: "5px 0 20px 0" }}>
            El ticket ha sido enviado a la impresora.
          </p>
  
          {metodoPago === "efectivo" && (
            <div style={styles.modalCambioBox}>
              <span
                style={{
                  fontSize: "14px",
                  color: "#475569",
                  fontWeight: "600",
                }}
              >
                CAMBIO A DEVOLVER
              </span>
  
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "800",
                  color: "#10b981",
                  marginTop: "5px",
                }}
              >
                {cambioFinalModal.toFixed(2)}€
              </div>
            </div>
          )}
  
          <button onClick={onCerrar} style={styles.btnCerrarModal}>
            Siguiente Cliente
          </button>
        </div>
      </div>
    );
  }