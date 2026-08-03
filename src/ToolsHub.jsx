import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import EngineerHeader from "./EngineerHeader";
import Footer from "./Footer";
import CommandPalette from "./CommandPalette";
import PremiumCard from "./PremiumCard";
import { CATEGORIES } from "./tools";
import { useFavorites } from "./useFavorites";
import { PAPER, PANEL, INK, MONO, SANS, BORDER, field } from "./theme";

export default function ToolsHub() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(null);
  const { favorites, isFav, toggleFav } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  const onIndex = location.pathname.replace(/\/$/, "") === "/herramientas";

  // Filtrar desde una herramienta abierta vuelve al grid.
  const pickCategory = (id) => {
    setCategory((c) => (c === id ? null : id));
    if (!onIndex) navigate("/herramientas");
  };
  const onSearch = (v) => {
    setQuery(v);
    if (!onIndex && v.trim()) navigate("/herramientas");
  };

  const catBtn = (active) => ({
    textAlign: "left",
    padding: "9px 12px",
    border: BORDER,
    borderRadius: 0,
    cursor: "pointer",
    fontFamily: MONO,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    background: active ? INK : PANEL,
    color: active ? PAPER : INK,
  });

  return (
    <div style={{ minHeight: "100vh", background: PAPER, color: INK, fontFamily: SANS }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 16px" }}>
        <EngineerHeader />

        <div style={{ marginBottom: 16 }}>
          <Link to="/" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
            color: INK, textDecoration: "none", textTransform: "uppercase",
          }}>
            ← Inicio
          </Link>
        </div>

        {/* Buscador + atajo de paleta */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <input
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar herramienta…"
            style={field({ flex: 1 })}
          />
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
            title="Paleta de comandos (Ctrl/⌘ + K)"
            style={{
              flexShrink: 0, padding: "0 14px", border: BORDER, background: PANEL,
              fontFamily: MONO, fontSize: 12, fontWeight: 700, color: INK, cursor: "pointer",
            }}
          >
            ⌘K
          </button>
        </div>

        <div className="hub-layout">
          {/* Sidebar de categorías */}
          <aside className="hub-sidebar">
            <div className="hub-cats">
              <button onClick={() => setCategory(null)} style={catBtn(!category)}>
                TODAS
              </button>
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => pickCategory(c.id)} style={catBtn(category === c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Contenido: grid o herramienta activa */}
          <main>
            <Outlet context={{ query, category, favorites, isFav, toggleFav }} />
          </main>
        </div>

        <PremiumCard style={{ margin: "32px 0 8px" }} />
      </div>

      <CommandPalette />
      <Footer />
    </div>
  );
}
