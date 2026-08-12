# 🛠️ La Navaja Suiza del Ingeniero

Conjunto de **herramientas de cálculo** para ingenieros y estudiantes — gratis, anti-filtros. Ninguna es material de consulta: todas resuelven y muestran el procedimiento. El arma secreta de Industrias Muñeco (`@damianvlab`).

🔗 https://industriasmuneco.com

## Herramientas

El catálogo vive en **`src/tools.js`** (fuente única de verdad): agregar una entrada ahí la publica
en la ruta, el grid, la Landing y la paleta de comandos.

| Herramienta | Qué hace |
|---|---|
| **Ecuaciones** | Sistemas lineales 2×2 y 3×3 por regla de Cramer |
| **Matrices** | Reducción por Gauss paso a paso |
| **Vectores** | Magnitud, producto punto y producto cruz (3D) |
| **Inercia** | Centroides y momentos de inercia de secciones (rectángulo, círculo, triángulo, tubo) |
| **Interpolación** | Interpolación lineal entre dos puntos |
| **Unidades** | Conversión de presión, torque y fuerza (nivel ingeniería) |
| **Fórmulas** | **Las resuelve**: eliges qué variable despejar, metes los datos y sale el número con unidades. 37 de 43 ya calculan; el resto quedan como tarjeta |
| **Incertidumbre** | Presupuesto de incertidumbre GUM con reporte descargable |
| **TUR / TAR** | Veredicto de la relación de incertidumbre contra la tolerancia |

Cada herramienta incluye un panel desplegable **"Ver procedimiento"** que muestra el desarrollo paso a paso con los números sustituidos — gratis, porque enseñar el método es parte de la marca.

## Diseño

Estilo **brutalista / retro** deliberado, para que NO parezca una página genérica hecha por IA:
papel crema, tinta negra, bordes sólidos de 2px, sombras duras desplazadas, sin gradientes
ni glows ni morado. La paleta y los tokens viven en un único archivo: **`src/theme.js`**
(fuente de verdad para que todas las herramientas combinen entre sí).

## Stack

- **React 19** + **Vite 8**
- **Tailwind 4** (base) + estilos inline por componente
- Sin dependencias de UI externas; fuentes del sistema (sans para texto, mono solo para datos)

## Estructura

```
src/
  theme.js            ← tokens de diseño (colores, bordes, sombras, fuentes)
  tools.js            ← catálogo de herramientas (rutas, grid, Landing, paleta)
  fuzzy.js            ← búsqueda difusa de la biblioteca de fórmulas
  data/
    formulas.json     ← contenido de la biblioteca (nombre, fórmula, tags, ref)
    formulaCalcs.js   ← los despejes que hacen calculable cada fórmula
  App.jsx             ← shell + nav de pestañas (una herramienta activa a la vez)
  EngineerHeader.jsx  ← cabecera
  Footer.jsx          ← redes + CTA Discord
  ProcedurePanel.jsx  ← panel reutilizable "Ver procedimiento"
  EquationSolver.jsx  · VectorCalculator.jsx · InertiaCalculator.jsx
  LinearInterpolator.jsx · UnitConverter.jsx
```

Cada herramienta recibe `onAccentChange` y reporta su color de acento, que tiñe la pestaña activa del nav.

## Cómo hacer calculable una fórmula

Una fórmula vive en **`src/data/formulas.json`** (nombre, expresión que se muestra, tags, norma).
Eso sola la publica como **tarjeta de referencia**. Para que además **se resuelva**, hay que
agregarle una entrada en **`src/data/formulaCalcs.js`**, con la misma clave numérica que su `id`.
Las fórmulas sin entrada ahí siguen funcionando como antes — se puede ir de una en una.

**Por qué es un `.js` y no un `.json`:** el CSP de producción (`vercel.json`) no permite
`'unsafe-eval'`, así que no se puede guardar el despeje como texto y evaluarlo. Cada despeje es
una función real: sin parser, sin `eval`, y sin poder romperse en producción.

```js
2: {                                        // ← el id de la fórmula en formulas.json
  vars: [
    { key: "Re",  sym: "Re", name: "Número de Reynolds", unit: "—" },
    { key: "rho", sym: "ρ",  name: "Densidad",           unit: "kg/m³" },
    { key: "g",   sym: "g",  name: "Gravedad",           unit: "m/s²", def: 9.81 },
  ],
  solve: {
    Re:  ({ rho, v, D, mu }) => (rho * v * D) / mu,
    rho: ({ Re, v, D, mu }) => (Re * mu) / (v * D),
  },
  nota: "Aclaración opcional que sale bajo el resultado.",
}
```

