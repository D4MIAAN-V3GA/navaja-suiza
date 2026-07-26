// Self-check del API. Correr con: node server/server.test.js
// Levanta el servidor en un puerto libre con una BD temporal y le pega por HTTP real.
import assert from "node:assert";
import { mkdtempSync, rmSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "./server.js";

const dir = mkdtempSync(join(tmpdir(), "navaja-test-"));
const TOKEN = "x".repeat(40);
const ORIGIN = "https://industriasmuneco.com";

const server = createServer({
  dbPath: join(dir, "test.db"),
  allowedOrigins: [ORIGIN],
  adminToken: TOKEN,
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const valid = { name: "Ana Torres", email: "ana@empresa.com", role: "Calidad", company: "Metrología QRO" };
const post = (body, headers) =>
  fetch(`${base}/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

try {
  // Salud
  assert.deepStrictEqual(await (await fetch(`${base}/health`)).json(), { ok: true });

  // CORS: solo el origen permitido recibe el header
  const ok = await fetch(`${base}/health`, { headers: { Origin: ORIGIN } });
  assert.strictEqual(ok.headers.get("access-control-allow-origin"), ORIGIN);
  const bad = await fetch(`${base}/health`, { headers: { Origin: "https://evil.example" } });
  assert.strictEqual(bad.headers.get("access-control-allow-origin"), null);

  // Lead válido
  assert.strictEqual((await post(valid, { "CF-Connecting-IP": "1.1.1.1" })).status, 204);

  // Validación
  assert.strictEqual((await post({ ...valid, email: "noesuncorreo" }, { "CF-Connecting-IP": "2.2.2.2" })).status, 400);
  assert.strictEqual((await post({ ...valid, name: "" }, { "CF-Connecting-IP": "2.2.2.2" })).status, 400);
  assert.strictEqual((await post({ ...valid, name: "z".repeat(101) }, { "CF-Connecting-IP": "2.2.2.2" })).status, 400);
  assert.strictEqual((await post("{no es json", { "CF-Connecting-IP": "2.2.2.2" })).status, 400);

  // Honeypot: responde 204 pero NO guarda. El caso largo importa — un honeypot que
  // solo atrapa cadenas cortas lo evade cualquier bot que llene 300 caracteres.
  assert.strictEqual((await post({ ...valid, website: "spam" }, { "CF-Connecting-IP": "3.3.3.3" })).status, 204);
  assert.strictEqual((await post({ ...valid, website: "z".repeat(300) }, { "CF-Connecting-IP": "3.3.3.3" })).status, 204);

  // Body gigante: 413 de verdad, no un socket muerto sin explicación
  assert.strictEqual(
    (await post({ ...valid, company: "z".repeat(9000) }, { "CF-Connecting-IP": "4.4.4.4" })).status,
    413
  );

  // Datos personales nunca cacheables
  assert.strictEqual((await fetch(`${base}/health`)).headers.get("cache-control"), "no-store");

  // Adivinar el token tiene freno (si no, es trabajo gratis para la Pi)
  let sawLimit = false;
  for (let i = 0; i < 35; i++) {
    const r = await fetch(`${base}/leads`, {
      headers: { Authorization: "Bearer nope", "CF-Connecting-IP": "7.7.7.7" },
    });
    if (r.status === 429) { sawLimit = true; break; }
  }
  assert.ok(sawLimit, "GET /leads permite adivinar el token sin limite");

  // Un fallo interno responde 500, NO tumba el proceso (una microSD moribunda se
  // vuelve de solo lectura y eso convertiria cada POST en una caida del servicio).
  const boom = createServer({ dbPath: join(dir, "ro.db"), allowedOrigins: [], adminToken: TOKEN });
  await new Promise((r) => boom.listen(0, "127.0.0.1", r));
  chmodSync(join(dir, "ro.db"), 0o444);
  chmodSync(dir, 0o555);
  const st = await fetch(`http://127.0.0.1:${boom.address().port}/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "8.8.8.8" },
    body: JSON.stringify(valid),
  }).then((r) => r.status).catch((e) => `sin respuesta: ${e.cause?.code}`);
  chmodSync(dir, 0o755);
  boom.close();
  assert.strictEqual(st, 500, `fallo de BD no devolvio 500 (${st}) — revisa que no tumbe el proceso`);

  // Rate limit: 5 pasan, el 6º no
  for (let i = 0; i < 4; i++) {
    assert.strictEqual((await post(valid, { "CF-Connecting-IP": "9.9.9.9" })).status, 204);
  }
  assert.strictEqual((await post(valid, { "CF-Connecting-IP": "9.9.9.9" })).status, 204);
  assert.strictEqual((await post(valid, { "CF-Connecting-IP": "9.9.9.9" })).status, 429);

  // Admin: sin token 401, con token mal 401, con token bien 200
  assert.strictEqual((await fetch(`${base}/leads`)).status, 401);
  assert.strictEqual((await fetch(`${base}/leads`, { headers: { Authorization: `Bearer ${"y".repeat(40)}` } })).status, 401);
  const listed = await fetch(`${base}/leads`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  assert.strictEqual(listed.status, 200);
  const rows = await listed.json();

  // 1 del primer POST + 5 del rate limit = 6. El honeypot y el body gigante no entraron.
  assert.strictEqual(rows.length, 6, `esperaba 6 leads, hay ${rows.length}`);
  assert.strictEqual(rows.at(-1).email, "ana@empresa.com");
  assert.ok(!rows.some((r) => r.company.length > 120), "se guardó un campo sobre el límite");

  console.log("OK — todos los asserts pasaron");
} finally {
  server.close();
  rmSync(dir, { recursive: true, force: true });
}
