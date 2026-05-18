const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { pool, withTransaction } = require('./db');
const { config } = require('./config');
const { upsertCatalogSchema, upsertHubSchema } = require('./validators');

const app = express();
const allowlist = Array.isArray(config.corsOrigins) ? config.corsOrigins.filter(Boolean) : [];
app.use(
  cors({
    origin(origin, cb) {
      // Allow non-browser / same-origin requests with no Origin header.
      if (!origin) return cb(null, true);
      // If no allowlist configured, keep permissive behavior for local development.
      if (!allowlist.length) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);
app.use(express.json({ limit: '10mb' }));

const mediaDir = path.resolve(config.mediaStorageDir);
const projectRoot = path.resolve(__dirname, '..', '..', '..');
fs.mkdirSync(mediaDir, { recursive: true });
app.use(config.mediaBaseUrl, express.static(mediaDir));

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, mediaDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '');
      const safeBase = path.basename(file.originalname || 'asset', ext).replace(/[^a-zA-Z0-9-_]/g, '-');
      cb(null, `${Date.now()}-${safeBase}${ext}`);
    }
  }),
  limits: { fileSize: 20 * 1024 * 1024 }
});

function parseFeaturedValue(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['yes', 'true', '1'].includes(value.trim().toLowerCase());
  return false;
}

function adminAuth(req, res, next) {
  if (!config.adminApiKey) return next();
  const headerKey = req.header('x-admin-key') || '';
  if (headerKey !== config.adminApiKey) {
    return res.status(401).json({ error: 'Unauthorized. Provide x-admin-key.' });
  }
  return next();
}

async function getCatalogPayload() {
  const categoriesResult = await pool.query(
    'SELECT key, label, img FROM categories ORDER BY sort_order ASC, key ASC'
  );
  const productsResult = await pool.query(
    `SELECT sku, name, category_key AS cat, size, material, price_text AS price, img, featured
     FROM products
     ORDER BY sku ASC`
  );
  const products = productsResult.rows.map((p) => ({
    ...p,
    ...(p.featured ? { featured: 'Yes' } : {})
  }));
  return { categories: categoriesResult.rows, products };
}

async function getHubPayload() {
  const brandResult = await pool.query(
    'SELECT name, tagline, logo, footer FROM hub_brand_identity WHERE id = 1'
  );
  const brandsResult = await pool.query(
    'SELECT key, name, tagline, accent, logo FROM hub_sub_brands ORDER BY sort_order ASC, key ASC'
  );
  const linksResult = await pool.query(
    `SELECT id, COALESCE(brand_key, '') AS brand, category, label, subtitle, url, icon, highlight
     FROM hub_links
     ORDER BY sort_order ASC, id ASC`
  );
  return {
    brand: brandResult.rows[0] || { name: '', tagline: '', logo: '', footer: '' },
    brands: brandsResult.rows,
    links: linksResult.rows
  };
}

app.get('/health', async (_req, res) => {
  const result = await pool.query('SELECT NOW() AS now');
  res.json({ ok: true, now: result.rows[0].now, env: config.backendEnvironment });
});

app.get('/', (_req, res) => {
  res.status(200).type('text/plain').send(
    [
      'Showcase API is running.',
      'Use /health for status, /catalog and /hub-links for read models.',
      'Open /admin to use the local admin dashboard.'
    ].join('\n')
  );
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(projectRoot, 'showcase-admin', 'admin-dashboard.html'));
});

app.get('/backend-config/public', (_req, res) => {
  const showcaseSite = config.sites.showcaseSite || {};
  const brandHub = config.sites.brandHub || {};
  const adminSite = config.sites.adminSite || {};
  res.json({
    environment: config.backendEnvironment,
    api: {
      baseUrl: showcaseSite.apiBaseUrl || brandHub.apiBaseUrl || adminSite.apiBaseUrl || '',
      mediaBaseUrl: config.mediaBaseUrl
    },
    sites: {
      showcaseSite: {
        publicUrl: showcaseSite.publicUrl || '',
        mode: showcaseSite.mode || 'snapshot-json'
      },
      brandHub: {
        publicUrl: brandHub.publicUrl || '',
        mode: brandHub.mode || 'snapshot-json'
      },
      adminSite: {
        publicUrl: adminSite.publicUrl || '',
        mode: adminSite.mode || 'api-sync'
      }
    }
  });
});

app.get('/catalog', async (_req, res) => {
  const payload = await getCatalogPayload();
  res.json(payload);
});

app.get('/hub-links', async (_req, res) => {
  const payload = await getHubPayload();
  res.json(payload);
});

