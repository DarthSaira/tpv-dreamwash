import { useState } from "react";

import {
  IconoCliente,
  IconoDiagnostico,
  IconoMotivo,
  IconoProgreso,
  IconoVehiculo,
} from "../../components/WorkshopIcons";

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
      estado: "diagnosticada",
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
  
          <div style={styles.estado}>{orden.estado}</div>
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
          <TituloSeccion Icono={IconoProgreso} titulo="Progreso de la orden" />
  
            <div style={styles.progreso}>
              <div style={styles.pasoActivo}>1. Recepción</div>
              <div
  style={
    orden.estado === "diagnosticada"
      ? styles.pasoActivo
      : styles.pasoPendiente
  }
>
  2. Diagnóstico
</div>
              <div style={styles.pasoPendiente}>3. Presupuesto</div>
              <div style={styles.pasoPendiente}>4. Reparación</div>
              <div style={styles.pasoPendiente}>5. Cobro</div>
            </div>
          </section>
        </div>
      </div>
    );
  }
  
  const styles = {
    pagina: {
      width: "100%",
      maxWidth: 1180,
      minHeight: "100hv",
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