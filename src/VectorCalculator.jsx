import { useState, useEffect } from "react";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, SHADOW, SHADOW_SM, ACCENTS } from "./theme";
import { ProcedurePanel } from "./ProcedurePanel";

const defaultVec = () => ({ i: "", j: "", k: "" });

function parseVec(v) {
  return {
    i: parseFloat(v.i) || 0,
    j: parseFloat(v.j) || 0,
    k: parseFloat(v.k) || 0,
  };
}

function magnitude({ i, j, k }) {
  return Math.sqrt(i * i + j * j + k * k);
}

function dotProduct(a, b) {
  return a.i * b.i + a.j * b.j + a.k * b.k;
}

function crossProduct(a, b) {
  return {
    i: a.j * b.k - a.k * b.j,
    j: a.k * b.i - a.i * b.k,
    k: a.i * b.j - a.j * b.i,
  };
}

function fmt(n) {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(4)).toString();
}

function buildVecSteps(r) {
  const { a, b, cross } = r;
  return [
    { title: "Magnitud |A| y |B|", lines: [
      `|A| = √(${a.i}² + ${a.j}² + ${a.k}²) = ${fmt(r.magA)}`,
      `|B| = √(${b.i}² + ${b.j}² + ${b.k}²) = ${fmt(r.magB)}`,
    ]},
    { title: "Producto punto A · B", lines: [
      `A·B = (${a.i})(${b.i}) + (${a.j})(${b.j}) + (${a.k})(${b.k}) = ${fmt(r.dot)}`,
    ]},
    { title: "Producto cruz A × B", lines: [
      `i = (${a.j})(${b.k}) − (${a.k})(${b.j}) = ${fmt(cross.i)}`,
      `j = (${a.k})(${b.i}) − (${a.i})(${b.k}) = ${fmt(cross.j)}`,
      `k = (${a.i})(${b.j}) − (${a.j})(${b.i}) = ${fmt(cross.k)}`,
    ]},
  ];
}

function VecInput({ label, color, vec, onChange }) {
  const fields = ["i", "j", "k"];
  return (
    <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW_SM, padding: "18px 20px", flex: 1, minWidth: 200 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{ display: "inline-block", width: 12, height: 12, background: color, border: BORDER_THIN }} />
        <span style={{ fontFamily: SANS, color: INK, fontSize: 14, letterSpacing: 1, textTransform: "uppercase", fontWeight: 800 }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {fields.map((axis) => (
          <label key={axis} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: MONO, color: MUTE, fontSize: 13, fontWeight: 700, width: 14, textAlign: "center" }}>
              {axis}
            </span>
            <input
              type="number"
              value={vec[axis]}
              onChange={(e) => onChange(axis, e.target.value)}
              placeholder="0"
              style={{
                flex: 1, background: PAPER, border: BORDER, borderRadius: 0,
                padding: "8px 12px", color: INK, fontFamily: MONO, fontSize: 14,
                outline: "none", width: "100%", boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.boxShadow = `3px 3px 0 ${color}`)}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ title, value, sub, accent }) {
  return (
    <div style={{ background: accent, border: BORDER, boxShadow: SHADOW_SM, padding: "16px 18px", flex: 1, minWidth: 160 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.85)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontFamily: MONO, fontSize: typeof value === "string" && value.length > 16 ? 14 : value.length > 8 ? 17 : 22, color: "#fff", fontWeight: 700, wordBreak: "break-all", lineHeight: 1.3 }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.85)" }}>{sub}</div>}
    </div>
  );
}

export default function VectorCalculator({ onAccentChange }) {
  const accent = ACCENTS.green;
  useEffect(() => { onAccentChange?.(accent); }, []);

  const [vecA, setVecA] = useState(defaultVec());
  const [vecB, setVecB] = useState(defaultVec());
  const [results, setResults] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  const A = ACCENTS.green;
  const B = ACCENTS.blue;

  const handleChange = (setter) => (axis, val) =>
    setter((prev) => ({ ...prev, [axis]: val }));

  const calculate = () => {
    const a = parseVec(vecA);
    const b = parseVec(vecB);
    const cross = crossProduct(a, b);
    setResults({
      a, b,
      magA: magnitude(a),
      magB: magnitude(b),
      dot: dotProduct(a, b),
      cross,
    });
    setAnimKey((k) => k + 1);
  };

  const crossStr = results
    ? `(${fmt(results.cross.i)}, ${fmt(results.cross.j)}, ${fmt(results.cross.k)})`
    : null;

  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "32px 0 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ display: "inline-block", background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", marginBottom: 12 }}>
          02 / 05 — VECTORES
        </span>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 800, color: INK, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Calculadora de vectores 3D
        </h2>
        <p style={{ fontFamily: MONO, fontSize: 13, color: MUTE, margin: 0 }}>
          Magnitud · producto punto · producto cruz
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <VecInput label="Vector A" color={A} vec={vecA} onChange={handleChange(setVecA)} />
        <VecInput label="Vector B" color={B} vec={vecB} onChange={handleChange(setVecB)} />
      </div>

      <button
        onClick={calculate}
        style={{
          width: "100%", padding: "14px 0", background: A, border: BORDER, boxShadow: SHADOW,
          borderRadius: 0, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 15,
          letterSpacing: 2, cursor: "pointer", marginBottom: 24, transition: "transform 0.05s, box-shadow 0.05s",
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = "translate(5px,5px)"; e.currentTarget.style.boxShadow = `0 0 0 ${INK}`; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = SHADOW; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = SHADOW; }}
      >
        CALCULAR
      </button>

      {results && (
        <div key={animKey}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <ResultCard title="|A| Magnitud" value={fmt(results.magA)} sub="unidades" accent={A} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <ResultCard title="|B| Magnitud" value={fmt(results.magB)} sub="unidades" accent={B} />
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <ResultCard title="A · B  Punto" value={fmt(results.dot)} sub={Math.abs(results.dot) < 1e-9 ? "perpendiculares" : ""} accent={ACCENTS.yellow} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <ResultCard title="A × B  Cruz" value={crossStr} sub={`|AxB| = ${fmt(magnitude(results.cross))}`} accent={ACCENTS.pink} />
            </div>
          </div>

          <ProcedurePanel accent={A} steps={buildVecSteps(results)} />
        </div>
      )}

      {!results && (
        <div style={{ textAlign: "center", padding: "24px 0", border: `2px dashed ${FAINT}`, color: MUTE, fontFamily: MONO, fontSize: 12, letterSpacing: 0.5 }}>
          ingresa coordenadas y presiona calcular
        </div>
      )}
    </section>
  );
}
