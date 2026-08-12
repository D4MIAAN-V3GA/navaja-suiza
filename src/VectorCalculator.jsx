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
    <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW_SM, padding: "20px 22px", flex: 1, minWidth: 220 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ display: "inline-block", width: 14, height: 14, background: color, border: BORDER_THIN }} />
        <span style={{ fontFamily: SANS, color: INK, fontSize: 15, letterSpacing: 1, textTransform: "uppercase", fontWeight: 800 }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {fields.map((axis) => (
          <label key={axis} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: MONO, color: MUTE, fontSize: 15, fontWeight: 700, width: 16, textAlign: "center" }}>
              {axis}
            </span>
            <input
              type="number"
              value={vec[axis]}
              onChange={(e) => onChange(axis, e.target.value)}
              placeholder="0"
              style={{
                flex: 1, background: PAPER, border: BORDER, borderRadius: 0,
                padding: "12px 14px", color: INK, fontFamily: MONO, fontSize: 17,
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

// Escena isométrica: ver los dos vectores (y su producto cruz) evita el error
// clásico de teclear un signo al revés y no darse cuenta.
//   pantalla_x = (i − j)·cos30      pantalla_y = (i + j)·sen30 − k
const SCENE = { W: 300, H: 230 };
const SCENE_CX = SCENE.W / 2;
const SCENE_CY = SCENE.H / 2 + 14;

// Proyección isométrica de (i, j, k) a coordenadas de pantalla.
const project = (v, s) => [
  SCENE_CX + s * (v.i - v.j) * 0.866,
  SCENE_CY + s * ((v.i + v.j) * 0.5 - v.k),
];

function SceneArrow({ v, s, color, label, dash }) {
  const [x, y] = project(v, s);
  if (Math.hypot(x - SCENE_CX, y - SCENE_CY) < 2) return null;
  const ang = Math.atan2(y - SCENE_CY, x - SCENE_CX);
  const h = 9;
  const p1 = [x - h * Math.cos(ang - 0.4), y - h * Math.sin(ang - 0.4)];
  const p2 = [x - h * Math.cos(ang + 0.4), y - h * Math.sin(ang + 0.4)];
  return (
    <g>
      <line x1={SCENE_CX} y1={SCENE_CY} x2={x} y2={y} stroke={color} strokeWidth="3" strokeDasharray={dash ? "5 4" : undefined} />
      <polygon points={`${x},${y} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} fill={color} />
      <text x={x + (x >= SCENE_CX ? 7 : -7)} y={y + (y >= SCENE_CY ? 13 : -6)} fill={color} fontFamily="Courier New, monospace" fontSize="13" fontWeight="700" textAnchor={x >= SCENE_CX ? "start" : "end"}>
        {label}
      </text>
    </g>
  );
}

function SceneAxis({ v, label }) {
  const [x, y] = project(v, 92);
  return (
    <g>
      <line x1={SCENE_CX} y1={SCENE_CY} x2={x} y2={y} stroke={FAINT} strokeWidth="1.5" />
      <text x={x} y={y} dx={4} dy={4} fill={FAINT} fontFamily="Courier New, monospace" fontSize="11">{label}</text>
    </g>
  );
}

// Escena isométrica: ver los dos vectores (y su producto cruz) evita el error
// clásico de teclear un signo al revés y no darse cuenta.
function VectorScene({ a, b, cross, colorA, colorB, colorC }) {
  const comps = [a, b, cross || { i: 0, j: 0, k: 0 }].flatMap((v) => [Math.abs(v.i), Math.abs(v.j), Math.abs(v.k)]);
  const max = Math.max(1, ...comps);
  const s = 78 / max; // el vector más largo mide ~78 px

  return (
    <svg viewBox={`0 0 ${SCENE.W} ${SCENE.H}`} width="100%" style={{ maxWidth: SCENE.W, display: "block" }} role="img" aria-label="Representación isométrica de los vectores">
      <SceneAxis v={{ i: 1, j: 0, k: 0 }} label="i" />
      <SceneAxis v={{ i: 0, j: 1, k: 0 }} label="j" />
      <SceneAxis v={{ i: 0, j: 0, k: 1 }} label="k" />
      <circle cx={SCENE_CX} cy={SCENE_CY} r="3" fill={INK} />
      {cross && <SceneArrow v={cross} s={s} color={colorC} label="A×B" dash />}
      <SceneArrow v={a} s={s} color={colorA} label="A" />
      <SceneArrow v={b} s={s} color={colorB} label="B" />
    </svg>
  );
}

function ResultCard({ title, value, sub, accent }) {
  return (
    <div style={{ background: accent, border: BORDER, boxShadow: SHADOW_SM, padding: "18px 20px" }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.85)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ fontFamily: MONO, fontSize: typeof value === "string" && value.length > 16 ? 17 : value.length > 8 ? 21 : 28, color: "#fff", fontWeight: 700, wordBreak: "break-all", lineHeight: 1.25 }}>
        {value}
      </div>
      {sub && <div style={{ marginTop: 7, fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>{sub}</div>}
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

  // La escena se dibuja con lo que hay escrito, sin esperar al botón.
  const liveA = parseVec(vecA);
  const liveB = parseVec(vecB);

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16, alignItems: "stretch" }}>
        <div style={{ flex: "1 1 340px", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <VecInput label="Vector A" color={A} vec={vecA} onChange={handleChange(setVecA)} />
          <VecInput label="Vector B" color={B} vec={vecB} onChange={handleChange(setVecB)} />
        </div>

        <div style={{ flex: "1 1 280px", background: PANEL, border: BORDER, boxShadow: SHADOW_SM, padding: "14px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{ alignSelf: "flex-start", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.6, textTransform: "uppercase" }}>
            Vista isométrica
          </div>
          <VectorScene
            a={liveA}
            b={liveB}
            cross={results ? results.cross : null}
            colorA={A}
            colorB={B}
            colorC={ACCENTS.pink}
          />
        </div>
      </div>

      <button
        onClick={calculate}
        style={{
          width: "100%", padding: "17px 0", background: A, border: BORDER, boxShadow: SHADOW,
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: INK, textTransform: "uppercase" }}>
              Resultados
            </span>
            <div style={{ flex: 1, height: 2, background: INK }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: 14 }}>
            <ResultCard title="|A| Magnitud" value={fmt(results.magA)} sub="unidades" accent={A} />
            <ResultCard title="|B| Magnitud" value={fmt(results.magB)} sub="unidades" accent={B} />
            <ResultCard title="A · B  Punto" value={fmt(results.dot)} sub={Math.abs(results.dot) < 1e-9 ? "perpendiculares" : ""} accent={ACCENTS.yellow} />
            <ResultCard title="A × B  Cruz" value={crossStr} sub={`|AxB| = ${fmt(magnitude(results.cross))}`} accent={ACCENTS.pink} />
          </div>

          <ProcedurePanel accent={A} steps={buildVecSteps(results)} />
        </div>
      )}

      {!results && (
        <div style={{ textAlign: "center", padding: "34px 0", border: `2px dashed ${FAINT}`, color: MUTE, fontFamily: MONO, fontSize: 13, letterSpacing: 0.5 }}>
          ingresa coordenadas y presiona calcular
        </div>
      )}
    </div>
  );
}
