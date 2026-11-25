import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import {
  applyAdminAuthGuard,
  applyRealtimePendingInsert,
  buildAdminOrderWhatsAppMessage,
  buildCustomerWhatsAppOrderMessage,
  buildWhatsAppUrl,
  calculateOrderTotals,
  computeOrderStats,
  computeResizedDimensions,
  countUnreadOrders,
  deriveBrandPalette,
  detectNewPendingOrderIds,
  filterProducts,
  findOrdersByPhone,
  formatDisplayIntlPhone,
  formatOrderWhatsAppPhone,
  formatPkr,
  formatReadableOrderDate,
  formatTelHref,
  generateNextOrderId,
  getNextOrderStatuses,
  getNewPendingAlertOrders,
  getOrderStatusBadgeClass,
  isValidImageUrlSyntax,
  isValidPkPhone,
  normalizePkPhone,
  normalizeProductImages,
  normalizeSiteSettings,
  reconcilePendingAlertIds,
  resolveRouteFromLocation,
  routeToPath,
  selectOptimalOutputMime,
  sortOrdersNewestFirst,
  validateOptimizedAssetSize,
  validateSiteAssetFile,
  validateSiteSettings,
} from './storeLogic';
import type { Order, Product, SiteSettings } from '../types/asatek';

const TEST_SITE_SETTINGS: SiteSettings = {
  id: 'default',
  site_name: 'ASATEK',
  tagline: 'Power Electronics, Solar Controllers & Inverters',
  logo_url: '/logo.jpg',
  favicon_url: '/logo.jpg',
  primary_color: '#9e0000',
  whatsapp_number: '0300-1234567',
  phone: '0300-1234567',
  email: 'support@asatek.pk',
  address: 'Sundar Industrial Estate, Lahore, Pakistan',
  hero_title: "Pakistan's Trusted Power Electronics Brand",
  hero_subtitle:
    'Rugged solar charge controllers, pure sine wave inverters, and heavy-duty industrial battery chargers engineered specifically for Pakistan.',
  hero_image_url: '/hero.jpg',
  footer_text: "Pakistan's trusted power electronics brand since 2021.",
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  updated_at: '2026-11-25T00:00:00.000Z',
};

