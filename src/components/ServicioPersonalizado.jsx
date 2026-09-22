import { useState } from "react";

const parsearPrecio = (texto) => {
  const normalizado = String(texto).trim().replace(",", ".");

  if (normalizado === "") {
    return { ok: false, valor: null };
  }

  const numero = Number(normalizado);

  if (!Number.isFinite(numero) || numero <= 0) {
    return { ok: false, valor: null };
  }

  return { ok: true, valor: Math.round(numero * 100) / 100 };
};

export default function ServicioPersonalizado({ onAdd, styles }) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [error, setError] = useState("");

  const agregar = () => {
    const nombreLimpio = nombre.trim();
    const precioParseado = parsearPrecio(precio);

    if (!nombreLimpio) {
      setError("Indica el nombre del servicio.");
      return;
    }

    if (!precioParseado.ok) {
      setError("Indica un precio válido mayor que 0.");
      return;
    }

    onAdd({
      id: `srv-${Date.now()}`,
      nombre: nombreLimpio,
      precio: precioParseado.valor,
    });

    setNombre("");
    setPrecio("");
    setError("");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
        <input
          style={{ ...styles.input, flex: 2 }}
          placeholder="Nombre del servicio (Ej: Pulido)"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setError("");
          }}
        />

        <input
          style={{ ...styles.input, flex: 1 }}
          inputMode="decimal"
          placeholder="Precio (€)"
          value={precio}
          onChange={(e) => {
            setPrecio(e.target.value);
            setError("");
          }}
        />

        <button type="button" onClick={agregar} style={styles.btnPersonalizadoAdd}>
          Añadir
        </button>
      </div>
      {error && <p style={styles.errorCobro}>{error}</p>}
    </div>
  );
}
