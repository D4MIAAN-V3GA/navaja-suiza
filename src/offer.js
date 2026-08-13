// ── Oferta "De Atorado a Aprobado" — fuente ÚNICA de verdad ──────────
//
// El precio, el plazo y la escasez que se dicen en los videos, en la bio y en
// WhatsApp tienen que ser IDÉNTICOS a los de aquí. Si cambia algo, se cambia en
// este archivo y se propaga solo a la Landing y al riel de las herramientas.
//
// A quién le habla: al estudiante que tiene ESTE problema, AHORA, con fecha
// límite encima. No al que "quiere aprender la materia" — ese se queda con las
// herramientas gratis, que para eso están.

// Enlaces del flujo. Mientras no existan, la Landing NO enseña un enlace muerto:
// `intakeHref()` cae a correo con asunto listo. Al crear el formulario (Google
// Forms/Tally) y el link de cobro, se pegan aquí y no hay que tocar nada más.
export const INTAKE_URL = "";                 // TODO: formulario de intake
export const MERCADO_PAGO_URL = "";           // TODO: link de cobro (lo manda Damián tras el formulario)
export const WHATSAPP_URL = "";               // TODO: wa.me/52... — coordinación tras el pago
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

// Testimonios reales, con autorización. Vacío = el bloque no se pinta: es mejor
// no tener prueba social que inventarla.
// Forma: { texto, autor, detalle }
export const TESTIMONIOS = [];

// Destino del CTA. Sin formulario todavía → correo con el asunto ya puesto.
export function intakeHref() {
  if (INTAKE_URL) return INTAKE_URL;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Rescate: estoy atorado con…")}`;
}
