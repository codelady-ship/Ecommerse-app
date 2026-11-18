# HUELINE API

Express 5 + MongoDB (Mongoose) API for the HUELINE demo shop. All input is validated with zod; responses are JSON.
Errors look like `{ "error": "...", "details": [...] }`.

## Setup

```bash
npm install
cp .env.example .env    # MONGODB_URI, JWT_SECRET (32+ chars), CORS_ORIGIN, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed            # upserts 6 styles, 9 colours, 24 products, the read-only demo admin (+ admin user if set); safe to re-run
npm run dev             # node --watch, port 4000
npm test                # 27 tests, in-memory MongoDB (mongodb-memory-server)
```

`npm start` also seeds an empty database on first boot.

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/health` | `{ ok, db }` |
| GET | `/api/categories` | styles with product counts |
| GET | `/api/colours` | dye palette |
| GET | `/api/products` | `q`, `style`, `colour`, `minPrice`, `maxPrice`, `sort` (`featured`, `price-asc`, `price-desc`, `name`), `page`, `limit` (≤100) |
| GET | `/api/search?q=silk` | name, fabric, colour, style or code; case-insensitive |
| GET | `/api/products/:code` | `{ product, related }` |
| GET | `/api/delivery?pincode=302001&subtotal=30000` | 2 working days for 30–34xxxx, 3 for metros (11, 12, 40, 41, 50, 56, 60, 70), 5 elsewhere; Sundays skipped; free shipping from ₹25,000 |
| GET | `/api/lists/:sessionId` | bag + saved for an anonymous session (UUID) |
| PUT | `/api/lists/:sessionId/bag` | `{ items: [{ code, size, qty }] }` replaces the bag (unknown codes dropped, duplicates merged) |
| POST | `/api/lists/:sessionId/bag` | `{ code, size, qty }` adds a line |
| DELETE | `/api/lists/:sessionId/bag/:code/:size` | removes a line |
| PUT / POST | `/api/lists/:sessionId/saved` | `{ codes }` replace / `{ code }` add |
| DELETE | `/api/lists/:sessionId/saved/:code` | |
| POST | `/api/orders` | `{ sessionId, items, customer: { name, email, phone, address, city, pincode } }`; prices re-read from the DB, demo only, clears the bag |
| GET | `/api/orders/:number?sessionId=` | only for the session that placed it |
| POST | `/api/newsletter` | `{ email }`; idempotent |
| POST | `/api/auth/login` | `{ email, password }` → `{ token }` (JWT, HS256, 8 h) |
| GET | `/api/auth/me` | Bearer token |
| GET / POST | `/api/admin/products` | Bearer token; create takes `{ code, name, fabric, price, colour, style, images?, description?, stock?, active? }` |
| PATCH / DELETE | `/api/admin/products/:code` | Bearer token |
| POST | `/api/admin/uploads?code=HL-T-01` | Bearer token, multipart field `image` (JPEG/PNG/WebP/AVIF, ≤2 MB); saved to `UPLOAD_DIR` (served at `/uploads`) or to Cloudinary when `CLOUDINARY_URL` is set; with `code` the URL is appended to that product |
| GET | `/api/admin/orders`, `/api/admin/subscribers` | Bearer token |

The seed also creates a public **read-only demo admin** (`demo@hueline.az` / `demo1234`, role `demo`) for the portfolio.
It can call every GET above; every POST / PATCH / DELETE under `/api/admin` answers
`403 { "error": "Demo admin is read-only: changes are not saved.", "demo": true }`. `DEMO_ADMIN=off` + `npm run seed` removes it.

Example:

```bash
TOKEN=$(curl -s -X POST localhost:4000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"your-admin-password"}' | node -p 'JSON.parse(require("fs").readFileSync(0)).token')
curl -X POST localhost:4000/api/admin/uploads?code=HL-T-02 -H "Authorization: Bearer $TOKEN" -F image=@photo.webp
```

## Security

helmet headers, CORS allow-list (`CORS_ORIGIN`), JSON body limit 100 kB, rate limits (120/min per IP overall,
20/min for orders, 10/min for newsletter, 10 per 15 min for login), bcrypt password hashes, a dummy hash check for unknown login emails,
zod validation on every input, no secrets in the repo (`.env` is git-ignored).

On Render's free plan the disk is ephemeral: uploaded files in `uploads/` disappear on redeploy. Set `CLOUDINARY_URL`
to keep them.
