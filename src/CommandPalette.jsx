import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TOOLS } from "./tools";
import { PAPER, PANEL, INK, MUTE, MONO, SANS, BORDER, SHADOW } from "./theme";

// Paleta de comandos: Ctrl/⌘+K abre; ↑/↓ + Enter navegan. Sin dependencias.
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const navigate = useNavigate();

  // Atajo global Ctrl/⌘+K (y Escape para cerrar). Resetea al alternar.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setSel(0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const results = q
    ? TOOLS.filter((t) => (t.label + " " + t.desc).toLowerCase().includes(q))
    : TOOLS;

  const go = (tool) => {
    if (!tool) return;
    setOpen(false);
    navigate(`/herramientas/${tool.id}`);
  };

  const onInputKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); go(results[sel]); }
  };

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(22,22,22,0.4)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "12vh 16px 16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 520, background: PAPER, border: BORDER, boxShadow: SHADOW }}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSel(0); }}
          onKeyDown={onInputKey}
          placeholder="Buscar herramienta…"
          style={{
            width: "100%", boxSizing: "border-box",
            background: PANEL, border: "none", borderBottom: BORDER,
            padding: "16px 18px", fontFamily: MONO, fontSize: 16, color: INK, outline: "none",
          }}
        />
        <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
          {results.length === 0 && (
            <div style={{ padding: "18px", fontFamily: MONO, fontSize: 13, color: MUTE }}>
              Sin resultados
            </div>
          )}
          {results.map((t, i) => (
            <button
              key={t.id}
              onClick={() => go(t)}
              onMouseEnter={() => setSel(i)}
              style={{
                width: "100%", textAlign: "left", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 18px", border: "none",
                borderBottom: i < results.length - 1 ? `1px solid ${INK}22` : "none",
                background: i === sel ? INK : "transparent",
                color: i === sel ? PAPER : INK,
              }}
            >
              <span style={{ width: 10, height: 10, flexShrink: 0, background: t.accent, border: `1px solid ${i === sel ? PAPER : INK}` }} />
              <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800 }}>{t.label}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: i === sel ? "rgba(255,255,255,0.7)" : MUTE, marginLeft: "auto" }}>
                {t.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
