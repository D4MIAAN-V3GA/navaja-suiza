import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './Landing';
import RescuePage from './RescuePage';
import ToolsHub from './ToolsHub';
import ToolsGrid from './ToolsGrid';
import ToolPage from './ToolPage';

// Cambiar de ruta NO mueve el scroll por su cuenta: el navegador te deja a la
// misma altura en la página nueva. Tocar «Ver la oferta» desde media portada
// abría /rescate por el final.
//
// Vive aquí y no en cada página porque el bug es de todas: ToolsHub, TurTar e
// Incertidumbre ya traían su propio window.scrollTo(0,0) copiado, y /rescate
// fue el cuarto que se olvidó. Un guardia en el router los cubre a todos.
//
// Con hash no hace nada: ese salto lo maneja la página dueña del ancla.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/rescate" element={<RescuePage />} />
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
