const DISCORD_URL   = 'https://discord.gg/C8MjQAcuNH';
const TIKTOK_URL    = 'https://tiktok.com/@damianvlab';
const INSTAGRAM_URL = 'https://instagram.com/damianvlab';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.05)',
      backgroundColor: '#0a0c10',
      padding: '40px 24px 32px',
      fontFamily: "'Space Mono', monospace",
    }}>
      <div style={{
        maxWidth: 896,
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}>

        {/* Marca */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {/* TikTok */}
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: '#9D9DFF', textDecoration: 'none',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.1em',
                textShadow: '0 0 8px rgba(157,157,255,0.5)',
              }}
            >
              {/* TikTok icon */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#9D9DFF">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
              </svg>
              @damianvlab
            </a>
            <span style={{ color: '#374151', fontSize: 11 }}>·</span>
            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                color: '#9D9DFF', textDecoration: 'none',
                fontSize: 13, fontWeight: 700, letterSpacing: '0.1em',
                textShadow: '0 0 8px rgba(157,157,255,0.5)',
              }}
            >
              {/* Instagram icon */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9D9DFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="#9D9DFF" stroke="none"/>
              </svg>
              @damianvlab
            </a>
          </div>
          <span style={{ color: '#374151', fontSize: 11, letterSpacing: '0.08em' }}>
            INDUSTRIAS MUÑECO · QUERÉTARO, MX
          </span>
        </div>

        {/* CTA Discord */}
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 22px',
            borderRadius: 999,
            border: '1px solid rgba(157,157,255,0.4)',
            background: 'linear-gradient(135deg, rgba(157,157,255,0.12), rgba(157,157,255,0.04))',
            color: '#9D9DFF',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textDecoration: 'none',
            textTransform: 'uppercase',
            textShadow: '0 0 8px rgba(157,157,255,0.6)',
            boxShadow: '0 0 16px rgba(157,157,255,0.15)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 0 28px rgba(157,157,255,0.35)';
            e.currentTarget.style.borderColor = 'rgba(157,157,255,0.7)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 0 16px rgba(157,157,255,0.15)';
            e.currentTarget.style.borderColor = 'rgba(157,157,255,0.4)';
          }}
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.545 1.005A13.3 13.3 0 0 0 10.29 0c-.142.255-.308.599-.421.872a12.3 12.3 0 0 0-3.736 0A8.7 8.7 0 0 0 5.71 0a13.3 13.3 0 0 0-3.256 1.006C.355 3.834-.217 6.587.068 9.3a13.4 13.4 0 0 0 4.084 2.073 10 10 0 0 0 .87-1.424 8.7 8.7 0 0 1-1.37-.661c.115-.084.228-.172.337-.262a9.5 9.5 0 0 0 8.022 0c.11.09.222.178.337.262-.437.26-.894.482-1.371.662.252.505.542.985.87 1.424a13.4 13.4 0 0 0 4.085-2.073c.335-3.521-.568-6.245-2.387-8.296ZM5.34 7.617c-.806 0-1.465-.744-1.465-1.654s.644-1.654 1.465-1.654c.82 0 1.48.744 1.464 1.654 0 .91-.643 1.654-1.464 1.654Zm5.413 0c-.806 0-1.465-.744-1.465-1.654s.644-1.654 1.465-1.654c.82 0 1.48.744 1.464 1.654 0 .91-.643 1.654-1.464 1.654Z" fill="#9D9DFF"/>
          </svg>
          Únete al Discord
        </a>

      </div>

      {/* Línea inferior */}
      <div style={{
        maxWidth: 896,
        margin: '28px auto 0',
        paddingTop: 20,
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <span style={{ color: '#1f2937', fontSize: 10, letterSpacing: '0.08em' }}>
          © 2025 LA NAVAJA SUIZA DEL INGENIERO
        </span>
        <span style={{ color: '#1f2937', fontSize: 10, letterSpacing: '0.08em' }}>
          HERRAMIENTAS ANTI-FILTROS · GRATIS
        </span>
      </div>
    </footer>
  );
}
