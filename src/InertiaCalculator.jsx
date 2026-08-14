import { useState, useEffect } from "react";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, BORDER_SOFT, SHADOW, SHADOW_SM, ACCENTS } from "./theme";
import { ProcedurePanel } from "./ProcedurePanel";

const SHAPES = [
  { value: "rectangle",     label: "Rectángulo",              short: "Rectángulo" },
  { value: "circle",        label: "Círculo",                 short: "Círculo" },
  { value: "triangle",      label: "Triángulo (base/altura)", short: "Triángulo" },
  { value: "hollow_circle", label: "Círculo Hueco (tubo)",    short: "Tubo" },
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
function ShapePreview({ shape, vals, accent, size = 200 }) {
  const pad = size * 0.13;
  const inner = size - pad * 2;
  const stroke = INK;

  if (shape === "rectangle") {
    // Sin datos se dibuja una proporción de muestra: un rectángulo de 0×0
    // no se vería, y esta figura también hace de icono en el selector.
    const hasVals = parseFloat(vals.b) > 0 && parseFloat(vals.h) > 0;
    const b = hasVals ? parseFloat(vals.b) : 1.5;
    const h = hasVals ? parseFloat(vals.h) : 1;
    const max = Math.max(b, h, 1e-9);
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
    const hasVals = parseFloat(vals.b) > 0 && parseFloat(vals.h) > 0;
    const b = hasVals ? parseFloat(vals.b) : 1.4;
    const h = hasVals ? parseFloat(vals.h) : 1;
    const max = Math.max(b, h, 1e-9);
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
          background: PAPER, border: BORDER, borderRadius: 0, padding: "13px 15px",
          color: INK, fontFamily: MONO, fontSize: 17, outline: "none", width: "100%", boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.boxShadow = `3px 3px 0 ${accent}`)}
        onBlur={(e) => (e.target.style.boxShadow = "none")}
      />
    </div>
  );
}

function ResultRow({ label, value, unit, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${FAINT}` }}>
      <span style={{ fontFamily: MONO, fontSize: 13, color: MUTE }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontFamily: MONO, fontSize: 19, color: accent, fontWeight: 700 }}>{value}</span>
        {unit && <span style={{ fontFamily: MONO, fontSize: 11, color: FAINT }}>{unit}</span>}
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
          // Sin limpiar, el resultado del último perfil válido se quedaba en
          // pantalla junto al error: el usuario ve un número que ya no
          // corresponde a lo que tiene escrito.
          if (r >= R) { setError("El radio interior debe ser menor al exterior."); setResults(null); return; }
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
    <div>
      <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW }}>
        {/* Selector de perfil: fichas con la figura dibujada, no una lista
            desplegable — se elige con la vista, que es como se piensa un perfil. */}
        <div style={{ padding: "18px 22px", borderBottom: BORDER }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
            Tipo de perfil
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 120px), 1fr))", gap: 10 }}>
            {SHAPES.map((s) => {
              const active = shape === s.value;
              const sAccent = accentMap[s.value];
              return (
                <button
                  key={s.value}
                  onClick={() => { setShape(s.value); setVals({ b: "", h: "", r: "", R: "", r2: "" }); }}
                  aria-pressed={active}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    padding: "12px 8px", cursor: "pointer", borderRadius: 0,
                    border: BORDER, background: active ? sAccent : PAPER,
                    boxShadow: active ? SHADOW_SM : "none",
                    color: active ? "#fff" : INK,
                  }}
                >
                  <ShapePreview shape={s.value} vals={{}} accent={active ? "#ffffff" : sAccent} size={52} />
                  <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textAlign: "center", lineHeight: 1.3 }}>
                    {s.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs + preview */}
        <div style={{ display: "flex", flexWrap: "wrap", borderBottom: BORDER }}>
          <div style={{ flex: "1 1 240px", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
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

          <div className="inertia-preview" style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "20px", borderLeft: BORDER }}>
            <div style={{ opacity: results ? 1 : 0.4 }}>
              <ShapePreview shape={shape} vals={vals} accent={accent} />
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: FAINT, letterSpacing: 1, textTransform: "uppercase" }}>
              ● centroide · - - ejes
            </span>
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
            <div style={{ textAlign: "center", padding: "30px 0", fontFamily: MONO, fontSize: 13, color: MUTE }}>
              ingresa las dimensiones para ver los resultados en tiempo real
            </div>
          )}
        </div>
      </div>

      {results && <ProcedurePanel accent={accent} steps={buildInertiaSteps(shape, vals, results)} />}

      {/* Referencia: acompaña, no compite — línea suave y sin sombra. */}
      <div style={{ marginTop: 16, border: BORDER_SOFT, padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: "6px 24px" }}>
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
    </div>
  );
}
