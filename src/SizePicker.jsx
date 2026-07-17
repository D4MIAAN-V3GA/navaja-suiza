import { PANEL, PAPER, INK, MUTE, MONO, BORDER } from "./theme";

// Stepper de tamaño de sistema: [−] n×n [+].
// Lo comparten Ecuaciones y Matrices para que se sientan la misma app.
export default function SizePicker({ value, onChange, min = 2, max = 8 }) {
  const stepBtn = (disabled) => ({
    width: 46,
    border: BORDER,
    borderRadius: 0,
    cursor: disabled ? "default" : "pointer",
    fontFamily: MONO,
    fontSize: 18,
    fontWeight: 700,
    background: PANEL,
    color: disabled ? "#c9c4b4" : INK,
  });

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: MUTE, letterSpacing: 1, marginBottom: 8 }}>
        TAMAÑO DEL SISTEMA · ¿cuántas incógnitas tiene tu ejercicio?
      </div>
      <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
        <button
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label="Reducir tamaño"
          style={stepBtn(value <= min)}
        >
          −
        </button>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          border: BORDER, background: INK, color: PAPER,
          fontFamily: MONO, fontSize: 15, fontWeight: 700, letterSpacing: 2, padding: "10px 0",
        }}>
          {value} × {value}
        </div>
        <button
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label="Aumentar tamaño"
          style={stepBtn(value >= max)}
        >
          +
        </button>
      </div>
    </div>
  );
}
