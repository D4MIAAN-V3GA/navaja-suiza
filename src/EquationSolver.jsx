import { useState, useEffect } from "react";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, SHADOW, SHADOW_SM, ACCENTS } from "./theme";
import { ProcedurePanel } from "./ProcedurePanel";

function det2(a, b, c, d) {
  return a * d - b * c;
}

function det3x3(m) {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

function fmt(n) {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(4)).toString();
}

function buildEqSteps(r, is3x3) {
  const c = r.c;
  if (!is3x3) {
    return [
      { title: "Planteamiento", lines: [
        `${c[0][0]}x + ${c[0][1]}y = ${c[0][2]}`,
        `${c[1][0]}x + ${c[1][1]}y = ${c[1][2]}`,
      ]},
      { title: "Determinante del sistema Δ", lines: [
        `Δ = (${c[0][0]})(${c[1][1]}) − (${c[0][1]})(${c[1][0]}) = ${fmt(r.det)}`,
      ]},
      { title: "Δx  (columna x ← términos indep.)", lines: [
        `Δx = (${c[0][2]})(${c[1][1]}) − (${c[0][1]})(${c[1][2]}) = ${fmt(r.dx)}`,
      ]},
      { title: "Δy  (columna y ← términos indep.)", lines: [
        `Δy = (${c[0][0]})(${c[1][2]}) − (${c[0][2]})(${c[1][0]}) = ${fmt(r.dy)}`,
      ]},
      { title: "Solución (regla de Cramer)", lines: [
        `x = Δx / Δ = ${fmt(r.dx)} / ${fmt(r.det)} = ${fmt(r.x)}`,
        `y = Δy / Δ = ${fmt(r.dy)} / ${fmt(r.det)} = ${fmt(r.y)}`,
      ]},
    ];
  }
  return [
    { title: "Planteamiento", lines: [
      `${c[0][0]}x + ${c[0][1]}y + ${c[0][2]}z = ${c[0][3]}`,
      `${c[1][0]}x + ${c[1][1]}y + ${c[1][2]}z = ${c[1][3]}`,
      `${c[2][0]}x + ${c[2][1]}y + ${c[2][2]}z = ${c[2][3]}`,
    ]},
    { title: "Determinante del sistema Δ", lines: [
      `Δ = det(A) = ${fmt(r.det)}`,
      `(expansión por cofactores de la 1ª fila)`,
    ]},
    { title: "Determinantes de Cramer", lines: [
      `Δx = ${fmt(r.dx)}   (columna x ← términos indep.)`,
      `Δy = ${fmt(r.dy)}   (columna y ← términos indep.)`,
      `Δz = ${fmt(r.dz)}   (columna z ← términos indep.)`,
    ]},
    { title: "Solución (regla de Cramer)", lines: [
      `x = Δx / Δ = ${fmt(r.dx)} / ${fmt(r.det)} = ${fmt(r.x)}`,
      `y = Δy / Δ = ${fmt(r.dy)} / ${fmt(r.det)} = ${fmt(r.y)}`,
      `z = Δz / Δ = ${fmt(r.dz)} / ${fmt(r.det)} = ${fmt(r.z)}`,
    ]},
  ];
}

function initCoeffs(is3x3) {
  const rows = is3x3 ? 3 : 2;
  const cols = is3x3 ? 4 : 3;
  return Array.from({ length: rows }, () => Array(cols).fill(""));
}

