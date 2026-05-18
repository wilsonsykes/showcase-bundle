# Showcase API (Local Postgres)

This API is the integration layer between admin writes and public static output.

## 1. Setup

1. Copy env template:
   - `cp .env.example .env` (or on PowerShell: `Copy-Item .env.example .env`)
2. Update `DATABASE_URL` in `.env`.
3. Review `backend.config.json` for site URLs, API mode, and CORS origins.
3. Install deps:
   - `npm install`

## 2. Run migrations + seed

1. `npm run migrate`
2. `npm run seed`

## 3. Start API

1. `npm start`
2. Default base URL: `http://localhost:4100`

## 4. Endpoints

- `GET /health`
- `GET /backend-config/public`
- `GET /catalog` -> `{ categories, products }` (same shape as current showcase JSON)
- `GET /hub-links` -> `{ brand, brands, links }` (same shape as current brand-hub JSON)
- `POST /products/upsert` (admin key required when `ADMIN_API_KEY` is set)
- `POST /links/upsert` (admin key required when `ADMIN_API_KEY` is set)
- `POST /media/upload` (`multipart/form-data`, field name: `file`)
- `POST /admin/export-snapshots` writes DB data back to:
  - `showcase-site/data/products.json`
  - `showcase-site/data/categories.json`
  - `brand-hub/data/links.json`

## 5. Auth behavior

If `ADMIN_API_KEY` is set in `.env`, write routes require header:

`x-admin-key: <your-key>`

## 6. Storage

Uploaded media files are written to:

- Path set by `MEDIA_STORAGE_DIR` (for example `C:/ShowcaseBundleMedia/media`)

`/media/...` URLs are served by this API process for local development.

## 7. Backend config model

- `backend.config.json` centralizes:
  - API runtime defaults
  - DB host metadata (non-secret)
  - CORS allowlist
  - Website integration targets for:
    - `showcase-site`
    - `brand-hub`
    - admin site

Environment variable overrides:

- `BACKEND_ENV` (e.g. `local`, `staging`, `prod`)
- `BACKEND_CONFIG_FILE` (alternate JSON path)
- `CORS_ORIGINS` (comma-separated allowlist, overrides JSON list)
