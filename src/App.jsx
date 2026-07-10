import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import ToolsApp from './ToolsApp';
import UncertaintyBudget from './UncertaintyBudget';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/herramientas" element={<ToolsApp />} />
        <Route path="/incertidumbre" element={<UncertaintyBudget />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
