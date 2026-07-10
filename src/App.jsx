import { useState } from "react";
import Home from "./Pages/home";
import CobroRapido from "./modules/tpv/ModuloCobro";
import Recepcion from "./modules/recepcion/recepcion";
import Gestion from "./modules/gestion/Gestion";

export default function App() {
  const [pantalla, setPantalla] = useState("home");

  return (
    <div style={styles.app}>
      <style>{`
        button:hover { opacity: 0.9; transform: translateY(-1px); }
        button:active { transform: translateY(0px); }
      `}</style>

      {pantalla === "home" ? (
        <Home
          styles={styles}
          setPantalla={setPantalla}
        />
      ) : pantalla === "config" ? (
        <div style={styles.card}>
          <h2 style={{ ...styles.tituloSeccion, color: "#1f2937" }}>⚙️ Configuración</h2>
          <p style={{ color: "#4b5563", fontSize: 15, marginBottom: 10 }}>Aquí iremos añadiendo:</p>
          <ul style={{ color: "#4b5563", paddingLeft: 20, lineHeight: "1.6" }}>
            <li>Editar categorías</li>
            <li>Editar servicios</li>
            <li>Modificar precios</li>
            <li>Datos del negocio</li>
          </ul>
          <button onClick={() => setPantalla("tpv")} style={styles.btnCobrar}>
            Volver al TPV
          </button>
        </div>
                 ) : pantalla === "tpv" ? (
                  <div>
                    <div style={{ marginBottom: 20 }}>
                      <button
                        onClick={() => setPantalla("home")}
                        style={{
                          padding: "10px 16px",
                          background: "white",
                          color: "#2563eb",
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontWeight: "700",
                        }}
                      >
                        ← Volver al inicio
                      </button>
                    </div>
          
                    <CobroRapido
                      pantalla={pantalla}
                      setPantalla={setPantalla}
                    />
                         </div>
           ) : pantalla === "recepcion" ? (
            <Recepcion setPantalla={setPantalla} />
          ) : pantalla === "gestion" ? (
            <Gestion setPantalla={setPantalla} />
          ) : (
            <div style={styles.card}>
              <h2>Módulo en preparación</h2>
              <p>Esta pantalla todavía no está disponible.</p>
    
              <button
                onClick={() => setPantalla("home")}
                style={styles.btnMenu}
              >
                Volver a Inicio
              </button>
            </div>
          )}
    </div>
  );
}

const styles = {
  app: {padding: "40px 25px 25px", fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", backgroundColor: "#f1f5f9", minHeight: "100vh" },
  card: { padding: 20, background: "white", borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: 20 },
  tituloSeccion: { fontSize: 16, fontWeight: "700", margin: "0 0 15px 0", color: "#1e293b", borderBottom: "2px solid #f1f5f9", paddingBottom: 8 },
  btnCobrar: { display: "block", width: "100%", padding: "16px", background: "#10b981", color: "white", border: "none", borderRadius: 12, fontWeight: "700", fontSize: 16, cursor: "pointer" },
  btnMenu: { padding: "10px 18px", border: "none", borderRadius: 8, cursor: "pointer", background: "#2563eb", color: "white", fontWeight: "bold" },
  homePage: { maxWidth: "1100px", margin: "30px auto", padding: "50px 60px", background: "white", borderRadius: 24, boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)", },
  homeHeader: { textAlign: "center", marginBottom: 42, },
  homeLogo: { fontSize: 42, marginBottom: 12, },
  homeTitle: { margin: 0, fontSize: 44, fontWeight: "800", color: "#0f172a", letterSpacing: "-1px", },
  homeSubtitle: { margin: "12px 0 0 0", fontSize: 22, color: "#64748b", fontWeight: "500", },
  homeGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, },
  homeCard: { minHeight: "230px", background: "white", border: "1px solid #e2e8f0", borderRadius: 22, padding: 30, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)", },
  homeCardIcon: { width: 82, height: 82, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, },
  homeCardTitle: { fontSize: 26, fontWeight: "800", color: "#2563eb", },
  homeCardText: { marginTop: 6, fontSize: 16, color: "#475569", },
};
