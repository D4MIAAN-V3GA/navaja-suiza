import { useState, useMemo } from "react";

const data = [
  // ── Mecánica de Fluidos ──────────────────────────────────────────
  {
    id: 1,
    name: "Teorema de Bernoulli",
    category: "Fluidos",
    tags: ["presión", "velocidad", "flujo", "energía"],
    formula: "P + ½ρv² + ρgh = cte",
    description: "Conservación de energía en flujo estacionario incompresible. Relaciona presión, velocidad cinética y altura potencial.",
    ref: "ASME B31.3",
  },
  {
    id: 2,
    name: "Número de Reynolds",
    category: "Fluidos",
    tags: ["turbulencia", "régimen", "viscosidad", "flujo"],
    formula: "Re = ρvD / μ",
    description: "Determina si el flujo es laminar (Re < 2300) o turbulento (Re > 4000). ρ=densidad, v=velocidad, D=diámetro, μ=viscosidad.",
    ref: "—",
  },
  // ── Termodinámica ────────────────────────────────────────────────
  {
    id: 3,
    name: "Ley de Gas Ideal",
    category: "Termo",
    tags: ["presión", "volumen", "temperatura", "gas"],
    formula: "PV = nRT",
    description: "Relación entre presión (P), volumen (V), moles (n) y temperatura (T) para gases ideales. R = 8.314 J/mol·K.",
    ref: "ISO 6976",
  },
  {
    id: 4,
    name: "Primera Ley de la Termodinámica",
    category: "Termo",
    tags: ["calor", "trabajo", "energía interna", "sistema"],
    formula: "ΔU = Q − W",
    description: "La variación de energía interna (ΔU) de un sistema es igual al calor absorbido (Q) menos el trabajo realizado (W).",
    ref: "—",
  },
  {
    id: 5,
    name: "Conductividad Térmica (Fourier)",
    category: "Termo",
    tags: ["calor", "conducción", "temperatura", "material"],
    formula: "q = −k · A · (dT/dx)",
    description: "Flujo de calor por conducción. k = conductividad [W/m·K], A = área transversal, dT/dx = gradiente de temperatura.",
    ref: "ASHRAE 90.1",
  },
  // ── Resistencia de Materiales ────────────────────────────────────
  {
    id: 6,
    name: "Ley de Hooke",
    category: "Resistencia",
    tags: ["deformación", "estrés", "esfuerzo", "elasticidad", "módulo"],
    formula: "σ = E · ε",
    description: "Esfuerzo normal (σ) es proporcional a la deformación unitaria (ε). E = módulo de Young [Pa].",
    ref: "ASTM E111",
  },
  {
    id: 7,
    name: "Fórmula de Euler (Pandeo)",
    category: "Resistencia",
    tags: ["columna", "pandeo", "carga crítica", "compresión"],
    formula: "Pcr = π²EI / (KL)²",
    description: "Carga crítica de pandeo de una columna. K = factor de longitud efectiva, L = longitud, EI = rigidez a flexión.",
    ref: "AISC 360",
  },
  {
    id: 8,
    name: "Fórmula de Flexión",
    category: "Resistencia",
    tags: ["viga", "momento", "flexión", "sección"],
    formula: "σ = M · c / I",
    description: "Esfuerzo máximo en una viga en flexión. M = momento flector, c = distancia al centroide, I = momento de inercia.",
    ref: "—",
  },
  // ── GD&T / Metrología ────────────────────────────────────────────
  {
    id: 9,
    name: "Tolerancia de Posición (GD&T)",
    category: "GD&T",
    tags: ["posición", "localización", "datum", "tolerancia", "diámetro"],
    formula: "⊕ ⌀t | A | B | C",
    description: "Define la zona cilíndrica de tolerancia (diámetro t) dentro de la cual debe estar el eje real de un elemento, relativo a los datums A, B, C.",
    ref: "ASME Y14.5-2018",
  },
  {
    id: 10,
    name: "Tolerancia de Planitud",
    category: "GD&T",
    tags: ["planitud", "superficie", "flatness", "forma"],
    formula: "⏥ t",
    description: "Zona entre dos planos paralelos (separados t) dentro de la cual debe estar la superficie. No referencia datums.",
    ref: "ISO 1101:2017",
  },
  {
    id: 11,
    name: "Tolerancia de Perfil de Superficie",
    category: "GD&T",
    tags: ["perfil", "superficie", "contorno", "forma"],
    formula: "⌓ t | A",
    description: "Zona uniforme de ancho t alrededor del perfil teórico verdadero. Puede usarse con o sin datum.",
    ref: "ASME Y14.5-2018",
  },
  {
    id: 12,
    name: "Circularidad / Redondez",
    category: "GD&T",
    tags: ["circularidad", "redondez", "diámetro", "cilindro"],
    formula: "○ t",
    description: "Cada sección transversal circular debe caer entre dos círculos concéntricos separados por t. No requiere datum.",
    ref: "ISO 1101:2017",
  },
  // ── Metrología ───────────────────────────────────────────────────
  {
    id: 13,
    name: "Incertidumbre de Medición (GUM)",
    category: "Metrología",
    tags: ["incertidumbre", "calibración", "medición", "error", "ISO"],
    formula: "U = k · uc",
    description: "Incertidumbre expandida U con factor de cobertura k (típico k=2 para 95%). uc = incertidumbre combinada estándar.",
    ref: "ISO/IEC Guide 98-3 (GUM)",
  },
  {
    id: 14,
    name: "Norma ISO 17025",
    category: "Metrología",
    tags: ["laboratorio", "calibración", "competencia", "acreditación", "ISO"],
    formula: "—",
    description: "Requisitos generales de competencia para laboratorios de ensayo y calibración. Rige trazabilidad metrológica e incertidumbre.",
    ref: "ISO/IEC 17025:2017",
  },
  // ── Cálculo / Álgebra ────────────────────────────────────────────
  {
    id: 15,
    name: "Regla de la Cadena",
    category: "Cálculo",
    tags: ["derivada", "composición", "función", "diferencial"],
    formula: "d/dx[f(g(x))] = f'(g(x))·g'(x)",
    description: "Derivada de una función compuesta. Fundamental en análisis de sensibilidad y propagación de errores.",
    ref: "—",
  },
  {
    id: 16,
    name: "Transformada de Laplace",
    category: "Cálculo",
    tags: ["señales", "control", "ecuaciones diferenciales", "frecuencia"],
    formula: "F(s) = ∫₀^∞ f(t)e^(−st) dt",
    description: "Convierte ecuaciones diferenciales en algebraicas. Clave en sistemas de control e ingeniería eléctrica.",
    ref: "—",
  },
];

