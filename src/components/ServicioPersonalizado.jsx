import { useState } from "react";
export default function ServicioPersonalizado({ onAdd, styles }) {
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
  
    const agregar = () => {
      if (!nombre || !precio) return;
  
      onAdd({
        id: Date.now(),
        nombre,
        precio: Number(precio),
      });
  
      setNombre("");
      setPrecio("");
    };
  
    return (
      <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
        <input
          style={{ ...styles.input, flex: 2 }}
          placeholder="Nombre del servicio (Ej: Pulido)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
  
        <input
          style={{ ...styles.input, flex: 1 }}
          type="number"
          placeholder="Precio (€)"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />
  
        <button onClick={agregar} style={styles.btnPersonalizadoAdd}>
          Añadir
        </button>
      </div>
    );
  }
  