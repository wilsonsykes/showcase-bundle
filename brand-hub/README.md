# Harmony &amp; Homes — Brand Hub

A Linktree-style page hosting your materials, social media links, and websites. Mobile-first, no passwords, fully editable.

## Folder structure

```
brand-hub/
├── index.html              ← the page itself (deploy this)
├── data/
│   └── links.json          ← all your links + brand info (edit via admin dashboard)
├── materials/              ← optional: PDFs, videos hosted locally
│   ├── catalog-spring-2026.pdf
│   ├── styling-lookbook.pdf
│   └── ...
├── images/                 ← optional: custom logo + icon images
│   └── logo.jpg
├── start-server.bat        ← Windows: double-click for local preview
└── start-server.command    ← Mac: double-click for local preview
```

## How to preview locally

**Easiest:** Double-click `index.html`. The page works at `file://` thanks to embedded fallback data. (Note: at `file://`, the page uses the example data baked into the HTML, not your edited `data/links.json`. Use the server method below to test your real data.)

**With your real data:** Double-click `start-server.bat` (Windows) or `start-server.command` (Mac). A browser tab opens at `http://localhost:8001` showing the live page reading from `data/links.json`.

## How to edit

Open the **admin dashboard** (`showcase-admin/admin-dashboard.html`) → **Hub Links** tab. Edit there, export, and replace `data/links.json` with the new file.

Each link has:
- `label` — main text (required)
- `subtitle` — small text below (optional)
- `url` — where it points (required). External URLs (`https://...`) open in a new tab; `mailto:` and relative paths open same-tab.
- `icon` — an emoji (📷), or a path to a PNG (`images/instagram.png`)
- `highlight` — `true` makes the button dark (use for your top 1-2 buttons)

Brand block has:
- `name` — appears as the page title and big header
- `tagline` — small text under the name
- `logo` — path to a square logo image, e.g. `images/logo.jpg` (optional — falls back to first letter of name in a circle)
- `footer` — small text at the bottom

## How to deploy

Upload the entire `brand-hub/` folder to your hosting (GitHub Pages, Netlify, Vercel, Cloudflare Pages — all free). Share the URL anywhere — Instagram bio, business cards, email signature.

## How to re-skin

All colors and typography live in CSS variables at the top of `index.html` (the `:root { ... }` block). Change those values to match new branding without touching markup.
