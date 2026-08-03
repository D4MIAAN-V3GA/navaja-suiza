import { Link } from 'react-router-dom';
import Footer from './Footer';
import PremiumCard from './PremiumCard';
import { TOOLS } from './tools';
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, SHADOW, SHADOW_SM, ACCENTS, textOn } from './theme';

// Catálogo para la portada: todo menos las herramientas B2B, que tienen su propia sección aparte.
const GRID_TOOLS = TOOLS.filter((t) => t.id !== 'incertidumbre' && t.id !== 'tur');

// ─────────────────────────────────────────────────────────────
const YOUTUBE_URL   = 'https://www.youtube.com/@damian.project';
const CONTACT_EMAIL = 'contacto@industriasmuneco.com';          // confirmado 2026-08
// ─────────────────────────────────────────────────────────────
const DISCORD_URL   = 'https://discord.gg/C8MjQAcuNH';
const TIKTOK_URL    = 'https://tiktok.com/@damianvlab';
const INSTAGRAM_URL = 'https://instagram.com/damianvlab';
const LINKEDIN_URL  = 'https://www.linkedin.com/in/damianvlab';

// ── Iconos (reciben el color del trazo según el bloque donde van) ──
const ICONS = {
  discord: (c) => (
    <svg width="18" height="14" viewBox="0 0 16 12" fill={c} xmlns="http://www.w3.org/2000/svg">
      <path d="M13.545 1.005A13.3 13.3 0 0 0 10.29 0c-.142.255-.308.599-.421.872a12.3 12.3 0 0 0-3.736 0A8.7 8.7 0 0 0 5.71 0a13.3 13.3 0 0 0-3.256 1.006C.355 3.834-.217 6.587.068 9.3a13.4 13.4 0 0 0 4.084 2.073 10 10 0 0 0 .87-1.424 8.7 8.7 0 0 1-1.37-.661c.115-.084.228-.172.337-.262a9.5 9.5 0 0 0 8.022 0c.11.09.222.178.337.262-.437.26-.894.482-1.371.662.252.505.542.985.87 1.424a13.4 13.4 0 0 0 4.085-2.073c.335-3.521-.568-6.245-2.387-8.296ZM5.34 7.617c-.806 0-1.465-.744-1.465-1.654s.644-1.654 1.465-1.654c.82 0 1.48.744 1.464 1.654 0 .91-.643 1.654-1.464 1.654Zm5.413 0c-.806 0-1.465-.744-1.465-1.654s.644-1.654 1.465-1.654c.82 0 1.48.744 1.464 1.654 0 .91-.643 1.654-1.464 1.654Z"/>
    </svg>
  ),
  instagram: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill={c} stroke="none"/>
    </svg>
  ),
  tiktok: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={c}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  ),
  youtube: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={c}>
      <path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.5 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.5 12 31 31 0 0 0 23 7.5ZM9.75 15.02V8.98L15.5 12l-5.75 3.02Z"/>
    </svg>
  ),
  linkedin: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={c}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z"/>
    </svg>
  ),
  email: (c) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m2 6 10 7 10-7"/>
    </svg>
  ),
};

// Enlaces del "linktree" — orden intencional, cada uno con su color.
const LINKS = [
  // El Discord es el escalón de entrada del premium, no una oferta que le compita.
  { key: 'discord',   label: 'Discord',   sub: 'Gratis · empieza aquí', href: DISCORD_URL, external: true, color: ACCENTS.blue },
  { key: 'instagram', label: 'Instagram', sub: '@damianvlab',     href: INSTAGRAM_URL, external: true,  color: ACCENTS.pink },
  { key: 'tiktok',    label: 'TikTok',    sub: '@damianvlab',     href: TIKTOK_URL,    external: true,  color: ACCENTS.cyan },
  { key: 'youtube',   label: 'YouTube',   sub: '@damian.project', href: YOUTUBE_URL,   external: true,  color: ACCENTS.red },
  { key: 'linkedin',  label: 'LinkedIn',  sub: 'damianvlab',      href: LINKEDIN_URL,  external: true,  color: ACCENTS.orange },
  { key: 'email',     label: 'Contacto',  sub: 'Marcas y colabs', href: `mailto:${CONTACT_EMAIL}`, external: false, color: ACCENTS.green },
];

