import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ServicioPersonalizado from "./components/ServicioPersonalizado";
import ModalCobro from "./components/ModalCobro";
import Ticket from "./components/Ticket";

const dataInicial = [
  {
    id: 1,
    nombre: "Lavados",
    servicios: [
      { id: 11, nombre: "Lavado básico", precio: 8 },
      { id: 12, nombre: "Lavado completo", precio: 15 },
    ],
  },
  {
    id: 2,
    nombre: "Higienización",
    servicios: [
      { id: 21, nombre: "Interior básico", precio: 12 },
      { id: 22, nombre: "Ozonización", precio: 20 },
    ],
  },
];

export default function App() {
  const [categorias] = useState(dataInicial);
  const [seleccionados, setSeleccionados] = useState([]);

  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [pagoCliente, setPagoCliente] = useState("");
  const [matricula, setMatricula] = useState("");
  const [modeloCoche, setModeloCoche] = useState("");
  
  const [ventas, setVentas] = useState(() => {
    const guardadas = localStorage.getItem("ventas");
    return guardadas ? JSON.parse(guardadas) : [];
  });
  
  const [pantalla, setPantalla] = useState("tpv");
  const [pasoPago, setPasoPago] = useState(false);
  const [mostrarPersonalizado, setMostrarPersonalizado] = useState(false);

  // Estados para controlar el modal de éxito/cambio al cobrar
  const [modalExito, setModalExito] = useState(false);
  const [cambioFinalModal, setCambioFinalModal] = useState(0);

  const agregarServicio = (servicio) => {
    const existe = seleccionados.find((s) => s.id === servicio.id);
    if (existe) {
      setSeleccionados(
        seleccionados.map((s) =>
          s.id === servicio.id ? { ...s, cantidad: s.cantidad + 1 } : s
        )
      );
    } else {
      setSeleccionados([...seleccionados, { ...servicio, cantidad: 1 }]);
    }
  };

  const eliminarServicioCompleto = (id) => {
    setSeleccionados(seleccionados.filter((s) => s.id !== id));
  };

  // Ahora limpia absolutamente todo, incluyendo los inputs de texto
  const limpiarTicket = () => {
    setSeleccionados([]);
    setMatricula("");
    setModeloCoche("");
    setPagoCliente("");
    setPasoPago(false);
  };

  const eliminarVentaHistorial = (id) => {
    const seguro = window.confirm("¿Estás seguro de que deseas anular y eliminar esta venta del historial?");
    if (seguro) {
      const nuevasVentas = ventas.filter((v) => v.id !== id);
      setVentas(nuevasVentas);
      localStorage.setItem("ventas", JSON.stringify(nuevasVentas));
    }
  };

  // Cierre manual de la caja del día
  const handleCierreCaja = () => {
    if (ventas.length === 0) {
      alert("No hay ventas registradas hoy para realizar un cierre.");
      return;
    }
    const seguro = window.confirm(
      `¿Deseas realizar el CIERRE DE CAJA del día?\nTotal recaudado: ${totalCaja.toFixed(2)}€\n\nEsto vaciará el historial actual.`
    );
    if (seguro) {
      setVentas([]);
      localStorage.removeItem("ventas");
      alert("Caja cerrada correctamente. ¡Buen trabajo!");
    }
  };

  const subtotal = seleccionados.reduce((acc, s) => acc + (s.precio * s.cantidad), 0);
  const iva = subtotal * 0.21;
  const total = subtotal + iva;
  
  const totalEfectivo = ventas
    .filter((v) => v.metodoPago === "efectivo")
    .reduce((acc, v) => acc + v.total, 0);

  const totalTarjeta = ventas
    .filter((v) => v.metodoPago === "tarjeta")
    .reduce((acc, v) => acc + v.total, 0);

  const totalCaja = totalEfectivo + totalTarjeta;

  const cambio =
    metodoPago === "efectivo" && pagoCliente
      ? Number(pagoCliente) - total
      : 0;

  const handleCobrarEImprimir = () => {
    if (seleccionados.length === 0) {
      alert("Por favor, selecciona al menos un servicio antes de cobrar.");
      return;
    }

    const nuevaVenta = {
      id: Date.now(),
      fecha: new Date().toLocaleString(),
      matricula,
      modeloCoche,
      servicios: seleccionados,
      subtotal,
      iva,
      total,
      metodoPago,
      pagoCliente,
      cambio,
    };

    const nuevasVentas = [nuevaVenta, ...ventas];
    setVentas(nuevasVentas);
    localStorage.setItem("ventas", JSON.stringify(nuevasVentas));

    // Guardamos el cambio calculado para mostrarlo en el modal grande
    setCambioFinalModal(cambio > 0 ? cambio : 0);
    setModalExito(true);

    window.print();
  };

  // Resetea el TPV después de cerrar el modal de cobro exitoso
  const cerrarModalYResetear = () => {
    setModalExito(false);
    limpiarTicket();
  };

  return (
    <div style={styles.app}>
    <div
  className="no-imprimir"
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  }}
>
  <h1 style={{ margin: 0 }}>🚗 DreamWash TPV</h1>

  <div style={{ display: "flex", gap: 10 }}>
    <button
      style={styles.btnMenu}
      onClick={() => setPantalla("tpv")}
    >
      🏠 TPV
    </button>

    <button
      style={styles.btnMenu}
      onClick={() => setPantalla("gestion")}
    >
      📊 Gestión
    </button>

    <button
      style={styles.btnMenu}
      onClick={() => setPantalla("config")}
    >
      ⚙️ Configuración
    </button>
  </div>
