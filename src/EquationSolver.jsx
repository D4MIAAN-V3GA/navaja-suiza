import { useState } from "react";

const ACCENT = "#9D9DFF";

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

function initCoeffs(is3x3) {
  const rows = is3x3 ? 3 : 2;
  const cols = is3x3 ? 4 : 3;
  return Array.from({ length: rows }, () => Array(cols).fill(""));
}

export default function EquationSolver() {
  const [mode, setMode] = useState("2x2");
  const [coeffs, setCoeffs] = useState(initCoeffs(false));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const is3x3 = mode === "3x3";
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
      const x = det2(c[0][2], c[0][1], c[1][2], c[1][1]) / det;
      const y = det2(c[0][0], c[0][2], c[1][0], c[1][2]) / det;
      setResult({ x, y, det });
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
      setResult({
        x: det3x3(Ax) / det,
        y: det3x3(Ay) / det,
        z: det3x3(Az) / det,
        det,
      });
    }
    setError(false);
    setAnimKey((k) => k + 1);
  };

  const cols = is3x3
    ? "28px 1fr 1fr 1fr 18px 1fr"
    : "28px 1fr 1fr 18px 1fr";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .es-result { animation: fadeUp 0.35s ease both; }
        .es-result:nth-child(1) { animation-delay: 0.05s; }
        .es-result:nth-child(2) { animation-delay: 0.11s; }
        .es-result:nth-child(3) { animation-delay: 0.17s; }
        .es-tab { transition: background 0.18s, color 0.18s; }
        .es-input:focus { border-color: ${ACCENT}99 !important; outline: none; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
          fontFamily: "'Syne', sans-serif",
        }}
      >
        {/* Background dot grid */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(157,157,255,0.04) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            pointerEvents: "none",
          }}
        />

        <div style={{ width: "100%", maxWidth: 680, position: "relative" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(157,157,255,0.06)",
                border: "1px solid rgba(157,157,255,0.15)",
                borderRadius: 999,
                padding: "4px 14px",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  color: ACCENT,
                  fontSize: 11,
                  letterSpacing: 2,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                HERRAMIENTA 5 / 5
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(24px, 5vw, 36px)",
                fontWeight: 800,
                color: "#f0f4f8",
                margin: "0 0 8px",
                letterSpacing: -1,
              }}
            >
              Solucionador de{" "}
              <span style={{ color: ACCENT }}>Sistemas Lineales</span>
            </h1>
            <p
              style={{
                color: "#4a5568",
                fontSize: 14,
                margin: 0,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Regla de Cramer · 2×2 · 3×3
            </p>
          </div>

          {/* Mode tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 4,
              marginBottom: 28,
              gap: 4,
            }}
          >
            {["2x2", "3x3"].map((m) => (
              <button
                key={m}
                className="es-tab"
                onClick={() => switchMode(m)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 2,
                  background: mode === m ? ACCENT : "transparent",
                  color: mode === m ? "#0a0a0f" : "#555",
                }}
              >
                {m === "2x2" ? "2 × 2" : "3 × 3"}
              </button>
            ))}
          </div>

          {/* Augmented matrix input */}
          <div
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 18,
              padding: "24px 20px",
              marginBottom: 20,
            }}
          >
            {/* Column headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: cols,
                gap: "8px 10px",
                marginBottom: 10,
              }}
            >
              <span />
              {varNames.map((v) => (
                <span
                  key={v}
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 11,
                    color: ACCENT,
                    textAlign: "center",
                    letterSpacing: 1,
                  }}
                >
                  {v}
                </span>
              ))}
              <span />
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  color: "#4a5568",
                  textAlign: "center",
                  letterSpacing: 1,
                }}
              >
                =
              </span>
            </div>

            {/* Equation rows */}
            {coeffs.map((row, ri) => (
              <div
                key={ri}
                style={{
                  display: "grid",
                  gridTemplateColumns: cols,
                  gap: "8px 10px",
                  marginBottom: ri < coeffs.length - 1 ? 10 : 0,
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10,
                    color: "#333",
                    textAlign: "right",
                    letterSpacing: 1,
                  }}
                >
                  E{ri + 1}
                </span>

                {varNames.map((_, ci) => (
                  <input
                    key={ci}
                    type="number"
                    className="es-input"
                    value={row[ci]}
                    onChange={(e) => handleInput(ri, ci, e.target.value)}
                    placeholder="0"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      borderRadius: 10,
                      padding: "10px 8px",
                      color: "#e2e8f0",
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 14,
                      textAlign: "center",
                      width: "100%",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                  />
                ))}

                {/* Separator | */}
                <div
                  style={{
                    width: 1,
                    height: 34,
                    background: "rgba(157,157,255,0.25)",
                    margin: "0 auto",
                    borderRadius: 999,
                  }}
                />

                {/* RHS input */}
                <input
                  type="number"
                  className="es-input"
                  value={row[rhsIdx]}
                  onChange={(e) => handleInput(ri, rhsIdx, e.target.value)}
                  placeholder="0"
                  style={{
                    background: "rgba(157,157,255,0.06)",
                    border: "1px solid rgba(157,157,255,0.18)",
                    borderRadius: 10,
                    padding: "10px 8px",
                    color: ACCENT,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 14,
                    textAlign: "center",
                    width: "100%",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
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
              background: ACCENT,
              border: "none",
              borderRadius: 12,
              color: "#0a0a0f",
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 2,
              cursor: "pointer",
              marginBottom: 28,
              boxShadow: "0 0 24px rgba(157,157,255,0.25)",
              transition: "box-shadow 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 40px rgba(157,157,255,0.5)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 24px rgba(157,157,255,0.25)")
            }
          >
            RESOLVER SISTEMA
          </button>

          {/* Error banner */}
          {error && (
            <div
              style={{
                background: "rgba(255,80,80,0.07)",
                border: "1px solid rgba(255,80,80,0.28)",
                borderRadius: 12,
                padding: "16px 20px",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <span
                style={{
                  color: "#ff6b6b",
                  fontSize: 18,
                  lineHeight: 1,
                  marginTop: 1,
                }}
              >
                ⚠
              </span>
              <div>
                <div
                  style={{
                    color: "#ff6b6b",
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  Sistema sin solución única — Δ = 0
                </div>
                <div
                  style={{
                    color: "rgba(255,107,107,0.6)",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 11,
                  }}
                >
                  El sistema es incompatible o tiene infinitas soluciones
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && !error && (
            <div key={animKey}>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  color: "#2d3748",
                  letterSpacing: 1,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                Δ = {fmt(result.det)}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {varNames.map((v) => (
                  <div
                    key={v}
                    className="es-result"
                    style={{ flex: 1, minWidth: 140 }}
                  >
                    <div
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: `1px solid ${ACCENT}44`,
                        borderRadius: 14,
                        padding: "18px 22px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 2,
                          background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                          opacity: 0.7,
                        }}
                      />
                      <div
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 10,
                          color: "#555",
                          letterSpacing: 2,
                          textTransform: "uppercase",
                          marginBottom: 10,
                        }}
                      >
                        {v}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 22,
                          color: ACCENT,
                          fontWeight: 700,
                          textShadow: `0 0 18px ${ACCENT}55`,
                        }}
                      >
                        {fmt(result[v])}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placeholder */}
          {result === null && !error && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#2d3748",
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                letterSpacing: 1,
              }}
            >
              ↑ ingresa los coeficientes y presiona resolver
            </div>
          )}
        </div>
      </div>
    </>
  );
}
