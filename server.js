const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const HOST = "0.0.0.0";
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");
const DATA = path.join(ROOT, "data");
const PRODUCTS_FILE = path.join(DATA, "products.json");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@gokulsweets-demo.local").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mithai123";
const SESSION_SECRET = process.env.SESSION_SECRET || "gokul-demo-session-secret-change-me";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

const seedProducts = [
  {
    "id": "rajbhog",
    "name": "Rajbhog",
    "category": "Sweets",
    "price": 320,
    "originalPrice": 360,
    "unit": "1 kg",
    "stockQuantity": 20,
    "stockStatus": "In Stock",
    "description": "A rich, festive milk sweet with a soft, indulgent centre.",
    "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=88",
    "featured": true,
    "active": true
  },
  {
    "id": "ras-malai",
    "name": "Ras Malai",
    "category": "Sweets",
    "price": 280,
    "originalPrice": 320,
    "unit": "500 g",
    "stockQuantity": 18,
    "stockStatus": "In Stock",
    "description": "Soft chenna discs soaked in creamy saffron-cardamom milk.",
    "image": "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=1400&q=88",
    "featured": true,
    "active": true
  },
  {
    "id": "gulab-jamun",
    "name": "Gulab Jamun",
    "category": "Sweets",
    "price": 220,
    "originalPrice": 250,
    "unit": "500 g",
    "stockQuantity": 25,
    "stockStatus": "In Stock",
    "description": "Warm, syrupy milk-solid dumplings made for celebrations and sharing.",
    "image": "https://images.unsplash.com/photo-1627670381055-487000952cb0?auto=format&fit=crop&w=1400&q=88",
    "featured": true,
    "active": true
  },
  {
    "id": "kaju-katli",
    "name": "Kaju Katli",
    "category": "Sweets",
    "price": 560,
    "originalPrice": 620,
    "unit": "1 kg",
    "stockQuantity": 12,
    "stockStatus": "In Stock",
    "description": "Silky cashew fudge with a delicate silver-leaf style finish.",
    "image": "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=1400&q=88",
    "featured": true,
    "active": true
  },
  {
    "id": "jalebi",
    "name": "Jalebi",
    "category": "Sweets",
    "price": 180,
    "originalPrice": 210,
    "unit": "500 g",
    "stockQuantity": 30,
    "stockStatus": "In Stock",
    "description": "Crisp, golden spirals soaked in fragrant sugar syrup and served fresh.",
    "image": "https://images.unsplash.com/photo-1575377427642-087cf684f04d?auto=format&fit=crop&w=1400&q=88",
    "featured": false,
    "active": true
  },
  {
    "id": "motichoor-laddu",
    "name": "Motichoor Laddu",
    "category": "Sweets",
    "price": 260,
    "originalPrice": 290,
    "unit": "500 g",
    "stockQuantity": 16,
    "stockStatus": "In Stock",
    "description": "Fine boondi pearls shaped into soft festive laddus for sharing and gifting.",
    "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=88",
    "featured": false,
    "active": true
  },
  {
    "id": "samosa",
    "name": "Samosa",
    "category": "Snacks",
    "price": 18,
    "originalPrice": 20,
    "unit": "1 piece",
    "stockQuantity": 80,
    "stockStatus": "In Stock",
    "description": "Crisp pastry filled with comforting spiced potato and peas.",
    "image": "https://images.unsplash.com/photo-1786174045067-d5bb503aa362?auto=format&fit=crop&w=1400&q=88",
    "featured": false,
    "active": true
  },
  {
    "id": "kachori",
    "name": "Dal Kachori",
    "category": "Snacks",
    "price": 25,
    "originalPrice": 30,
    "unit": "1 piece",
    "stockQuantity": 55,
    "stockStatus": "In Stock",
    "description": "Flaky, crisp kachori with a savoury lentil-spice filling.",
    "image": "https://images.unsplash.com/photo-1627670381055-487000952cb0?auto=format&fit=crop&w=1400&q=88",
    "featured": false,
    "active": true
  },
  {
    "id": "paneer-thali",
    "name": "Paneer Special Thali",
    "category": "Restaurant",
    "price": 260,
    "originalPrice": 290,
    "unit": "1 plate",
    "stockQuantity": 30,
    "stockStatus": "In Stock",
    "description": "A hearty vegetarian meal for guests looking for a complete dining experience.",
    "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1400&q=88",
    "featured": true,
    "active": true
  },
  {
    "id": "chole-bhature",
    "name": "Chole Bhature",
    "category": "Restaurant",
    "price": 190,
    "originalPrice": 220,
    "unit": "1 plate",
    "stockQuantity": 24,
    "stockStatus": "In Stock",
    "description": "Spiced chickpeas paired with fluffy bhature for a satisfying family meal.",
    "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1400&q=88",
    "featured": false,
    "active": true
  },
  {
    "id": "badam-shake",
    "name": "Badam Milk Shake",
    "category": "Beverages",
    "price": 140,
    "originalPrice": 160,
    "unit": "1 glass",
    "stockQuantity": 22,
    "stockStatus": "In Stock",
    "description": "Chilled almond milk shake with a creamy, festive finish.",
    "image": "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=1400&q=88",
    "featured": false,
    "active": true
  },
  {
    "id": "family-combo",
    "name": "Family Celebration Box",
    "category": "Combos",
    "price": 899,
    "originalPrice": 999,
    "unit": "1 box",
    "stockQuantity": 8,
    "stockStatus": "In Stock",
    "description": "A curated mix of sweets designed for family gatherings and gifting.",
    "image": "https://images.unsplash.com/photo-1575377427642-087cf684f04d?auto=format&fit=crop&w=1400&q=88",
    "featured": true,
    "active": true
  }
];