app.post('/products/upsert', adminAuth, async (req, res) => {
  const validated = upsertCatalogSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({ error: 'Validation failed', details: validated.error.issues });
  }
  const parsed = validated.data;
  await withTransaction(async (client) => {
    for (let i = 0; i < parsed.categories.length; i += 1) {
      const category = parsed.categories[i];
      await client.query(
        `INSERT INTO categories (key, label, img, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) DO UPDATE
         SET label = EXCLUDED.label, img = EXCLUDED.img, sort_order = EXCLUDED.sort_order`,
        [category.key, category.label, category.img || '', i]
      );
    }

    for (const product of parsed.products) {
      await client.query(
        `INSERT INTO categories (key, label, img)
         VALUES ($1, $1, '')
         ON CONFLICT (key) DO NOTHING`,
        [product.cat]
      );
      await client.query(
        `INSERT INTO products (sku, name, category_key, size, material, price_text, img, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (sku) DO UPDATE
         SET name = EXCLUDED.name,
             category_key = EXCLUDED.category_key,
             size = EXCLUDED.size,
             material = EXCLUDED.material,
             price_text = EXCLUDED.price_text,
             img = EXCLUDED.img,
             featured = EXCLUDED.featured`,
        [
          product.sku,
          product.name,
          product.cat,
          product.size || '',
          product.material || '',
          product.price || '',
          product.img || '',
          parseFeaturedValue(product.featured)
        ]
      );
    }
  });
  res.json({
    ok: true,
    upserted: { categories: parsed.categories.length, products: parsed.products.length }
  });
});

app.post('/links/upsert', adminAuth, async (req, res) => {
  const validated = upsertHubSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({ error: 'Validation failed', details: validated.error.issues });
  }
  const parsed = validated.data;
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO hub_brand_identity (id, name, tagline, logo, footer)
       VALUES (1, $1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
       SET name = EXCLUDED.name,
           tagline = EXCLUDED.tagline,
           logo = EXCLUDED.logo,
           footer = EXCLUDED.footer`,
      [parsed.brand.name, parsed.brand.tagline || '', parsed.brand.logo || '', parsed.brand.footer || '']
    );

    for (let i = 0; i < parsed.brands.length; i += 1) {
      const brand = parsed.brands[i];
      await client.query(
        `INSERT INTO hub_sub_brands (key, name, tagline, accent, logo, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (key) DO UPDATE
         SET name = EXCLUDED.name,
             tagline = EXCLUDED.tagline,
             accent = EXCLUDED.accent,
             logo = EXCLUDED.logo,
             sort_order = EXCLUDED.sort_order`,
        [brand.key, brand.name, brand.tagline || '', brand.accent || '', brand.logo || '', i]
      );
    }

    for (let i = 0; i < parsed.links.length; i += 1) {
      const link = parsed.links[i];
      const brandKey = link.brand && link.brand.trim() ? link.brand.trim() : null;
      await client.query(
        `INSERT INTO hub_links (id, brand_key, category, label, subtitle, url, icon, highlight, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO UPDATE
         SET brand_key = EXCLUDED.brand_key,
             category = EXCLUDED.category,
             label = EXCLUDED.label,
             subtitle = EXCLUDED.subtitle,
             url = EXCLUDED.url,
             icon = EXCLUDED.icon,
             highlight = EXCLUDED.highlight,
             sort_order = EXCLUDED.sort_order`,
        [
          link.id,
          brandKey,
          link.category || '',
          link.label,
          link.subtitle || '',
          link.url,
          link.icon || '',
          Boolean(link.highlight),
          i
        ]
      );
    }
  });

  res.json({
    ok: true,
    upserted: { brands: parsed.brands.length, links: parsed.links.length }
  });
});

app.post('/media/upload', adminAuth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded. Field name must be "file".' });

  const relativePath = `${config.mediaBaseUrl.replace(/\/$/, '')}/${req.file.filename}`;
  await pool.query(
    `INSERT INTO media_assets (filename, relative_path, mime_type, byte_size)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (relative_path) DO UPDATE
     SET filename = EXCLUDED.filename,
         mime_type = EXCLUDED.mime_type,
         byte_size = EXCLUDED.byte_size`,
    [req.file.filename, relativePath, req.file.mimetype || 'application/octet-stream', req.file.size || 0]
  );

  res.json({
    ok: true,
    file: {
      filename: req.file.filename,
      url: relativePath,
      mimeType: req.file.mimetype,
      bytes: req.file.size
    }
  });
});

app.post('/admin/export-snapshots', adminAuth, async (_req, res) => {
  const catalog = await getCatalogPayload();
  const hub = await getHubPayload();

  const showcaseDataDir = path.join(projectRoot, 'showcase-site', 'data');
  const hubDataDir = path.join(projectRoot, 'brand-hub', 'data');
  fs.mkdirSync(showcaseDataDir, { recursive: true });
  fs.mkdirSync(hubDataDir, { recursive: true });

  const productsPath = path.join(showcaseDataDir, 'products.json');
  const categoriesPath = path.join(showcaseDataDir, 'categories.json');
  const linksPath = path.join(hubDataDir, 'links.json');

  fs.writeFileSync(productsPath, JSON.stringify(catalog.products, null, 2));
  fs.writeFileSync(categoriesPath, JSON.stringify(catalog.categories, null, 2));
  fs.writeFileSync(linksPath, JSON.stringify(hub, null, 2));

  res.json({
    ok: true,
    files: ['showcase-site/data/products.json', 'showcase-site/data/categories.json', 'brand-hub/data/links.json'],
    counts: {
      products: catalog.products.length,
      categories: catalog.categories.length,
      brands: hub.brands.length,
      links: hub.links.length
    }
  });
});

app.use((err, _req, res, _next) => {
  if (err && err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation failed', details: err.issues });
  }
  const message = err && err.message ? err.message : 'Internal server error';
  return res.status(500).json({ error: message });
});

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
