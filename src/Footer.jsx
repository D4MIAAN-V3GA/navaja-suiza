import { Link } from 'react-router-dom';
import { PAPER, MONO, SANS, ACCENTS } from './theme';

// Pie de página — rediseño (rama `redesing`).
// Antes: dos redes repetidas del bloque «Conecta», un botón de Discord (tercera
// vez en la página), el copyright a nombre de «La Navaja Suiza» y cero enlaces
// legales. Ahora: mismo ancho que el contenido (1120), marca correcta, mapa del
// sitio y el aviso de privacidad que exige la LFPDPPP por recabar datos.

const CONTACT_EMAIL = 'contacto@industriasmuneco.com';
const SOFT = '#b9b6a8';   // texto secundario sobre tinta (contraste ≥ 7:1)
const DIM = '#8d8a7e';

const COLUMNS = [
  {
    title: 'Sitio',
    links: [
      { label: 'Herramientas', to: '/herramientas' },
      { label: 'Rescate 1 a 1', to: '/rescate' },
      { label: 'Para industria', to: '/#industria' },
    ],
  },
  {
    title: 'Comunidad',
    links: [
      { label: 'Discord', href: 'https://discord.gg/C8MjQAcuNH' },
      { label: 'Instagram', href: 'https://instagram.com/damianvlab' },
      { label: 'TikTok', href: 'https://tiktok.com/@damianvlab' },
      { label: 'YouTube', href: 'https://www.youtube.com/@damian.project' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/damianvlab' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Aviso de privacidad', to: '/privacidad' },
      { label: 'Contacto', href: `mailto:${CONTACT_EMAIL}` },
    ],
  },
];

const linkStyle = {
  color: PAPER, textDecoration: 'none', fontFamily: SANS, fontSize: 14, lineHeight: 1.9,
};

function FooterLink({ label, to, href }) {
  if (to) return <Link to={to} style={linkStyle}>{label}</Link>;
  const external = href.startsWith('http');
  return (
    <a href={href} style={linkStyle} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {label}
    </a>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: '#161616', color: PAPER, marginTop: 72, padding: '44px 24px 28px' }}>
      <div className="footer-grid" style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 20, letterSpacing: '-0.01em' }}>
            Industrias Muñeco
          </div>
          <p style={{ fontFamily: SANS, fontSize: 14, color: SOFT, lineHeight: 1.6, margin: '8px 0 14px', maxWidth: 320 }}>
            Herramientas gratis para ingenieros y estudiantes, y rescates 1 a 1 cuando el problema es
            más grande que una calculadora.
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ fontFamily: MONO, fontSize: 13, color: PAPER, fontWeight: 700 }}>
            {CONTACT_EMAIL}
          </a>
          <div style={{ fontFamily: MONO, fontSize: 11, color: DIM, letterSpacing: '0.08em', marginTop: 10 }}>
            QUERÉTARO, MÉXICO
          </div>
        </div>

        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: ACCENTS.yellow, textTransform: 'uppercase', marginBottom: 8 }}>
              {c.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {c.links.map((l) => <FooterLink key={l.label} {...l} />)}
            </div>
          </nav>
        ))}
      </div>

      <div style={{
        maxWidth: 1120, margin: '32px auto 0', paddingTop: 18, borderTop: '1px solid #3a3a36',
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        fontFamily: MONO, fontSize: 11, color: DIM, letterSpacing: '0.06em',
      }}>
        <span>© {new Date().getFullYear()} INDUSTRIAS MUÑECO · LA NAVAJA SUIZA DEL INGENIERO</span>
        <span>LOS CÁLCULOS NUNCA SALEN DE TU NAVEGADOR</span>
      </div>
    </footer>
  );
}
