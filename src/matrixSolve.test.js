// Self-check ejecutable: node src/matrixSolve.test.js
import assert from "node:assert/strict";
import { solveMatrix, detN, parseFraction, fmt, toNumber } from "./matrixSolve.js";

const approx = (a, b, t = 1e-9) => Math.abs(a - b) < t;
const solOk = (sol, exp) =>
  sol.length === exp.length && sol.every((v, i) => approx(toNumber(v), exp[i]));

// Sistema 3×3 con solución conocida x=2, y=3, z=-1.
const A = [
  [2, 1, -1, 8],
  [-3, -1, 2, -11],
  [-2, 1, 2, -3],
];
const expected = [2, 3, -1];

for (const method of ["gauss", "gauss-jordan"]) {
  const r = solveMatrix(A, method);
  assert.equal(r.ok, true, `${method}: debería resolver`);
  assert.ok(solOk(r.solution, expected), `${method}: solución incorrecta -> ${r.solution.map(fmt)}`);
  assert.ok(r.steps.length > 1, `${method}: debería registrar pasos`);
}

// Sistema 5×5: b se construye como A·x con x conocida, para probar n arbitrario.
const x5 = [1, -2, 3, 0.5, -1];
const A5coef = [
  [4, 1, 0, 2, -1],
  [1, 5, -2, 0, 3],
  [0, -1, 6, 1, 2],
  [2, 0, 1, 7, -3],
  [-1, 3, 2, -2, 8],
];
const A5 = A5coef.map((row) => [...row, row.reduce((s, a, j) => s + a * x5[j], 0)]);
for (const method of ["gauss", "gauss-jordan"]) {
  const r = solveMatrix(A5, method);
  assert.equal(r.ok, true, `${method} 5x5: debería resolver`);
  assert.ok(solOk(r.solution, x5), `${method} 5x5: solución incorrecta -> ${r.solution.map(fmt)}`);
}

// Resultados EXACTOS en fracción: 2x+y=1, x+3y=2 -> x=1/5, y=3/5.
for (const method of ["gauss", "gauss-jordan"]) {
  const r = solveMatrix([[2, 1, 1], [1, 3, 2]], method);
  assert.equal(fmt(r.solution[0]), "1/5", `${method}: x debería ser 1/5`);
  assert.equal(fmt(r.solution[1]), "3/5", `${method}: y debería ser 3/5`);
}

// Sistema singular (filas dependientes) -> sin solución única (detección exacta).
const singular = [
  [1, 1, 2],
  [2, 2, 4],
];
assert.equal(solveMatrix(singular, "gauss").ok, false, "singular debería fallar");
assert.equal(solveMatrix(singular, "gauss-jordan").ok, false, "singular debería fallar");

// detN: casos conocidos (devuelve fracción).
assert.equal(fmt(detN([[1, 2], [3, 4]])), "-2", "det 2x2");
assert.equal(fmt(detN([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]])), "-1", "det 3x3");
assert.equal(fmt(detN([[1, 1], [2, 2]])), "0", "det singular = 0");
assert.equal(fmt(detN([[0.5, 0.25], [0.25, 0.5]])), "3/16", "det con fracciones exactas");

// parseFraction: entradas válidas e inválidas.
assert.equal(fmt(parseFraction("2/3")), "2/3");
assert.equal(fmt(parseFraction("-1.5")), "-3/2");
assert.equal(fmt(parseFraction(" 4 / 6 ")), "2/3");
assert.equal(fmt(parseFraction("")), "0");
assert.equal(fmt(parseFraction("7")), "7");
assert.equal(fmt(parseFraction(".5")), "1/2");
assert.equal(parseFraction("abc"), null);
assert.equal(parseFraction("2/0"), null);
assert.equal(parseFraction("1/2/3"), null);

console.log("OK: matrixSolve exacto — Gauss, Gauss-Jordan (3×3, 5×5), fracciones, detN, parseFraction y singular.");
