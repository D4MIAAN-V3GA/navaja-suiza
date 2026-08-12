import { useState, useEffect } from "react";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, SHADOW, SHADOW_SM, ACCENTS } from "./theme";
import { ProcedurePanel } from "./ProcedurePanel";

function NumInput({ label, sub, value, onChange, accent }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <label style={{
        fontFamily: MONO, fontSize: 11,
        color: focused ? accent : MUTE,
        letterSpacing: 1.5, textTransform: "uppercase",
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
          background: PAPER, border: BORDER, borderRadius: 0,
          padding: "13px 16px", color: INK, fontFamily: MONO, fontSize: 18, fontWeight: 700,
          outline: "none", width: "100%", boxSizing: "border-box", textAlign: "center",
          boxShadow: focused ? `3px 3px 0 ${accent}` : "none",
        }}
      />
    </div>
  );
}

function KnownRow({ xLabel, xSub, yLabel, ySub, xVal, yVal, onX, onY, accent, rowLabel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: accent, letterSpacing: 2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-block", width: 12, height: 12, background: accent, border: BORDER_THIN }} />
        {rowLabel}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <NumInput label={xLabel} sub={xSub} value={xVal} onChange={onX} accent={accent} />
        <NumInput label={yLabel} sub={ySub} value={yVal} onChange={onY} accent={accent} />
      </div>
    </div>
  );
}

