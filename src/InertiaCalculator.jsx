import { useState, useEffect } from "react";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, SHADOW, SHADOW_SM, ACCENTS } from "./theme";
import { ProcedurePanel } from "./ProcedurePanel";

const SHAPES = [
  { value: "rectangle", label: "Rectángulo" },
  { value: "circle", label: "Círculo" },
  { value: "triangle", label: "Triángulo (base/altura)" },
  { value: "hollow_circle", label: "Círculo Hueco (tubo)" },
];

function fmt(n, dec = 4) {
  if (!isFinite(n)) return "—";
  return parseFloat(n.toFixed(dec)).toString();
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

function buildInertiaSteps(shape, vals, r) {
  const n = (v) => parseFloat(v);
  const k = `kx = √(Ix/A) = ${scientific(Math.sqrt(r.Ix / r.A))}`;
  const ky = `ky = √(Iy/A) = ${scientific(Math.sqrt(r.Iy / r.A))}`;
  if (shape === "rectangle") {
    const b = n(vals.b), h = n(vals.h);
    return [
      { title: "Área", lines: [`A = b·h = ${b}·${h} = ${scientific(r.A)}`] },
      { title: "Centroide", lines: [`x̄ = b/2 = ${scientific(r.cx)}`, `ȳ = h/2 = ${scientific(r.cy)}`] },
      { title: "Momentos de inercia (centroidales)", lines: [
        `Ix = b·h³/12 = ${b}·${h}³/12 = ${scientific(r.Ix)}`,
        `Iy = h·b³/12 = ${h}·${b}³/12 = ${scientific(r.Iy)}`,
        `Iz = Ix + Iy = ${scientific(r.Iz)}`,
      ]},
      { title: "Radios de giro", lines: [k, ky] },
    ];
  }
  if (shape === "circle") {
    const rad = n(vals.r);
    return [
      { title: "Área", lines: [`A = π·r² = π·${rad}² = ${scientific(r.A)}`] },
      { title: "Centroide", lines: [`x̄ = ȳ = r = ${scientific(r.cx)}`] },
      { title: "Momentos de inercia", lines: [
        `Ix = Iy = π·r⁴/4 = π·${rad}⁴/4 = ${scientific(r.Ix)}`,
        `Iz = π·r⁴/2 = ${scientific(r.Iz)}`,
      ]},
      { title: "Radios de giro", lines: [`kx = ky = √(I/A) = ${scientific(Math.sqrt(r.Ix / r.A))}`] },
    ];
  }
  if (shape === "triangle") {
    const b = n(vals.b), h = n(vals.h);
    return [
      { title: "Área", lines: [`A = b·h/2 = ${b}·${h}/2 = ${scientific(r.A)}`] },
      { title: "Centroide", lines: [`x̄ = b/2 = ${scientific(r.cx)}`, `ȳ = h/3 = ${scientific(r.cy)}`] },
      { title: "Momentos de inercia (centroidales)", lines: [
        `Ix = b·h³/36 = ${b}·${h}³/36 = ${scientific(r.Ix)}`,
        `Iy = h·b³/36 = ${h}·${b}³/36 = ${scientific(r.Iy)}`,
        `Iz = Ix + Iy = ${scientific(r.Iz)}`,
      ]},
      { title: "Radios de giro", lines: [k, ky] },
    ];
  }
  // hollow_circle
  const R = n(vals.R), ri = n(vals.r2);
  return [
    { title: "Área", lines: [`A = π·(R² − r²) = π·(${R}² − ${ri}²) = ${scientific(r.A)}`] },
    { title: "Centroide", lines: [`x̄ = ȳ = R = ${scientific(r.cx)}`] },
    { title: "Momentos de inercia", lines: [
      `Ix = Iy = π·(R⁴ − r⁴)/4 = π·(${R}⁴ − ${ri}⁴)/4 = ${scientific(r.Ix)}`,
      `Iz = 2·I = ${scientific(r.Iz)}`,
    ]},
    { title: "Radios de giro", lines: [`kx = ky = √(I/A) = ${scientific(Math.sqrt(r.Ix / r.A))}`] },
  ];
}

// SVG: relleno plano con el accent, trazo de tinta. Sin glow ni filtros.
function ShapePreview({ shape, vals, accent }) {
  const size = 140;
  const pad = 18;
  const inner = size - pad * 2;
  const stroke = INK;

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
        <rect x={x} y={y} width={rw} height={rh} fill={accent} stroke={stroke} strokeWidth="2" />
        <circle cx={x + rw / 2} cy={y + rh / 2} r="3" fill={stroke} />
        <line x1={x + rw / 2} y1={y - 4} x2={x + rw / 2} y2={y + rh + 4} stroke={stroke} strokeWidth="1" strokeDasharray="3,2" />
        <line x1={x - 4} y1={y + rh / 2} x2={x + rw + 4} y2={y + rh / 2} stroke={stroke} strokeWidth="1" strokeDasharray="3,2" />
      </svg>
    );
  }
  if (shape === "circle") {
    const r = parseFloat(vals.r) || 0;
    const cr = r > 0 ? inner / 2 : inner / 3;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={cr} fill={accent} stroke={stroke} strokeWidth="2" />
        <circle cx={size / 2} cy={size / 2} r="3" fill={stroke} />
        <line x1={size / 2} y1={size / 2 - cr - 4} x2={size / 2} y2={size / 2 + cr + 4} stroke={stroke} strokeWidth="1" strokeDasharray="3,2" />
        <line x1={size / 2 - cr - 4} y1={size / 2} x2={size / 2 + cr + 4} y2={size / 2} stroke={stroke} strokeWidth="1" strokeDasharray="3,2" />
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
        <polygon points={pts} fill={accent} stroke={stroke} strokeWidth="2" />
        <circle cx={cxPx} cy={cyPx} r="3" fill={stroke} />
        <line x1={cxPx} y1={oy - 4} x2={cxPx} y2={oy + th + 4} stroke={stroke} strokeWidth="1" strokeDasharray="3,2" />
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
        <circle cx={size / 2} cy={size / 2} r={outerR} fill={accent} stroke={stroke} strokeWidth="2" />
        <circle cx={size / 2} cy={size / 2} r={Math.max(innerR, 2)} fill={PANEL} stroke={stroke} strokeWidth="2" strokeDasharray="4,2" />
        <circle cx={size / 2} cy={size / 2} r="3" fill={stroke} />
      </svg>
    );
  }
  return null;
}

