import { useState } from "react";
import DetalleOrden from "./DetalleOrden";

export default function Gestion({
  setPantalla,
  ordenesReparacion = [],
}) {
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);

  if (ordenSeleccionada) {
    return (
      <DetalleOrden
        orden={ordenSeleccionada}
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

                <div style={styles.estado}>
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
    background: "white",
    borderRadius: 18,
    boxShadow: "0 8px 25px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e2e8f0",
  },

  ordenCabecera: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 18,
    borderBottom: "1px solid #e2e8f0",
  },

  numeroOrden: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "800",
  },

  fecha: {
    marginTop: 5,
    color: "#64748b",
    fontSize: 14,
  },

  estado: {
    padding: "8px 12px",
    background: "#dcfce7",
    color: "#15803d",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "800",
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
    padding: "11px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "700",
    fontSize: 14,
  },
};