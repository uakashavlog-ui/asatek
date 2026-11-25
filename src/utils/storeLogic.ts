import type {
  Order,
  OrderStatus,
  PageRoute,
  Product,
  ProductCategory,
  SiteSettings,
  SystemVoltage,
} from '../types/asatek';

export const STANDARD_COD_SHIPPING_PKR = 350;
export const WHATSAPP_OFFICIAL_NUMBER = '923001234567';

export function formatPkr(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `PKR ${safe.toLocaleString('en-US')}`;
}

export function normalizePkPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('92') && digits.length >= 12) {
    return `0${digits.slice(2, 12)}`;
  }
  if (digits.startsWith('3') && digits.length === 10) {
    return `0${digits}`;
  }
  return digits;
}

export function isValidPkPhone(raw: string): boolean {
  const norm = normalizePkPhone(raw);
  return /^03\d{9}$/.test(norm);
}

export function calculateOrderTotals(unitPrice: number, quantity: number, shippingFee = STANDARD_COD_SHIPPING_PKR) {
  const qty = Math.max(1, Math.floor(Number.isFinite(quantity) ? quantity : 1));
  const price = Math.max(0, Number.isFinite(unitPrice) ? unitPrice : 0);
  const fee = Math.max(0, Number.isFinite(shippingFee) ? shippingFee : 0);
  const subtotal = price * qty;
  return {
    quantity: qty,
    subtotal,
    shippingFee: fee,
    totalAmount: subtotal + fee,
  };
}

