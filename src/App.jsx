import EngineerHeader from './EngineerHeader';
import EquationSolver from './EquationSolver';
import VectorCalculator from './VectorCalculator';
import InertiaCalculator from './InertiaCalculator';
import LinearInterpolator from './LinearInterpolator';
import UnitConverter from './UnitConverter';

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4 md:p-8 font-sans">

      <EngineerHeader />

      <main className="max-w-4xl mx-auto flex flex-col gap-12">
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