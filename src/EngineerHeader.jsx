import { PAPER, INK, MUTE, MONO, SANS, BORDER, SHADOW } from './theme';

const EngineerHeader = () => {
  return (
    <header style={{ padding: '52px 0 36px' }}>
      {/* Etiqueta: rectángulo negro sólido (sin píldora, sin glow) */}
      <div style={{
        display: 'inline-block',
        background: INK,
        color: PAPER,
        fontFamily: MONO,
        fontSize: 12,
        letterSpacing: 2,
        padding: '5px 12px',
        marginBottom: 22,
        textTransform: 'uppercase',
      }}>
        @damianvlab
      </div>

      {/* Título: sans pesada, sin tracking exagerado ni uppercase forzado */}
      <h1 style={{
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: 'clamp(36px, 7vw, 68px)',
        lineHeight: 1.03,
        letterSpacing: '-0.02em',
        margin: 0,
        color: INK,
        maxWidth: 760,
      }}>
        La navaja suiza del ingeniero
      </h1>

      {/* Subtítulo en tarjeta brutalista */}
      <div style={{
        marginTop: 26,
        display: 'inline-block',
        background: '#fff',
        border: BORDER,
        boxShadow: SHADOW,
        padding: '12px 18px',
      }}>
        <p style={{ fontFamily: MONO, fontSize: 14, color: MUTE, margin: 0 }}>
          Herramientas anti-filtros · el arma secreta de Industrias Muñeco.
        </p>
      </div>
    </header>
  );
};

export default EngineerHeader;
