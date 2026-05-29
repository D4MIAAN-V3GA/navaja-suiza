import React from 'react';

const EngineerHeader = () => {
  return (
    // Le agregamos un fondo sutil tipo tarjeta (bg-gray-900/30), bordes redondeados y un poco de sombra
    <header className="relative flex flex-col items-center max-w-4xl mx-auto mb-2 pt-12 pb-6">
      
      {/* El Resplandor (Glow) mágico en el fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-gradient-to-b from-[#9D9DFF]/07 to-transparent blur-3xl -z-10 pointer-events-none"></div>

      {/* Etiqueta de herramienta */}
      <div className="inline-block bg-gray-950 border border-[#9D9DFF]/30 font-mono text-xs px-5 py-2 rounded-full mt-4 mb-8 tracking-widest" style={{ color: '#9D9DFF', textShadow: '0 0 8px rgba(157,157,255,0.6)' }}>
        @damianvlab
      </div>

      {/* El Título Principal */}
      <h1 className="text-center text-5xl md:text-7xl text-[#ffffff] leading-tight mb-6 drop-shadow-md z-10 px-4" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>
        la <span className="text-[#9D9DFF]">NAVAJA SUIZA</span> del <span className="text-[#9D9DFF]">INGENIERO</span>
      </h1>

      {/* Subtítulo */}
      <p className="text-center font-mono text-sm md:text-base text-[#d4d4d4] max-w-2xl leading-relaxed z-10 px-6">
        Herramientas anti-filtros. El arma secreta de Industrias Muñeco.
      </p>

    </header>
  );
};

export default EngineerHeader;