const TEST_PRODUCTS: Product[] = [
  {
    id: 'sc5-va1260',
    sku: 'AST-SC5-1260-PK',
    name: 'ASATEK SC5 VA-1260',
    urduName: 'ASATEK SC5 VA-1260',
    subtitle: '12V 60A PWM Solar Controller',
    category: 'Solar Charge Controllers',
    voltage: '12V',
    amperageOrWatts: '60A',
    controlTech: 'PWM',
    price: 4500,
    msrp: 5200,
    wholesalePrice: 3950,
    inStock: true,
    stockCount: 100,
    lowStockThreshold: 10,
    warehouseLocation: 'Lahore',
    weightKg: 3.2,
    dimensionsMm: '260x210x115',
    warrantyMonths: 12,
    codEligible: true,
    urduManualIncluded: true,
    isPublicVisible: true,
    images: ['/p1.jpg'],
    description: '12V controller',
    urduDescription: '12V controller',
    features: [],
    specs: [],
    wiringSteps: [],
    quickStats: { currentLoad: '60A', maxArray: '1000W', coverage: '1 Yr' },
  },
  {
    id: 'sc5-va2460',
    sku: 'AST-SC5-2460-PK',
    name: 'ASATEK SC5 VA-2460',
    urduName: 'ASATEK SC5 VA-2460',
    subtitle: '24V 60A Commercial Solar Controller',
    category: 'Solar Charge Controllers',
    voltage: '24V',
    amperageOrWatts: '60A',
    controlTech: 'PWM',
    price: 5200,
    msrp: 5900,
    wholesalePrice: 4600,
    inStock: true,
    stockCount: 80,
    lowStockThreshold: 10,
    warehouseLocation: 'Lahore',
    weightKg: 3.6,
    dimensionsMm: '275x220x120',
    warrantyMonths: 12,
    codEligible: true,
    urduManualIncluded: true,
    isPublicVisible: true,
    images: ['/p2.jpg'],
    description: '24V controller',
    urduDescription: '24V controller',
    features: [],
    specs: [],
    wiringSteps: [],
    quickStats: { currentLoad: '60A', maxArray: '2000W', coverage: '1 Yr' },
  },
  {
    id: 'chg-1220',
    sku: 'AST-CHG-1220',
    name: 'ASATEK 12V 20A Smart Charger',
    urduName: 'ASATEK 12V 20A Smart Charger',
    subtitle: '12V 20A Automatic Battery Charger',
    category: 'Battery Chargers',
    voltage: '12V',
    amperageOrWatts: '20A',
    controlTech: 'SMPS',
    price: 2900,
    msrp: 3400,
    wholesalePrice: 2500,
    inStock: true,
    stockCount: 50,
    lowStockThreshold: 10,
    warehouseLocation: 'Lahore',
    weightKg: 1.5,
    dimensionsMm: '180x140x80',
    warrantyMonths: 12,
    codEligible: true,
    urduManualIncluded: true,
    isPublicVisible: true,
    images: ['/p3.jpg'],
    description: 'Battery charger',
    urduDescription: 'Battery charger',
    features: [],
    specs: [],
    wiringSteps: [],
    quickStats: { currentLoad: '20A', maxArray: 'N/A', coverage: '1 Yr' },
  },
];

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
  const chargers = filterProducts(TEST_PRODUCTS, { category: 'Battery Chargers' });
  assert.equal(chargers.length, 1);
  assert.equal(chargers[0].sku, 'AST-CHG-1220');

  const controllers24 = filterProducts(TEST_PRODUCTS, { voltage: '24V' });
  assert.ok(controllers24.every((p) => p.voltage.includes('24V')));

  const cheap = filterProducts(TEST_PRODUCTS, { maxBudget: 3000 });
  assert.ok(cheap.every((p) => p.price <= 3000));
});

test('getNextOrderStatuses, badge classes, sorting, unread count, and computeOrderStats respect workflow rules', () => {
  assert.deepEqual(getNextOrderStatuses('Pending'), ['Confirmed', 'Skipped', 'Cancelled']);
  assert.deepEqual(getNextOrderStatuses('Confirmed'), ['Pending', 'Skipped', 'Cancelled']);
  assert.deepEqual(getNextOrderStatuses('Skipped'), ['Confirmed', 'Pending', 'Cancelled']);
  assert.deepEqual(getNextOrderStatuses('Shipped'), ['Confirmed', 'Cancelled']);
  assert.deepEqual(getNextOrderStatuses('Cancelled'), ['Pending', 'Confirmed', 'Skipped']);

  assert.ok(getOrderStatusBadgeClass('Pending').includes('amber'));
  assert.ok(getOrderStatusBadgeClass('Confirmed').includes('emerald'));
  assert.ok(getOrderStatusBadgeClass('Skipped').includes('slate'));
  assert.ok(getOrderStatusBadgeClass('On Hold').includes('amber'));
  assert.ok(getOrderStatusBadgeClass('Cancelled').includes('error'));
  assert.ok(getOrderStatusBadgeClass('Shipped').length > 0);

  const stats = computeOrderStats(SAMPLE_ORDERS);
  assert.equal(stats.totalOrders, SAMPLE_ORDERS.length);
  assert.equal(stats.pendingOrders, 1);
  assert.equal(stats.skippedOrders, 1);
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

  // Realtime Pending alert helpers: insert deduplication, status filtering, reconciliation
  let alertIds = applyRealtimePendingInsert([], { id: '#AST-2026-2001', status: 'Pending' });
  assert.deepEqual(alertIds, ['#AST-2026-2001']);
  // Duplicate insert broadcast is idempotent
  alertIds = applyRealtimePendingInsert(alertIds, { id: '#AST-2026-2001', status: 'Pending' });
  assert.deepEqual(alertIds, ['#AST-2026-2001']);
  // Non-Pending orders do not trigger Pending alerts
  alertIds = applyRealtimePendingInsert(alertIds, { id: '#AST-2026-2002', status: 'Confirmed' });
  assert.deepEqual(alertIds, ['#AST-2026-2001']);

  const detected = detectNewPendingOrderIds(['#AST-2026-1002'], SAMPLE_ORDERS, []);
  assert.deepEqual(detected, ['#AST-2026-1001']);

  const resolvedAlerts = getNewPendingAlertOrders(SAMPLE_ORDERS, ['#AST-2026-1001', '#AST-2026-1002']);
  assert.deepEqual(resolvedAlerts.map((o) => o.id), ['#AST-2026-1001']);

  const reconciled = reconcilePendingAlertIds(['#AST-2026-1001', '#AST-2026-1002'], SAMPLE_ORDERS);
  assert.deepEqual(reconciled, ['#AST-2026-1001']);
});

