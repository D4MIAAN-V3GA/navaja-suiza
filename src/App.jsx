import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import ToolsApp from './ToolsApp';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/herramientas" element={<ToolsApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
