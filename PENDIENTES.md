# Pendientes — Navaja Suiza

> Esto es un **lanzamiento de ACTUALIZACIÓN** (no relanzamiento). El dominio ya está
> vivo y ya se anunció en Discord. Lo nuevo a lanzar: **landing/link-in-bio** + **herramienta 06**.

## 🔴 A cargo de Damián
- [x] **Correo profesional — decisión**: se eligió `contacto@industriasmuneco.com` (ya está en `src/Landing.jsx`, `CONTACT_EMAIL`).
- [x] **Correo profesional — crear buzón**: `contacto@industriasmuneco.com` creado y confirmado (recibe y envía).
- [ ] **Historias de Instagram del dominio**: nunca se hicieron (en Discord sí). La nueva landing es el pretexto para mostrarlo por fin.

## 🟡 Técnico antes del lanzamiento
- [ ] **Push pendiente** (2026-07-21): `b9beafe` está commiteado en local pero NO subido.
      Incluye TurTar + arreglos de móvil. `git push origin main` lo pone en vivo.
- [x] Commit + push de todo lo nuevo (landing, herramienta 06, vercel.json, assets). Hecho: `70f091f`.
- [x] **Dominio en Vercel**: `industriasmuneco.com` apuntando a este proyecto vía Namecheap (A `@` → 216.198.79.1, CNAME `www`). Landing en `/`, navaja en `/herramientas`.
- [x] Verificado en vivo: `/`, `/herramientas`, `www` y `navaja` responden 200; sirven la app correcta y el asset desplegado coincide con el último build (`index-snXeBkgA.js`).

## 🎨 Assets de lanzamiento (generados — en `marketing/` y `public/`)
- [x] `public/og-image.png` (1200×630, preview del link).
- [x] `marketing/story-1-pagina.png` · `story-2-formulas.png` · `story-3-discord.png` (1080×1920).
- Las 3 historias ya llevan la **redacción de Damián** (Story 1: "MUY IMPORTANTE" + titular "Muñecos, traemos noticias"; Story 2: "¡Y no solo eso!"; Story 3: propuesta "Construyámosla juntos").
- [x] **Story 3 — copy aprobado y confirmado** (junto con Story 1 y 2).
- Reproducibles: `cd marketing && python3 generate_assets.py` (usa Python+Pillow, NO Node). Edita los textos en ese script.

## ▶️ Cómo retomar
1. Aprobar/ajustar la Story 3 y regenerar si hace falta.
2. Confirmar las 3 historias y el resto de cambios sin commitear.
3. Cuando Damián dé luz verde: **commit + push** (rama `main`) y **deploy** en Vercel. ✅ Hecho (`70f091f`).
4. Configurar el dominio `industriasmuneco.com` en Vercel (ver 🟡) y verificar el sitio en `industriasmuneco.com` (`/` y `/herramientas`).
5. Publicar las historias en IG con los links UTM (`?utm_source=instagram&utm_campaign=update_formulas`).

## ✅ Hecho
- **Herramienta 09 — TUR / TAR** (`/herramientas/tur`, categoría Metrología, regla 4:1). Sin anunciar todavía.
- **Conversor de unidades ampliado**: 6 magnitudes (presión, torque, fuerza, longitud, masa, temperatura) + medidor «¿tiene sentido tu número?».
- **Vista móvil arreglada** (2026-07-21). La causa de fondo: Vite 8 minificaba los `@media` a sintaxis de rango
  `(width<=720px)`, que Safari <16.4 y los navegadores embebidos de Instagram/TikTok ignoran — se caían TODOS
  los breakpoints. Corregido con `build.cssTarget` en `vite.config.js`. **No quitar esa opción.**
  De paso: zoom de iOS al enfocar campos, conversor apilado en móvil, `100dvh`, áreas táctiles.
- Git sincronizado con la nube.
- Dominio `navaja.industriasmuneco.com` vivo y anunciado en Discord.
- Herramienta 06 (Biblioteca de Fórmulas, 43 fórmulas, color por categoría).
- Landing como linktree (hero + herramientas + Sobre mí + links con color).
- YouTube real: `@damian.project`.
- ISO 17025 eliminada del JSON (no era fórmula).
- `vercel.json` anti-404 para rutas.
