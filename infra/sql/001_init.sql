BEGIN;

CREATE TABLE IF NOT EXISTS categories (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  img TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  sku TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_key TEXT NOT NULL REFERENCES categories(key) ON UPDATE CASCADE,
  size TEXT NOT NULL DEFAULT '',
  material TEXT NOT NULL DEFAULT '',
  price_text TEXT NOT NULL DEFAULT '',
  img TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hub_brand_identity (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  footer TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hub_sub_brands (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  accent TEXT NOT NULL DEFAULT '',
  logo TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hub_links (
  id TEXT PRIMARY KEY,
  brand_key TEXT NULL REFERENCES hub_sub_brands(key) ON UPDATE CASCADE ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  highlight BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_assets (
  id BIGSERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  relative_path TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  byte_size BIGINT NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category_key ON products(category_key);
CREATE INDEX IF NOT EXISTS idx_hub_links_brand_key ON hub_links(brand_key);
CREATE INDEX IF NOT EXISTS idx_hub_links_category ON hub_links(category);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_hub_brand_identity_updated_at ON hub_brand_identity;
CREATE TRIGGER trg_hub_brand_identity_updated_at
BEFORE UPDATE ON hub_brand_identity
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_hub_sub_brands_updated_at ON hub_sub_brands;
CREATE TRIGGER trg_hub_sub_brands_updated_at
BEFORE UPDATE ON hub_sub_brands
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_hub_links_updated_at ON hub_links;
CREATE TRIGGER trg_hub_links_updated_at
BEFORE UPDATE ON hub_links
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;

