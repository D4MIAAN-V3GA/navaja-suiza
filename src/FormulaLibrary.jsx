import { useState, useEffect, useMemo, useRef } from "react";
import { PAPER, PANEL, INK, MUTE, FAINT, LINE, MONO, SANS, BORDER, BORDER_THIN, BORDER_SOFT, SHADOW, SHADOW_SM, ACCENTS, textOn } from "./theme";
import { fuzzyScore } from "./fuzzy";
import formulas from "./data/formulas.json";
import { CALCS, solvableKeys, resolver, formatResult } from "./data/formulaCalcs";

// Acento de la herramienta para el nav (las otras 5 usan blue/green/orange/pink/cyan → queda yellow).
const ACCENT = ACCENTS.yellow;

// Un color por categoría → al cambiar de tema cambia el color.
const CATEGORY_COLOR = {
  Fluidos:       ACCENTS.cyan,
  Termo:         ACCENTS.orange,
  Resistencia:   ACCENTS.blue,
  "GD&T":        ACCENTS.pink,
  Metrología:    ACCENTS.green,
  Cálculo:       ACCENTS.yellow,
  Eléctrica:     ACCENTS.red,
  Estática:      ACCENTS.brown,
};
const catColor = (cat) => CATEGORY_COLOR[cat] || ACCENTS.yellow;

const CATEGORIES = ["Todos", ...Array.from(new Set(formulas.map((f) => f.category)))];

// Cuántas fórmulas ya tienen calculadora. Se recalcula solo al agregar despejes.
const CON_CALC = formulas.filter((f) => CALCS[f.id]).length;

// Mejor puntaje de la fórmula combinando nombre y tags.
function matchScore(query, item) {
  if (!query.trim()) return 0;
  const candidates = [item.name, ...item.tags, item.category];
  let best = -1;
  for (const c of candidates) {
    const s = fuzzyScore(query.trim(), c);
    if (s > best) best = s;
  }
  return best;
}

// Acepta coma decimal ("1,5") y notación científica ("2e-3"). Cadena vacía → NaN.
function parseNum(s) {
  if (typeof s !== "string") return NaN;
  const t = s.trim().replace(",", ".");
  if (!t) return NaN;
  return Number(t);
}

const label = (extra = {}) => ({
  fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
  color: FAINT, textTransform: "uppercase", ...extra,
});

