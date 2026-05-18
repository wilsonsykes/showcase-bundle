# Setup Guide

Two public sites, one admin tool, no passwords.

```
your-project/
├── showcase-site/          ← Public site #1: products & categories
│   ├── index.html
│   ├── data/{products,categories}.json
│   ├── images/{products,categories}/
│   ├── start-server.bat        (Windows)
│   └── start-server.command    (Mac)
│
├── brand-hub/              ← Public site #2: drill-down brand hub
│   ├── index.html
│   ├── data/links.json         ← umbrella brand + sub-brands + all links
│   ├── materials/              ← PDFs, lookbooks (drop files here)
│   ├── images/                 ← logos, custom icons
│   ├── start-server.bat
│   └── start-server.command
│
└── showcase-admin/         ← Private editor (stays on your computer)
    └── admin-dashboard.html
```

---

## How the Brand Hub is structured

Two-level navigation by **destination** — every home-page button is a drill-down.

### Home page
- Umbrella identity (your parent brand name, tagline, logo)
- **Explore** — a column of destination buttons:
  - One button per **sub-brand** (Quadro Decor, Brand B, etc.) → drills into that brand's page
  - One **Materials** button (📚) → drills into a dedicated page listing all catalogs, lookbooks, and videos across every brand

### Brand pages (one per sub-brand)
- Brand identity (logo, name, tagline, accent color)
- Brand-specific links only — shop, social, contact, anything **not** tagged as Materials
- A "Back to home" button up top

### Materials page (one shared page for all materials)
- Title "Materials" with a books icon
- Every material link from every brand, each labeled with brand attribution in the subtitle (e.g. *"Quadro Decor · PDF · 24 pages"*)
- Umbrella-wide materials (those with a blank Brand field) get prefixed with your parent brand name instead — useful for corporate brochures and company-wide profiles
- Same back-button pattern as brand pages

### The routing rule
Every link has a `category` field. The rule is simple:

| Category value | Where it appears |
|---|---|
| `materials` | The **Materials** drill-down page (reached from the home page Materials button) |
| Anything else (`shop`, `social`, `contact`, `other`, or blank) | Inside that link's brand page |

### Deep linking
All three destinations have shareable URLs:
- `https://your-hub.com/` → home (umbrella + destination buttons)
- `https://your-hub.com/#quadro-decor` → straight into Quadro Decor's brand page
- `https://your-hub.com/#brand-b` → straight into Brand B's brand page
- `https://your-hub.com/#materials` → straight into the Materials page

Send a wholesale client the `#materials` link to give them a clean view of just the catalogs and lookbooks. Send the bare URL when you want visitors to choose.

---

## First-time setup

### 1. Open the admin dashboard
Double-click `showcase-admin/admin-dashboard.html`. It opens in your browser and auto-saves to local storage.

> Coming from v1? Your products and categories migrate automatically. The old `materials` data is dropped (intentional — the showcase no longer has a Materials tab).

### 2. Connect the two data folders (Build & Backup tab)

- **Showcase data folder** → pick `showcase-site/data/`. Saves write `products.json` + `categories.json`.
- **Brand Hub data folder** → pick `brand-hub/data/`. Saves write `links.json` (umbrella brand + sub-brands + links).

Works in Chrome/Edge/Brave/Opera. Safari/Firefox fall back to the **Download all data files** button.

### 3. Set up your brands (Hub Links tab)

Two cards at the top:

**Brand Hub identity** — your umbrella brand. The big header on the home page. Name, tagline, logo, footer.

**Sub-brands** — one row per brand. Each needs:
- `Key` — internal id, no spaces, lowercase (e.g. `quadro-decor`). This is how links reference the brand and how deep-links are formed (`#quadro-decor`).
- `Name` — the display name (e.g. `Quadro Decor`).
- `Tagline` — small text under the brand name.
- `Accent` — color used on this brand's button and accent line. Pick one of: `charcoal`, `terracotta`, `olive`, `ocean`, `plum`, `mustard`, `forest`, `rose`. Leave blank for the default brass color.
- `Logo` — path to a square logo image (optional — falls back to first letter of the name in a circle).

Drag rows to set the order brands appear on the home page.

### 4. Add your links

In the **Links** table below, each row is one link. Fields:
- `Brand` — the brand key this link belongs to (must match a Key from the Sub-brands table above).
- `Category` — most important field. Use `materials` for catalogs/lookbooks/videos that should appear on the home page Materials section. Use `shop`, `social`, `contact`, `other` (or anything else) for links that should appear on the brand's drill-down page. Future filter pills will use this field too.
- `Label`, `Subtitle`, `URL`, `Icon`, `Highlight` — same as before.

### 5. Preview locally

- Showcase: `showcase-site/start-server.command` (Mac) or `.bat` (Windows). Opens `http://localhost:8000`. Add `?prices=on` to see prices.
- Brand Hub: `brand-hub/start-server.command` or `.bat`. Opens `http://localhost:8001`. Try `http://localhost:8001/#quadro-decor` to test deep-linking.

### 6. Deploy

Upload `showcase-site/` and `brand-hub/` to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages). **Never upload `showcase-admin/`** — it's an editor tool, not part of the public sites.

---

## Materials — practical workflow

### Where to put the file