export default function EquationSolver({ onAccentChange }) {
  const [mode, setMode] = useState("2x2");
  const [coeffs, setCoeffs] = useState(initCoeffs(false));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const is3x3 = mode === "3x3";
  const accent = is3x3 ? ACCENTS.blue : ACCENTS.green;

  useEffect(() => { onAccentChange?.(accent); }, [accent]);
  const varNames = is3x3 ? ["x", "y", "z"] : ["x", "y"];
  const rhsIdx = is3x3 ? 3 : 2;

  const switchMode = (m) => {
    setMode(m);
    setCoeffs(initCoeffs(m === "3x3"));
    setResult(null);
    setError(false);
  };

  const handleInput = (row, col, val) => {
    setCoeffs((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = val;
      return next;
    });
  };

  const solve = () => {
    const c = coeffs.map((row) => row.map((v) => parseFloat(v) || 0));

    if (!is3x3) {
      const det = det2(c[0][0], c[0][1], c[1][0], c[1][1]);
      if (Math.abs(det) < 1e-10) {
        setError(true);
        setResult(null);
        return;
      }
      const dx = det2(c[0][2], c[0][1], c[1][2], c[1][1]);
      const dy = det2(c[0][0], c[0][2], c[1][0], c[1][2]);
      setResult({ x: dx / det, y: dy / det, det, dx, dy, c });
    } else {
      const A = c.map((row) => [row[0], row[1], row[2]]);
      const det = det3x3(A);
      if (Math.abs(det) < 1e-10) {
        setError(true);
        setResult(null);
        return;
      }
      const Ax = c.map((row) => [row[3], row[1], row[2]]);
      const Ay = c.map((row) => [row[0], row[3], row[2]]);
      const Az = c.map((row) => [row[0], row[1], row[3]]);
      const dx = det3x3(Ax), dy = det3x3(Ay), dz = det3x3(Az);
      setResult({ x: dx / det, y: dy / det, z: dz / det, det, dx, dy, dz, c });
    }
    setError(false);
    setAnimKey((k) => k + 1);
  };

  const gridCols = is3x3
    ? "28px 1fr 1fr 1fr 16px 1fr"
    : "28px 1fr 1fr 16px 1fr";

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
          01 / 05 — ECUACIONES
        </span>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 800, color: INK, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Solucionador de sistemas lineales
        </h2>
        <p style={{ fontFamily: MONO, fontSize: 13, color: MUTE, margin: 0 }}>
          Regla de Cramer · 2×2 · 3×3
        </p>
      </div>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {["2x2", "3x3"].map((m) => {
          const tabAccent = m === "3x3" ? ACCENTS.blue : ACCENTS.green;
          const isActive = mode === m;
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1,
                padding: "12px 0",
                border: BORDER,
                borderRadius: 0,
                cursor: "pointer",
                fontFamily: MONO,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                background: isActive ? tabAccent : PANEL,
                color: isActive ? "#fff" : INK,
                boxShadow: isActive ? SHADOW_SM : "none",
              }}
            >
              {m === "2x2" ? "2 × 2" : "3 × 3"}
            </button>
          );
        })}
      </div>

      {/* Augmented matrix */}
      <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: "24px 20px", marginBottom: 20 }}>
        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "8px 10px", marginBottom: 10 }}>
          <span />
          {varNames.map((v) => (
            <span key={v} style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: accent, textAlign: "center", letterSpacing: 1 }}>
              {v}
            </span>
          ))}
          <span />
          <span style={{ fontFamily: MONO, fontSize: 12, color: MUTE, textAlign: "center" }}>=</span>
        </div>

        {coeffs.map((row, ri) => (
          <div key={ri} style={{ display: "grid", gridTemplateColumns: gridCols, gap: "8px 10px", marginBottom: ri < coeffs.length - 1 ? 10 : 0, alignItems: "center" }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: MUTE, textAlign: "right" }}>
              E{ri + 1}
            </span>

            {varNames.map((_, ci) => (
              <input
                key={ci}
                type="number"
                value={row[ci]}
                onChange={(e) => handleInput(ri, ci, e.target.value)}
                placeholder="0"
                style={coefInput}
                onFocus={(e) => (e.target.style.boxShadow = `3px 3px 0 ${accent}`)}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
            ))}

            {/* separador | */}
            <div style={{ width: 2, height: 34, background: INK, margin: "0 auto" }} />

            <input
              type="number"
              value={row[rhsIdx]}
              onChange={(e) => handleInput(ri, rhsIdx, e.target.value)}
              placeholder="0"
              style={{ ...coefInput, background: accent, color: "#fff", border: BORDER_THIN, fontWeight: 700 }}
              onFocus={(e) => (e.target.style.boxShadow = `3px 3px 0 ${INK}`)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>
        ))}
      </div>

      {/* Solve button */}
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

      {/* Error banner */}
      {error && (
        <div style={{ background: ACCENTS.pink, border: BORDER, boxShadow: SHADOW_SM, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
          <span style={{ color: "#fff", fontSize: 18, lineHeight: 1, marginTop: 1 }}>!</span>
          <div>
            <div style={{ color: "#fff", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>
              Sistema sin solución única — Δ = 0
            </div>
            <div style={{ color: "rgba(255,255,255,0.85)", fontFamily: MONO, fontSize: 11 }}>
              El sistema es incompatible o tiene infinitas soluciones
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !error && (
        <div key={animKey}>
          <div style={{ fontFamily: MONO, fontSize: 12, color: MUTE, letterSpacing: 1, marginBottom: 14, textAlign: "center" }}>
            Δ = {fmt(result.det)}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {varNames.map((v) => (
              <div key={v} style={{ flex: 1, minWidth: 140, background: accent, border: BORDER, boxShadow: SHADOW_SM, padding: "16px 20px" }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.85)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                  {v}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 24, color: "#fff", fontWeight: 700 }}>
                  {fmt(result[v])}
                </div>
              </div>
            ))}
          </div>

          <ProcedurePanel accent={accent} steps={buildEqSteps(result, is3x3)} />
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
