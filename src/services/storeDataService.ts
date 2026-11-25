import {
  SEED_FAQS,
  SEED_ORDERS,
  SEED_PRODUCTS,
  SEED_REVIEWS,
  SEED_SERVICE_CENTERS,
} from '../data/seedData';
import { SUPABASE_TABLES, supabase } from '../lib/supabaseClient';
import type {
  ContactInquiry,
  FaqItem,
  Language,
  Order,
  OrderStatus,
  Product,
  ReviewItem,
  ServiceCenter,
} from '../types/asatek';
import { normalizeProductImages } from '../utils/storeLogic';

export const STORE_STORAGE_KEY = 'asatek_pakistan_state_v2';

export interface StoreDataSnapshot {
  language: Language;
  products: Product[];
  orders: Order[];
  reviews: ReviewItem[];
  serviceCenters: ServiceCenter[];
  faqs: FaqItem[];
  inquiries: ContactInquiry[];
}

export function loadLocalStoreSnapshot(): StoreDataSnapshot {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoreDataSnapshot>;
        return {
          language: parsed.language === 'ur' ? 'ur' : 'en',
          products:
            Array.isArray(parsed.products) && parsed.products.length > 0
              ? parsed.products
              : SEED_PRODUCTS,
          orders:
            Array.isArray(parsed.orders) && parsed.orders.length > 0
              ? parsed.orders
              : SEED_ORDERS,
          reviews:
            Array.isArray(parsed.reviews) && parsed.reviews.length > 0
              ? parsed.reviews
              : SEED_REVIEWS,
          serviceCenters:
            Array.isArray(parsed.serviceCenters) && parsed.serviceCenters.length > 0
              ? parsed.serviceCenters
              : SEED_SERVICE_CENTERS,
          faqs:
            Array.isArray(parsed.faqs) && parsed.faqs.length > 0
              ? parsed.faqs
              : SEED_FAQS,
          inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : [],
        };
      }
    } catch {
      // Fall back cleanly to seed defaults on malformed JSON
    }
  }

  return {
    language: 'en',
    products: SEED_PRODUCTS,
    orders: SEED_ORDERS,
    reviews: SEED_REVIEWS,
    serviceCenters: SEED_SERVICE_CENTERS,
    faqs: SEED_FAQS,
    inquiries: [],
  };
}

export function saveLocalStoreSnapshot(snapshot: StoreDataSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage quota errors
  }
}

type DbRow = Record<string, unknown>;

function mapProductRow(row: DbRow): Product {
  return {
    id: String(row.id ?? ''),
    sku: String(row.sku ?? ''),
    name: String(row.name ?? ''),
    urduName: String(row.urdu_name ?? row.urduName ?? row.name ?? ''),
    subtitle: String(row.subtitle ?? ''),
    category: (row.category as Product['category']) || 'Solar Charge Controllers',
    voltage: (row.voltage as Product['voltage']) || '12V',
    amperageOrWatts: String(row.amperage_or_watts ?? row.amperageOrWatts ?? ''),
    controlTech: String(row.control_tech ?? row.controlTech ?? 'PWM'),
    price: Number(row.price ?? 0),
    msrp: Number(row.msrp ?? row.price ?? 0),
    wholesalePrice: Number(row.wholesale_price ?? row.wholesalePrice ?? row.price ?? 0),
    badge: typeof row.badge === 'string' ? row.badge : undefined,
    inStock: Boolean(row.in_stock ?? row.inStock ?? true),
    stockCount: Number(row.stock_count ?? row.stockCount ?? 0),
    lowStockThreshold: Number(row.low_stock_threshold ?? row.lowStockThreshold ?? 5),
    warehouseLocation: String(row.warehouse_location ?? row.warehouseLocation ?? 'Lahore Main Hub'),
    weightKg: Number(row.weight_kg ?? row.weightKg ?? 1),
    dimensionsMm: String(row.dimensions_mm ?? row.dimensionsMm ?? ''),
    warrantyMonths: Number(row.warranty_months ?? row.warrantyMonths ?? 12),
    codEligible: Boolean(row.cod_eligible ?? row.codEligible ?? true),
    urduManualIncluded: Boolean(row.urdu_manual_included ?? row.urduManualIncluded ?? true),
    isPublicVisible: Boolean(row.is_public_visible ?? row.isPublicVisible ?? true),
    images: normalizeProductImages(row.images, row.image_url ?? row.imageUrl),
    youtubeUrl: typeof row.youtube_url === 'string' ? row.youtube_url : (typeof row.youtubeUrl === 'string' ? row.youtubeUrl : undefined),
    description: String(row.description ?? ''),
    urduDescription: String(row.urdu_description ?? row.urduDescription ?? ''),
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    specs: Array.isArray(row.specs) ? (row.specs as Product['specs']) : [],
    wiringSteps: Array.isArray(row.wiring_steps ?? row.wiringSteps)
      ? ((row.wiring_steps ?? row.wiringSteps) as Product['wiringSteps'])
      : [],
    quickStats: (row.quick_stats ?? row.quickStats ?? {
      currentLoad: '',
      maxArray: '',
      coverage: '1 Yr Direct',
    }) as Product['quickStats'],
  };
}

