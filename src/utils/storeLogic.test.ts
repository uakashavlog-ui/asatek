import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import {
  applyAdminAuthGuard,
  buildAdminOrderWhatsAppMessage,
  buildCustomerWhatsAppOrderMessage,
  buildWhatsAppUrl,
  calculateOrderTotals,
  computeOrderStats,
  computeResizedDimensions,
  countUnreadOrders,
  deriveBrandPalette,
  filterProducts,
  findOrdersByPhone,
  formatDisplayIntlPhone,
  formatPkr,
  formatTelHref,
  generateNextOrderId,
  getNextOrderStatuses,
  getOrderStatusBadgeClass,
  isValidImageUrlSyntax,
  isValidPkPhone,
  normalizePkPhone,
  normalizeProductImages,
  normalizeSiteSettings,
  resolveRouteFromLocation,
  routeToPath,
  selectOptimalOutputMime,
  sortOrdersNewestFirst,
  validateOptimizedAssetSize,
  validateSiteAssetFile,
  validateSiteSettings,
} from './storeLogic';
import type { Order } from '../types/asatek';
import { SEED_PRODUCTS } from '../data/seedData';
import { DEFAULT_SITE_SETTINGS } from '../services/siteSettingsService';

const SAMPLE_ORDERS: Order[] = [
  {
    id: '#AST-2026-1001',
    customerName: 'Bilal Tariq',
    phone: '0300-1234567',
    whatsapp: '0300-1234567',
    address: 'House 14, Block B, Johar Town',
    city: 'Lahore',
    province: 'Punjab',
    country: 'Pakistan',
    zipCode: '54782',
    location: 'Near Emporium Mall',
    productId: 'prod-1',
    productName: 'ASATEK 30A MPPT Solar Charge Controller',
    productSku: 'AST-MPPT-30A',
    quantity: 1,
    unitPrice: 4800,
    shippingFee: 350,
    totalAmount: 5150,
    paymentMethod: 'COD',
    status: 'Pending',
    courierName: 'TCS Express',
    trackingNumber: 'Pending Dispatch',
    createdAt: '25 Nov 2026, 09:30 AM',
    createdAtIso: '2026-11-25T04:30:00.000Z',
    updatedAt: '25 Nov 2026, 09:30 AM',
    history: [],
  },
  {
    id: '#AST-2026-1002',
    customerName: 'Engr. Ahmed Khan',
    phone: '0321-5544332',
    whatsapp: '0321-5544332',
    address: 'Plot 22, I-10 Markaz',
    city: 'Islamabad',
    province: 'Islamabad Capital Territory',
    country: 'Pakistan',
    zipCode: '44000',
    location: 'Main Service Road',
    productId: 'prod-2',
    productName: 'ASATEK 12V 20A Smart Battery Charger',
    productSku: 'AST-CHG-1220',
    quantity: 2,
    unitPrice: 3900,
    shippingFee: 350,
    totalAmount: 8150,
    paymentMethod: 'COD',
    status: 'Shipped',
    courierName: 'Leopards Courier',
    trackingNumber: 'LEOP-88991',
    createdAt: '24 Nov 2026, 02:00 PM',
    createdAtIso: '2026-11-24T09:00:00.000Z',
    updatedAt: '24 Nov 2026, 03:15 PM',
    history: [],
  },
  {
    id: '#AST-2026-1003',
    customerName: 'Sadia Usman',
    phone: '0333-8877665',
    whatsapp: '0333-8877665',
    address: 'Street 5, Gulshan-e-Iqbal',
    city: 'Karachi',
    province: 'Sindh',
    country: 'Pakistan',
    zipCode: '75300',
    location: 'Near Disco Bakery',
    productId: 'prod-1',
    productName: 'ASATEK 30A MPPT Solar Charge Controller',
    productSku: 'AST-MPPT-30A',
    quantity: 1,
    unitPrice: 4800,
    shippingFee: 350,
    totalAmount: 5150,
    paymentMethod: 'COD',
    status: 'On Hold',
    courierName: 'TCS Express',
    trackingNumber: 'Pending Dispatch',
    createdAt: '23 Nov 2026, 11:00 AM',
    createdAtIso: '2026-11-23T06:00:00.000Z',
    updatedAt: '23 Nov 2026, 11:20 AM',
    history: [],
  },
];

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
  const found = findOrdersByPhone(SAMPLE_ORDERS, '+92 300 1234567');
  assert.ok(found.length >= 1);
  assert.equal(found[0].id, '#AST-2026-1001');

  const byRef = findOrdersByPhone(SAMPLE_ORDERS, '#AST-2026-1002');
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

test('getNextOrderStatuses, badge classes, sorting, unread count, and computeOrderStats respect workflow rules', () => {
  assert.deepEqual(getNextOrderStatuses('Pending'), ['Confirmed', 'On Hold', 'Cancelled']);
  assert.deepEqual(getNextOrderStatuses('Confirmed'), ['Shipped', 'On Hold', 'Cancelled']);
  assert.deepEqual(getNextOrderStatuses('On Hold'), ['Confirmed', 'Shipped', 'Cancelled']);
  assert.deepEqual(getNextOrderStatuses('Shipped'), ['Cancelled']);
  assert.deepEqual(getNextOrderStatuses('Cancelled'), ['Pending']);

  assert.ok(getOrderStatusBadgeClass('Pending').length > 0);
  assert.ok(getOrderStatusBadgeClass('On Hold').includes('amber'));
  assert.ok(getOrderStatusBadgeClass('Cancelled').includes('error'));

  const stats = computeOrderStats(SAMPLE_ORDERS);
  assert.equal(stats.totalOrders, SAMPLE_ORDERS.length);
  assert.equal(stats.pendingOrders, 1);
  assert.equal(stats.onHoldOrders, 1);
  assert.equal(stats.confirmedOrShipped, 1);
  assert.equal(stats.grossRevenue, 18450);

  const sorted = sortOrdersNewestFirst([SAMPLE_ORDERS[2], SAMPLE_ORDERS[0], SAMPLE_ORDERS[1]]);
  assert.deepEqual(
    sorted.map((o) => o.id),
    ['#AST-2026-1001', '#AST-2026-1002', '#AST-2026-1003']
  );

  assert.equal(countUnreadOrders(SAMPLE_ORDERS, []), 1);
  assert.equal(countUnreadOrders(SAMPLE_ORDERS, ['#AST-2026-1001']), 0);
});

