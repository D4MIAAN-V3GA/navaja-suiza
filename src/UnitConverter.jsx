import { useState, useEffect } from "react";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, BORDER_SOFT, SHADOW, SHADOW_SM, ACCENTS } from "./theme";
import { ProcedurePanel } from "./ProcedurePanel";

// ── Conversion data ────────────────────────────────────────────────
// `contexts`: rangos de referencia curados y aproximados (educativos, no de
// fabricante) usados por el medidor de "sentido físico" — ver SenseGauge más abajo.
const CATEGORIES = {
  pressure: {
    label: "Presión",
    accent: ACCENTS.cyan,
    scale: "log",
    units: {
      psi:  { label: "psi",  name: "Libras/pulg²",    toBase: v => v * 6894.757,    fromBase: v => v / 6894.757 },
      MPa:  { label: "MPa",  name: "Megapascal",       toBase: v => v * 1e6,         fromBase: v => v / 1e6 },
      bar:  { label: "bar",  name: "Bar",              toBase: v => v * 1e5,         fromBase: v => v / 1e5 },
      atm:  { label: "atm",  name: "Atmósfera",        toBase: v => v * 101325,      fromBase: v => v / 101325 },
      kPa:  { label: "kPa",  name: "Kilopascal",       toBase: v => v * 1e3,         fromBase: v => v / 1e3 },
      Pa:   { label: "Pa",   name: "Pascal",           toBase: v => v,               fromBase: v => v },
    },
    contexts: [
      { label: "Llanta de bici",                unit: "psi", min: 65,   max: 95 },
      { label: "Llanta de auto",                unit: "psi", min: 28,   max: 35 },
      { label: "Llanta de camión",              unit: "psi", min: 100,  max: 120 },
      { label: "Línea doméstica de agua",       unit: "psi", min: 40,   max: 80 },
      { label: "Sistema hidráulico industrial", unit: "psi", min: 1500, max: 3000 },
      { label: "Prensa hidráulica pesada",      unit: "psi", min: 5000, max: 10000 },
      { label: "Atmósfera (nivel del mar)",     unit: "psi", min: 14.7, max: 14.7 },
    ],
  },
  torque: {
    label: "Torque",
    accent: ACCENTS.blue,
    scale: "log",
    units: {
      "N·m":    { label: "N·m",    name: "Newton·metro",      toBase: v => v,           fromBase: v => v },
      "kN·m":   { label: "kN·m",   name: "Kilonewton·metro",  toBase: v => v * 1e3,     fromBase: v => v / 1e3 },
      "lbf·ft": { label: "lbf·ft", name: "Libra-fuerza·pie",  toBase: v => v * 1.35582, fromBase: v => v / 1.35582 },
      "lbf·in": { label: "lbf·in", name: "Libra-fuerza·pulg", toBase: v => v * 0.112985,fromBase: v => v / 0.112985 },
      "kgf·m":  { label: "kgf·m",  name: "Kilogramo-fuerza·m",toBase: v => v * 9.80665, fromBase: v => v / 9.80665 },
      "dN·m":   { label: "dN·m",   name: "Decanewton·metro",  toBase: v => v * 10,      fromBase: v => v / 10 },
    },
    contexts: [
      { label: "Tornillo de electrónica",    unit: "N·m", min: 0.1, max: 0.3 },
      { label: "Bujía de motor",             unit: "N·m", min: 20,  max: 30 },
      { label: "Culata/tapa de motor",       unit: "N·m", min: 80,  max: 100 },
      { label: "Tuerca de rueda de auto",    unit: "N·m", min: 100, max: 140 },
      { label: "Tuerca de rueda de camión",  unit: "N·m", min: 450, max: 700 },
      { label: "Perno estructural grande",   unit: "N·m", min: 500, max: 1000 },
    ],
  },
  force: {
    label: "Fuerza",
    accent: ACCENTS.orange,
    scale: "log",
    units: {
      N:    { label: "N",    name: "Newton",          toBase: v => v,           fromBase: v => v },
      kN:   { label: "kN",   name: "Kilonewton",      toBase: v => v * 1e3,     fromBase: v => v / 1e3 },
      MN:   { label: "MN",   name: "Meganewton",      toBase: v => v * 1e6,     fromBase: v => v / 1e6 },
      lbf:  { label: "lbf",  name: "Libra-fuerza",    toBase: v => v * 4.44822, fromBase: v => v / 4.44822 },
      kgf:  { label: "kgf",  name: "Kilogramo-fuerza",toBase: v => v * 9.80665, fromBase: v => v / 9.80665 },
      tf:   { label: "tf",   name: "Tonelada-fuerza", toBase: v => v * 9806.65, fromBase: v => v / 9806.65 },
    },
    contexts: [
      { label: "Levantar 1 kg",                     unit: "N", min: 9.8,   max: 9.8 },
      { label: "Mordida humana promedio",           unit: "N", min: 500,   max: 700 },
      { label: "Peso de una persona de 70 kg",      unit: "N", min: 686,   max: 686 },
      { label: "Auto compacto acelerando",          unit: "N", min: 3000,  max: 5000 },
      { label: "Empuje de motor de avión pequeño",  unit: "N", min: 20000, max: 50000 },
    ],
  },
  length: {
    label: "Longitud",
    accent: ACCENTS.green,
    scale: "log",
    units: {
      mm: { label: "mm", name: "Milímetro", toBase: v => v / 1000, fromBase: v => v * 1000 },
      cm: { label: "cm", name: "Centímetro", toBase: v => v / 100,  fromBase: v => v * 100 },
      m:  { label: "m",  name: "Metro",      toBase: v => v,        fromBase: v => v },
      km: { label: "km", name: "Kilómetro",  toBase: v => v * 1000, fromBase: v => v / 1000 },
      in: { label: "in", name: "Pulgada",    toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      ft: { label: "ft", name: "Pie",        toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    },
    contexts: [
      { label: "Grosor de hoja de papel",  unit: "mm", min: 0.08, max: 0.12 },
      { label: "Diámetro de un cabello",   unit: "mm", min: 0.07, max: 0.1 },
      { label: "Tornillo M6",              unit: "mm", min: 6,    max: 6 },
      { label: "Altura de una persona",    unit: "m",  min: 1.5,  max: 1.9 },
      { label: "Cancha de fútbol (largo)", unit: "m",  min: 90,   max: 120 },
    ],
  },
  mass: {
    label: "Masa",
    accent: ACCENTS.yellow,
    scale: "log",
    units: {
      g:  { label: "g",  name: "Gramo",     toBase: v => v / 1000, fromBase: v => v * 1000 },
      kg: { label: "kg", name: "Kilogramo", toBase: v => v,        fromBase: v => v },
      t:  { label: "t",  name: "Tonelada",  toBase: v => v * 1000, fromBase: v => v / 1000 },
      lb: { label: "lb", name: "Libra",     toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
    },
    contexts: [
      { label: "Una moneda",             unit: "g",  min: 5,     max: 10 },
      { label: "Un celular",             unit: "g",  min: 150,   max: 220 },
      { label: "Una persona adulta",     unit: "kg", min: 55,    max: 90 },
      { label: "Un auto compacto",       unit: "kg", min: 1000,  max: 1300 },
      { label: "Un contenedor de carga", unit: "kg", min: 20000, max: 24000 },
    ],
  },
  temperature: {
    label: "Temperatura",
    accent: ACCENTS.pink,
    scale: "linear",
    units: {
      "°C": { label: "°C", name: "Celsius",    toBase: v => v,               fromBase: v => v },
      "K":  { label: "K",  name: "Kelvin",     toBase: v => v - 273.15,     fromBase: v => v + 273.15 },
      "°F": { label: "°F", name: "Fahrenheit", toBase: v => (v - 32) * 5/9, fromBase: v => v * 9/5 + 32 },
    },
    contexts: [
      { label: "Congelador",                     unit: "°C", min: -20, max: -15 },
      { label: "Refrigerador",                   unit: "°C", min: 2,   max: 6 },
      { label: "Ambiente confortable",           unit: "°C", min: 18,  max: 24 },
      { label: "Fiebre humana",                  unit: "°C", min: 38,  max: 40 },
      { label: "Agua hirviendo (nivel del mar)", unit: "°C", min: 100, max: 100 },
      { label: "Horno doméstico",                unit: "°C", min: 180, max: 220 },
    ],
  },
};

function fmt(n) {
  if (!isFinite(n) || isNaN(n)) return "—";
  if (n === 0) return "0";
  if (Math.abs(n) >= 1e7 || (Math.abs(n) < 0.0001 && n !== 0))
    return n.toExponential(5);
  return parseFloat(n.toPrecision(8)).toString();
}

function AllTable({ catKey, fromUnit, inputVal }) {
  const cat = CATEGORIES[catKey];
  const units = cat.units;
  const num = parseFloat(inputVal);
  if (isNaN(num) || inputVal === "") return null;
  const base = units[fromUnit].toBase(num);

  return (
    <div style={{ marginTop: 2, background: PANEL, border: BORDER }}>
      <div style={{ padding: "10px 18px", borderBottom: BORDER_THIN, fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase" }}>
        Tabla de referencia rápida — {num} {fromUnit}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {Object.entries(units).map(([key, u], i) => {
          const converted = u.fromBase(base);
          const isFrom = key === fromUnit;
          return (
            <div key={key} style={{
              padding: "10px 18px",
              borderBottom: i < Object.keys(units).length - 2 ? BORDER_THIN : "none",
              borderRight: i % 2 === 0 ? BORDER_THIN : "none",
              background: isFrom ? cat.accent : "transparent",
              display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8,
            }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: isFrom ? "#fff" : MUTE }}>{u.label}</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: isFrom ? "#fff" : INK, fontWeight: isFrom ? 700 : 400 }}>
                {fmt(converted)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Etiqueta + campo. minWidth 0 evita que el <select> desborde la rejilla.
function Cell({ label, children }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, minHeight: 12 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// ── "¿Tiene sentido tu número?" — medidor de sentido físico ─────────
// Clasifica un valor contra un rango de referencia curado (min/max en la
// misma unidad). "typical" = dentro del rango; "atypical" = zona extendida
// (posible pero raro); "impossible" = muy fuera, probablemente un error.
function classifyAgainstContext(value, min, max, scale) {
  const margin = scale === "linear" ? Math.max(max - min, 4) : null;
  const yLow = scale === "linear" ? min - margin : min / 3;
  const yHigh = scale === "linear" ? max + margin : max * 3;
  if (value >= min && value <= max) return "typical";
  if (value >= yLow && value <= yHigh) return "atypical";
  return "impossible";
}

const SENSE_VERDICTS = {
  typical:    { label: "Dentro de lo típico",     hint: "Tu número cuadra con este contexto",                    color: ACCENTS.green },
  atypical:   { label: "Atípico",                 hint: "Fuera de lo común — revisa tu conversión o el contexto", color: ACCENTS.yellow },
  impossible: { label: "Prácticamente imposible", hint: "Muy fuera de rango — casi seguro hay un error",          color: ACCENTS.red },
};

function SenseGauge({ min, max, value, unitLabel, scale }) {
  const W = 520, H = 92, pad = 14, trackY = 34, trackH = 18;

  let domainMin, domainMax, yLow, yHigh;
  if (scale === "linear") {
    const margin = Math.max(max - min, 4);
    yLow = min - margin; yHigh = max + margin;
    domainMin = min - margin * 3; domainMax = max + margin * 3;
  } else {
    yLow = min / 3; yHigh = max * 3;
    domainMin = min / 10; domainMax = max * 10;
  }

  const toT = (v) => scale === "linear"
    ? (v - domainMin) / (domainMax - domainMin)
    : (Math.log10(v) - Math.log10(domainMin)) / (Math.log10(domainMax) - Math.log10(domainMin));
  const px = (v) => pad + Math.min(Math.max(toT(v), 0), 1) * (W - pad * 2);

  const clampedValue = Math.min(Math.max(value, domainMin), domainMax);
  const offScaleLow = value < domainMin;
  const offScaleHigh = value > domainMax;

  const verdictKey = classifyAgainstContext(value, min, max, scale);
  const verdict = SENSE_VERDICTS[verdictKey];

  const xMin = px(min), xMax = px(max);
  const xYLow = px(Math.max(yLow, domainMin)), xYHigh = px(Math.min(yHigh, domainMax));
  const xVal = px(clampedValue);
  const xRight = W - pad;

  return (
    <div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", border: BORDER_THIN, background: PANEL }}>
        <rect x={xMin - 0} y={trackY} width={Math.max(xMax - xMin, 3)} height={trackH} fill={ACCENTS.green} opacity="0.35" />
        <rect x={xYLow} y={trackY} width={Math.max(xMin - xYLow, 0)} height={trackH} fill={ACCENTS.yellow} opacity="0.28" />
        <rect x={xMax} y={trackY} width={Math.max(xYHigh - xMax, 0)} height={trackH} fill={ACCENTS.yellow} opacity="0.28" />
        <rect x={pad} y={trackY} width={Math.max(xYLow - pad, 0)} height={trackH} fill={ACCENTS.red} opacity="0.18" />
        <rect x={xYHigh} y={trackY} width={Math.max(xRight - xYHigh, 0)} height={trackH} fill={ACCENTS.red} opacity="0.18" />
        <rect x={pad} y={trackY} width={W - pad * 2} height={trackH} fill="none" stroke={INK} strokeWidth="1.5" />

        <text x={xMin} y={trackY - 6} textAnchor="middle" fill={MUTE} fontSize="9" fontFamily="monospace">{fmt(min)}</text>
        {max !== min && (
          <text x={xMax} y={trackY - 6} textAnchor="middle" fill={MUTE} fontSize="9" fontFamily="monospace">{fmt(max)}</text>
        )}

        <line x1={xVal} y1={trackY - 6} x2={xVal} y2={trackY + trackH + 6} stroke={INK} strokeWidth="2" />
        <rect x={xVal - 5} y={trackY + trackH + 1} width="10" height="10" fill={verdict.color} stroke={INK} strokeWidth="1.5" />

        {offScaleLow && <text x={pad + 2} y={H - 6} fill={INK} fontSize="9" fontFamily="monospace">◂ fuera de escala</text>}
        {offScaleHigh && <text x={xRight - 2} y={H - 6} textAnchor="end" fill={INK} fontSize="9" fontFamily="monospace">fuera de escala ▸</text>}
      </svg>

      <div style={{ marginTop: 10, background: verdict.color, border: BORDER, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: "#fff" }}>{verdict.label}</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>{verdict.hint}</div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "#fff" }}>
          {fmt(value)} {unitLabel}
        </div>
      </div>

      <p style={{ fontFamily: MONO, fontSize: 10, color: FAINT, lineHeight: 1.5, margin: "8px 0 0" }}>
        Valores de referencia aproximados y educativos — no sustituyen la especificación de tu fabricante.
      </p>
    </div>
  );
}

export default function UnitConverter({ onAccentChange }) {
  const [catKey, setCatKey] = useState("pressure");
  const [inputVal, setInputVal] = useState("");
  const [fromUnit, setFromUnit] = useState("psi");
  const [toUnit, setToUnit] = useState("MPa");
  const [result, setResult] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [contextIdx, setContextIdx] = useState(null);

  const cat = CATEGORIES[catKey];
  const accent = cat.accent;
  const units = cat.units;
  const unitKeys = Object.keys(units);

  useEffect(() => { onAccentChange?.(accent); }, [accent]);

  // Cambia categoría y unidades en el mismo batch — si se hiciera en un efecto
  // separado, habría un render intermedio con `units` de la categoría nueva
  // pero `fromUnit`/`toUnit`/`result` todavía de la vieja, y crashearía.
  const selectCategory = (key) => {
    const keys = Object.keys(CATEGORIES[key].units);
    setCatKey(key);
    setFromUnit(keys[0]);
    setToUnit(keys[1]);
    setResult(null);
    setInputVal("");
    setContextIdx(null);
  };

  useEffect(() => {
    const num = parseFloat(inputVal);
    if (isNaN(num) || inputVal === "") { setResult(null); return; }
    const base = units[fromUnit].toBase(num);
    const out = units[toUnit].fromBase(base);
    setResult(out);
    setAnimKey(k => k + 1);
  }, [inputVal, fromUnit, toUnit, catKey]);

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const procSteps = (result !== null && inputVal !== "") ? (() => {
    const num = parseFloat(inputVal);
    const baseKey = unitKeys.find((k) => units[k].toBase(1) === 1);
    const baseLabel = baseKey ? units[baseKey].label : "base";
    const factorFrom = units[fromUnit].toBase(1);
    const factorTo = units[toUnit].toBase(1);
    const base = units[fromUnit].toBase(num);
    return [
      { title: "Factores a unidad base (SI)", lines: [
        `1 ${units[fromUnit].label} = ${fmt(factorFrom)} ${baseLabel}`,
        `1 ${units[toUnit].label} = ${fmt(factorTo)} ${baseLabel}`,
      ]},
      { title: "Convertir a la base", lines: [`${num} ${units[fromUnit].label} × ${fmt(factorFrom)} = ${fmt(base)} ${baseLabel}`] },
      { title: "De la base a la unidad destino", lines: [`${fmt(base)} ${baseLabel} ÷ ${fmt(factorTo)} = ${fmt(result)} ${units[toUnit].label}`] },
    ];
  })() : [];

  const SelectStyle = {
    background: PAPER, border: BORDER, borderRadius: 0,
    padding: "14px 36px 14px 14px", color: INK, fontFamily: MONO, fontSize: 14.5,
    outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%23161616' d='M5 6L0 0h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
    width: "100%", boxSizing: "border-box",
  };

  return (
    <div>
      {/* Category tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(CATEGORIES).map(([key, c]) => {
          const active = key === catKey;
          return (
            <button key={key}
              onClick={() => selectCategory(key)}
              style={{
                flex: "1 1 120px", padding: "12px 16px",
                background: active ? c.accent : PANEL,
                border: BORDER, borderRadius: 0,
                color: active ? "#fff" : INK,
                fontFamily: MONO, fontSize: 12, fontWeight: 700,
                cursor: "pointer", letterSpacing: 1,
                boxShadow: active ? SHADOW_SM : "none",
                textTransform: "uppercase",
              }}>
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Selector de contexto real — dispara el medidor de sentido físico */}
      {cat.contexts && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
            ¿Con qué comparamos tu número? (opcional)
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {cat.contexts.map((c, i) => {
              const active = contextIdx === i;
              return (
                <button key={c.label}
                  onClick={() => {
                    if (active) { setContextIdx(null); return; }
                    setContextIdx(i);
                    setFromUnit(c.unit);
                  }}
                  style={{
                    padding: "8px 14px", background: active ? accent : "transparent",
                    border: active ? BORDER : BORDER_SOFT, borderRadius: 0,
                    color: active ? "#fff" : MUTE, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                    cursor: "pointer",
                  }}>
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main card */}
      <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW }}>
        <div style={{ padding: "24px 24px 20px" }}>
          {/* Cada celda lleva su etiqueta dentro para poder apilarse en móvil (.uc-grid). */}
          <div className="uc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px 1fr", gap: "8px 10px", alignItems: "end" }}>
            <Cell label="Valor">
              <input
                type="number"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="0"
                style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "14px 15px", color: INK, fontFamily: MONO, fontSize: 20, fontWeight: 700, outline: "none", width: "100%", boxSizing: "border-box" }}
              />
            </Cell>

            <Cell label="De">
              <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} style={SelectStyle}>
                {unitKeys.map(k => (<option key={k} value={k}>{units[k].label} — {units[k].name}</option>))}
              </select>
            </Cell>

            <Cell label="">
              <button onClick={swap} aria-label="Intercambiar unidades" style={{
                background: INK, border: BORDER, borderRadius: 0, color: PAPER, fontSize: 18,
                cursor: "pointer", height: 50, width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              }}>⇄</button>
            </Cell>

            <Cell label="A">
              <select value={toUnit} onChange={e => setToUnit(e.target.value)} style={SelectStyle}>
                {unitKeys.map(k => (<option key={k} value={k}>{units[k].label} — {units[k].name}</option>))}
              </select>
            </Cell>
          </div>
        </div>

        {/* Result */}
        <div key={animKey} style={{
          margin: "0 24px 24px",
          background: result !== null ? accent : PAPER,
          border: BORDER,
          boxShadow: result !== null ? SHADOW_SM : "none",
          padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: result !== null ? "rgba(255,255,255,0.85)" : MUTE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
              Resultado
            </div>
            <div style={{ fontFamily: MONO, fontSize: "clamp(26px, 7vw, 40px)", fontWeight: 700, color: result !== null ? "#fff" : FAINT, letterSpacing: -1, lineHeight: 1 }}>
              {result !== null ? fmt(result) : "—"}
            </div>
          </div>
          {result !== null && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: MONO, fontSize: 22, color: "#fff", fontWeight: 700 }}>{units[toUnit].label}</div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 4 }}>{units[toUnit].name}</div>
            </div>
          )}
          {result === null && (
            <div style={{ fontFamily: MONO, fontSize: 13, color: MUTE }}>Ingresa un valor para convertir</div>
          )}
        </div>

        {/* Equation line */}
        {result !== null && inputVal !== "" && (
          <div style={{ margin: "-16px 24px 20px", fontFamily: MONO, fontSize: 12, color: INK, textAlign: "center", padding: "10px", background: PAPER, border: BORDER_THIN }}>
            {inputVal} {units[fromUnit].label} = <span style={{ color: accent, fontWeight: 700 }}>{fmt(result)} {units[toUnit].label}</span>
          </div>
        )}

        {/* Medidor de sentido físico — solo si hay contexto elegido y valor válido */}
        {contextIdx !== null && result !== null && inputVal !== "" && (() => {
          const context = cat.contexts[contextIdx];
          const valueInContextUnit = units[context.unit].fromBase(units[fromUnit].toBase(parseFloat(inputVal)));
          return (
            <div style={{ margin: "0 24px 20px" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                Comparado con: {context.label}
              </div>
              <SenseGauge
                min={context.min}
                max={context.max}
                value={valueInContextUnit}
                unitLabel={units[context.unit].label}
                scale={cat.scale}
              />
            </div>
          );
        })()}

        {/* Toggle table */}
        <div style={{ padding: "0 24px 24px" }}>
          <button onClick={() => setShowTable(s => !s)} style={{
            width: "100%", background: PAPER, border: BORDER, borderRadius: 0, padding: "10px",
            color: INK, fontFamily: MONO, fontSize: 11, cursor: "pointer", letterSpacing: 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 700,
          }}>
            <span style={{ display: "inline-block", transform: showTable ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            {showTable ? "OCULTAR" : "VER"} TABLA COMPLETA DE CONVERSIÓN
          </button>
          {showTable && (
            <div style={{ marginTop: 12 }}>
              <AllTable catKey={catKey} fromUnit={fromUnit} inputVal={inputVal} />
            </div>
          )}
        </div>
      </div>

      {result !== null && inputVal !== "" && <ProcedurePanel accent={accent} steps={procSteps} />}

      {/* Referencia de unidades: peso mínimo, es material de consulta. */}
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Object.entries(units).map(([key, u]) => (
          <div key={key} style={{ border: BORDER_SOFT, borderRadius: 0, padding: "5px 11px", fontFamily: MONO, fontSize: 11, color: MUTE }}>
            <span style={{ color: accent, fontWeight: 700 }}>{u.label}</span> {u.name}
          </div>
        ))}
      </div>
    </div>
  );
}
