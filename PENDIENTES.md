# Pendientes — Navaja Suiza

> Esto es un **lanzamiento de ACTUALIZACIÓN** (no relanzamiento). El dominio ya está
> vivo y ya se anunció en Discord. Lo nuevo a lanzar: **landing/link-in-bio** + **herramienta 06**.

## 🔴 A cargo de Damián
- [ ] **Correo profesional**: decidir `contacto@industriasmuneco.com` vs `hola@industriasmuneco.com` y crearlo (Zoho Mail free o reenvío del registrador). Cuando esté, confirmar el valor en `src/Landing.jsx` (`CONTACT_EMAIL`).
- [ ] **Historias de Instagram del dominio**: nunca se hicieron (en Discord sí). La nueva landing es el pretexto para mostrarlo por fin.

## 🟡 Técnico antes del lanzamiento
- [ ] Commit + push de todo lo nuevo (landing, herramienta 06, vercel.json, assets). ⚠️ gasta datos.
- [ ] Deploy a Vercel y verificar `/herramientas` no da 404.

## 🎨 Assets de lanzamiento (generados — en `marketing/` y `public/`)
- [x] `public/og-image.png` (1200×630, preview del link).
- [x] `marketing/story-1-pagina.png` · `story-2-formulas.png` · `story-3-discord.png` (1080×1920).
- Las 3 historias ya llevan la **redacción de Damián** (Story 1: "MUY IMPORTANTE" + titular "Muñecos, traemos noticias"; Story 2: "¡Y no solo eso!"; Story 3: propuesta "Construyámosla juntos").
- [ ] **Story 3 — aprobar/ajustar copy** (quedó como propuesta).
- Reproducibles: `cd marketing && python3 generate_assets.py` (usa Python+Pillow, NO Node). Edita los textos en ese script.

## ▶️ Cómo retomar
1. Aprobar/ajustar la Story 3 y regenerar si hace falta.
2. Confirmar las 3 historias y el resto de cambios sin commitear.
3. Cuando Damián dé luz verde: **commit + push** (rama `main`) y **deploy** en Vercel. ⚠️ Eso gasta datos.
4. Verificar el sitio en `navaja.industriasmuneco.com` (`/` y `/herramientas`).
5. Publicar las historias en IG con los links UTM (`?utm_source=instagram&utm_campaign=update_formulas`).

## ✅ Hecho
- Git sincronizado con la nube.
- Dominio `navaja.industriasmuneco.com` vivo y anunciado en Discord.
- Herramienta 06 (Biblioteca de Fórmulas, 43 fórmulas, color por categoría).
- Landing como linktree (hero + herramientas + Sobre mí + links con color).
- YouTube real: `@damian.project`.
- ISO 17025 eliminada del JSON (no era fórmula).
- `vercel.json` anti-404 para rutas.
