import { useState, useEffect } from "react";
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

export default function MatrixSolver({ onAccentChange }) {
  const [n, setN] = useState(3);
  const [method, setMethod] = useState("gauss");
  const [cells, setCells] = useState(initMatrix(3));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null); // null | "parse" | "singular"
  const [animKey, setAnimKey] = useState(0);

  // Gauss (el método por defecto) va en el café del catálogo: si abriera en
  // azul, la herramienta estrenaría un color distinto al de su tarjeta.
  const accent = method === "gauss-jordan" ? ACCENTS.blue : ACCENTS.brown;
  useEffect(() => { onAccentChange?.(accent); }, [accent]);

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
  const gridCols = `34px repeat(${n}, minmax(60px, 1fr)) 18px minmax(60px, 1fr)`;

  const coefInput = {
    background: PAPER,
    border: BORDER_THIN,
    borderRadius: 0,
    padding: "14px 10px",
    color: INK,
    fontFamily: MONO,
    fontSize: 18,
    textAlign: "center",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div>
      {/* Método */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        {[
          { id: "gauss", label: "GAUSS" },
          { id: "gauss-jordan", label: "GAUSS-JORDAN" },
        ].map((m) => {
          const isActive = method === m.id;
          const mAccent = m.id === "gauss-jordan" ? ACCENTS.blue : ACCENTS.brown;
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
      <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "16px 22px", borderBottom: BORDER }}>
          <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: INK, textTransform: "uppercase" }}>
            Matriz aumentada · {n}×{n}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: MUTE }}>
            la columna de color es el término independiente
          </span>
        </div>

        <div style={{ padding: "22px 22px 24px", overflowX: "auto" }}>
        {/* Encabezados de columna */}
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "10px 12px", marginBottom: 10 }}>
          <span />
          {Array.from({ length: n }, (_, i) => (
            <span key={i} style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: accent, textAlign: "center", letterSpacing: 1 }}>
              x{i + 1}
            </span>
          ))}
          <span />
          <span style={{ fontFamily: MONO, fontSize: 14, color: MUTE, textAlign: "center" }}>=</span>
        </div>

        {cells.map((row, ri) => (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: gridCols, gap: "10px 12px", marginBottom: ri < n - 1 ? 12 : 0, alignItems: "center" }}>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: MUTE, textAlign: "right" }}>
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

            <div style={{ width: 2, height: 42, background: INK, margin: "0 auto" }} />

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
      </div>

      {/* Resolver */}
      <button
        onClick={solve}
        style={{
          width: "100%",
          padding: "17px 0",
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: INK, textTransform: "uppercase" }}>
              Solución
            </span>
            <div style={{ flex: 1, height: 2, background: INK, minWidth: 20 }} />
            <span style={{ fontFamily: MONO, fontSize: 12.5, color: MUTE }}>
              {method === "gauss-jordan" ? "Forma escalonada reducida (RREF)" : "Triangular superior + sustitución hacia atrás"}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: 14 }}>
            {result.solution.map((v, i) => (
              <div key={i} style={{ background: accent, border: BORDER, boxShadow: SHADOW_SM, padding: "18px 22px" }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.85)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
                  x{i + 1}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 30, color: "#fff", fontWeight: 700, lineHeight: 1.1, wordBreak: "break-all" }}>
                  {fmt(v)}
                </div>
                {v.d !== 1n && (
                  <div style={{ fontFamily: MONO, fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 6 }}>
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
        <div style={{ textAlign: "center", padding: "34px 0", border: `2px dashed ${FAINT}`, color: MUTE, fontFamily: MONO, fontSize: 13, letterSpacing: 0.5 }}>
          ingresa los coeficientes y presiona resolver
        </div>
      )}
    </div>
  );
}
