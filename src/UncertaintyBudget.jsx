import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { ProcedurePanel } from "./ProcedurePanel";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, SHADOW, SHADOW_SM, ACCENTS } from "./theme";

const ACCENT = ACCENTS.red;

const PAGE_TITLE = "Cómo calcular la incertidumbre de medición (GUM) — Calculadora online gratis";
const PAGE_DESC =
  "Aprende a calcular la incertidumbre de medición paso a paso según la Guía GUM y genera tu presupuesto de incertidumbre online: Tipo A y B, distribuciones, Welch–Satterthwaite e incertidumbre expandida U (k=2).";

// ── Distribuciones y sus divisores (GUM, JCGM 100) ─────────────────
const DISTRIBUTIONS = {
  normal1: { label: "Normal — Tipo A (desv. estándar s)", divisor: 1,             divisorLabel: "1",   tipo: "A", hint: "Desviación estándar s de tus repeticiones" },
  normal2: { label: "Normal — certificado (U, k=2)",      divisor: 2,             divisorLabel: "2",   tipo: "B", hint: "U expandida que reporta el certificado (k=2)" },
  rect:    { label: "Rectangular — semiamplitud (a)",     divisor: Math.sqrt(3),  divisorLabel: "√3",  tipo: "B", hint: "Semiamplitud a (ej. resolución ÷ 2)" },
  rect12:  { label: "Rectangular — amplitud total (W)",   divisor: Math.sqrt(12), divisorLabel: "√12", tipo: "B", hint: "Amplitud total W (ej. resolución completa d)" },
  tri:     { label: "Triangular",                         divisor: Math.sqrt(6),  divisorLabel: "√6",  tipo: "B", hint: "Semiamplitud a del intervalo" },
  ushape:  { label: "Forma de U (senoidal)",              divisor: Math.SQRT2,    divisorLabel: "√2",  tipo: "B", hint: "Semiamplitud a (ej. variación cíclica de temperatura)" },
};

// Fuentes típicas de un presupuesto (GUM / EA-4/02) — un clic y quedan con su distribución usual.
const PRESETS = [
  { name: "Repetibilidad",          dist: "normal1", desc: "Desv. estándar s de n lecturas repetidas" },
  { name: "Reproducibilidad",       dist: "normal1", desc: "Variación entre operadores / días / equipos" },
  { name: "Calibración del patrón", dist: "normal2", desc: "U del certificado de calibración vigente" },
  { name: "Resolución",             dist: "rect12",  desc: "Resolución completa d del instrumento" },
  { name: "Deriva",                 dist: "rect",    desc: "Cambio del patrón entre calibraciones" },
  { name: "Temperatura",            dist: "rect",    desc: "Efecto térmico (ej. dilatación L·α·ΔT)" },
  { name: "Histéresis",             dist: "rect",    desc: "Diferencia entre lectura ascendente y descendente" },
];

const K_OPTIONS = [
  { k: 1, conf: "≈ 68.27%" },
  { k: 2, conf: "≈ 95.45%" },
  { k: 3, conf: "≈ 99.73%" },
];

// ID único real — un contador de módulo se reinicia con el hot-reload y duplica IDs.
const newId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
const makeSource = (name = "", dist = "rect", desc = "") => ({ id: newId(), name, dist, desc, value: "", ci: "1", n: "" });

// Divisor efectivo: para Tipo A con n ≥ 2 lecturas es √n (incertidumbre de la media, u = s/√n).
const divisorOf = (s) => {
  if (s.dist === "normal1") {
    const n = parseInt(s.n, 10);
    return n >= 2 ? Math.sqrt(n) : 1;
  }
  return DISTRIBUTIONS[s.dist].divisor;
};
const divisorLabelOf = (s) => {
  if (s.dist === "normal1") {
    const n = parseInt(s.n, 10);
    return n >= 2 ? `√${n}` : "1";
  }
  return DISTRIBUTIONS[s.dist].divisorLabel;
};
// Grados de libertad: Tipo A → n−1 (GUM G.3.3); Tipo B → ∞ (GUM G.4.3, evaluación bien fundamentada).
const dofOf = (s) => {
  if (s.dist === "normal1") {
    const n = parseInt(s.n, 10);
    return n >= 2 ? n - 1 : Infinity;
  }
  return Infinity;
};

// t de Student al 95.45% según ν (GUM, Tabla G.2). Se trunca ν_eff hacia abajo — conservador.
const T_9545 = [
  [1, 13.97], [2, 4.53], [3, 3.31], [4, 2.87], [5, 2.65], [6, 2.52], [7, 2.43], [8, 2.37],
  [9, 2.32], [10, 2.28], [11, 2.25], [12, 2.23], [13, 2.21], [14, 2.20], [15, 2.18],
  [16, 2.17], [17, 2.16], [18, 2.15], [19, 2.14], [20, 2.13], [25, 2.11], [30, 2.09],
  [35, 2.07], [40, 2.06], [45, 2.06], [50, 2.05], [100, 2.025],
];
const kSuggested = (veff) => {
  if (!isFinite(veff)) return 2.0;
  const v = Math.floor(veff);
  if (v < 1) return T_9545[0][1];
  let t = 2.0;
  for (const [nu, tv] of T_9545) {
    if (v >= nu) t = tv;
    else break;
  }
  return t;
};

function fmt(n) {
  if (!isFinite(n) || isNaN(n)) return "—";
  if (n === 0) return "0";
  if (Math.abs(n) >= 1e7 || (Math.abs(n) < 0.0001 && n !== 0))
    return n.toExponential(4);
  return parseFloat(n.toPrecision(6)).toString();
}

