const { z } = require('zod');

const categorySchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  img: z.string().default('')
});

const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  cat: z.string().min(1),
  size: z.string().default(''),
  material: z.string().default(''),
  price: z.string().default(''),
  img: z.string().default(''),
  featured: z.union([z.boolean(), z.string()]).optional()
});

const hubBrandIdentitySchema = z.object({
  name: z.string().min(1),
  tagline: z.string().default(''),
  logo: z.string().default(''),
  footer: z.string().default('')
});

const hubSubBrandSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().default(''),
  accent: z.string().default(''),
  logo: z.string().default('')
});

const hubLinkSchema = z.object({
  id: z.string().min(1),
  brand: z.string().optional().default(''),
  category: z.string().default(''),
  label: z.string().min(1),
  subtitle: z.string().default(''),
  url: z.string().min(1),
  icon: z.string().default(''),
  highlight: z.boolean().optional().default(false)
});

const upsertCatalogSchema = z.object({
  categories: z.array(categorySchema).default([]),
  products: z.array(productSchema).default([])
});

const upsertHubSchema = z.object({
  brand: hubBrandIdentitySchema,
  brands: z.array(hubSubBrandSchema).default([]),
  links: z.array(hubLinkSchema).default([])
});

module.exports = {
  upsertCatalogSchema,
  upsertHubSchema
};

