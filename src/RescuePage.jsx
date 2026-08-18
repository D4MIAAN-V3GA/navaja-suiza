import { Link } from 'react-router-dom';
import Footer from './Footer';
import RescueCard from './RescueCard';
import { OFFER } from './offer';
import { PAPER, INK, MUTE, MONO, SANS, BORDER_SOFT } from './theme';

// Página dedicada de la oferta.
//
// Existe porque en el landing la tarjeta completa medía ~1020px de alto en un
// teléfono: se veía el 13% de ella y tapaba la rejilla de herramientas. Aquí no
// compite con nada, así que puede ser todo lo larga que el argumento necesite —
// y los pasos van abiertos, no plegados.
//
// Además es una URL propia: sirve para la bio de IG/TikTok y para mandarla por
// WhatsApp sin arrastrar a nadie por toda la portada.
export default function RescuePage() {
  return (
    <div style={{ minHeight: '100dvh', background: PAPER, color: INK, fontFamily: SANS }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 16px' }}>

        <header style={{ padding: '26px 0 20px' }}>
          <Link
            to="/"
            style={{
              fontFamily: MONO, fontSize: 12, color: MUTE, textDecoration: 'none',
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}
          >
            ← Industrias Muñeco
          </Link>
        </header>

        <RescueCard />

        {/* El que llegó hasta abajo y no dio clic tiene UNA de estas dos dudas.
            No es una sección de FAQ: son dos objeciones, y ya. */}
        <section style={{ borderTop: BORDER_SOFT, marginTop: 34, paddingTop: 22, paddingBottom: 40 }}>
          <h2 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: INK, margin: '0 0 14px' }}>
            Dos dudas que siempre me llegan
          </h2>

          <h3 style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 800, color: INK, margin: '0 0 5px' }}>
            ¿Me lo resuelves o me lo explicas?
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 14, color: MUTE, lineHeight: 1.6, margin: '0 0 16px' }}>
            Las dos cosas, y en ese orden: te llega resuelto paso a paso y con el porqué de
            cada paso, para que lo puedas defender si te preguntan en clase. Copiar un
            resultado no te saca del siguiente examen.
          </p>

          <h3 style={{ fontFamily: SANS, fontSize: 14.5, fontWeight: 800, color: INK, margin: '0 0 5px' }}>
            ¿Y si sigo sin entenderle?
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 14, color: MUTE, lineHeight: 1.6, margin: 0 }}>
            {OFFER.garantia} Sin discutir y sin letra chica: sé lo que es pagar por algo que
            no te sirvió.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
