// ── Fórmula viva ────────────────────────────────────────────────────
// Parte el string de la fórmula (formulas.json) en trozos: los símbolos de
// las variables por un lado y el texto literal (operadores, paréntesis,
// exponentes, constantes) por otro. Con eso la interfaz puede reescribir la
// fórmula con los números que el usuario va tecleando.
//
// Sin módulo aparte esto viviría dentro del componente y no se podría
// verificar desde un script. `node scripts/verify-calcs.mjs` lo revisa.

// Letras que pueden sobrar sin que la sustitución quede mal: son constantes
// escritas en la fórmula, no variables que se le pidan al usuario.
const CONSTANTES_OK = new Set(["π", "e"]);

const ES_LETRA = /\p{L}/u;

// Recorre el texto de izquierda a derecha y en cada posición intenta el
// símbolo MÁS LARGO que encaje. El orden importa: sin él, la "R" de la
// constante de los gases se comería la "R" de "Re" (Reynolds).
export function tokenizarFormula(text, syms) {
  const orden = [...syms].sort((a, b) => b.length - a.length);
  const tokens = [];
  let buffer = "";
  let i = 0;

  while (i < text.length) {
    const hit = orden.find((s) => s && text.startsWith(s, i));
    if (hit) {
      if (buffer) { tokens.push({ lit: buffer }); buffer = ""; }
      tokens.push({ sym: hit });
      i += hit.length;
    } else {
      buffer += text[i];
      i += 1;
    }
  }
  if (buffer) tokens.push({ lit: buffer });
  return tokens;
}

// ¿Se puede reescribir esta fórmula con números sin que quede rota?
// Dos condiciones, ambas necesarias:
//   1. Todas las variables de la calculadora aparecen en el texto. Si no,
//      la tarjeta y la calculadora usan formas distintas (Fourier: la tarjeta
//      va en diferencial, la calculadora en finita) y sustituir engaña.
//   2. Lo que sobra no tiene letras salvo constantes. Atrapa los símbolos
//      que encajan a medias ("σtrab" dentro de "σtrabajo" deja un "ajo") y
//      las fórmulas con variables que la calculadora no pide (P = V·I = I²R).
export function esSustituible(tokens, syms) {
  const hallados = new Set(tokens.filter((t) => t.sym).map((t) => t.sym));
  if (syms.some((s) => !hallados.has(s))) return false;

  for (const t of tokens) {
    if (!t.lit) continue;
    for (const ch of t.lit) {
      if (ES_LETRA.test(ch) && !CONSTANTES_OK.has(ch)) return false;
    }
  }
  return true;
}

// Atajo: tokens listos para pintar, o null si la fórmula no es sustituible.
export function tokensDeFormula(formula, calc) {
  const syms = calc.vars.map((v) => v.sym);
  const tokens = tokenizarFormula(formula, syms);
  return esSustituible(tokens, syms) ? tokens : null;
}
