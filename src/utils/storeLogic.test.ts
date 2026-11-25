import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import {
  applyAdminAuthGuard,
  buildWhatsAppUrl,
  calculateOrderTotals,
  computeOrderStats,
  deriveBrandPalette,
  filterProducts,
  findOrdersByPhone,
  formatDisplayIntlPhone,
  formatPkr,
  formatTelHref,
  generateNextOrderId,
  getNextOrderStatuses,
  isValidImageUrlSyntax,
  isValidPkPhone,
  normalizePkPhone,
  normalizeProductImages,
  normalizeSiteSettings,
  resolveRouteFromLocation,
  routeToPath,
  validateSiteAssetFile,
  validateSiteSettings,
} from './storeLogic';
import { SEED_ORDERS, SEED_PRODUCTS } from '../data/seedData';
import { DEFAULT_SITE_SETTINGS } from '../services/siteSettingsService';

test('normalizePkPhone converts +92 and bare 3xx numbers to 03xx format', () => {
  assert.equal(normalizePkPhone('+92 300 1234567'), '03001234567');
  assert.equal(normalizePkPhone('0300-1234567'), '03001234567');
  assert.equal(normalizePkPhone('3219876543'), '03219876543');
  assert.equal(isValidPkPhone('0300-1234567'), true);
  assert.equal(isValidPkPhone('12345'), false);
});

test('calculateOrderTotals computes COD subtotal and nationwide courier fee', () => {
  const single = calculateOrderTotals(4500, 1);
  assert.equal(single.subtotal, 4500);
  assert.equal(single.shippingFee, 350);
  assert.equal(single.totalAmount, 4850);

  const multi = calculateOrderTotals(3800, 3);
  assert.equal(multi.subtotal, 11400);
  assert.equal(multi.totalAmount, 11750);
});

test('findOrdersByPhone locates matching customer orders regardless of formatting', () => {
  const found = findOrdersByPhone(SEED_ORDERS, '+92 300 1234567');
  assert.ok(found.length >= 1);
  assert.equal(found[0].id, '#AST-2025-0042');

  const byRef = findOrdersByPhone(SEED_ORDERS, '#AST-2025-0041');
  assert.equal(byRef.length, 1);
  assert.equal(byRef[0].customerName, 'Engr. Ahmed Khan');
});

test('filterProducts filters by category, voltage, budget, and search cleanly', () => {
  const chargers = filterProducts(SEED_PRODUCTS, { category: 'Battery Chargers' });
  assert.equal(chargers.length, 1);
  assert.equal(chargers[0].sku, 'AST-CHG-1220');

  const controllers24 = filterProducts(SEED_PRODUCTS, { voltage: '24V' });
  assert.ok(controllers24.every((p) => p.voltage.includes('24V')));

  const cheap = filterProducts(SEED_PRODUCTS, { maxBudget: 3000 });
  assert.ok(cheap.every((p) => p.price <= 3000));
});

test('getNextOrderStatuses and computeOrderStats respect workflow rules', () => {
  assert.deepEqual(getNextOrderStatuses('Pending'), ['Confirmed', 'Cancelled']);
  assert.deepEqual(getNextOrderStatuses('Shipped'), ['Delivered', 'Cancelled']);
  assert.deepEqual(getNextOrderStatuses('Delivered'), []);

  const stats = computeOrderStats(SEED_ORDERS);
  assert.equal(stats.totalOrders, SEED_ORDERS.length);
  assert.ok(stats.grossRevenue > 0);
});

test('formatPkr, buildWhatsAppUrl, and generateNextOrderId work accurately', () => {
  assert.equal(formatPkr(18000), 'PKR 18,000');
  const wa = buildWhatsAppUrl('Order Test', '0321-9998877');
  assert.ok(wa.startsWith('https://wa.me/923219998877?text='));
  assert.equal(formatTelHref('0321-9998877'), 'tel:+923219998877');
  assert.equal(formatDisplayIntlPhone('0321-9998877'), '+92 321 9998877');
  assert.equal(generateNextOrderId(SEED_ORDERS), '#AST-2025-0043');
});

