import { Link, useOutletContext } from "react-router-dom";
import { TOOLS } from "./tools";
import { PANEL, INK, MUTE, MONO, SANS, BORDER, SHADOW_SM, tag } from "./theme";

// Estrella de favorito. Detiene la navegación del <Link> contenedor.
function FavStar({ active, onToggle }) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
      aria-label={active ? "Quitar de favoritos" : "Marcar favorito"}
      style={{
        background: "none", border: "none", cursor: "pointer", padding: 0,
        fontSize: 16, lineHeight: 1, color: active ? INK : "#c9c4b4",
      }}
    >
      {active ? "★" : "☆"}
    </button>
  );
}

function ToolCard({ tool, isFav, toggleFav }) {
  return (
    <Link to={`/herramientas/${tool.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: PANEL, border: BORDER, boxShadow: SHADOW_SM,
        padding: "14px 16px", height: "100%", boxSizing: "border-box",
        display: "flex", flexDirection: "column", gap: 5,
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ width: 12, height: 12, flexShrink: 0, background: tool.accent, border: `1px solid ${INK}`, alignSelf: "center" }} />
          <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: INK }}>{tool.label}</span>
          <span style={{ marginLeft: "auto" }}>
            <FavStar active={isFav(tool.id)} onToggle={() => toggleFav(tool.id)} />
          </span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 12, color: MUTE, lineHeight: 1.5 }}>{tool.desc}</span>
      </div>
    </Link>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 230px), 1fr))",
  gap: 14,
};

export default function ToolsGrid() {
  const { query, category, isFav, toggleFav, favorites } = useOutletContext();

  const q = query.trim().toLowerCase();
  const filtered = TOOLS.filter((t) => {
    const matchesCat = !category || t.category === category;
    const matchesQ = !q || (t.label + " " + t.desc).toLowerCase().includes(q);
    return matchesCat && matchesQ;
  });

  const favTools = TOOLS.filter((t) => favorites.includes(t.id));

  return (
    <div style={{ padding: "8px 0 24px" }}>
      {/* Favoritos: solo si hay y no estamos filtrando */}
      {favTools.length > 0 && !q && !category && (
        <section style={{ marginBottom: 28 }}>
          <span style={{ ...tag({}), marginBottom: 14 }}>FAVORITOS</span>
          <div style={gridStyle}>
            {favTools.map((t) => (
              <ToolCard key={t.id} tool={t} isFav={isFav} toggleFav={toggleFav} />
            ))}
          </div>
        </section>
      )}

      <section>
        <span style={{ ...tag({}), marginBottom: 14 }}>
          {filtered.length} {filtered.length === 1 ? "HERRAMIENTA" : "HERRAMIENTAS"}
        </span>
        {filtered.length === 0 ? (
          <div style={{ padding: "24px 0", fontFamily: MONO, fontSize: 13, color: MUTE }}>
            No hay herramientas para «{query}».
          </div>
        ) : (
          <div style={gridStyle}>
            {filtered.map((t) => (
              <ToolCard key={t.id} tool={t} isFav={isFav} toggleFav={toggleFav} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
