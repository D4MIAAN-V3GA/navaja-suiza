import { Link } from "react-router-dom";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, BORDER_SOFT, SHADOW, ACCENTS, T3 } from "./theme";
import { OFFER, PASOS, TESTIMONIOS, WHATSAPP_URL, intakeHref } from "./offer";

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
//
// Esta tarjeta COMPLETA solo se usa en /rescate, donde no compite con nada, así
// que lleva todo el peso de la casa (2px + sombra dura). El landing usa
// RescueTeaser, aquí abajo.

const ACCENT = ACCENTS.green; // verde = aprobado; el rojo está reservado a lo B2B

const CIFRAS = [
  { n: OFFER.plazo, l: "entrega" },
  { n: OFFER.precio, l: OFFER.pago },
  { n: OFFER.capacidadCorta, l: "cupo real" },
];

// El teaser no tiene el párrafo de garantía de la tarjeta completa, así que el
// quita-riesgo entra como cuarta cifra. En la tarjeta completa NO se agrega:
// ahí ya está explicado abajo y saldría dos veces.
const CIFRAS_TEASER = [...CIFRAS, { n: "Garantía", l: "devuelvo tu dinero" }];

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

      {/* Salida para el que no se anima al formulario. Va en peso de nota, no de
          botón: si compite con el CTA, se llevaría a los que YA iban a llenarlo
          y cada uno de esos pasa de un formulario que se lee solo a una
          conversación que hay que atender. */}
      {WHATSAPP_URL && (
        <p style={{ fontFamily: SANS, fontSize: 12.5, color: MUTE, margin: "8px 0 0", lineHeight: 1.5 }}>
          ¿Una duda antes de mandarlo?{' '}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: INK, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            Escríbeme por WhatsApp
          </a>
          .
        </p>
      )}

      {/* Cómo funciona: ya pasó el botón, aquí está el que todavía duda. */}
      <div style={{ borderTop: BORDER_SOFT, marginTop: 18, paddingTop: 14 }}>
        <h3 style={T3({ color: INK, margin: 0 })}>Cómo funciona</h3>
        <ol style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "9px 20px" }}>
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
          PAGO POR MERCADO PAGO · COORDINACIÓN POR WHATSAPP
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
                {/* El bloqueo va primero y en gris: es el espejo donde se
                    reconoce quien está leyendo. El elogio solo cierra. */}
                {t.bloqueo && (
                  <p style={{ fontFamily: SANS, fontSize: 12.5, fontStyle: "italic", color: MUTE, lineHeight: 1.45, margin: "0 0 6px" }}>
                    Antes: «{t.bloqueo}»
                  </p>
                )}
                <p style={{ fontFamily: SANS, fontSize: 13, color: INK, lineHeight: 1.5, margin: 0 }}>«{t.texto}»</p>
                <footer style={{ fontFamily: MONO, fontSize: 11, color: MUTE, marginTop: 6 }}>
                  {t.autor}{t.detalle ? ` · ${t.detalle}` : ""}
                </footer>
                {/* La captura respalda, no sustituye: el texto se lee siempre y
                    la imagen se abre solo si alguien duda que sea real. */}
                {t.capturas?.length > 0 && (
                  <details style={{ marginTop: 6 }}>
                    <summary style={{ ...T3({ color: ACCENT }), cursor: "pointer", listStyle: "none" }}>
                      Ver {t.capturas.length > 1 ? "capturas" : "captura"}
                    </summary>
                    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                      {t.capturas.map((src) => (
                        <img
                          key={src}
                          src={src}
                          alt={`Mensaje original de WhatsApp con ${t.autor}`}
                          loading="lazy"
                          style={{ width: "100%", maxWidth: 380, border: BORDER_SOFT, display: "block" }}
                        />
                      ))}
                    </div>
                  </details>
                )}
              </blockquote>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Teaser del landing ───────────────────────────────────────────────
// MISMO diseño que la tarjeta completa —etiqueta negra, descuento verde, título
// grande, las tres cifras entre líneas, sombra dura—, solo que corto.
//
// Lo que se va NO es el diseño, es la longitud: fuera la garantía, el ancla, los
// 4 pasos y los testimonios. Todo eso convence, pero solo a quien ya se detuvo,
// y ese ya puede dar un clic a /rescate. Medida a 375px la tarjeta completa era
// ~1020px de alto (se veía el 13% en un iPhone SE); esto son ~340px.
export function RescueTeaser() {
  return (
    <div className="rescue-teaser" style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: "18px 20px" }}>

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
        ¿El problema es más grande que una calculadora?{' '}
        <strong style={{ color: INK }}>Te lo resuelvo yo</strong>, paso a paso, en video hecho
        a tu medida o llamada 1 a 1.
      </p>

      {/* Las tres cifras que deciden la compra — idénticas a la tarjeta completa */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "12px 24px",
        borderTop: BORDER_SOFT, borderBottom: BORDER_SOFT,
        padding: "12px 0", margin: "14px 0",
      }}>
        {CIFRAS_TEASER.map((c) => (
          <div key={c.l}>
            <div style={{ fontFamily: MONO, fontSize: "clamp(19px, 3.4vw, 24px)", fontWeight: 700, color: INK, lineHeight: 1.1 }}>
              {c.n}
            </div>
            <div style={T3({ marginTop: 3 })}>{c.l}</div>
          </div>
        ))}
      </div>

      {/* Dos salidas, sin clic de más. El que ya decidió va DIRECTO al
          formulario desde la portada: mandarlo primero a /rescate era fricción
          pura. El que todavía duda tiene «Ver detalles», más chico pero con
          borde de 2px, o sea visiblemente un botón y no una nota al pie. */}
      <div className="rescue-teaser-acciones" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
        <a
          className="rescue-teaser-cta"
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
        <Link
          className="rescue-teaser-alt"
          to="/rescate"
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "12px 20px", border: BORDER, background: "transparent",
            color: INK, fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
            textDecoration: "none", textTransform: "uppercase",
          }}
        >
          Ver detalles
        </Link>
      </div>
    </div>
  );
}
