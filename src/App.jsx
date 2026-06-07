import { useState } from 'react';
import EngineerHeader from './EngineerHeader';
import Footer from './Footer';
import EquationSolver from './EquationSolver';
import VectorCalculator from './VectorCalculator';
import InertiaCalculator from './InertiaCalculator';
import LinearInterpolator from './LinearInterpolator';
import UnitConverter from './UnitConverter';
import { PAPER, INK, MONO, SANS, ACCENTS } from './theme';

const tools = [
  { label: 'Ecuaciones',    component: EquationSolver,     defaultAccent: ACCENTS.blue },
  { label: 'Vectores',      component: VectorCalculator,   defaultAccent: ACCENTS.green },
  { label: 'Inercia',       component: InertiaCalculator,  defaultAccent: ACCENTS.orange },
  { label: 'Interpolación', component: LinearInterpolator, defaultAccent: ACCENTS.pink },
  { label: 'Unidades',      component: UnitConverter,      defaultAccent: ACCENTS.cyan },
];

function App() {
  const [active, setActive]             = useState(0);
  const [hovered, setHovered]           = useState(null);
  const [activeAccent, setActiveAccent] = useState(tools[0].defaultAccent);

  const ActiveTool = tools[active].component;

  const handleSwitch = (i) => {
    setActive(i);
    setActiveAccent(tools[i].defaultAccent);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: PAPER, color: INK, fontFamily: SANS }}>
      <div style={{ maxWidth: 896, margin: '0 auto', padding: '0 16px' }}>
        <EngineerHeader />

        {/* Nav sticky brutalista: barra sólida, borde duro, sin blur */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: PAPER,
          borderTop: `2px solid ${INK}`,
          borderBottom: `2px solid ${INK}`,
          margin: '0 -16px',
          padding: '0 16px',
        }}>
          <nav style={{
            display: 'flex', alignItems: 'stretch',
            overflowX: 'auto',
          }}>
            {tools.map((tool, i) => {
              const isActive  = active === i;
              const isHovered = hovered === i && !isActive;
              const accent = tool.defaultAccent;

              return (
                <button
                  key={i}
                  onClick={() => handleSwitch(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    flex: '1 0 auto',
                    fontFamily: MONO,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    padding: '14px 18px',
                    border: 'none',
                    borderRight: i < tools.length - 1 ? `2px solid ${INK}` : 'none',
                    borderBottom: isActive ? `4px solid ${accent}` : '4px solid transparent',
                    background: isActive ? INK : isHovered ? '#efe9da' : 'transparent',
                    color: isActive ? PAPER : INK,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'background 0.12s',
                  }}
                >
                  <span style={{ color: isActive ? accent : accent, marginRight: 6 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {tool.label}
                </button>
              );
            })}
          </nav>
        </div>

        <main style={{ paddingTop: 8 }}>
          <ActiveTool onAccentChange={setActiveAccent} />
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;