function mapOrderRow(row: DbRow, itemsByOrderId: Map<string, DbRow[]>): Order {
  const id = String(row.id ?? '');
  const items = itemsByOrderId.get(id) ?? [];
  const primaryItem = items[0];

  return {
    id,
    customerName: String(row.customer_name ?? row.customerName ?? ''),
    phone: String(row.phone ?? ''),
    whatsapp: String(row.whatsapp ?? row.phone ?? ''),
    address: String(row.address ?? ''),
    city: String(row.city ?? ''),
    province: String(row.province ?? ''),
    landmark: typeof row.landmark === 'string' ? row.landmark : undefined,
    instructions: typeof row.instructions === 'string' ? row.instructions : undefined,
    productId: String(primaryItem?.product_id ?? row.product_id ?? row.productId ?? ''),
    productSku: String(primaryItem?.product_sku ?? row.product_sku ?? row.productSku ?? ''),
    productName: String(primaryItem?.product_name ?? row.product_name ?? row.productName ?? ''),
    quantity: Number(primaryItem?.quantity ?? row.quantity ?? 1),
    unitPrice: Number(primaryItem?.unit_price ?? row.unit_price ?? row.unitPrice ?? 0),
    shippingFee: Number(row.shipping_fee ?? row.shippingFee ?? 350),
    totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
    paymentMethod: (row.payment_method ?? row.paymentMethod ?? 'COD') as Order['paymentMethod'],
    status: (row.status as OrderStatus) || 'Pending',
    courierName: typeof (row.courier_name ?? row.courierName) === 'string'
      ? String(row.courier_name ?? row.courierName)
      : undefined,
    trackingNumber: typeof (row.tracking_number ?? row.trackingNumber) === 'string'
      ? String(row.tracking_number ?? row.trackingNumber)
      : undefined,
    serialNumber: typeof (row.serial_number ?? row.serialNumber) === 'string'
      ? String(row.serial_number ?? row.serialNumber)
      : undefined,
    expectedDelivery: typeof (row.expected_delivery ?? row.expectedDelivery) === 'string'
      ? String(row.expected_delivery ?? row.expectedDelivery)
      : undefined,
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? ''),
    history: Array.isArray(row.history) ? (row.history as Order['history']) : [],
  };
}

function mapReviewRow(row: DbRow): ReviewItem {
  return {
    id: String(row.id ?? ''),
    customerName: String(row.customer_name ?? row.customerName ?? ''),
    city: String(row.city ?? ''),
    productId: String(row.product_id ?? row.productId ?? ''),
    productName: String(row.product_name ?? row.productName ?? ''),
    rating: Number(row.rating ?? 5),
    comment: String(row.comment ?? ''),
    urduComment: typeof (row.urdu_comment ?? row.urduComment) === 'string'
      ? String(row.urdu_comment ?? row.urduComment)
      : undefined,
    setupMetric: String(row.setup_metric ?? row.setupMetric ?? ''),
    image: (() => {
      const rawImg = row.image ?? row.image_url ?? row.imageUrl;
      return typeof rawImg === 'string' && rawImg.trim().length > 0 ? rawImg.trim() : undefined;
    })(),
    verifiedBuyer: Boolean(row.verified_buyer ?? row.verifiedBuyer ?? true),
    status: (row.status as ReviewItem['status']) || 'Published',
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
  };
}

function mapServiceCenterRow(row: DbRow): ServiceCenter {
  return {
    id: String(row.id ?? ''),
    hubCode: String(row.hub_code ?? row.hubCode ?? ''),
    city: String(row.city ?? ''),
    province: (row.province as ServiceCenter['province']) || 'Punjab',
    facilityType:
      ((row.facility_type ?? row.facilityType) as ServiceCenter['facilityType']) || 'Regional Hub',
    name: String(row.name ?? ''),
    address: String(row.address ?? ''),
    leadEngineer: String(row.lead_engineer ?? row.leadEngineer ?? ''),
    specialization: String(row.specialization ?? ''),
    diagnostics: String(row.diagnostics ?? ''),
    hours: String(row.hours ?? ''),
    phone: String(row.phone ?? ''),
    whatsapp: String(row.whatsapp ?? ''),
    active: Boolean(row.active ?? true),
  };
}

