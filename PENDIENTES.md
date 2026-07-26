# Pendientes — Navaja Suiza

> Esto es un **lanzamiento de ACTUALIZACIÓN** (no relanzamiento). El dominio ya está
> vivo y ya se anunció en Discord. Lo nuevo a lanzar: **landing/link-in-bio** + **herramienta 06**.

## 🔴 A cargo de Damián
- [x] **Correo profesional — decisión**: se eligió `contacto@industriasmuneco.com` (ya está en `src/Landing.jsx`, `CONTACT_EMAIL`).
- [x] **Correo profesional — crear buzón**: `contacto@industriasmuneco.com` creado y confirmado (recibe y envía).
- [ ] **Historias de Instagram del dominio**: nunca se hicieron (en Discord sí). La nueva landing es el pretexto para mostrarlo por fin.

## 🔌 Backend en Raspberry Pi — rama `feat/backend-pi` (2026-07-26)

> **Nada de esto está en vivo todavía.** El código está commiteado y pusheado en la rama,
> `main` sigue intacta. Guía completa de instalación: **`server/README.md`** — es el único
> documento que hay que seguir, tiene los comandos exactos.

**Bloqueantes para que funcione (en este orden):**
- [ ] **Instalar en la Pi**: usuario `navaja`, copiar `server.js`, generar `ADMIN_TOKEN` con
      `openssl rand -hex 32`, servicio systemd, túnel de Cloudflare. Pasos 1–5 del README.
- [ ] **Vercel**: variable `VITE_API_URL=https://api.industriasmuneco.com` + redeploy.
      Las `VITE_*` se hornean en el build, no en ejecución: sin redeploy no toma efecto.
- [ ] **Merge de `feat/backend-pi` a `main`** cuando lo de arriba esté verificado.
      Ojo: al mergear, el sitio empieza a apuntar a la Pi. Si la Pi no está lista no pasa
      nada grave (el formulario falla en silencio y el reporte sigue saliendo), pero se
      pierden los leads.

**A cargo de Damián — datos que solo tú tienes:**
- [ ] **Domicilio fiscal real** en `src/Privacy.jsx:11`. Ahora dice "Querétaro, Querétaro,
      México"; la LFPDPPP pide el domicilio del responsable. Si tienes uno registrado, cámbialo.
- [ ] **Endurecer SSH de la Pi antes de exponerla**: llave en vez de contraseña, sin login de
      root, `chmod 600` a las credenciales del túnel, parches automáticos. Comandos en la
      sección "Endurecer la Pi" del README. No urgente hasta que la Pi esté en internet.

**Vigilar, sin prisa:**
- [ ] `npm audit` reporta 2 avisos de `react-router` (CSRF en modo RSC). **No aplica** a este
      sitio (usa `BrowserRouter` plano, sin acciones de servidor) y el único "arreglo" que
      ofrece npm es bajar de 7.18 a 7.11, un mayor atrás. Revisar cuando salga un 7.18.x
      parcheado. `postcss` ya se subió a 8.5.23 y quedó limpio.
- [ ] **Respaldo de la base de leads**: decidido que va a disco físico, manual. La microSD se
      corrompe sola con el tiempo y ahí viven contactos de clientes.

**Decisiones tomadas (no volver a discutir):**
- Los **cálculos nunca se mueven al servidor**. Son microsegundos en el navegador; por red
  serían más lentos y se caerían con la Pi. El backend existe solo para lo que necesita
  persistencia o secretos.
- **Fail-open**: si la Pi está caída, el usuario recibe su reporte igual.
- Descartadas tras discutirlas: API pública de conversiones (commodity), resumen semanal por
  cron (redundante con el aviso por lead), staging en la Pi (Vercel ya lo da gratis por rama).
- El **SEO de las páginas B2B** (Google ve HTML vacío) se arregla en **Vercel**, no en la Pi.

## 🟡 Técnico antes del lanzamiento
- [x] **Push** de `b9beafe` (TurTar + arreglos de móvil). Verificado 2026-07-26: `main` está
      sincronizada con `origin/main` en `81cdcaf`, no hay nada sin subir.
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
- **Aviso de privacidad** (`/privacidad`, `src/Privacy.jsx`): exigido por la LFPDPPP por recabar
  datos personales. Versión simplificada dentro del modal del lead wall (que es donde la ley la
  pide), enlace en el pie y alta en `sitemap.xml`.
- **Backend de captura de leads** (rama, sin desplegar): `server/`, cero dependencias npm.
  Auditado con sondas de ataque reales, no a ojo. Se hallaron y corrigieron 7 fallos; el peor:
  un fallo de escritura en la BD tumbaba el proceso entero, y como las microSD mueren
  volviéndose de solo lectura, ese es el modo de fallo *normal* de una Raspberry. Ahora hay
  11 asserts en `server/server.test.js` que fijan cada arreglo (`node server/server.test.js`).
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
