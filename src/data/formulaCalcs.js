// ── Calculadoras de la Biblioteca de Fórmulas ───────────────────────
// Una entrada por fórmula, con la MISMA clave numérica que su `id` en
// formulas.json. Las fórmulas sin entrada aquí siguen mostrándose como
// tarjeta de referencia, sin calculadora: se puede ir agregando de a una.
//
// Por qué es un .js y no un .json: el CSP de producción (vercel.json) no
// permite 'unsafe-eval', así que no se puede evaluar una expresión guardada
// como texto. Cada despeje es una función real — sin parser y sin eval.
//
// Forma de cada entrada:
//   vars  → los símbolos que participan. `key` es el nombre ASCII que usan
//           las funciones; `sym` es lo que ve el usuario. `def` prellena el
//           campo (constantes como g o R).
//   solve → un despeje por variable resoluble. La clave es el `key` de la
//           incógnita y el valor recibe un objeto con las demás variables.
//           El PRIMER despeje es el que se selecciona al abrir.
//   nota  → opcional: aclaración cuando la calculadora usa una forma
//           distinta a la que muestra la tarjeta.

const { PI, sqrt, pow, abs } = Math;

export const CALCS = {
  // ── Fluidos ───────────────────────────────────────────────────────
  1: {
    // La tarjeta muestra la forma "= cte"; para calcular hace falta la forma
    // de dos puntos, que es como se usa en un problema real.
    vars: [
      { key: "P1",  sym: "P₁", name: "Presión en 1",   unit: "Pa" },
      { key: "v1",  sym: "v₁", name: "Velocidad en 1", unit: "m/s" },
      { key: "h1",  sym: "h₁", name: "Altura en 1",    unit: "m" },
      { key: "P2",  sym: "P₂", name: "Presión en 2",   unit: "Pa" },
      { key: "v2",  sym: "v₂", name: "Velocidad en 2", unit: "m/s" },
      { key: "h2",  sym: "h₂", name: "Altura en 2",    unit: "m" },
      { key: "rho", sym: "ρ",  name: "Densidad",       unit: "kg/m³" },
      { key: "g",   sym: "g",  name: "Gravedad",       unit: "m/s²", def: 9.81 },
    ],
    solve: {
      P1:  ({ v1, h1, P2, v2, h2, rho, g }) => P2 + 0.5 * rho * (v2 * v2 - v1 * v1) + rho * g * (h2 - h1),
      P2:  ({ P1, v1, h1, v2, h2, rho, g }) => P1 + 0.5 * rho * (v1 * v1 - v2 * v2) + rho * g * (h1 - h2),
      v1:  ({ P1, h1, P2, v2, h2, rho, g }) => sqrt((2 / rho) * (P2 - P1) + v2 * v2 + 2 * g * (h2 - h1)),
      v2:  ({ P1, v1, h1, P2, h2, rho, g }) => sqrt((2 / rho) * (P1 - P2) + v1 * v1 + 2 * g * (h1 - h2)),
      h1:  ({ P1, v1, P2, v2, h2, rho, g }) => h2 + (P2 - P1 + 0.5 * rho * (v2 * v2 - v1 * v1)) / (rho * g),
      h2:  ({ P1, v1, h1, P2, v2, rho, g }) => h1 + (P1 - P2 + 0.5 * rho * (v1 * v1 - v2 * v2)) / (rho * g),
      rho: ({ P1, v1, h1, P2, v2, h2, g }) => (P2 - P1) / (0.5 * (v1 * v1 - v2 * v2) + g * (h1 - h2)),
    },
    nota: "Forma de dos puntos: P₁ + ½ρv₁² + ρgh₁ = P₂ + ½ρv₂² + ρgh₂. Vale para flujo incompresible, estacionario y sin pérdidas — si hay fricción usa Darcy-Weisbach.",
  },

  2: {
    vars: [
      { key: "Re",  sym: "Re", name: "Número de Reynolds", unit: "—" },
      { key: "rho", sym: "ρ",  name: "Densidad",           unit: "kg/m³" },
      { key: "v",   sym: "v",  name: "Velocidad",          unit: "m/s" },
      { key: "D",   sym: "D",  name: "Diámetro",           unit: "m" },
      { key: "mu",  sym: "μ",  name: "Viscosidad dinámica", unit: "Pa·s" },
    ],
    solve: {
      Re:  ({ rho, v, D, mu }) => (rho * v * D) / mu,
      rho: ({ Re, v, D, mu }) => (Re * mu) / (v * D),
      v:   ({ Re, rho, D, mu }) => (Re * mu) / (rho * D),
      D:   ({ Re, rho, v, mu }) => (Re * mu) / (rho * v),
      mu:  ({ Re, rho, v, D }) => (rho * v * D) / Re,
    },
  },

  3: {
    vars: [
      { key: "A1", sym: "A₁", name: "Área en 1",     unit: "m²" },
      { key: "v1", sym: "v₁", name: "Velocidad en 1", unit: "m/s" },
      { key: "A2", sym: "A₂", name: "Área en 2",     unit: "m²" },
      { key: "v2", sym: "v₂", name: "Velocidad en 2", unit: "m/s" },
    ],
    solve: {
      v2: ({ A1, v1, A2 }) => (A1 * v1) / A2,
      A2: ({ A1, v1, v2 }) => (A1 * v1) / v2,
      v1: ({ A2, v2, A1 }) => (A2 * v2) / A1,
      A1: ({ A2, v2, v1 }) => (A2 * v2) / v1,
    },
  },

  4: {
    vars: [
      { key: "hf", sym: "hf", name: "Pérdida de carga", unit: "m" },
      { key: "f",  sym: "f",  name: "Factor de fricción", unit: "—" },
      { key: "L",  sym: "L",  name: "Longitud",         unit: "m" },
      { key: "D",  sym: "D",  name: "Diámetro",         unit: "m" },
      { key: "v",  sym: "v",  name: "Velocidad",        unit: "m/s" },
      { key: "g",  sym: "g",  name: "Gravedad",         unit: "m/s²", def: 9.81 },
    ],
    solve: {
      hf: ({ f, L, D, v, g }) => (f * L * v * v) / (D * 2 * g),
      f:  ({ hf, L, D, v, g }) => (hf * D * 2 * g) / (L * v * v),
      L:  ({ hf, f, D, v, g }) => (hf * D * 2 * g) / (f * v * v),
      D:  ({ hf, f, L, v, g }) => (f * L * v * v) / (hf * 2 * g),
      v:  ({ hf, f, L, D, g }) => sqrt((hf * D * 2 * g) / (f * L)),
    },
  },

  5: {
    vars: [
      { key: "hf", sym: "hf", name: "Pérdida de carga",  unit: "m" },
      { key: "L",  sym: "L",  name: "Longitud",          unit: "m" },
      { key: "Q",  sym: "Q",  name: "Caudal",            unit: "m³/s" },
      { key: "C",  sym: "C",  name: "Coef. Hazen-Williams", unit: "—" },
      { key: "D",  sym: "D",  name: "Diámetro",          unit: "m" },
    ],
    solve: {
      hf: ({ L, Q, C, D }) => (10.67 * L * pow(Q, 1.852)) / (pow(C, 1.852) * pow(D, 4.87)),
      L:  ({ hf, Q, C, D }) => (hf * pow(C, 1.852) * pow(D, 4.87)) / (10.67 * pow(Q, 1.852)),
      Q:  ({ hf, L, C, D }) => pow((hf * pow(C, 1.852) * pow(D, 4.87)) / (10.67 * L), 1 / 1.852),
      C:  ({ hf, L, Q, D }) => pow((10.67 * L * pow(Q, 1.852)) / (hf * pow(D, 4.87)), 1 / 1.852),
      D:  ({ hf, L, Q, C }) => pow((10.67 * L * pow(Q, 1.852)) / (hf * pow(C, 1.852)), 1 / 4.87),
    },
  },

  6: {
    vars: [
      { key: "P",   sym: "P", name: "Presión",   unit: "Pa" },
      { key: "rho", sym: "ρ", name: "Densidad",  unit: "kg/m³" },
      { key: "g",   sym: "g", name: "Gravedad",  unit: "m/s²", def: 9.81 },
      { key: "h",   sym: "h", name: "Profundidad", unit: "m" },
    ],
    solve: {
      P:   ({ rho, g, h }) => rho * g * h,
      rho: ({ P, g, h }) => P / (g * h),
      h:   ({ P, rho, g }) => P / (rho * g),
    },
  },

  // ── Termo ─────────────────────────────────────────────────────────
  7: {
    vars: [
      { key: "P", sym: "P", name: "Presión",             unit: "Pa" },
      { key: "V", sym: "V", name: "Volumen",             unit: "m³" },
      { key: "n", sym: "n", name: "Moles",               unit: "mol" },
      { key: "R", sym: "R", name: "Constante de los gases", unit: "J/mol·K", def: 8.314 },
      { key: "T", sym: "T", name: "Temperatura absoluta", unit: "K" },
    ],
    solve: {
      P: ({ n, R, T, V }) => (n * R * T) / V,
      V: ({ n, R, T, P }) => (n * R * T) / P,
      n: ({ P, V, R, T }) => (P * V) / (R * T),
      T: ({ P, V, n, R }) => (P * V) / (n * R),
    },
    nota: "T va en kelvin, no en °C.",
  },

  8: {
    vars: [
      { key: "dU", sym: "ΔU", name: "Cambio de energía interna", unit: "J" },
      { key: "Q",  sym: "Q",  name: "Calor que entra",           unit: "J" },
      { key: "W",  sym: "W",  name: "Trabajo que hace el sistema", unit: "J" },
    ],
    solve: {
      dU: ({ Q, W }) => Q - W,
      Q:  ({ dU, W }) => dU + W,
      W:  ({ Q, dU }) => Q - dU,
    },
  },

  9: {
    vars: [
      { key: "q",  sym: "q",  name: "Flujo de calor",     unit: "W" },
      { key: "k",  sym: "k",  name: "Conductividad térmica", unit: "W/m·K" },
      { key: "A",  sym: "A",  name: "Área",               unit: "m²" },
      { key: "dT", sym: "ΔT", name: "Diferencia de temperatura", unit: "K" },
      { key: "L",  sym: "L",  name: "Espesor",            unit: "m" },
    ],
    solve: {
      q:  ({ k, A, dT, L }) => (k * A * dT) / L,
      k:  ({ q, A, dT, L }) => (q * L) / (A * dT),
      A:  ({ q, k, dT, L }) => (q * L) / (k * dT),
      dT: ({ q, k, A, L }) => (q * L) / (k * A),
      L:  ({ q, k, A, dT }) => (k * A * dT) / q,
    },
    nota: "Calcula la magnitud sobre una pared plana (q = k·A·ΔT/L). El signo negativo de la ley solo indica que el calor va de caliente a frío.",
  },

  10: {
    vars: [
      { key: "eta", sym: "η",  name: "Eficiencia",          unit: "—" },
      { key: "Tc",  sym: "Tc", name: "Temp. foco frío",     unit: "K" },
      { key: "Th",  sym: "Th", name: "Temp. foco caliente", unit: "K" },
    ],
    solve: {
      eta: ({ Tc, Th }) => 1 - Tc / Th,
      Tc:  ({ Th, eta }) => Th * (1 - eta),
      Th:  ({ Tc, eta }) => Tc / (1 - eta),
    },
    nota: "Las temperaturas van en kelvin. η sale en tanto por uno (0.35 = 35 %).",
  },

  11: {
    vars: [
      { key: "Q",  sym: "Q",  name: "Calor",            unit: "J" },
      { key: "m",  sym: "m",  name: "Masa",             unit: "kg" },
      { key: "c",  sym: "c",  name: "Calor específico", unit: "J/kg·K" },
      { key: "dT", sym: "ΔT", name: "Cambio de temperatura", unit: "K" },
    ],
    solve: {
      Q:  ({ m, c, dT }) => m * c * dT,
      m:  ({ Q, c, dT }) => Q / (c * dT),
      c:  ({ Q, m, dT }) => Q / (m * dT),
      dT: ({ Q, m, c }) => Q / (m * c),
    },
  },

  12: {
    vars: [
      { key: "q",    sym: "q",  name: "Flujo de calor",      unit: "W" },
      { key: "h",    sym: "h",  name: "Coef. de convección", unit: "W/m²·K" },
      { key: "A",    sym: "A",  name: "Área",                unit: "m²" },
      { key: "Ts",   sym: "Ts", name: "Temp. de superficie", unit: "K" },
      { key: "Tinf", sym: "T∞", name: "Temp. del fluido",    unit: "K" },
    ],
    solve: {
      q:    ({ h, A, Ts, Tinf }) => h * A * (Ts - Tinf),
      h:    ({ q, A, Ts, Tinf }) => q / (A * (Ts - Tinf)),
      A:    ({ q, h, Ts, Tinf }) => q / (h * (Ts - Tinf)),
      Ts:   ({ q, h, A, Tinf }) => Tinf + q / (h * A),
      Tinf: ({ q, h, A, Ts }) => Ts - q / (h * A),
    },
  },

  // ── Resistencia ───────────────────────────────────────────────────
  13: {
    vars: [
      { key: "sigma", sym: "σ", name: "Esfuerzo",           unit: "Pa" },
      { key: "E",     sym: "E", name: "Módulo de Young",    unit: "Pa" },
      { key: "eps",   sym: "ε", name: "Deformación unitaria", unit: "—" },
    ],
    solve: {
      sigma: ({ E, eps }) => E * eps,
      E:     ({ sigma, eps }) => sigma / eps,
      eps:   ({ sigma, E }) => sigma / E,
    },
  },

  14: {
    vars: [
      { key: "Pcr", sym: "Pcr", name: "Carga crítica",      unit: "N" },
      { key: "E",   sym: "E",   name: "Módulo de Young",    unit: "Pa" },
      { key: "I",   sym: "I",   name: "Momento de inercia", unit: "m⁴" },
      { key: "K",   sym: "K",   name: "Factor de longitud efectiva", unit: "—", def: 1 },
      { key: "L",   sym: "L",   name: "Longitud",           unit: "m" },
    ],
    solve: {
      Pcr: ({ E, I, K, L }) => (PI * PI * E * I) / pow(K * L, 2),
      E:   ({ Pcr, I, K, L }) => (Pcr * pow(K * L, 2)) / (PI * PI * I),
      I:   ({ Pcr, E, K, L }) => (Pcr * pow(K * L, 2)) / (PI * PI * E),
      L:   ({ Pcr, E, I, K }) => sqrt((PI * PI * E * I) / Pcr) / K,
      K:   ({ Pcr, E, I, L }) => sqrt((PI * PI * E * I) / Pcr) / L,
    },
    nota: "K = 1 biarticulada, 0.5 biempotrada, 2 en voladizo, 0.7 empotrada-articulada.",
  },

  15: {
    vars: [
      { key: "sigma", sym: "σ", name: "Esfuerzo de flexión", unit: "Pa" },
      { key: "M",     sym: "M", name: "Momento flector",     unit: "N·m" },
      { key: "c",     sym: "c", name: "Distancia al eje neutro", unit: "m" },
      { key: "I",     sym: "I", name: "Momento de inercia",  unit: "m⁴" },
    ],
    solve: {
      sigma: ({ M, c, I }) => (M * c) / I,
      M:     ({ sigma, c, I }) => (sigma * I) / c,
      c:     ({ sigma, M, I }) => (sigma * I) / M,
      I:     ({ M, c, sigma }) => (M * c) / sigma,
    },
  },

  16: {
    vars: [
      { key: "tau", sym: "τ", name: "Esfuerzo cortante",  unit: "Pa" },
      { key: "T",   sym: "T", name: "Par torsor",         unit: "N·m" },
      { key: "r",   sym: "r", name: "Radio",              unit: "m" },
      { key: "J",   sym: "J", name: "Momento polar de inercia", unit: "m⁴" },
    ],
    solve: {
      tau: ({ T, r, J }) => (T * r) / J,
      T:   ({ tau, r, J }) => (tau * J) / r,
      r:   ({ tau, T, J }) => (tau * J) / T,
      J:   ({ T, r, tau }) => (T * r) / tau,
    },
  },

  17: {
    vars: [
      { key: "tau", sym: "τ", name: "Esfuerzo cortante", unit: "Pa" },
      { key: "V",   sym: "V", name: "Fuerza cortante",   unit: "N" },
      { key: "A",   sym: "A", name: "Área",              unit: "m²" },
    ],
    solve: {
      tau: ({ V, A }) => V / A,
      V:   ({ tau, A }) => tau * A,
      A:   ({ V, tau }) => V / tau,
    },
  },

  18: {
    vars: [
      { key: "FS",    sym: "FS",  name: "Factor de seguridad", unit: "—" },
      { key: "sadm",  sym: "σadm", name: "Esfuerzo admisible", unit: "Pa" },
      { key: "strab", sym: "σtrab", name: "Esfuerzo de trabajo", unit: "Pa" },
    ],
    solve: {
      FS:    ({ sadm, strab }) => sadm / strab,
      sadm:  ({ FS, strab }) => FS * strab,
      strab: ({ sadm, FS }) => sadm / FS,
    },
  },

  19: {
    vars: [
      { key: "delta", sym: "δ",  name: "Dilatación",   unit: "m" },
      { key: "alpha", sym: "α",  name: "Coef. de dilatación", unit: "1/K" },
      { key: "L",     sym: "L",  name: "Longitud inicial", unit: "m" },
      { key: "dT",    sym: "ΔT", name: "Cambio de temperatura", unit: "K" },
    ],
    solve: {
      delta: ({ alpha, L, dT }) => alpha * L * dT,
      alpha: ({ delta, L, dT }) => delta / (L * dT),
      L:     ({ delta, alpha, dT }) => delta / (alpha * dT),
      dT:    ({ delta, alpha, L }) => delta / (alpha * L),
    },
  },

  // ── Metrología ────────────────────────────────────────────────────
  26: {
    vars: [
      { key: "U",  sym: "U",  name: "Incertidumbre expandida", unit: "—" },
      { key: "k",  sym: "k",  name: "Factor de cobertura",     unit: "—", def: 2 },
      { key: "uc", sym: "uc", name: "Incertidumbre combinada", unit: "—" },
    ],
    solve: {
      U:  ({ k, uc }) => k * uc,
      uc: ({ U, k }) => U / k,
      k:  ({ U, uc }) => U / uc,
    },
    nota: "U y uc quedan en la unidad de tu mensurando. k = 2 ≈ 95.45 % de confianza.",
  },

  29: {
    vars: [
      { key: "Cp",    sym: "Cp",  name: "Capacidad del proceso", unit: "—" },
      { key: "USL",   sym: "USL", name: "Límite superior",  unit: "—" },
      { key: "LSL",   sym: "LSL", name: "Límite inferior",  unit: "—" },
      { key: "sigma", sym: "σ",   name: "Desviación estándar", unit: "—" },
    ],
    solve: {
      Cp:    ({ USL, LSL, sigma }) => (USL - LSL) / (6 * sigma),
      USL:   ({ LSL, sigma, Cp }) => LSL + 6 * sigma * Cp,
      LSL:   ({ USL, sigma, Cp }) => USL - 6 * sigma * Cp,
      sigma: ({ USL, LSL, Cp }) => (USL - LSL) / (6 * Cp),
    },
    nota: "Cp ≥ 1.33 es el mínimo que suele pedir el cliente. Cp no dice si el proceso está centrado — eso es Cpk.",
  },

  30: {
    vars: [
      { key: "u",   sym: "u",   name: "Incertidumbre estándar", unit: "—" },
      { key: "res", sym: "res", name: "Resolución del instrumento", unit: "—" },
    ],
    solve: {
      u:   ({ res }) => res / (2 * sqrt(3)),
      res: ({ u }) => u * 2 * sqrt(3),
    },
    nota: "u queda en la misma unidad que la resolución que metas.",
  },

  // ── Eléctrica ─────────────────────────────────────────────────────
  36: {
    vars: [
      { key: "V", sym: "V", name: "Voltaje",     unit: "V" },
      { key: "I", sym: "I", name: "Corriente",   unit: "A" },
      { key: "R", sym: "R", name: "Resistencia", unit: "Ω" },
    ],
    solve: {
      V: ({ I, R }) => I * R,
      I: ({ V, R }) => V / R,
      R: ({ V, I }) => V / I,
    },
  },

  37: {
    vars: [
      { key: "P", sym: "P", name: "Potencia",  unit: "W" },
      { key: "V", sym: "V", name: "Voltaje",   unit: "V" },
      { key: "I", sym: "I", name: "Corriente", unit: "A" },
    ],
    solve: {
      P: ({ V, I }) => V * I,
      V: ({ P, I }) => P / I,
      I: ({ P, V }) => P / V,
    },
  },

  38: {
    vars: [
      { key: "Z",  sym: "Z",  name: "Impedancia",         unit: "Ω" },
      { key: "R",  sym: "R",  name: "Resistencia",        unit: "Ω" },
      { key: "XL", sym: "XL", name: "Reactancia inductiva", unit: "Ω" },
      { key: "XC", sym: "XC", name: "Reactancia capacitiva", unit: "Ω" },
    ],
    solve: {
      Z: ({ R, XL, XC }) => sqrt(R * R + pow(XL - XC, 2)),
      R: ({ Z, XL, XC }) => sqrt(Z * Z - pow(XL - XC, 2)),
    },
    nota: "Para despejar R hace falta que Z ≥ |XL − XC|; si no, no hay solución real.",
  },

  // ── Estática ──────────────────────────────────────────────────────
  40: {
    vars: [
      { key: "F", sym: "ΣF", name: "Fuerza resultante", unit: "N" },
      { key: "m", sym: "m",  name: "Masa",              unit: "kg" },
      { key: "a", sym: "a",  name: "Aceleración",       unit: "m/s²" },
    ],
    solve: {
      F: ({ m, a }) => m * a,
      m: ({ F, a }) => F / a,
      a: ({ F, m }) => F / m,
    },
  },

  // ── GD&T ──────────────────────────────────────────────────────────
  // Los símbolos de la anotación no se calculan, pero la verificación que hay
  // detrás sí: convertir lecturas de la medición en el valor de la zona.
  20: {
    vars: [
      { key: "pos", sym: "⌀pos", name: "Desviación real (diámetro)", unit: "mm" },
      { key: "dx",  sym: "Δx",   name: "Desviación en X",            unit: "mm" },
      { key: "dy",  sym: "Δy",   name: "Desviación en Y",            unit: "mm" },
    ],
    solve: {
      pos: ({ dx, dy }) => 2 * sqrt(dx * dx + dy * dy),
      dx:  ({ pos, dy }) => sqrt(pow(pos / 2, 2) - dy * dy),
      dy:  ({ pos, dx }) => sqrt(pow(pos / 2, 2) - dx * dx),
    },
    nota: "La zona de posición es un cilindro, así que la desviación se reporta como DIÁMETRO: por eso el ×2. Compara ⌀pos contra la tolerancia t del dibujo — pasa si ⌀pos ≤ t.",
  },

  21: {
    vars: [
      { key: "t",    sym: "t",    name: "Planitud medida",   unit: "mm" },
      { key: "lmax", sym: "Lmax", name: "Lectura más alta",  unit: "mm" },
      { key: "lmin", sym: "Lmin", name: "Lectura más baja",  unit: "mm" },
    ],
    solve: {
      t:    ({ lmax, lmin }) => lmax - lmin,
      lmax: ({ t, lmin }) => lmin + t,
      lmin: ({ t, lmax }) => lmax - t,
    },
    nota: "La planitud es la separación entre los dos planos paralelos que encierran la superficie: la lectura más alta menos la más baja, con la pieza ya nivelada. No lleva datum.",
  },

  22: {
    vars: [
      { key: "margen", sym: "margen", name: "Margen que te queda", unit: "mm" },
      { key: "t",      sym: "t",      name: "Zona de perfil (total)", unit: "mm" },
      { key: "dev",    sym: "dev",    name: "Desviación medida (máx.)", unit: "mm" },
    ],
    solve: {
      margen: ({ t, dev }) => t / 2 - dev,
      t:      ({ margen, dev }) => 2 * (margen + dev),
      dev:    ({ t, margen }) => t / 2 - margen,
    },
    nota: "Perfil bilateral: la zona t se reparte mitad y mitad a cada lado del perfil teórico, así que puedes desviarte t/2. Un margen negativo significa que la pieza ya se salió.",
  },

  23: {
    vars: [
      { key: "t",    sym: "t",    name: "Circularidad",      unit: "mm" },
      { key: "Dmax", sym: "Dmax", name: "Diámetro máximo",   unit: "mm" },
      { key: "Dmin", sym: "Dmin", name: "Diámetro mínimo",   unit: "mm" },
    ],
    solve: {
      t:    ({ Dmax, Dmin }) => (Dmax - Dmin) / 2,
      Dmax: ({ t, Dmin }) => Dmin + 2 * t,
      Dmin: ({ t, Dmax }) => Dmax - 2 * t,
    },
    nota: "La zona es RADIAL, por eso se divide entre 2. Ojo: midiendo diámetros con dos puntos solo detectas lobulado par — un lóbulo impar (trilobular) pasa desapercibido y necesita bloque en V o redondímetro.",
  },

  25: {
    vars: [
      { key: "t",    sym: "t",    name: "Cilindricidad",                unit: "mm" },
      { key: "Dmax", sym: "Dmax", name: "Diámetro máximo (todo el eje)", unit: "mm" },
      { key: "Dmin", sym: "Dmin", name: "Diámetro mínimo (todo el eje)", unit: "mm" },
    ],
    solve: {
      t:    ({ Dmax, Dmin }) => (Dmax - Dmin) / 2,
      Dmax: ({ t, Dmin }) => Dmin + 2 * t,
      Dmin: ({ t, Dmax }) => Dmax - 2 * t,
    },
    nota: "Igual que circularidad pero tomando el máximo y el mínimo de TODA la longitud, no de una sección: por eso también atrapa conicidad y barrilamiento.",
  },

  24: {
    vars: [
      { key: "total", sym: "Ttotal", name: "Tolerancia total disponible", unit: "mm" },
      { key: "tgeo",  sym: "t",      name: "Tolerancia del dibujo",       unit: "mm" },
      { key: "MMC",   sym: "MMC",    name: "Tamaño en MMC",               unit: "mm" },
      { key: "real",  sym: "real",   name: "Tamaño real medido",          unit: "mm" },
    ],
    solve: {
      total: ({ tgeo, MMC, real }) => tgeo + abs(real - MMC),
      tgeo:  ({ total, MMC, real }) => total - abs(real - MMC),
    },
    nota: "La bonificación es |real − MMC|: cuanto más se aleja la pieza de su condición de máximo material, más tolerancia geométrica ganas. MMC es el diámetro MAYOR en un eje y el MENOR en un agujero. No se despeja el tamaño real porque el signo depende de eso.",
  },

  // ── Metrología ────────────────────────────────────────────────────
  27: {
    vars: [
      { key: "uc", sym: "u𝒸", name: "Incertidumbre combinada", unit: "—" },
      { key: "u1", sym: "u₁", name: "Contribución 1",          unit: "—" },
      { key: "u2", sym: "u₂", name: "Contribución 2",          unit: "—" },
    ],
    solve: {
      uc: ({ u1, u2 }) => sqrt(u1 * u1 + u2 * u2),
      u1: ({ uc, u2 }) => sqrt(uc * uc - u2 * u2),
      u2: ({ uc, u1 }) => sqrt(uc * uc - u1 * u1),
    },
    nota: "Dos fuentes independientes, en la misma unidad. Para un presupuesto completo (Tipo A/B, divisores, grados de libertad y U expandida) usa la herramienta de Incertidumbre.",
  },

  // ── Eléctrica ─────────────────────────────────────────────────────
  39: {
    vars: [
      { key: "Req", sym: "Req", name: "Resistencia equivalente", unit: "Ω" },
      { key: "R1",  sym: "R₁",  name: "Resistencia 1",           unit: "Ω" },
      { key: "R2",  sym: "R₂",  name: "Resistencia 2",           unit: "Ω" },
    ],
    solve: {
      Req: ({ R1, R2 }) => (R1 * R2) / (R1 + R2),
      R1:  ({ Req, R2 }) => (Req * R2) / (R2 - Req),
      R2:  ({ Req, R1 }) => (Req * R1) / (R1 - Req),
    },
    nota: "Dos resistencias en paralelo. Para tres o más, resuelve por pares: combina R₁ con R₂ y el resultado con R₃. Req siempre sale menor que la resistencia más chica.",
  },

  // ── Estática ──────────────────────────────────────────────────────
  44: {
    vars: [
      { key: "xc", sym: "x̄",  name: "Centroide del conjunto", unit: "mm" },
      { key: "A1", sym: "A₁", name: "Área 1",                 unit: "mm²" },
      { key: "x1", sym: "x₁", name: "Centroide del área 1",   unit: "mm" },
      { key: "A2", sym: "A₂", name: "Área 2",                 unit: "mm²" },
      { key: "x2", sym: "x₂", name: "Centroide del área 2",   unit: "mm" },
    ],
    solve: {
      xc: ({ A1, x1, A2, x2 }) => (A1 * x1 + A2 * x2) / (A1 + A2),
      x1: ({ xc, A1, A2, x2 }) => (xc * (A1 + A2) - A2 * x2) / A1,
      x2: ({ xc, A1, x1, A2 }) => (xc * (A1 + A2) - A1 * x1) / A2,
      A1: ({ xc, x1, A2, x2 }) => (A2 * (x2 - xc)) / (xc - x1),
      A2: ({ xc, A1, x1, x2 }) => (A1 * (x1 - xc)) / (xc - x2),
    },
    nota: "Dos áreas. Para una sección compuesta de más partes, ve acumulando: combina dos, y el resultado (con área A₁+A₂) trátalo como una sola. Un agujero entra con área negativa.",
  },

  42: {
    vars: [
      { key: "M", sym: "M", name: "Momento",          unit: "N·m" },
      { key: "F", sym: "F", name: "Fuerza",           unit: "N" },
      { key: "d", sym: "d", name: "Brazo de palanca", unit: "m" },
    ],
    solve: {
      M: ({ F, d }) => F * d,
      F: ({ M, d }) => M / d,
      d: ({ M, F }) => M / F,
    },
    nota: "d es la distancia perpendicular de la línea de acción al punto de giro.",
  },

  43: {
    vars: [
      { key: "f",  sym: "f", name: "Fuerza de fricción", unit: "N" },
      { key: "mu", sym: "μ", name: "Coef. de fricción",  unit: "—" },
      { key: "N",  sym: "N", name: "Fuerza normal",      unit: "N" },
    ],
    solve: {
      f:  ({ mu, N }) => mu * N,
      mu: ({ f, N }) => f / N,
      N:  ({ f, mu }) => f / mu,
    },
  },
};

// Las variables que la fórmula puede despejar, en el orden en que se ofrecen.
export const solvableKeys = (calc) => Object.keys(calc.solve);

// Resuelve `target` con los valores ya parseados del resto de variables.
// Devuelve { ok, value } o { ok:false, error } — nunca lanza.
export function resolver(calc, target, valores) {
  const fn = calc.solve[target];
  if (!fn) return { ok: false, error: "Esa variable no se puede despejar." };

  let value;
  try {
    value = fn(valores);
  } catch {
    return { ok: false, error: "No se pudo calcular con esos valores." };
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    return { ok: false, error: "El resultado no es un número: revisa que no haya una raíz de un negativo." };
  }
  if (!Number.isFinite(value)) {
    return { ok: false, error: "División entre cero: alguno de los datos deja el denominador en 0." };
  }
  return { ok: true, value };
}

// Formato de resultado: notación científica solo cuando el número se sale
// de lo legible, y sin ceros de relleno a la derecha.
export function formatResult(n) {
  if (n === 0) return "0";
  const mag = abs(n);
  if (mag >= 1e7 || mag < 1e-4) {
    return n.toExponential(4).replace(/\.?0+e/, "e");
  }
  return String(Number(n.toPrecision(6)));
}
