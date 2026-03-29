import React from 'react';

const EngineerHeader = () => {
  return (
    <header className="relative flex flex-col items-center max-w-4xl mx-auto mb-16 pt-12 pb-8 border-b border-gray-800">
      
      {/* Etiqueta de herramienta (Gris claro para que resalte del fondo) */}
      <div className="inline-block bg-gray-900 border border-gray-700 text-gray-300 font-mono text-xs px-5 py-2 rounded-full mb-8 tracking-widest uppercase">
        @damian.project
      </div>

      {/* El Título Principal - Forzando el blanco puro en las palabras base */}
      <h1 className="text-center text-4xl md:text-6xl font-black uppercase text-[#ffffff] tracking-[0.15em] leading-tight mb-6">
        LA <span className="text-[#9D9DFF]">NAVAJA SUIZA</span> DEL <span className="text-[#9D9DFF]">INGENIERO</span>
      </h1>

      {/* Subtítulo - Un gris más brillante para que no se pierda en el negro */}
      <p className="text-center font-mono text-sm md:text-base text-[#d4d4d4] max-w-2xl leading-relaxed">
        Herramientas anti-filtros. El arma secreta de Industrias Muñeco.
      </p>

    </header>
  );
};

export default EngineerHeader;