test('formatPkr, WhatsApp message builders, and generateNextOrderId work accurately', () => {
  assert.equal(formatPkr(18000), 'PKR 18,000');
  const wa = buildWhatsAppUrl('Order Test', '0321-9998877');
  assert.ok(wa.startsWith('https://wa.me/923219998877?text='));
  assert.equal(formatTelHref('0321-9998877'), 'tel:+923219998877');
  assert.equal(formatDisplayIntlPhone('0321-9998877'), '+92 321 9998877');

  const generatedEmpty = generateNextOrderId([]);
  assert.match(generatedEmpty, /^#AST-\d{4}-\d{4,}$/);
  const generatedUnique = generateNextOrderId(SAMPLE_ORDERS);
  assert.match(generatedUnique, /^#AST-\d{4}-\d{4,}$/);
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

  assert.equal(formatOrderWhatsAppPhone('03007641905', '03219998877'), '923007641905');
  assert.equal(formatOrderWhatsAppPhone('   ', '03007641905'), '923007641905');
  assert.equal(formatOrderWhatsAppPhone('+92 300 7641905', ''), '923007641905');

  const readableDate = formatReadableOrderDate('2026-11-25T11:11:00.000Z');
  assert.match(readableDate, /2026, \d{1,2}:\d{2} (AM|PM)/);

  assert.ok(buildAdminOrderWhatsAppMessage(SAMPLE_ORDERS[0], 'ASATEK').includes('is pending. Thank you!'));
  assert.ok(
    buildAdminOrderWhatsAppMessage({ ...SAMPLE_ORDERS[0], status: 'Confirmed' }, 'ASATEK').includes(
      'is confirmed. Thank you!'
    )
  );
  assert.ok(
    buildAdminOrderWhatsAppMessage({ ...SAMPLE_ORDERS[0], status: 'Skipped' }, 'ASATEK').includes(
      'is on hold. Thank you!'
    )
  );
  assert.ok(buildAdminOrderWhatsAppMessage(SAMPLE_ORDERS[1], 'ASATEK').includes('LEOP-88991'));
  assert.ok(buildAdminOrderWhatsAppMessage(SAMPLE_ORDERS[2], 'ASATEK').includes('is on hold. Thank you!'));
  assert.ok(
    buildAdminOrderWhatsAppMessage({ ...SAMPLE_ORDERS[0], status: 'Cancelled' }, 'ASATEK').includes(
      'is cancelled. Thank you!'
    )
  );
});

test('validateSiteSettings and image upload/optimization helpers allow large photos and enforce 45MB limit', () => {
  const cleanErrors = validateSiteSettings(TEST_SITE_SETTINGS);
  assert.deepEqual(cleanErrors, {});

  const invalidErrors = validateSiteSettings({
    ...TEST_SITE_SETTINGS,
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
    TEST_SITE_SETTINGS
  );
  assert.equal(normalized.site_name, 'ASATEK Solar');
  assert.equal(normalized.primary_color, '#9e0000');
  assert.equal(normalized.whatsapp_number, TEST_SITE_SETTINGS.whatsapp_number);

  const nullNormalized = normalizeSiteSettings(null, TEST_SITE_SETTINGS);
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

