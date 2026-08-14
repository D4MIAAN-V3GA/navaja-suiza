import { useState } from "react";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, SHADOW, SHADOW_SM, ACCENTS } from "./theme";
import { ProcedurePanel } from "./ProcedurePanel";
import SizePicker from "./SizePicker";
import { detN, fmt, parseFraction, toNumber, fracDiv } from "./matrixSolve";

const MIN_N = 2;
const MAX_N = 8;

function varNamesFor(n) {
  // x, y, z para lo clásico; x1..xn cuando ya no alcanza el abecedario cómodo.
  return n <= 3
    ? ["x", "y", "z"].slice(0, n)
    : Array.from({ length: n }, (_, i) => `x${i + 1}`);
}

function buildEqSteps(r, varNames) {
  const n = varNames.length;
  const c = r.c;
  // coeficientes fraccionarios entre paréntesis: (2/3)x en vez de 2/3x
  const coef = (v) => (v.d === 1n ? fmt(v) : `(${fmt(v)})`);
  const eqLines = c.map(
    (row) => row.slice(0, n).map((v, j) => `${coef(v)}${varNames[j]}`).join(" + ") + ` = ${fmt(row[n])}`
  );

  if (n === 2) {
    return [
      { title: "Planteamiento", lines: eqLines },
      { title: "Determinante del sistema Δ", lines: [
        `Δ = (${fmt(c[0][0])})(${fmt(c[1][1])}) − (${fmt(c[0][1])})(${fmt(c[1][0])}) = ${fmt(r.det)}`,
      ]},
      { title: "Δx  (columna x ← términos indep.)", lines: [
        `Δx = (${fmt(c[0][2])})(${fmt(c[1][1])}) − (${fmt(c[0][1])})(${fmt(c[1][2])}) = ${fmt(r.deltas[0])}`,
      ]},
      { title: "Δy  (columna y ← términos indep.)", lines: [
        `Δy = (${fmt(c[0][0])})(${fmt(c[1][2])}) − (${fmt(c[0][2])})(${fmt(c[1][0])}) = ${fmt(r.deltas[1])}`,
      ]},
      { title: "Solución (regla de Cramer)", lines: varNames.map(
        (v, i) => `${v} = Δ${v} / Δ = ${fmt(r.deltas[i])} / ${fmt(r.det)} = ${fmt(r.solution[i])}`
      )},
    ];
  }

  return [
    { title: "Planteamiento", lines: eqLines },
    { title: "Determinante del sistema Δ", lines: [
      `Δ = det(A) = ${fmt(r.det)}`,
      `(determinante ${n}×${n} por eliminación)`,
    ]},
    { title: "Determinantes de Cramer", lines: varNames.map(
      (v, i) => `Δ${v} = ${fmt(r.deltas[i])}   (columna ${v} ← términos indep.)`
    )},
    { title: "Solución (regla de Cramer)", lines: varNames.map(
      (v, i) => `${v} = Δ${v} / Δ = ${fmt(r.deltas[i])} / ${fmt(r.det)} = ${fmt(r.solution[i])}`
    )},
  ];
}

function initCoeffs(n) {
  return Array.from({ length: n }, () => Array(n + 1).fill(""));
}

export default function EquationSolver() {
  const [n, setN] = useState(2);
  const [coeffs, setCoeffs] = useState(initCoeffs(2));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null); // null | "parse" | "singular"
  const [animKey, setAnimKey] = useState(0);

  const accent = ACCENTS.blue;
  const varNames = varNamesFor(n);

  const changeSize = (size) => {
    const next = Math.min(MAX_N, Math.max(MIN_N, size));
    if (next === n) return;
    setN(next);
    setCoeffs(initCoeffs(next));
    setResult(null);
    setError(null);
  };

  const handleInput = (row, col, val) => {
    setCoeffs((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = val;
      return next;
    });
    // Tocar un coeficiente invalida la solución: si se quedara en pantalla, el
    // usuario copiaría a su tarea unas x, y, z que ya no son de estos datos.
    setResult(null);
    setError(null);
  };

  const solve = () => {
    const c = coeffs.map((row) => row.map(parseFraction));
    if (c.flat().includes(null)) {
      setError("parse");
      setResult(null);
      return;
    }
    const A = c.map((row) => row.slice(0, n));
    const b = c.map((row) => row[n]);

    const det = detN(A);
    if (det.n === 0n) {
      setError("singular");
      setResult(null);
      return;
    }
    // Cramer: Δi = det(A con la columna i sustituida por b). Todo exacto.
    const deltas = varNames.map((_, i) =>
      detN(A.map((row, r) => row.map((v, j) => (j === i ? b[r] : v))))
    );
    const solution = deltas.map((d) => fracDiv(d, det));

    setResult({ det, deltas, solution, c });
    setError(null);
    setAnimKey((k) => k + 1);
  };

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
          {varNames.map((v) => (
            <span key={v} style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: accent, textAlign: "center", letterSpacing: 1 }}>
              {v}
            </span>
          ))}
          <span />
          <span style={{ fontFamily: MONO, fontSize: 14, color: MUTE, textAlign: "center" }}>=</span>
        </div>

        {coeffs.map((row, ri) => (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: gridCols, gap: "10px 12px", marginBottom: ri < n - 1 ? 12 : 0, alignItems: "center" }}>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: MUTE, textAlign: "right" }}>
              E{ri + 1}
            </span>

            {varNames.map((_, ci) => (
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

            {/* separador | */}
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

      {/* Solve button */}
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

      {/* Error banner */}
      {error && (
        <div style={{ background: ACCENTS.pink, border: BORDER, boxShadow: SHADOW_SM, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ color: "#fff", fontSize: 18, lineHeight: 1, marginTop: 1 }}>!</span>
          <div>
            <div style={{ color: "#fff", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>
              {error === "parse" ? "Entrada no válida" : "Sistema sin solución única — Δ = 0"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontFamily: MONO, fontSize: 11 }}>
              {error === "parse"
                ? "Revisa las celdas: usa números o fracciones, p. ej. 2, -1.5, 2/3"
                : "El sistema es incompatible o tiene infinitas soluciones"}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !error && (
        <div key={animKey}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: INK, textTransform: "uppercase" }}>
              Solución
            </span>
            <div style={{ flex: 1, height: 2, background: INK }} />
            <span style={{ fontFamily: MONO, fontSize: 12.5, color: MUTE }}>
              Δ = {fmt(result.det)}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 170px), 1fr))", gap: 14 }}>
            {varNames.map((v, i) => (
              <div key={v} style={{ background: accent, border: BORDER, boxShadow: SHADOW_SM, padding: "18px 22px" }}>
                <div style={{ fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.85)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
                  {v}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 30, color: "#fff", fontWeight: 700, lineHeight: 1.1, wordBreak: "break-all" }}>
                  {fmt(result.solution[i])}
                </div>
                {result.solution[i].d !== 1n && (
                  <div style={{ fontFamily: MONO, fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 6 }}>
                    ≈ {fmt(toNumber(result.solution[i]))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <ProcedurePanel accent={accent} steps={buildEqSteps(result, varNames)} />
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
