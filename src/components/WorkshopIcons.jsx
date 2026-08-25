const IconoBase = ({ children }) => (
    <span
      aria-hidden="true"
      style={{
        width: 42,
        height: 42,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
        background: "#f5f3ff",
        color: "#6d28d9",
        borderRadius: 11,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  );
  
  export const IconoVehiculo = () => (
    <IconoBase>
      <path d="M5 17h14M7 17l1-5h8l1 5M9 12l1-3h4l1 3M7 17v2M17 17v2" />
    </IconoBase>
  );
  
  export const IconoCliente = () => (
    <IconoBase>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 19c.7-3.3 2.7-5 6-5s5.3 1.7 6 5" />
    </IconoBase>
  );
  
  export const IconoMotivo = () => (
    <IconoBase>
      <path d="M7 4h7l3 3v13H7z" />
      <path d="M14 4v4h4M10 12h4M10 16h4" />
    </IconoBase>
  );
  
  export const IconoDiagnostico = () => (
    <IconoBase>
      <circle cx="10" cy="10" r="5" />
      <path d="m14 14 5 5M8 10h4M10 8v4" />
    </IconoBase>
  );
  
  export const IconoProgreso = () => (
    <IconoBase>
      <path d="M5 17V9M12 17V5M19 17v-4" />
    </IconoBase>
  );
  
  export const IconoPresupuesto = () => (
    <IconoBase>
      <path d="M6 4h12v16H6z" />
      <path d="M9 8h6M9 12h2M14 12h1M9 16h2M14 16h1" />
    </IconoBase>
  );

  export const IconoConfirmacion = () => (
    <IconoBase>
      <path d="m6 12 4 4 8-9" />
    </IconoBase>

  );