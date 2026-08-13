import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, BORDER_SOFT, SHADOW, ACCENTS, T3 } from "./theme";
import { OFFER, PASOS, TESTIMONIOS, intakeHref } from "./offer";

// Tarjeta de la oferta "De Atorado a Aprobado".
//
// Es el ÚNICO elemento de la Landing con borde de 2px + sombra dura: en toda la
// página hay una sola acción que cuesta dinero y tiene que leerse de un vistazo
// dónde está. Todo lo demás (catálogo, industria, redes) baja de peso a línea
// suave para no competir con ella.
//
// ORDEN, y por qué: promesa → cifras → garantía → BOTÓN → cómo funciona.
// La mayoría del tráfico llega de TikTok/IG, o sea en teléfono. Con los cuatro
// pasos arriba, el botón caía a 827px del inicio de la tarjeta — más de una
// pantalla de iPhone antes de ver el CTA. Quien llega quiere saber qué recibe,
// cuánto cuesta y cuándo le llega; los pasos son para el que sigue dudando
// después, y por eso van debajo del botón.
//
// Regla de conversión heredada del premium: UN solo enlace en toda la tarjeta.

const ACCENT = ACCENTS.green; // verde = aprobado; el rojo está reservado a lo B2B

const CIFRAS = [
  { n: OFFER.plazo, l: "entrega" },
  { n: OFFER.precio, l: OFFER.pago },
  { n: "2 / sem", l: "cupo real" },
];

export default function RescueCard({ style }) {
  return (
    <div className="rescue-card" style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: "20px 22px", ...style }}>

      {/* Nombre de la oferta + escasez, en la misma línea */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <span style={{
          background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700,
          letterSpacing: 1, padding: "4px 10px", textTransform: "uppercase",
        }}>
          Rescate 1 a 1
        </span>
        <span style={{
          background: ACCENT, color: "#fff", border: BORDER_THIN,
          fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1,
          padding: "4px 10px", textTransform: "uppercase", whiteSpace: "nowrap",
        }}>
          {OFFER.descuento}
        </span>
      </div>

      <h2 style={{
        fontFamily: SANS, fontSize: "clamp(24px, 5vw, 34px)", fontWeight: 800,
        color: INK, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.08,
      }}>
        {OFFER.nombre}
      </h2>

      <p style={{ fontFamily: SANS, fontSize: 14.5, color: MUTE, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 580 }}>
        Me mandas el problema que te tiene trabado y te llega resuelto paso a paso:{' '}
        <strong style={{ color: INK }}>video hecho a tu medida</strong> o{' '}
        <strong style={{ color: INK }}>llamada 1 a 1</strong>. No un curso de 40 horas para el
        tema que necesitas hoy.
      </p>

      {/* Las tres cifras que deciden la compra, con peso de dato */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "12px 24px",
        borderTop: BORDER_SOFT, borderBottom: BORDER_SOFT,
        padding: "12px 0", margin: "14px 0",
      }}>
        {CIFRAS.map((c) => (
          <div key={c.l}>
            <div style={{ fontFamily: MONO, fontSize: "clamp(19px, 3.4vw, 24px)", fontWeight: 700, color: INK, lineHeight: 1.1 }}>
              {c.n}
            </div>
            <div style={T3({ marginTop: 3 })}>{c.l}</div>
          </div>
        ))}
      </div>

      {/* Garantía: quita el riesgo justo antes del botón */}
      <p style={{ fontFamily: SANS, fontSize: 13, color: INK, lineHeight: 1.5, margin: "0 0 16px", borderLeft: `3px solid ${ACCENT}`, paddingLeft: 11 }}>
        <strong>Garantía:</strong> {OFFER.garantia}
      </p>

      {/* CTA único. En móvil se va a ancho completo (ver index.css). */}
      <a
        className="rescue-cta"
        href={intakeHref()}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
          padding: "16px 28px", border: BORDER, background: ACCENT, boxShadow: SHADOW,
          color: "#fff", fontFamily: MONO, fontSize: 15, fontWeight: 700, letterSpacing: "0.06em",
          textDecoration: "none", textTransform: "uppercase",
          transition: "transform 0.05s, box-shadow 0.05s",
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = "translate(5px,5px)"; e.currentTarget.style.boxShadow = `0 0 0 ${INK}`; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = SHADOW; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = SHADOW; }}
      >
        Manda tu problema →
      </a>

      <p style={{ fontFamily: SANS, fontSize: 12.5, color: MUTE, margin: "12px 0 0", lineHeight: 1.5, maxWidth: 560 }}>
        {OFFER.ancla} Los primeros 5 rescates llevan 20% de descuento {OFFER.descuentoNota}.
      </p>

      {/* Cómo funciona: ya pasó el botón, aquí está el que todavía duda */}
      <div style={{ borderTop: BORDER_SOFT, marginTop: 18, paddingTop: 14 }}>
        <h3 style={T3({ color: INK, margin: "0 0 10px" })}>Cómo funciona</h3>
        <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "9px 20px" }}>
          {PASOS.map((p, i) => (
            <li key={p.t} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
              <span style={{
                flexShrink: 0, width: 17, height: 17, background: ACCENT, color: "#fff",
                fontFamily: MONO, fontSize: 10, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {i + 1}
              </span>
              <span style={{ lineHeight: 1.4 }}>
                <span style={{ fontFamily: SANS, fontSize: 13.5, fontWeight: 800, color: INK }}>{p.t}</span>
                <span style={{ display: "block", fontFamily: SANS, fontSize: 12.5, color: MUTE, marginTop: 2 }}>{p.d}</span>
              </span>
            </li>
          ))}
        </ol>
        <p style={{ fontFamily: MONO, fontSize: 11, color: FAINT, margin: "12px 0 0", letterSpacing: "0.04em" }}>
          {OFFER.capacidad.toUpperCase()} · PAGO POR MERCADO PAGO · COORDINACIÓN POR WHATSAPP
        </p>
      </div>

      {/* Prueba social. Sin testimonios autorizados no se pinta nada: es mejor
          no tenerla que inventarla. Se llenan en TESTIMONIOS (src/offer.js). */}
      {TESTIMONIOS.length > 0 && (
        <div style={{ borderTop: BORDER_SOFT, marginTop: 16, paddingTop: 14 }}>
          <h3 style={T3({ color: INK, margin: "0 0 10px" })}>Ya rescatados</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 14 }}>
            {TESTIMONIOS.map((t) => (
              <blockquote key={t.autor} style={{ margin: 0, borderLeft: `3px solid ${ACCENT}`, paddingLeft: 11 }}>
                <p style={{ fontFamily: SANS, fontSize: 13, color: INK, lineHeight: 1.5, margin: 0 }}>«{t.texto}»</p>
                <footer style={{ fontFamily: MONO, fontSize: 11, color: MUTE, marginTop: 6 }}>
                  {t.autor}{t.detalle ? ` · ${t.detalle}` : ""}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
