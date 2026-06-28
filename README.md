# 🛠️ La Navaja Suiza del Ingeniero

Conjunto de **5 herramientas de cálculo** para ingenieros y estudiantes — gratis, anti-filtros. El arma secreta de Industrias Muñeco (`@damianvlab`).

🔗 https://navaja-suiza.vercel.app

## Herramientas

| # | Herramienta | Qué hace |
|---|---|---|
| 01 | **Ecuaciones** | Sistemas lineales 2×2 y 3×3 por regla de Cramer |
| 02 | **Vectores** | Magnitud, producto punto y producto cruz (3D) |
| 03 | **Inercia** | Centroides y momentos de inercia de secciones (rectángulo, círculo, triángulo, tubo) |
| 04 | **Interpolación** | Interpolación lineal entre dos puntos |
| 05 | **Unidades** | Conversión de presión, torque y fuerza (nivel ingeniería) |

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
  App.jsx             ← shell + nav de pestañas (una herramienta activa a la vez)
  EngineerHeader.jsx  ← cabecera
  Footer.jsx          ← redes + CTA Discord
  ProcedurePanel.jsx  ← panel reutilizable "Ver procedimiento"
  EquationSolver.jsx  · VectorCalculator.jsx · InertiaCalculator.jsx
  LinearInterpolator.jsx · UnitConverter.jsx
```

Cada herramienta recibe `onAccentChange` y reporta su color de acento, que tiñe la pestaña activa del nav.

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
