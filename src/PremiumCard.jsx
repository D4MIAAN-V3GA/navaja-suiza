import { PANEL, INK, MUTE, MONO, SANS, BORDER, BORDER_THIN, SHADOW, ACCENTS } from "./theme";

// ⚠️ DESMONTADO (2026-08-13). Ya no se renderiza en ninguna parte: la Landing y
// el hub ahora venden el rescate 1 a 1 de `src/offer.js` (pago único, Mercado
// Pago, WhatsApp). Dos ofertas de pago en la misma pantalla se anulaban, y la
// suscripción de $5/mes nunca llenó los 30 lugares. Se conserva el archivo por
// si el premium vuelve como escalón posterior al rescate — si vuelve, revisar
// que no compita con la oferta principal.
//
// ── Oferta premium: fuente ÚNICA de verdad ───────────────────────────
// El mismo precio y la misma escasez que se dicen en los videos y en la bio
// tienen que aparecer aquí idénticos. Si cambia el precio, se cambia AQUÍ
// y se propaga a la Landing y al hub de herramientas.
export const KOFI_URL = "https://ko-fi.com/damianvlab/tiers";
export const PRICE = "$5 USD/mes";
export const SCARCITY = "Primeros 30 lugares";

const ACCENT = ACCENTS.pink;

const PERKS = [
  { icon: "📚", text: "Recursos y cheat sheets que nadie más tiene" },
  { icon: "❓", text: "Dudas directas conmigo, sin horario" },
  { icon: "🔧", text: "Las primeras actualizaciones de la Navaja Suiza" },
  { icon: "🎙️", text: "Llamadas y sesiones en vivo" },
];

/**
 * Tarjeta de la Zona Premium.
 * Regla de conversión: UN solo enlace en toda la tarjeta (el de Ko-fi).
 * Nada de Discord, redes ni herramientas compitiendo por el clic aquí.
 */
export default function PremiumCard({ style }) {
  return (
    <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: "22px 24px", ...style }}>

      {/* Gancho: precio y escasez en el titular, no enterrados en un párrafo */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{
          fontFamily: SANS, fontSize: "clamp(22px, 5vw, 30px)", fontWeight: 800,
          color: INK, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1,
        }}>
          Zona Premium — {PRICE}
        </h2>
        <span style={{
          background: ACCENT, color: "#fff", border: BORDER_THIN,
          fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1,
          padding: "5px 10px", textTransform: "uppercase", whiteSpace: "nowrap",
        }}>
          {SCARCITY}
        </span>
      </div>

      <p style={{ fontFamily: MONO, fontSize: 13.5, color: MUTE, lineHeight: 1.6, margin: "12px 0 18px", maxWidth: 560 }}>
        Precio de fundador para los primeros 30. Cuando se llenen los lugares, sube —
        y quien entró antes se queda con su precio.
      </p>

      {/* Beneficios escaneables: viñetas cortas, no texto corrido */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "10px 18px", marginBottom: 22 }}>
        {PERKS.map((p) => (
          <div key={p.text} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontFamily: MONO, fontSize: 13, color: INK, lineHeight: 1.45 }}>
            <span aria-hidden="true">{p.icon}</span>
            <span>{p.text}</span>
          </div>
        ))}
      </div>

      {/* CTA único */}
      <a
        href={KOFI_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: "16px 28px", border: BORDER, background: ACCENT, boxShadow: SHADOW,
          color: "#fff", fontFamily: MONO, fontSize: 15, fontWeight: 700, letterSpacing: "0.06em",
          textDecoration: "none", textTransform: "uppercase",
          transition: "transform 0.05s, box-shadow 0.05s",
        }}
        onMouseDown={(e) => { e.currentTarget.style.transform = "translate(5px,5px)"; e.currentTarget.style.boxShadow = `0 0 0 ${INK}`; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = SHADOW; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = SHADOW; }}
      >
        Únete — {PRICE} →
      </a>

      <p style={{ fontFamily: MONO, fontSize: 11, color: MUTE, margin: "12px 0 0", letterSpacing: "0.04em" }}>
        Pago seguro por Ko-fi · cancelas cuando quieras
      </p>
    </div>
  );
}
