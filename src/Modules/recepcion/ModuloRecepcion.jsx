import { useState } from "react";

import {
  IconoCliente,
  IconoConfirmacion,
  IconoMotivo,
  IconoVehiculo,
} from "../../components/WorkshopIcons";

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
  
        <div style={styles.icono}>
  <IconoConfirmacion />
</div>
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
  
          <div style={styles.icono}>
  <IconoMotivo />
</div>
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
  
          <div style={styles.icono}>
  <IconoCliente />
</div>
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

        <div style={styles.icono}>
  <IconoVehiculo />
</div>
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
    width: "100%",
    maxWidth: 1180,
    minHeight: "100vh",
    margin: "0 auto",
    padding: "34px 20px 56px",
    boxSizing: "border-box"
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

  contenido: {
    maxWidth: 720,
    margin: "54px auto 0",
    padding: 38,
    background: "#ffffff",
    border: "1px solid #e4e4e7",
    borderRadius: 18,
    boxShadow: "0 8px 24px rgba(24, 24, 27, 0.045)",
  },

  progreso: {
    marginBottom: 18,
    color: "#6d28d9",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textAlign: "center",
    textTransform: "uppercase"
    
  },

  icono: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 16,
  },

  titulo: {
    margin: 0,
    color: "#27272a",
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.8,
    textAlign: "center",
  },

  texto: {
    margin: "12px auto 30px",
    color: "#71717a",
    fontSize: 16,
    lineHeight: 1.5,
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
    color: "#3f3f46",
    fontSize: 14,
    fontWeight: "600",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    background: "#ffffff",
    color: "#27272a",
    border: "1px solid #d4d4d8",
    borderRadius: 10,
    fontSize: 16,
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
    padding: "14px 18px",
    background: "#6d28d9",
    color: "#ffffff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: "700",
  },

  estado: {
    marginTop: 24,
    padding: 14,
    background: "#f5f3ff",
    color: "#6d28d9",
    border: "1px solid #ddd6fe",
    borderRadius: 10,
    textAlign: "center",
    fontWeight: "700",
  },
};