export function findOrdersByPhone(orders: Order[], phoneQuery: string): Order[] {
  const normQuery = normalizePkPhone(phoneQuery);
  const trimmedRef = phoneQuery.trim().toUpperCase();
  if (!normQuery && !trimmedRef) return [];

  return orders.filter((order) => {
    const orderPhone = normalizePkPhone(order.phone);
    const orderWa = normalizePkPhone(order.whatsapp);
    if (normQuery.length >= 7 && (orderPhone === normQuery || orderWa === normQuery)) {
      return true;
    }
    if (trimmedRef.startsWith('#AST') || trimmedRef.startsWith('AST')) {
      return order.id.toUpperCase().includes(trimmedRef.replace(/^#/, ''));
    }
    return false;
  });
}

export interface ProductFilterOptions {
  category?: ProductCategory | 'All Categories';
  voltage?: SystemVoltage | 'ALL';
  maxBudget?: number;
  search?: string;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'stock-desc';
  onlyPublic?: boolean;
}

export function filterProducts(products: Product[], options: ProductFilterOptions): Product[] {
  const {
    category = 'All Categories',
    voltage = 'ALL',
    maxBudget = 100000,
    search = '',
    sort = 'featured',
    onlyPublic = true,
  } = options;

  const q = search.trim().toLowerCase();

  const filtered = products.filter((p) => {
    if (onlyPublic && !p.isPublicVisible) return false;
    if (category !== 'All Categories' && p.category !== category) return false;
    if (voltage !== 'ALL') {
      if (!p.voltage.includes(voltage)) return false;
    }
    if (p.price > maxBudget) return false;
    if (q) {
      const hay = `${p.name} ${p.sku} ${p.subtitle} ${p.amperageOrWatts} ${p.controlTech} ${p.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  else if (sort === 'stock-desc') sorted.sort((a, b) => b.stockCount - a.stockCount);

  return sorted;
}

export function getNextOrderStatuses(current: OrderStatus): OrderStatus[] {
  switch (current) {
    case 'Pending':
      return ['Confirmed', 'Cancelled'];
    case 'Confirmed':
      return ['Shipped', 'Cancelled'];
    case 'Shipped':
      return ['Delivered', 'Cancelled'];
    case 'Delivered':
      return [];
    case 'Cancelled':
      return ['Pending'];
  }
}

export function computeOrderStats(orders: Order[]) {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const confirmedOrShipped = orders.filter(
    (o) => o.status === 'Confirmed' || o.status === 'Shipped' || o.status === 'Delivered'
  ).length;
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;
  const grossRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const codRevenue = orders
    .filter((o) => o.status !== 'Cancelled' && o.paymentMethod === 'COD')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    totalOrders,
    pendingOrders,
    confirmedOrShipped,
    cancelledOrders,
    grossRevenue,
    codRevenue,
    prepaidRevenue: Math.max(0, grossRevenue - codRevenue),
  };
}

export function buildWhatsAppUrl(message: string, phoneNumber = WHATSAPP_OFFICIAL_NUMBER): string {
  const cleanPhone = (phoneNumber || WHATSAPP_OFFICIAL_NUMBER).replace(/\D/g, '') || WHATSAPP_OFFICIAL_NUMBER;
  const formatted = cleanPhone.startsWith('0') ? `92${cleanPhone.slice(1)}` : cleanPhone;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}

export function formatTelHref(phone: string): string {
  const clean = phone.trim();
  const digits = clean.replace(/\D/g, '');
  if (!digits) return 'tel:+923001234567';
  if (clean.startsWith('+')) return `tel:+${digits}`;
  if (digits.startsWith('0')) return `tel:+92${digits.slice(1)}`;
  return `tel:+${digits}`;
}

export function formatDisplayIntlPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '+92 300 1234567';
  const local = digits.startsWith('92') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits;
  if (local.length === 10) {
    return `+92 ${local.slice(0, 3)} ${local.slice(3)}`;
  }
  return phone.trim();
}

export function isValidContactPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return false;
  if (digits.startsWith('03')) return /^03\d{9}$/.test(digits);
  if (digits.startsWith('923')) return /^923\d{9}$/.test(digits);
  return true;
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

export function isValidOptionalHttpUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidHexColor(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex.trim());
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => clampByte(v).toString(16).padStart(2, '0')).join('')}`;
}

function mixRgb(a: [number, number, number], b: [number, number, number], weightB: number): [number, number, number] {
  const w = Math.max(0, Math.min(1, weightB));
  return [
    a[0] * (1 - w) + b[0] * w,
    a[1] * (1 - w) + b[1] * w,
    a[2] * (1 - w) + b[2] * w,
  ];
}

export function deriveBrandPalette(primaryHex: string) {
  const safeHex = isValidHexColor(primaryHex) ? primaryHex.trim().toLowerCase() : '#9e0000';
  const r = Number.parseInt(safeHex.slice(1, 3), 16);
  const g = Number.parseInt(safeHex.slice(3, 5), 16);
  const b = Number.parseInt(safeHex.slice(5, 7), 16);
  const base: [number, number, number] = [r, g, b];

  const containerRgb = mixRgb(base, [255, 45, 45], 0.16);
  const darkerRgb = mixRgb(base, [0, 0, 0], 0.18);
  const tintRgb = mixRgb(base, [255, 255, 255], 0.08);
  const fixedRgb = mixRgb(base, [255, 255, 255], 0.86);
  const fixedDimRgb = mixRgb(base, [255, 255, 255], 0.72);
  const fixedTextRgb = mixRgb(base, [0, 0, 0], 0.58);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return {
    primary: safeHex,
    onPrimary: luminance > 0.62 ? '#1c1b1b' : '#ffffff',
    primaryContainer: toHex(...containerRgb),
    surfaceTint: toHex(...tintRgb),
    onPrimaryFixedVariant: toHex(...darkerRgb),
    primaryFixed: toHex(...fixedRgb),
    primaryFixedDim: toHex(...fixedDimRgb),
    onPrimaryFixed: toHex(...fixedTextRgb),
  };
}

export const SITE_ASSET_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const STANDARD_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];
export const SVG_IMAGE_MIME_TYPES = ['image/svg+xml'];
export const ALLOWED_SITE_ASSET_MIME_TYPES = [
  ...STANDARD_IMAGE_MIME_TYPES,
  ...SVG_IMAGE_MIME_TYPES,
];

export interface ImageValidationOptions {
  allowSvg?: boolean;
}

export function validateSiteAssetFile(
  file: { name: string; type: string; size: number },
  options: ImageValidationOptions = { allowSvg: true }
): string | null {
  const allowSvg = options.allowSvg ?? true;
  const mime = (file.type || '').toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  const isSvg = mime === 'image/svg+xml' || ext === 'svg';
  if (isSvg && !allowSvg) {
    return 'SVG format is only allowed for the site logo and favicon. Please choose a JPG, PNG, or WebP image.';
  }

  const allowedExt = allowSvg
    ? ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)
    : ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
  const allowedMimes = allowSvg ? ALLOWED_SITE_ASSET_MIME_TYPES : STANDARD_IMAGE_MIME_TYPES;

  if (!allowedMimes.includes(mime) && !allowedExt) {
    return allowSvg
      ? 'Unsupported image format. Allowed formats: JPG, PNG, WebP, or SVG.'
      : 'Unsupported image format. Allowed formats: JPG, PNG, or WebP.';
  }
  if (file.size <= 0) {
    return 'The selected image file appears to be empty.';
  }
  if (file.size > SITE_ASSET_MAX_BYTES) {
    return 'Image exceeds the 2 MB file size limit. Please choose a smaller file.';
  }
  return null;
}

export function isValidImageUrlSyntax(
  rawUrl: string,
  options: ImageValidationOptions = { allowSvg: true }
): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  const allowSvg = options.allowSvg ?? true;

  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//')) return false;
    if (!allowSvg && /\.svg(\?|#|$)/i.test(trimmed)) return false;
    return trimmed.length > 1;
  }

  if (trimmed.startsWith('data:image/')) {
    if (!allowSvg && trimmed.startsWith('data:image/svg+xml')) return false;
    return trimmed.includes(',');
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    if (!allowSvg && /\.svg$/i.test(parsed.pathname)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function normalizeProductImages(rawImages: unknown, rawImageUrl?: unknown): string[] {
  const list: string[] = [];
  if (Array.isArray(rawImages)) {
    for (const item of rawImages) {
      if (typeof item === 'string' && item.trim().length > 0) {
        list.push(item.trim());
      }
    }
  } else if (typeof rawImages === 'string' && rawImages.trim().length > 0) {
    const trimmed = rawImages.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (typeof item === 'string' && item.trim().length > 0) {
              list.push(item.trim());
            }
          }
        }
      } catch {
        list.push(trimmed);
      }
    } else {
      list.push(trimmed);
    }
  }

  if (list.length === 0 && typeof rawImageUrl === 'string' && rawImageUrl.trim().length > 0) {
    list.push(rawImageUrl.trim());
  }

  return list;
}

export function validateSiteSettings(settings: SiteSettings): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!settings.site_name.trim() || settings.site_name.trim().length < 2) {
    errors.site_name = 'Website name must be at least 2 characters.';
  }
  if (!settings.tagline.trim()) {
    errors.tagline = 'Tagline is required.';
  }
  if (!isValidHexColor(settings.primary_color)) {
    errors.primary_color = 'Primary brand color must be a valid 6-digit hex code (e.g. #9e0000).';
  }
  if (!isValidContactPhone(settings.whatsapp_number)) {
    errors.whatsapp_number = 'Enter a valid WhatsApp number (10–15 digits, e.g. 0300-1234567 or +92 300 1234567).';
  }
  if (!isValidContactPhone(settings.phone)) {
    errors.phone = 'Enter a valid contact phone number (10–15 digits, e.g. 0300-1234567 or 042-37254321).';
  }
  if (!isValidEmail(settings.email)) {
    errors.email = 'Enter a valid support email address (e.g. support@asatek.pk).';
  }
  if (!settings.address.trim() || settings.address.trim().length < 6) {
    errors.address = 'Business address must be at least 6 characters.';
  }
  if (!settings.hero_title.trim() || settings.hero_title.trim().length < 4) {
    errors.hero_title = 'Homepage hero title is required.';
  }
  if (!settings.hero_subtitle.trim() || settings.hero_subtitle.trim().length < 10) {
    errors.hero_subtitle = 'Homepage hero subtitle must be at least 10 characters.';
  }
  if (!settings.footer_text.trim()) {
    errors.footer_text = 'Footer text is required.';
  }
  if (!isValidOptionalHttpUrl(settings.facebook_url)) {
    errors.facebook_url = 'Facebook URL must start with http:// or https://';
  }
  if (!isValidOptionalHttpUrl(settings.instagram_url)) {
    errors.instagram_url = 'Instagram URL must start with http:// or https://';
  }
  if (!isValidOptionalHttpUrl(settings.youtube_url)) {
    errors.youtube_url = 'YouTube URL must start with http:// or https://';
  }

  return errors;
}

