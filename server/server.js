// API de La Navaja Suiza — corre en la Raspberry Pi detrás de un Cloudflare Tunnel.
// Sin dependencias: node:http + node:sqlite de la biblioteca estándar (Node 22+).
import http from "node:http";
import { DatabaseSync } from "node:sqlite";
import { timingSafeEqual } from "node:crypto";

const BODY_LIMIT = 4096;          // bytes; un POST más grande se corta en seco
const RATE_MAX = 5;               // POST /lead permitidos...
const ADMIN_RATE_MAX = 30;        // ...y GET /leads, que solo usas tú...
const RATE_WINDOW_MS = 10 * 60e3; // ...cada 10 minutos, por IP

// Cloudflare SOBRESCRIBE CF-Connecting-IP con la IP real: un cliente no la puede falsear.
// Es de fiar únicamente porque escuchamos en 127.0.0.1 y solo el túnel llega ahí.
let warnedNoIp = false;
function clientIp(req) {
  const ip = req.headers["cf-connecting-ip"];
  if (ip) return ip;
  // Sin el header, TODO el tráfico del túnel comparte una sola cubeta y el sexto
  // visitante del día se queda sin enviar. Es fallo cerrado (seguro), pero silencioso:
  // hay que gritarlo o nunca te enteras de que el túnel quedó mal configurado.
  if (!warnedNoIp) {
    warnedNoIp = true;
    console.warn("AVISO: llega tráfico sin CF-Connecting-IP — revisa el túnel; el rate limit es global mientras tanto.");
  }
  return req.socket.remoteAddress || "?";
}

const LIMITS = { name: 100, email: 160, role: 120, company: 120 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// El body puede llegar en cualquier tamaño: se aborta al pasar el tope en vez de
// acumular en memoria. Sin esto, un POST de 1 GB tumba la Pi.
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > BODY_LIMIT) {
        // Pausar en vez de destruir: así el handler alcanza a responder 413 antes de
        // cerrar. Destruir el socket deja al cliente con un error de red sin explicación.
        req.pause();
        reject(new Error("too_large"));
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

// Devuelve el campo saneado, o null si falta / se pasa de largo.
function field(raw, max, { required = true } = {}) {
  if (typeof raw !== "string") return required ? null : "";
  const v = raw.trim();
  if (!v) return required ? null : "";
  return v.length <= max ? v : null;
}

function tokenMatches(given, expected) {
  const a = Buffer.from(given || "");
  const b = Buffer.from(expected);
  // timingSafeEqual exige longitudes iguales; comparar la longitud aparte no filtra
  // nada útil porque el token es de largo fijo y conocido.
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createServer({ dbPath, allowedOrigins, adminToken }) {
  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id         INTEGER PRIMARY KEY,
      created_at TEXT NOT NULL,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      role       TEXT NOT NULL,
      company    TEXT NOT NULL,
      source     TEXT NOT NULL
    )
  `);
  const insert = db.prepare(
    "INSERT INTO leads (created_at, name, email, role, company, source) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const selectAll = db.prepare("SELECT * FROM leads ORDER BY id DESC LIMIT 500");

  // ponytail: rate limit en memoria, se reinicia con el servicio. Suficiente para un
  // formulario; mover a una tabla de SQLite solo si el reinicio se vuelve un agujero real.
  const hits = new Map();
  function rateLimited(key, max = RATE_MAX) {
    const now = Date.now();
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
    }
    const e = hits.get(key);
    if (!e || e.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
      return false;
    }
    e.count += 1;
    return e.count > max;
  }

  async function handle(req, res) {
    const origin = req.headers.origin;
    const cors = allowedOrigins.includes(origin)
      ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
      : {};

    // Nunca registrar el body: son datos personales y journald los rota a disco.
    const send = (code, body) => {
      const payload = body === undefined ? "" : JSON.stringify(body);
      res.writeHead(code, {
        ...cors,
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        // /leads devuelve datos personales: que no los guarde ningún caché intermedio.
        "Cache-Control": "no-store",
      });
      res.end(payload);
    };

    if (req.method === "OPTIONS") {
      res.writeHead(cors["Access-Control-Allow-Origin"] ? 204 : 403, {
        ...cors,
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      });
      return res.end();
    }

    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && url.pathname === "/health") {
      return send(200, { ok: true });
    }

    if (req.method === "GET" && url.pathname === "/leads") {
      // El rate limit va ANTES del token: sin esto se puede intentar adivinarlo sin
      // freno, y cada intento hace trabajo en la Pi.
      if (rateLimited(`admin:${clientIp(req)}`, ADMIN_RATE_MAX)) return send(429, { error: "rate_limited" });
      const given = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      if (!tokenMatches(given, adminToken)) return send(401, { error: "unauthorized" });
      return send(200, selectAll.all());
    }

    if (req.method === "POST" && url.pathname === "/lead") {
      if (rateLimited(clientIp(req))) return send(429, { error: "rate_limited" });

      let data;
      try {
        data = JSON.parse(await readBody(req));
      } catch (err) {
        return send(err.message === "too_large" ? 413 : 400, { error: "bad_request" });
      }
      if (!data || typeof data !== "object") return send(400, { error: "bad_request" });

      // Honeypot: el campo va oculto en el formulario, un humano nunca lo llena.
      // Cualquier contenido lo delata — nada de pasarlo por field(), que devuelve null
      // cuando se pasa de largo y dejaría entrar al bot que llene 300 caracteres.
      if (typeof data.website === "string" && data.website.trim()) return send(204);

      const lead = {
        name: field(data.name, LIMITS.name),
        email: field(data.email, LIMITS.email),
        role: field(data.role, LIMITS.role),
        company: field(data.company, LIMITS.company),
      };
      if (Object.values(lead).some((v) => v === null)) return send(400, { error: "bad_request" });
      if (!EMAIL_RE.test(lead.email)) return send(400, { error: "bad_email" });

      insert.run(
        new Date().toISOString(),
        lead.name,
        lead.email,
        lead.role,
        lead.company,
        field(data.source, 60, { required: false }) || "uncertainty"
      );
      return send(204);
    }

    send(404, { error: "not_found" });
  }

  // En Node, una promesa rechazada dentro del handler TERMINA el proceso. Con la BD en
  // una microSD —que típicamente falla volviéndose de solo lectura— eso sería un bucle
  // de caídas que systemd acaba abandonando. Un 500 es infinitamente mejor.
  const server = http.createServer((req, res) => {
    handle(req, res).catch((err) => {
      console.error("error no manejado:", err?.code || err?.message || "desconocido");
      if (res.headersSent || res.destroyed) return res.destroy();
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end('{"error":"server_error"}');
    });
  });
  // Cortan slowloris: conexiones que abren y mandan bytes a cuentagotas.
  server.headersTimeout = 10_000;
  server.requestTimeout = 20_000;

  server.on("close", () => db.close());
  return server;
}

// Arranque real: solo cuando se ejecuta directamente, no cuando lo importa el test.
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken || adminToken.length < 32) {
    console.error("ADMIN_TOKEN falta o mide menos de 32 caracteres. Abortando.");
    process.exit(1);
  }
  const server = createServer({
    dbPath: process.env.DB_PATH || "./leads.db",
    allowedOrigins: (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean),
    adminToken,
  });
  // 127.0.0.1 a propósito: nada en la red local puede hablarle, solo el túnel.
  server.listen(Number(process.env.PORT) || 8787, "127.0.0.1", () => {
    console.log(`navaja-api escuchando en 127.0.0.1:${server.address().port}`);
  });
}
