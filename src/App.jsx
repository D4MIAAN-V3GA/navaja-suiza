import { useState } from 'react';
import EngineerHeader from './EngineerHeader';
import Footer from './Footer';
import EquationSolver from './EquationSolver';
import VectorCalculator from './VectorCalculator';
import InertiaCalculator from './InertiaCalculator';
import LinearInterpolator from './LinearInterpolator';
import UnitConverter from './UnitConverter';

const tools = [
  { label: 'Ecuaciones',    component: EquationSolver,     defaultAccent: '#00ffb4' },
  { label: 'Vectores',      component: VectorCalculator,   defaultAccent: '#00ffb4' },
  { label: 'Inercia',       component: InertiaCalculator,  defaultAccent: '#00ffb4' },
  { label: 'Interpolación', component: LinearInterpolator, defaultAccent: '#00ffb4' },
  { label: 'Unidades',      component: UnitConverter,      defaultAccent: '#00ffb4' },
];

// Paleta base del nav
const C_HOVER    = [100, 210, 255];
const C_INACTIVE = [157, 157, 255];

function hexRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

function App() {
  const [active, setActive]         = useState(0);
  const [hovered, setHovered]       = useState(null);
  const [activeAccent, setActiveAccent] = useState(tools[0].defaultAccent);

  const ActiveTool = tools[active].component;

  const handleSwitch = (i) => {
    setActive(i);
    setActiveAccent(tools[i].defaultAccent); // reset inmediato al cambiar herramienta
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen text-gray-100 font-sans"
      style={{ background: '#0d1117' }}
    >
      {/* Dot grid único para toda la página */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Glow superior muy tenue */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '50vh',
        background: 'radial-gradient(ellipse 110% 100% at 50% -20%, rgba(0,255,180,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <EngineerHeader />

      {/* Nav sticky */}
      <div className="sticky top-0 z-50" style={{ background: 'transparent' }}>
        <nav
          className="max-w-4xl mx-auto flex items-center justify-evenly overflow-x-auto"
          style={{ padding: '20px 24px 26px', gap: 10 }}
        >
          {tools.map((tool, i) => {
            const isActive  = active === i;
            const isHovered = hovered === i && !isActive;

            // Botón activo usa el accent del sub-módulo actual; los demás usan paleta fija
            const [r, g, b] = isActive
              ? hexRgb(activeAccent)
              : isHovered
              ? C_HOVER
              : C_INACTIVE;

            const bg    = `rgba(${r},${g},${b},${isActive ? 0.13 : isHovered ? 0.08 : 0.04})`;
            const bord  = `rgba(${r},${g},${b},${isActive ? 0.65 : isHovered ? 0.40 : 0.16})`;
            const color = `rgba(${r},${g},${b},${isActive ? 1    : isHovered ? 0.88 : 0.48})`;

            const shadow = isActive
              ? `0 0 24px rgba(${r},${g},${b},0.30), 0 4px 16px rgba(${r},${g},${b},0.10), 0 2px 10px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)`
              : isHovered
              ? `0 4px 14px rgba(${r},${g},${b},0.12), 0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)`
              : `0 2px 8px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)`;

            const textShadow = isActive
              ? `0 0 10px rgba(${r},${g},${b},0.95), 0 0 28px rgba(${r},${g},${b},0.40)`
              : isHovered
              ? `0 0 8px rgba(${r},${g},${b},0.50)`
              : 'none';

            return (
              <button
                key={i}
                onClick={() => handleSwitch(i)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  fontFamily:           "'Space Mono', monospace",
                  fontSize:             11,
                  letterSpacing:        '0.13em',
                  textTransform:        'uppercase',
                  whiteSpace:           'nowrap',
                  padding:              '10px 24px',
                  borderRadius:         999,
                  border:               `1px solid ${bord}`,
                  color,
                  background:           bg,
                  textShadow,
                  boxShadow:            shadow,
                  backdropFilter:       'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  outline:              'none',
                  cursor:               'pointer',
                  transition:           'all 0.28s ease',
                }}
              >
                <span style={{
                  marginRight: 5,
                  opacity:     isActive ? 1 : isHovered ? 0.62 : 0.28,
                  textShadow:  isActive ? `0 0 14px rgba(${r},${g},${b},1)` : 'none',
                  transition:  'all 0.28s ease',
                }}>
                  {String(i + 1).padStart(2, '0')}.
                </span>
                {tool.label}
              </button>
            );
          })}
        </nav>

        <div style={{
          height: 1, margin: '0 40px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03) 35%, rgba(255,255,255,0.03) 65%, transparent)',
        }} />
      </div>

      <main className="max-w-4xl mx-auto" style={{ paddingTop: 12 }}>
        <ActiveTool onAccentChange={setActiveAccent} />
      </main>

      <Footer />
    </div>
  );
}

export default App;
