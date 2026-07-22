import { useState, useEffect } from "react";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, SHADOW, SHADOW_SM, ACCENTS } from "./theme";
import { ProcedurePanel } from "./ProcedurePanel";

// ── Conversion data ────────────────────────────────────────────────
const CATEGORIES = {
  pressure: {
    label: "Presión",
    accent: ACCENTS.cyan,
    units: {
      psi:  { label: "psi",  name: "Libras/pulg²",    toBase: v => v * 6894.757,    fromBase: v => v / 6894.757 },
      MPa:  { label: "MPa",  name: "Megapascal",       toBase: v => v * 1e6,         fromBase: v => v / 1e6 },
      bar:  { label: "bar",  name: "Bar",              toBase: v => v * 1e5,         fromBase: v => v / 1e5 },
      atm:  { label: "atm",  name: "Atmósfera",        toBase: v => v * 101325,      fromBase: v => v / 101325 },
      kPa:  { label: "kPa",  name: "Kilopascal",       toBase: v => v * 1e3,         fromBase: v => v / 1e3 },
      Pa:   { label: "Pa",   name: "Pascal",           toBase: v => v,               fromBase: v => v },
    },
  },
  torque: {
    label: "Torque",
    accent: ACCENTS.blue,
    units: {
      "N·m":    { label: "N·m",    name: "Newton·metro",      toBase: v => v,           fromBase: v => v },
      "kN·m":   { label: "kN·m",   name: "Kilonewton·metro",  toBase: v => v * 1e3,     fromBase: v => v / 1e3 },
      "lbf·ft": { label: "lbf·ft", name: "Libra-fuerza·pie",  toBase: v => v * 1.35582, fromBase: v => v / 1.35582 },
      "lbf·in": { label: "lbf·in", name: "Libra-fuerza·pulg", toBase: v => v * 0.112985,fromBase: v => v / 0.112985 },
      "kgf·m":  { label: "kgf·m",  name: "Kilogramo-fuerza·m",toBase: v => v * 9.80665, fromBase: v => v / 9.80665 },
      "dN·m":   { label: "dN·m",   name: "Decanewton·metro",  toBase: v => v * 10,      fromBase: v => v / 10 },
    },
  },
  force: {
    label: "Fuerza",
    accent: ACCENTS.orange,
    units: {
      N:    { label: "N",    name: "Newton",          toBase: v => v,           fromBase: v => v },
      kN:   { label: "kN",   name: "Kilonewton",      toBase: v => v * 1e3,     fromBase: v => v / 1e3 },
      MN:   { label: "MN",   name: "Meganewton",      toBase: v => v * 1e6,     fromBase: v => v / 1e6 },
      lbf:  { label: "lbf",  name: "Libra-fuerza",    toBase: v => v * 4.44822, fromBase: v => v / 4.44822 },
      kgf:  { label: "kgf",  name: "Kilogramo-fuerza",toBase: v => v * 9.80665, fromBase: v => v / 9.80665 },
      tf:   { label: "tf",   name: "Tonelada-fuerza", toBase: v => v * 9806.65, fromBase: v => v / 9806.65 },
    },
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

export default function UnitConverter({ onAccentChange }) {
  const [catKey, setCatKey] = useState("pressure");
  const [inputVal, setInputVal] = useState("");
  const [fromUnit, setFromUnit] = useState("psi");
  const [toUnit, setToUnit] = useState("MPa");
  const [result, setResult] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [showTable, setShowTable] = useState(false);

  const cat = CATEGORIES[catKey];
  const accent = cat.accent;
  const units = cat.units;
  const unitKeys = Object.keys(units);

  useEffect(() => { onAccentChange?.(accent); }, [accent]);

  useEffect(() => {
    const keys = Object.keys(CATEGORIES[catKey].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1]);
    setResult(null);
    setInputVal("");
  }, [catKey]);

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
    padding: "11px 36px 11px 14px", color: INK, fontFamily: MONO, fontSize: 13,
    outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%23161616' d='M5 6L0 0h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
    width: "100%", boxSizing: "border-box",
  };

  return (
    <section style={{ maxWidth: 600, margin: "0 auto", padding: "32px 0 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ display: "inline-block", background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", marginBottom: 12 }}>
          05 / 05 — UNIDADES
        </span>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: INK, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Convertidor de unidades
        </h2>
        <p style={{ fontFamily: MONO, fontSize: 13, color: MUTE, margin: 0 }}>
          Presión · torque · fuerza — nivel ingeniería
        </p>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.entries(CATEGORIES).map(([key, c]) => {
          const active = key === catKey;
          return (
            <button key={key}
              onClick={() => setCatKey(key)}
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
                style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "11px 14px", color: INK, fontFamily: MONO, fontSize: 18, fontWeight: 700, outline: "none", width: "100%", boxSizing: "border-box" }}
              />
            </Cell>

            <Cell label="De">
              <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} style={SelectStyle}>
                {unitKeys.map(k => (<option key={k} value={k}>{units[k].label} — {units[k].name}</option>))}
              </select>
            </Cell>

            <Cell label="">
              <button onClick={swap} aria-label="Intercambiar unidades" style={{
                background: INK, border: BORDER, borderRadius: 0, color: PAPER, fontSize: 16,
                cursor: "pointer", height: 44, width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
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

      {/* Unit reference chips */}
      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Object.entries(units).map(([key, u]) => (
          <div key={key} style={{ background: PANEL, border: BORDER_THIN, borderRadius: 0, padding: "5px 12px", fontFamily: MONO, fontSize: 10, color: MUTE }}>
            <span style={{ color: accent, fontWeight: 700 }}>{u.label}</span> {u.name}
          </div>
        ))}
      </div>
    </section>
  );
}