function ensureData() {
  fs.mkdirSync(DATA, { recursive: true });
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seedProducts, null, 2));
  }
}
ensureData();

function readProducts() {
  try {
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE, "utf8"));
  } catch {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(seedProducts, null, 2));
    return [...seedProducts];
  }
}

function writeProducts(products) {
  const tmp = `${PRODUCTS_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(products, null, 2));
  fs.renameSync(tmp, PRODUCTS_FILE);
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function parseCookies(req) {
  const raw = req.headers.cookie || "";
  return raw.split(";").reduce((out, item) => {
    const i = item.indexOf("=");
    if (i > -1) out[item.slice(0, i).trim()] = decodeURIComponent(item.slice(i + 1).trim());
    return out;
  }, {});
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(payload) {
  const encoded = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

function verifyToken(token) {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;
    const expected = crypto.createHmac("sha256", SESSION_SECRET).update(encoded).digest("base64url");
    const sigBuffer = Buffer.from(sig);
    const expectedBuffer = Buffer.from(expected);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function getAdmin(req) {
  const cookies = parseCookies(req);
  return verifyToken(cookies.admin_session || "");
}

function send(res, status, body, type = "application/json; charset=utf-8", extraHeaders = {}) {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store", ...extraHeaders });
  res.end(body);
}

function json(res, status, data, extraHeaders = {}) {
  send(res, status, JSON.stringify(data), "application/json; charset=utf-8", extraHeaders);
}

function redirect(res, location) {
  res.writeHead(302, { Location: location, "Cache-Control": "no-store" });
  res.end();
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > 2_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); }
      catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

function normalizeProduct(input, existing = {}) {
  const name = String(input.name ?? existing.name ?? "").trim();
  const category = String(input.category ?? existing.category ?? "Sweets").trim();
  const unit = String(input.unit ?? existing.unit ?? "1 piece").trim();
  const description = String(input.description ?? existing.description ?? "").trim();
  const image = String(input.image ?? existing.image ?? "").trim();
  const price = Number(input.price ?? existing.price);
  const originalPrice = input.originalPrice === "" || input.originalPrice == null
    ? null : Number(input.originalPrice);
  const stockQuantity = Math.max(0, Math.floor(Number(input.stockQuantity ?? existing.stockQuantity ?? 0)));
  const featured = Boolean(input.featured ?? existing.featured);
  const active = input.active == null ? Boolean(existing.active ?? true) : Boolean(input.active);

  if (!name) throw new Error("Product name is required.");
  if (!category) throw new Error("Category is required.");
  if (!Number.isFinite(price) || price < 0) throw new Error("Price must be a valid non-negative number.");
  if (originalPrice !== null && (!Number.isFinite(originalPrice) || originalPrice < price)) {
    throw new Error("Original price must be empty or greater than/equal to the selling price.");
  }
  if (!unit) throw new Error("Quantity / Unit is required.");
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) throw new Error("Stock quantity must be 0 or greater.");
  if (!image) throw new Error("Product image URL is required.");

  return {
    id: existing.id || `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Date.now().toString(36)}`,
    name, category, price, originalPrice, unit,
    stockQuantity,
    stockStatus: stockQuantity > 0 ? "In Stock" : "Out of Stock",
    description, image, featured, active
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === "/api/health") {
      return json(res, 200, { ok: true, service: "gokul-sweets-demo", time: new Date().toISOString() });
    }

    if (pathname === "/api/auth/login" && req.method === "POST") {
      const body = await parseBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!email || !password) return json(res, 400, { ok: false, message: "Email and password are required." });

     const emailBuffer = Buffer.from(email);
const adminEmailBuffer = Buffer.from(ADMIN_EMAIL);

const passwordBuffer = Buffer.from(password);
const adminPasswordBuffer = Buffer.from(ADMIN_PASSWORD);

const emailOk =
  emailBuffer.length === adminEmailBuffer.length &&
  crypto.timingSafeEqual(emailBuffer, adminEmailBuffer);

const passwordOk =
  passwordBuffer.length === adminPasswordBuffer.length &&
  crypto.timingSafeEqual(passwordBuffer, adminPasswordBuffer);
  
      if (!emailOk || !passwordOk) {
        return json(res, 401, { ok: false, message: "Invalid admin credentials." });
      }

      const now = Math.floor(Date.now() / 1000);
      const token = sign({ sub: ADMIN_EMAIL, iat: now, exp: now + SESSION_TTL_SECONDS });
      return json(res, 200, { ok: true, user: { email: ADMIN_EMAIL } }, {
        "Set-Cookie": `admin_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`
      });
    }

    if (pathname === "/api/auth/me" && req.method === "GET") {
      const admin = getAdmin(req);
      return json(res, 200, admin ? { ok: true, user: { email: admin.sub } } : { ok: false });
    }

    if (pathname === "/api/auth/logout" && req.method === "POST") {
      return json(res, 200, { ok: true }, {
        "Set-Cookie": "admin_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0"
      });
    }

    if (pathname === "/api/products" && req.method === "GET") {
      const all = readProducts();
      const admin = getAdmin(req);
      const products = admin ? all : all.filter(p => p.active);
      return json(res, 200, { ok: true, products });
    }

    if (pathname === "/api/products" && req.method === "POST") {
      if (!getAdmin(req)) return json(res, 401, { ok: false, message: "Authentication required." });
      const body = await parseBody(req);
      const product = normalizeProduct(body);
      const products = readProducts();
      products.unshift(product);
      writeProducts(products);
      return json(res, 201, { ok: true, product });
    }

    const match = pathname.match(/^\/api\/products\/([^/]+)$/);
    if (match) {
      if (!getAdmin(req)) return json(res, 401, { ok: false, message: "Authentication required." });
      const id = match[1];
      const products = readProducts();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) return json(res, 404, { ok: false, message: "Product not found." });

      if (req.method === "PUT") {
        const body = await parseBody(req);
        const updated = normalizeProduct(body, products[index]);
        products[index] = updated;
        writeProducts(products);
        return json(res, 200, { ok: true, product: updated });
      }

      if (req.method === "DELETE") {
        const [removed] = products.splice(index, 1);
        writeProducts(products);
        return json(res, 200, { ok: true, product: removed });
      }
    }

    if (pathname === "/admin") return redirect(res, "/admin.html");

    if (req.method === "GET") {
      const requested = pathname === "/" ? "/index.html" : pathname;
      const filePath = path.resolve(PUBLIC, `.${requested}`);
      if (!filePath.startsWith(PUBLIC + path.sep) && filePath !== PUBLIC) {
        return send(res, 403, "Forbidden", "text/plain; charset=utf-8");
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const types = {
          ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"application/javascript; charset=utf-8",
          ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp",
          ".ico":"image/x-icon", ".json":"application/json; charset=utf-8"
        };
        return send(res, 200, fs.readFileSync(filePath), types[ext] || "application/octet-stream", { "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600" });
      }
    }

    if (req.method === "GET") {
      return send(res, 404, "Not found", "text/plain; charset=utf-8");
    }

    return json(res, 405, { ok: false, message: "Method not allowed." });
  } catch (error) {
    console.error(error);
    return json(res, 500, { ok: false, message: error.message || "Internal server error." });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Gokul Sweets demo running on http://${HOST}:${PORT}`);
});
