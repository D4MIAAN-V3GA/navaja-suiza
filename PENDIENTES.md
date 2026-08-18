# Pendientes — Navaja Suiza

> Esto es un **lanzamiento de ACTUALIZACIÓN** (no relanzamiento). El dominio ya está
> vivo y ya se anunció en Discord. Lo nuevo a lanzar: **landing/link-in-bio** + **herramienta 06**.

## 🔥 Oferta «De Atorado a Aprobado» (2026-08-13)

El sitio ya la vende: la tarjeta está en la Landing justo debajo del hero (`RescueCard`), el
riel de cada herramienta manda a `/#rescate`, y la Zona Premium de Ko-fi se desmontó. Falta
lo que no vive en el código:

- [x] **Formulario de intake** (Google Forms) → `INTAKE_URL` en `src/offer.js`. El botón
      «Manda tu problema» ya manda al formulario, no al correo.
- [x] **Link de cobro de Mercado Pago** → `MERCADO_PAGO_URL`.
- [x] **Número de WhatsApp** → `WHATSAPP_URL`.
      ℹ️ WhatsApp sí se muestra en /rescate, en peso de nota. Mercado Pago NO: el precio es
      un rango y el cobro va después de leer el problema.
- [x] **Link de Mercado Pago en el mensaje de confirmación del Google Form** (2026-08-18):
      quien termina de llenarlo ve el cobro al instante, sin esperar respuesta.
- [ ] **Probar el formulario de punta a punta**: llenarlo una vez desde el móvil y confirmar
      que la respuesta llega. Un formulario mal compartido (sin «cualquiera puede responder»)
      falla en silencio.
- [ ] **Video/post de lanzamiento con CTA explícito** al flujo nuevo. La historia que ya se
      subió no traía CTA — sin eso, la oferta existe pero nadie la ve.
- [x] **Los 2 testimonios**: puestos en `TESTIMONIOS` (`src/offer.js`), transcritos de los
      WhatsApp reales. Cada uno lleva el *bloqueo* en sus palabras + el resultado.
- [x] **Permiso de los nombres**: Cristian Velázquez y Josué Bautista autorizaron nombre
      completo (2026-08-18). Van con captura del WhatsApp original, plegada tras «Ver captura».
      La foto de la libreta resuelta va con los papeles del fondo tapados a mano (ahí se
      leía el nombre de un tercero). Regla para la próxima: revisar SIEMPRE el fondo.
- [x] **Revisar la Landing y /rescate en móvil** (2026-08-18): confirmado en el teléfono
      tras el deploy de `59f2102`.

## 🔴 A cargo de Damián
- [x] **Correo profesional — decisión**: se eligió `contacto@industriasmuneco.com` (ya está en `src/Landing.jsx`, `CONTACT_EMAIL`).
- [x] **Correo profesional — crear buzón**: `contacto@industriasmuneco.com` creado y confirmado (recibe y envía).

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
5. Publicar las historias en IG con los links UTM (`?utm_source=instagram&utm_campaign=update_formulas`). ✅ Hecho.

## 🟡 Fórmulas calculables — lo que falta

Ya está hecho el motor (ver ✅ abajo). Falta:

- [ ] **Probar en móvil real (375px)**: los campos de la calculadora dentro de la tarjeta.
      Los inputs van a 16px para que iOS no haga zoom al enfocarlos. Verificado a 485px en
      Chrome de escritorio (no baja de ahí); faltan los 375px de verdad.
- [x] **Completar despejes**: van **37 de 43**. Se agregaron 10 (2026-08-12): Bernoulli entre
      dos puntos, los cinco de GD&T que sí tienen cuenta detrás (posición, planitud, perfil,
      circularidad, cilindricidad y MMC), incertidumbre combinada, resistencias en paralelo y
      centroide. Las sumatorias se resolvieron a **dos términos** con nota de cómo encadenar,
      en vez de inventar un campo de lista dinámico.
- [ ] **Las 6 que faltan**: los cinco de **Cálculo** (cadena, producto, partes, Laplace,
      Taylor) y **equilibrio estático**. Las de Cálculo son reglas simbólicas: harían falta un
      parser + derivación (un CAS chico) o, para Taylor, un selector de función — es otro
      proyecto, no un despeje más. El CSP no lo impide; el alcance sí.
- [ ] **Contenido para redes**: cada fórmula calculable es un video corto ("¿cuánto aguanta
      esa columna antes de pandear? te lo saco en 10 segundos"). Es la razón de haberla
      hecho — falta explotarla.

## ✅ Hecho
- **Fórmulas que se resuelven solas** (2026-08-10). La biblioteca dejó de ser solo referencia:
  **27 de las 43 fórmulas** traen calculadora — eliges qué variable despejar, metes los datos y
  sale el número, con unidades y notas de uso. Filtro «Solo las que se calculan» para hallarlas.
  - Los despejes viven en `src/data/formulaCalcs.js`, indexados por el `id` de `formulas.json`.
    Una fórmula sin entrada ahí sigue mostrándose como tarjeta normal → se puede ir de a una.
  - **Son funciones JS, no expresiones en texto, a propósito**: el CSP de `vercel.json` no
    permite `'unsafe-eval'`, así que un parser/`eval` habría reventado en producción.
  - `node scripts/verify-calcs.mjs` verifica ida y vuelta los 98 despejes (arma un juego
    consistente y comprueba que cada variable despejada reproduzca su valor). Correlo antes de
    subir despejes nuevos. Cómo agregar una calculadora: sección del `README.md`.
  - **Reempaquetado** para que el catálogo deje de venderla como biblioteca: la categoría
    **«Referencia» pasó a «Física aplicada»** (era la única del catálogo que nombraba un
    formato en vez de un área — literalmente archivaba la herramienta como material de
    consulta), el `desc` ahora abre con el resultado y no con «busca», y el titular quedó
    **«La fórmula ya la sabes. El número te lo doy yo.»** — vende la ejecución sin contradecir
    que enseñar el método es parte de la marca. El `desc` de `tools.js` se propaga solo a
    Landing, grid y paleta.
- **Traductor Técnico — descartado** (2026-08-10). Se había construido (`TermTranslator.jsx` +
  81 términos) y se borró sin commitear. Motivo: un diccionario es commodity y no vende, y las
  frases "listas para el cliente" las había generado la IA, no un metrólogo real — no se podía
  sostener el argumento de venta. Su idea buena (que la herramienta trabaje por ti, no que te
  consulte) se ejecutó en Fórmulas. Sobrevive `src/fuzzy.js`, que salió de ahí.
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
