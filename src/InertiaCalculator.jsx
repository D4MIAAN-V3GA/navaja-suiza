import { useState, useEffect, useRef } from "react";

const SHAPES = [
  { value: "rectangle", label: "Rectángulo" },
  { value: "circle", label: "Círculo" },
  { value: "triangle", label: "Triángulo (base/altura)" },
  { value: "hollow_circle", label: "Círculo Hueco (tubo)" },
];

function fmt(n, dec = 4) {
  if (!isFinite(n)) return "—";
  const s = parseFloat(n.toFixed(dec)).toString();
  return s;
}

function scientific(n) {
  if (!isFinite(n) || n === 0) return "0";
  if (Math.abs(n) >= 1e5 || (Math.abs(n) < 0.001 && n !== 0)) {
    return n.toExponential(3);
  }
  return fmt(n, 4);
}

function computeRect(b, h) {
  const A = b * h;
  const cx = b / 2, cy = h / 2;
  const Ix = (b * h ** 3) / 12;
  const Iy = (h * b ** 3) / 12;
  const Iz = Ix + Iy;
  return { A, cx, cy, Ix, Iy, Iz };
}

function computeCircle(r) {
  const A = Math.PI * r ** 2;
  const cx = r, cy = r;
  const I = (Math.PI * r ** 4) / 4;
  return { A, cx, cy, Ix: I, Iy: I, Iz: 2 * I };
}

function computeTriangle(b, h) {
  const A = (b * h) / 2;
  const cx = b / 2, cy = h / 3;
  const Ix = (b * h ** 3) / 36;
  const Iy = (h * b ** 3) / 36;
  const Iz = Ix + Iy;
  return { A, cx, cy, Ix, Iy, Iz };
}

function computeHollowCircle(R, r) {
  if (r >= R) return null;
  const A = Math.PI * (R ** 2 - r ** 2);
  const cx = R, cy = R;
  const I = (Math.PI / 4) * (R ** 4 - r ** 4);
  return { A, cx, cy, Ix: I, Iy: I, Iz: 2 * I };
}

// SVG shape preview
function ShapePreview({ shape, vals }) {
  const size = 140;
  const pad = 18;
  const inner = size - pad * 2;

  if (shape === "rectangle") {
    const b = parseFloat(vals.b) || 0;
    const h = parseFloat(vals.h) || 0;
    const max = Math.max(b, h, 1);
    const rw = (b / max) * inner;
    const rh = (h / max) * inner;
    const x = pad + (inner - rw) / 2;
    const y = pad + (inner - rh) / 2;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect x={x} y={y} width={rw} height={rh} fill="rgba(0,255,180,0.12)" stroke="#00ffb4" strokeWidth="1.5" rx="2" />
        {/* centroid dot */}
        <circle cx={x + rw / 2} cy={y + rh / 2} r="3" fill="#f7c06f" />
        {/* axes */}
        <line x1={x + rw / 2} y1={y - 4} x2={x + rw / 2} y2={y + rh + 4} stroke="#f7c06f" strokeWidth="0.8" strokeDasharray="3,2" />
        <line x1={x - 4} y1={y + rh / 2} x2={x + rw + 4} y2={y + rh / 2} stroke="#f7c06f" strokeWidth="0.8" strokeDasharray="3,2" />
      </svg>
    );
  }
  if (shape === "circle") {
    const r = parseFloat(vals.r) || 0;
    const cr = r > 0 ? inner / 2 : inner / 3;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={cr} fill="rgba(124,111,247,0.14)" stroke="#7c6ff7" strokeWidth="1.5" />
        <circle cx={size / 2} cy={size / 2} r="3" fill="#f7c06f" />
        <line x1={size / 2} y1={size / 2 - cr - 4} x2={size / 2} y2={size / 2 + cr + 4} stroke="#f7c06f" strokeWidth="0.8" strokeDasharray="3,2" />
        <line x1={size / 2 - cr - 4} y1={size / 2} x2={size / 2 + cr + 4} y2={size / 2} stroke="#f7c06f" strokeWidth="0.8" strokeDasharray="3,2" />
        {r > 0 && <line x1={size / 2} y1={size / 2} x2={size / 2 + cr} y2={size / 2} stroke="#7c6ff7" strokeWidth="1" />}
        {r > 0 && <text x={size / 2 + cr / 2 - 3} y={size / 2 - 5} fill="#7c6ff7" fontSize="9" fontFamily="monospace">r</text>}
      </svg>
    );
  }
  if (shape === "triangle") {
    const b = parseFloat(vals.b) || 0;
    const h = parseFloat(vals.h) || 0;
    const max = Math.max(b, h, 1);
    const tw = (b / max) * inner;
    const th = (h / max) * inner;
    const ox = pad + (inner - tw) / 2;
    const oy = pad + (inner - th) / 2;
    const pts = `${ox},${oy + th} ${ox + tw},${oy + th} ${ox + tw / 2},${oy}`;
    const cxPx = ox + tw / 2;
    const cyPx = oy + th - th / 3;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon points={pts} fill="rgba(247,192,111,0.12)" stroke="#f7c06f" strokeWidth="1.5" />
        <circle cx={cxPx} cy={cyPx} r="3" fill="#f7c06f" />
        <line x1={cxPx} y1={oy - 4} x2={cxPx} y2={oy + th + 4} stroke="#f7c06f" strokeWidth="0.8" strokeDasharray="3,2" />
      </svg>
    );
  }
  if (shape === "hollow_circle") {
    const R = parseFloat(vals.R) || 0;
    const r = parseFloat(vals.r2) || 0;
    const maxR = Math.max(R, 1);
    const outerR = inner / 2;
    const innerR = R > 0 ? (r / maxR) * outerR : outerR * 0.5;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={outerR} fill="rgba(247,111,154,0.12)" stroke="#f76f9a" strokeWidth="1.5" />
        <circle cx={size / 2} cy={size / 2} r={Math.max(innerR, 2)} fill="#0d1117" stroke="#f76f9a" strokeWidth="1" strokeDasharray="4,2" />
        <circle cx={size / 2} cy={size / 2} r="3" fill="#f7c06f" />
      </svg>
    );
  }
  return null;
}