// Botón de enlace: bloque de icono con color por red (brutalista, diferenciado).
function LinkButton({ icon, label, sub, href, external, color }) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 16px',
        border: BORDER, background: PANEL, boxShadow: SHADOW_SM,
        color: INK, textDecoration: 'none',
        transition: 'transform 0.05s, box-shadow 0.05s',
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = `0 0 0 ${INK}`; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SHADOW_SM; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SHADOW_SM; }}
    >
      <span style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 40, height: 40, flexShrink: 0,
        background: color, border: BORDER_THIN,
      }}>
        {icon(textOn(color))}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
        <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800 }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: MUTE, letterSpacing: '0.04em' }}>{sub}</span>
      </span>
    </a>
  );
}

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: PAPER, color: INK, fontFamily: SANS }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 16px' }}>

        {/* ── Hero de marca: corto, invita a acercarse ── */}
        <header style={{ padding: '52px 0 32px' }}>
          <div style={{
            display: 'inline-block', background: INK, color: PAPER,
            fontFamily: MONO, fontSize: 12, letterSpacing: 2,
            padding: '5px 12px', marginBottom: 20, textTransform: 'uppercase',
          }}>
            Industrias Muñeco · @damianvlab
          </div>

          <h1 style={{
            fontFamily: SANS, fontWeight: 800,
            fontSize: 'clamp(34px, 7vw, 60px)',
            lineHeight: 1.04, letterSpacing: '-0.02em',
            margin: 0, color: INK,
          }}>
            La navaja suiza del ingeniero
          </h1>

          <p style={{ fontFamily: MONO, fontSize: 14, color: MUTE, margin: '16px 0 0', lineHeight: 1.6, maxWidth: 560 }}>
            Calculadoras que resuelven tu problema de ingeniería en segundos — y te enseñan
            el procedimiento, para que lo puedas defender en el examen. Gratis y sin registro.
          </p>

          {/* Prueba social: la escasez del premium solo es creíble si antes hay demanda */}
          <p style={{ fontFamily: MONO, fontSize: 12, color: MUTE, margin: '14px 0 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            +300 ingenieros en el Discord · {TOOLS.length} herramientas · 0 registros
          </p>

          {/* Un solo CTA primario; "Colaboremos" baja a enlace de texto (las marcas lo
              buscan en SOBRE MÍ, donde sigue teniendo su botón completo). */}
          <div style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
            <Link
              to="/herramientas"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '15px 26px', border: BORDER, background: INK, boxShadow: SHADOW, color: PAPER,
                fontFamily: MONO, fontSize: 14, fontWeight: 700, letterSpacing: '0.06em',
                textDecoration: 'none', textTransform: 'uppercase',
                transition: 'transform 0.05s, box-shadow 0.05s',
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(5px,5px)'; e.currentTarget.style.boxShadow = `0 0 0 ${INK}`; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SHADOW; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SHADOW; }}
            >
              Abrir herramientas →
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Colaboración con Industrias Muñeco`}
              style={{
                fontFamily: MONO, fontSize: 13, color: MUTE,
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}
            >
              ¿Eres una marca? Colaboremos
            </a>
          </div>
        </header>

        {/* ── Zona Premium: segunda sección, arriba del catálogo gratis ── */}
        <section style={{ padding: '4px 0 12px' }}>
          <span style={{ display: 'inline-block', background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: '4px 10px', marginBottom: 16 }}>
            ZONA PREMIUM
          </span>
          <PremiumCard />
        </section>

        {/* ── Herramientas ── */}
        <section style={{ paddingBottom: 12 }}>
          <span style={{ display: 'inline-block', background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: '4px 10px', marginBottom: 16 }}>
            {GRID_TOOLS.length} HERRAMIENTAS · GRATIS
          </span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 230px), 1fr))',
            gap: 14,
          }}>
            {GRID_TOOLS.map((t, i) => (
              <Link key={t.id} to={`/herramientas/${t.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: PANEL, border: BORDER, boxShadow: SHADOW_SM,
                  padding: '14px 16px', height: '100%', boxSizing: 'border-box',
                  display: 'flex', flexDirection: 'column', gap: 5,
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: t.accent }}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: INK }}>{t.label}</span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: MUTE, lineHeight: 1.5 }}>{t.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Sobre mí: gancho personal para seguidores y marcas ── */}
        <section style={{ padding: '40px 0 0' }}>
          <span style={{ display: 'inline-block', background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: '4px 10px', marginBottom: 16 }}>
            SOBRE MÍ
          </span>
          <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: '20px 22px' }}>
            <h2 style={{ fontFamily: SANS, fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, margin: '0 0 10px', color: INK, letterSpacing: '-0.01em' }}>
              Ingeniero en metrología + creador de contenido
            </h2>
            <p style={{ fontFamily: MONO, fontSize: 13.5, color: MUTE, lineHeight: 1.65, margin: 0 }}>
              Hago ingeniería con humor. En mi Discord y mis historias le regalo valor real a mi comunidad —
              sin filtros, sin paywalls, sin humo. <strong style={{ color: INK }}>Industrias Muñeco</strong> es mi marca:
              herramientas, contenido y una comunidad de ingenieros y estudiantes que de verdad usa lo que comparto.
            </p>
            <p style={{ fontFamily: MONO, fontSize: 13.5, color: INK, lineHeight: 1.6, margin: '14px 0 16px', fontWeight: 700 }}>
              ¿Eres una marca? Trabajo patrocinios y colaboraciones.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Colaboración con Industrias Muñeco`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '12px 22px', border: BORDER, background: PAPER, boxShadow: SHADOW_SM, color: INK,
                fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
                textDecoration: 'none', textTransform: 'uppercase',
                transition: 'transform 0.05s, box-shadow 0.05s',
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = `0 0 0 ${INK}`; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SHADOW_SM; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SHADOW_SM; }}
            >
              Colaboremos →
            </a>
          </div>
        </section>

        {/* ── Para industria: herramientas B2B, aparte del catálogo de estudiantes ── */}
        <section style={{ padding: '40px 0 0' }}>
          <span style={{ display: 'inline-block', background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: '4px 10px', marginBottom: 16 }}>
            PARA INDUSTRIA
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 14 }}>
            <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: '20px 22px' }}>
              <h2 style={{ fontFamily: SANS, fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, margin: '0 0 10px', color: INK, letterSpacing: '-0.01em' }}>
                Presupuesto de incertidumbre (GUM)
              </h2>
              <p style={{ fontFamily: MONO, fontSize: 13.5, color: MUTE, lineHeight: 1.65, margin: '0 0 16px' }}>
                Calculadora y guía para laboratorios y áreas de calidad: evaluación Tipo A y Tipo B,
                suma en cuadratura e incertidumbre expandida U (k=2), con el procedimiento paso a paso.
              </p>
              <Link
                to="/herramientas/incertidumbre"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '12px 22px', border: BORDER, background: ACCENTS.red, boxShadow: SHADOW_SM, color: '#fff',
                  fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
                  textDecoration: 'none', textTransform: 'uppercase',
                  transition: 'transform 0.05s, box-shadow 0.05s',
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = `0 0 0 ${INK}`; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SHADOW_SM; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SHADOW_SM; }}
              >
                Abrir calculadora →
              </Link>
            </div>

            <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: '20px 22px' }}>
              <h2 style={{ fontFamily: SANS, fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800, margin: '0 0 10px', color: INK, letterSpacing: '-0.01em' }}>
                TUR / TAR: ¿tu patrón es apto para calibrar?
              </h2>
              <p style={{ fontFamily: MONO, fontSize: 13.5, color: MUTE, lineHeight: 1.65, margin: '0 0 16px' }}>
                No hagas la cuenta a mano — dame los datos de tu instrumento y tu patrón, y te digo si pasa
                la regla 4:1, con veredicto y procedimiento incluido.
              </p>
              <Link
                to="/herramientas/tur"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '12px 22px', border: BORDER, background: ACCENTS.brown, boxShadow: SHADOW_SM, color: '#fff',
                  fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
                  textDecoration: 'none', textTransform: 'uppercase',
                  transition: 'transform 0.05s, box-shadow 0.05s',
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = `0 0 0 ${INK}`; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SHADOW_SM; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = SHADOW_SM; }}
              >
                Abrir calculadora →
              </Link>
            </div>
          </div>
        </section>

        {/* ── Enlaces (linktree): ordenados, mismo nivel, no invasivos ── */}
        <section style={{ padding: '36px 0 52px' }}>
          <span style={{ display: 'inline-block', background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: '4px 10px', marginBottom: 16 }}>
            CONECTA
          </span>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
            gap: 12,
          }}>
            {LINKS.map((l) => (
              <LinkButton key={l.key} icon={ICONS[l.key]} label={l.label} sub={l.sub} href={l.href} external={l.external} color={l.color} />
            ))}
          </div>
          <p style={{ fontFamily: MONO, fontSize: 11, color: FAINT, marginTop: 22, letterSpacing: '0.06em' }}>
            INDUSTRIAS MUÑECO · QUERÉTARO, MX · industriasmuneco.com
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
