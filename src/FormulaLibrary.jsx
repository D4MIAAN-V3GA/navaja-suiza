import { useState, useEffect, useMemo } from "react";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, SHADOW, SHADOW_SM, ACCENTS, textOn } from "./theme";
import formulas from "./data/formulas.json";

// Acento de la herramienta para el nav (las otras 5 usan blue/green/orange/pink/cyan → queda yellow).
const ACCENT = ACCENTS.yellow;

// Un color por categoría → al cambiar de tema cambia el color.
const CATEGORY_COLOR = {
  Fluidos:       ACCENTS.cyan,
  Termo:         ACCENTS.orange,
  Resistencia:   ACCENTS.blue,
  "GD&T":        ACCENTS.pink,
  Metrología:    ACCENTS.green,
  Cálculo:       ACCENTS.yellow,
  Eléctrica:     ACCENTS.red,
  Estática:      ACCENTS.brown,
};
const catColor = (cat) => CATEGORY_COLOR[cat] || ACCENTS.yellow;

const CATEGORIES = ["Todos", ...Array.from(new Set(formulas.map((f) => f.category)))];

// ── Búsqueda difusa simple (sin librerías) ──────────────────────────
// Subsecuencia: las letras de la query aparecen en orden dentro del texto,
// no necesariamente contiguas. Devuelve un puntaje (mayor = mejor) o -1.
function fuzzyScore(query, text) {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  // coincidencia exacta de subcadena: puntaje alto, mejor si está al inicio
  const idx = t.indexOf(q);
  if (idx !== -1) return 1000 - idx;

  // subsecuencia difusa
  let qi = 0;
  let score = 0;
  let lastMatch = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      // letras consecutivas valen más
      score += lastMatch === ti - 1 ? 6 : 1;
      lastMatch = ti;
      qi++;
    }
  }
  return qi === q.length ? score : -1;
}

// Mejor puntaje de la fórmula combinando nombre y tags.
function matchScore(query, item) {
  if (!query.trim()) return 0;
  const candidates = [item.name, ...item.tags, item.category];
  let best = -1;
  for (const c of candidates) {
    const s = fuzzyScore(query.trim(), c);
    if (s > best) best = s;
  }
  return best;
}

function FormulaCard({ item }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: PANEL,
        border: BORDER,
        boxShadow: hovered ? SHADOW : SHADOW_SM,
        transform: hovered ? "translate(-2px,-2px)" : "none",
        transition: "transform 0.05s, box-shadow 0.05s",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Cabecera: nombre + categoría */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "stretch", borderBottom: BORDER }}>
        <div style={{ padding: "12px 14px", fontFamily: SANS, fontSize: 15, fontWeight: 800, color: INK, lineHeight: 1.2 }}>
          {item.name}
        </div>
        <div style={{
          flexShrink: 0,
          background: catColor(item.category),
          borderLeft: BORDER,
          padding: "0 12px",
          display: "flex", alignItems: "center",
          fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1,
          color: textOn(catColor(item.category)), textTransform: "uppercase",
        }}>
          {item.category}
        </div>
      </div>

      {/* Fórmula: bloque mono sobre papel */}
      <div style={{
        margin: "14px 14px 0",
        background: PAPER,
        border: BORDER_THIN,
        padding: "12px 14px",
        fontFamily: MONO, fontSize: 15, color: INK, fontWeight: 700,
        wordBreak: "break-word",
      }}>
        {item.formula}
      </div>

      {/* Descripción */}
      <p style={{ margin: "12px 14px 0", fontFamily: SANS, fontSize: 13, color: MUTE, lineHeight: 1.5 }}>
        {item.description}
      </p>

      {/* Tags + ref */}
      <div style={{ marginTop: "auto", padding: "12px 14px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
        {item.tags.slice(0, 5).map((t) => (
          <span key={t} style={{
            fontFamily: MONO, fontSize: 10, color: MUTE,
            border: BORDER_THIN, padding: "2px 7px",
          }}>
            #{t}
          </span>
        ))}
        {item.ref !== "—" && (
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10, fontWeight: 700, color: INK, letterSpacing: 0.5 }}>
            {item.ref}
          </span>
        )}
      </div>
    </div>
  );
}

