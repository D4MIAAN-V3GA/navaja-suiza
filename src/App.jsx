import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing';
import ToolsHub from './ToolsHub';
import ToolsGrid from './ToolsGrid';
import ToolPage from './ToolPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/herramientas" element={<ToolsHub />}>
          <Route index element={<ToolsGrid />} />
          <Route path=":id" element={<ToolPage />} />
        </Route>
        {/* Compatibilidad con links B2B ya compartidos */}
        <Route path="/incertidumbre" element={<Navigate to="/herramientas/incertidumbre" replace />} />
        <Route path="/tur" element={<Navigate to="/herramientas/tur" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
