import { PAPER, INK, MUTE, MONO, BORDER, SHADOW_SM, ACCENTS } from './theme';

const DISCORD_URL   = 'https://discord.gg/C8MjQAcuNH';
const TIKTOK_URL    = 'https://tiktok.com/@damianvlab';
const INSTAGRAM_URL = 'https://instagram.com/damianvlab';

const linkStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  color: INK, textDecoration: 'none',
  fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
};

export default function Footer() {
  return (
    <footer style={{
      borderTop: `2px solid ${INK}`,
      background: INK,
      padding: '40px 24px 32px',
      fontFamily: MONO,
      marginTop: 64,
    }}>
      <div style={{
        maxWidth: 896, margin: '0 auto',
        display: 'flex', flexWrap: 'wrap',
        alignItems: 'center', justifyContent: 'space-between', gap: 24,
      }}>
        {/* Marca + redes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, color: PAPER }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={PAPER}>
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
              </svg>
              @damianvlab
            </a>
            <span style={{ color: MUTE, fontSize: 11 }}>·</span>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, color: PAPER }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={PAPER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill={PAPER} stroke="none"/>
              </svg>
              @damianvlab
            </a>
          </div>
          <span style={{ color: '#9a9a8c', fontSize: 11, letterSpacing: '0.06em' }}>
            INDUSTRIAS MUÑECO · QUERÉTARO, MX
          </span>
        </div>

        {/* CTA Discord: botón brutalista plano */}
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '12px 22px',
            border: `2px solid ${PAPER}`,
            background: ACCENTS.blue,
            boxShadow: `4px 4px 0 ${PAPER}`,
            color: '#fff',
            fontFamily: MONO,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
            textDecoration: 'none', textTransform: 'uppercase',
            transition: 'transform 0.05s, box-shadow 0.05s',
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(4px,4px)'; e.currentTarget.style.boxShadow = `0 0 0 ${PAPER}`; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `4px 4px 0 ${PAPER}`; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `4px 4px 0 ${PAPER}`; }}
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.545 1.005A13.3 13.3 0 0 0 10.29 0c-.142.255-.308.599-.421.872a12.3 12.3 0 0 0-3.736 0A8.7 8.7 0 0 0 5.71 0a13.3 13.3 0 0 0-3.256 1.006C.355 3.834-.217 6.587.068 9.3a13.4 13.4 0 0 0 4.084 2.073 10 10 0 0 0 .87-1.424 8.7 8.7 0 0 1-1.37-.661c.115-.084.228-.172.337-.262a9.5 9.5 0 0 0 8.022 0c.11.09.222.178.337.262-.437.26-.894.482-1.371.662.252.505.542.985.87 1.424a13.4 13.4 0 0 0 4.085-2.073c.335-3.521-.568-6.245-2.387-8.296ZM5.34 7.617c-.806 0-1.465-.744-1.465-1.654s.644-1.654 1.465-1.654c.82 0 1.48.744 1.464 1.654 0 .91-.643 1.654-1.464 1.654Zm5.413 0c-.806 0-1.465-.744-1.465-1.654s.644-1.654 1.465-1.654c.82 0 1.48.744 1.464 1.654 0 .91-.643 1.654-1.464 1.654Z" fill="#fff"/>
          </svg>
          Únete al Discord
        </a>
      </div>

      <div style={{
        maxWidth: 896, margin: '28px auto 0', paddingTop: 20,
        borderTop: `1px solid ${MUTE}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ color: '#9a9a8c', fontSize: 10, letterSpacing: '0.06em' }}>
          © 2025 LA NAVAJA SUIZA DEL INGENIERO
        </span>
        <span style={{ color: '#9a9a8c', fontSize: 10, letterSpacing: '0.06em' }}>
          HERRAMIENTAS ANTI-FILTROS · GRATIS
        </span>
      </div>
    </footer>
  );
}
