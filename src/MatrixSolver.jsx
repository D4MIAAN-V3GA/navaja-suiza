import { useState } from "react";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, SHADOW, SHADOW_SM, ACCENTS } from "./theme";
import { ProcedurePanel } from "./ProcedurePanel";
import SizePicker from "./SizePicker";
import { solveMatrix, parseFraction, toNumber, fmt } from "./matrixSolve";

// n libre entre 2 y 8. El mínimo algebraico es 2; el tope es de UI:
// más de 8 columnas de inputs ya no caben legibles ni en desktop.
// ponytail: subir MAX_N si alguien pide sistemas más grandes.
const MIN_N = 2;
const MAX_N = 8;

function initMatrix(n) {
  return Array.from({ length: n }, () => Array(n + 1).fill(""));
}

export default function MatrixSolver() {
  const [n, setN] = useState(3);
  const [method, setMethod] = useState("gauss");
  const [cells, setCells] = useState(initMatrix(3));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null); // null | "parse" | "singular"
  const [animKey, setAnimKey] = useState(0);

  const accent = method === "gauss-jordan" ? ACCENTS.brown : ACCENTS.blue;

  const changeSize = (size) => {
    const next = Math.min(MAX_N, Math.max(MIN_N, size));
    if (next === n) return;
    setN(next);
    setCells(initMatrix(next));
    setResult(null);
    setError(null);
  };

  const changeMethod = (m) => {
    setMethod(m);
    setResult(null);
    setError(null);
  };

  const handleInput = (r, c, val) => {
    setCells((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = val;
      return next;
    });
  };

  const solve = () => {
    const parsed = cells.map((row) => row.map(parseFraction));
    if (parsed.flat().includes(null)) {
      setError("parse");
      setResult(null);
      return;
    }
    const r = solveMatrix(parsed, method);
    if (!r.ok) {
      setError("singular");
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
    setAnimKey((k) => k + 1);
  };

  // grilla: etiqueta | n coeficientes | separador | término indep.
  // minmax evita que los inputs se aplasten con n grande (la tarjeta scrollea).
  const gridCols = `28px repeat(${n}, minmax(52px, 1fr)) 16px minmax(52px, 1fr)`;

  const coefInput = {
    background: PAPER,
    border: BORDER_THIN,
    borderRadius: 0,
    padding: "10px 8px",
    color: INK,
    fontFamily: MONO,
    fontSize: 14,
    textAlign: "center",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <section style={{ maxWidth: 680, margin: "0 auto", padding: "32px 0 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ display: "inline-block", background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", marginBottom: 12 }}>
          MATRICES
        </span>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 800, color: INK, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Solucionador de matrices
        </h2>
        <p style={{ fontFamily: MONO, fontSize: 13, color: MUTE, margin: 0 }}>
          Gauss · Gauss-Jordan · acepta fracciones («2/3») · resultados exactos
        </p>
      </div>

      {/* Método */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        {[
          { id: "gauss", label: "GAUSS" },
          { id: "gauss-jordan", label: "GAUSS-JORDAN" },
        ].map((m) => {
          const isActive = method === m.id;
          const mAccent = m.id === "gauss-jordan" ? ACCENTS.brown : ACCENTS.blue;
          return (
            <button
              key={m.id}
              onClick={() => changeMethod(m.id)}
              style={{
                flex: 1,
                padding: "12px 0",
                border: BORDER,
                borderRadius: 0,
                cursor: "pointer",
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1,
                background: isActive ? mAccent : PANEL,
                color: isActive ? "#fff" : INK,
                boxShadow: isActive ? SHADOW_SM : "none",
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Tamaño */}
      <SizePicker value={n} onChange={changeSize} min={MIN_N} max={MAX_N} />

      {/* Matriz aumentada */}
      <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: "24px 20px", marginBottom: 20, overflowX: "auto" }}>
        {/* Encabezados de columna */}
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "8px 10px", marginBottom: 10 }}>
          <span />
          {Array.from({ length: n }, (_, i) => (
            <span key={i} style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: accent, textAlign: "center", letterSpacing: 1 }}>
              x{i + 1}
            </span>
          ))}
          <span />
          <span style={{ fontFamily: MONO, fontSize: 12, color: MUTE, textAlign: "center" }}>=</span>
        </div>

        {cells.map((row, ri) => (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: gridCols, gap: "8px 10px", marginBottom: ri < n - 1 ? 10 : 0, alignItems: "center" }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: MUTE, textAlign: "right" }}>
              F{ri + 1}
            </span>

            {Array.from({ length: n }, (_, ci) => (
              <input
                key={ci}
                type="text"
                value={row[ci]}
                onChange={(e) => handleInput(ri, ci, e.target.value)}
                placeholder="0"
                style={coefInput}
                onFocus={(e) => (e.target.style.boxShadow = `3px 3px 0 ${accent}`)}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            ))}

            <div style={{ width: 2, height: 34, background: INK, margin: "0 auto" }} />

            <input
              type="text"
              value={row[n]}
              onChange={(e) => handleInput(ri, n, e.target.value)}
              placeholder="0"
              style={{ ...coefInput, background: accent, color: "#fff", border: BORDER_THIN, fontWeight: 700 }}
              onFocus={(e) => (e.target.style.boxShadow = `3px 3px 0 ${INK}`)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>
        ))}
      </div>

      {/* Resolver */}
      <button
        onClick={solve}
        style={{
          width: "100%",
          padding: "14px 0",
          background: accent,
          border: BORDER,
          boxShadow: SHADOW,
          borderRadius: 0,
          color: "#fff",
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: 2,
          cursor: "pointer",
          marginBottom: 24,
          transition: "transform 0.05s, box-shadow 0.05s",
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = "translate(5px,5px)"; e.currentTarget.style.boxShadow = `0 0 0 ${INK}`; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = SHADOW; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = SHADOW; }}
      >
        RESOLVER SISTEMA
      </button>

      {/* Error */}
      {error && (
        <div style={{ background: ACCENTS.pink, border: BORDER, boxShadow: SHADOW_SM, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ color: "#fff", fontSize: 18, lineHeight: 1, marginTop: 1 }}>!</span>
          <div>
            <div style={{ color: "#fff", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>
              {error === "parse" ? "Entrada no válida" : "Sistema sin solución única"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontFamily: MONO, fontSize: 11 }}>
              {error === "parse"
                ? "Revisa las celdas: usa números o fracciones, p. ej. 2, -1.5, 2/3"
                : "La matriz es singular: el sistema es incompatible o tiene infinitas soluciones"}
            </div>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && !error && (
        <div key={animKey}>
          <div style={{ fontFamily: MONO, fontSize: 12, color: MUTE, letterSpacing: 1, marginBottom: 14, textAlign: "center" }}>
            {method === "gauss-jordan" ? "Forma escalonada reducida (RREF)" : "Triangular superior + sustitución hacia atrás"}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {result.solution.map((v, i) => (
              <div key={i} style={{ flex: 1, minWidth: 120, background: accent, border: BORDER, boxShadow: SHADOW_SM, padding: "16px 20px" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.85)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                  x{i + 1}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 24, color: "#fff", fontWeight: 700, wordBreak: "break-all" }}>
                  {fmt(v)}
                </div>
                {v.d !== 1n && (
                  <div style={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
                    ≈ {fmt(toNumber(v))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <ProcedurePanel accent={accent} steps={result.steps} />
        </div>
      )}

      {/* Placeholder */}
      {result === null && !error && (
        <div style={{ textAlign: "center", padding: "24px 0", border: `2px dashed ${FAINT}`, color: MUTE, fontFamily: MONO, fontSize: 12, letterSpacing: 0.5 }}>
          ingresa los coeficientes y presiona resolver
        </div>
      )}
    </section>
  );
}
