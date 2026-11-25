-- ASATEK Pakistan — Non-Destructive Supabase Schema, Storage Bucket & RLS Setup
-- Safe to run in Supabase SQL Editor on existing projects (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- No service-role key is used or stored in frontend code.

-- 1. Storage Bucket: site-assets (Public Read, 2 MB Max, JPG/PNG/WEBP/SVG)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  TRUE,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies for bucket "site-assets"
DROP POLICY IF EXISTS "Public can read site-assets" ON storage.objects;
CREATE POLICY "Public can read site-assets"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Admins can upload to site-assets" ON storage.objects;
CREATE POLICY "Admins can upload to site-assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-assets' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can update site-assets" ON storage.objects;
CREATE POLICY "Admins can update site-assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-assets' AND auth.uid() IS NOT NULL)
  WITH CHECK (bucket_id = 'site-assets' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can delete site-assets" ON storage.objects;
CREATE POLICY "Admins can delete site-assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-assets' AND auth.uid() IS NOT NULL);

-- 2. Table: public.site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id              TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  site_name       TEXT NOT NULL DEFAULT 'ASATEK',
  tagline         TEXT NOT NULL DEFAULT 'Power Electronics, Solar Controllers & Inverters',
  logo_url        TEXT NOT NULL DEFAULT '',
  favicon_url     TEXT NOT NULL DEFAULT '',
  primary_color   TEXT NOT NULL DEFAULT '#9e0000',
  whatsapp_number TEXT NOT NULL DEFAULT '0300-1234567',
  phone           TEXT NOT NULL DEFAULT '0300-1234567',
  email           TEXT NOT NULL DEFAULT 'support@asatek.pk',
  address         TEXT NOT NULL DEFAULT 'Sundar Industrial Estate, Lahore, Pakistan',
  hero_title      TEXT NOT NULL DEFAULT 'Pakistan''s Trusted Power Electronics Brand',
  hero_subtitle   TEXT NOT NULL DEFAULT '',
  hero_image_url  TEXT NOT NULL DEFAULT '',
  footer_text     TEXT NOT NULL DEFAULT '',
  facebook_url    TEXT NOT NULL DEFAULT '',
  instagram_url   TEXT NOT NULL DEFAULT '',
  youtube_url     TEXT NOT NULL DEFAULT '',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT NOT NULL DEFAULT '';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS favicon_url TEXT NOT NULL DEFAULT '';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS hero_image_url TEXT NOT NULL DEFAULT '';

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site_settings" ON public.site_settings;
CREATE POLICY "Public can read site_settings"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert site_settings" ON public.site_settings;
CREATE POLICY "Admins can insert site_settings"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can update site_settings" ON public.site_settings;
CREATE POLICY "Admins can update site_settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Table: public.products (uses "images" JSONB array as expected by storeDataService.ts)
CREATE TABLE IF NOT EXISTS public.products (
  id                    TEXT PRIMARY KEY,
  sku                   TEXT NOT NULL,
  name                  TEXT NOT NULL,
  urdu_name             TEXT NOT NULL DEFAULT '',
  subtitle              TEXT NOT NULL DEFAULT '',
  category              TEXT NOT NULL DEFAULT 'Solar Charge Controllers',
  voltage               TEXT NOT NULL DEFAULT '12V',
  amperage_or_watts     TEXT NOT NULL DEFAULT '',
  control_tech          TEXT NOT NULL DEFAULT 'PWM',
  price                 NUMERIC NOT NULL DEFAULT 0,
  msrp                  NUMERIC NOT NULL DEFAULT 0,
  wholesale_price       NUMERIC NOT NULL DEFAULT 0,
  badge                 TEXT,
  in_stock              BOOLEAN NOT NULL DEFAULT TRUE,
  stock_count           INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold   INTEGER NOT NULL DEFAULT 5,
  warehouse_location    TEXT NOT NULL DEFAULT 'Lahore Main Hub',
  weight_kg             NUMERIC NOT NULL DEFAULT 1,
  dimensions_mm         TEXT NOT NULL DEFAULT '',
  warranty_months       INTEGER NOT NULL DEFAULT 12,
  cod_eligible          BOOLEAN NOT NULL DEFAULT TRUE,
  urdu_manual_included  BOOLEAN NOT NULL DEFAULT TRUE,
  is_public_visible     BOOLEAN NOT NULL DEFAULT TRUE,
  images                JSONB NOT NULL DEFAULT '[]'::jsonb,
  youtube_url           TEXT,
  description           TEXT NOT NULL DEFAULT '',
  urdu_description      TEXT NOT NULL DEFAULT '',
  features              JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs                 JSONB NOT NULL DEFAULT '[]'::jsonb,
  wiring_steps          JSONB NOT NULL DEFAULT '[]'::jsonb,
  quick_stats           JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read products" ON public.products;
CREATE POLICY "Public can read products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can write products" ON public.products;
CREATE POLICY "Admins can write products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Table: public.reviews (uses "image" TEXT column as expected by storeDataService.ts)
CREATE TABLE IF NOT EXISTS public.reviews (
  id             TEXT PRIMARY KEY,
  customer_name  TEXT NOT NULL,
  city           TEXT NOT NULL DEFAULT '',
  product_id     TEXT NOT NULL DEFAULT '',
  product_name   TEXT NOT NULL DEFAULT '',
  rating         INTEGER NOT NULL DEFAULT 5,
  comment        TEXT NOT NULL DEFAULT '',
  urdu_comment   TEXT,
  setup_metric   TEXT NOT NULL DEFAULT '',
  image          TEXT,
  verified_buyer BOOLEAN NOT NULL DEFAULT TRUE,
  status         TEXT NOT NULL DEFAULT 'Published',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS image TEXT;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read reviews" ON public.reviews;
CREATE POLICY "Public can read reviews"
  ON public.reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can write reviews" ON public.reviews;
CREATE POLICY "Admins can write reviews"
  ON public.reviews
  FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