</div>
      <style>{`
        @media print {
          body, html { margin: 0; padding: 0; width: 100%; background: #fff; }
          h1, .no-imprimir, .btn-eliminar-ticket { display: none !important; }
          .zona-ticket { width: 100% !important; border: none !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; position: static !important; }
          .zona-ticket h2, .zona-ticket p, .zona-ticket h3, .zona-ticket div, .zona-ticket span { font-family: 'Courier New', Courier, monospace !important; color: #000 !important; }
          .btn-cobrar, .btn-flujo { display: none !important; }
        }
        button:hover { opacity: 0.9; transform: translateY(-1px); }
        button:active { transform: translateY(0px); }
      `}</style>

      {/* MODAL EMERGENTE DE COBRO EXCELENTE PARA TABLETS */}
      {modalExito && (
  <ModalCobro
    styles={styles}
    metodoPago={metodoPago}
    cambioFinalModal={cambioFinalModal}
    onCerrar={cerrarModalYResetear}
  />
)}

      {/* CONTENEDOR PRINCIPAL */}
      <div
  style={{
    flex: 1,
  }}
></div>
      {pantalla === "config" ? (
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
      ) : (
        <>
          <div
  style={{
    display: "flex",
    gap: 20,
    alignItems: "flex-start",
  }}
>
<Sidebar
  pantalla={pantalla}
  setPantalla={setPantalla}
/>
  
            {/* COLUMNA IZQUIERDA */}
            <div style={styles.columnaIzquierda} className="no-imprimir">
              {!pasoPago ? (
                <>
                  <div style={styles.gridCategorias}>
                    {categorias.map((cat) => (
                      <div key={cat.id} style={styles.card}>
                        <h2 style={styles.tituloSeccion}>{cat.nombre}</h2>
                        {cat.servicios.map((s) => {
                          const enTicket = seleccionados.find((x) => x.id === s.id);
                          return (
                            <button
                              key={s.id}
                              onClick={() => agregarServicio(s)}
                              style={{
                                ...styles.btnServicio,
                                background: enTicket ? "#d1fae5" : "#f3f4f6",
                                color: "#1f2937",
                                border: enTicket ? "2px solid #10b981" : "1px solid #e5e7eb",
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <span style={{ fontWeight: "bold" }}>{s.nombre}</span>
                                  <div style={{ opacity: 0.8, fontSize: 13, marginTop: 2 }}>{s.precio.toFixed(2)}€</div>
                                </div>
                                {enTicket && <span style={styles.badgeCantidad}>x{enTicket.cantidad}</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  <div style={styles.card}>
                    {!mostrarPersonalizado ? (
                      <button onClick={() => setMostrarPersonalizado(true)} style={styles.btnPersonalizadoToggle}>
                        ➕ Añadir Servicio Personalizado
                      </button>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <h2 style={{ ...styles.tituloSeccion, margin: 0, border: 'none' }}>Servicio Personalizado</h2>
                          <button onClick={() => setMostrarPersonalizado(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>
                            Cancelar
                          </button>
                        </div>
                        <ServicioPersonalizado
  styles={styles}
  onAdd={(servicio) => {
    agregarServicio(servicio);
    setMostrarPersonalizado(false);
  }}
/>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ ...styles.tituloSeccion, margin: 0, border: 'none' }}>Formular Pago</h2>
                    <button onClick={() => setPasoPago(false)} style={styles.btnVolverFlujo}>
                      ⬅️ Volver a Servicios
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px', marginBottom: 15 }}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Matrícula</label>
                      <input
                        style={styles.input}
                        placeholder="1234ABC"
                        value={matricula}
                        onChange={(e) => setMatricula(e.target.value.toUpperCase())}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Modelo del Coche</label>
                      <input
                        style={styles.input}
                        placeholder="Ej: VW Golf VII"
                        value={modeloCoche}
                        onChange={(e) => setModeloCoche(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 15 }}>
                    <label style={styles.label}>Forma de Pago</label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      style={styles.input}
                    >
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                    </select>
                  </div>

                  {metodoPago === "efectivo" && (
                    <div style={{ marginTop: 15, padding: '15px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <label style={styles.label}>Efectivo entregado por el cliente:</label>
                      <input
                        style={styles.input}
                        type="number"
                        placeholder="Ej: 50"
                        value={pagoCliente}
                        onChange={(e) => setPagoCliente(e.target.value)}
                      />

                      {pagoCliente && (
                        <p style={{ marginTop: 12, fontSize: 16, color: '#374151', margin: 0 }}>
                          Cambio a devolver:{" "}
                          <b style={{ color: cambio >= 0 ? "#10b981" : "#ef4444", fontSize: 18 }}>
                            {cambio.toFixed(2)}€
                          </b>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA (TICKET) */}
            <div style={styles.columnaDerecha} className="zona-ticket">
  <Ticket
    styles={styles}
    seleccionados={seleccionados}
    matricula={matricula}
    modeloCoche={modeloCoche}
    subtotal={subtotal}
    iva={iva}
    total={total}
    pasoPago={pasoPago}
    metodoPago={metodoPago}
    pagoCliente={pagoCliente}
    cambio={cambio}
    eliminarServicioCompleto={eliminarServicioCompleto}
    limpiarTicket={limpiarTicket}
    setPasoPago={setPasoPago}
    handleCobrarEImprimir={handleCobrarEImprimir}
  />
</div>
</div>

          {/* HISTORIAL DE VENTAS DEL DÍA */}
          <div style={styles.card} className="no-imprimir">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "1px solid #f3f4f6", paddingBottom: 10, marginBottom: 15 }}>
              <h2 style={{ ...styles.tituloSeccion, border: 'none', margin: 0 }}>📊 Historial de Ventas del Día</h2>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right', fontSize: 14, color: '#4b5563' }}>
                  Efectivo: <b>{totalEfectivo.toFixed(2)}€</b> | Tarjeta: <b>{totalTarjeta.toFixed(2)}€</b> | Total Caja: <b style={{ color: '#2563eb' }}>{totalCaja.toFixed(2)}€</b>
                </div>
                {/* Nuevo Botón de Cierre de Caja */}
                <button onClick={handleCierreCaja} style={styles.btnCierreCaja}>
                  🔒 Cerrar Caja
                </button>
              </div>
            </div>

            {ventas.length === 0 ? (
              <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: 14 }}>No hay ventas registradas hoy.</p>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', textAlign: 'left', color: '#6b7280' }}>
                      <th style={{ padding: 8 }}>Hora</th>
                      <th style={{ padding: 8 }}>Coche / Matrícula</th>
                      <th style={{ padding: 8 }}>Método</th>
                      <th style={{ padding: 8, textAlign: 'right' }}>Total</th>
                      <th style={{ padding: 8, textAlign: 'center' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((venta) => (
                      <tr key={venta.id} style={{ borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                        <td style={{ padding: 8 }}>{venta.fecha.split(" ")[1] || venta.fecha}</td>
                        <td style={{ padding: 8 }}>
                          <div><b>{venta.matricula || "S/M"}</b> {venta.modeloCoche && <span>({venta.modeloCoche})</span>}</div>
                        </td>
                        <td style={{ padding: 8, textTransform: 'capitalize' }}>{venta.metodoPago}</td>
                        <td style={{ padding: 8, textAlign: 'right', fontWeight: 'bold' }}>{venta.total.toFixed(2)}€</td>
                        <td style={{ padding: 8, textAlign: 'center' }}>
                          <button onClick={() => eliminarVentaHistorial(venta.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  app: { padding: "25px", fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", backgroundColor: "#f1f5f9", minHeight: "100vh" },
  cabecera: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  logo: { margin: 0, fontSize: 26, fontWeight: "800", color: "#1e293b" },
  btnConfig: { padding: "10px 18px", borderRadius: 10, border: "none", background: "#334155", color: "white", cursor: "pointer", fontWeight: "600", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" },
  contenedorPrincipal: { display: "flex", gap: "20px", marginBottom: 20 },
  columnaIzquierda: { flex: "3" },
  columnaDerecha: { flex: "2" },
  gridCategorias: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 },
  card: { padding: 20, background: "white", borderRadius: 16, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: 20 },
  tituloSeccion: { fontSize: 16, fontWeight: "700", margin: "0 0 15px 0", color: "#1e293b", borderBottom: "2px solid #f1f5f9", paddingBottom: 8 },
  btnServicio: { display: "block", width: "100%", marginTop: 10, padding: "14px", borderRadius: 10, cursor: "pointer", fontSize: 14, textAlign: 'left' },
  badgeCantidad: { background: '#10b981', color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  btnPersonalizadoToggle: { width: "100%", padding: "12px", background: "#f1f5f9", border: "2px dashed #cbd5e1", borderRadius: 10, color: "#475569", fontWeight: "600", cursor: "pointer" },
  btnPersonalizadoAdd: { padding: "0 20px", background: "#16a34a", color: "white", border: "none", borderRadius: 10, fontWeight: "bold", cursor: "pointer" },
  btnVolverFlujo: { padding: "6px 12px", background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer", fontWeight: "600", fontSize: 13 },
  label: { display: "block", marginBottom: 6, fontSize: 13, fontWeight: "600", color: "#475569" },
  input: { padding: "12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#ffffff", color: "#1e293b", width: "100%", fontSize: 14, boxSizing: "border-box", outline: "none" },
  ticketFisico: { background: "white", color: "#000", padding: "30px 24px", border: "1px solid #e2e8f0", borderRadius: 16, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", maxWidth: "380px", margin: "0 auto" },
  ticketCocheBox: { marginTop: 8, background: '#f1f5f9', padding: '8px', borderRadius: '8px', fontSize: '13px', color: '#1e293b', border: '1px solid #e2e8f0' },
  lineaDivisoria: { borderBottom: "1px dashed #cbd5e1", margin: "15px 0" },
  filaTicketContainer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  filaTicket: { display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: 14, color: "#000", flex: 1, marginRight: 10 },
  btnEliminarLinea: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px', fontSize: '12px' },
  btnLimpiarTicket: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textDecoration: 'underline' },
  filaTicketSecundaria: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569", marginBottom: 5 },
  btnContinuarPago: { display: "block", width: "100%", padding: "16px", background: "#2563eb", color: "white", border: "none", borderRadius: 12, fontWeight: "700", fontSize: 16, cursor: "pointer" },
  btnCobrar: { display: "block", width: "100%", padding: "16px", background: "#10b981", color: "white", border: "none", borderRadius: 12, fontWeight: "700", fontSize: 16, cursor: "pointer" },
  btnCierreCaja: { padding: "8px 14px", background: "#dc2626", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "600", fontSize: 13 },
  // Estilos del Modal
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContent: { background: "white", padding: "40px", borderRadius: "20px", maxWidth: "400px", width: "90%", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" },
  modalCambioBox: { background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "15px", borderRadius: "12px", marginBottom: "25px" },
  btnCerrarModal: { width: "100%", padding: "14px", background: "#1e293b", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "15px", cursor: "pointer" },
  btnMenu: { padding: "10px 18px", border: "none", borderRadius: 8, cursor: "pointer", background: "#2563eb", color: "white", fontWeight: "bold" }
};