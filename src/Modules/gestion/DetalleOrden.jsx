export default function DetalleOrden({ orden, onVolver }) {
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
  
          <div style={styles.estado}>{orden.estado}</div>
        </div>
  
        <div style={styles.contenido}>
          <section style={styles.tarjeta}>
            <h2 style={styles.tituloSeccion}>🚗 Vehículo</h2>
  
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
            <h2 style={styles.tituloSeccion}>👤 Cliente</h2>
  
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
            <h2 style={styles.tituloSeccion}>📝 Motivo de entrada</h2>
  
            <p style={styles.motivo}>{orden.motivoEntrada}</p>
          </section>
  
          <section style={styles.tarjetaCompleta}>
            <h2 style={styles.tituloSeccion}>🔧 Progreso de la orden</h2>
  
            <div style={styles.progreso}>
              <div style={styles.pasoActivo}>1. Recepción</div>
              <div style={styles.pasoPendiente}>2. Diagnóstico</div>
              <div style={styles.pasoPendiente}>3. Presupuesto</div>
              <div style={styles.pasoPendiente}>4. Reparación</div>
              <div style={styles.pasoPendiente}>5. Cobro</div>
            </div>
  
            <p style={styles.aviso}>
              En esta primera versión la orden es únicamente de consulta.
              Añadiremos las acciones de diagnóstico en la siguiente iteración.
            </p>
          </section>
        </div>
      </div>
    );
  }
  
  const styles = {
    pagina: {
      minHeight: "calc(100vh - 80px)",
      maxWidth: 1100,
      margin: "0 auto",
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
  
    cabecera: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      margin: "48px 0 28px",
    },
  
    etiqueta: {
      margin: "0 0 8px",
      color: "#2563eb",
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 1,
    },
  
    titulo: {
      margin: 0,
      color: "#0f172a",
      fontSize: 36,
    },
  
    fecha: {
      margin: "10px 0 0",
      color: "#64748b",
      fontSize: 16,
    },
  
    estado: {
      padding: "10px 16px",
      background: "#dcfce7",
      color: "#15803d",
      borderRadius: 999,
      fontSize: 14,
      fontWeight: "800",
      textTransform: "capitalize",
    },
  
    contenido: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20,
    },
  
    tarjeta: {
      padding: 24,
      background: "white",
      borderRadius: 18,
      border: "1px solid #e2e8f0",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.06)",
    },
  
    tarjetaCompleta: {
      gridColumn: "1 / -1",
      padding: 24,
      background: "white",
      borderRadius: 18,
      border: "1px solid #e2e8f0",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.06)",
    },
  
    tituloSeccion: {
      margin: "0 0 20px",
      paddingBottom: 12,
      borderBottom: "1px solid #e2e8f0",
      color: "#0f172a",
      fontSize: 18,
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
  
    progreso: {
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gap: 10,
    },
  
    pasoActivo: {
      padding: "14px 10px",
      background: "#2563eb",
      color: "white",
      borderRadius: 10,
      textAlign: "center",
      fontWeight: "700",
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