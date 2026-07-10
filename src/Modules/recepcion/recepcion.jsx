export default function Recepcion({ setPantalla }) {
    return (
      <div style={styles.pagina}>
        <button
          onClick={() => setPantalla("home")}
          style={styles.btnVolver}
        >
          ← Volver al inicio
        </button>
  
        <div style={styles.contenido}>
          <div style={styles.icono}>🚗</div>
  
          <h1 style={styles.titulo}>Recepción</h1>
  
          <p style={styles.texto}>
            Aquí comenzará la recepción del vehículo y la creación de una
            Orden de Trabajo.
          </p>
  
          <div style={styles.estado}>
            Módulo preparado para continuar su desarrollo
          </div>
        </div>
      </div>
    );
  }
  
  const styles = {
    pagina: {
      minHeight: "calc(100vh - 80px)",
    },
  
    btnVolver: {
      padding: "10px 16px",
      background: "white",
      color: "#2563eb",
      border: "1px solid #cbd5e1",
      borderRadius: 10,
      cursor: "pointer",
      fontWeight: "700",
    },
  
    contenido: {
      maxWidth: 700,
      margin: "100px auto 0",
      padding: 40,
      background: "white",
      borderRadius: 24,
      boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
      textAlign: "center",
    },
  
    icono: {
      fontSize: 52,
      marginBottom: 16,
    },
  
    titulo: {
      margin: 0,
      color: "#0f172a",
      fontSize: 36,
    },
  
    texto: {
      margin: "16px auto",
      maxWidth: 520,
      color: "#64748b",
      fontSize: 18,
      lineHeight: 1.6,
    },
  
    estado: {
      display: "inline-block",
      marginTop: 16,
      padding: "10px 16px",
      background: "#eff6ff",
      color: "#2563eb",
      borderRadius: 999,
      fontWeight: "700",
    },
  };