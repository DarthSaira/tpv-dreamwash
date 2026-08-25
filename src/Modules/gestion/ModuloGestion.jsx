import { useState } from "react";
import DetalleOrden from "./DetalleOrden";

export default function Gestion({
  setPantalla,
  ordenesReparacion = [],
  onActualizarOrden,
}) {
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  if (ordenSeleccionada) {
    return (
      <DetalleOrden
        orden={ordenSeleccionada}
        onActualizarOrden={onActualizarOrden}
        onVolver={() => setOrdenSeleccionada(null)}
      />
    );
  }

  return (
    <div style={styles.pagina}>
      <button
        onClick={() => setPantalla("home")}
        style={styles.btnVolver}
      >
        ← Volver al inicio
      </button>

      <div style={styles.cabecera}>
        <div>
          <p style={styles.etiqueta}>GESTIÓN DEL TALLER</p>

          <h1 style={styles.titulo}>
            Órdenes de Reparación
          </h1>

          <p style={styles.subtitulo}>
            {ordenesReparacion.length}{" "}
            {ordenesReparacion.length === 1
              ? "orden registrada"
              : "órdenes registradas"}
          </p>
        </div>
      </div>

      {ordenesReparacion.length === 0 ? (
        <div style={styles.vacio}>
          <div style={styles.iconoVacio}>📋</div>

          <h2 style={styles.tituloVacio}>
            Todavía no hay órdenes
          </h2>

          <p style={styles.textoVacio}>
            Las órdenes creadas desde Recepción aparecerán aquí.
          </p>

          <button
            onClick={() => setPantalla("recepcion")}
            style={styles.btnPrincipal}
          >
            Crear primera Orden de Reparación
          </button>
        </div>
      ) : (
        <div style={styles.lista}>
          {ordenesReparacion.map((orden) => (
            <article key={orden.id} style={styles.orden}>
              <div style={styles.ordenCabecera}>
                <div>
                  <div style={styles.numeroOrden}>
                    {orden.id}
                  </div>

                  <div style={styles.fecha}>
                    {new Date(
                      orden.fechaCreacion
                    ).toLocaleString("es-ES")}
                  </div>
                </div>

                <div
  style={{
    ...styles.estado,
    background:
      orden.estado === "diagnosticada" ? "#dcfce7" : "#f5f3ff",
    color:
      orden.estado === "diagnosticada" ? "#15803d" : "#6d28d9",
  }}
>
  {orden.estado}
</div>
              </div>

              <div style={styles.datos}>
                <div style={styles.bloque}>
                  <span style={styles.label}>Vehículo</span>

                  <strong>
                    {orden.vehiculo.matricula}
                  </strong>

                  <span>
                    {orden.vehiculo.marca}{" "}
                    {orden.vehiculo.modelo}
                  </span>
                </div>

                <div style={styles.bloque}>
                  <span style={styles.label}>Cliente</span>

                  <strong>{orden.cliente.nombre}</strong>

                  <span>{orden.cliente.telefono}</span>
                </div>

                <div style={styles.bloqueMotivo}>
                  <span style={styles.label}>
                    Motivo de entrada
                  </span>

                  <strong>{orden.motivoEntrada}</strong>
                </div>
              </div>
              <button
                onClick={() => setOrdenSeleccionada(orden)}
                style={styles.btnAbrir}
              >
                Abrir orden →
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
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
    margin: "54px 0 28px",
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

  subtitulo: {
    margin: "10px 0 0",
    color: "#64748b",
    fontSize: 17,
  },

  vacio: {
    padding: 50,
    background: "white",
    borderRadius: 24,
    boxShadow: "0 15px 40px rgba(15, 23, 42, 0.07)",
    textAlign: "center",
  },

  iconoVacio: {
    fontSize: 50,
  },

  tituloVacio: {
    margin: "16px 0 8px",
    color: "#0f172a",
  },

  textoVacio: {
    margin: "0 0 24px",
    color: "#64748b",
  },

  btnPrincipal: {
    padding: "14px 20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "700",
    fontSize: 16,
  },

  lista: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  orden: {
    padding: 24,
    background: "#ffffff",
    borderRadius: 18,
    boxShadow: "0 8px 24px rgba(24, 24, 27, 0.045)",
    border: "1px solid #e4e4e7",
  },

  ordenCabecera: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 18,
    borderBottom: "1px solid #e2e8f0",
  },

  numeroOrden: {
    color: "#27272a",
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  fecha: {
    marginTop: 5,
    color: "#64748b",
    fontSize: 14,
  },

  estado: {
    padding: "7px 11px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  datos: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 2fr",
    gap: 24,
    paddingTop: 18,
  },

  bloque: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    color: "#334155",
  },

  bloqueMotivo: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    color: "#334155",
  },

  label: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
  },

  btnAbrir: {
    display: "block",
    margin: "20px 0 0 auto",
    padding: "10px 15px",
    background: "#f5f3ff",
    color: "#6d28d9",
    border: "1px solid #ddd6fe",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "700",
    fontSize: 14,
  },
};