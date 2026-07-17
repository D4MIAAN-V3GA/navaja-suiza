// Fuente única de verdad del catálogo de herramientas.
// Agregar una herramienta = una entrada en TOOLS. La consumen App (rutas),
// ToolsHub/ToolsGrid (shell + grid), Landing y CommandPalette.
import EquationSolver from "./EquationSolver";
import MatrixSolver from "./MatrixSolver";
import VectorCalculator from "./VectorCalculator";
import InertiaCalculator from "./InertiaCalculator";
import LinearInterpolator from "./LinearInterpolator";
import UnitConverter from "./UnitConverter";
import FormulaLibrary from "./FormulaLibrary";
import UncertaintyBudget from "./UncertaintyBudget";
import { ACCENTS } from "./theme";

export const CATEGORIES = [
  { id: "algebra", label: "Álgebra lineal" },
  { id: "secciones", label: "Secciones" },
  { id: "numerico", label: "Numérico" },
  { id: "unidades", label: "Unidades" },
  { id: "metrologia", label: "Metrología" },
  { id: "referencia", label: "Referencia" },
];

export const TOOLS = [
  { id: "ecuaciones",    label: "Ecuaciones",    desc: "Sistemas lineales n×n por Cramer",        category: "algebra",    accent: ACCENTS.blue,   component: EquationSolver },
  { id: "matrices",      label: "Matrices",      desc: "Gauss y Gauss-Jordan paso a paso",        category: "algebra",    accent: ACCENTS.brown,  component: MatrixSolver },
  { id: "vectores",      label: "Vectores",      desc: "Operaciones vectoriales en 3D",           category: "algebra",    accent: ACCENTS.green,  component: VectorCalculator },
  { id: "inercia",       label: "Inercia",       desc: "Momentos de inercia de secciones",        category: "secciones",  accent: ACCENTS.orange, component: InertiaCalculator },
  { id: "interpolacion", label: "Interpolación", desc: "Interpolación lineal entre puntos",       category: "numerico",   accent: ACCENTS.pink,   component: LinearInterpolator },
  { id: "unidades",      label: "Unidades",      desc: "Presión · torque · fuerza",               category: "unidades",   accent: ACCENTS.cyan,   component: UnitConverter },
  { id: "formulas",      label: "Fórmulas",      desc: "Biblioteca buscable de ingeniería",       category: "referencia", accent: ACCENTS.yellow, component: FormulaLibrary },
  { id: "incertidumbre", label: "Incertidumbre", desc: "Presupuesto GUM (Tipo A/B, U k=2)",       category: "metrologia", accent: ACCENTS.red,    component: UncertaintyBudget },
];

export const getTool = (id) => TOOLS.find((t) => t.id === id);