function mapFaqRow(row: DbRow): FaqItem {
  return {
    id: String(row.id ?? ''),
    orderIndex: Number(row.order_index ?? row.orderIndex ?? 1),
    category: (row.category as FaqItem['category']) || 'Installation & Wiring',
    questionEn: String(row.question_en ?? row.questionEn ?? ''),
    answerEn: String(row.answer_en ?? row.answerEn ?? ''),
    questionUr: String(row.question_ur ?? row.questionUr ?? ''),
    answerUr: String(row.answer_ur ?? row.answerUr ?? ''),
    published: Boolean(row.published ?? true),
  };
}

export async function fetchStoreDataRemote(): Promise<Partial<StoreDataSnapshot>> {
  if (!supabase) {
    return {};
  }

  const [
    productsRes,
    ordersRes,
    orderItemsRes,
    reviewsRes,
    centersRes,
    faqsRes,
  ] = await Promise.allSettled([
    supabase.from(SUPABASE_TABLES.products).select('*'),
    supabase.from(SUPABASE_TABLES.orders).select('*'),
    supabase.from(SUPABASE_TABLES.orderItems).select('*'),
    supabase.from(SUPABASE_TABLES.reviews).select('*'),
    supabase.from(SUPABASE_TABLES.serviceCenters).select('*'),
    supabase.from(SUPABASE_TABLES.faqs).select('*').order('order_index', { ascending: true }),
  ]);

  const partial: Partial<StoreDataSnapshot> = {};

  if (productsRes.status === 'fulfilled' && !productsRes.value.error && Array.isArray(productsRes.value.data) && productsRes.value.data.length > 0) {
    partial.products = (productsRes.value.data as DbRow[]).map(mapProductRow);
  }

  const itemsByOrderId = new Map<string, DbRow[]>();
  if (orderItemsRes.status === 'fulfilled' && !orderItemsRes.value.error && Array.isArray(orderItemsRes.value.data)) {
    for (const item of orderItemsRes.value.data as DbRow[]) {
      const orderId = String(item.order_id ?? item.orderId ?? '');
      if (!orderId) continue;
      const existing = itemsByOrderId.get(orderId) ?? [];
      existing.push(item);
      itemsByOrderId.set(orderId, existing);
    }
  }

  if (ordersRes.status === 'fulfilled' && !ordersRes.value.error && Array.isArray(ordersRes.value.data) && ordersRes.value.data.length > 0) {
    partial.orders = (ordersRes.value.data as DbRow[]).map((row) => mapOrderRow(row, itemsByOrderId));
  }

  if (reviewsRes.status === 'fulfilled' && !reviewsRes.value.error && Array.isArray(reviewsRes.value.data) && reviewsRes.value.data.length > 0) {
    partial.reviews = (reviewsRes.value.data as DbRow[]).map(mapReviewRow);
  }

  if (centersRes.status === 'fulfilled' && !centersRes.value.error && Array.isArray(centersRes.value.data) && centersRes.value.data.length > 0) {
    partial.serviceCenters = (centersRes.value.data as DbRow[]).map(mapServiceCenterRow);
  }

  if (faqsRes.status === 'fulfilled' && !faqsRes.value.error && Array.isArray(faqsRes.value.data) && faqsRes.value.data.length > 0) {
    partial.faqs = (faqsRes.value.data as DbRow[]).map(mapFaqRow);
  }

  return partial;
}

export async function createOrderRemote(order: Order): Promise<void> {
  if (!supabase) return;
  try {
    const { error: orderErr } = await supabase.from(SUPABASE_TABLES.orders).insert({
      id: order.id,
      customer_name: order.customerName,
      phone: order.phone,
      whatsapp: order.whatsapp,
      address: order.address,
      city: order.city,
      province: order.province,
      landmark: order.landmark ?? null,
      instructions: order.instructions ?? null,
      shipping_fee: order.shippingFee,
      total_amount: order.totalAmount,
      payment_method: order.paymentMethod,
      status: order.status,
      courier_name: order.courierName ?? null,
      tracking_number: order.trackingNumber ?? null,
      serial_number: order.serialNumber ?? null,
      expected_delivery: order.expectedDelivery ?? null,
      history: order.history,
    });
    if (orderErr) return;

    await supabase.from(SUPABASE_TABLES.orderItems).insert({
      order_id: order.id,
      product_id: order.productId,
      product_sku: order.productSku,
      product_name: order.productName,
      quantity: order.quantity,
      unit_price: order.unitPrice,
      line_total: order.unitPrice * order.quantity,
    });
  } catch {
    // Graceful fallback: local state retains the order when tables are not yet created
  }
}

