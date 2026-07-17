// Solucionador de sistemas lineales con aritmética racional exacta (BigInt).
// Los resultados son fracciones exactas (7/3, no 2.3333), como en los libros.
// Lógica pura, sin React, para poder testearla con node (ver matrixSolve.test.js).
// Registra cada operación de fila como paso para el ProcedurePanel.

// ── Fracciones: {n: BigInt, d: BigInt}, d > 0, siempre reducidas ──
const gcdBig = (a, b) => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
};

export function frac(n, d = 1n) {
  if (d === 0n) throw new Error("denominador cero");
  if (d < 0n) { n = -n; d = -d; }
  const g = gcdBig(n, d) || 1n;
  return { n: n / g, d: d / g };
}

const F0 = frac(0n);
const isZero = (a) => a.n === 0n;
const sub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => frac(a.n * b.n, a.d * b.d);
const div = (a, b) => frac(a.n * b.d, a.d * b.n);

export const toNumber = (f) => Number(f.n) / Number(f.d);

// Acepta "3", "-2.5", "2/3", "1.5/2", "" (= 0). Inválido → null.
export function parseFraction(str) {
  const s = String(str).trim();
  if (s === "") return F0;
  const parts = s.split("/");
  if (parts.length > 2) return null;
  const dec = (t) => {
    t = t.trim();
    if (!/^[+-]?(\d+\.?\d*|\.\d+)$/.test(t)) return null;
    const neg = t.startsWith("-");
    t = t.replace(/^[+-]/, "");
    const [i, f = ""] = t.split(".");
    return frac(BigInt((neg ? "-" : "") + ((i || "0") + f)), 10n ** BigInt(f.length));
  };
  const a = dec(parts[0]);
  if (a === null || parts.length === 1) return a;
  const b = dec(parts[1]);
  if (b === null || isZero(b)) return null;
  return div(a, b);
}

// fmt: fracción → "7/3" (o "2" si es entera); número → decimal recortado.
export function fmt(x) {
  if (typeof x === "number") {
    if (Object.is(x, -0)) x = 0;
    if (!Number.isFinite(x)) return String(x);
    if (Number.isInteger(x)) return x.toString();
    return parseFloat(x.toFixed(4)).toString();
  }
  return x.d === 1n ? x.n.toString() : `${x.n}/${x.d}`;
}

// número (de tests) o fracción → fracción.
const toFrac = (x) => (typeof x === "number" ? parseFraction(String(x)) : x);

// "[  2   1  -1 |  8 ]" — fila de la matriz aumentada.
function rowStr(row) {
  const n = row.length - 1;
  const coefs = row.slice(0, n).map((x) => fmt(x).padStart(6)).join(" ");
  return `[ ${coefs} | ${fmt(row[n]).padStart(5)} ]`;
}

// input: matriz aumentada n×(n+1) (números o fracciones). method: "gauss" | "gauss-jordan".
// Devuelve { ok, solution? (fracciones), reason?, steps }.
export function solveMatrix(input, method = "gauss") {
  const n = input.length;
  const M = input.map((r) => r.map(toFrac));
  const steps = [];
  const snap = (title) => steps.push({ title, lines: M.map(rowStr) });

  snap("Matriz aumentada inicial");

  for (let col = 0; col < n; col++) {
    // Con aritmética exacta no hace falta pivoteo por magnitud: basta la
    // primera fila con pivote no nulo — igual que el método a mano.
    let piv = col;
    while (piv < n && isZero(M[piv][col])) piv++;
    if (piv === n) {
      return { ok: false, reason: "singular", steps };
    }
    if (piv !== col) {
      [M[col], M[piv]] = [M[piv], M[col]];
      snap(`Intercambio F${col + 1} ↔ F${piv + 1}`);
    }

    // Gauss-Jordan: normaliza el pivote a 1.
    if (method === "gauss-jordan" && !(M[col][col].n === 1n && M[col][col].d === 1n)) {
      const p = M[col][col];
      M[col] = M[col].map((x) => div(x, p));
      snap(`F${col + 1} ← F${col + 1} / (${fmt(p)})`);
    }

    // Filas a anular: solo debajo (Gauss) o todas menos el pivote (Gauss-Jordan).
    for (let r = 0; r < n; r++) {
      if (r === col || (method === "gauss" && r < col)) continue;
      const factor = div(M[r][col], M[col][col]);
      if (isZero(factor)) continue;
      M[r] = M[r].map((x, k) => sub(x, mul(factor, M[col][k])));
      snap(`F${r + 1} ← F${r + 1} − (${fmt(factor)})·F${col + 1}`);
    }
  }

  let solution;
  if (method === "gauss-jordan") {
    solution = M.map((row) => row[n]); // pivotes ya son 1
  } else {
    // Sustitución hacia atrás sobre la triangular superior.
    solution = new Array(n).fill(F0);
    for (let i = n - 1; i >= 0; i--) {
      let s = M[i][n];
      for (let j = i + 1; j < n; j++) s = sub(s, mul(M[i][j], solution[j]));
      solution[i] = div(s, M[i][i]);
    }
    steps.push({
      title: "Sustitución hacia atrás",
      lines: solution.map((x, i) => `x${i + 1} = ${fmt(x)}`),
    });
  }

  return { ok: true, solution, steps };
}

// Determinante n×n exacto por eliminación (O(n³)). Devuelve fracción.
// ponytail: cofactores recursivos serían O(n!) — inviables ya en 8×8.
export function detN(m) {
  const a = m.map((r) => r.map(toFrac));
  const n = a.length;
  let d = frac(1n);
  for (let c = 0; c < n; c++) {
    let p = c;
    while (p < n && isZero(a[p][c])) p++;
    if (p === n) return F0;
    if (p !== c) { [a[c], a[p]] = [a[p], a[c]]; d = mul(d, frac(-1n)); }
    d = mul(d, a[c][c]);
    for (let r = c + 1; r < n; r++) {
      const f = div(a[r][c], a[c][c]);
      if (isZero(f)) continue;
      for (let k = c; k < n; k++) a[r][k] = sub(a[r][k], mul(f, a[c][k]));
    }
  }
  return d;
}

// División de fracciones expuesta para Cramer (EquationSolver).
export const fracDiv = div;