export function normalizeSiteSettings(
  raw: Partial<SiteSettings> | null | undefined,
  defaults: SiteSettings
): SiteSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...defaults };
  }
  const pickStr = (val: unknown, fallback: string) =>
    typeof val === 'string' && val.trim().length > 0 ? val : fallback;
  const pickOptionalStr = (val: unknown, fallback: string) =>
    typeof val === 'string' ? val : fallback;

  return {
    id: pickStr(raw.id, defaults.id),
    site_name: pickStr(raw.site_name, defaults.site_name),
    tagline: pickStr(raw.tagline, defaults.tagline),
    logo_url: pickStr(raw.logo_url, defaults.logo_url),
    favicon_url: pickStr(raw.favicon_url, defaults.favicon_url),
    primary_color:
      typeof raw.primary_color === 'string' && isValidHexColor(raw.primary_color)
        ? raw.primary_color.trim().toLowerCase()
        : defaults.primary_color,
    whatsapp_number: pickStr(raw.whatsapp_number, defaults.whatsapp_number),
    phone: pickStr(raw.phone, defaults.phone),
    email: pickStr(raw.email, defaults.email),
    address: pickStr(raw.address, defaults.address),
    hero_title: pickStr(raw.hero_title, defaults.hero_title),
    hero_subtitle: pickStr(raw.hero_subtitle, defaults.hero_subtitle),
    hero_image_url: pickStr(raw.hero_image_url, defaults.hero_image_url),
    footer_text: pickStr(raw.footer_text, defaults.footer_text),
    facebook_url: pickOptionalStr(raw.facebook_url, defaults.facebook_url),
    instagram_url: pickOptionalStr(raw.instagram_url, defaults.instagram_url),
    youtube_url: pickOptionalStr(raw.youtube_url, defaults.youtube_url),
    updated_at: pickStr(raw.updated_at, defaults.updated_at),
  };
}

