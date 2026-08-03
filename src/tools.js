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
import TurTar from "./TurTar";
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
  { id: "ecuaciones",    label: "Ecuaciones",    desc: "Dale los coeficientes, te regresa x, y, z con el desarrollo", category: "algebra",    accent: ACCENTS.blue,   component: EquationSolver },
  { id: "matrices",      label: "Matrices",      desc: "Reduce tu matriz por Gauss sin equivocarte en un signo",      category: "algebra",    accent: ACCENTS.brown,  component: MatrixSolver },
  { id: "vectores",      label: "Vectores",      desc: "Producto punto, cruz y magnitud sin errores de signo",        category: "algebra",    accent: ACCENTS.green,  component: VectorCalculator },
  { id: "inercia",       label: "Inercia",       desc: "Centroide e inercia de tu perfil, listos para copiar",        category: "secciones",  accent: ACCENTS.orange, component: InertiaCalculator },
  { id: "interpolacion", label: "Interpolación", desc: "El valor entre dos puntos de tu tabla, en segundos",          category: "numerico",   accent: ACCENTS.pink,   component: LinearInterpolator },
  { id: "unidades",      label: "Unidades",      desc: "Convierte y te avisa si tu número no tiene sentido",          category: "unidades",   accent: ACCENTS.cyan,   component: UnitConverter },
  { id: "formulas",      label: "Fórmulas",      desc: "Busca la fórmula que se te olvidó, sin abrir el libro",       category: "referencia", accent: ACCENTS.yellow, component: FormulaLibrary },
  { id: "incertidumbre", label: "Incertidumbre", desc: "Presupuesto GUM completo con reporte descargable",            category: "metrologia", accent: ACCENTS.red,    component: UncertaintyBudget },
  { id: "tur",           label: "TUR / TAR",     desc: "¿Tu patrón pasa la regla 4:1? Te doy el veredicto",           category: "metrologia", accent: ACCENTS.brown,  component: TurTar },
];

export const getTool = (id) => TOOLS.find((t) => t.id === id);