test('validateSiteSettings and validateSiteAssetFile enforce formats, URLs, and 2MB image limit', () => {
  const cleanErrors = validateSiteSettings(DEFAULT_SITE_SETTINGS);
  assert.deepEqual(cleanErrors, {});

  const invalidErrors = validateSiteSettings({
    ...DEFAULT_SITE_SETTINGS,
    site_name: 'A',
    whatsapp_number: '123',
    phone: 'abc',
    email: 'invalid-email',
    primary_color: 'red',
    facebook_url: 'ftp://invalid.example',
  });
  assert.ok(invalidErrors.site_name);
  assert.ok(invalidErrors.whatsapp_number);
  assert.ok(invalidErrors.phone);
  assert.ok(invalidErrors.email);
  assert.ok(invalidErrors.primary_color);
  assert.ok(invalidErrors.facebook_url);

  assert.equal(validateSiteAssetFile({ name: 'logo.png', type: 'image/png', size: 102400 }), null);
  assert.equal(validateSiteAssetFile({ name: 'logo.svg', type: 'image/svg+xml', size: 10240 }, { allowSvg: true }), null);
  assert.ok(validateSiteAssetFile({ name: 'hero.svg', type: 'image/svg+xml', size: 10240 }, { allowSvg: false }));
  assert.ok(validateSiteAssetFile({ name: 'doc.pdf', type: 'application/pdf', size: 1024 }));
  assert.ok(validateSiteAssetFile({ name: 'huge.png', type: 'image/png', size: 3 * 1024 * 1024 }));

  assert.equal(isValidImageUrlSyntax('https://cdn.example.com/photo.webp', { allowSvg: false }), true);
  assert.equal(isValidImageUrlSyntax('https://cdn.example.com/logo.svg', { allowSvg: true }), true);
  assert.equal(isValidImageUrlSyntax('https://cdn.example.com/hero.svg', { allowSvg: false }), false);
  assert.equal(isValidImageUrlSyntax('not-a-url'), false);

  assert.deepEqual(normalizeProductImages(['https://a.com/1.jpg', '']), ['https://a.com/1.jpg']);
  assert.deepEqual(normalizeProductImages('["https://a.com/1.jpg"]'), ['https://a.com/1.jpg']);
  assert.deepEqual(normalizeProductImages([], 'https://a.com/fallback.png'), ['https://a.com/fallback.png']);
});

test('normalizeSiteSettings falls back cleanly to ASATEK defaults and deriveBrandPalette computes CSS tokens', () => {
  const normalized = normalizeSiteSettings(
    { site_name: 'ASATEK Solar', primary_color: 'not-a-hex' },
    DEFAULT_SITE_SETTINGS
  );
  assert.equal(normalized.site_name, 'ASATEK Solar');
  assert.equal(normalized.primary_color, '#9e0000');
  assert.equal(normalized.whatsapp_number, DEFAULT_SITE_SETTINGS.whatsapp_number);

  const nullNormalized = normalizeSiteSettings(null, DEFAULT_SITE_SETTINGS);
  assert.equal(nullNormalized.site_name, 'ASATEK');

  const palette = deriveBrandPalette('#1d4ed8');
  assert.equal(palette.primary, '#1d4ed8');
  assert.equal(palette.onPrimary, '#ffffff');
  assert.match(palette.primaryContainer, /^#[0-9a-f]{6}$/);
  assert.match(palette.primaryFixed, /^#[0-9a-f]{6}$/);
});

test('resolveRouteFromLocation and applyAdminAuthGuard protect all /admin/* routes', () => {
  assert.equal(resolveRouteFromLocation('/admin/login'), 'admin-login');
  assert.equal(resolveRouteFromLocation('/admin/settings'), 'admin-settings');
  assert.equal(resolveRouteFromLocation('/admin/orders'), 'admin-orders');
  assert.equal(resolveRouteFromLocation('/admin/unknown-subpage'), 'admin-dashboard');
  assert.equal(routeToPath('admin-login'), '/admin/login');
  assert.equal(routeToPath('admin-settings'), '/admin/settings');

  const unauthOrders = applyAdminAuthGuard('admin-orders', false);
  assert.equal(unauthOrders.route, 'admin-login');
  assert.equal(unauthOrders.postLoginRoute, 'admin-orders');

  const unauthSettings = applyAdminAuthGuard('admin-settings', false);
  assert.equal(unauthSettings.route, 'admin-login');
  assert.equal(unauthSettings.postLoginRoute, 'admin-settings');

  const authSettings = applyAdminAuthGuard('admin-settings', true);
  assert.equal(authSettings.route, 'admin-settings');
  assert.equal(authSettings.postLoginRoute, undefined);
});

test('Supabase client handles signInWithPassword session lifecycle and invalid password rejection', async () => {
  const mockClient = createClient('https://example.supabase.co', 'anon-test-key', {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: async (input, init) => {
        const url = String(input);
        if (url.includes('/auth/v1/token')) {
          const body = JSON.parse(String(init?.body || '{}')) as { email?: string; password?: string };
          if (body.email === 'admin@example.com' && body.password === 'CorrectPass!99') {
            return new Response(
              JSON.stringify({
                access_token: 'header.payload.sig',
                token_type: 'bearer',
                expires_in: 3600,
                refresh_token: 'refresh-tok',
                user: { id: 'uid-1', email: 'admin@example.com', aud: 'authenticated' },
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
          }
          return new Response(
            JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response(JSON.stringify({}), { status: 200 });
      },
    },
  });

  const badLogin = await mockClient.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'wrong',
  });
  assert.ok(badLogin.error);
  assert.equal(badLogin.data.session, null);

  const okLogin = await mockClient.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'CorrectPass!99',
  });
  assert.equal(okLogin.error, null);
  assert.equal(okLogin.data.session?.user.email, 'admin@example.com');

  const sessionRes = await mockClient.auth.getSession();
  assert.equal(sessionRes.data.session?.user.email, 'admin@example.com');

  await mockClient.auth.signOut();
  const afterLogout = await mockClient.auth.getSession();
  assert.equal(afterLogout.data.session, null);
});