function InputField({ label, value, onChange, placeholder = "0" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#6b7280", letterSpacing: 1.5, textTransform: "uppercase" }}>
        {label}
      </label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "10px 14px",
          color: "#e2e8f0",
          fontFamily: "'Space Mono', monospace",
          fontSize: 15,
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "rgba(0,255,180,0.5)")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
      />
    </div>
  );
}

function ResultRow({ label, value, unit, accent = "#00ffb4", delay = 0 }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      animation: `fadeUp 0.35s ease both`,
      animationDelay: `${delay}s`,
    }}>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#6b7280" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: accent, fontWeight: 700, textShadow: `0 0 12px ${accent}44` }}>
          {value}
        </span>
        {unit && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#374151" }}>{unit}</span>}
      </div>
    </div>
  );
}

export default function InertiaCalculator() {
  const [shape, setShape] = useState("rectangle");
  const [vals, setVals] = useState({ b: "", h: "", r: "", R: "", r2: "" });
  const [results, setResults] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [error, setError] = useState("");

  const set = (key) => (val) => setVals((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    setError("");
    let res = null;
    try {
      if (shape === "rectangle") {
        const b = parseFloat(vals.b), h = parseFloat(vals.h);
        if (b > 0 && h > 0) res = computeRect(b, h);
      } else if (shape === "circle") {
        const r = parseFloat(vals.r);
        if (r > 0) res = computeCircle(r);
      } else if (shape === "triangle") {
        const b = parseFloat(vals.b), h = parseFloat(vals.h);
        if (b > 0 && h > 0) res = computeTriangle(b, h);
      } else if (shape === "hollow_circle") {
        const R = parseFloat(vals.R), r = parseFloat(vals.r2);
        if (R > 0 && r >= 0) {
          if (r >= R) { setError("El radio interior debe ser menor al exterior."); return; }
          res = computeHollowCircle(R, r);
        }
      }
    } catch (_) {}
    setResults(res);
    setAnimKey((k) => k + 1);
  }, [vals, shape]);

  const accentMap = {
    rectangle: "#00ffb4",
    circle: "#7c6ff7",
    triangle: "#f7c06f",
    hollow_circle: "#f76f9a",
  };
  const accent = accentMap[shape];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
        select option { background: #111827; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#0d1117",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "32px 16px 48px",
        fontFamily: "'Syne', sans-serif",
      }}>
        {/* subtle dot grid */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        <div style={{ width: "100%", maxWidth: 680, position: "relative" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: `${accent}11`, border: `1px solid ${accent}33`,
              borderRadius: 999, padding: "4px 14px", marginBottom: 14,
              transition: "all 0.3s",
            }}>
              <span style={{ color: accent, fontSize: 11, letterSpacing: 2, fontFamily: "'Space Mono', monospace" }}>
                HERRAMIENTA 2 / 5
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(22px, 5vw, 34px)", fontWeight: 800, color: "#f0f4f8", margin: "0 0 6px", letterSpacing: -0.5 }}>
              Centroides &{" "}
              <span style={{ color: accent, transition: "color 0.3s" }}>Momentos de Inercia</span>
            </h1>
            <p style={{ color: "#374151", fontSize: 13, margin: 0, fontFamily: "'Space Mono', monospace" }}>
              Propiedades geométricas de sección transversal
            </p>
          </div>

          {/* Main card */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            overflow: "hidden",
          }}>

            {/* Shape selector */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <label style={{ display: "block", fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#4b5563", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
                Tipo de perfil
              </label>
              <select
                value={shape}
                onChange={(e) => { setShape(e.target.value); setVals({ b: "", h: "", r: "", R: "", r2: "" }); }}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${accent}55`,
                  borderRadius: 10,
                  padding: "11px 14px",
                  color: "#e2e8f0",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 14,
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236b7280' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                  paddingRight: 38,
                }}
              >
                {SHAPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Inputs + preview */}
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0,
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              {/* Inputs */}
              <div style={{ flex: "1 1 220px", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                {(shape === "rectangle" || shape === "triangle") && (
                  <>
                    <InputField label="Base (b)" value={vals.b} onChange={set("b")} placeholder="ej. 100" />
                    <InputField label="Altura (h)" value={vals.h} onChange={set("h")} placeholder="ej. 200" />
                  </>
                )}
                {shape === "circle" && (
                  <InputField label="Radio (r)" value={vals.r} onChange={set("r")} placeholder="ej. 50" />
                )}
                {shape === "hollow_circle" && (
                  <>
                    <InputField label="Radio exterior (R)" value={vals.R} onChange={set("R")} placeholder="ej. 80" />
                    <InputField label="Radio interior (r)" value={vals.r2} onChange={set("r2")} placeholder="ej. 60" />
                  </>
                )}
                {error && (
                  <div style={{
                    background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
                    borderRadius: 8, padding: "8px 12px",
                    fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#f87171",
                  }}>
                    {error}
                  </div>
                )}
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#1f2937", margin: 0 }}>
                  * unidades consistentes (mm, cm, m…)
                </p>
              </div>

              {/* Preview */}
              <div style={{
                flex: "0 0 140px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                borderLeft: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ opacity: results ? 1 : 0.35, transition: "opacity 0.3s" }}>
                  <ShapePreview shape={shape} vals={vals} />
                </div>
              </div>
            </div>

            {/* Results */}
            <div key={animKey} style={{ padding: "20px 24px" }}>
              {results ? (
                <>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#374151", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                    Resultados
                  </div>
                  <ResultRow label="Área (A)" value={scientific(results.A)} unit="u²" accent={accent} delay={0} />
                  <ResultRow label="Centroide x̄" value={scientific(results.cx)} unit="u" accent="#94a3b8" delay={0.06} />
                  <ResultRow label="Centroide ȳ" value={scientific(results.cy)} unit="u" accent="#94a3b8" delay={0.10} />
                  <ResultRow label="Ix (cdg)" value={scientific(results.Ix)} unit="u⁴" accent={accent} delay={0.14} />
                  <ResultRow label="Iy (cdg)" value={scientific(results.Iy)} unit="u⁴" accent={accent} delay={0.18} />
                  <ResultRow label="Iz = Ix + Iy" value={scientific(results.Iz)} unit="u⁴" accent="#f7c06f" delay={0.22} />

                  {/* Radios de giro */}
                  <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#374151", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                      Radios de giro
                    </div>
                    <ResultRow label="kx = √(Ix/A)" value={scientific(Math.sqrt(results.Ix / results.A))} unit="u" accent="#f76f9a" delay={0.26} />
                    <ResultRow label="ky = √(Iy/A)" value={scientific(Math.sqrt(results.Iy / results.A))} unit="u" accent="#f76f9a" delay={0.30} />
                  </div>
                </>
              ) : (
                <div style={{
                  textAlign: "center", padding: "28px 0",
                  fontFamily: "'Space Mono', monospace", fontSize: 12, color: "#1f2937",
                }}>
                  ↑ ingresa las dimensiones para ver los resultados en tiempo real
                </div>
              )}
            </div>
          </div>

          {/* Formula reference */}
          <div style={{
            marginTop: 16,
            background: "rgba(255,255,255,0.015)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 14,
            padding: "14px 20px",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 24px",
          }}>
            {shape === "rectangle" && ["I_x = bh³/12", "I_y = hb³/12", "ȳ = h/2"].map(f => (
              <span key={f} style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#374151" }}>{f}</span>
            ))}
            {shape === "circle" && ["I = πr⁴/4", "Iz = πr⁴/2", "ȳ = r"].map(f => (
              <span key={f} style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#374151" }}>{f}</span>
            ))}
            {shape === "triangle" && ["I_x = bh³/36", "I_y = hb³/36", "ȳ = h/3"].map(f => (
              <span key={f} style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#374151" }}>{f}</span>
            ))}
            {shape === "hollow_circle" && ["I = π(R⁴-r⁴)/4", "A = π(R²-r²)", "ȳ = R"].map(f => (
              <span key={f} style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#374151" }}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
