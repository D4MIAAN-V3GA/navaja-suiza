import { useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { PAPER, PANEL, INK, MUTE, MONO, SANS, BORDER, SHADOW } from "./theme";

// Aviso de privacidad integral — LFPDPPP (DOF 20-mar-2025), art. 15.
// Basado en el de la rama feat/backend-pi, pero reescrito para lo que HOY hace
// `main`: no hay servidor propio; los datos llegan por Google Forms, WhatsApp,
// Mercado Pago y correo. Decir "no usamos terceros" aquí sería falso.
//
// ⚠️ PENDIENTE DE DAMIÁN (ver PENDIENTES.md → Rediseño):
//   - RESPONSABLE: la ley pide una persona física o moral, no una marca.
//   - DOMICILIO: la ley pide el domicilio del responsable.
//   - Confirmar que los campos del Google Form coinciden con la sección 2.
const RESPONSABLE = "Damián Aguilar Vega, quien opera la marca Industrias Muñeco";
const DOMICILIO = "Querétaro, Querétaro, México";
const CORREO = "contacto@industriasmuneco.com";
const VIGENCIA = "29 de septiembre de 2026";

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

const UL = ({ children }) => (
  <ul style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.7, color: INK, paddingLeft: 22, margin: "0 0 12px" }}>
    {children}
  </ul>
);

const Mail = () => (
  <a href={`mailto:${CORREO}`} style={{ color: INK, fontWeight: 700 }}>{CORREO}</a>
);

export default function Privacy() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Aviso de privacidad · Industrias Muñeco";
    return () => { document.title = prevTitle; };
  }, []);

  return (
    <div style={{ minHeight: "100dvh", background: PAPER }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px 20px", boxSizing: "border-box" }}>
        <div style={{ padding: "36px 0 0" }}>
          <Link to="/" style={{
            fontFamily: MONO, fontSize: 12, fontWeight: 700, color: INK,
            textDecoration: "none", letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            ← Volver al inicio
          </Link>
        </div>

        <div className="privacy-card" style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: "36px 32px", marginTop: 24 }}>
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
            <strong>{RESPONSABLE}</strong>, con domicilio en {DOMICILIO} y correo de contacto <Mail />,
            es responsable del tratamiento de los datos personales que nos proporcionas, conforme a la
            Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
          </P>

          <H2>2. Qué datos recabamos y cuándo</H2>
          <P><strong>Si usas las herramientas: ninguno.</strong> Los cálculos se hacen por completo dentro
            de tu navegador y nunca se envían a ningún servidor. No los vemos ni los guardamos.</P>
          <P>Solo recabamos datos cuando tú decides contactarnos:</P>
          <UL>
            <li><strong>Formulario del rescate:</strong> tu nombre, tu medio de contacto (WhatsApp o
              correo), la materia y la descripción del problema, y los archivos o fotos que compartas.</li>
            <li><strong>WhatsApp:</strong> tu número, tu nombre de perfil y lo que nos escribas o envíes.</li>
            <li><strong>Pago por Mercado Pago:</strong> el nombre y correo con que pagas, el monto y la
              fecha. <strong>Nunca vemos los datos de tu tarjeta</strong>: los procesa Mercado Pago.</li>
            <li><strong>Correo:</strong> tu dirección y lo que nos escribas.</li>
          </UL>
          <P><strong>No recabamos datos personales sensibles</strong> (salud, origen étnico, creencias,
            preferencias u otros que la ley considera sensibles). Por favor no los incluyas en tus mensajes
            ni en las fotos que envíes.</P>
          <P>Si eres menor de edad, pide a tu madre, padre o tutor que lea este aviso antes de enviarnos
            tus datos.</P>

          <H2>3. Para qué los usamos</H2>
          <P>Finalidades primarias, necesarias para darte el servicio que pediste:</P>
          <UL>
            <li>Revisar tu problema, cotizarlo y resolverlo (video o llamada).</li>
            <li>Coordinarnos contigo, cobrar y, si aplica, hacer válida la garantía.</li>
            <li>Responder tus dudas y mensajes.</li>
          </UL>
          <P>Finalidades secundarias, que no son necesarias y puedes rechazar:</P>
          <UL>
            <li>Avisarte de herramientas, contenidos o promociones nuevas.</li>
            <li>Publicar tu testimonio. <strong>Esto solo lo hacemos si nos das tu autorización
              expresa</strong>, y decides si va con tu nombre completo o no.</li>
          </UL>
          <P>Para negarte a las finalidades secundarias escríbenos a <Mail />. Negarte no afecta el servicio
            que contrataste ni tu acceso a las herramientas gratuitas.</P>

          <H2>4. Qué plataformas intervienen y con quién los compartimos</H2>
          <P>Para operar usamos servicios de terceros que tratan tus datos por cuenta nuestra y bajo sus
            propias políticas de privacidad: <strong>Google</strong> (formularios y correo),{" "}
            <strong>WhatsApp</strong> (mensajería), <strong>Mercado Pago</strong> (cobros) y{" "}
            <strong>Vercel</strong> (alojamiento del sitio).</P>
          <P><strong>No vendemos, alquilamos ni transferimos tus datos a nadie más.</strong> Si algún día
            necesitáramos hacerlo, te lo pediríamos antes y actualizaríamos este aviso.</P>

          <H2>5. Tus derechos ARCO</H2>
          <P>Tienes derecho a <strong>Acceder</strong> a tus datos, <strong>Rectificarlos</strong> si son
            inexactos, <strong>Cancelarlos</strong> y <strong>Oponerte</strong> a su uso para fines
            específicos. También puedes revocar tu consentimiento en cualquier momento.</P>
          <P>Escríbenos a <Mail /> indicando tu nombre, qué derecho quieres ejercer y el medio por el que
            nos diste tus datos (formulario, WhatsApp, correo o pago). Te respondemos en un plazo máximo de
            20 días y, si procede, lo hacemos efectivo dentro de los 15 días siguientes. El trámite es
            gratuito.</P>

          <H2>6. Cuánto tiempo los conservamos</H2>
          <P>Mientras dure el servicio y el periodo de garantía, y después solo lo necesario para cumplir
            obligaciones fiscales o legales. Los eliminamos antes si nos lo pides y no hay obligación de
            conservarlos.</P>

          <H2>7. Cookies y analítica</H2>
          <P>Este sitio <strong>no usa cookies de publicidad ni de rastreo entre sitios</strong>. Usamos la
            analítica de Vercel, que cuenta visitas de forma agregada sin identificarte. Tus herramientas
            favoritas se guardan solo en el almacenamiento local de tu navegador.</P>

          <H2>8. Cambios a este aviso</H2>
          <P>Si lo modificamos, publicaremos la versión nueva en esta misma página
            (industriasmuneco.com/privacidad) con su fecha de actualización.</P>
        </div>
      </div>
      <Footer />
    </div>
  );
}
