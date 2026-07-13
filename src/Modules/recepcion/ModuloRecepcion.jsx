import { useState } from "react";

export default function Recepcion({
  setPantalla,
  onCrearOrden,
}) {
  const [paso, setPaso] = useState(1);

  const [vehiculo, setVehiculo] = useState({
    matricula: "",
    marca: "",
    modelo: "",
  });

  const [cliente, setCliente] = useState({
    nombre: "",
    telefono: "",
  });
  const [motivoEntrada, setMotivoEntrada] = useState("");
const [ordenCreada, setOrdenCreada] = useState(null);

  const [error, setError] = useState("");

  const actualizarVehiculo = (campo, valor) => {
    setVehiculo({
      ...vehiculo,
      [campo]: valor,
    });

    setError("");
  };

  const continuarACliente = () => {
    if (
      !vehiculo.matricula.trim() ||
      !vehiculo.marca.trim() ||
      !vehiculo.modelo.trim()
    ) {
      setError("Completa la matrícula, la marca y el modelo.");
      return;
    }

    setPaso(2);
  };

  const actualizarCliente = (campo, valor) => {
    setCliente({
      ...cliente,
      [campo]: valor,
    });
  
    setError("");
  };
  
  const continuarAMotivo = () => {
    if (!cliente.nombre.trim() || !cliente.telefono.trim()) {
      setError("Completa el nombre y el teléfono del cliente.");
      return;
    }
    const finalizarRecepcion = () => {
      if (!motivoEntrada.trim()) {
        setError("Escribe el motivo de entrada del vehículo.");
        return;
      }
    
      if (typeof onCrearOrden !== "function") {
        setError("No se ha podido conectar Recepción con las órdenes.");
        return;
      }
    
      const nuevaOrden = onCrearOrden({
        vehiculo,
        cliente,
        motivoEntrada,
      });
    
      setOrdenCreada(nuevaOrden);
      setError("");
    };
  
    setPaso(3);
  };

  const finalizarRecepcion = () => {
    if (!motivoEntrada.trim()) {
      setError("Escribe el motivo de entrada del vehículo.");
      return;
    }
  
    if (typeof onCrearOrden !== "function") {
      setError("No se ha podido conectar Recepción con las órdenes.");
      return;
    }
  
    const nuevaOrden = onCrearOrden({
      vehiculo,
      cliente,
      motivoEntrada,
    });
  
    setOrdenCreada(nuevaOrden);
    setError("");
  };
  
  if (ordenCreada) {
    return (
      <div style={styles.pagina}>
        <div style={styles.contenido}>
          <div style={styles.icono}>✅</div>
  
          <h1 style={styles.titulo}>
            Orden de Reparación creada
          </h1>
  
          <p style={styles.texto}>
            La recepción se ha guardado correctamente.
          </p>
  
          <div style={styles.estado}>
            {ordenCreada.id}
          </div>
  
          <p style={styles.texto}>
            {ordenCreada.vehiculo.matricula} ·{" "}
            {ordenCreada.vehiculo.marca}{" "}
            {ordenCreada.vehiculo.modelo}
          </p>
  
          <button
            onClick={() => setPantalla("home")}
            style={styles.btnContinuar}
          >
            Finalizar y volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (paso === 3) {
    return (
      <div style={styles.pagina}>
        <button
          onClick={() => {
            setError("");
            setPaso(2);
          }}
          style={styles.btnVolver}
        >
          ← Volver al cliente
        </button>
  
        <div style={styles.contenido}>
          <div style={styles.progreso}>Paso 3 de 3</div>
  
          <div style={styles.icono}>📝</div>
  
          <h1 style={styles.titulo}>Motivo de entrada</h1>
  
          <p style={styles.texto}>
            Describe brevemente por qué entra el vehículo.
          </p>
  
          <div
            style={{
              marginBottom: 22,
              padding: 16,
              background: "#f8fafc",
              borderRadius: 12,
              color: "#475569",
            }}
          >
            <strong>{vehiculo.matricula}</strong>
            {" · "}
            {vehiculo.marca} {vehiculo.modelo}
            <br />
            Cliente: {cliente.nombre} · {cliente.telefono}
          </div>
  
          <div style={styles.formulario}>
            <label style={styles.label}>
              Motivo de entrada
              <textarea
                autoFocus
                value={motivoEntrada}
                onChange={(e) => {
                  setMotivoEntrada(e.target.value);
                  setError("");
                }}
                placeholder="Ej: Cambio de aceite y revisión de frenos"
                style={{
                  ...styles.input,
                  minHeight: 130,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </label>
  
            {error && <p style={styles.error}>{error}</p>}
  
            <button
              onClick={finalizarRecepcion}
              style={styles.btnContinuar}
            >
              Crear Orden de Reparación
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (paso === 2) {
    return (
      <div style={styles.pagina}>
        <button
          onClick={() => {
            setError("");
            setPaso(1);
          }}
          style={styles.btnVolver}
        >
          ← Volver al vehículo
        </button>
  
        <div style={styles.contenido}>
          <div style={styles.progreso}>Paso 2 de 3</div>
  
          <div style={styles.icono}>👤</div>
  
          <h1 style={styles.titulo}>Cliente</h1>
  
          <p style={styles.texto}>
            Introduce los datos básicos del cliente.
          </p>
  
          <div style={styles.formulario}>
            <label style={styles.label}>
              Nombre
              <input
                autoFocus
                value={cliente.nombre}
                onChange={(e) =>
                  actualizarCliente("nombre", e.target.value)
                }
                placeholder="Nombre del cliente"
                style={styles.input}
              />
            </label>
  
            <label style={styles.label}>
              Teléfono
              <input
                type="tel"
                value={cliente.telefono}
                onChange={(e) =>
                  actualizarCliente("telefono", e.target.value)
                }
                placeholder="600 123 123"
                style={styles.input}
              />
            </label>
  
            {error && <p style={styles.error}>{error}</p>}
  
            <button
              onClick={continuarAMotivo}
              style={styles.btnContinuar}
            >
              Continuar a Motivo →
            </button>
          </div>
        </div>
      </div>
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

      <div style={styles.contenido}>
        <div style={styles.progreso}>Paso 1 de 3</div>

        <div style={styles.icono}>🚗</div>

        <h1 style={styles.titulo}>Vehículo</h1>

        <p style={styles.texto}>
          Introduce los datos básicos del vehículo.
        </p>

        <div style={styles.formulario}>
          <label style={styles.label}>
            Matrícula
            <input
              autoFocus
              value={vehiculo.matricula}
              onChange={(e) =>
                actualizarVehiculo(
                  "matricula",
                  e.target.value.toUpperCase()
                )
              }
              placeholder="1234ABC"
              style={styles.input}
            />
          </label>

          <div style={styles.fila}>
            <label style={styles.label}>
              Marca
              <input
                value={vehiculo.marca}
                onChange={(e) =>
                  actualizarVehiculo("marca", e.target.value)
                }
                placeholder="Volkswagen"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              Modelo
              <input
                value={vehiculo.modelo}
                onChange={(e) =>
                  actualizarVehiculo("modelo", e.target.value)
                }
                placeholder="Golf"
                style={styles.input}
              />
            </label>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            onClick={continuarACliente}
            style={styles.btnContinuar}
          >
            Continuar a Cliente →
          </button>
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
    maxWidth: 720,
    margin: "60px auto 0",
    padding: 40,
    background: "white",
    borderRadius: 24,
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
  },

  progreso: {
    color: "#2563eb",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  icono: {
    fontSize: 48,
    textAlign: "center",
  },

  titulo: {
    margin: "10px 0 0",
    color: "#0f172a",
    fontSize: 36,
    textAlign: "center",
  },

  texto: {
    margin: "12px auto 28px",
    color: "#64748b",
    fontSize: 17,
    textAlign: "center",
  },

  formulario: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  fila: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    color: "#334155",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    fontSize: 17,
    outline: "none",
  },

  error: {
    margin: 0,
    padding: 12,
    background: "#fef2f2",
    color: "#dc2626",
    borderRadius: 10,
    fontWeight: "600",
  },

  btnContinuar: {
    padding: "16px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 17,
    fontWeight: "700",
  },

  estado: {
    marginTop: 24,
    padding: 14,
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: 12,
    textAlign: "center",
    fontWeight: "700",
  },
};