export default function FormulaLibrary({ onAccentChange }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  // Reporta el acento una sola vez al montar (mismo patrón que las otras herramientas).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onAccentChange?.(ACCENT); }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    const list = formulas
      .filter((f) => activeCategory === "Todos" || f.category === activeCategory)
      .map((f) => ({ item: f, score: matchScore(q, f) }))
      .filter((r) => (q ? r.score >= 0 : true));

    if (q) list.sort((a, b) => b.score - a.score);
    return list.map((r) => r.item);
  }, [query, activeCategory]);

  const counts = useMemo(() => {
    const q = query.trim();
    const obj = {};
    for (const cat of CATEGORIES) {
      if (cat === "Todos") {
        obj[cat] = formulas.filter((f) => (q ? matchScore(q, f) >= 0 : true)).length;
      } else {
        obj[cat] = formulas.filter((f) => f.category === cat && (q ? matchScore(q, f) >= 0 : true)).length;
      }
    }
    return obj;
  }, [query]);

  return (
    <section style={{ maxWidth: 860, margin: "0 auto", padding: "32px 0 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <span style={{ display: "inline-block", background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", marginBottom: 12 }}>
          06 / 06 — FÓRMULAS
        </span>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: INK, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Biblioteca de fórmulas
        </h2>
        <p style={{ fontFamily: MONO, fontSize: 13, color: MUTE, margin: 0 }}>
          {formulas.length} fórmulas · búsqueda difusa por nombre y tags
        </p>
      </div>

      {/* Buscador brutalista */}
      <div style={{ display: "flex", border: BORDER, boxShadow: SHADOW, background: PANEL, marginBottom: 20 }}>
        <div style={{ background: INK, color: PAPER, fontFamily: MONO, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", padding: "0 16px" }}>
          ⌕
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar fórmula, norma, tag…"
          style={{
            flex: 1, background: PANEL, border: "none", borderRadius: 0,
            padding: "14px 16px", color: INK, fontFamily: MONO, fontSize: 15,
            outline: "none", minWidth: 0,
          }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{
            background: PAPER, border: "none", borderLeft: BORDER,
            color: INK, fontFamily: MONO, fontSize: 14, fontWeight: 700,
            padding: "0 16px", cursor: "pointer",
          }}>✕</button>
        )}
      </div>

      {/* Filtros por categoría */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          const count = counts[cat] || 0;
          const isTodos = cat === "Todos";
          const bg  = active ? (isTodos ? INK : catColor(cat)) : PANEL;
          const txt = active ? (isTodos ? PAPER : textOn(catColor(cat))) : INK;
          return (
            <button key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: bg,
                border: BORDER, borderRadius: 0,
                boxShadow: active ? SHADOW_SM : "none",
                padding: "8px 12px",
                color: txt,
                fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                textTransform: "uppercase",
                cursor: "pointer",
                opacity: count === 0 && !active ? 0.4 : 1,
                display: "flex", alignItems: "center", gap: 7,
              }}>
              {cat}
              <span style={{
                background: active ? txt : INK, color: active ? bg : PAPER, borderRadius: 0,
                padding: "1px 6px", fontSize: 10,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Resultados */}
      {filtered.length === 0 ? (
        <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 28, color: INK, marginBottom: 10 }}>∅</div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: INK, fontWeight: 700 }}>
            Sin resultados para "{query}"
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: MUTE, marginTop: 6 }}>
            Prueba con otro término o cambia la categoría.
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            {query && <span> · ordenado por relevancia</span>}
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))",
            gap: 16,
            alignItems: "stretch",
          }}>
            {filtered.map((item) => (
              <FormulaCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
