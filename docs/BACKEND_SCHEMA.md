# ASATEK Pakistan — Backend Schema & Storage Notes

This document defines the Supabase PostgreSQL schema, Storage bucket configuration, and Row-Level Security (RLS) policies used by the frontend Supabase services (`src/lib/supabaseClient.ts`, `src/services/storeDataService.ts`, and `src/services/siteSettingsService.ts`).

### Planned Tables Overview
- `products`
- `orders`
- `order_items`
- `reviews`
- `service_centers`
- `faqs`
- `site_settings`
- Storage bucket: `site-assets`

---

## 1. Environment Variables (Client-Safe `VITE_*` Only)

Configure in `.env` (never commit secrets or service-role keys):

```env
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
```

When these variables are empty or not set, the app falls back cleanly to built-in ASATEK defaults and local persistence so the storefront never crashes.

---

## 2. Table: `public.site_settings` (Single-Row Configuration)

Stores website branding, contact info, homepage hero content, footer copy, and social links in a single singleton row (`id = 'default'`).

```sql
CREATE TABLE IF NOT EXISTS public.site_settings (
  id              TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  site_name       TEXT NOT NULL,
  tagline         TEXT NOT NULL,
  logo_url        TEXT NOT NULL,
  favicon_url     TEXT NOT NULL,
  primary_color   TEXT NOT NULL DEFAULT '#9e0000',
  whatsapp_number TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT NOT NULL,
  address         TEXT NOT NULL,
  hero_title      TEXT NOT NULL,
  hero_subtitle   TEXT NOT NULL,
  hero_image_url  TEXT NOT NULL,
  footer_text     TEXT NOT NULL,
  facebook_url    TEXT NOT NULL DEFAULT '',
  instagram_url   TEXT NOT NULL DEFAULT '',
  youtube_url     TEXT NOT NULL DEFAULT '',
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Column Reference
| Column | Type | Purpose |
|---|---|---|
| `id` | `TEXT PK` | Singleton row key (`'default'`) enforced by `CHECK (id = 'default')` |
| `site_name` | `TEXT` | Header, footer, admin sidebar, login card & `<title>` brand name |
| `tagline` | `TEXT` | Subtitle / `<title>` descriptor |
| `logo_url` | `TEXT` | Public URL in `site-assets` bucket or asset path for brand logo |
| `favicon_url` | `TEXT` | Public URL in `site-assets` bucket or asset path for `<link rel="icon">` |
| `primary_color` | `TEXT` | 6-digit hex color applied dynamically via CSS variables (`--color-primary`) |
| `whatsapp_number` | `TEXT` | Used across all WhatsApp inquiry/order buttons & `wa.me` links |
| `phone` | `TEXT` | Public helpline / header & footer `tel:` number |
| `email` | `TEXT` | Public contact & support email |
| `address` | `TEXT` | HQ / Factory address shown in footer and Contact page |
| `hero_title` | `TEXT` | Homepage hero headline |
| `hero_subtitle` | `TEXT` | Homepage hero supporting description |
| `hero_image_url` | `TEXT` | Homepage hero banner showcase image |
| `footer_text` | `TEXT` | Storefront footer brand summary / copyright description |
| `facebook_url` | `TEXT` | Official Facebook page URL (optional) |
| `instagram_url` | `TEXT` | Official Instagram profile URL (optional) |
| `youtube_url` | `TEXT` | Official YouTube channel URL (optional) |
| `updated_at` | `TIMESTAMPTZ` | Last update ISO timestamp |

---

## 3. Storage Bucket: `site-assets`

Uploaded branding, hero, product, and review media (`logo`, `favicon`, `hero`, `products`, `reviews`) are stored in the **`site-assets`** bucket.

- **Allowed MIME Types**: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml` (SVG enforced for logo & favicon only in the admin UI)
- **Max File Size**: `2 MB` (`2097152` bytes)
- **Public Read**: Enabled (so storefront header/footer/hero/product/review assets load fast without signed URLs)

See [`docs/SUPABASE_SETUP.sql`](./SUPABASE_SETUP.sql) for the complete idempotent SQL script covering `storage.buckets`, `storage.objects`, `site_settings`, `products`, and `reviews`.

```sql
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
```

---

## 4. Security Rules (RLS Policies)

- **Public visitors**: `SELECT` only on `site_settings`, `products`, `reviews`, and public read on `site-assets`.
- **Authenticated Admin**: `INSERT` / `UPDATE` / `DELETE` on `site_settings`, `products`, `reviews`, and `storage.objects` in bucket `site-assets` (`TO authenticated` with `auth.uid() IS NOT NULL`).

```sql
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read-only access
CREATE POLICY "Public can read site_settings"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin-only insert & update
CREATE POLICY "Admins can insert site_settings"
  ON public.site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update site_settings"
  ON public.site_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Storage bucket "site-assets": public read, authenticated admin upload/update/delete
CREATE POLICY "Public can read site-assets"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload to site-assets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update site-assets"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-assets' AND auth.uid() IS NOT NULL)
  WITH CHECK (bucket_id = 'site-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete site-assets"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-assets' AND auth.uid() IS NOT NULL);
```

