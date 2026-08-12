// ── Búsqueda difusa simple (sin librerías) ──────────────────────────
// La usa la búsqueda de FormulaLibrary.

// Minúsculas y sin acentos: "histeresis" debe encontrar "Histéresis".
const DIACRITICOS = /[̀-ͯ]/g;
export const normalize = (s) =>
  s.toLowerCase().normalize("NFD").replace(DIACRITICOS, "");

// Subsecuencia: las letras de la query aparecen en orden dentro del texto,
// no necesariamente contiguas. Devuelve un puntaje (mayor = mejor) o -1.
export function fuzzyScore(query, text) {
  if (!query) return 0;
  const q = normalize(query);
  const t = normalize(text);

  // coincidencia exacta de subcadena: puntaje alto, mejor si está al inicio
  const idx = t.indexOf(q);
  if (idx !== -1) return 1000 - idx;

  // subsecuencia difusa
  let qi = 0;
  let score = 0;
  let lastMatch = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      // letras consecutivas valen más
      score += lastMatch === ti - 1 ? 6 : 1;
      lastMatch = ti;
      qi++;
    }
  }
  return qi === q.length ? score : -1;
}
