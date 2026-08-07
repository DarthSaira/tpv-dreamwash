const IconoRecepcion = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 17h14M7 17l1-5h8l1 5M9 12l1-3h4l1 3M7 17v2M17 17v2" />
  </svg>
);

const IconoCobro = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <path d="M4 10h16M8 14h3" />
  </svg>
);

const IconoGestion = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 19V9M12 19V5M19 19v-7" />
  </svg>
);

export default function Home({ setPantalla }) {
  const acciones = [
  {
    titulo: "Recepción",
    descripcion: "Crear una Orden de Reparación",
    pantalla: "recepcion",
    Icono: IconoRecepcion,
  },
  {
    titulo: "Cobros",
    descripcion: "Cobrar servicios u órdenes",
    pantalla: "tpv",
    Icono: IconoCobro,
  },
  {
    titulo: "Gestión",
    descripcion: "Consultar el taller y sus operaciones",
    pantalla: "gestion",
    Icono: IconoGestion,
  },
];

  return (
    <main className="yanlai-home">
      <style>{`
        .yanlai-home {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 34px 20px 56px;
          box-sizing: border-box;
          color: #18181b;
        }

        .yanlai-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 78px;
        }

        .yanlai-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

       .yanlai-logo {
  display: block;
  width: 132px;
  height: auto;
}

.yanlai-product-name {
  margin-left: 6px;
  padding-left: 16px;
  border-left: 1px solid #d4d4d8;
  color: #71717a;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: -0.1px;
}

        .yanlai-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #71717a;
          font-size: 14px;
          font-weight: 500;
        }

        .yanlai-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 4px #dcfce7;
        }

      .yanlai-intro {
  margin-bottom: 22px;
}

.yanlai-title {
  margin: 0;
  color: #71717a;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 500;
  letter-spacing: -0.1px;
}

        .yanlai-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .yanlai-card {
          min-height: 250px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          text-align: left;
          background: #ffffff;
          border: 1px solid #e4e4e7;
          border-radius: 18px;
          box-shadow: 0 8px 24px rgba(24, 24, 27, 0.045);
          cursor: pointer;
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .yanlai-card:hover {
          opacity: 1;
          transform: translateY(-3px);
          border-color: #c4b5fd;
          box-shadow: 0 16px 34px rgba(76, 29, 149, 0.09);
        }

        .yanlai-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #f5f3ff;
          color: #6d28d9;
        }

        .yanlai-icon svg {
          width: 25px;
          height: 25px;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .yanlai-card-bottom {
          width: 100%;
        }

        .yanlai-card-title {
          margin: 0;
          color: #27272a;
          font-size: 23px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .yanlai-card-description {
         margin: 8px 0 0;
          color: #71717a;
          font-size: 15px;
          line-height: 1.5;
        }

        @media (max-width: 780px) {
          .yanlai-home {
            padding-top: 20px;
          }

          .yanlai-topbar {
            margin-bottom: 52px;
          }

          .yanlai-status {
            display: none;
          }

          .yanlai-grid {
            grid-template-columns: 1fr;
          }

          .yanlai-card {
            min-height: 210px;
          }
        }
      `}</style>

      <header className="yanlai-topbar">
        <div className="yanlai-brand">
        <img
  className="yanlai-logo"
  src="/yanlai-logo.png"
  alt="Yanlai"
/>

<span className="yanlai-product-name">Workshop</span>
        </div>

        <div className="yanlai-status">
          <span className="yanlai-status-dot" />
          Sistema operativo
        </div>
      </header>

      <section className="yanlai-intro">
  <h1 className="yanlai-title">El taller está listo.</h1>
</section>

      <section className="yanlai-grid" aria-label="Operaciones del taller">
        {acciones.map(({ titulo, descripcion, pantalla, Icono }) => (
          <button
            key={pantalla}
            type="button"
            className="yanlai-card"
            onClick={() => setPantalla(pantalla)}
          >
            <div className="yanlai-icon">
              <Icono />
            </div>

            <div className="yanlai-card-bottom">
              <h2 className="yanlai-card-title">{titulo}</h2>
              <p className="yanlai-card-description">{descripcion}</p>
            </div>
          </button>
        ))}
      </section>
    </main>
  );
}