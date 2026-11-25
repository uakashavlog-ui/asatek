import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

export const VITE_SUPABASE_URL = (env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
export const VITE_SUPABASE_ANON_KEY = (env.VITE_SUPABASE_ANON_KEY || '').trim();

export const SUPABASE_TABLES = {
  products: 'products',
  orders: 'orders',
  orderItems: 'order_items',
  reviews: 'reviews',
  serviceCenters: 'service_centers',
  faqs: 'faqs',
  siteSettings: 'site_settings',
} as const;

export const SITE_ASSETS_BUCKET = 'site-assets';

export function isSupabaseConfigured(): boolean {
  return VITE_SUPABASE_URL.length > 0 && VITE_SUPABASE_ANON_KEY.length > 0;
}

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