// ── Banco de trabajo ────────────────────────────────────────────────
// Una fórmula a pantalla completa dentro de la herramienta: la calculadora
// deja de competir por ancho con la rejilla del catálogo.
function Workbench({ item, calc, color, onClose }) {
  const solvables = solvableKeys(calc);
  const [target, setTarget] = useState(solvables[0]);
  // Las constantes (g, R, k…) entran prellenadas pero se pueden cambiar.
  const [values, setValues] = useState(() => {
    const d = {};
    for (const v of calc.vars) if (v.def !== undefined) d[v.key] = String(v.def);
    return d;
  });
  const volverRef = useRef(null);

  const targetVar = calc.vars.find((v) => v.key === target);
  const pedidos = useMemo(() => calc.vars.filter((v) => v.key !== target), [calc, target]);

  // Un solo cálculo por cambio: qué falta por llenar, y el resultado si ya está todo.
  const { result, faltan, llenos } = useMemo(() => {
    const vals = {};
    const pendientes = [];
    for (const v of pedidos) {
      const n = parseNum(values[v.key]);
      if (Number.isFinite(n)) vals[v.key] = n;
      else pendientes.push(v.sym);
    }
    const completos = pedidos.length - pendientes.length;
    if (pendientes.length) return { result: null, faltan: pendientes, llenos: completos };
    return { result: resolver(calc, target, vals), faltan: [], llenos: completos };
  }, [calc, target, values, pedidos]);

  const setVal = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));
  const limpiar = () => {
    const d = {};
    for (const v of calc.vars) if (v.def !== undefined) d[v.key] = String(v.def);
    setValues(d);
  };

  // Escape sale del banco; el foco arranca en «volver» para que el teclado
  // no tenga que recorrer toda la página anterior.
  useEffect(() => {
    volverRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const listo = faltan.length === 0 && result?.ok;

  return (
    <section style={{ padding: "2px 0" }}>
      {/* Volver es una acción secundaria: sin sombra ni caja pesada. */}
      <button
        ref={volverRef}
        onClick={onClose}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "transparent", border: "none", borderRadius: 0,
          color: MUTE, fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1,
          textTransform: "uppercase", padding: "6px 0", cursor: "pointer",
          marginBottom: 10, minHeight: 36,
        }}>
        ← Catálogo <span style={{ color: FAINT }}>· esc</span>
      </button>

      {/* Ficha de referencia: qué fórmula es. El usuario ya sabe que está
          viendo una fórmula, así que esto acompaña — no compite con el
          formulario, que es donde tiene que actuar. */}
      <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 13, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <h3 style={{
            margin: 0, fontFamily: SANS, fontSize: 15, fontWeight: 800,
            color: INK, lineHeight: 1.2, letterSpacing: "-0.01em",
          }}>
            {item.name}
          </h3>
          <span style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: 1, color: MUTE, textTransform: "uppercase" }}>
            {item.category}
          </span>
          {item.ref !== "—" && (
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 9.5, color: FAINT, letterSpacing: 0.5 }}>
              {item.ref}
            </span>
          )}
        </div>

        <div style={{
          marginTop: 7, fontFamily: MONO, fontSize: 15, fontWeight: 700,
          color: INK, wordBreak: "break-word",
        }}>
          {item.formula}
        </div>

        <p style={{ margin: "7px 0 0", fontFamily: SANS, fontSize: 12.5, color: MUTE, lineHeight: 1.5 }}>
          {item.description}
        </p>
      </div>

      <div className="fl-work">
        {/* ── Columna de entrada: el protagonista ── */}
        <div>
          <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: "16px 18px 18px" }}>
            <div style={label({ marginBottom: 10, fontSize: 10, color: INK })}>¿Qué quieres encontrar?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
              {solvables.map((k) => {
                const v = calc.vars.find((x) => x.key === k);
                const active = k === target;
                return (
                  <button key={k}
                    onClick={() => setTarget(k)}
                    title={v.name}
                    style={{
                      background: active ? color : PANEL,
                      border: BORDER, borderRadius: 0,
                      boxShadow: active ? SHADOW_SM : "none",
                      transform: active ? "translate(-1px,-1px)" : "none",
                      color: active ? textOn(color) : INK,
                      fontFamily: MONO, fontSize: 16, fontWeight: 700,
                      padding: "8px 16px", cursor: "pointer", minHeight: 42,
                    }}>
                    {v.sym}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={label({ fontSize: 10, color: INK })}>Datos</span>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: MUTE }}>{llenos}/{pedidos.length}</span>
              {/* Medidor de avance: un segmento por dato, se llena al teclear */}
              <div style={{ display: "flex", gap: 3, flex: 1, maxWidth: 140 }}>
                {pedidos.map((v) => {
                  const ok = Number.isFinite(parseNum(values[v.key]));
                  return (
                    <div key={v.key} style={{
                      flex: 1, height: 5, background: ok ? color : LINE,
                      transition: "background 0.12s",
                    }} />
                  );
                })}
              </div>
            </div>

            {/* Una fila por dato: nombre a la izquierda, campo y unidad a la
                derecha — se lee como una hoja de datos, no como un formulario
                genérico. */}
            <div>
              {pedidos.map((v) => (
                <label
                  key={v.key}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
                    padding: "10px 0", borderTop: BORDER_SOFT,
                  }}
                >
                  <span style={{ flex: "1 1 130px", minWidth: 0, fontFamily: SANS, fontSize: 12.5, color: MUTE }}>
                    <strong style={{ fontFamily: MONO, color: INK, fontSize: 15, marginRight: 7 }}>{v.sym}</strong>
                    {v.name}
                  </span>
                  <input
                    type="text" inputMode="decimal"
                    value={values[v.key] ?? ""}
                    onChange={(e) => setVal(v.key, e.target.value)}
                    placeholder="—"
                    style={{
                      flex: "0 1 150px", width: 150, boxSizing: "border-box",
                      background: PAPER, border: BORDER, borderRadius: 0,
                      padding: "11px 12px", color: INK, textAlign: "right",
                      fontFamily: MONO, fontSize: 17, fontWeight: 700, outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.boxShadow = `3px 3px 0 ${color}`)}
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                  />
                  <span style={{ flex: "0 0 58px", fontFamily: MONO, fontSize: 11, color: MUTE }}>
                    {v.unit !== "—" ? v.unit : ""}
                  </span>
                </label>
              ))}
            </div>

            <button onClick={limpiar} style={{
              marginTop: 12, background: "transparent", border: "none", padding: "6px 0",
              color: FAINT, fontFamily: MONO, fontSize: 10, letterSpacing: 1,
              textTransform: "uppercase", cursor: "pointer", textDecoration: "underline",
            }}>
              Limpiar
            </button>
          </div>

          {/* Tags: referencia, peso mínimo */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 12 }}>
            {item.tags.slice(0, 6).map((t) => (
              <span key={t} style={{ fontFamily: MONO, fontSize: 10, color: FAINT }}>
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Columna de resultado: en cuanto está completo, grita ── */}
        <div className="fl-sticky">
          <div style={{
            background: listo ? color : PANEL,
            border: BORDER,
            boxShadow: SHADOW,
          }}>
            <div style={{
              padding: "16px 16px 18px",
              color: listo ? textOn(color) : INK,
            }}>
              <div style={{
                fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                textTransform: "uppercase", marginBottom: 10,
                color: listo ? textOn(color) : MUTE, opacity: listo ? 0.85 : 1,
              }}>
                Resultado
              </div>

              {faltan.length > 0 ? (
                <div style={{ fontFamily: SANS, fontSize: 12.5, color: MUTE, lineHeight: 1.6 }}>
                  Falta{faltan.length !== 1 ? "n" : ""}{" "}
                  <strong style={{ color: INK, fontFamily: MONO }}>{faltan.join(", ")}</strong> para despejar{" "}
                  <strong style={{ color: INK, fontFamily: MONO }}>{targetVar.sym}</strong>.
                </div>
              ) : result.ok ? (
                <>
                  <div style={{ fontFamily: MONO, fontSize: 13, opacity: 0.85, marginBottom: 2 }}>
                    {targetVar.sym} =
                  </div>
                  <div style={{
                    fontFamily: MONO, fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 700,
                    wordBreak: "break-word", lineHeight: 1.1,
                  }}>
                    {formatResult(result.value)}
                    {targetVar.unit !== "—" && (
                      <span style={{ fontSize: 15, marginLeft: 8, opacity: 0.9 }}>{targetVar.unit}</span>
                    )}
                  </div>
                  <div style={{ marginTop: 10, fontFamily: SANS, fontSize: 11.5, opacity: 0.85, lineHeight: 1.5 }}>
                    {targetVar.name}
                  </div>
                </>
              ) : (
                <div style={{ fontFamily: MONO, fontSize: 12, color: INK, fontWeight: 700, lineHeight: 1.6 }}>
                  {result.error}
                </div>
              )}
            </div>

            {calc.nota && (
              <p style={{
                margin: 0, borderTop: BORDER_THIN, background: PAPER, padding: "10px 15px",
                fontFamily: SANS, fontSize: 11.5, color: MUTE, lineHeight: 1.5,
              }}>
                <span style={{ fontFamily: MONO, fontWeight: 700, color: INK, marginRight: 5 }}>i</span>
                {calc.nota}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Tarjeta del catálogo.
//
// Antes cada tarjeta metía tres cajas dentro de la caja (cabecera con borde,
// fórmula en su propio recuadro y un chip con borde por tag) más un bloque de
// color del alto de la cabecera. Con 43 en pantalla eso es tanta tinta que ni
// el nombre ni la fórmula ganan: todas se ven igual de importantes y ninguna
// se lee. Ahora la tarjeta tiene UN borde, una barra de color que identifica
// la categoría, y dentro solo texto con una jerarquía clara:
//
//   nombre (sans 800 16)  →  fórmula (mono 700 16)  →  descripción (sans 12.5)
//
// El peso del borde dice qué hace la tarjeta: las que se calculan van con
// borde de 2px y sombra (son un botón); las de solo referencia, con línea
// suave. Así, al barrer el catálogo, lo ejecutable salta solo.
function FormulaCard({ item, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const calc = CALCS[item.id];
  const color = catColor(item.category);
  const abrible = Boolean(calc);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={abrible ? onOpen : undefined}
      style={{
        background: PANEL,
        border: abrible ? BORDER : BORDER_SOFT,
        borderLeft: `5px solid ${color}`,
        boxShadow: abrible ? (hovered ? SHADOW : SHADOW_SM) : "none",
        transform: hovered && abrible ? "translate(-2px,-2px)" : "none",
        transition: "transform 0.05s, box-shadow 0.05s",
        cursor: abrible ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        padding: "13px 15px 0",
      }}
    >
      <h3 style={{
        margin: 0, fontFamily: SANS, fontSize: 16, fontWeight: 800,
        color: INK, lineHeight: 1.2, letterSpacing: "-0.01em",
      }}>
        {item.name}
      </h3>

      <div style={{
        marginTop: 8,
        fontFamily: MONO, fontSize: 16, fontWeight: 700, color: INK,
        wordBreak: "break-word", lineHeight: 1.35,
      }}>
        {item.formula}
      </div>

      {/* Recortada a dos líneas: con altura pareja el ojo puede barrer la
          rejilla en vertical en vez de ir saltando. */}
      <p style={{
        margin: "9px 0 0", fontFamily: SANS, fontSize: 12.5, color: MUTE, lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {item.description}
      </p>

      {/* Pie: de dónde viene la fórmula. Los tags se fueron: sirven para
          buscar, no para leer, y eran cinco cajas más por tarjeta. */}
      <div style={{
        marginTop: "auto", paddingTop: 10,
        display: "flex", alignItems: "baseline", gap: 8,
        fontFamily: MONO, fontSize: 10, letterSpacing: 0.5, color: FAINT,
      }}>
        <span style={{ textTransform: "uppercase", color: MUTE, fontWeight: 700 }}>{item.category}</span>
        {item.ref !== "—" && <span>· {item.ref}</span>}
      </div>

      {/* Entrada al banco de trabajo. La tarjeta entera ya es clickeable;
          el botón queda porque es la única llamada explícita y el destino
          accesible por teclado. */}
      {/* La tarjeta entera es clickeable; el botón queda porque es la llamada
          explícita y el destino accesible por teclado. Va al ras del borde
          inferior para que la fila de acción se lea igual en toda la rejilla. */}
      {abrible ? (
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          style={{
            margin: "12px -15px 0",
            border: "none", borderTop: BORDER, borderRadius: 0,
            background: hovered ? INK : color,
            color: hovered ? PAPER : textOn(color),
            fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 1,
            textTransform: "uppercase", padding: "11px 15px", cursor: "pointer",
            textAlign: "left", width: "auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
          <span>Calcular</span>
          <span aria-hidden="true">→</span>
        </button>
      ) : (
        <div style={{ height: 13 }} />
      )}
    </div>
  );
}

export default function FormulaLibrary({ onAccentChange }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [soloCalc, setSoloCalc] = useState(false);
  // Fórmula abierta en el banco de trabajo. El catálogo NO se desmonta: al
  // volver siguen intactos búsqueda, filtros y posición.
  const [openId, setOpenId] = useState(null);

  // Reporta el acento una sola vez al montar (mismo patrón que las otras herramientas).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onAccentChange?.(ACCENT); }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    const list = formulas
      .filter((f) => activeCategory === "Todos" || f.category === activeCategory)
      .filter((f) => !soloCalc || CALCS[f.id])
      .map((f) => ({ item: f, score: matchScore(q, f) }))
      .filter((r) => (q ? r.score >= 0 : true));

    if (q) list.sort((a, b) => b.score - a.score);
    return list.map((r) => r.item);
  }, [query, activeCategory, soloCalc]);

  const counts = useMemo(() => {
    const q = query.trim();
    const visibles = formulas
      .filter((f) => !soloCalc || CALCS[f.id])
      .filter((f) => (q ? matchScore(q, f) >= 0 : true));
    const obj = { Todos: visibles.length };
    for (const cat of CATEGORIES) {
      if (cat !== "Todos") obj[cat] = visibles.filter((f) => f.category === cat).length;
    }
    return obj;
  }, [query, soloCalc]);

  const abierta = openId === null ? null : formulas.find((f) => f.id === openId);

  const abrir = (item) => {
    setOpenId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (abierta) {
    return (
      <Workbench
        // key: cambiar de fórmula reinicia estado (incógnita y datos) sin useEffect.
        key={abierta.id}
        item={abierta}
        calc={CALCS[abierta.id]}
        color={catColor(abierta.category)}
        onClose={() => setOpenId(null)}
      />
    );
  }

  return (
    <div>
      {/* Buscador brutalista */}
      <div style={{ display: "flex", border: BORDER, boxShadow: SHADOW, background: PANEL, marginBottom: 20 }}>
        <div style={{ background: INK, color: PAPER, fontFamily: MONO, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", padding: "0 16px" }}>
          ⌕
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar fórmula, norma, tag…"
          style={{
            flex: 1, background: PANEL, border: "none", borderRadius: 0,
            padding: "14px 16px", color: INK, fontFamily: MONO, fontSize: 15,
            outline: "none", minWidth: 0,
          }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{
            background: PAPER, border: "none", borderLeft: BORDER,
            color: INK, fontFamily: MONO, fontSize: 14, fontWeight: 700,
            padding: "0 16px", cursor: "pointer",
          }}>✕</button>
        )}
      </div>

      {/* Interruptor: dejar solo las que se pueden calcular */}
      <button
        onClick={() => setSoloCalc((s) => !s)}
        style={{
          display: "flex", alignItems: "center", gap: 9,
          background: soloCalc ? ACCENT : PANEL,
          border: BORDER, borderRadius: 0,
          boxShadow: soloCalc ? SHADOW_SM : "none",
          color: soloCalc ? textOn(ACCENT) : INK,
          fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
          textTransform: "uppercase", padding: "9px 12px", cursor: "pointer",
          marginBottom: 14,
        }}>
        <span style={{
          width: 13, height: 13, flexShrink: 0,
          border: BORDER, background: soloCalc ? INK : PAPER,
        }} />
        Solo las que se calculan ({CON_CALC})
      </button>

      {/* Filtros por categoría */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {CATEGORIES.map((cat) => {
          const active = activeCategory === cat;
          const count = counts[cat] || 0;
          const isTodos = cat === "Todos";
          const bg  = active ? (isTodos ? INK : catColor(cat)) : PANEL;
          const txt = active ? (isTodos ? PAPER : textOn(catColor(cat))) : INK;
          return (
            <button key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: bg,
                border: BORDER, borderRadius: 0,
                boxShadow: active ? SHADOW_SM : "none",
                padding: "8px 12px",
                color: txt,
                fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                textTransform: "uppercase",
                cursor: "pointer",
                opacity: count === 0 && !active ? 0.4 : 1,
                display: "flex", alignItems: "center", gap: 7,
              }}>
              {cat}
              <span style={{
                background: active ? txt : INK, color: active ? bg : PAPER, borderRadius: 0,
                padding: "1px 6px", fontSize: 10,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Resultados */}
      {filtered.length === 0 ? (
        <div style={{ background: PANEL, border: BORDER, boxShadow: SHADOW, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 28, color: INK, marginBottom: 10 }}>∅</div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: INK, fontWeight: 700 }}>
            {query.trim() ? `Sin resultados para "${query}"` : "Nada que mostrar con estos filtros"}
          </div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: MUTE, marginTop: 6 }}>
            {soloCalc
              ? "Esta categoría todavía no tiene fórmulas con calculadora. Quita el filtro para verlas como referencia."
              : "Prueba con otro término o cambia la categoría."}
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: MONO, fontSize: 10, color: MUTE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            {query && <span> · ordenado por relevancia</span>}
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))",
            gap: 16,
            alignItems: "start",
          }}>
            {filtered.map((item) => (
              <FormulaCard key={item.id} item={item} onOpen={() => abrir(item)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
