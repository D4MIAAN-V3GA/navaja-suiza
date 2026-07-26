# API de La Navaja Suiza — instalación en la Raspberry Pi 5

Backend mínimo que recibe los leads del formulario de la calculadora GUM y los guarda en SQLite.
Sin dependencias npm: `node:http` + `node:sqlite` de la biblioteca estándar.

```
Navegador → Vercel (industriasmuneco.com)
                └─ POST → api.industriasmuneco.com
                              │ Cloudflare Tunnel (conexión SALIENTE desde tu casa)
                              ↓
                    Raspberry Pi → 127.0.0.1:8787 → /var/lib/navaja-api/leads.db
```

**La Pi nunca abre un puerto en tu router y tu IP de casa nunca se publica.** El túnel sale de
adentro hacia afuera, como cuando tu navegador visita una página.

---

## Requisitos

Node **22 o superior** (`node:sqlite` no existe antes). En Raspberry Pi OS de 64 bits:

```sh
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
node -v      # debe decir v22.x o superior
```

---

## 1. Usuario, carpetas y permisos

Un usuario de sistema sin login ni home: si el servicio se compromete, no hay sesión que robar.

```sh
sudo adduser --system --group --no-create-home navaja

sudo mkdir -p /opt/navaja-api /var/lib/navaja-api
sudo chown navaja:navaja /var/lib/navaja-api
sudo chmod 700 /var/lib/navaja-api        # solo 'navaja' entra a los datos personales
```

## 2. Copiar el código

Desde tu portátil, en la raíz del repo:

```sh
scp server/server.js  TU_USUARIO@IP_DE_LA_PI:/tmp/
ssh TU_USUARIO@IP_DE_LA_PI 'sudo mv /tmp/server.js /opt/navaja-api/ && sudo chown root:root /opt/navaja-api/server.js'
```

El código lo lee `navaja` pero lo escribe solo `root`: el servicio no puede modificarse a sí mismo.

## 3. Secretos

Genera un token largo y aleatorio (es la llave para leer tus leads):

```sh
openssl rand -hex 32
```

Crea `/etc/navaja-api.env` con `sudo nano /etc/navaja-api.env`:

```sh
ADMIN_TOKEN=pega_aquí_el_hex_de_64_caracteres
ALLOWED_ORIGINS=https://industriasmuneco.com,https://www.industriasmuneco.com
DB_PATH=/var/lib/navaja-api/leads.db
PORT=8787
```

Y ciérralo:

```sh
sudo chown root:navaja /etc/navaja-api.env
sudo chmod 640 /etc/navaja-api.env        # nadie más en la Pi puede leer el token
```

> Este archivo **nunca** va a git. Tampoco pongas el token en una variable `VITE_*`: todo lo que
> lleva ese prefijo se empaqueta dentro del JavaScript que descarga cualquier visitante.

## 4. Servicio

```sh
sudo cp server/navaja-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now navaja-api
systemctl status navaja-api               # debe decir "active (running)"
curl localhost:8787/health                # {"ok":true}
```

> Verás un aviso `ExperimentalWarning: SQLite is an experimental feature`. Es normal en Node 22–24;
> la API funciona. Si algún día cambia, el único archivo a tocar es `server.js`.

## 5. Cloudflare Tunnel

Requiere que `industriasmuneco.com` esté administrado por Cloudflare (plan gratuito basta).

```sh
# Instalar cloudflared en la Pi (ARM64)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb -o cf.deb
sudo dpkg -i cf.deb && rm cf.deb

cloudflared tunnel login                  # abre un link, autoriza tu dominio
cloudflared tunnel create navaja
cloudflared tunnel route dns navaja api.industriasmuneco.com
```

Crea `~/.cloudflared/config.yml`:

```yaml
tunnel: navaja
credentials-file: /home/TU_USUARIO/.cloudflared/NOMBRE-DEL-TUNEL.json

ingress:
  - hostname: api.industriasmuneco.com
    service: http://127.0.0.1:8787
  - service: http_status:404      # todo lo demás se rechaza
```

Y déjalo como servicio:

```sh
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

## 6. Cortafuegos

No hay que abrir **nada**. El túnel sale hacia afuera; el API solo escucha en `127.0.0.1`.

```sh
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh                        # solo si administras la Pi por SSH
sudo ufw enable
```

## 7. Vercel

En el panel del proyecto → Settings → Environment Variables:

```
VITE_API_URL = https://api.industriasmuneco.com
```

Y haz un redeploy (las variables `VITE_*` se hornean en tiempo de build, no de ejecución).

---

## Verificación de punta a punta

```sh
# 1. Self-check del código (en tu portátil, en la raíz del repo)
node server/server.test.js                       # → OK