// Agrupación SI/BIPM: espacio fino cada 3 dígitos, a ambos lados del punto decimal.
function groupSI(str) {
  const [sign, rest] = str.startsWith("-") ? ["-", str.slice(1)] : ["", str];
  if (rest.includes("e")) return sign + rest; // la notación científica se deja tal cual
  const [int, dec] = rest.split(".");
  const gInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const gDec = dec ? dec.replace(/(\d{3})(?=\d)/g, "$1 ") : "";
  return sign + gInt + (dec ? "." + gDec : "");
}
const fmtSI = (n) => groupSI(fmt(n));
// La incertidumbre final se expresa con 2 cifras significativas (GUM 7.2.6).
const fmtU = (n) => {
  if (!isFinite(n) || isNaN(n)) return "—";
  return groupSI(Number(n.toPrecision(2)).toString());
};
// Los grados de libertad se reportan con 1 decimal — más de eso es ruido.
const fmtGl = (n) => (isFinite(n) ? groupSI((Math.round(n * 10) / 10).toString()) : "∞");

// ── Bloques de texto del artículo (SANS para cuerpo, MONO solo para fórmulas) ──
const h2Style = { fontFamily: SANS, fontSize: "clamp(19px, 3.5vw, 24px)", fontWeight: 800, color: INK, letterSpacing: "-0.01em", margin: "0 0 10px" };
const pStyle = { fontFamily: SANS, fontSize: 15, color: "#333330", lineHeight: 1.75, margin: "0 0 14px" };
const formulaStyle = {
  fontFamily: MONO, fontSize: 14, color: INK, background: PANEL,
  border: BORDER_THIN, padding: "10px 14px", margin: "0 0 14px",
  overflowX: "auto", whiteSpace: "nowrap",
};

