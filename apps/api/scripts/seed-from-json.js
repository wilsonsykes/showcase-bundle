const fs = require('fs');
const path = require('path');
const { withTransaction, pool } = require('../src/db');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseFeaturedValue(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['yes', 'true', '1'].includes(value.trim().toLowerCase());
  return false;
}

async function main() {
  const root = path.resolve(__dirname, '..', '..', '..');
  const categories = readJson(path.join(root, 'showcase-site', 'data', 'categories.json'));
  const products = readJson(path.join(root, 'showcase-site', 'data', 'products.json'));
  const hub = readJson(path.join(root, 'brand-hub', 'data', 'links.json'));

  await withTransaction(async (client) => {
    for (let i = 0; i < categories.length; i += 1) {
      const category = categories[i];
      await client.query(
        `INSERT INTO categories (key, label, img, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key) DO UPDATE
         SET label = EXCLUDED.label, img = EXCLUDED.img, sort_order = EXCLUDED.sort_order`,
        [category.key, category.label || category.key, category.img || '', i]
      );
    }

    for (const product of products) {
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

    if (hub.brand && hub.brand.name) {
      await client.query(
        `INSERT INTO hub_brand_identity (id, name, tagline, logo, footer)
         VALUES (1, $1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name,
             tagline = EXCLUDED.tagline,
             logo = EXCLUDED.logo,
             footer = EXCLUDED.footer`,
        [hub.brand.name, hub.brand.tagline || '', hub.brand.logo || '', hub.brand.footer || '']
      );
    }

    const brands = Array.isArray(hub.brands) ? hub.brands : [];
    const links = Array.isArray(hub.links) ? hub.links : [];

    for (let i = 0; i < brands.length; i += 1) {
      const brand = brands[i];
      await client.query(
        `INSERT INTO hub_sub_brands (key, name, tagline, accent, logo, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (key) DO UPDATE
         SET name = EXCLUDED.name,
             tagline = EXCLUDED.tagline,
             accent = EXCLUDED.accent,
             logo = EXCLUDED.logo,
             sort_order = EXCLUDED.sort_order`,
        [brand.key, brand.name || brand.key, brand.tagline || '', brand.accent || '', brand.logo || '', i]
      );
    }

    for (let i = 0; i < links.length; i += 1) {
      const link = links[i];
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
          link.label || '',
          link.subtitle || '',
          link.url || '',
          link.icon || '',
          Boolean(link.highlight),
          i
        ]
      );
    }
  });

  console.log(`Seed complete.
Categories: ${categories.length}
Products: ${products.length}
Sub-brands: ${(hub.brands || []).length}
Hub links: ${(hub.links || []).length}`);
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error('Seed failed:', err.message);
    pool.end().finally(() => process.exit(1));
  });