# 2. El servicio vive
curl localhost:8787/health                       # → {"ok":true}

# 3. El túnel vive (desde tu portátil, NO desde la Pi)
curl https://api.industriasmuneco.com/health     # → {"ok":true}

# 4. Rechaza basura
curl -X POST https://api.industriasmuneco.com/lead \
  -H 'Content-Type: application/json' -d '{"email":"noesuncorreo"}'   # → 400

# 5. El admin exige token
curl https://api.industriasmuneco.com/leads                          # → 401
curl -H "Authorization: Bearer TU_TOKEN" https://api.industriasmuneco.com/leads
```

Después, en el sitio real: llena el formulario de la calculadora de incertidumbre y confirma que el
lead aparece en el paso 5. **Apaga el servicio (`sudo systemctl stop navaja-api`) y repite: el
reporte debe abrirse igual.** Eso es el fail-open — un backend caído nunca rompe el sitio.

---

## Operación diaria

```sh
sudo systemctl restart navaja-api                # reiniciar
sudo journalctl -u navaja-api -n 50              # logs (no contienen datos de leads, a propósito)
sudo -u navaja sqlite3 /var/lib/navaja-api/leads.db 'SELECT * FROM leads;'
```

**Respaldo** — son datos de clientes, no los tengas en un solo disco:

```sh
sudo -u navaja sqlite3 /var/lib/navaja-api/leads.db ".backup '/var/lib/navaja-api/backup.db'"
```

## Endurecer la Pi (hazlo antes de exponer nada)

El API es la parte fácil; la Pi misma es la superficie grande.

```sh
# 1. SSH solo con llave — el password de la Pi es lo primero que prueban los bots
ssh-copy-id TU_USUARIO@IP_DE_LA_PI          # desde tu portátil, primero
sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# 2. Que no quede el usuario 'pi' con password por defecto
passwd                                       # cambia el tuyo si nunca lo hiciste

# 3. Credenciales del túnel a solo-tu-usuario
chmod 600 ~/.cloudflared/*.json

# 4. Parches automáticos de seguridad
sudo apt install -y unattended-upgrades && sudo dpkg-reconfigure -plow unattended-upgrades
```

**Aviso de privacidad (LFPDPPP).** El formulario recoge datos personales de terceros y eres una
empresa mexicana: la ley te obliga a mostrar un aviso de privacidad en el punto de captura. Falta.
Agrega al modal una línea con enlace a `/privacidad` antes de anunciar la herramienta.

## Límites conocidos

- **El rate limit vive en memoria** y se reinicia con el servicio. Suficiente para un formulario.
- **CORS no frena un `curl`** — solo lo aplica el navegador. Contra abuso directo trabajan el rate
  limit, el tope de body de 4 KB y la validación.
- **Si falta el header `CF-Connecting-IP`**, todo el tráfico comparte una sola cubeta de rate limit
  y el sexto visitante del día se queda sin enviar. Es fallo cerrado (seguro), y el servicio lo
  grita en el log: `journalctl -u navaja-api | grep AVISO`. Si aparece, el túnel está mal.
- **La BD no está cifrada en reposo.** Los permisos (700) protegen contra otros usuarios de la Pi,
  no contra quien se lleve la microSD físicamente. Cifrar el disco es la respuesta si algún día los
  datos lo ameritan.
- **Cloudflare ve el tráfico en claro** (el TLS termina en su borde). Es inherente a usar un túnel.
- **Sin política de retención**: los leads se acumulan para siempre. Borra los viejos cuando dejen
  de servirte — menos datos guardados es menos daño si algo sale mal.
- **El muro de leads sigue siendo cosmético**: quien abra las DevTools puede llamar `downloadReport`
  sin registrarse. Se cierra de verdad solo cuando el PDF se genere en el servidor.
- **`react-router-dom` tiene 2 avisos de `npm audit` sin parche disponible** (CSRF en modo RSC). El
  único "arreglo" que ofrece npm es bajar a 7.11.0, una versión mayor atrás. **No lo hagas**: el
  fallo es del modo RSC y este sitio usa `BrowserRouter` plano sin acciones de servidor, así que no
  aplica. Revisa de nuevo cuando salga un 7.18.x parcheado.