function InputField({ label, value, onChange, placeholder = "0", accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: MONO, fontSize: 11, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase" }}>
        {label}
      </label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 14px",
          color: INK, fontFamily: MONO, fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.boxShadow = `3px 3px 0 ${accent}`)}
        onBlur={(e) => (e.target.style.boxShadow = "none")}
      />
    </div>
  );
}

function ResultRow({ label, value, unit, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${FAINT}` }}>
      <span style={{ fontFamily: MONO, fontSize: 12, color: MUTE }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: MONO, fontSize: 15, color: accent, fontWeight: 700 }}>{value}</span>
        {unit && <span style={{ fontFamily: MONO, fontSize: 10, color: FAINT }}>{unit}</span>}
      </div>
    </div>
  );
}

export default function InertiaCalculator({ onAccentChange }) {
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
    rectangle: ACCENTS.orange,
    circle: ACCENTS.blue,
    triangle: ACCENTS.yellow,
    hollow_circle: ACCENTS.pink,
  };
  const accent = accentMap[shape];

  useEffect(() => { onAccentChange?.(accent); }, [accent]);

  return (
    <section style={{ maxWidth: 680, margin: "0 auto", padding: "32px 0 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ display: "inline-block", background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", marginBottom: 12 }}>
          03 / 05 — INERCIA
        </span>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: INK, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Centroides & momentos de inercia
        </h2>
        <p style={{ fontFamily: MONO, fontSize: 13, color: MUTE, margin: 0 }}>
          Propiedades geométricas de sección transversal
        </p>
      </div>

      <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW }}>
        {/* Shape selector */}
        <div style={{ padding: "20px 24px", borderBottom: BORDER }}>
          <label style={{ display: "block", fontFamily: MONO, fontSize: 11, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
            Tipo de perfil
          </label>
          <select
            value={shape}
            onChange={(e) => { setShape(e.target.value); setVals({ b: "", h: "", r: "", R: "", r2: "" }); }}
            style={{
              width: "100%", background: PAPER, border: BORDER, borderRadius: 0,
              padding: "11px 14px", color: INK, fontFamily: MONO, fontSize: 14,
              outline: "none", cursor: "pointer", appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23161616' d='M6 8L0 0h12z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 38,
            }}
          >
            {SHAPES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Inputs + preview */}
        <div style={{ display: "flex", flexWrap: "wrap", borderBottom: BORDER }}>
          <div style={{ flex: "1 1 220px", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {(shape === "rectangle" || shape === "triangle") && (
              <>
                <InputField label="Base (b)" value={vals.b} onChange={set("b")} placeholder="ej. 100" accent={accent} />
                <InputField label="Altura (h)" value={vals.h} onChange={set("h")} placeholder="ej. 200" accent={accent} />
              </>
            )}
            {shape === "circle" && (
              <InputField label="Radio (r)" value={vals.r} onChange={set("r")} placeholder="ej. 50" accent={accent} />
            )}
            {shape === "hollow_circle" && (
              <>
                <InputField label="Radio exterior (R)" value={vals.R} onChange={set("R")} placeholder="ej. 80" accent={accent} />
                <InputField label="Radio interior (r)" value={vals.r2} onChange={set("r2")} placeholder="ej. 60" accent={accent} />
              </>
            )}
            {error && (
              <div style={{ background: ACCENTS.pink, border: BORDER_THIN, padding: "8px 12px", fontFamily: MONO, fontSize: 11, color: "#fff" }}>
                {error}
              </div>
            )}
            <p style={{ fontFamily: MONO, fontSize: 10, color: FAINT, margin: 0 }}>
              * unidades consistentes (mm, cm, m…)
            </p>
          </div>

          <div style={{ flex: "0 0 140px", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", borderLeft: BORDER }}>
            <div style={{ opacity: results ? 1 : 0.35 }}>
              <ShapePreview shape={shape} vals={vals} accent={accent} />
            </div>
          </div>
        </div>

        {/* Results */}
        <div key={animKey} style={{ padding: "20px 24px" }}>
          {results ? (
            <>
              <div style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                Resultados
              </div>
              <ResultRow label="Área (A)" value={scientific(results.A)} unit="u²" accent={accent} />
              <ResultRow label="Centroide x̄" value={scientific(results.cx)} unit="u" accent={INK} />
              <ResultRow label="Centroide ȳ" value={scientific(results.cy)} unit="u" accent={INK} />
              <ResultRow label="Ix (cdg)" value={scientific(results.Ix)} unit="u⁴" accent={accent} />
              <ResultRow label="Iy (cdg)" value={scientific(results.Iy)} unit="u⁴" accent={accent} />
              <ResultRow label="Iz = Ix + Iy" value={scientific(results.Iz)} unit="u⁴" accent={ACCENTS.yellow} />

              <div style={{ marginTop: 16, paddingTop: 12, borderTop: BORDER_THIN }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                  Radios de giro
                </div>
                <ResultRow label="kx = √(Ix/A)" value={scientific(Math.sqrt(results.Ix / results.A))} unit="u" accent={ACCENTS.pink} />
                <ResultRow label="ky = √(Iy/A)" value={scientific(Math.sqrt(results.Iy / results.A))} unit="u" accent={ACCENTS.pink} />
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "24px 0", fontFamily: MONO, fontSize: 12, color: MUTE }}>
              ingresa las dimensiones para ver los resultados en tiempo real
            </div>
          )}
        </div>
      </div>

      {results && <ProcedurePanel accent={accent} steps={buildInertiaSteps(shape, vals, results)} />}

      {/* Formula reference */}
      <div style={{ marginTop: 16, background: PANEL, border: BORDER, boxShadow: SHADOW_SM, padding: "14px 20px", display: "flex", flexWrap: "wrap", gap: "6px 24px" }}>
        {shape === "rectangle" && ["I_x = bh³/12", "I_y = hb³/12", "ȳ = h/2"].map(f => (
          <span key={f} style={{ fontFamily: MONO, fontSize: 11, color: MUTE }}>{f}</span>
        ))}
        {shape === "circle" && ["I = πr⁴/4", "Iz = πr⁴/2", "ȳ = r"].map(f => (
          <span key={f} style={{ fontFamily: MONO, fontSize: 11, color: MUTE }}>{f}</span>
        ))}
        {shape === "triangle" && ["I_x = bh³/36", "I_y = hb³/36", "ȳ = h/3"].map(f => (
          <span key={f} style={{ fontFamily: MONO, fontSize: 11, color: MUTE }}>{f}</span>
        ))}
        {shape === "hollow_circle" && ["I = π(R⁴-r⁴)/4", "A = π(R²-r²)", "ȳ = R"].map(f => (
          <span key={f} style={{ fontFamily: MONO, fontSize: 11, color: MUTE }}>{f}</span>
        ))}
      </div>
    </section>
  );
}
