import { useState, useCallback } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import EngineerHeader from "./EngineerHeader";
import Footer from "./Footer";
import CommandPalette from "./CommandPalette";
import ToolRail from "./ToolRail";
import { CATEGORIES, TOOLS, getTool } from "./tools";
import { useFavorites } from "./useFavorites";
import { PAPER, PANEL, INK, MUTE, MONO, SANS, BORDER, BORDER_THIN, BORDER_SOFT, SHADOW_SM, field, textOn } from "./theme";

// Barra superior compacta para cuando hay una herramienta abierta: el hero
// gigante empujaba la calculadora fuera de la primera pantalla.
function CompactBar() {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
        padding: "16px 0 14px", marginBottom: 20, borderBottom: BORDER,
      }}
    >
      <Link
        to="/herramientas"
        style={{ fontFamily: SANS, fontWeight: 800, fontSize: 17, letterSpacing: "-0.01em", color: INK, textDecoration: "none" }}
      >
        La navaja suiza del ingeniero
      </Link>
      <span
        style={{
          background: INK, color: PAPER, fontFamily: MONO, fontSize: 10,
          letterSpacing: 1.4, padding: "3px 8px", textTransform: "uppercase",
        }}
      >
        @damianvlab
      </span>
      <Link
        to="/"
        style={{
          marginLeft: "auto", fontFamily: MONO, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.08em", color: MUTE, textDecoration: "none", textTransform: "uppercase",
        }}
      >
        ← Inicio
      </Link>
    </div>
  );
}

export default function ToolsHub() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(null);
  const { favorites, isFav, toggleFav } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  // "/herramientas/vectores" → "vectores". Un id inválido se trata como índice:
  // ToolPage ya redirige solo.
  const activeTool = getTool(location.pathname.split("/")[2]) || null;
  const onIndex = !activeTool;

  // Color vivo de la herramienta abierta. Varias cambian de color por dentro
  // (Inercia por perfil, Unidades por magnitud, Matrices por método) y avisan
  // con `onAccentChange`. Se guarda junto al id que lo reportó: así, al pasar a
  // otra herramienta, el color arranca del suyo y no se queda trabado el
  // anterior — sin depender del orden en que corren los efectos.
  const [reported, setReported] = useState(null); // { id, accent }
  const reportAccent = useCallback((id, accent) => setReported({ id, accent }), []);
  const toolAccent = reported && reported.id === activeTool?.id
    ? reported.accent
    : activeTool?.accent;

  // Filtrar desde una herramienta abierta vuelve al grid.
  const pickCategory = (id) => {
    setCategory((c) => (c === id ? null : id));
    if (!onIndex) navigate("/herramientas");
  };
  const onSearch = (v) => {
    setQuery(v);
    if (!onIndex && v.trim()) navigate("/herramientas");
  };

  // Filtrar es secundario: la caja fuerte se la queda la herramienta activa.
  const catBtn = (active) => ({
    textAlign: "left",
    padding: "7px 10px",
    border: active ? BORDER_THIN : BORDER_SOFT,
    borderRadius: 0,
    cursor: "pointer",
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.4,
    background: active ? INK : "transparent",
    color: active ? PAPER : MUTE,
  });

  // Lista de navegación: saltar de una calculadora a otra sin volver al grid.
  const q = query.trim().toLowerCase();
  const navTools = TOOLS.filter((t) => {
    const okCat = !category || t.category === category;
    const okQ = !q || (t.label + " " + t.desc).toLowerCase().includes(q);
    return okCat && okQ;
  });
  const ordered = [
    ...navTools.filter((t) => favorites.includes(t.id)),
    ...navTools.filter((t) => !favorites.includes(t.id)),
  ];

  const railLabel = onIndex ? "Sobre estas herramientas" : `Guía · ${activeTool.label}`;

  return (
    <div style={{ minHeight: "100dvh", background: PAPER, color: INK, fontFamily: SANS }}>
      <div className="hub-shell">
        {onIndex ? (
          <>
            <EngineerHeader />
            <div style={{ marginBottom: 20 }}>
              <Link
                to="/"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
                  color: INK, textDecoration: "none", textTransform: "uppercase",
                }}
              >
                ← Inicio
              </Link>
            </div>
          </>
        ) : (
          <CompactBar />
        )}

        <div className={`hub-layout${onIndex ? "" : " hub-tool-open"}`}>
          {/* ── Columna izquierda: buscar, filtrar y saltar de herramienta ── */}
          <aside className="hub-nav">
            <div className="hub-nav-inner">
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={query}
                  onChange={(e) => onSearch(e.target.value)}
                  placeholder="Buscar…"
                  style={field({ flex: 1, fontSize: 13, padding: "9px 11px" })}
                />
                <button
                  className="hub-kbd"
                  onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
                  title="Paleta de comandos (Ctrl/⌘ + K)"
                  style={{
                    flexShrink: 0, padding: "0 10px", border: BORDER, background: PANEL,
                    fontFamily: MONO, fontSize: 11, fontWeight: 700, color: INK, cursor: "pointer",
                  }}
                >
                  ⌘K
                </button>
              </div>

              <div className="hub-nav-cats">
                <div className="hub-nav-title">Categorías</div>
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
              </div>

              {/* En el índice el centro ya es la rejilla completa: repetir la
                  lista al lado solo duplica. Aparece al abrir una herramienta,
                  que es cuando sirve para saltar a otra. */}
              <div className="hub-nav-tools-wrap" style={{ display: onIndex ? "none" : undefined }}>
                <div className="hub-nav-title">Herramientas</div>
                <nav className="hub-nav-tools">
                  {ordered.map((t) => {
                    const active = activeTool?.id === t.id;
                    // La fila activa usa el color vivo para no contradecir a la
                    // banda del encabezado; las demás, el del catálogo.
                    const rowAccent = active ? toolAccent : t.accent;
                    return (
                      <Link
                        key={t.id}
                        to={`/herramientas/${t.id}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, textDecoration: "none",
                          padding: "8px 10px",
                          border: active ? BORDER_THIN : BORDER_SOFT,
                          background: active ? rowAccent : PANEL,
                          color: active ? textOn(rowAccent) : INK,
                          boxShadow: active ? SHADOW_SM : "none",
                        }}
                      >
                        <span
                          style={{
                            width: 10, height: 10, flexShrink: 0, background: rowAccent,
                            border: `1px solid ${INK}`, outline: active ? `1px solid ${PANEL}` : "none",
                          }}
                        />
                        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t.label}
                        </span>
                        {favorites.includes(t.id) && (
                          <span style={{ marginLeft: "auto", fontSize: 12, lineHeight: 1 }}>★</span>
                        )}
                      </Link>
                    );
                  })}
                  {ordered.length === 0 && (
                    <div style={{ fontFamily: MONO, fontSize: 11.5, color: MUTE, padding: "6px 2px" }}>
                      Nada con «{query}».
                    </div>
                  )}
                </nav>
              </div>
            </div>
          </aside>

          {/* ── Centro: la herramienta ── */}
          <main className="hub-main">
            <Outlet context={{ query, category, favorites, isFav, toggleFav, toolAccent, reportAccent }} />
          </main>

          {/* ── Columna derecha: contexto de lo que está abierto ── */}
          <aside className="hub-rail" aria-label={railLabel}>
            <div className="hub-rail-inner">
              <ToolRail tool={activeTool} accent={toolAccent} />
            </div>
          </aside>
        </div>
      </div>

      <CommandPalette />
      <Footer />
    </div>
  );
}