export async function updateOrderRemote(
  orderId: string,
  patch: Partial<Order>
): Promise<void> {
  if (!supabase) return;
  try {
    const dbPatch: DbRow = {};
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.courierName !== undefined) dbPatch.courier_name = patch.courierName;
    if (patch.trackingNumber !== undefined) dbPatch.tracking_number = patch.trackingNumber;
    if (patch.address !== undefined) dbPatch.address = patch.address;
    if (patch.city !== undefined) dbPatch.city = patch.city;
    if (patch.province !== undefined) dbPatch.province = patch.province;
    if (patch.history !== undefined) dbPatch.history = patch.history;
    await supabase.from(SUPABASE_TABLES.orders).update(dbPatch).eq('id', orderId);
  } catch {
    // Graceful fallback when Supabase tables are not provisioned yet
  }
}

export async function upsertProductRemote(product: Product): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(SUPABASE_TABLES.products).upsert(
      {
        id: product.id,
        sku: product.sku,
        name: product.name,
        urdu_name: product.urduName,
        subtitle: product.subtitle,
        category: product.category,
        voltage: product.voltage,
        amperage_or_watts: product.amperageOrWatts,
        control_tech: product.controlTech,
        price: product.price,
        msrp: product.msrp,
        wholesale_price: product.wholesalePrice,
        badge: product.badge ?? null,
        in_stock: product.inStock,
        stock_count: product.stockCount,
        low_stock_threshold: product.lowStockThreshold,
        warehouse_location: product.warehouseLocation,
        weight_kg: product.weightKg,
        dimensions_mm: product.dimensionsMm,
        warranty_months: product.warrantyMonths,
        cod_eligible: product.codEligible,
        urdu_manual_included: product.urduManualIncluded,
        is_public_visible: product.isPublicVisible,
        images: product.images,
        youtube_url: product.youtubeUrl ?? null,
        description: product.description,
        urdu_description: product.urduDescription,
        features: product.features,
        specs: product.specs,
        wiring_steps: product.wiringSteps,
        quick_stats: product.quickStats,
      },
      { onConflict: 'id' }
    );
  } catch {
    // Graceful fallback
  }
}

export async function deleteProductRemote(productId: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(SUPABASE_TABLES.products).delete().eq('id', productId);
  } catch {
    // Graceful fallback
  }
}

export async function upsertReviewRemote(review: ReviewItem): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(SUPABASE_TABLES.reviews).upsert(
      {
        id: review.id,
        customer_name: review.customerName,
        city: review.city,
        product_id: review.productId,
        product_name: review.productName,
        rating: review.rating,
        comment: review.comment,
        urdu_comment: review.urduComment ?? null,
        setup_metric: review.setupMetric,
        image: review.image ?? null,
        verified_buyer: review.verifiedBuyer,
        status: review.status,
      },
      { onConflict: 'id' }
    );
  } catch {
    // Graceful fallback
  }
}

export async function deleteReviewRemote(reviewId: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(SUPABASE_TABLES.reviews).delete().eq('id', reviewId);
  } catch {
    // Graceful fallback
  }
}

export async function upsertServiceCenterRemote(center: ServiceCenter): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(SUPABASE_TABLES.serviceCenters).upsert(
      {
        id: center.id,
        hub_code: center.hubCode,
        city: center.city,
        province: center.province,
        facility_type: center.facilityType,
        name: center.name,
        address: center.address,
        lead_engineer: center.leadEngineer,
        specialization: center.specialization,
        diagnostics: center.diagnostics,
        hours: center.hours,
        phone: center.phone,
        whatsapp: center.whatsapp,
        active: center.active,
      },
      { onConflict: 'id' }
    );
  } catch {
    // Graceful fallback
  }
}

export async function deleteServiceCenterRemote(centerId: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(SUPABASE_TABLES.serviceCenters).delete().eq('id', centerId);
  } catch {
    // Graceful fallback
  }
}

export async function upsertFaqRemote(faq: FaqItem): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(SUPABASE_TABLES.faqs).upsert(
      {
        id: faq.id,
        order_index: faq.orderIndex,
        category: faq.category,
        question_en: faq.questionEn,
        answer_en: faq.answerEn,
        question_ur: faq.questionUr,
        answer_ur: faq.answerUr,
        published: faq.published,
      },
      { onConflict: 'id' }
    );
  } catch {
    // Graceful fallback
  }
}

export async function deleteFaqRemote(faqId: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from(SUPABASE_TABLES.faqs).delete().eq('id', faqId);
  } catch {
    // Graceful fallback
  }
}
