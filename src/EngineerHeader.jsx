import React from 'react';

const EngineerHeader = () => {
  return (
    // Le agregamos un fondo sutil tipo tarjeta (bg-gray-900/30), bordes redondeados y un poco de sombra
    <header className="relative flex flex-col items-center max-w-4xl mx-auto mb-16 pt-12 pb-8 border-b border-gray-800 rounded-2xl bg-[#111113] bg-[radial-gradient(circle_at_center,_rgba(157,157,255,0.08)_0%,_transparent_70%)] shadow-2xl shadow-purple-950/10">
      
      {/* El Resplandor (Glow) mágico en el fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-full bg-gradient-to-b from-[#9D9DFF]/10 to-transparent blur-3xl -z-10 rounded-full pointer-events-none"></div>

      {/* Etiqueta de herramienta */}
      <div className="inline-block bg-gray-950 border border-gray-700 text-gray-300 font-mono text-xs px-5 py-2 rounded-full mb-8 tracking-widest shadow-sm">
        @damian.project
      </div>

      {/* El Título Principal */}
      <h1 className="text-center text-4xl md:text-6xl font-black uppercase text-[#ffffff] tracking-[0.15em] leading-tight mb-6 drop-shadow-md z-10 px-4">
        LA <span className="text-[#9D9DFF]">NAVAJA SUIZA</span> DEL <span className="text-[#9D9DFF]">INGENIERO</span>
      </h1>

      {/* Subtítulo */}
      <p className="text-center font-mono text-sm md:text-base text-[#d4d4d4] max-w-2xl leading-relaxed z-10 px-6">
        Herramientas anti-filtros. El arma secreta de Industrias Muñeco.
      </p>

    </header>
  );
};

export default EngineerHeader;