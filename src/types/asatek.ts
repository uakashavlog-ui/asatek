export type Language = 'en' | 'ur';

export type PageRoute =
  | 'home'
  | 'products'
  | 'product-detail'
  | 'order-form'
  | 'order-confirmation'
  | 'track-order'
  | 'service-centers'
  | 'reviews'
  | 'faq'
  | 'contact'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-orders'
  | 'admin-order-detail'
  | 'admin-products'
  | 'admin-product-form'
  | 'admin-reviews'
  | 'admin-service-centers'
  | 'admin-faq'
  | 'admin-settings';

export type ProductCategory =
  | 'Solar Charge Controllers'
  | 'UPS / Inverters'
  | 'Battery Chargers'
  | 'Parts & Accessories';

export type SystemVoltage = '12V' | '24V' | '48V' | '12V/24V';

export interface ProductSpec {
  parameter: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  urduName: string;
  subtitle: string;
  category: ProductCategory;
  voltage: SystemVoltage;
  amperageOrWatts: string;
  controlTech: string;
  price: number;
  msrp: number;
  wholesalePrice: number;
  badge?: string;
  inStock: boolean;
  stockCount: number;
  lowStockThreshold: number;
  warehouseLocation: string;
  weightKg: number;
  dimensionsMm: string;
  warrantyMonths: number;
  codEligible: boolean;
  urduManualIncluded: boolean;
  isPublicVisible: boolean;
  images: string[];
  youtubeUrl?: string;
  description: string;
  urduDescription: string;
  features: string[];
  specs: ProductSpec[];
  wiringSteps: { title: string; detail: string }[];
  quickStats: {
    currentLoad: string;
    maxArray: string;
    coverage: string;
  };
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'COD' | 'Bank Transfer';

export interface OrderHistoryEntry {
  status: string;
  timestamp: string;
  note: string;
  actor: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  customerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  province: string;
  landmark?: string;
  instructions?: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
  serialNumber?: string;
  expectedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  history: OrderHistoryEntry[];
}

export interface ServiceCenter {
  id: string;
  hubCode: string;
  city: string;
  province: 'Punjab' | 'Sindh' | 'KPK' | 'Balochistan' | 'Islamabad / Northern';
  facilityType: 'Central Depot' | 'Regional Hub' | 'Warranty Claim';
  name: string;
  address: string;
  leadEngineer: string;
  specialization: string;
  diagnostics: string;
  hours: string;
  phone: string;
  whatsapp: string;
  active: boolean;
}

export type ReviewStatus = 'Published' | 'Pending' | 'Hidden';

export interface ReviewItem {
  id: string;
  customerName: string;
  city: string;
  productId: string;
  productName: string;
  rating: number;
  comment: string;
  urduComment?: string;
  setupMetric: string;
  image?: string;
  verifiedBuyer: boolean;
  status: ReviewStatus;
  createdAt: string;
}

export type FaqCategory =
  | 'Installation & Wiring'
  | 'Solar Compatibility'
  | 'Warranty & Claims'
  | 'COD & Shipping';

export interface FaqItem {
  id: string;
  orderIndex: number;
  category: FaqCategory;
  questionEn: string;
  answerEn: string;
  questionUr: string;
  answerUr: string;
  published: boolean;
}

export interface ContactInquiry {
  id: string;
  name: string;
  phone: string;
  city: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  whatsapp_number: string;
  phone: string;
  email: string;
  address: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  footer_text: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  updated_at: string;
}

