// ── Oferta "De Atorado a Aprobado" — fuente ÚNICA de verdad ──────────
//
// El precio, el plazo y la escasez que se dicen en los videos, en la bio y en
// WhatsApp tienen que ser IDÉNTICOS a los de aquí. Si cambia algo, se cambia en
// este archivo y se propaga solo a la Landing y al riel de las herramientas.
//
// A quién le habla: al estudiante que tiene ESTE problema, AHORA, con fecha
// límite encima. No al que "quiere aprender la materia" — ese se queda con las
// herramientas gratis, que para eso están.

// Enlaces del flujo. Si alguno se vacía, `intakeHref()` vuelve solo al correo
// con asunto listo — la Landing nunca enseña un enlace muerto.
export const INTAKE_URL = "https://forms.gle/h473NjbbEPSz7hY96";

// A propósito NO hay botón de Mercado Pago en el sitio: el precio es un RANGO
// ($350–450) y depende del problema. Un botón público deja que alguien pague de
// menos, o que pague por algo que no se puede resolver — y ahí toca devolver
// dinero. El cobro va después de leer el formulario.
//
// Donde sí quita fricción es en el MENSAJE DE CONFIRMACIÓN del Google Form:
// quien termina de llenarlo lo ve al instante, sin esperar respuesta. Eso se
// configura en el formulario, no aquí. Esta constante es el registro del link.
export const MERCADO_PAGO_URL = "https://link.mercadopago.com.mx/damianvlab";

// Sí se muestra, en peso de nota: es la salida del que no se anima al formulario.
export const WHATSAPP_URL = "https://wa.me/524425906776";
const CONTACT_EMAIL = "contacto@industriasmuneco.com";

export const OFFER = {
  nombre: "De Atorado a Aprobado",
  promesa: "Tráeme el problema que te tiene trabado y te lo resuelvo paso a paso.",
  plazo: "24–48 h",
  precio: "$350–450 MXN",
  pago: "pago único",
  descuento: "Primeros 5 · −20%",
  descuentoNota: "a cambio de tu testimonio",
  capacidad: "2 rescates por semana",
  capacidadCorta: "2 / sem", // la misma cifra, en formato de dato. Se cambian JUNTAS.
  // El ancla NO es "cuánto vale mi tiempo": es lo que cuesta reprobar.
  ancla: "Reprobar la materia te cuesta entre $400 y $4,000 según en qué fase te agarre.",
  garantia:
    "Si después del video o la llamada sigues sin entenderlo, te devuelvo tu dinero o lo intentamos otra vez sin costo.",
};

// Los cuatro pasos del flujo, en el orden en que los vive el estudiante.
export const PASOS = [
  { t: "Mándame el problema", d: "Un formulario corto: materia, qué te pide el problema y dónde te atoraste. Dos minutos." },
  { t: "Pagas por Mercado Pago", d: "Link de cobro directo. Pago único: ni suscripción ni mensualidad." },
  { t: "Nos coordinamos por WhatsApp", d: "Ahí te pido las fotos o el enunciado completo si hace falta." },
  { t: `Lo recibes en ${OFFER.plazo}`, d: "Video grabado a la medida con la resolución paso a paso, o llamada 1 a 1 si el caso lo pide." },
];

// Testimonios reales, transcritos de los mensajes originales de WhatsApp.
// Vacío = el bloque no se pinta: es mejor no tener prueba social que inventarla.
//
// Forma: { bloqueo, texto, autor, detalle, capturas }. `bloqueo` es cómo
// describieron el problema ANTES, con sus palabras — vende más que el elogio de
// después, porque el que lee se reconoce ahí. `capturas` son los screenshots
// del WhatsApp original, en orden cronológico: se pintan plegados, para que el
// texto siga siendo lo que se lee y las imágenes solo lo respalden.
//
// ⚠️ Nombre completo SOLO con permiso explícito de la persona. Ambos lo dieron
// (2026-08-18). Sin permiso van iniciales.
//
// ⚠️ Antes de publicar una captura, revisar que no traiga datos de TERCEROS:
// otros nombres, teléfonos, o documentos controlados de una empresa. La foto de
// la libreta resuelta se publica con los papeles del fondo tapados a mano — ahí
// se leía el nombre de otra persona.
export const TESTIMONIOS = [
  {
    bloqueo: "No le entiendo y ya me siento fastidiado de que nada más no me sale bien el resultado.",
    texto: "Va que va, estuvo rápido. Estaría chido que el muñeco se dedicara a hacer estas cosas: ayudarnos con tareas y proyectos atorados.",
    autor: "Cristian Velázquez",
    detalle: "Ley de palancas + Ley de Pascal",
    capturas: [
      "/testimonios/cristian-pide.webp",     // pide ayuda — de aquí sale el `bloqueo`
      "/testimonios/cristian-resuelto.webp", // la libreta, con el fondo tapado
      "/testimonios/cristian.webp",          // el agradecimiento — de aquí sale el `texto`
    ],
  },
  {
    bloqueo: "Andaba muy preocupado por cómo quedaría mi proyecto, yo no sabía muy bien sobre eso.",
    texto: "Cuando te pedí ayuda me quedé más tranquilo porque sabía que tú sí podrías ayudarme. Mi proyecto quedó perfecto.",
    autor: "Josué Bautista",
    detalle: "Proyectos de Arduino · más de un mes atorado",
    capturas: ["/testimonios/proyecto.webp"],
  },
];

// Destino del CTA: el formulario de intake, o correo con asunto listo si se vacía.
export function intakeHref() {
  if (INTAKE_URL) return INTAKE_URL;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Rescate: estoy atorado con…")}`;
}
