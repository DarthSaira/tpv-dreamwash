export default function Sidebar({ pantalla, setPantalla }) {
    return (
      <div
        style={{
          width: 220,
          background: "#1e293b",
          borderRadius: 16,
          padding: 20,
          color: "white",
          minHeight: "calc(100vh - 40px)",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 30 }}>
          🚗 DreamWash
        </h2>
  
        <button
          style={{
            width: "100%",
            padding: "10px 18px",
            marginBottom: 10,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "white",
            fontWeight: "bold",
            background:
              pantalla === "tpv" ? "#10b981" : "#334155",
          }}
          onClick={() => setPantalla("tpv")}
        >
          🧾 TPV
        </button>
  
        <button
          style={{
            width: "100%",
            padding: "10px 18px",
            marginBottom: 10,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "white",
            fontWeight: "bold",
            background:
              pantalla === "gestion" ? "#10b981" : "#334155",
          }}
          onClick={() => setPantalla("gestion")}
        >
          📊 Gestión
        </button>
  
        <button
          style={{
            width: "100%",
            padding: "10px 18px",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "white",
            fontWeight: "bold",
            background:
              pantalla === "config" ? "#10b981" : "#334155",
          }}
          onClick={() => setPantalla("config")}
        >
          ⚙️ Configuración
        </button>
      </div>
    );
  }