export function generateNextOrderId(existingOrders: Order[]): string {
  const maxNum = existingOrders.reduce((max, o) => {
    const match = o.id.match(/(\d+)$/);
    const num = match ? Number.parseInt(match[1], 10) : 0;
    return num > max ? num : max;
  }, 42);
  return `#AST-2025-${String(maxNum + 1).padStart(4, '0')}`;
}

export const ALL_PAGE_ROUTES: PageRoute[] = [
  'home',
  'products',
  'product-detail',
  'order-form',
  'order-confirmation',
  'track-order',
  'service-centers',
  'reviews',
  'faq',
  'contact',
  'admin-login',
  'admin-dashboard',
  'admin-orders',
  'admin-order-detail',
  'admin-products',
  'admin-product-form',
  'admin-reviews',
  'admin-service-centers',
  'admin-faq',
  'admin-settings',
];

const PATH_SEGMENT_TO_ROUTE: Record<string, PageRoute> = {
  '': 'home',
  home: 'home',
  products: 'products',
  'product-detail': 'product-detail',
  'order-form': 'order-form',
  'order-confirmation': 'order-confirmation',
  'track-order': 'track-order',
  'service-centers': 'service-centers',
  reviews: 'reviews',
  faq: 'faq',
  contact: 'contact',
  admin: 'admin-dashboard',
  'admin-login': 'admin-login',
  'admin/login': 'admin-login',
  'admin-dashboard': 'admin-dashboard',
  'admin/dashboard': 'admin-dashboard',
  'admin-orders': 'admin-orders',
  'admin/orders': 'admin-orders',
  'admin-order-detail': 'admin-order-detail',
  'admin/order-detail': 'admin-order-detail',
  'admin-products': 'admin-products',
  'admin/products': 'admin-products',
  'admin-product-form': 'admin-product-form',
  'admin/product-form': 'admin-product-form',
  'admin-reviews': 'admin-reviews',
  'admin/reviews': 'admin-reviews',
  'admin-service-centers': 'admin-service-centers',
  'admin/service-centers': 'admin-service-centers',
  'admin-faq': 'admin-faq',
  'admin/faq': 'admin-faq',
  'admin-settings': 'admin-settings',
  'admin/settings': 'admin-settings',
};

export function routeToPath(route: PageRoute): string {
  if (route === 'home') return '/';
  if (route.startsWith('admin-')) {
    return `/admin/${route.slice('admin-'.length)}`;
  }
  return `/${route}`;
}

export function resolveRouteFromLocation(pathname: string, hash = ''): PageRoute {
  const cleanHash = hash.replace(/^#\/?/, '').replace(/\/+$/, '').toLowerCase();
  if (cleanHash) {
    if (cleanHash in PATH_SEGMENT_TO_ROUTE) {
      return PATH_SEGMENT_TO_ROUTE[cleanHash];
    }
    if (cleanHash.startsWith('admin')) {
      return 'admin-dashboard';
    }
  }

  const cleanPath = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (cleanPath in PATH_SEGMENT_TO_ROUTE) {
    return PATH_SEGMENT_TO_ROUTE[cleanPath];
  }
  if (cleanPath.startsWith('admin')) {
    return 'admin-dashboard';
  }
  return 'home';
}

export function applyAdminAuthGuard(
  targetRoute: PageRoute,
  hasValidSession: boolean
): { route: PageRoute; postLoginRoute?: PageRoute } {
  if (targetRoute.startsWith('admin-') && targetRoute !== 'admin-login' && !hasValidSession) {
    return {
      route: 'admin-login',
      postLoginRoute: targetRoute,
    };
  }
  return { route: targetRoute };
}
