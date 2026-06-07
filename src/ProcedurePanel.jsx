import { useState } from "react";
import { PAPER, PANEL, INK, MUTE, MONO, BORDER, BORDER_THIN, SHADOW_SM } from "./theme";

// Panel desplegable "Ver procedimiento" — mismo look brutalista en todas las herramientas.
// steps: [{ title: string, lines: string[] }]
export function ProcedurePanel({ accent, steps }) {
  const [open, setOpen] = useState(false);
  if (!steps || steps.length === 0) return null;

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: open ? INK : PANEL,
          color: open ? PAPER : INK,
          border: BORDER,
          borderRadius: 0,
          padding: "10px",
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <span style={{ display: "inline-block", transform: open ? "rotate(180deg)" : "none" }}>▼</span>
        {open ? "OCULTAR" : "VER"} PROCEDIMIENTO
      </button>

      {open && (
        <div style={{ marginTop: 12, background: PANEL, border: BORDER, boxShadow: SHADOW_SM, padding: "8px 18px 14px" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: i < steps.length - 1 ? `1px dashed ${MUTE}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: (s.lines && s.lines.length) ? 8 : 0 }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, background: accent, color: "#fff",
                  border: BORDER_THIN, fontFamily: MONO, fontSize: 12, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {i + 1}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: INK, letterSpacing: 0.5, textTransform: "uppercase" }}>
                  {s.title}
                </span>
              </div>
              {(s.lines || []).map((ln, j) => (
                <div key={j} style={{ fontFamily: MONO, fontSize: 13, color: MUTE, paddingLeft: 32, lineHeight: 1.9, wordBreak: "break-word" }}>
                  {ln}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