export default function UncertaintyBudget() {
  const [sources, setSources] = useState(() => [makeSource("Repetibilidad", "normal1", "Desv. estándar s de n lecturas repetidas")]);
  const [k, setK] = useState(2);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Lead Wall B2B: el resultado se desbloquea al dejar los datos (una vez por sesión).
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", role: "", company: "" });

  // SEO: título y descripción propios de esta ruta; se restauran al salir.
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content");
    document.title = PAGE_TITLE;
    meta?.setAttribute("content", PAGE_DESC);
    return () => {
      document.title = prevTitle;
      if (prevDesc) meta?.setAttribute("content", prevDesc);
    };
  }, []);

  const updateSource = (id, patch) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setResults(null);
    setError(null);
  };
  const addSource = (name = "", dist = "rect", desc = "") => {
    setSources((prev) => [...prev, makeSource(name, dist, desc)]);
    setResults(null);
    setError(null);
  };
  const removeSource = (id) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    setResults(null);
    setError(null);
  };
  const pickK = (kv) => {
    setK(kv);
    setResults(null);
    setError(null);
  };

  // Validación previa: si algo está mal, muestra el error y no abre el Lead Wall.
  const validateSources = () => {
    const filled = sources.filter((s) => s.value !== "");
    if (filled.length === 0) {
      setError("Necesitas al menos una fuente con valor — sin datos no hay presupuesto, ingeniero.");
      setResults(null);
      return false;
    }
    for (const s of filled) {
      const v = parseFloat(s.value);
      if (!isFinite(v) || v <= 0) {
        setError(`Revisa «${s.name || "fuente sin nombre"}» — la incertidumbre tiene que ser un número mayor que cero.`);
        setResults(null);
        return false;
      }
    }
    return true;
  };

  // Motor matemático — corre solo después de validar y capturar el lead.
  const runEstimation = () => {
    const filled = sources.filter((s) => s.value !== "");
    const rows = filled.map((s, i) => {
      const v = parseFloat(s.value);
      const ci = s.ci === "" ? 1 : parseFloat(s.ci) || 0;
      const u = v / divisorOf(s);            // incertidumbre estándar u(xᵢ)
      const contrib = Math.abs(ci) * u;      // contribución uᵢ(y) = |cᵢ|·u(xᵢ)
      return {
        name: s.name || `Fuente ${i + 1}`, dist: s.dist, desc: s.desc,
        divLabel: divisorLabelOf(s), dof: dofOf(s), v, ci, u, contrib,
      };
    });
    const sumSq = rows.reduce((acc, r) => acc + r.contrib * r.contrib, 0);
    const uc = Math.sqrt(sumSq);           // incertidumbre combinada u_c
    const U = k * uc;                      // incertidumbre expandida U = k·u_c
    rows.forEach((r) => { r.pct = uc > 0 ? (r.contrib * r.contrib / sumSq) * 100 : 0; });
    const dominant = rows.reduce((a, b) => (b.pct > a.pct ? b : a), rows[0]);
    // Welch–Satterthwaite: solo las fuentes con ν finito aportan al denominador.
    const wsDen = rows.reduce((acc, r) => acc + (isFinite(r.dof) ? Math.pow(r.contrib, 4) / r.dof : 0), 0);
    const veff = wsDen > 0 ? Math.pow(uc, 4) / wsDen : Infinity;
    const kSug = kSuggested(veff);
    setError(null);
    setResults({ rows, uc, U, k, dominant, veff, kSug });
  };

  // El cálculo es libre: valida y muestra el resultado (con marca de agua en pantalla).
  const handleCalculate = () => {
    if (!validateSources()) return;
    runEstimation();
  };

  // Reporte formal (sin marca de agua) en ventana nueva — el usuario decide cuándo imprimir/guardar.
  const downloadReport = (res) => {
    if (!res) return;
    const w = window.open("", "_blank", "width=1000,height=960");
    if (!w) return;
    const kConf = K_OPTIONS.find((o) => o.k === res.k)?.conf || "";
    const rowsHtml = res.rows.map((r, i) => {
      const d = DISTRIBUTIONS[r.dist];
      return `<tr><td>${i + 1}</td><td>${r.name}</td><td>${r.desc || "—"}</td><td>${d.tipo}</td><td>${d.label}</td><td class="num">${fmtSI(r.v)}</td><td class="num">÷ ${r.divLabel}</td><td class="num">${fmtSI(r.u)}</td><td class="num">${fmtSI(r.ci)}</td><td class="num">${fmtSI(r.contrib)}</td><td class="num">${isFinite(r.dof) ? r.dof : "&infin;"}</td><td class="num">${r.pct.toFixed(1)}%</td></tr>`;
    }).join("");
    // Fecha en formato metrológico ISO 8601 (AAAA-MM-DD), con la fecha local.
    const dNow = new Date();
    const pad2 = (x) => String(x).padStart(2, "0");
    const fecha = `${dNow.getFullYear()}-${pad2(dNow.getMonth() + 1)}-${pad2(dNow.getDate())}`;
    const kWarning = res.kSug > res.k + 0.05
      ? `<p class="warn"><strong>Nota:</strong> el factor de cobertura utilizado (k=${res.k}) es menor al sugerido por los grados
         efectivos de libertad (k=${res.kSug.toFixed(2)}). Con pocas repeticiones Tipo A, k=${res.k} puede subestimar la
         incertidumbre expandida.</p>`
      : "";
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Reporte de incertidumbre de medición — ${fecha}</title>
<style>
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: Helvetica, Arial, sans-serif; color: #161616; margin: 0; background: #f2f0ea; }
  .page { max-width: 780px; margin: 24px auto; background: #fff; border: 1px solid #161616; padding: 48px 56px; }
  .doc-head { border-bottom: 3px double #161616; padding-bottom: 14px; margin-bottom: 18px; }
  .brand { font-family: "Courier New", monospace; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px; }
  h1 { font-size: 19px; letter-spacing: 0.5px; margin: 0 0 4px; text-transform: uppercase; }
  .method { font-size: 11px; color: #5c5c54; }
  table.meta { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px; }
  table.meta td { border: 1px solid #161616; padding: 6px 10px; }
  table.meta td.lbl { background: #f2f0ea; font-weight: bold; width: 22%; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #161616; padding-bottom: 4px; margin: 26px 0 10px; }
  table.data { width: 100%; border-collapse: collapse; font-size: 10.5px; }
  table.data th, table.data td { border: 1px solid #161616; padding: 5px 7px; text-align: left; vertical-align: top; }
  table.data th { background: #161616; color: #fbf7ec; font-size: 8.5px; letter-spacing: 1px; text-transform: uppercase; }
  td.num { font-family: "Courier New", monospace; white-space: nowrap; text-align: right; }
  table.res { width: 100%; border-collapse: collapse; font-size: 12px; }
  table.res td { border: 1px solid #161616; padding: 8px 12px; }
  table.res td.sym { font-family: "Courier New", monospace; font-weight: bold; width: 90px; text-align: center; }
  table.res td.val { font-family: "Courier New", monospace; font-weight: bold; text-align: right; width: 200px; }
  table.res tr.final td { background: #161616; color: #fbf7ec; font-size: 14px; }
  .decl { font-size: 11.5px; line-height: 1.7; text-align: justify; margin: 8px 0 0; }
  .warn { font-size: 11px; line-height: 1.6; border: 1px solid #161616; background: #f2f0ea; padding: 8px 12px; margin: 12px 0 0; }
  .sign { display: flex; gap: 60px; margin-top: 54px; }
  .sign div { flex: 1; border-top: 1px solid #161616; padding-top: 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; text-align: center; }
  .doc-foot { margin-top: 36px; border-top: 1px solid #161616; padding-top: 8px; font-size: 9px; color: #5c5c54;
    display: flex; justify-content: space-between; font-family: "Courier New", monospace; }
  @media print {
    body { background: #fff; }
    .page { border: none; margin: 0; max-width: none; padding: 12px 8px; }
  }
</style></head><body>
<div class="page">
  <div class="doc-head">
    <div class="brand">Industrias Muñeco · industriasmuneco.com</div>
    <h1>Reporte de estimación de incertidumbre de medición</h1>
    <div class="method">Método: Guía GUM (JCGM 100:2008)</div>
  </div>

  <table class="meta">
    <tr>
      <td class="lbl">Fecha de emisión</td><td>${fecha}</td>
      <td class="lbl">Fuentes evaluadas</td><td>${res.rows.length}</td>
    </tr>
    <tr>
      <td class="lbl">Factor de cobertura</td><td>k = ${res.k}</td>
      <td class="lbl">Nivel de confianza</td><td>${kConf} (distribución normal)</td>
    </tr>
  </table>

  <h2>1. Presupuesto de incertidumbre</h2>
  <table class="data">
    <thead><tr><th>#</th><th>Fuente</th><th>Origen / descripción</th><th>Tipo</th><th>Distribución</th><th>Valor</th><th>Divisor</th><th>u(x&#7522;)</th><th>c&#7522;</th><th>c&#7522;·u(x&#7522;)</th><th>gl</th><th>% contrib.</th></tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>

  <h2>2. Resultados</h2>
  <table class="res">
    <tr><td>Incertidumbre estándar combinada</td><td class="sym">u_c</td><td class="val">${fmtSI(res.uc)}</td></tr>
    <tr><td>Grados efectivos de libertad (Welch&ndash;Satterthwaite)</td><td class="sym">gl_eff</td><td class="val">${fmtGl(res.veff)}</td></tr>
    <tr><td>Factor de cobertura sugerido (t de Student, 95.45%)</td><td class="sym">k_sug</td><td class="val">${res.kSug.toFixed(2)}</td></tr>
    <tr class="final"><td>Incertidumbre expandida (2 cifras significativas)</td><td class="sym">U</td><td class="val">± ${fmtU(res.U)}</td></tr>
  </table>

  <h2>3. Declaración</h2>
  <p class="decl">
    La incertidumbre expandida de la medición se declara como <strong>U = ± ${fmtU(res.U)}</strong>, obtenida al multiplicar
    la incertidumbre estándar combinada u_c = ${fmtSI(res.uc)} por el factor de cobertura k = ${res.k}, correspondiente a un
    nivel de confianza de aproximadamente ${kConf.replace("≈ ", "")} suponiendo una distribución normal del resultado.
    La incertidumbre expandida se expresa con dos cifras significativas conforme a la práctica recomendada por la GUM (7.2.6).
    Los grados efectivos de libertad se estimaron mediante la ecuación de Welch&ndash;Satterthwaite (gl_eff = ${fmtGl(res.veff)}).
  </p>
  ${kWarning}

  <div class="sign">
    <div>Elaboró</div>
    <div>Revisó</div>
  </div>

  <div class="doc-foot">
    <span>Generado con la calculadora GUM de La Navaja Suiza del Ingeniero</span>
    <span>${fecha}</span>
  </div>
</div>
<script>window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 150); });</script>
</body></html>`);
    w.document.close();
  };

  // El registro desbloquea la descarga limpia — el cálculo nunca se bloquea.
  const handleDownloadClick = () => {
    if (!results) return;
    if (leadCaptured) {
      downloadReport(results);
      return;
    }
    setIsModalOpen(true);
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    // Simulación del envío a base de datos — aquí irá el POST real al backend.
    console.log("Lead B2B capturado:", lead);
    setIsModalOpen(false);
    setLeadCaptured(true);
    downloadReport(results);
  };

  const procSteps = results ? [
    {
      title: "Normalizar cada fuente a incertidumbre estándar u(xᵢ)",
      lines: results.rows.map((r) => `u(${r.name}) = ${fmtSI(r.v)} ÷ ${r.divLabel} = ${fmtSI(r.u)}`),
    },
    {
      title: "Contribución de cada fuente uᵢ(y) = |cᵢ| · u(xᵢ)",
      lines: results.rows.map((r) => `${r.name}: |${fmtSI(r.ci)}| × ${fmtSI(r.u)} = ${fmtSI(r.contrib)}`),
    },
    {
      title: "Suma en cuadratura (RSS) → incertidumbre combinada",
      lines: [
        `u_c = √( ${results.rows.map((r) => `${fmtSI(r.contrib)}²`).join(" + ")} )`,
        `u_c = √( ${fmtSI(results.rows.reduce((a, r) => a + r.contrib * r.contrib, 0))} ) = ${fmtSI(results.uc)}`,
      ],
    },
    {
      title: "Grados efectivos de libertad (Welch–Satterthwaite)",
      lines: [
        `gl_eff = u_c⁴ / Σ(uᵢ⁴/glᵢ) = ${isFinite(results.veff) ? fmtGl(results.veff) : "∞ (todas las fuentes con gl infinitos)"}`,
        `k sugerido (t de Student al 95.45% con gl_eff): ${results.kSug.toFixed(2)}`,
      ],
    },
    {
      title: "Incertidumbre expandida U = k · u_c",
      lines: [
        `U = ${results.k} × ${fmtSI(results.uc)} = ${fmtSI(results.U)}`,
        `Se reporta ± ${fmtU(results.U)} — redondeada a 2 cifras significativas (GUM 7.2.6)`,
        `Nivel de confianza ${K_OPTIONS.find((o) => o.k === results.k)?.conf || ""} (distribución normal)`,
      ],
    },
  ] : [];

  return (
    <div style={{ minHeight: "100vh", background: PAPER, color: INK, fontFamily: SANS }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 16px" }}>

        {/* Navegación de regreso */}
        <div style={{ padding: "28px 0 0", display: "flex", gap: 18, flexWrap: "wrap" }}>
          <Link to="/" style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: INK, textDecoration: "none", textTransform: "uppercase" }}>
            ← Inicio
          </Link>
          <Link to="/herramientas" style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: MUTE, textDecoration: "none", textTransform: "uppercase" }}>
            Todas las herramientas →
          </Link>
        </div>

        {/* ── Sección 1: contenido SEO / educativo ── */}
        <article style={{ padding: "36px 0 8px" }}>
          <header>
            <span style={{ display: "inline-block", background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", marginBottom: 14, textTransform: "uppercase" }}>
              Metrología · Guía GUM
            </span>
            <h1 style={{ fontFamily: SANS, fontWeight: 800, fontSize: "clamp(28px, 6vw, 46px)", lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 14px", color: INK }}>
              Cómo calcular la incertidumbre de medición: el presupuesto GUM
            </h1>
            <p style={{ ...pStyle, fontFamily: MONO, fontSize: 13, color: MUTE }}>
              Qué es, cómo se arma y una calculadora para estimarlo sin sufrir — Tipo A, Tipo B, suma en cuadratura e incertidumbre expandida (U, k=2).
            </p>
            <button
              onClick={() => document.getElementById("calculadora")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 18px", border: BORDER, background: ACCENT, boxShadow: SHADOW_SM,
                color: "#fff", fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", marginBottom: 10, cursor: "pointer", borderRadius: 0,
              }}
            >
              ↓ Ir directo a la calculadora
            </button>
          </header>

          <section style={{ marginTop: 28 }}>
            <h2 style={h2Style}>¿Qué es un presupuesto de incertidumbre?</h2>
            <p style={pStyle}>
              Ninguna medición es exacta. El <strong>presupuesto de incertidumbre</strong> (uncertainty budget) es la tabla donde
              desglosas, fuente por fuente, todo lo que le mete duda a tu resultado: la repetibilidad de tus lecturas, la
              calibración del patrón, la resolución del instrumento, la deriva, la temperatura. La <strong>Guía GUM</strong> (JCGM 100,
              <em> Guide to the Expression of Uncertainty in Measurement</em>) es el documento de referencia internacional que define
              cómo cuantificar cada fuente, cómo combinarlas y cómo reportar el resultado final. Si trabajas en un laboratorio
              acreditado bajo ISO/IEC 17025, el presupuesto de incertidumbre no es opcional: es el corazón de tu trazabilidad.
            </p>
            <p style={pStyle}>
              La lógica es simple: cada fuente se convierte a una <strong>incertidumbre estándar</strong> u(xᵢ) dividiendo el
              valor que conoces entre el <strong>divisor de su distribución de probabilidad</strong>. Ojo con un matiz que causa
              confusión: incertidumbre estándar y desviación estándar <em>no son lo mismo</em>. La desviación estándar describe la
              dispersión de un conjunto de datos que ya mediste; la incertidumbre estándar expresa la duda sobre tu resultado
              usando el <em>formato</em> de una desviación estándar — precisamente para que fuentes de origen muy distinto
              (un certificado, una resolución, tus repeticiones) queden en la misma escala y se puedan combinar. Después todas
              se combinan y el resultado se expande a un nivel de confianza útil.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={h2Style}>Evaluación Tipo A vs. Tipo B</h2>
            <p style={pStyle}>
              La GUM clasifica las fuentes según <em>cómo obtienes</em> el número, no según su naturaleza física:
            </p>
            <p style={pStyle}>
              <strong>Tipo A — estadística.</strong> Sale de tus propios datos: repites la medición n veces y calculas la
              desviación estándar experimental s. La repetibilidad es el ejemplo clásico, y aquí va el detalle que muchos
              presupuestos hacen mal: como tu resultado normalmente es la <em>media</em> de esas n lecturas, la incertidumbre
              estándar es <strong>u = s/√n</strong> — la incertidumbre de la media, no la de una lectura individual. Usar s
              directa (÷1) solo aplica cuando reportas una sola lectura. Además, una fuente Tipo A trae consigo sus{" "}
              <strong>grados de libertad ν = n−1</strong>, un dato que importa después para calcular k.
            </p>
            <p style={pStyle}>
              <strong>Tipo B — todo lo demás.</strong> Sale de información externa: el certificado de calibración del patrón,
              la especificación del fabricante, la resolución del instrumento, tablas, experiencia previa. Aquí asignas una
              distribución de probabilidad según lo que sabes del dato, y esa distribución dicta el divisor:
            </p>
            <div style={formulaStyle}>
              Normal (certificado) → ÷ k&nbsp;&nbsp;·&nbsp;&nbsp;Rectangular → ÷ √3 (o √12)&nbsp;&nbsp;·&nbsp;&nbsp;Triangular → ÷ √6&nbsp;&nbsp;·&nbsp;&nbsp;Forma de U → ÷ √2
            </div>
            <p style={pStyle}>
              El divisor no es un número mágico: es la relación estadística entre el intervalo que conoces y la desviación
              estándar de la distribución que asumiste. Esto es lo que indica cada uno y de dónde sale:
            </p>
            <p style={pStyle}>
              <strong>Rectangular (÷√3).</strong> Todos los valores dentro de ±a son igual de probables — no tienes razón para
              creer que el valor real esté más cerca del centro que de los bordes. La varianza de una distribución uniforme
              en ±a es a²/3, así que su desviación estándar es a/√3. Es la asunción más conservadora y la más común:
              resolución, tolerancias del fabricante, valores de tablas.
            </p>
            <p style={pStyle}>
              <strong>Rectangular con √12.</strong> Es la misma distribución, pero se usa cuando el dato que tienes es la{" "}
              <strong>amplitud total W del intervalo</strong> en lugar de la semiamplitud a. Como W = 2a, dividir W entre √12
              da exactamente lo mismo que a/√3. Aplica, por ejemplo, cuando trabajas con la resolución completa d de un
              instrumento digital (u = d/√12) o cuando la especificación viene como rango completo max − min.
            </p>
            <p style={pStyle}>
              <strong>Triangular (÷√6).</strong> Los valores cercanos al centro son más probables que los extremos — tienes
              razones para creer que el valor real vive cerca del nominal, o el efecto es la suma de dos rectangulares
              similares. Su desviación estándar es a/√6: menor que la rectangular, porque hay menos probabilidad en los bordes.
            </p>
            <p style={pStyle}>
              <strong>Forma de U (÷√2).</strong> Al revés que la triangular: los valores extremos son los más probables.
              Típico de variaciones cíclicas, como la temperatura de un laboratorio con termostato, que pasa la mayor parte
              del tiempo cerca de sus límites de control. Su desviación estándar es a/√2 — la mayor de todas, porque la
              probabilidad se concentra en los bordes.
            </p>
            <p style={pStyle}>
              <strong>Normal de certificado (÷k).</strong> El certificado no reporta la incertidumbre estándar sino la
              expandida U = k·u, así que para recuperar la estándar divides entre el factor k que el propio certificado
              declara — casi siempre 2. Aquí no estás asumiendo una distribución: estás deshaciendo una multiplicación que
              hizo el laboratorio que calibró.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={h2Style}>Las fuentes de incertidumbre más comunes (y sus fórmulas)</h2>
            <p style={pStyle}>
              Todo presupuesto es distinto, pero la GUM y las guías de calibración (EA-4/02) repiten un núcleo de fuentes
              que aparece en casi cualquier medición. Estas son, con la fórmula de su incertidumbre estándar:
            </p>
            <div style={formulaStyle}>
              Repetibilidad → u = s/√n&nbsp;&nbsp;(Tipo A, ν = n−1)
            </div>
            <div style={formulaStyle}>
              Reproducibilidad → u = s_R&nbsp;&nbsp;(Tipo A: entre operadores, días o equipos)
            </div>
            <div style={formulaStyle}>
              Certificado del patrón → u = U_cert / k_cert&nbsp;&nbsp;(normal, k del certificado)
            </div>
            <div style={formulaStyle}>
              Resolución digital → u = d/√12&nbsp;&nbsp;(rectangular, d = resolución completa)
            </div>
            <div style={formulaStyle}>
              Deriva del patrón → u = D/√3&nbsp;&nbsp;(rectangular, D = deriva entre calibraciones)
            </div>
            <div style={formulaStyle}>
              Temperatura (dilatación) → u = L·α·ΔT/√3&nbsp;&nbsp;(rectangular; forma de U si es cíclica)
            </div>
            <div style={formulaStyle}>
              Histéresis → u = h/√3&nbsp;&nbsp;(rectangular, h = diferencia subida/bajada)
            </div>
            <p style={pStyle}>
              La repetibilidad, la resolución y el certificado del patrón son el mínimo indispensable de casi cualquier
              presupuesto. La deriva entra cuando el patrón tiene historia entre calibraciones; la temperatura, cuando el
              mensurando o el instrumento son sensibles a ella (medición dimensional, por ejemplo); y la histéresis, en
              instrumentos mecánicos que leen distinto subiendo que bajando. Todas están como preset en la calculadora.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={h2Style}>Incertidumbre combinada y expandida (U, k=2)</h2>
            <p style={pStyle}>
              Cada incertidumbre estándar se multiplica por su <strong>coeficiente de sensibilidad</strong> cᵢ — cuánto le pega
              esa variable al resultado final, la derivada parcial ∂y/∂xᵢ del modelo de medición. Si mides directo, cᵢ = 1.
              Las contribuciones no se suman directo: se combinan en cuadratura (raíz de la suma de los cuadrados, RSS),
              porque las fuentes independientes rara vez se equivocan todas hacia el mismo lado al mismo tiempo:
            </p>
            <div style={formulaStyle}>
              u_c(y) = √( Σ ( cᵢ · u(xᵢ) )² )
            </div>
            <p style={pStyle}>
              Esa es la <strong>incertidumbre estándar combinada</strong> u_c. Para reportar algo más útil se multiplica por
              el <strong>factor de cobertura k</strong> y se obtiene la <strong>incertidumbre expandida U</strong>:
            </p>
            <div style={formulaStyle}>
              U = k · u_c(y)&nbsp;&nbsp;&nbsp;(k = 2 → 95.45% si el resultado se distribuye normal)
            </div>
            <p style={pStyle}>
              Una precisión que casi nadie hace: <strong>k=2 no equivale al 95%</strong>. Si la distribución del resultado es
              normal, k=2 corresponde a un nivel de confianza de <strong>95.45%</strong> — el 95% exacto sería k=1.96, y k=3
              da 99.73%. Y si la distribución que domina tu presupuesto no es normal, la correspondencia entre k y el nivel de
              confianza cambia por completo. Los certificados suelen redondear a "aproximadamente 95%", pero conviene saber
              qué hay detrás del número que estás firmando.
            </p>
            <p style={pStyle}>
              Y otra que separa un presupuesto serio de uno de plantilla: <strong>k no siempre es un valor fijo</strong>.
              Usar k=2 asume que tu resultado tiene muchos <strong>grados de libertad</strong> — es decir, información
              abundante detrás de cada número. Si tu presupuesto lo domina una fuente Tipo A con pocas repeticiones, la
              distribución real del resultado no es normal sino una t de Student, más ancha, y k=2 <em>subestima</em> U.
              Para esos casos la GUM (Anexo G) calcula los <strong>grados efectivos de libertad</strong> con la fórmula de
              Welch–Satterthwaite:
            </p>
            <div style={formulaStyle}>
              ν_eff = u_c⁴(y) / Σ ( uᵢ⁴(y) / νᵢ )
            </div>
            <p style={pStyle}>
              Con ν_eff entras a la tabla t de Student al nivel de confianza que necesitas, y <em>ese</em> es tu k real.
              Con muchos grados de libertad (ν_eff → ∞) la t de Student converge a la normal y k → 2 — de ahí sale el valor
              fijo de siempre. Con ν_eff pequeño (pocas repeticiones), k puede ser 2.2, 2.5 o más.
            </p>
            <p style={pStyle}>
              El resultado se reporta como y ± U, indicando siempre k y el nivel de confianza. Y eso es exactamente lo que
              calcula la herramienta de abajo.
            </p>
          </section>
        </article>

        {/* ── Sección 2: motor de cálculo GUM ── */}
        <section id="calculadora" style={{ padding: "48px 0 16px", scrollMarginTop: 16 }}>
          {/* Banda de quiebre: aquí termina el artículo y empieza la herramienta */}
          <div style={{ borderTop: `2px solid ${INK}`, margin: "0 -16px 0" }} />
          <div style={{ background: INK, border: BORDER, boxShadow: SHADOW, padding: "22px 24px", margin: "28px 0" }}>
            <span style={{ display: "inline-block", background: ACCENT, color: "#fff", fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", marginBottom: 12, textTransform: "uppercase" }}>
              Herramienta interactiva
            </span>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: PAPER, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Generador de presupuesto GUM
            </h2>
            <p style={{ fontFamily: MONO, fontSize: 13, color: FAINT, margin: 0 }}>
              Fuentes → distribución → RSS → ν_eff → U (k={k})
            </p>
          </div>

          {/* Presets de fuentes típicas */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => addSource(p.name, p.dist, p.desc)} style={{
                padding: "8px 14px", background: PANEL, border: BORDER, borderRadius: 0,
                color: INK, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                cursor: "pointer", textTransform: "uppercase",
              }}>
                + {p.name}
              </button>
            ))}
            <button onClick={() => addSource()} style={{
              padding: "8px 14px", background: INK, border: BORDER, borderRadius: 0,
              color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
              cursor: "pointer", textTransform: "uppercase",
            }}>
              + Otra fuente
            </button>
          </div>

          {/* Tarjetas de fuentes */}
          {sources.length === 0 && (
            <div style={{ background: PANEL, border: BORDER, padding: "22px", fontFamily: MONO, fontSize: 13, color: MUTE, marginBottom: 14 }}>
              Sin fuentes todavía — agrega al menos una arriba. Un presupuesto vacío no le sirve a nadie.
            </div>
          )}
          {sources.map((s, idx) => {
            const d = DISTRIBUTIONS[s.dist];
            return (
              <div key={s.id} style={{ background: PANEL, border: BORDER, boxShadow: SHADOW_SM, padding: "16px 18px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      width: 22, height: 22, background: ACCENT, color: "#fff", border: BORDER_THIN,
                      fontFamily: MONO, fontSize: 12, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase" }}>
                      Fuente · Tipo {d.tipo} · divisor {divisorLabelOf(s)} · gl {isFinite(dofOf(s)) ? dofOf(s) : "∞"}
                    </span>
                  </div>
                  <button onClick={() => removeSource(s.id)} aria-label={`Eliminar ${s.name || "fuente"}`} style={{
                    background: PAPER, border: BORDER_THIN, borderRadius: 0, color: INK,
                    fontFamily: MONO, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    ✕
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px 12px" }}>
                  <div>
                    <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                      Nombre de la fuente
                    </label>
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => updateSource(s.id, { name: e.target.value })}
                      placeholder="Ej. Resolución"
                      style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                      Distribución
                    </label>
                    <select
                      value={s.dist}
                      onChange={(e) => updateSource(s.id, { dist: e.target.value })}
                      style={{
                        background: PAPER, border: BORDER, borderRadius: 0,
                        padding: "10px 36px 10px 12px", color: INK, fontFamily: MONO, fontSize: 13,
                        outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath fill='%23161616' d='M5 6L0 0h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
                        width: "100%", boxSizing: "border-box",
                      }}
                    >
                      {Object.entries(DISTRIBUTIONS).map(([key, dd]) => (
                        <option key={key} value={key}>{dd.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                      Valor (±)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={s.value}
                      onChange={(e) => updateSource(s.id, { value: e.target.value })}
                      placeholder="0.0"
                      style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 15, fontWeight: 700, outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                    <div style={{ fontFamily: MONO, fontSize: 10, color: FAINT, marginTop: 4, lineHeight: 1.4 }}>
                      {d.hint}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                      Coef. sensibilidad cᵢ
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={s.ci}
                      onChange={(e) => updateSource(s.id, { ci: e.target.value })}
                      placeholder="1"
                      style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                    <div style={{ fontFamily: MONO, fontSize: 10, color: FAINT, marginTop: 4, lineHeight: 1.4 }}>
                      Medición directa → deja 1
                    </div>
                  </div>
                  {s.dist === "normal1" && (
                    <div>
                      <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                        n (número de lecturas)
                      </label>
                      <input
                        type="number"
                        min="2"
                        step="1"
                        value={s.n}
                        onChange={(e) => updateSource(s.id, { n: e.target.value })}
                        placeholder="10"
                        style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" }}
                      />
                      <div style={{ fontFamily: MONO, fontSize: 10, color: FAINT, marginTop: 4, lineHeight: 1.4 }}>
                        u = s/√n, gl = n−1 — vacío usa s directa (gl = ∞)
                      </div>
                    </div>
                  )}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                      Origen / descripción
                    </label>
                    <input
                      type="text"
                      value={s.desc}
                      onChange={(e) => updateSource(s.id, { desc: e.target.value })}
                      placeholder="Ej. Certificado No. 1234 — CENAM, vigente a 2026"
                      style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Factor de cobertura */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase" }}>
              Factor de cobertura k
            </span>
            {K_OPTIONS.map((o) => {
              const active = k === o.k;
              return (
                <button key={o.k} onClick={() => pickK(o.k)} style={{
                  padding: "9px 16px", background: active ? ACCENT : PANEL,
                  border: BORDER, borderRadius: 0,
                  color: active ? "#fff" : INK,
                  fontFamily: MONO, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  boxShadow: active ? SHADOW_SM : "none",
                }}>
                  k={o.k} <span style={{ fontWeight: 400, fontSize: 10, opacity: 0.85 }}>{o.conf}</span>
                </button>
              );
            })}
          </div>
          <p style={{ fontFamily: MONO, fontSize: 10, color: FAINT, margin: "-6px 0 16px", lineHeight: 1.5 }}>
            k fijo asume distribución normal y grados de libertad suficientes — si una fuente Tipo A con pocas
            repeticiones domina tu presupuesto, usa el k sugerido por gl_eff (Welch–Satterthwaite, ver artículo).
          </p>

          {/* Botón calcular */}
          <button onClick={handleCalculate} style={{
            width: "100%", padding: "16px", background: INK, border: BORDER, borderRadius: 0,
            boxShadow: SHADOW, color: PAPER, fontFamily: MONO, fontSize: 14, fontWeight: 700,
            letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase", marginBottom: 16,
          }}>
            Calcular presupuesto →
          </button>

          {error && (
            <div style={{ background: PANEL, border: `2px solid ${ACCENT}`, padding: "14px 18px", fontFamily: MONO, fontSize: 13, color: ACCENT, fontWeight: 700, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {/* Resultados */}
          {results && (
            <div>
              {/* Resultados con marca de agua — el reporte limpio se desbloquea con registro */}
              <div style={{ position: "relative" }}>
              {/* Tabla de contribuciones — scrollable en móvil */}
              <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, marginBottom: 16 }}>
                <div style={{ padding: "10px 18px", borderBottom: BORDER_THIN, fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase" }}>
                  Presupuesto de incertidumbre
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: 12, minWidth: 760 }}>
                    <thead>
                      <tr>
                        {["Fuente", "Origen / descripción", "Tipo", "÷", "u(xᵢ)", "cᵢ", "cᵢ·u(xᵢ)", "gl", "% contrib."].map((h) => (
                          <th key={h} style={{ textAlign: "left", padding: "10px 14px", borderBottom: BORDER, fontSize: 10, color: MUTE, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.rows.map((r, i) => (
                        <tr key={i}>
                          <td style={{ padding: "10px 14px", borderBottom: i < results.rows.length - 1 ? BORDER_THIN : "none", color: INK, fontWeight: 700 }}>{r.name}</td>
                          <td style={{ padding: "10px 14px", borderBottom: i < results.rows.length - 1 ? BORDER_THIN : "none", color: MUTE, fontSize: 11, maxWidth: 180 }}>{r.desc || "—"}</td>
                          <td style={{ padding: "10px 14px", borderBottom: i < results.rows.length - 1 ? BORDER_THIN : "none", color: MUTE }}>{DISTRIBUTIONS[r.dist].tipo}</td>
                          <td style={{ padding: "10px 14px", borderBottom: i < results.rows.length - 1 ? BORDER_THIN : "none", color: MUTE, whiteSpace: "nowrap" }}>{r.divLabel}</td>
                          <td style={{ padding: "10px 14px", borderBottom: i < results.rows.length - 1 ? BORDER_THIN : "none", color: INK }}>{fmtSI(r.u)}</td>
                          <td style={{ padding: "10px 14px", borderBottom: i < results.rows.length - 1 ? BORDER_THIN : "none", color: MUTE }}>{fmtSI(r.ci)}</td>
                          <td style={{ padding: "10px 14px", borderBottom: i < results.rows.length - 1 ? BORDER_THIN : "none", color: INK, fontWeight: 700 }}>{fmtSI(r.contrib)}</td>
                          <td style={{ padding: "10px 14px", borderBottom: i < results.rows.length - 1 ? BORDER_THIN : "none", color: MUTE }}>{isFinite(r.dof) ? r.dof : "∞"}</td>
                          <td style={{ padding: "10px 14px", borderBottom: i < results.rows.length - 1 ? BORDER_THIN : "none", minWidth: 120 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 10, background: PAPER, border: BORDER_THIN }}>
                                <div style={{ width: `${Math.min(100, r.pct)}%`, height: "100%", background: ACCENT }} />
                              </div>
                              <span style={{ color: INK, whiteSpace: "nowrap" }}>{r.pct.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: "10px 18px", borderTop: BORDER_THIN, fontFamily: MONO, fontSize: 11, color: MUTE }}>
                  Fuente dominante: <span style={{ color: ACCENT, fontWeight: 700 }}>{results.dominant.name}</span> ({results.dominant.pct.toFixed(1)}%) — si quieres bajar U, empieza por ahí.
                </div>
              </div>

              {/* Resultado final — presentado como se reporta en metrología */}
              <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, marginBottom: 16 }}>
                <div style={{ padding: "10px 18px", borderBottom: BORDER_THIN, fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase" }}>
                  Resultado — cómo se reporta
                </div>

                <div style={{ padding: "14px 18px", borderBottom: BORDER_THIN, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: INK }}>u_c — incertidumbre estándar combinada</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: MUTE, marginTop: 2 }}>
                      Raíz de la suma de los cuadrados (RSS) de las contribuciones
                    </div>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: INK }}>{fmtSI(results.uc)}</div>
                </div>

                <div style={{ padding: "14px 18px", borderBottom: BORDER_THIN, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: INK }}>gl_eff — grados efectivos de libertad</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: MUTE, marginTop: 2 }}>
                      Welch–Satterthwaite → determina el k correcto (t de Student, 95.45%)
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: INK }}>
                      {fmtGl(results.veff)}
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 11, color: results.kSug > results.k + 0.05 ? ACCENT : MUTE, marginTop: 2 }}>
                      k sugerido: {results.kSug.toFixed(2)}{results.kSug > results.k + 0.05 ? ` — tu k=${results.k} se queda corto` : ""}
                    </div>
                  </div>
                </div>

                <div style={{ background: ACCENT, padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: "#fff" }}>U — incertidumbre expandida</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                      U = k × u_c = {results.k} × {fmtSI(results.uc)} · redondeada a 2 cifras significativas
                    </div>
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: "clamp(26px, 6vw, 38px)", fontWeight: 700, color: "#fff", letterSpacing: -1 }}>
                    ± {fmtU(results.U)}
                  </div>
                </div>

                <div style={{ padding: "12px 18px", fontFamily: MONO, fontSize: 12, color: INK }}>
                  Se reporta: <strong>y ± {fmtU(results.U)}</strong> (k={results.k}, nivel de confianza {K_OPTIONS.find((o) => o.k === results.k)?.conf})
                </div>
              </div>

              {/* Marca de agua en pantalla — el reporte descargable sale limpio */}
              <div aria-hidden="true" style={{
                position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none", overflow: "hidden",
                display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center",
                gap: "52px 60px",
              }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} style={{
                    fontFamily: MONO, fontSize: 20, fontWeight: 700, letterSpacing: 3,
                    textTransform: "uppercase", color: "rgba(22,22,22,0.08)",
                    transform: "rotate(-18deg)", whiteSpace: "nowrap",
                  }}>
                    Industrias Muñeco
                  </span>
                ))}
              </div>
              </div>

              <button onClick={handleDownloadClick} style={{
                width: "100%", padding: "14px", background: ACCENT, border: BORDER, borderRadius: 0,
                boxShadow: SHADOW_SM, color: "#fff", fontFamily: MONO, fontSize: 13, fontWeight: 700,
                letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase", marginBottom: 16,
              }}>
                Descargar reporte sin marca de agua →
              </button>

              <ProcedurePanel accent={ACCENT} steps={procSteps} />
            </div>
          )}
        </section>
      </div>

      {/* ── Lead Wall B2B: modal de registro previo al resultado ── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Registro para ver el resultado"
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(22,22,22,0.65)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", padding: "22px 24px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
              <span style={{ display: "inline-block", background: INK, color: PAPER, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", textTransform: "uppercase" }}>
                Descarga tu reporte
              </span>
              <button onClick={() => setIsModalOpen(false)} aria-label="Cerrar" style={{
                background: PAPER, border: BORDER_THIN, borderRadius: 0, color: INK,
                fontFamily: MONO, fontSize: 12, fontWeight: 700, cursor: "pointer",
                width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                ✕
              </button>
            </div>

            <h3 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: INK, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
              Reporte limpio, sin marca de agua
            </h3>
            <p style={{ fontFamily: MONO, fontSize: 12, color: MUTE, lineHeight: 1.6, margin: "0 0 16px" }}>
              Dinos quién eres y descarga el presupuesto completo — tabla de contribuciones, u_c y U — listo para imprimir o guardar como PDF.
            </p>

            <form onSubmit={handleLeadSubmit}>
              {[
                { key: "name",    label: "Nombre completo",    type: "text",  placeholder: "Ej. Ana Torres" },
                { key: "email",   label: "Correo corporativo", type: "email", placeholder: "ana@empresa.com" },
                { key: "role",    label: "Puesto",             type: "text",  placeholder: "Ej. Ingeniera de calidad" },
                { key: "company", label: "Empresa",            type: "text",  placeholder: "Ej. Metrología QRO S.A." },
              ].map((f) => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    required
                    value={lead[f.key]}
                    onChange={(e) => setLead((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }}
                  />
                </div>
              ))}

              <button type="submit" style={{
                width: "100%", padding: "14px", background: INK, border: BORDER, borderRadius: 0,
                boxShadow: SHADOW_SM, color: PAPER, fontFamily: MONO, fontSize: 13, fontWeight: 700,
                letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase", marginTop: 4,
              }}>
                Descargar mi reporte →
              </button>
              <p style={{ fontFamily: MONO, fontSize: 10, color: FAINT, lineHeight: 1.5, margin: "10px 0 0" }}>
                Cero spam — tus datos solo se usan para contactarte sobre servicios de metrología.
              </p>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