test('formatPkr, WhatsApp message builders, and generateNextOrderId work accurately', () => {
  assert.equal(formatPkr(18000), 'PKR 18,000');
  const wa = buildWhatsAppUrl('Order Test', '0321-9998877');
  assert.ok(wa.startsWith('https://wa.me/923219998877?text='));
  assert.equal(formatTelHref('0321-9998877'), 'tel:+923219998877');
  assert.equal(formatDisplayIntlPhone('0321-9998877'), '+92 321 9998877');

  const generatedEmpty = generateNextOrderId([]);
  assert.match(generatedEmpty, /^#AST-\d{4}-\d{6}$/);
  const generatedUnique = generateNextOrderId(SAMPLE_ORDERS);
  assert.match(generatedUnique, /^#AST-\d{4}-\d{6}$/);
  assert.ok(!SAMPLE_ORDERS.some((o) => o.id === generatedUnique));

  const custPreOrderMsg = buildCustomerWhatsAppOrderMessage({
    siteName: 'ASATEK',
    productName: 'ASATEK 30A MPPT',
    productSku: 'AST-MPPT-30A',
    quantity: 2,
    unitPrice: 4800,
    customerName: 'Bilal',
    city: 'Lahore',
    country: 'Pakistan',
    zipCode: '54782',
    location: 'Near Emporium',
  });
  assert.ok(custPreOrderMsg.includes('I would like to order:'));
  assert.ok(custPreOrderMsg.includes('AST-MPPT-30A'));
  assert.ok(custPreOrderMsg.includes('ZIP 54782'));
  assert.ok(custPreOrderMsg.includes('Near Emporium'));

  const custSavedOrderMsg = buildCustomerWhatsAppOrderMessage({
    siteName: 'ASATEK',
    productName: 'ASATEK 30A MPPT',
    quantity: 1,
    unitPrice: 4800,
    totalAmount: 5150,
    orderId: '#AST-2026-1001',
  });
  assert.ok(custSavedOrderMsg.includes('I have placed order #AST-2026-1001:'));

  assert.ok(buildAdminOrderWhatsAppMessage(SAMPLE_ORDERS[0], 'ASATEK').includes('received'));
  assert.ok(
    buildAdminOrderWhatsAppMessage({ ...SAMPLE_ORDERS[0], status: 'Confirmed' }, 'ASATEK').includes(
      'confirmed'
    )
  );
  assert.ok(buildAdminOrderWhatsAppMessage(SAMPLE_ORDERS[1], 'ASATEK').includes('LEOP-88991'));
  assert.ok(buildAdminOrderWhatsAppMessage(SAMPLE_ORDERS[2], 'ASATEK').includes('on hold'));
  assert.ok(
    buildAdminOrderWhatsAppMessage({ ...SAMPLE_ORDERS[0], status: 'Cancelled' }, 'ASATEK').includes(
      'cancelled'
    )
  );
});

test('validateSiteSettings and image upload/optimization helpers allow large photos and enforce 45MB limit', () => {
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

  // 2 MB limit removed: 5 MB and 10 MB images pass initial format validation
  assert.equal(validateSiteAssetFile({ name: 'logo.png', type: 'image/png', size: 102400 }), null);
  assert.equal(validateSiteAssetFile({ name: 'photo-5mb.jpg', type: 'image/jpeg', size: 5 * 1024 * 1024 }), null);
  assert.equal(validateSiteAssetFile({ name: 'photo-10mb.webp', type: 'image/webp', size: 10 * 1024 * 1024 }), null);
  assert.equal(validateSiteAssetFile({ name: 'logo.svg', type: 'image/svg+xml', size: 10240 }, { allowSvg: true }), null);
  assert.ok(validateSiteAssetFile({ name: 'hero.svg', type: 'image/svg+xml', size: 10240 }, { allowSvg: false }));
  assert.ok(validateSiteAssetFile({ name: 'doc.pdf', type: 'application/pdf', size: 1024 }));

  // Post-optimization 45 MB storage cap
  assert.equal(validateOptimizedAssetSize(10 * 1024 * 1024), null);
  assert.equal(validateOptimizedAssetSize(45 * 1024 * 1024), null);
  const over45 = validateOptimizedAssetSize(46 * 1024 * 1024);
  assert.ok(over45 && over45.includes('45 MB'));

  // Resize math (max width 1920px, no upscaling)
  assert.deepEqual(computeResizedDimensions(3840, 2160, 1920), { width: 1920, height: 1080, resized: true });
  assert.deepEqual(computeResizedDimensions(1200, 800, 1920), { width: 1200, height: 800, resized: false });

  // PNG transparency preservation
  assert.equal(selectOptimalOutputMime('image/png', { keepPngTransparency: true }), 'image/png');
  assert.equal(selectOptimalOutputMime('image/png', { keepPngTransparency: false }), 'image/jpeg');
  assert.equal(selectOptimalOutputMime('image/webp', { keepPngTransparency: false }), 'image/webp');

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

