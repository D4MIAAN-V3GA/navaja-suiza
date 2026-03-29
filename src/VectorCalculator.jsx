import { useState } from "react";

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

function VecInput({ label, color, vec, onChange }) {
  const fields = ["i", "j", "k"];
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}33`,
        borderRadius: 16,
        padding: "20px 24px",
        flex: 1,
        minWidth: 200,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            color,
            fontSize: 13,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {fields.map((axis) => (
          <label
            key={axis}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                color: "#888",
                fontSize: 12,
                width: 14,
                textAlign: "center",
              }}
            >
              {axis}
            </span>
            <input
              type="number"
              value={vec[axis]}
              onChange={(e) => onChange(axis, e.target.value)}
              placeholder="0"
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid rgba(255,255,255,0.08)`,
                borderRadius: 8,
                padding: "8px 12px",
                color: "#e2e8f0",
                fontFamily: "'Space Mono', monospace",
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = color + "99")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.08)")
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ title, value, sub, accent }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${accent}44`,
        borderRadius: 14,
        padding: "18px 22px",
        flex: 1,
        minWidth: 160,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: 0.7,
        }}
      />
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color: "#555",
          letterSpacing: 2,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: typeof value === "string" && value.length > 12 ? 13 : 20,
          color: accent,
          fontWeight: 700,
          wordBreak: "break-all",
          lineHeight: 1.4,
          textShadow: `0 0 18px ${accent}55`,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            marginTop: 6,
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
            color: "#555",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export default function VectorCalculator() {
  const [vecA, setVecA] = useState(defaultVec());
  const [vecB, setVecB] = useState(defaultVec());
  const [results, setResults] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  const handleChange = (setter) => (axis, val) =>
    setter((prev) => ({ ...prev, [axis]: val }));

  const calculate = () => {
    const a = parseVec(vecA);
    const b = parseVec(vecB);
    const cross = crossProduct(a, b);
    setResults({
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .vc-result { animation: fadeUp 0.4s ease both; }
        .vc-result:nth-child(1) { animation-delay: 0.05s; }
        .vc-result:nth-child(2) { animation-delay: 0.12s; }
        .vc-result:nth-child(3) { animation-delay: 0.19s; }
        .vc-result:nth-child(4) { animation-delay: 0.26s; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
          fontFamily: "'Syne', sans-serif",
        }}
      >
        {/* background grid */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,255,200,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,200,0.025) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        <div style={{ width: "100%", maxWidth: 720, position: "relative" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(0,255,180,0.06)",
                border: "1px solid rgba(0,255,180,0.15)",
                borderRadius: 999,
                padding: "4px 14px",
                marginBottom: 16,
              }}
            >
              <span style={{ color: "#00ffb4", fontSize: 11, letterSpacing: 2, fontFamily: "'Space Mono', monospace" }}>
                HERRAMIENTA 1 / 5
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(26px, 5vw, 38px)",
                fontWeight: 800,
                color: "#f0f4f8",
                margin: "0 0 8px",
                letterSpacing: -1,
              }}
            >
              Calculadora de{" "}
              <span style={{ color: "#00ffb4" }}>Vectores 3D</span>
            </h1>
            <p style={{ color: "#4a5568", fontSize: 14, margin: 0, fontFamily: "'Space Mono', monospace" }}>
              Magnitud · Producto Punto · Producto Cruz
            </p>
          </div>

          {/* Inputs */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            <VecInput
              label="Vector A"
              color="#00ffb4"
              vec={vecA}
              onChange={handleChange(setVecA)}
            />
            <VecInput
              label="Vector B"
              color="#7c6ff7"
              vec={vecB}
              onChange={handleChange(setVecB)}
            />
          </div>

          {/* Button */}
          <button
            onClick={calculate}
            style={{
              width: "100%",
              padding: "14px 0",
              background: "linear-gradient(135deg, #00c896, #00ffb4)",
              border: "none",
              borderRadius: 12,
              color: "#0a0a0f",
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 2,
              cursor: "pointer",
              marginBottom: 28,
              boxShadow: "0 0 24px rgba(0,255,180,0.25)",
              transition: "box-shadow 0.2s, opacity 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.boxShadow = "0 0 40px rgba(0,255,180,0.5)")
            }
            onMouseLeave={(e) =>
              (e.target.style.boxShadow = "0 0 24px rgba(0,255,180,0.25)")
            }
          >
            CALCULAR
          </button>

          {/* Results */}
          {results && (
            <div key={animKey} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div className="vc-result" style={{ flex: 1, minWidth: 140 }}>
                <ResultCard
                  title="|A| Magnitud"
                  value={fmt(results.magA)}
                  sub="unidades"
                  accent="#00ffb4"
                />
              </div>
              <div className="vc-result" style={{ flex: 1, minWidth: 140 }}>
                <ResultCard
                  title="|B| Magnitud"
                  value={fmt(results.magB)}
                  sub="unidades"
                  accent="#7c6ff7"
                />
              </div>
              <div className="vc-result" style={{ flex: 1, minWidth: 140 }}>
                <ResultCard
                  title="A · B  Punto"
                  value={fmt(results.dot)}
                  sub={Math.abs(results.dot) < 1e-9 ? "⊥ perpendiculares" : ""}
                  accent="#f7c06f"
                />
              </div>
              <div className="vc-result" style={{ flex: 1, minWidth: 200 }}>
                <ResultCard
                  title="A × B  Cruz"
                  value={crossStr}
                  sub={`|A×B| = ${fmt(magnitude(results.cross))}`}
                  accent="#f76f9a"
                />
              </div>
            </div>
          )}

          {!results && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#2d3748",
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                letterSpacing: 1,
              }}
            >
              ↑ ingresa coordenadas y presiona calcular
            </div>
          )}
        </div>
      </div>
    </>
  );
}