const CATEGORY_META = {
  "Fluidos":      { color: "#00ffb4", bg: "rgba(0,255,180,0.08)",    border: "rgba(0,255,180,0.25)" },
  "Termo":        { color: "#f76f9a", bg: "rgba(247,111,154,0.08)",  border: "rgba(247,111,154,0.25)" },
  "Resistencia":  { color: "#f7c06f", bg: "rgba(247,192,111,0.08)",  border: "rgba(247,192,111,0.25)" },
  "GD&T":         { color: "#7c6ff7", bg: "rgba(124,111,247,0.08)",  border: "rgba(124,111,247,0.25)" },
  "Metrología":   { color: "#38bdf8", bg: "rgba(56,189,248,0.08)",   border: "rgba(56,189,248,0.25)" },
  "Cálculo":      { color: "#fb923c", bg: "rgba(251,146,60,0.08)",   border: "rgba(251,146,60,0.25)" },
};

const ALL_CATEGORIES = ["Todos", ...Object.keys(CATEGORY_META)];

function highlight(text, query) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((p, i) =>
    regex.test(p)
      ? <mark key={i} style={{ background: "rgba(247,192,111,0.35)", color: "#f7c06f", borderRadius: 3, padding: "0 2px" }}>{p}</mark>
      : p
  );
}

