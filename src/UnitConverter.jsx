import { useState, useEffect } from "react";

// ── Conversion data ────────────────────────────────────────────────
const CATEGORIES = {
  pressure: {
    label: "Presión",
    icon: "⊕",
    accent: "#00ffb4",
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
    icon: "↻",
    accent: "#7c6ff7",
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
    icon: "→",
    accent: "#f76f9a",
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

// quick-reference table: convert all units from the entered value
function AllTable({ catKey, fromUnit, inputVal }) {
  const cat = CATEGORIES[catKey];
  const units = cat.units;
  const num = parseFloat(inputVal);
  if (isNaN(num) || inputVal === "") return null;
  const base = units[fromUnit].toBase(num);

  return (
    <div style={{
      marginTop: 2,
      background: "rgba(255,255,255,0.018)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        fontFamily: "'Space Mono', monospace",
        fontSize: 10, color: "#374151", letterSpacing: 2, textTransform: "uppercase",
      }}>
        Tabla de referencia rápida — {num} {fromUnit}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {Object.entries(units).map(([key, u], i) => {
          const converted = u.fromBase(base);
          const isFrom = key === fromUnit;
          return (
            <div key={key} style={{
              padding: "10px 18px",
              borderBottom: i < Object.keys(units).length - 2 ? "1px solid rgba(255,255,255,0.04)" : "none",
              borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
              background: isFrom ? `${cat.accent}08` : "transparent",
              display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8,
            }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: isFrom ? cat.accent : "#4b5563" }}>
                {u.label}
              </span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: isFrom ? cat.accent : "#94a3b8", fontWeight: isFrom ? 700 : 400 }}>
                {fmt(converted)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UnitConverter() {
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

  // reset units when category changes
  useEffect(() => {
    const keys = Object.keys(CATEGORIES[catKey].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1]);
    setResult(null);
    setInputVal("");
  }, [catKey]);

  // compute result
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

  const SelectStyle = (ac) => ({
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${ac}44`,
    borderRadius: 10,
    padding: "11px 36px 11px 14px",
    color: "#e2e8f0",
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%236b7280' d='M5 6L0 0h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
        select option { background:#111827; color:#e2e8f0; }
        .cat-btn { transition: all 0.2s; }
        .cat-btn:hover { opacity: 1 !important; }
        .swap-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .toggle-btn:hover { opacity: 0.8 !important; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#0d1117",
        backgroundImage: `radial-gradient(ellipse 70% 40% at 50% 0%, ${accent}0a, transparent)`,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "32px 16px 56px",
        fontFamily: "'Syne', sans-serif",
        transition: "background-image 0.4s",
      }}>

        {/* dot grid */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }} />

        <div style={{ width: "100%", maxWidth: 600, position: "relative" }}>

          {/* ── Header ── */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: `${accent}0e`, border: `1px solid ${accent}33`,
              borderRadius: 999, padding: "4px 14px", marginBottom: 14,
              transition: "all 0.3s",
            }}>
              <span style={{ color: accent, fontSize: 11, letterSpacing: 2, fontFamily: "'Space Mono', monospace", transition: "color 0.3s" }}>
                HERRAMIENTA 4 / 5
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(22px,5vw,34px)", fontWeight: 800, color: "#f0f4f8", margin: "0 0 6px", letterSpacing: -0.5 }}>
              Convertidor de{" "}
              <span style={{ color: accent, transition: "color 0.3s" }}>Unidades</span>
            </h1>
            <p style={{ color: "#374151", fontSize: 13, margin: 0, fontFamily: "'Space Mono', monospace" }}>
              Presión · Torque · Fuerza — nivel ingeniería
            </p>
          </div>

          {/* ── Category tabs ── */}
          <div style={{
            display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap",
          }}>
            {Object.entries(CATEGORIES).map(([key, c]) => {
              const active = key === catKey;
              return (
                <button key={key} className="cat-btn"
                  onClick={() => setCatKey(key)}
                  style={{
                    flex: "1 1 120px",
                    padding: "12px 16px",
                    background: active ? `${c.accent}18` : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? c.accent + "66" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 12,
                    color: active ? c.accent : "#4b5563",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: 1,
                    opacity: active ? 1 : 0.7,
                    boxShadow: active ? `0 0 20px ${c.accent}18` : "none",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                  <span style={{ fontSize: 15 }}>{c.icon}</span>
                  {c.label.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* ── Main card ── */}
          <div style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 22,
            overflow: "hidden",
          }}>

            {/* Input grid */}
            <div style={{ padding: "24px 24px 20px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 36px 1fr",
                gridTemplateRows: "auto auto",
                gap: "8px 10px",
                alignItems: "end",
              }}>

                {/* Label row */}
                {["Valor", "De", "", "A"].map((lbl, i) => (
                  <div key={i} style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10,
                    color: "#4b5563", letterSpacing: 1.5, textTransform: "uppercase",
                    textAlign: i === 2 ? "center" : "left",
                  }}>{lbl}</div>
                ))}

                {/* Input */}
                <input
                  type="number"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder="0"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${accent}55`,
                    borderRadius: 10,
                    padding: "11px 14px",
                    color: "#f1f5f9",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 18,
                    fontWeight: 700,
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                    boxShadow: `0 0 16px ${accent}18`,
                  }}
                />

                {/* From unit */}
                <select value={fromUnit} onChange={e => setFromUnit(e.target.value)}
                  style={SelectStyle(accent)}>
                  {unitKeys.map(k => (
                    <option key={k} value={k}>{units[k].label} — {units[k].name}</option>
                  ))}
                </select>

                {/* Swap button */}
                <button className="swap-btn" onClick={swap} style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 10,
                  color: "#6b7280",
                  fontSize: 16,
                  cursor: "pointer",
                  height: 42,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>⇄</button>

                {/* To unit */}
                <select value={toUnit} onChange={e => setToUnit(e.target.value)}
                  style={SelectStyle(accent)}>
                  {unitKeys.map(k => (
                    <option key={k} value={k}>{units[k].label} — {units[k].name}</option>
                  ))}
                </select>

              </div>
            </div>

            {/* Result */}
            <div key={animKey} style={{
              margin: "0 24px 24px",
              background: result !== null ? `${accent}0d` : "rgba(255,255,255,0.02)",
              border: `1px solid ${result !== null ? accent + "44" : "rgba(255,255,255,0.05)"}`,
              borderRadius: 16,
              padding: "20px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 12,
              animation: result !== null ? "fadeUp 0.3s ease both" : "none",
              transition: "border-color 0.3s, background 0.3s",
            }}>
              <div>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 10,
                  color: result !== null ? accent : "#374151",
                  letterSpacing: 2, textTransform: "uppercase", marginBottom: 6,
                  transition: "color 0.3s",
                }}>
                  Resultado
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "clamp(26px, 7vw, 40px)",
                  fontWeight: 700,
                  color: result !== null ? accent : "#1f2937",
                  textShadow: result !== null ? `0 0 28px ${accent}55` : "none",
                  letterSpacing: -1,
                  lineHeight: 1,
                  transition: "color 0.3s, text-shadow 0.3s",
                }}>
                  {result !== null ? fmt(result) : "—"}
                </div>
              </div>
              {result !== null && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, color: accent, fontWeight: 700 }}>
                    {units[toUnit].label}
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#374151", marginTop: 4 }}>
                    {units[toUnit].name}
                  </div>
                </div>
              )}
              {result === null && (
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#1f2937" }}>
                  Ingresa un valor para convertir
                </div>
              )}
            </div>

            {/* Full equation line */}
            {result !== null && inputVal !== "" && (
              <div style={{
                margin: "-16px 24px 20px",
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                color: "#374151",
                textAlign: "center",
                padding: "10px",
                background: "rgba(255,255,255,0.015)",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                {inputVal} {units[fromUnit].label} = <span style={{ color: accent }}>{fmt(result)} {units[toUnit].label}</span>
              </div>
            )}

            {/* Toggle table */}
            <div style={{ padding: "0 24px 24px" }}>
              <button className="toggle-btn" onClick={() => setShowTable(s => !s)} style={{
                width: "100%",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "10px",
                color: "#4b5563",
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                cursor: "pointer",
                letterSpacing: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <span style={{ transition: "transform 0.3s", display: "inline-block", transform: showTable ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                {showTable ? "OCULTAR" : "VER"} TABLA COMPLETA DE CONVERSIÓN
              </button>
              {showTable && (
                <div style={{ marginTop: 12, animation: "fadeUp 0.3s ease both" }}>
                  <AllTable catKey={catKey} fromUnit={fromUnit} inputVal={inputVal} />
                </div>
              )}
            </div>
          </div>

          {/* Unit reference chips */}
          <div style={{
            marginTop: 16,
            display: "flex", flexWrap: "wrap", gap: 8,
          }}>
            {Object.entries(units).map(([key, u]) => (
              <div key={key} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 8,
                padding: "5px 12px",
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                color: "#374151",
              }}>
                <span style={{ color: accent }}>{u.label}</span> {u.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
