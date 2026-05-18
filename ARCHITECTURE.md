# Bundle Architecture (v2 Transition)

## Current public delivery

- `showcase-site/` -> static catalog UI
- `brand-hub/` -> static brand hub UI
- GitHub Pages deploy via `.github/workflows/deploy-pages.yml`

## New integration layer (started)

- `apps/api/` -> local API service for read/upsert/media upload
- `infra/sql/` -> Postgres schema migrations
- `storage/media/` -> local media file storage
- `showcase-admin/` -> now has API sync controls in Build & Backup
- `apps/api/backend.config.json` -> centralized backend config (API, DB metadata, CORS, site targets)
- `showcase-site/config/backend.json` and `brand-hub/config/backend.json` -> per-site backend integration config

## Data flow target

1. Admin app sends upserts to API.
2. API validates payload and writes Postgres.
3. API exposes read models (`/catalog`, `/hub-links`) for frontend consumption.
4. Static snapshot/export can be generated from DB for GitHub Pages deploy.

## Next implementation slices

1. Add media upload UI in `showcase-admin` (wire to `POST /media/upload` and auto-fill image/icon paths).
2. Optionally switch public pages to API reads for local preview mode.
3. Add CI checks for payload rules (duplicate ids, invalid brand keys, URL format).
4. Add optional auto-commit workflow for snapshot files after admin sync/export.
