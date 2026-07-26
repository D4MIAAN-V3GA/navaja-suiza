import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { PAPER, PANEL, INK, MUTE, MONO, SANS, BORDER, SHADOW } from "./theme";

// Aviso de privacidad integral exigido por la LFPDPPP (arts. 15–17) por recabar
// datos personales en el formulario de la calculadora de incertidumbre.
const RESPONSABLE = "Industrias Muñeco";
const DOMICILIO = "Querétaro, Querétaro, México";
const CORREO = "contacto@industriasmuneco.com";
const VIGENCIA = "26 de julio de 2026";

const H2 = ({ children }) => (
  <h2 style={{
    fontFamily: SANS, fontSize: 15, fontWeight: 800, color: INK,
    textTransform: "uppercase", letterSpacing: "0.06em",
    borderBottom: BORDER, paddingBottom: 6, margin: "32px 0 12px",
  }}>
    {children}
  </h2>
);

const P = ({ children }) => (
  <p style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: INK, margin: "0 0 12px" }}>
    {children}
  </p>
);

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = "Aviso de privacidad — Industrias Muñeco";
    return () => { document.title = prevTitle; };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: PAPER }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px 60px", boxSizing: "border-box" }}>
        <div style={{ padding: "36px 0 0" }}>
          <Link to="/" style={{
            fontFamily: MONO, fontSize: 12, fontWeight: 700, color: INK,
            textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            ← Volver al inicio
          </Link>
        </div>

        <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: "36px 32px", marginTop: 24 }}>
          <span style={{
            display: "inline-block", background: INK, color: PAPER, fontFamily: MONO,
            fontSize: 11, fontWeight: 700, letterSpacing: 2, padding: "5px 12px",
            textTransform: "uppercase", marginBottom: 18,
          }}>
            Documento legal
          </span>

          <h1 style={{
            fontFamily: SANS, fontWeight: 800, fontSize: "clamp(28px, 5vw, 40px)",
            lineHeight: 1.1, letterSpacing: "-0.02em", color: INK, margin: "0 0 8px",
          }}>
            Aviso de privacidad
          </h1>
          <p style={{ fontFamily: MONO, fontSize: 12, color: MUTE, margin: "0 0 8px" }}>
            Última actualización: {VIGENCIA}
          </p>

          <H2>1. Quién es responsable de tus datos</H2>
          <P>
            <strong>{RESPONSABLE}</strong>, con domicilio en {DOMICILIO} y correo de contacto{" "}
            <a href={`mailto:${CORREO}`} style={{ color: INK, fontWeight: 700 }}>{CORREO}</a>, es
            responsable del tratamiento de los datos personales que nos proporcionas, conforme a la
            Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
          </P>

          <H2>2. Qué datos recabamos</H2>
          <P>
            Únicamente los que escribes en el formulario para descargar el reporte de incertidumbre:
            <strong> nombre, correo electrónico, puesto y empresa</strong>. Junto con ellos guardamos
            la fecha del envío.
          </P>
          <P>
            <strong>No recabamos datos personales sensibles</strong> (salud, origen étnico, creencias,
            situación financiera u otros de los que la ley considera sensibles). Tampoco pedimos datos
            bancarios ni contraseñas, y nunca lo haremos por este medio.
          </P>
          <P>
            Los cálculos que haces en las herramientas —tus mediciones, matrices, vectores y demás—
            se procesan <strong>por completo dentro de tu navegador y nunca se envían a ningún
            servidor</strong>. No los vemos, no los guardamos y no podríamos recuperarlos.
          </P>

          <H2>3. Para qué los usamos</H2>
          <P>Finalidades primarias, necesarias para darte el servicio que pediste:</P>
          <ul style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: INK, paddingLeft: 22, margin: "0 0 12px" }}>
            <li>Entregarte el reporte de incertidumbre que solicitaste.</li>
            <li>Responder tus dudas si nos escribes.</li>
          </ul>
          <P>Finalidades secundarias, que no son necesarias y puedes rechazar:</P>
          <ul style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: INK, paddingLeft: 22, margin: "0 0 12px" }}>
            <li>Contactarte para ofrecerte asesoría en metrología o calibración.</li>
            <li>Enviarte avisos sobre herramientas o contenidos nuevos.</li>
          </ul>
          <P>
            Para negarte a las finalidades secundarias basta con que nos escribas a{" "}
            <a href={`mailto:${CORREO}`} style={{ color: INK, fontWeight: 700 }}>{CORREO}</a>. Negarte
            no afecta en nada tu acceso a las herramientas: <strong>todas son y seguirán siendo
            gratuitas y de uso libre</strong>.
          </P>

          <H2>4. Con quién los compartimos</H2>
          <P>
            <strong>Con nadie.</strong> No vendemos, alquilamos ni transferimos tus datos a terceros.
            Se almacenan en un servidor propio, bajo nuestro control directo, no en servicios de
            terceros de marketing o publicidad.
          </P>

          <H2>5. Tus derechos ARCO</H2>
          <P>
            Tienes derecho a <strong>Acceder</strong> a tus datos, <strong>Rectificarlos</strong> si
            son inexactos, <strong>Cancelarlos</strong> cuando consideres que no se requieren, y a{" "}
            <strong>Oponerte</strong> a su uso para fines específicos. También puedes revocar tu
            consentimiento en cualquier momento.
          </P>
          <P>
            Escríbenos a <a href={`mailto:${CORREO}`} style={{ color: INK, fontWeight: 700 }}>{CORREO}</a>{" "}
            indicando qué derecho quieres ejercer y desde qué correo nos diste tus datos. Te
            responderemos en un plazo máximo de 20 días hábiles. El trámite es gratuito.
          </P>

          <H2>6. Cuánto tiempo los conservamos</H2>
          <P>
            Conservamos tus datos mientras exista una relación de interés profesional contigo, y los
            eliminamos cuando nos lo pidas o cuando dejen de ser necesarios para las finalidades
            descritas.
          </P>

          <H2>7. Cookies y rastreo</H2>
          <P>
            Este sitio <strong>no usa cookies de publicidad ni de rastreo entre sitios</strong>. Usamos
            analítica agregada de Vercel, que mide visitas sin identificarte personalmente. Tus
            herramientas favoritas se guardan únicamente en el almacenamiento local de tu propio
            navegador y nunca salen de tu dispositivo.
          </P>

          <H2>8. Cambios a este aviso</H2>
          <P>
            Si modificamos este aviso, publicaremos la versión actualizada en esta misma página y
            cambiaremos la fecha de "última actualización". Te sugerimos revisarla de vez en cuando.
          </P>
        </div>
      </div>
      <Footer />
    </div>
  );
}