**Campos.**

- `key` — el nombre ASCII que usan las funciones. `sym` es lo que ve el usuario (`ρ`, `ΔT`, `σadm`).
- `unit` — se muestra junto al campo y junto al resultado. Usa `"—"` si es adimensional.
- `def` — opcional: prellena el campo. Es para constantes (`g`, `R`, `k = 2`), que quedan
  editables por si el usuario trabaja en otras unidades.
- `solve` — **un despeje por variable que se pueda aislar**, no hace falta cubrirlas todas. La
  clave es el `key` de la incógnita y la función recibe un objeto con las demás. **El primer
  despeje es el que aparece seleccionado al abrir la calculadora**, así que pon el más común.
- `nota` — obligatoria en la práctica cuando la calculadora usa una forma distinta a la que
  muestra la tarjeta (p. ej. Fourier, que en la tarjeta va con `dT/dx` y aquí con `ΔT/L`).

**Las sumatorias van a dos términos.** `uc = √(Σuᵢ²)`, resistencias en paralelo y centroide se
resuelven para el caso de dos, con una `nota` que dice cómo encadenar más. Un campo de lista
dinámico rompería el patrón de `vars` fijas.

**Una sola relación por fórmula.** El verificador arma el juego de datos calculando el primer
despeje y exige que los demás lo reproduzcan, así que una fórmula con dos relaciones acopladas
no puede cerrar. Si un despeje es ambiguo (p. ej. el tamaño real en MMC, cuyo signo depende de
si es eje o agujero), déjalo fuera de `solve` y explícalo en `nota`.

**De GD&T se calcula la verificación, no la anotación.** El símbolo no tiene despeje, pero sí la
cuenta de atrás: posición `⌀ = 2√(Δx²+Δy²)`, planitud `Lmax − Lmin`, circularidad y cilindricidad
`(Dmax − Dmin)/2`, y la bonificación de MMC.

**Qué no lleva calculadora (6).** Las cinco de **Cálculo** (cadena, producto, partes, Laplace y
Taylor son reglas simbólicas: harían falta un parser con derivación o un selector de función) y
**equilibrio estático**, que no tiene un juego fijo de variables. El CSP no lo impide — un parser
escrito a mano no usa `eval`; lo que frena es el alcance.

**Antes de subir**, corre la verificación de ida y vuelta: arma un juego de datos consistente
por fórmula y comprueba que despejar cada variable devuelva su valor original. Cualquier
despeje mal escrito se cae ahí.

```bash
node scripts/verify-calcs.mjs
```

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run lint     # eslint
```

## Casos de prueba (QA)

Inputs con resultados esperados para verificar cada herramienta (y su procedimiento):

**01 · Ecuaciones**
- 2×2: `2x+3y=8`, `x−y=−1` → **x=1, y=2**
- 3×3: `x+y+z=6`, `2x−y+z=3`, `x+2y−z=2` → **x=1, y=2, z=3** (Δ=7)
- Error (Δ=0): `2x+4y=6`, `x+2y=5` → banner "sin solución única"

**02 · Vectores** — A=(1,2,2), B=(2,0,−1)
- |A|=3, |B|=2.2361, A·B=**0** (perpendiculares), A×B=**(−2, 5, −4)**

**03 · Inercia**
- Rectángulo b=100, h=200 → A=20000, Ix=6.667e7, Iy=1.667e7, Iz=8.333e7
- Círculo r=50 → A=7853.98, Ix=Iy=4.909e6
- Tubo R=80, r=60 → A=8796.46, Ix=Iy=2.199e7
- Error: R=50, r=60 → "radio interior debe ser menor al exterior"

**04 · Interpolación**
- (0,0)→(10,100), x₂=3 → **y₂=30**
- Error: x₁=5 y x₃=5 → "división por cero"

**05 · Unidades**
- 100 psi → MPa = **0.6894757**
- 1 atm → kPa = **101.325**
- 1000 N → kgf = **101.9716**
- 100 N·m → lbf·ft = **73.7562**

---

© La Navaja Suiza del Ingeniero · Industrias Muñeco · Querétaro, MX · Herramientas anti-filtros · gratis
