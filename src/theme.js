// ── Sistema de diseño brutalista / retro ─────────────────────────────
// Fuente única de verdad para que TODAS las herramientas combinen entre sí.
// Nada de glows, gradientes, blur ni morado: papel crema, tinta negra,
// bordes sólidos de 2px y sombra dura desplazada. Mono SOLO para datos.

export const PAPER = "#fbf7ec"; // crema papel
export const PANEL = "#ffffff"; // tarjetas
export const INK = "#161616"; // tinta (casi negro, no #000 puro)
export const MUTE = "#5c5c54"; // texto secundario
export const FAINT = "#9a9a8c"; // texto terciario / placeholders

export const BORDER = `2px solid ${INK}`;
export const BORDER_THIN = `1px solid ${INK}`;
export const SHADOW = `5px 5px 0 ${INK}`;
export const SHADOW_SM = `3px 3px 0 ${INK}`;

// Sans para títulos/cuerpo, mono SOLO para números/fórmulas/inputs.
export const SANS = `Helvetica, Arial, "Helvetica Neue", system-ui, sans-serif`;
export const MONO = `"Courier New", "Courier", ui-monospace, Menlo, monospace`;

// Paleta plana retro (sin neón, sin morado). Una por herramienta.
export const ACCENTS = {
  green: "#2f7d4f",
  blue: "#2b4acc",
  yellow: "#e0a32e",
  pink: "#cf3b6b",
  cyan: "#1c7e96",
  orange: "#d9480f",
};

// ── helpers de estilo ────────────────────────────────────────────────
export const card = (extra = {}) => ({
  background: PANEL,
  border: BORDER,
  boxShadow: SHADOW,
  borderRadius: 0,
  ...extra,
});

export const field = (extra = {}) => ({
  background: PAPER,
  border: BORDER,
  borderRadius: 0,
  padding: "10px 12px",
  color: INK,
  fontFamily: MONO,
  fontSize: 15,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  ...extra,
});

// Etiqueta de sección: rectángulo negro sólido (NO píldora con glow).
export const tag = (extra = {}) => ({
  display: "inline-block",
  background: INK,
  color: PAPER,
  fontFamily: MONO,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1,
  padding: "4px 10px",
  textTransform: "uppercase",
  ...extra,
});
