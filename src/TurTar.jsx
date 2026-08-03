import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import { ProcedurePanel } from "./ProcedurePanel";
import { PAPER, PANEL, INK, MUTE, FAINT, MONO, SANS, BORDER, BORDER_THIN, SHADOW, SHADOW_SM, ACCENTS } from "./theme";

const ACCENT = ACCENTS.brown;
const CONTACT_EMAIL = "contacto@industriasmuneco.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/damianvlab";

const PAGE_TITLE = "¿Qué es TUR y TAR? Razón de incertidumbre y exactitud de ensayo — Calculadora online gratis";
const PAGE_DESC =
  "Qué son TUR (Test Uncertainty Ratio) y TAR (Test Accuracy Ratio), cómo calcularlos, la regla 4:1, el guardbanding y las reglas de decisión de ISO/IEC 17025 — con calculadora gratis y veredicto Adecuado / Marginal / Inadecuado.";

const MODE_OPTIONS = [
  { key: "tur", label: "TUR — con incertidumbre U" },
  { key: "tar", label: "TAR — con exactitud declarada" },
];

// Veredicto según la regla histórica 4:1 — el color acá es semántico (resultado), no la identidad de la página.
const VERDICTS = {
  adequate:   { key: "adequate",   label: "Adecuado",   color: ACCENTS.green,  hint: "≥ 4:1 — cumple la regla histórica" },
  marginal:   { key: "marginal",   label: "Marginal",   color: ACCENTS.yellow, hint: "3:1 a 4:1 — zona de riesgo, aplica guardbanding" },
  inadequate: { key: "inadequate", label: "Inadecuado", color: ACCENTS.red,    hint: "< 3:1 — patrón no confiable para esta tolerancia" },
};
function verdictOf(ratio) {
  if (!isFinite(ratio) || ratio <= 0) return null;
  if (ratio >= 4) return VERDICTS.adequate;
  if (ratio >= 3) return VERDICTS.marginal;
  return VERDICTS.inadequate;
}

// Casos típicos — cubren los 3 veredictos y 3 disciplinas metrológicas distintas.
const PRESETS = [
  {
    label: "Micrómetro exterior 0–25 mm",
    mode: "tur",
    uutLabel: "Micrómetro exterior 0–25 mm (clase I)",
    uutTolerance: "0.004", units: "mm",
    standardLabel: "Bloque patrón grado 1 (juego calibrado)",
    standardU: "0.00025", standardK: "2", standardAccuracy: "",
  },
  {
    label: "Manómetro de taller 0–10 bar",
    mode: "tur",
    uutLabel: "Manómetro de taller 0–10 bar (clase 1.0)",
    uutTolerance: "0.10", units: "bar",
    standardLabel: "Patrón de presión digital (transductor de referencia)",
    standardU: "0.03", standardK: "2", standardAccuracy: "",
  },
  {
    label: "Calibrador vernier 0–150 mm",
    mode: "tar",
    uutLabel: "Calibrador vernier 0–150 mm",
    uutTolerance: "0.02", units: "mm",
    standardLabel: "Bloque patrón (exactitud de catálogo, sin certificado GUM)",
    standardU: "", standardK: "2", standardAccuracy: "0.01",
  },
  {
    label: "Termómetro digital de proceso",
    mode: "tur",
    uutLabel: "Termómetro digital de proceso",
    uutTolerance: "0.5", units: "°C",
    standardLabel: "Baño seco de calibración con patrón de referencia",
    standardU: "0.05", standardK: "2", standardAccuracy: "",
  },
];

function fmt(n) {
  if (!isFinite(n) || isNaN(n)) return "—";
  if (n === 0) return "0";
  if (Math.abs(n) >= 1e7 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4);
  return parseFloat(n.toPrecision(6)).toString();
}
function groupSI(str) {
  const [sign, rest] = str.startsWith("-") ? ["-", str.slice(1)] : ["", str];
  if (rest.includes("e")) return sign + rest;
  const [int, dec] = rest.split(".");
  const gInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const gDec = dec ? dec.replace(/(\d{3})(?=\d)/g, "$1 ") : "";
  return sign + gInt + (dec ? "." + gDec : "");
}
const fmtSI = (n) => groupSI(fmt(n));
const fmtRatio = (r) => (isFinite(r) && r > 0 ? `${groupSI(r.toFixed(1))} : 1` : "—");
const fmtPct = (p) => (isFinite(p) ? `${p.toFixed(1)}%` : "—");
const fmtVal = (n, u) => `${fmtSI(n)}${u ? " " + u : ""}`;

