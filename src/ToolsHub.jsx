import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import EngineerHeader from "./EngineerHeader";
import Footer from "./Footer";
import CommandPalette from "./CommandPalette";
import { CATEGORIES } from "./tools";
import { useFavorites } from "./useFavorites";
import { PAPER, PANEL, INK, MUTE, MONO, SANS, BORDER, SHADOW, SHADOW_SM, ACCENTS, field } from "./theme";

const KOFI_URL = "https://ko-fi.com/damianvlab/tiers";

const PERKS = [
  { icon: "📚", text: "Tendrás acceso a recursos y cheat sheets que nadie más" },
  { icon: "❓", text: "Dudas directas conmigo, sin horario, para que no te presiones" },
  { icon: "🔧", text: "Serás parte del team, recibes las primeras actualizaciones de la Navaja Suiza" },
  { icon: "🎙️", text: "Llamadas y sesiones en vivo" },
];

function PremiumCard() {
  const accent = ACCENTS.pink;
  return (
    <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, margin: "32px 0 8px", padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 800, color: INK, margin: 0, letterSpacing: "-0.01em" }}>
          🔒 Zona Premium
        </h2>
        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: accent, textTransform: "uppercase" }}>
          Primeros 30 lugares
        </span>
      </div>
      <p style={{ fontFamily: MONO, fontSize: 11, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 14px" }}>
        ¿Qué incluye?
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px 16px", marginBottom: 16 }}>
        {PERKS.map((p) => (
          <div key={p.text} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontFamily: MONO, fontSize: 13, color: INK }}>
            <span>{p.icon}</span>
            <span>{p.text}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div style={{ fontFamily: MONO, fontSize: 14, color: INK }}>
          <strong style={{ fontSize: 18 }}>$5 USD/mes</strong>
          <span style={{ color: MUTE }}> — precio de fundador</span>
        </div>
        <a
          href={KOFI_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 18px", border: BORDER, background: accent, boxShadow: SHADOW_SM,
            color: "#fff", fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
            textDecoration: "none", textTransform: "uppercase",
          }}
        >
          Únete a la Zona Premium →
        </a>
      </div>
    </div>
  );
}

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
    <div style={{ minHeight: "100dvh", background: PAPER, color: INK, fontFamily: SANS }}>
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
            className="hub-kbd"
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

        <PremiumCard />
      </div>

      <CommandPalette />
      <Footer />
    </div>
  );
}
