// Ficha de cada herramienta: lo que el encabezado (ToolFrame) y el riel
// derecho (ToolRail) muestran alrededor de la calculadora.
//
// Regla de producto (ver CLAUDE.md §5b): esto NO es material de consulta.
// Es el mínimo contexto para que el usuario meta bien los datos y confíe en
// el número que sale — pasos, convenciones y trampas. Nada de diccionario.
//
//   title    — encabezado grande (lo que antes vivía dentro de cada tool)
//   sub      — línea mono bajo el título
//   entrega  — qué te devuelve; chips del encabezado
//   pasos    — cómo se usa, en orden
//   formulas — lo que aplica por dentro, para verificar a mano
//   ojo      — errores y convenciones que muerden
//   ver      — ids de TOOLS relacionadas
//   ancho    — "prosa" en las páginas de artículo (incertidumbre, TUR)

export const GUIDES = {
  ecuaciones: {
    title: "Solucionador de sistemas lineales",
    sub: "Regla de Cramer · 2×2 a 8×8 · acepta fracciones · resultados exactos",
    entrega: ["Valor de cada incógnita", "Δ y cada Δᵢ", "Procedimiento paso a paso"],
    pasos: [
      "Elige el tamaño: n incógnitas = n ecuaciones.",
      "Llena una fila por ecuación. La celda de color es el término independiente.",
      "Resuelve y abre «Ver procedimiento» para copiar el desarrollo.",
    ],
    formulas: [
      { k: "Cramer", v: "xᵢ = Δᵢ / Δ" },
      { k: "Δ", v: "det(A)" },
      { k: "Δᵢ", v: "det(A) con la columna i ← b" },
    ],
    ojo: [
      "Si Δ = 0 no hay solución única: el sistema es incompatible o tiene infinitas.",
      "Una celda vacía vale 0 — no hace falta escribir los ceros.",
      "Escribe fracciones tal cual («2/3»): se resuelve exacto, sin redondeo.",
    ],
    ver: ["matrices", "vectores"],
  },

  matrices: {
    title: "Solucionador de matrices",
    sub: "Gauss · Gauss-Jordan · acepta fracciones · aritmética exacta",
    entrega: ["Matriz reducida", "Solución del sistema", "Cada operación de fila"],
    pasos: [
      "Elige el método: Gauss deja escalonada, Gauss-Jordan deja la identidad.",
      "Elige el tamaño y llena la matriz aumentada.",
      "Resuelve: el procedimiento lista las operaciones de fila una por una.",
    ],
    formulas: [
      { k: "Objetivo", v: "[A | b] → [I | x]" },
      { k: "Operación", v: "Fᵢ ← Fᵢ − m·Fⱼ" },
      { k: "Multiplicador", v: "m = aᵢⱼ / aⱼⱼ" },
    ],
    ojo: [
      "Sin pivote (columna en ceros) no hay solución única: sale el aviso.",
      "Todo se calcula con fracciones exactas, así que no arrastra error de redondeo.",
      "Si solo quieres las incógnitas de un sistema chico, Ecuaciones es más directo.",
    ],
    ver: ["ecuaciones", "vectores"],
  },

  vectores: {
    title: "Calculadora de vectores 3D",
    sub: "Magnitud · producto punto · producto cruz",
    entrega: ["|A| y |B|", "A · B", "A × B y su magnitud"],
    pasos: [
      "Escribe las componentes i, j, k de cada vector.",
      "Calcula: salen las cuatro respuestas de un jalón.",
      "Abre el procedimiento para ver el desarrollo del determinante.",
    ],
    formulas: [
      { k: "Magnitud", v: "|A| = √(x² + y² + z²)" },
      { k: "Punto", v: "A·B = xₐxᵦ + yₐyᵦ + zₐzᵦ" },
      { k: "Cruz", v: "A×B = det[i j k; A; B]" },
    ],
    ojo: [
      "A·B = 0 significa perpendiculares; el resultado te lo avisa.",
      "El producto cruz NO es conmutativo: A×B = −(B×A).",
      "Las unidades las pones tú — la calculadora solo trabaja con los números.",
    ],
    ver: ["ecuaciones", "inercia"],
  },

  inercia: {
    title: "Centroides y momentos de inercia",
    sub: "Propiedades geométricas de sección transversal",
    entrega: ["Área", "Centroide x̄, ȳ", "Ix, Iy, Iz", "Radios de giro"],
    pasos: [
      "Elige el perfil: rectángulo, círculo, triángulo o corona circular.",
      "Mete las dimensiones — el resultado se actualiza mientras escribes.",
      "Abre el procedimiento para el desarrollo con tus números.",
    ],
    formulas: [
      { k: "Rectángulo", v: "Ix = bh³/12" },
      { k: "Triángulo", v: "Ix = bh³/36, ȳ = h/3" },
      { k: "Círculo", v: "I = πr⁴/4" },
      { k: "Radio de giro", v: "k = √(I/A)" },
    ],
    ojo: [
      "Usa una sola unidad para todo: si metes mm, el área sale en mm² y la inercia en mm⁴.",
      "Los Ix, Iy son respecto al centroide, no respecto a la base.",
      "En la corona circular el radio interior tiene que ser menor que el exterior.",
    ],
    ver: ["vectores", "formulas"],
  },

  interpolacion: {
    title: "Interpolador lineal",
    sub: "El valor entre dos puntos de tu tabla, con gráfica y desarrollo",
    entrega: ["y₂ interpolado", "Pendiente m", "Gráfica de los tres puntos"],
    pasos: [
      "Mete el punto conocido 1 (x₁, y₁) y el punto conocido 2 (x₃, y₃).",
      "Escribe la x₂ que buscas, entre esos dos valores.",
      "El resultado y la gráfica salen solos, sin botón.",
    ],
    formulas: [
      { k: "Interpolación", v: "y₂ = y₁ + [(x₂−x₁)/(x₃−x₁)]·(y₃−y₁)" },
      { k: "Pendiente", v: "m = (y₃−y₁)/(x₃−x₁)" },
    ],
    ojo: [
      "Si x₁ = x₃ hay división entre cero: la herramienta lo marca.",
      "Con x₂ fuera del intervalo ya no interpolas, extrapolas: el número sale, la confianza no.",
      "Sirve igual para tablas de vapor, de acero o de calibración.",
    ],
    ver: ["formulas", "unidades"],
  },

  unidades: {
    title: "Conversor de unidades de ingeniería",
    sub: "Presión · torque · fuerza · longitud · masa · temperatura, con referencias reales",
    entrega: ["Valor convertido", "Tabla en todas las unidades", "Referencia de magnitud"],
    pasos: [
      "Elige la magnitud — cada una trae su propio juego de unidades.",
      "Escribe el valor y las unidades de origen y destino.",
      "Elige una referencia: te dice si tu número es razonable o si te falta un cero.",
    ],
    formulas: [
      { k: "Presión", v: "1 psi = 6 894.757 Pa" },
      { k: "Torque", v: "1 lbf·ft = 1.355 82 N·m" },
      { k: "Fuerza", v: "1 kgf = 9.806 65 N" },
      { k: "Temperatura", v: "°F = °C · 9/5 + 32" },
    ],
    ojo: [
      "Torque y energía comparten unidad (N·m) pero no son lo mismo: no los mezcles.",
      "kgf y lbf son fuerza, no masa — llevan la gravedad dentro.",
      "Presión manométrica vs. absoluta: la conversión no cambia la referencia.",
    ],
    ver: ["formulas", "interpolacion"],
  },

  formulas: {
    title: "La fórmula ya la sabes. El número te lo doy yo.",
    sub: "Eliges qué variable despejar, metes el resto y sale con unidades",
    entrega: ["Cualquier variable despejada", "Resultado con unidad", "Norma de referencia"],
    pasos: [
      "Busca por nombre, tag o norma, o filtra por categoría.",
      "Enciende «solo las que se calculan» si quieres únicamente las ejecutables.",
      "Abre la fórmula, elige la incógnita y llena los demás campos.",
    ],
    // Sin bloque de fórmulas: la herramienta ES el catálogo de fórmulas,
    // repetir dos genéricas en el riel no aporta nada.
    ojo: [
      "Respeta las unidades que pide la ficha: no hay conversión automática.",
      "Las de GD&T y Cálculo son de referencia — símbolos y expresiones simbólicas, no números.",
      "¿Falta una fórmula? Pídela en el Discord y entra a la lista.",
    ],
    ver: ["unidades", "inercia"],
  },

  incertidumbre: {
    title: "Cómo calcular la incertidumbre de medición",
    sub: "Presupuesto GUM completo, con reporte formal descargable",
    ancho: "prosa",
    entrega: ["u de cada fuente", "u combinada y U", "gl efectivos y k", "Reporte imprimible"],
    pasos: [
      "Agrega una fuente por cada cosa que le mete duda a tu medición.",
      "Tipo A: metes s y n. Tipo B: metes el valor y su distribución.",
      "Revisa la u combinada, elige k y descarga el reporte.",
    ],
    formulas: [
      { k: "Tipo A", v: "u = s / √n" },
      { k: "Certificado", v: "u = U / k" },
      { k: "Resolución", v: "u = d / √12" },
      { k: "Rectangular", v: "u = a / √3" },
      { k: "Combinada", v: "u𝒸 = √(Σ uᵢ²)" },
      { k: "Expandida", v: "U = k · u𝒸" },
    ],
    ojo: [
      "k = 2 es 95.45 % de confianza, no 95 % — el redondeo importa en un informe.",
      "U final se reporta con 2 cifras significativas (GUM 7.2.6).",
      "Si una fuente domina el presupuesto, ahí está tu punto de mejora.",
    ],
    ver: ["tur", "formulas"],
  },

  tur: {
    title: "TUR y TAR: ¿tu patrón aguanta?",
    sub: "Razón de incertidumbre y de exactitud de ensayo, con veredicto 4:1",
    ancho: "prosa",
    entrega: ["TUR y TAR", "Veredicto contra la regla 4:1", "Límite con guardband"],
    pasos: [
      "Mete la tolerancia del instrumento bajo prueba.",
      "Mete la incertidumbre (TUR) o la exactitud (TAR) de tu patrón.",
      "Lee el veredicto y, si hace falta, el límite reducido con guardband.",
    ],
    formulas: [
      { k: "TUR", v: "(TU − TL) / (2·U₉₅)" },
      { k: "TAR", v: "Tolerancia / Exactitud del patrón" },
      { k: "Guardband", v: "Límite = Tolerancia − U₉₅" },
    ],
    ojo: [
      "La regla es 4:1 — por debajo, la incertidumbre del patrón contamina el veredicto.",
      "TAR no lleva tratamiento estadístico: sin k, sin distribución. TUR sí.",
      "Para un guardband defendible necesitas un presupuesto GUM, no un TAR.",
    ],
    ver: ["incertidumbre", "unidades"],
  },
};

export const getGuide = (id) => GUIDES[id];
