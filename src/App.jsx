import EngineerHeader from './EngineerHeader';
import EquationSolver from './EquationSolver';
import VectorCalculator from './VectorCalculator';
import InertiaCalculator from './InertiaCalculator';
import LinearInterpolator from './LinearInterpolator';
import UnitConverter from './UnitConverter';

function App() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans">

      <EngineerHeader />

      <main className="max-w-4xl mx-auto flex flex-col">
        <EquationSolver />
        <VectorCalculator />
        <InertiaCalculator />
        <LinearInterpolator />
        <UnitConverter />
      </main>

    </div>
  );
}

export default App;