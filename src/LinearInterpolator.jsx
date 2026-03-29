import { useState, useEffect } from "react";

function NumInput({ label, sub, value, onChange, accent = "#00ffb4" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <label style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        color: focused ? accent : "#4b5563",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        transition: "color 0.2s",
        display: "flex", alignItems: "baseline", gap: 4,
      }}>
        {label}
        {sub && <sub style={{ fontSize: 9, color: "inherit" }}>{sub}</sub>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${focused ? accent + "88" : "rgba(255,255,255,0.07)"}`,
          borderRadius: 12,
          padding: "13px 16px",
          color: "#f1f5f9",
          fontFamily: "'Space Mono', monospace",
          fontSize: 18,
          fontWeight: 700,
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          transition: "all 0.2s",
          textAlign: "center",
          boxShadow: focused ? `0 0 20px ${accent}18` : "none",
        }}
      />
    </div>
  );
}

function KnownRow({ xLabel, xSub, yLabel, ySub, xVal, yVal, onX, onY, accent, rowLabel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{
        fontFamily: "'Space Mono', monospace", fontSize: 10,
        color: accent + "bb", letterSpacing: 3, textTransform: "uppercase",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ display: "inline-block", width: 20, height: 1, background: accent + "66" }} />
        {rowLabel}
        <span style={{ display: "inline-block", flex: 1, height: 1, background: accent + "22" }} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <NumInput label={xLabel} sub={xSub} value={xVal} onChange={onX} accent={accent} />
        <NumInput label={yLabel} sub={ySub} value={yVal} onChange={onY} accent={accent} />
      </div>
    </div>
  );
}

export default function LinearInterpolator() {
  const [x1, setX1] = useState("");
  const [y1, setY1] = useState("");
  const [x2, setX2] = useState("");
  const [x3, setX3] = useState("");
  const [y3, setY3] = useState("");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const nx1 = parseFloat(x1), ny1 = parseFloat(y1),
      nx2 = parseFloat(x2),
      nx3 = parseFloat(x3), ny3 = parseFloat(y3);

    const allFilled = [nx1, ny1, nx2, nx3, ny3].every((v) => !isNaN(v));
    if (!allFilled) { setResult(null); setError(""); return; }

    if (nx1 === nx3) {
      setError("División por cero");
      setResult(null);
      return;
    }
    setError("");
    const y2 = ny1 + ((nx2 - nx1) / (nx3 - nx1)) * (ny3 - ny1);
    setResult(y2);
    setAnimKey((k) => k + 1);
  }, [x1, y1, x2, x3, y3]);

  const hasEnoughForLine = !isNaN(parseFloat(x1)) && !isNaN(parseFloat(y1)) &&
    !isNaN(parseFloat(x3)) && !isNaN(parseFloat(y3)) && parseFloat(x1) !== parseFloat(x3);

  // mini SVG graph
  function MiniGraph() {
    const nx1 = parseFloat(x1), ny1 = parseFloat(y1);
    const nx2 = parseFloat(x2), nx3 = parseFloat(x3), ny3 = parseFloat(y3);
    const y2 = result;
    const W = 260, H = 120, pad = 24;

    const xs = [nx1, nx3, !isNaN(nx2) ? nx2 : null].filter((v) => v !== null);
    const ys = [ny1, ny3, y2 !== null ? y2 : null].filter((v) => v !== null);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rX = maxX - minX || 1, rY = maxY - minY || 1;

    const px = (x) => pad + ((x - minX) / rX) * (W - pad * 2);
    const py = (y) => H - pad - ((y - minY) / rY) * (H - pad * 2);

    const p1x = px(nx1), p1y = py(ny1);
    const p3x = px(nx3), p3y = py(ny3);

    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        {/* grid lines */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t}
            x1={pad} y1={pad + t * (H - pad * 2)}
            x2={W - pad} y2={pad + t * (H - pad * 2)}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1"
          />
        ))}
        {/* interpolation line */}
        <line x1={p1x} y1={p1y} x2={p3x} y2={p3y} stroke="#00ffb4" strokeWidth="1.5" strokeDasharray="5,3" opacity="0.5" />
        {/* extended faint */}
        <line x1={pad} y1={p1y + (pad - p1x) * (p3y - p1y) / (p3x - p1x)}
          x2={W - pad} y2={p1y + (W - pad - p1x) * (p3y - p1y) / (p3x - p1x)}
          stroke="#00ffb4" strokeWidth="0.5" opacity="0.12" />
        {/* known points */}
        <circle cx={p1x} cy={p1y} r="5" fill="#0d1117" stroke="#00ffb4" strokeWidth="2" />
        <circle cx={p3x} cy={p3y} r="5" fill="#0d1117" stroke="#7c6ff7" strokeWidth="2" />
        {/* x2/y2 point */}
        {y2 !== null && !isNaN(nx2) && (
          <>
            <line x1={px(nx2)} y1={py(y2)} x2={px(nx2)} y2={H - pad}
              stroke="#f7c06f" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
            <line x1={pad} y1={py(y2)} x2={px(nx2)} y2={py(y2)}
              stroke="#f7c06f" strokeWidth="1" strokeDasharray="3,2" opacity="0.5" />
            <circle cx={px(nx2)} cy={py(y2)} r="6" fill="#f7c06f" opacity="0.9"
              style={{ filter: "drop-shadow(0 0 6px #f7c06f)" }} />
          </>
        )}
        {/* labels */}
        <text x={p1x} y={p1y - 9} textAnchor="middle" fill="#00ffb4" fontSize="9" fontFamily="monospace">(x₁,y₁)</text>
        <text x={p3x} y={p3y - 9} textAnchor="middle" fill="#7c6ff7" fontSize="9" fontFamily="monospace">(x₃,y₃)</text>
        {y2 !== null && !isNaN(nx2) && (
          <text x={px(nx2) + 9} y={py(y2) - 6} fill="#f7c06f" fontSize="9" fontFamily="monospace">y₂</text>
        )}
      </svg>
    );
  }

  const fmt = (n) => {
    if (!isFinite(n)) return "—";
    if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4);
    return parseFloat(n.toFixed(6)).toString();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px) scale(0.98); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes pulse-border {
          0%,100% { box-shadow: 0 0 0 0 rgba(247,192,111,0); }
          50%      { box-shadow: 0 0 0 6px rgba(247,192,111,0.12); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#0d1117",
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,255,180,0.06), transparent)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "32px 16px 56px",
        fontFamily: "'Syne', sans-serif",
      }}>

        {/* dot grid */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div style={{ width: "100%", maxWidth: 560, position: "relative" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(0,255,180,0.06)", border: "1px solid rgba(0,255,180,0.15)",
              borderRadius: 999, padding: "4px 14px", marginBottom: 14,
            }}>
              <span style={{ color: "#00ffb4", fontSize: 11, letterSpacing: 2, fontFamily: "'Space Mono', monospace" }}>
                HERRAMIENTA 3 / 5
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(22px, 5vw, 34px)", fontWeight: 800, color: "#f0f4f8", margin: "0 0 6px", letterSpacing: -0.5 }}>
              Interpolador{" "}
              <span style={{ color: "#00ffb4" }}>Lineal</span>
            </h1>
            <p style={{ color: "#374151", fontSize: 13, margin: 0, fontFamily: "'Space Mono', monospace" }}>
              y₂ = y₁ + [(x₂ − x₁) / (x₃ − x₁)] · (y₃ − y₁)
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 22,
            overflow: "hidden",
          }}>

            <div style={{ padding: "24px 24px 0" }}>
              {/* Punto 1 */}
              <KnownRow
                rowLabel="Punto conocido 1"
                xLabel="x" xSub="1" yLabel="y" ySub="1"
                xVal={x1} yVal={y1}
                onX={setX1} onY={setY1}
                accent="#00ffb4"
              />

              {/* Divider con flecha */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ width: 1, height: 8, background: "rgba(247,192,111,0.3)" }} />
                  <div style={{ width: 6, height: 6, borderRight: "1px solid rgba(247,192,111,0.5)", borderBottom: "1px solid rgba(247,192,111,0.5)", transform: "rotate(45deg)", marginTop: -4 }} />
                </div>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
              </div>

              {/* x2 — valor a interpolar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 10,
                  color: "#f7c06fbb", letterSpacing: 3, textTransform: "uppercase",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ display: "inline-block", width: 20, height: 1, background: "#f7c06f66" }} />
                  Valor a interpolar
                  <span style={{ display: "inline-block", flex: 1, height: 1, background: "#f7c06f22" }} />
                </div>
                <NumInput label="x" sub="2" value={x2} onChange={setX2} accent="#f7c06f" />
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 20px" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ width: 1, height: 8, background: "rgba(124,111,247,0.3)" }} />
                  <div style={{ width: 6, height: 6, borderRight: "1px solid rgba(124,111,247,0.5)", borderBottom: "1px solid rgba(124,111,247,0.5)", transform: "rotate(45deg)", marginTop: -4 }} />
                </div>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
              </div>

              {/* Punto 3 */}
              <KnownRow
                rowLabel="Punto conocido 2"
                xLabel="x" xSub="3" yLabel="y" ySub="3"
                xVal={x3} yVal={y3}
                onX={setX3} onY={setY3}
                accent="#7c6ff7"
              />
            </div>

            {/* Result */}
            <div style={{ padding: "20px 24px 24px" }}>
              <div key={animKey} style={{
                marginTop: 8,
                background: error
                  ? "rgba(248,113,113,0.07)"
                  : result !== null
                    ? "rgba(247,192,111,0.07)"
                    : "rgba(255,255,255,0.02)",
                border: `1px solid ${error ? "rgba(248,113,113,0.3)" : result !== null ? "rgba(247,192,111,0.3)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 16,
                padding: "20px 24px",
                textAlign: "center",
                animation: (error || result !== null) ? "fadeUp 0.35s ease both" : "none",
                animationName: (error || result !== null) ? (result !== null ? "pulse-border" : "fadeUp") : "none",
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  color: error ? "#f87171" : result !== null ? "#f7c06f" : "#374151",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}>
                  {error ? "⚠ Error" : "Resultado — y₂"}
                </div>

                {error && (
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#f87171",
                    letterSpacing: 1,
                  }}>
                    Error: División por cero
                  </div>
                )}

                {!error && result !== null && (
                  <div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "clamp(28px, 8vw, 44px)",
                      fontWeight: 700,
                      color: "#f7c06f",
                      textShadow: "0 0 30px rgba(247,192,111,0.4)",
                      letterSpacing: -1,
                      lineHeight: 1,
                    }}>
                      {fmt(result)}
                    </div>
                    <div style={{
                      marginTop: 8,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 11,
                      color: "#374151",
                    }}>
                      interpolado en x₂ = {x2}
                    </div>
                  </div>
                )}

                {!error && result === null && (
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 13,
                    color: "#1f2937",
                  }}>
                    Completa los 5 campos para obtener y₂
                  </div>
                )}
              </div>
            </div>

            {/* Graph */}
            {hasEnoughForLine && (
              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                padding: "16px 24px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#1f2937", letterSpacing: 2, textTransform: "uppercase" }}>
                  Representación gráfica
                </div>
                <MiniGraph />
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
                  {[
                    { color: "#00ffb4", label: "(x₁, y₁)" },
                    { color: "#7c6ff7", label: "(x₃, y₃)" },
                    { color: "#f7c06f", label: "(x₂, y₂) interpolado" },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#374151" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
