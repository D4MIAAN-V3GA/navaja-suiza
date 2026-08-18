import { useState, useCallback, useEffect, useRef } from "react";
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

  // Filtrar es una acción del CATÁLOGO. Si se toca con una herramienta abierta,
  // el filtro no tiene nada que filtrar en pantalla: hay que volver al grid o el
  // botón se siente muerto.
  const backToIndex = useCallback(() => {
    if (!onIndex) navigate("/herramientas");
  }, [onIndex, navigate]);

  const pickCategory = (id) => {
    setCategory((c) => (c === id ? null : id));
    backToIndex();
  };
  // «TODAS» es el botón de reinicio del catálogo: quita categoría Y búsqueda.
  // Antes solo hacía setCategory(null) — sin navegar — así que desde una
  // herramienta abierta se pintaba activo y no pasaba absolutamente nada.
  const showAll = () => {
    setCategory(null);
    setQuery("");
    backToIndex();
  };
  const onSearch = (v) => {
    setQuery(v);
    if (v.trim()) backToIndex();
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
  // NO se filtra. Los filtros son del catálogo; aplicarlos aquí dejaba callejones
  // sin salida — con «Metrología» puesto la lista se quedaba en dos herramientas,
  // y en móvil (donde las categorías se ocultan con una herramienta abierta) no
  // había manera de quitar el filtro. Son nueve: caben todas.
  const ordered = [
    ...TOOLS.filter((t) => favorites.includes(t.id)),
    ...TOOLS.filter((t) => !favorites.includes(t.id)),
  ];

  // En móvil la lista es una tira horizontal. Si la herramienta abierta es de
  // las últimas, arranca fuera de vista y parece que no está seleccionada.
  const navToolsRef = useRef(null);
  const activeRowRef = useRef(null);
  useEffect(() => {
    const cont = navToolsRef.current;
    const el = activeRowRef.current;
    if (!cont || !el || cont.scrollWidth <= cont.clientWidth) return;
    const cr = cont.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    cont.scrollLeft += er.left - cr.left - (cr.width - er.width) / 2;
  }, [activeTool?.id]);

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
                <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                  <input
                    value={query}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Buscar…"
                    style={field({ width: "100%", boxSizing: "border-box", fontSize: 13, padding: "9px 11px", paddingRight: query ? 32 : 11 })}
                  />
                  {/* Sin esto la única forma de vaciar la búsqueda era borrar a
                      mano, y una búsqueda olvidada filtra el catálogo entero. */}
                  {query && (
                    <button
                      onClick={showAll}
                      aria-label="Limpiar búsqueda"
                      title="Limpiar búsqueda"
                      style={{
                        position: "absolute", top: 0, right: 0, bottom: 0, width: 30,
                        background: "transparent", border: "none", borderRadius: 0,
                        color: MUTE, fontFamily: MONO, fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
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
                  <button onClick={showAll} style={catBtn(!category && !query.trim())}>
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
                <nav className="hub-nav-tools" ref={navToolsRef}>
                  {ordered.map((t) => {
                    const active = activeTool?.id === t.id;
                    // La fila activa usa el color vivo para no contradecir a la
                    // banda del encabezado; las demás, el del catálogo.
                    const rowAccent = active ? toolAccent : t.accent;
                    return (
                      <Link
                        key={t.id}
                        to={`/herramientas/${t.id}`}
                        ref={active ? activeRowRef : undefined}
                        aria-current={active ? "page" : undefined}
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