export default function LinearInterpolator({ onAccentChange }) {
  const accent = ACCENTS.pink;
  const cGreen = ACCENTS.green;
  const cBlue = ACCENTS.blue;
  useEffect(() => { onAccentChange?.(accent); }, []);

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

  function MiniGraph() {
    const nx1 = parseFloat(x1), ny1 = parseFloat(y1);
    const nx2 = parseFloat(x2), nx3 = parseFloat(x3), ny3 = parseFloat(y3);
    const y2 = result;
    // La gráfica es la que hace entendible el resultado: se dibuja grande y
    // se escala sola con la columna (viewBox + width 100%).
    const W = 620, H = 260, pad = 40;

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
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", display: "block", border: BORDER_THIN, background: PANEL }}
      >
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1={pad} y1={pad + t * (H - pad * 2)} x2={W - pad} y2={pad + t * (H - pad * 2)} stroke={FAINT} strokeWidth="1" strokeDasharray="2,3" />
        ))}
        <line x1={p1x} y1={p1y} x2={p3x} y2={p3y} stroke={INK} strokeWidth="2.5" />
        {y2 !== null && !isNaN(nx2) && (
          <>
            <line x1={px(nx2)} y1={py(y2)} x2={px(nx2)} y2={H - pad} stroke={accent} strokeWidth="1.5" strokeDasharray="4,3" />
            <line x1={pad} y1={py(y2)} x2={px(nx2)} y2={py(y2)} stroke={accent} strokeWidth="1.5" strokeDasharray="4,3" />
            <rect x={px(nx2) - 7} y={py(y2) - 7} width="14" height="14" fill={accent} stroke={INK} strokeWidth="2" />
          </>
        )}
        <rect x={p1x - 7} y={p1y - 7} width="14" height="14" fill={cGreen} stroke={INK} strokeWidth="2" />
        <rect x={p3x - 7} y={p3y - 7} width="14" height="14" fill={cBlue} stroke={INK} strokeWidth="2" />
        <text x={p1x} y={p1y - 13} textAnchor="middle" fill={INK} fontSize="13" fontFamily="monospace">(x1,y1)</text>
        <text x={p3x} y={p3y - 13} textAnchor="middle" fill={INK} fontSize="13" fontFamily="monospace">(x3,y3)</text>
        {y2 !== null && !isNaN(nx2) && (
          <text x={px(nx2) + 12} y={py(y2) - 9} fill={INK} fontSize="13" fontWeight="700" fontFamily="monospace">y2</text>
        )}
      </svg>
    );
  }

  const fmt = (n) => {
    if (!isFinite(n)) return "—";
    if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4);
    return parseFloat(n.toFixed(6)).toString();
  };

  const procSteps = (result !== null && !error) ? (() => {
    const m = (parseFloat(y3) - parseFloat(y1)) / (parseFloat(x3) - parseFloat(x1));
    const dx2 = parseFloat(x2) - parseFloat(x1);
    return [
      { title: "Fórmula", lines: ["y2 = y1 + [(x2 − x1)/(x3 − x1)] · (y3 − y1)"] },
      { title: "Sustitución", lines: [`y2 = ${y1} + [(${x2} − ${x1})/(${x3} − ${x1})] · (${y3} − ${y1})`] },
      { title: "Pendiente entre puntos", lines: [`m = (${y3} − ${y1}) / (${x3} − ${x1}) = ${fmt(m)}`] },
      { title: "Resultado", lines: [`y2 = ${y1} + (${fmt(dx2)})·(${fmt(m)}) = ${fmt(result)}`] },
    ];
  })() : [];

  return (
    <div>
      <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW }}>
        <div style={{ padding: "24px 24px 0" }}>
          <KnownRow rowLabel="Punto conocido 1" xLabel="x" xSub="1" yLabel="y" ySub="1" xVal={x1} yVal={y1} onX={setX1} onY={setY1} accent={cGreen} />

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 2, background: INK }} />
            <span style={{ fontFamily: MONO, fontSize: 16, color: INK }}>▼</span>
            <div style={{ flex: 1, height: 2, background: INK }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: accent, letterSpacing: 2, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-block", width: 12, height: 12, background: accent, border: BORDER_THIN }} />
              Valor a interpolar
            </div>
            <NumInput label="x" sub="2" value={x2} onChange={setX2} accent={accent} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 20px" }}>
            <div style={{ flex: 1, height: 2, background: INK }} />
            <span style={{ fontFamily: MONO, fontSize: 16, color: INK }}>▼</span>
            <div style={{ flex: 1, height: 2, background: INK }} />
          </div>

          <KnownRow rowLabel="Punto conocido 2" xLabel="x" xSub="3" yLabel="y" ySub="3" xVal={x3} yVal={y3} onX={setX3} onY={setY3} accent={cBlue} />
        </div>

        {/* Result */}
        <div style={{ padding: "20px 24px 24px" }}>
          <div key={animKey} style={{
            marginTop: 8,
            background: error ? ACCENTS.pink : result !== null ? accent : PAPER,
            border: BORDER,
            boxShadow: (error || result !== null) ? SHADOW_SM : "none",
            padding: "20px 24px", textAlign: "center",
          }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: (error || result !== null) ? "rgba(255,255,255,0.9)" : MUTE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
              {error ? "Error" : "Resultado — y2"}
            </div>

            {error && (
              <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>
                División por cero
              </div>
            )}

            {!error && result !== null && (
              <div>
                <div style={{ fontFamily: MONO, fontSize: "clamp(28px, 8vw, 44px)", fontWeight: 700, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>
                  {fmt(result)}
                </div>
                <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
                  interpolado en x2 = {x2}
                </div>
              </div>
            )}

            {!error && result === null && (
              <div style={{ fontFamily: MONO, fontSize: 13, color: MUTE }}>
                Completa los 5 campos para obtener y2
              </div>
            )}
          </div>

          {result !== null && !error && <ProcedurePanel accent={accent} steps={procSteps} />}
        </div>

        {/* Graph */}
        {hasEnoughForLine && (
          <div style={{ borderTop: BORDER, padding: "18px 24px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase" }}>
              Representación gráfica
            </div>
            <MiniGraph />
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                { color: cGreen, label: "(x1, y1)" },
                { color: cBlue, label: "(x3, y3)" },
                { color: accent, label: "(x2, y2) interpolado" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 11, height: 11, background: color, border: BORDER_THIN }} />
                  <span style={{ fontFamily: MONO, fontSize: 11.5, color: MUTE }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
