import { Link } from "react-router-dom";
import { PAPER, INK, MONO, SANS, BORDER, SHADOW_SM, textOn } from "./theme";
import { TOOLS, CATEGORIES } from "./tools";

// Encabezado común de TODA herramienta abierta. Antes cada calculadora traía
// su propio bloque de título (con numeración "03 / 05" ya desactualizada y
// anchos distintos: 560, 600, 680, 720, 860). Aquí se define una sola vez para
// que las nueve se vean como la misma app y llenen la columna central.
//
// Es identidad, no contenido: se mantiene bajo a propósito. El usuario viene a
// calcular, así que la banda no debe empujar el formulario fuera de la primera
// pantalla — de ahí que lo que entrega la herramienta vaya en una línea de
// texto y no en una fila de chips con borde.
export default function ToolFrame({ tool, guide, accent: liveAccent, isFav, toggleFav, children }) {
  // El color vivo lo manda el shell: si la herramienta cambia de color por
  // dentro, la banda lo sigue en vez de quedarse con el del catálogo.
  const accent = liveAccent || tool.accent;
  const fg = textOn(accent);
  const idx = TOOLS.findIndex((t) => t.id === tool.id) + 1;
  const num = String(idx).padStart(2, "0");
  const cat = CATEGORIES.find((c) => c.id === tool.category)?.label || "";
  const fav = isFav?.(tool.id);
  // Incertidumbre y TUR son artículos con su propio h1 (posicionan en
  // buscadores). Ahí el marco se reduce a una tira: dos h1 en la misma
  // página se pisan entre ellos.
  const prosa = guide?.ancho === "prosa";

  return (
    <section style={{ padding: "2px 0 24px" }}>
      {/* Migaja: en móvil las categorías del lateral se ocultan con una
          herramienta abierta, así que ESTE es el único camino de vuelta al
          catálogo. Iba en gris claro de 10px y sin flecha — no se leía como
          salida. Tinta plena, flecha y alto de dedo. */}
      <nav style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10, flexWrap: "wrap" }}>
        <Link
          to="/herramientas"
          style={{
            display: "inline-flex", alignItems: "center", gap: 5, minHeight: 34, padding: "4px 0",
            fontFamily: MONO, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em",
            color: INK, textDecoration: "none", textTransform: "uppercase",
          }}
        >
          ← Herramientas
        </Link>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "#9a9a8c" }}>/</span>
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: INK, textTransform: "uppercase" }}>
          {tool.label}
        </span>
      </nav>

      {/* Banda de identidad: el color de la herramienta a todo lo ancho. */}
      <header
        style={{
          background: accent,
          border: BORDER,
          boxShadow: SHADOW_SM,
          padding: prosa ? "11px 16px" : "13px 18px 15px",
          marginBottom: prosa ? 18 : 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              display: "inline-block", background: INK, color: PAPER, fontFamily: MONO,
              fontSize: 10, fontWeight: 700, letterSpacing: 1.2, padding: "3px 8px",
              textTransform: "uppercase",
            }}
          >
            {num} · {cat}
          </span>

          {toggleFav && (
            <button
              onClick={() => toggleFav(tool.id)}
              aria-label={fav ? "Quitar de favoritos" : "Marcar favorito"}
              title={fav ? "Quitar de favoritos" : "Marcar favorito"}
              style={{
                marginLeft: "auto", flexShrink: 0, cursor: "pointer",
                width: 30, height: 30, lineHeight: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: fav ? INK : "transparent",
                color: fav ? PAPER : fg,
                border: `1px solid ${fg}`, borderRadius: 0,
                fontSize: 15, padding: 0,
              }}
            >
              {fav ? "★" : "☆"}
            </button>
          )}
        </div>

        {!prosa && (
          <h1
            style={{
              fontFamily: SANS, fontWeight: 800, fontSize: "clamp(19px, 2.1vw, 26px)",
              lineHeight: 1.12, letterSpacing: "-0.015em", margin: "9px 0 0", color: fg,
            }}
          >
            {guide?.title || tool.label}
          </h1>
        )}

        {!prosa && (
          <p style={{ fontFamily: MONO, fontSize: 11.5, lineHeight: 1.45, margin: "5px 0 0", color: fg, opacity: fg === "#ffffff" ? 0.85 : 0.72 }}>
            {guide?.sub || tool.desc}
            {guide?.entrega?.length > 0 && (
              // En móvil se oculta (index.css): ocupa tres renglones de una
              // pantalla chica para decir algo que la herramienta ya enseña.
              <span className="tf-entrega" style={{ opacity: 0.85 }}>
                <br />
                Te da: {guide.entrega.join(" · ")}
              </span>
            )}
          </p>
        )}
      </header>

      {children}
    </section>
  );
}