function FormulaCard({ item, query }) {
  const [hovered, setHovered] = useState(false);
  const meta = CATEGORY_META[item.category] || { color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? meta.bg : "rgba(255,255,255,0.022)",
        border: `1px solid ${hovered ? meta.border : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16,
        padding: "18px 20px",
        cursor: "default",
        transition: "all 0.22s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered ? `0 8px 32px ${meta.color}18` : "none",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        animation: "fadeUp 0.3s ease both",
      }}
    >
      {/* top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            color: hovered ? meta.color : "#e2e8f0",
            lineHeight: 1.3,
            transition: "color 0.22s",
          }}>
            {highlight(item.name, query)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
          <span style={{
            background: meta.bg,
            border: `1px solid ${meta.border}`,
            borderRadius: 999,
            padding: "3px 10px",
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: meta.color,
            letterSpacing: 0.5,
            whiteSpace: "nowrap",
          }}>
            {item.category}
          </span>
        </div>
      </div>

      {/* formula */}
      <div style={{
        background: "rgba(0,0,0,0.3)",
        border: `1px solid ${hovered ? meta.color + "33" : "rgba(255,255,255,0.05)"}`,
        borderRadius: 10,
        padding: "10px 14px",
        fontFamily: "'Space Mono', monospace",
        fontSize: 15,
        color: hovered ? meta.color : "#94a3b8",
        letterSpacing: 0.5,
        transition: "all 0.22s",
        textShadow: hovered ? `0 0 16px ${meta.color}44` : "none",
      }}>
        {item.formula}
      </div>

      {/* description */}
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        color: "#4b5563",
        margin: 0,
        lineHeight: 1.7,
      }}>
        {highlight(item.description, query)}
      </p>

      {/* tags + ref */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {item.tags.slice(0, 4).map(tag => (
            <span key={tag} style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 6,
              padding: "2px 8px",
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              color: "#374151",
            }}>
              #{tag}
            </span>
          ))}
        </div>
        {item.ref !== "—" && (
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            color: hovered ? meta.color + "99" : "#1f2937",
            transition: "color 0.22s",
          }}>
            {item.ref}
          </span>
        )}
      </div>
    </div>
  );
}

export default function FormulaSearch() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [inputFocused, setInputFocused] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return data.filter(item => {
      const catMatch = activeCategory === "Todos" || item.category === activeCategory;
      if (!q) return catMatch;
      const haystack = [item.name, item.category, item.description, item.formula, ...item.tags].join(" ").toLowerCase();
      return catMatch && haystack.includes(q);
    });
  }, [query, activeCategory]);

  const counts = useMemo(() => {
    const q = query.toLowerCase().trim();
    const obj = { Todos: 0 };
    data.forEach(item => {
      const haystack = [item.name, item.category, item.description, item.formula, ...item.tags].join(" ").toLowerCase();
      if (!q || haystack.includes(q)) {
        obj.Todos = (obj.Todos || 0) + 1;
        obj[item.category] = (obj[item.category] || 0) + 1;
      }
    });
    return obj;
  }, [query]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .cat-chip { transition: all 0.18s !important; }
        .cat-chip:hover { opacity: 1 !important; transform: translateY(-1px); }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#0d1117",
        backgroundImage: "radial-gradient(ellipse 80% 45% at 50% 0%, rgba(124,111,247,0.07), transparent)",
        padding: "32px 16px 64px",
        fontFamily: "'Syne', sans-serif",
      }}>

        {/* dot grid */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", position: "relative" }}>

          {/* ── Header ── */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(124,111,247,0.1)", border: "1px solid rgba(124,111,247,0.25)",
              borderRadius: 999, padding: "4px 14px", marginBottom: 14,
            }}>
              <span style={{ color: "#7c6ff7", fontSize: 11, letterSpacing: 2, fontFamily: "'Space Mono', monospace" }}>
                HERRAMIENTA 5 / 5
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(24px,5vw,38px)", fontWeight: 800, color: "#f0f4f8", margin: "0 0 8px", letterSpacing: -0.5 }}>
              Buscador de{" "}
              <span style={{ color: "#7c6ff7" }}>Fórmulas</span>{" & "}
              <span style={{ color: "#7c6ff7" }}>GD&T</span>
            </h1>
            <p style={{ color: "#374151", fontSize: 13, margin: 0, fontFamily: "'Space Mono', monospace" }}>
              {data.length} entradas · Fluidos · Termo · Resistencia · GD&T · Metrología · Cálculo
            </p>
          </div>

          {/* ── Search bar ── */}
          <div style={{
            position: "relative",
            marginBottom: 20,
          }}>
            {/* glow behind input */}
            <div style={{
              position: "absolute", inset: -1,
              borderRadius: 18,
              background: inputFocused
                ? "linear-gradient(135deg, rgba(124,111,247,0.35), rgba(0,255,180,0.2))"
                : "transparent",
              filter: "blur(8px)",
              transition: "opacity 0.3s",
              opacity: inputFocused ? 1 : 0,
              zIndex: 0,
            }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 0 }}>
              <span style={{
                position: "absolute", left: 20,
                fontFamily: "'Space Mono', monospace",
                fontSize: 18,
                color: inputFocused ? "#7c6ff7" : "#374151",
                transition: "color 0.2s",
                pointerEvents: "none",
                userSelect: "none",
              }}>⌕</span>
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setAnimKey(k => k + 1); }}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Buscar fórmula, norma, categoría, tag…"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: inputFocused ? "rgba(255,255,255,0.055)" : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${inputFocused ? "rgba(124,111,247,0.6)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 16,
                  padding: "18px 56px 18px 52px",
                  color: "#f1f5f9",
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "clamp(15px,3vw,19px)",
                  fontWeight: 700,
                  outline: "none",
                  transition: "all 0.2s",
                }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{
                  position: "absolute", right: 16,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#6b7280",
                  padding: "4px 10px",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12,
                  cursor: "pointer",
                }}>✕</button>
              )}
            </div>
          </div>

          {/* ── Category chips ── */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
            {ALL_CATEGORIES.map(cat => {
              const meta = cat === "Todos" ? { color: "#94a3b8" } : CATEGORY_META[cat];
              const active = activeCategory === cat;
              const count = counts[cat] || 0;
              return (
                <button key={cat} className="cat-chip"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    background: active ? `${meta.color}18` : "rgba(255,255,255,0.025)",
                    border: `1px solid ${active ? meta.color + "55" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 999,
                    padding: "7px 14px",
                    color: active ? meta.color : "#4b5563",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 11,
                    cursor: "pointer",
                    letterSpacing: 0.5,
                    display: "flex", alignItems: "center", gap: 7,
                    opacity: count === 0 ? 0.3 : 1,
                  }}>
                  {cat}
                  <span style={{
                    background: active ? meta.color + "33" : "rgba(255,255,255,0.05)",
                    borderRadius: 999,
                    padding: "1px 7px",
                    fontSize: 10,
                    color: active ? meta.color : "#374151",
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Results ── */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 0",
              animation: "fadeUp 0.3s ease both",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>∅</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: "#374151" }}>
                No se encontraron resultados para "<span style={{ color: "#7c6ff7" }}>{query}</span>"
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#1f2937", marginTop: 6 }}>
                Prueba con otro término o cambia la categoría
              </div>
            </div>
          ) : (
            <>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 10,
                color: "#374151", letterSpacing: 2, textTransform: "uppercase",
                marginBottom: 14,
              }}>
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
                {query && <span> para "<span style={{ color: "#7c6ff7" }}>{query}</span>"</span>}
              </div>
              <div key={animKey} style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))",
                gap: 14,
              }}>
                {filtered.map((item, i) => (
                  <div key={item.id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <FormulaCard item={item} query={query} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Footer ── */}
          <div style={{
            marginTop: 48,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#1f2937" }}>
              NAVAJA SUIZA · INGENIERÍA · v1.0
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {Object.entries(CATEGORY_META).map(([cat, meta]) => (
                <span key={cat} style={{
                  display: "inline-block", width: 6, height: 6,
                  borderRadius: "50%", background: meta.color,
                  boxShadow: `0 0 6px ${meta.color}`,
                }} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