| Option | Best for | What to do |
|---|---|---|
| **`brand-hub/materials/`** | PDFs under ~10 MB, images, small files | Drop the file in this folder. Deploys with the site. |
| **YouTube / Vimeo** | Any video | Upload there, use the watch URL. Don't store videos in your folder. |
| **Google Drive / Dropbox** | Large PDFs (>10 MB), files you update often | Upload, share, paste link |

### URL formats

| File location | URL to paste in the dashboard |
|---|---|
| Local file in `brand-hub/materials/` | `materials/spring-catalog.pdf` |
| YouTube video | `https://www.youtube.com/watch?v=VIDEO_ID` (as-is) |
| Google Drive (viewer) | `https://drive.google.com/file/d/FILE_ID/view` — opens Drive viewer |
| Google Drive (direct download) | `https://drive.google.com/uc?export=download&id=FILE_ID` |
| Dropbox direct | Paste share link, change `?dl=0` to `?dl=1` |

### Adding a material — step by step

You have `quadro-spring-2026.pdf` for Quadro Decor:

1. Drag the file into `brand-hub/materials/`.
2. Dashboard → **Hub Links** tab → click **+ Add link** in the Links table.
3. Fill the row:
   - Brand: `quadro-decor`
   - Category: `materials` ← *this is what puts it on the home page*
   - Label: `Spring Catalog 2026`
   - Subtitle: `PDF · 24 pages` (the brand name auto-prefixes, so you don't need to type "Quadro Decor ·" yourself)
   - URL: `materials/quadro-spring-2026.pdf`
   - Icon: `📘`
4. Go to **Build & Backup** → click **Save to hub folder**.
5. Refresh the hub preview — your new catalog is on the home page Materials section, showing as *"Quadro Decor · PDF · 24 pages"*.

---

## Showcase site pricing toggle

The showcase has two views of the same product catalog:

| Audience | URL |
|---|---|
| General public / retail / suppliers | `https://your-showcase.com/` |
| Wholesale clients | `https://your-showcase.com/?prices=on` |

When `?prices=on` is in the URL, prices appear and a small **Trade** pill shows in the header. Persists across the session.

To use a less guessable parameter, edit two constants near the top of the script in `showcase-site/index.html`:
```js
const PRICING_PARAM = 'prices';   // e.g. 'view'
const PRICING_VALUE = 'on';       // e.g. 'trade'
```

This is convenience, not security. Anyone with the wholesale URL could share it.

---

## Backups

**Full backup** (Build & Backup tab) exports everything — products, categories, umbrella brand, sub-brands, links — in one JSON file. Store on Dropbox/Drive/wherever. Restore from the same button.

> Export a backup before any major edit session, and again after. It's the only real backup; localStorage gets wiped if you clear browser data or switch computers.

The dashboard auto-migrates legacy v1 backups (with the old `materials` array) — products/categories preserved, materials dropped.

---

## When things go wrong

**"Couldn't load showcase data" error**
The page is being opened directly from the file system. Use `start-server.bat` / `.command` so the browser can fetch `data/*.json`.

**"Pick folder" button disabled**
Not supported in Safari/Firefox. Use Chrome/Edge/Brave/Opera, or use **Download all data files** instead.

**Brand Hub shows sample data instead of my edits**
You're previewing via `file://`. The page falls back to embedded sample data when `data/links.json` can't be fetched. Use the local server.

**A brand button on the home page doesn't open**
The brand `key` in the link's Brand column doesn't match any key in the Sub-brands table. Check spelling, hyphens, and case (keys are lowercase, no spaces).

**My material isn't showing on the home page**
Check the Category field — must be exactly `materials` (lowercase). Any other value puts the link on the brand page instead.

**My prices aren't showing on the showcase**
Use `?prices=on` in the URL. Bare URL = no prices by design.

---

## Renaming the hub later

Currently using *Harmony & Homes* as the umbrella placeholder. To change:
1. Dashboard → **Hub Links** tab → edit **Brand name** at top → Save to hub folder.
2. Refresh the hub — name and footer update everywhere.

For the page `<title>` and OG metadata (line 6 + 8 of `brand-hub/index.html`), edit directly or ping me with the final name.

---

## Deploying to GitHub Pages

This bundle now includes an Actions workflow at `.github/workflows/deploy-pages.yml`.

### What gets deployed
- `showcase-site/` -> published at `/showcase-site/`
- `brand-hub/` -> published at `/brand-hub/`
- A tiny landing page at `/` linking to both apps
- `showcase-admin/` is intentionally **not** deployed

### One-time GitHub setup
1. Push this repository to GitHub.
2. In GitHub, open **Settings -> Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Ensure your default branch is `main` (or `master`; both are supported by the workflow).

### Daily workflow (same editing flow, automated publish)
1. Edit data in `showcase-admin/admin-dashboard.html`.
2. Save/export JSON files to:
   - `showcase-site/data/products.json`
   - `showcase-site/data/categories.json`
   - `brand-hub/data/links.json`
3. Commit and push.
4. GitHub Actions validates JSON and deploys automatically.

### Notes
- First deployment URL format: `https://<your-username>.github.io/<repo-name>/`
- Deep links still work (example: `/brand-hub/#materials`).
- If deployment fails, check the **Actions** tab for JSON validation errors.
