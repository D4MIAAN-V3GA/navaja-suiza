import { Link } from "react-router-dom";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER_SOFT, T3 } from "./theme";
import { TOOLS } from "./tools";
import { getGuide } from "./data/toolGuides";
import formulas from "./data/formulas.json";
import { CALCS } from "./data/formulaCalcs";

// Riel derecho: la banda de contexto que acompaña a la calculadora.
//
// Peso visual deliberadamente bajo. Antes eran cuatro tarjetas con borde de
// 2px, sombra y cabecera en negativo: competían de tú a tú con el cálculo y la
// pantalla no dejaba claro dónde había que actuar. Ahora sólo «cómo se usa»
// está desplegado (es lo único que ayuda a arrancar); la referencia y las
// advertencias se abren si el usuario las pide.

function RailBlock({ title, children, accent }) {
  return (
    <section style={{ borderTop: `2px solid ${accent || INK}`, paddingTop: 10, marginBottom: 18 }}>
      <h2 style={T3({ margin: "0 0 9px", color: INK })}>{title}</h2>
      {children}
    </section>
  );
}

// Bloque plegable: el título se ve, el contenido sólo si hace falta.
function RailDetails({ title, children }) {
  return (
    <details style={{ borderTop: BORDER_SOFT, padding: "9px 0" }}>
      <summary
        style={{
          ...T3({ color: MUTE }),
          cursor: "pointer", listStyle: "none",
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        <span style={{ fontSize: 9 }}>▸</span>
        {title}
      </summary>
      <div style={{ paddingTop: 10 }}>{children}</div>
    </details>
  );
}

function Steps({ items, accent }) {
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((s, i) => (
        <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span
            style={{
              flexShrink: 0, width: 16, height: 16, background: accent, color: "#fff",
              fontFamily: MONO, fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {i + 1}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 12, lineHeight: 1.45, color: MUTE }}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function ToolLinks({ ids }) {
  const list = ids.map((id) => TOOLS.find((t) => t.id === id)).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {list.map((t) => (
        <Link
          key={t.id}
          to={`/herramientas/${t.id}`}
          style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
        >
          <span style={{ width: 9, height: 9, flexShrink: 0, background: t.accent }} />
          <span style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 700, color: INK }}>{t.label}</span>
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11, color: FAINT }}>→</span>
        </Link>
      ))}
    </div>
  );
}

// Riel del índice (la rejilla de herramientas): de qué va todo esto.
function IndexRail() {
  const conCalc = formulas.filter((f) => CALCS[f.id]).length;
  const stats = [
    { n: TOOLS.length, l: "herramientas" },
    { n: formulas.length, l: "fórmulas" },
    { n: conCalc, l: "se resuelven solas" },
  ];

  return (
    <>
      <RailBlock title="Qué es esto">
        <p style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.55, color: MUTE, margin: 0 }}>
          Las cuentas que te piden en la escuela y en el taller, resueltas con el
          desarrollo a la vista para que puedas entregarlas — no solo el número.
        </p>
        <p style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.5, color: FAINT, margin: "9px 0 0" }}>
          Gratis · sin registro · sin anuncios
        </p>
      </RailBlock>

      <RailBlock title="En números">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stats.map((s) => (
            <div key={s.l} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: INK, lineHeight: 1 }}>{s.n}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: MUTE }}>{s.l}</span>
            </div>
          ))}
        </div>
      </RailBlock>

      <RailBlock title="Atajos">
        <div style={{ display: "flex", flexDirection: "column", gap: 7, fontFamily: MONO, fontSize: 11, color: MUTE }}>
          <div><b style={{ color: INK }}>Ctrl/⌘ + K</b> — saltar a cualquier herramienta</div>
          <div><b style={{ color: INK }}>☆</b> — fijar favoritas hasta arriba</div>
        </div>
      </RailBlock>
    </>
  );
}

// `accent` es el color vivo de la herramienta (puede diferir del de catálogo
// cuando la herramienta cambia de color por dentro).
export default function ToolRail({ tool, accent: liveAccent }) {
  if (!tool) return <IndexRail />;

  const guide = getGuide(tool.id);
  if (!guide) return <IndexRail />;
  const accent = liveAccent || tool.accent;

  return (
    <>
      {guide.pasos?.length > 0 && (
        <RailBlock title="Cómo se usa" accent={accent}>
          <Steps items={guide.pasos} accent={accent} />
        </RailBlock>
      )}

      {guide.formulas?.length > 0 && (
        <RailDetails title="Lo que aplica por dentro">
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {guide.formulas.map((f) => (
              <div key={f.k}>
                <div style={{ fontFamily: MONO, fontSize: 9.5, color: FAINT, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>
                  {f.k}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12, color: INK, background: PANEL, border: BORDER_SOFT, padding: "5px 8px", wordBreak: "break-word" }}>
                  {f.v}
                </div>
              </div>
            ))}
          </div>
        </RailDetails>
      )}

      {guide.ojo?.length > 0 && (
        <RailDetails title="Ojo con esto">
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
            {guide.ojo.map((o, i) => (
              <li key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                <span style={{ flexShrink: 0, width: 6, height: 6, marginTop: 5, background: accent }} />
                <span style={{ fontFamily: SANS, fontSize: 12, lineHeight: 1.45, color: MUTE }}>{o}</span>
              </li>
            ))}
          </ul>
        </RailDetails>
      )}

      {guide.ver?.length > 0 && (
        <div style={{ borderTop: BORDER_SOFT, paddingTop: 12, marginTop: 6, background: PAPER }}>
          <h2 style={T3({ margin: "0 0 9px", color: MUTE })}>Sigue con</h2>
          <ToolLinks ids={guide.ver} />
        </div>
      )}
    </>
  );
}
