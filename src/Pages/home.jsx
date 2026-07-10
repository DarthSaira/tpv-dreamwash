export default function Home({ styles, setPantalla }) {
    return (
      <div style={styles.homePage}>
        <div style={styles.homeHeader}>
          <div style={styles.homeLogo}>🚗</div>
  
          <div>
            <h1 style={styles.homeTitle}>Yanlai Workshop</h1>
  
            <p style={styles.homeSubtitle}>
              ¿Qué quieres hacer ahora?
            </p>
          </div>
        </div>
  
        <div style={styles.homeGrid}>
          <button
            style={styles.homeCard}
            onClick={() => setPantalla("recepcion")}
          >
            <div style={styles.homeCardIcon}>🚗</div>
  
            <div>
              <div style={styles.homeCardTitle}>Recepción</div>
  
              <div style={styles.homeCardText}>
                Crear una Orden de Trabajo
              </div>
            </div>
          </button>
  
          <button
            style={styles.homeCard}
            onClick={() => setPantalla("tpv")}
          >
            <div style={styles.homeCardIcon}>💳</div>
  
            <div>
              <div style={styles.homeCardTitle}>Cobro</div>
  
              <div style={styles.homeCardText}>
                Cobrar servicios u órdenes
              </div>
            </div>
          </button>
  
          <button
            style={styles.homeCard}
            onClick={() => setPantalla("gestion")}
          >
            <div style={styles.homeCardIcon}>📊</div>
  
            <div>
              <div style={styles.homeCardTitle}>Gestión</div>
  
              <div style={styles.homeCardText}>
                Ver taller, caja y operaciones
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }