// Verificación de los despejes de src/data/formulaCalcs.js.
//
// Idea: para cada fórmula arma un juego de datos CONSISTENTE (valores
// arbitrarios para todas las variables menos una, que se calcula), y después
// despeja cada variable a partir de las demás. Si un despeje está mal escrito,
// no reproduce el valor del que partió y se reporta aquí.
//
//   node scripts/verify-calcs.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CALCS, resolver, solvableKeys } from "../src/data/formulaCalcs.js";
import { tokensDeFormula } from "../src/data/formulaViva.js";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const formulas = JSON.parse(readFileSync(join(raiz, "src/data/formulas.json"), "utf8"));

const byId = new Map(formulas.map((f) => [f.id, f]));
// Valores arbitrarios pero distintos entre sí, para no caer en casos degenerados
// (denominadores en cero, restas que se anulan).
const SEMILLAS = [2, 3, 5, 7, 11, 13];
const TOLERANCIA = 1e-9;

let fallos = 0;
let pruebas = 0;

for (const [idStr, calc] of Object.entries(CALCS)) {
  const id = Number(idStr);
  const f = byId.get(id);
  if (!f) {
    console.log(`✗ el id ${id} no existe en formulas.json`);
    fallos++;
    continue;
  }

  const keys = calc.vars.map((v) => v.key);
  const solve = solvableKeys(calc);

  for (const s of solve) {
    if (!keys.includes(s)) {
      console.log(`✗ [${id}] ${f.name}: el despeje "${s}" no está declarado en vars`);
      fallos++;
    }
  }

  // Base consistente: el primer despeje se calcula a partir del resto.
  const primero = solve[0];
  const base = {};
  calc.vars.forEach((v, i) => {
    if (v.key === primero) return;
    base[v.key] = v.def !== undefined ? v.def : SEMILLAS[i % SEMILLAS.length];
  });
  const inicial = resolver(calc, primero, base);
  if (!inicial.ok) {
    console.log(`✗ [${id}] ${f.name}: no se pudo armar el juego base (${inicial.error})`);
    fallos++;
    continue;
  }
  base[primero] = inicial.value;

  // Cada despeje debe reproducir el valor que tiene en la base.
  for (const target of solve) {
    pruebas++;
    const entrada = { ...base };
    delete entrada[target];
    const r = resolver(calc, target, entrada);
    if (!r.ok) {
      console.log(`✗ [${id}] ${f.name} → ${target}: ${r.error}`);
      fallos++;
      continue;
    }
    const esperado = base[target];
    const error = Math.abs(r.value - esperado) / (Math.abs(esperado) || 1);
    if (error > TOLERANCIA) {
      console.log(`✗ [${id}] ${f.name} → ${target}: esperaba ${esperado}, dio ${r.value}`);
      fallos++;
    }
  }
}

// ── Fórmula viva ──────────────────────────────────────────────────────
// No es un fallo que una fórmula no se pueda reescribir con números (hay
// motivos legítimos), pero sí conviene ver la lista: si crece sin razón,
// alguien renombró un `sym` y lo rompió sin enterarse.
const noSustituibles = [];
for (const [idStr, calc] of Object.entries(CALCS)) {
  const f = byId.get(Number(idStr));
  if (!f) continue;
  if (!tokensDeFormula(f.formula, calc)) noSustituibles.push(`[${idStr}] ${f.name} — ${f.formula}`);
}

const total = Object.keys(CALCS).length;
console.log(`\nFórmula viva: ${total - noSustituibles.length}/${total} se reescriben con los números del usuario`);
for (const n of noSustituibles) console.log(`  · sin sustituir: ${n}`);

console.log(`\n${total} fórmulas con calculadora · ${pruebas} despejes probados · ${fallos} fallos`);
process.exit(fallos ? 1 : 0);