const h2Style = { fontFamily: SANS, fontSize: "clamp(19px, 3.5vw, 24px)", fontWeight: 800, color: INK, letterSpacing: "-0.01em", margin: "0 0 10px" };
const pStyle = { fontFamily: SANS, fontSize: 15, color: "#333330", lineHeight: 1.75, margin: "0 0 14px" };
const formulaStyle = {
  fontFamily: MONO, fontSize: 14, color: INK, background: PANEL,
  border: BORDER_THIN, padding: "10px 14px", margin: "0 0 14px",
  overflowX: "auto", whiteSpace: "nowrap",
};

export default function TurTar() {
  const [mode, setMode] = useState("tur");
  const [uutLabel, setUutLabel] = useState("");
  const [uutTolerance, setUutTolerance] = useState("");
  const [units, setUnits] = useState("");
  const [standardLabel, setStandardLabel] = useState("");
  const [standardU, setStandardU] = useState("");
  const [standardK, setStandardK] = useState("2");
  const [standardAccuracy, setStandardAccuracy] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

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

  const clearResult = () => { setResults(null); setError(null); };

  const pickMode = (m) => { setMode(m); clearResult(); };

  const applyPreset = (p) => {
    setMode(p.mode);
    setUutLabel(p.uutLabel);
    setUutTolerance(p.uutTolerance);
    setUnits(p.units);
    setStandardLabel(p.standardLabel);
    setStandardU(p.standardU);
    setStandardK(p.standardK);
    setStandardAccuracy(p.standardAccuracy);
    clearResult();
  };

  const validateInputs = () => {
    const tol = parseFloat(uutTolerance);
    if (!isFinite(tol) || tol <= 0) {
      setError("Revisa la tolerancia del instrumento — tiene que ser un número mayor que cero.");
      return false;
    }
    if (mode === "tur") {
      const U = parseFloat(standardU);
      if (!isFinite(U) || U <= 0) {
        setError("Revisa la incertidumbre expandida U del patrón — tiene que ser un número mayor que cero.");
        return false;
      }
      if (standardK !== "" && (!isFinite(parseFloat(standardK)) || parseFloat(standardK) <= 0)) {
        setError("El factor de cobertura k tiene que ser un número mayor que cero (o déjalo vacío para asumir k=2).");
        return false;
      }
    } else {
      const acc = parseFloat(standardAccuracy);
      if (!isFinite(acc) || acc <= 0) {
        setError("Revisa la exactitud o tolerancia declarada del patrón — tiene que ser un número mayor que cero.");
        return false;
      }
    }
    return true;
  };

  const computeRatio = () => {
    const tol = parseFloat(uutTolerance);
    const kEff = isFinite(parseFloat(standardK)) && parseFloat(standardK) > 0 ? parseFloat(standardK) : 2;
    let ratio, U95 = null, standardUVal = null, standardAccVal = null, guardbandLimit = null;

    if (mode === "tur") {
      standardUVal = parseFloat(standardU);
      const uStd = standardUVal / kEff;   // recupera la incertidumbre estándar del patrón
      U95 = uStd * 2;                     // normaliza siempre a k=2 para comparar parejo
      ratio = tol / U95;
      guardbandLimit = tol - U95;
    } else {
      standardAccVal = parseFloat(standardAccuracy);
      ratio = tol / standardAccVal;
    }
    const reciprocalPct = (1 / ratio) * 100;
    const verdict = verdictOf(ratio);
    setError(null);
    setResults({
      mode, uutLabel, uutTolerance: tol, units, standardLabel,
      standardU: standardUVal, standardK: kEff, U95, standardAccuracy: standardAccVal,
      ratio, reciprocalPct, guardbandLimit, verdict,
    });
  };

  const handleCalculate = () => {
    if (!validateInputs()) return;
    computeRatio();
  };

  const procSteps = results ? [
    ...(results.mode === "tur" ? [{
      title: "Normalizar la incertidumbre del patrón a k=2",
      lines: [
        `u_patrón = U / k = ${fmtVal(results.standardU, results.units)} ÷ ${results.standardK} = ${fmtVal(results.standardU / results.standardK, results.units)}`,
        `U95 = u_patrón × 2 = ${fmtVal(results.U95, results.units)}`,
      ],
    }] : []),
    {
      title: results.mode === "tur" ? "Calcular TUR = tolerancia / U95" : "Calcular TAR = tolerancia / exactitud del patrón",
      lines: [
        results.mode === "tur"
          ? `TUR = ${fmtVal(results.uutTolerance, results.units)} ÷ ${fmtVal(results.U95, results.units)} = ${fmtRatio(results.ratio)}`
          : `TAR = ${fmtVal(results.uutTolerance, results.units)} ÷ ${fmtVal(results.standardAccuracy, results.units)} = ${fmtRatio(results.ratio)}`,
      ],
    },
    {
      title: "Comparar contra la regla 4:1 y clasificar",
      lines: [
        `${fmtRatio(results.ratio)} → ${results.verdict.label} (${results.verdict.hint})`,
      ],
    },
    {
      title: "Métrica recíproca — % de tolerancia que consume el patrón",
      lines: [
        `1 / ${fmtRatio(results.ratio)} × 100 = ${fmtPct(results.reciprocalPct)}`,
      ],
    },
    ...(results.verdict.key !== "adequate" ? [{
      title: "Guardbanding simple sugerido",
      lines: results.mode === "tur"
        ? [`Límite de aceptación reducido = tolerancia − U95 = ${fmtVal(results.uutTolerance, results.units)} − ${fmtVal(results.U95, results.units)} = ± ${fmtVal(results.guardbandLimit, results.units)}`]
        : ["TAR no tiene una incertidumbre propiamente dicha que restar — considera migrar a un presupuesto GUM (TUR) para un guardband defendible."],
    }] : []),
  ] : [];

  return (
    <div style={{ minHeight: "100dvh", background: PAPER, color: INK, fontFamily: SANS }}>
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
              Metrología · Verificación de patrones
            </span>
            <h1 style={{ fontFamily: SANS, fontWeight: 800, fontSize: "clamp(28px, 6vw, 46px)", lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 14px", color: INK }}>
              ¿Qué es TUR y TAR? Razón de incertidumbre y exactitud de ensayo
            </h1>
            <p style={{ ...pStyle, fontFamily: MONO, fontSize: 13, color: MUTE }}>
              Cómo saber si tu patrón de calibración es lo bastante bueno para verificar una tolerancia — la regla 4:1, el guardbanding y una calculadora con veredicto.
            </p>
            <p style={pStyle}>
              Sé que hacer esta cuenta a mano (o en un Excel que nadie más entiende) es un dolor de cabeza. Por eso
              armé esta calculadora: tú metes los datos de tu instrumento y tu patrón, yo hago la cuenta y te digo si
              tu patrón aguanta — gratis, sin registrarte.
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
            <h2 style={h2Style}>¿Qué son TUR y TAR?</h2>
            <p style={pStyle}>
              Cuando calibras o verificas un instrumento, no basta con tener "un patrón mejor" — tiene que ser
              <strong> lo bastante mejor</strong> como para que su propia incertidumbre no contamine el veredicto de si el
              instrumento pasa o no pasa. <strong>TUR</strong> (Test Uncertainty Ratio, razón de incertidumbre de ensayo) y{" "}
              <strong>TAR</strong> (Test Accuracy Ratio, razón de exactitud de ensayo) son las dos formas — una moderna,
              otra clásica — de responder exactamente esa pregunta: comparar la tolerancia del instrumento bajo prueba
              contra la incertidumbre o exactitud de tu patrón de referencia.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={h2Style}>TAR: la razón de exactitud de ensayo (el enfoque clásico)</h2>
            <div style={formulaStyle}>TAR = Tolerancia del instrumento / Exactitud del patrón</div>
            <p style={pStyle}>
              Es el enfoque más viejo, heredado de estándares militares como el MIL-STD-45662A: tomas la exactitud o
              tolerancia que declara la hoja de datos del patrón (o del fabricante) y la divides directo contra la
              tolerancia de lo que estás verificando. No hay tratamiento estadístico: no hay factor de cobertura k, no hay
              distribución de probabilidad, no hay incertidumbre combinada — solo un cociente. Es rápido, pero también es
              ciego a qué tan confiable es realmente ese número de "exactitud" que puso el fabricante en el catálogo.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={h2Style}>TUR: la razón de incertidumbre de ensayo (el enfoque moderno, GUM)</h2>
            <div style={formulaStyle}>TUR = (TU − TL) / (2 × U) = Tolerancia / U₉₅</div>
            <p style={pStyle}>
              <strong>TU</strong> y <strong>TL</strong> son el límite superior y el límite inferior de tolerancia del
              instrumento — los dos extremos del rango que se acepta como bueno. <strong>TU − TL</strong> es el ancho
              total de ese rango (lo mismo que la "tolerancia ±" que usa la calculadora, solo que expresado como banda
              completa en vez de más/menos). La <strong>U</strong> de esta fórmula es la incertidumbre estándar
              (combinada) del patrón; multiplicarla por 2 la expande a un nivel de confianza de ≈95% (k=2) — eso es
              exactamente lo que significa <strong>U₉₅</strong>: la incertidumbre expandida usando factor de cobertura
              k=2, tal como la define la Guía GUM. Por eso la fórmula larga y la corta dicen lo mismo:{" "}
              <code>Tolerancia / U₉₅</code> es solo la versión resumida de <code>(TU − TL) / (2 × U)</code>.
            </p>
            <p style={pStyle}>
              TUR reemplaza la "exactitud de catálogo" por una <strong>incertidumbre expandida U</strong> obtenida
              correctamente — normalmente de un certificado de calibración acreditado, siguiendo la Guía GUM. Si necesitas
              construir esa U desde cero (Tipo A, Tipo B, suma en cuadratura, factor de cobertura), esa es exactamente la{" "}
              <Link to="/herramientas/incertidumbre" style={{ color: ACCENT, fontWeight: 700 }}>calculadora de presupuesto de incertidumbre GUM</Link>.
              Por eso TUR es el estándar esperado en laboratorios acreditados bajo ISO/IEC 17025: no confía en un número de
              catálogo, confía en una incertidumbre que alguien demostró con estadística real.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={h2Style}>La regla histórica de 4:1</h2>
            <p style={pStyle}>
              Tanto TAR como TUR se comparan tradicionalmente contra el mismo umbral: <strong>4 a 1</strong>. Un TUR o TAR
              de 4:1 significa que la incertidumbre o exactitud del patrón es cuatro veces más fina que la tolerancia que
              estás verificando — suficientemente pequeña como para que el riesgo de una decisión equivocada (aceptar algo
              que en realidad está fuera de tolerancia, o rechazar algo que en realidad está bien) se mantenga bajo. Nació
              en MIL-STD-45662A, pasó a ANSI/NCSL Z540-1 y hoy sigue vivo en Z540.3 — pero es importante tenerlo claro:{" "}
              <strong>es una regla de dedo, no una ley física</strong>. Es un punto de partida razonable, no una garantía.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={h2Style}>Cómo interpretar tu resultado: Adecuado, Marginal, Inadecuado</h2>
            <p style={pStyle}>
              La calculadora de abajo clasifica tu resultado en tres zonas: <strong>Adecuado</strong> (≥ 4:1 — el patrón
              cumple la regla histórica sin reservas), <strong>Marginal</strong> (entre 3:1 y 4:1 — técnicamente por debajo
              del ideal, pero manejable con guardbanding), e <strong>Inadecuado</strong> (&lt; 3:1 — el patrón ya no es
              confiable para verificar esta tolerancia sin un análisis de riesgo más cuidadoso).
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={h2Style}>Riesgo de falso aceptado y falso rechazado, en palabras simples</h2>
            <p style={pStyle}>
              Cuando el patrón no es mucho mejor que lo que estás midiendo, dos cosas malas se vuelven más probables: un{" "}
              <strong>falso aceptado</strong> (dices que el instrumento pasó, pero en realidad está fuera de tolerancia —
              el riesgo se lo lleva el cliente/usuario) y un <strong>falso rechazado</strong> (dices que no pasó, pero en
              realidad estaba bien — el riesgo y el costo se lo lleva quien fabrica o calibra). Un TUR o TAR bajo no
              garantiza que te vayas a equivocar, pero sí ensancha la zona donde una medición ambigua puede caer del lado
              equivocado.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={h2Style}>Guardbanding: la alternativa moderna a rechazar un patrón</h2>
            <p style={pStyle}>
              Cuando no puedes conseguir un patrón que cumpla 4:1 — a veces simplemente no existe uno mejor disponible —
              la alternativa no es rechazar el instrumento de plano. <strong>Guardbanding</strong> (ANSI/NCSLI Z540.3,
              ILAC-P14) consiste en <strong>reducir el límite de aceptación</strong> por una cantidad relacionada con la
              incertidumbre del patrón, en vez de usar la tolerancia completa. La versión simple resta la incertidumbre
              expandida directo de la tolerancia; versiones más sofisticadas (guardbanding basado en riesgo, PFA — probability
              of false accept) ajustan el límite según el riesgo aceptable de falso aceptado.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={h2Style}>ISO/IEC 17025:2017 §7.8.6 y las reglas de decisión basadas en riesgo</h2>
            <p style={pStyle}>
              La versión 2017 de ISO/IEC 17025 ya no exige un ratio fijo: exige que el laboratorio documente una{" "}
              <strong>regla de decisión</strong> — un criterio explícito que considera el riesgo de falso aceptado y falso
              rechazado al declarar conformidad. La regla 4:1 y el guardbanding son dos formas válidas de implementar esa
              regla de decisión; lo que ya no es aceptable es no tener ninguna regla documentada.
            </p>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2 style={h2Style}>TUR vs. TAR: ¿cuál deberías usar?</h2>
            <p style={pStyle}>
              TAR todavía aparece en certificados informales o de bajo costo, donde el "patrón" solo trae una exactitud de
              catálogo sin trazabilidad estadística. TUR es lo que se espera en cualquier certificado acreditado (ISO/IEC
              17025): una incertidumbre expandida real, con su factor de cobertura, respaldada por un presupuesto GUM. Si
              tu certificado de calibración ya reporta una U con su k, usa TUR. Si solo tienes una "exactitud" de hoja de
              datos sin más contexto, TAR es lo único que puedes calcular — pero considera que es la versión menos rigurosa
              de la misma pregunta.
            </p>
          </section>
        </article>

        {/* ── Sección 2: motor de cálculo TUR/TAR ── */}
        <section id="calculadora" style={{ padding: "48px 0 16px", scrollMarginTop: 16 }}>
          <div style={{ borderTop: `2px solid ${INK}`, margin: "0 -16px 0" }} />
          <div style={{ background: INK, border: BORDER, boxShadow: SHADOW, padding: "22px 24px", margin: "28px 0" }}>
            <span style={{ display: "inline-block", background: ACCENT, color: "#fff", fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "4px 10px", marginBottom: 12, textTransform: "uppercase" }}>
              Herramienta interactiva
            </span>
            <h2 style={{ fontFamily: SANS, fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, color: PAPER, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Calculadora TUR / TAR
            </h2>
            <p style={{ fontFamily: MONO, fontSize: 13, color: FAINT, margin: 0 }}>
              Tú pones los datos, yo hago la cuenta y te digo si tu patrón aguanta.
            </p>
          </div>

          {/* Presets de casos típicos */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p)} style={{
                padding: "8px 14px", background: PANEL, border: BORDER, borderRadius: 0,
                color: INK, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                cursor: "pointer", textTransform: "uppercase",
              }}>
                + {p.label}
              </button>
            ))}
          </div>

          {/* Selector de modo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {MODE_OPTIONS.map((o) => {
              const active = mode === o.key;
              return (
                <button key={o.key} onClick={() => pickMode(o.key)} style={{
                  padding: "9px 16px", background: active ? ACCENT : PANEL,
                  border: BORDER, borderRadius: 0,
                  color: active ? "#fff" : INK,
                  fontFamily: MONO, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  boxShadow: active ? SHADOW_SM : "none",
                }}>
                  {o.label}
                </button>
              );
            })}
          </div>

          {/* Tarjeta de inputs */}
          <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW_SM, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px 12px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                  Instrumento bajo prueba
                </label>
                <input
                  type="text" value={uutLabel}
                  onChange={(e) => { setUutLabel(e.target.value); clearResult(); }}
                  placeholder="Ej. Micrómetro exterior 0–25 mm"
                  style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                  Tolerancia del instrumento (±)
                </label>
                <input
                  type="number" step="any" min="0" value={uutTolerance}
                  onChange={(e) => { setUutTolerance(e.target.value); clearResult(); }}
                  placeholder="0.0"
                  style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 15, fontWeight: 700, outline: "none", width: "100%", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                  Unidades (opcional)
                </label>
                <input
                  type="text" value={units}
                  onChange={(e) => { setUnits(e.target.value); clearResult(); }}
                  placeholder="Ej. mm, bar, °C"
                  style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                  Patrón / instrumento de calibración usado
                </label>
                <input
                  type="text" value={standardLabel}
                  onChange={(e) => { setStandardLabel(e.target.value); clearResult(); }}
                  placeholder="Ej. Bloque patrón grado 1, certificado vigente"
                  style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" }}
                />
              </div>

              {mode === "tur" ? (
                <>
                  <div>
                    <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                      Incertidumbre expandida U del patrón
                    </label>
                    <input
                      type="number" step="any" min="0" value={standardU}
                      onChange={(e) => { setStandardU(e.target.value); clearResult(); }}
                      placeholder="0.0"
                      style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 15, fontWeight: 700, outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                    <div style={{ fontFamily: MONO, fontSize: 10, color: FAINT, marginTop: 4, lineHeight: 1.4 }}>
                      U tal como la reporta el certificado de calibración
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                      k (factor de cobertura)
                    </label>
                    <input
                      type="number" step="any" min="0" value={standardK}
                      onChange={(e) => { setStandardK(e.target.value); clearResult(); }}
                      placeholder="2"
                      style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" }}
                    />
                    <div style={{ fontFamily: MONO, fontSize: 10, color: FAINT, marginTop: 4, lineHeight: 1.4 }}>
                      Casi siempre 2 — se normaliza internamente a k=2
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label style={{ display: "block", fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>
                    Exactitud / tolerancia declarada del patrón (±)
                  </label>
                  <input
                    type="number" step="any" min="0" value={standardAccuracy}
                    onChange={(e) => { setStandardAccuracy(e.target.value); clearResult(); }}
                    placeholder="0.0"
                    style={{ background: PAPER, border: BORDER, borderRadius: 0, padding: "10px 12px", color: INK, fontFamily: MONO, fontSize: 15, fontWeight: 700, outline: "none", width: "100%", boxSizing: "border-box" }}
                  />
                  <div style={{ fontFamily: MONO, fontSize: 10, color: FAINT, marginTop: 4, lineHeight: 1.4 }}>
                    Exactitud de hoja de datos — sin factor de cobertura (TAR no es estadístico)
                  </div>
                </div>
              )}
            </div>
          </div>

          <button onClick={handleCalculate} style={{
            width: "100%", padding: "16px", background: INK, border: BORDER, borderRadius: 0,
            boxShadow: SHADOW, color: PAPER, fontFamily: MONO, fontSize: 14, fontWeight: 700,
            letterSpacing: "0.08em", cursor: "pointer", textTransform: "uppercase", marginBottom: 16,
          }}>
            Calcular {mode === "tur" ? "TUR" : "TAR"} →
          </button>

          {error && (
            <div style={{ background: PANEL, border: `2px solid ${ACCENT}`, padding: "14px 18px", fontFamily: MONO, fontSize: 13, color: ACCENT, fontWeight: 700, marginBottom: 16 }}>
              {error}
            </div>
          )}

          {results && (
            <div>
              {/* Datos de entrada */}
              <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, marginBottom: 16 }}>
                  <div style={{ padding: "10px 18px", borderBottom: BORDER_THIN, fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase" }}>
                    Datos de entrada
                  </div>
                  <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, fontFamily: MONO, fontSize: 12 }}>
                    <div>
                      <div style={{ color: MUTE, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Instrumento</div>
                      <div style={{ color: INK, fontWeight: 700 }}>{results.uutLabel || "Sin nombre"}</div>
                      <div style={{ color: MUTE }}>Tolerancia: ± {fmtVal(results.uutTolerance, results.units)}</div>
                    </div>
                    <div>
                      <div style={{ color: MUTE, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Patrón</div>
                      <div style={{ color: INK, fontWeight: 700 }}>{results.standardLabel || "Sin nombre"}</div>
                      <div style={{ color: MUTE }}>
                        {results.mode === "tur"
                          ? `U = ${fmtVal(results.standardU, results.units)} (k=${results.standardK}) → U₉₅ = ${fmtVal(results.U95, results.units)}`
                          : `Exactitud declarada: ${fmtVal(results.standardAccuracy, results.units)}`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resultado — bloque destacado con el color del veredicto */}
                <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, marginBottom: 16 }}>
                  <div style={{ padding: "10px 18px", borderBottom: BORDER_THIN, fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase" }}>
                    Resultado
                  </div>
                  <div style={{ background: results.verdict.color, padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: "#fff" }}>
                        {results.mode === "tur" ? "TUR" : "TAR"} — {results.verdict.label}
                      </div>
                      <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                        {results.verdict.hint}
                      </div>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: "clamp(26px, 6vw, 38px)", fontWeight: 700, color: "#fff", letterSpacing: -1 }}>
                      {fmtRatio(results.ratio)}
                    </div>
                  </div>
                  <div style={{ padding: "12px 18px", fontFamily: MONO, fontSize: 12, color: INK }}>
                    El patrón consume aproximadamente el <strong>{fmtPct(results.reciprocalPct)}</strong> de la tolerancia del instrumento.
                  </div>
                </div>

                {/* Nota técnica de guardbanding — solo si no es Adecuado, sin venta aquí */}
                {results.verdict.key !== "adequate" && (
                  <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, marginBottom: 16, padding: "14px 18px" }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                      Guardbanding
                    </div>
                    {results.mode === "tur" ? (
                      <p style={{ fontFamily: MONO, fontSize: 12, color: INK, lineHeight: 1.6, margin: 0 }}>
                        Límite de aceptación con guarda simple (ANSI/NCSLI Z540.3 / ILAC-P14): tolerancia − U₉₅ = {fmtVal(results.uutTolerance, results.units)} − {fmtVal(results.U95, results.units)} = <strong>± {fmtVal(results.guardbandLimit, results.units)}</strong>.
                      </p>
                    ) : (
                      <p style={{ fontFamily: MONO, fontSize: 12, color: INK, lineHeight: 1.6, margin: 0 }}>
                        TAR no trae una incertidumbre propiamente dicha que restar. Para un guardband defendible ante auditoría,
                        considera construir un presupuesto GUM completo en{" "}
                        <Link to="/herramientas/incertidumbre" style={{ color: ACCENT, fontWeight: 700 }}>la calculadora de incertidumbre</Link>.
                      </p>
                    )}
                  </div>
                )}

                {/* CTA suave, no bloqueante — siempre visible, mismo copy para los 3 veredictos */}
                <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, marginBottom: 16, padding: "16px 18px" }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                    ¿Quieres una segunda opinión?
                  </div>
                  <p style={{ fontFamily: MONO, fontSize: 12, color: INK, lineHeight: 1.6, margin: "0 0 12px" }}>
                    Agenda 15 minutos gratis conmigo: reviso tu presupuesto de incertidumbre o tu TUR/TAR, sin costo y
                    sin compromiso. Si de verdad necesitas calibrar contra un patrón mejor, te recomiendo laboratorios
                    acreditados de confianza — yo no calibro, pero sé a quién buscar.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                    <a
                      href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Quiero agendar 15 minutos gratis")}`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "10px 18px", border: BORDER, background: ACCENT, boxShadow: SHADOW_SM,
                        color: "#fff", fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
                        textDecoration: "none", textTransform: "uppercase",
                      }}
                    >
                      Agenda tu llamada gratis →
                    </a>
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
                        color: MUTE, textDecoration: "underline", textTransform: "uppercase",
                      }}
                    >
                      o sígueme en LinkedIn →
                    </a>
                  </div>
                </div>

              <ProcedurePanel accent={ACCENT} steps={procSteps} />
            </div>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
}
