import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type {
  ContactInquiry,
  FaqItem,
  Language,
  Order,
  OrderStatus,
  PageRoute,
  Product,
  ProductCategory,
  ReviewItem,
  ServiceCenter,
  SiteSettings,
  SystemVoltage,
} from '../types/asatek';
import {
  applyAdminAuthGuard,
  calculateOrderTotals,
  deriveBrandPalette,
  generateNextOrderId,
  resolveRouteFromLocation,
  routeToPath,
  STANDARD_COD_SHIPPING_PKR,
} from '../utils/storeLogic';
import {
  fetchSiteSettings,
  loadLocalSiteSettings,
  resetSiteSettingsRemoteOrLocal,
  saveSiteSettingsRemoteOrLocal,
  uploadSiteAsset as uploadSiteAssetService,
  type SiteAssetSlot,
} from '../services/siteSettingsService';
import {
  createOrderRemote,
  fetchOrdersRemote,
  deleteFaqRemote,
  deleteProductRemote,
  deleteReviewRemote,
  deleteServiceCenterRemote,
  fetchStoreDataRemote,
  loadLocalStoreSnapshot,
  saveLocalStoreSnapshot,
  updateOrderRemote,
  upsertFaqRemote,
  upsertProductRemote,
  upsertReviewRemote,
  upsertServiceCenterRemote,
  type StoreDataSnapshot,
} from '../services/storeDataService';

export interface PlaceOrderInput {
  productId: string;
  quantity: number;
  customerName: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  province: string;
  landmark?: string;
  instructions?: string;
  paymentMethod?: 'COD' | 'Bank Transfer';
  status?: OrderStatus;
}

interface StoreContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  route: PageRoute;
  navigate: (
    route: PageRoute,
    opts?: {
      productId?: string;
      orderId?: string;
      category?: ProductCategory | 'All Categories';
      voltage?: SystemVoltage | 'ALL';
    }
  ) => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  selectedOrderId: string;
  setSelectedOrderId: (id: string) => void;
  lastPlacedOrderId: string;
  catalogCategoryFilter: ProductCategory | 'All Categories';
  setCatalogCategoryFilter: (c: ProductCategory | 'All Categories') => void;
  catalogVoltageFilter: SystemVoltage | 'ALL';
  setCatalogVoltageFilter: (v: SystemVoltage | 'ALL') => void;
  checkoutQuantity: number;
  setCheckoutQuantity: (q: number) => void;
  trackingPrefillPhone: string;
  setTrackingPrefillPhone: (phone: string) => void;

  products: Product[];
  orders: Order[];
  reviews: ReviewItem[];
  serviceCenters: ServiceCenter[];
  faqs: FaqItem[];
  inquiries: ContactInquiry[];

  isAdminAuthenticated: boolean;
  authLoading: boolean;
  adminEmail: string | null;
  loginWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  logoutAdmin: () => Promise<void>;

  placeOrder: (input: PlaceOrderInput) => Promise<Order>;
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    courierName?: string,
    trackingNumber?: string
  ) => void;
  updateOrderAddress: (orderId: string, address: string, city: string, province: string) => void;
  appendOrderNote: (orderId: string, note: string) => void;

  saveProduct: (product: Product) => void;
  duplicateProduct: (productId: string) => void;
  deleteProduct: (productId: string) => void;
  toggleProductVisibility: (productId: string) => void;

  addReview: (review: Omit<ReviewItem, 'id' | 'createdAt'>) => void;
  updateReview: (review: ReviewItem) => void;
  deleteReview: (reviewId: string) => void;

  saveServiceCenter: (center: ServiceCenter) => void;
  deleteServiceCenter: (centerId: string) => void;

  saveFaq: (faq: FaqItem) => void;
  deleteFaq: (faqId: string) => void;
  moveFaqOrder: (faqId: string, direction: 'up' | 'down') => void;

  submitContactInquiry: (inquiry: Omit<ContactInquiry, 'id' | 'createdAt'>) => void;

  siteSettings: SiteSettings;
  siteSettingsSaving: boolean;
  saveSiteSettings: (next: SiteSettings) => Promise<SiteSettings>;
  resetSiteSettings: () => Promise<SiteSettings>;
  uploadSiteAsset: (file: File, slot: SiteAssetSlot) => Promise<string>;
  postLoginRoute: PageRoute;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function syncBrowserUrl(route: PageRoute, replace = false): void {
  if (typeof window === 'undefined') return;
  const targetPath = routeToPath(route);
  if (window.location.pathname === targetPath && !window.location.hash) return;
  if (replace) {
    window.history.replaceState(null, '', targetPath);
  } else {
    window.history.pushState(null, '', targetPath);
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeData, setStoreData] = useState<StoreDataSnapshot>(() => loadLocalStoreSnapshot());
  const [route, setRoute] = useState<PageRoute>(() =>
    resolveRouteFromLocation(window.location.pathname, window.location.hash)
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(
    storeData.products[0]?.id || 'sc5-va1260'
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    storeData.orders[0]?.id || '#AST-2025-0042'
  );
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string>(
    storeData.orders[0]?.id || '#AST-2025-0042'
  );
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<ProductCategory | 'All Categories'>(
    'All Categories'
  );
  const [catalogVoltageFilter, setCatalogVoltageFilter] = useState<SystemVoltage | 'ALL'>('ALL');
  const [checkoutQuantity, setCheckoutQuantity] = useState<number>(1);
  const [trackingPrefillPhone, setTrackingPrefillPhone] = useState<string>('');

  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(() => Boolean(supabase));

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => loadLocalSiteSettings());
  const [siteSettingsSaving, setSiteSettingsSaving] = useState<boolean>(false);
  const [postLoginRoute, setPostLoginRoute] = useState<PageRoute>(() => {
    const initial = resolveRouteFromLocation(window.location.pathname, window.location.hash);
    return initial.startsWith('admin-') && initial !== 'admin-login' ? initial : 'admin-dashboard';
  });

  const isAdminAuthenticated = Boolean(session);
  const hasSessionRef = React.useRef<boolean>(isAdminAuthenticated);
  hasSessionRef.current = isAdminAuthenticated;

  // Hydrate Supabase Auth session & keep it in sync across refreshes
  useEffect(() => {
    if (!supabase) {
      setSession(null);
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        const activeSession = data.session ?? null;
        setSession(activeSession);
        hasSessionRef.current = Boolean(activeSession);
        setAuthLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        hasSessionRef.current = false;
        setAuthLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession ?? null);
      hasSessionRef.current = Boolean(nextSession);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Enforce /admin/* protection whenever auth finishes loading or route changes
  useEffect(() => {
    if (authLoading) return;
    const guarded = applyAdminAuthGuard(route, isAdminAuthenticated);
    if (guarded.route !== route) {
      if (guarded.postLoginRoute) {
        setPostLoginRoute(guarded.postLoginRoute);
      }
      setRoute(guarded.route);
      syncBrowserUrl(guarded.route, true);
    }
  }, [authLoading, isAdminAuthenticated, route]);

  // Hydrate site settings & store data from Supabase service layer (with clean local fallback)
  useEffect(() => {
    let active = true;
    void fetchSiteSettings().then((loaded) => {
      if (active) setSiteSettings(loaded);
    });
    void fetchStoreDataRemote().then((remote) => {
      if (!active || Object.keys(remote).length === 0) return;
      setStoreData((prev) => ({
        ...prev,
        ...remote,
      }));
    });
    return () => {
      active = false;
    };
  }, []);

  // Admin-only order hydration and live updates. Guest clients never query the orders tables.
  useEffect(() => {
    if (!supabase || !session) return;
    let active = true;
    const refreshOrders = async () => {
      try {
        const remoteOrders = await fetchOrdersRemote();
        if (active) setStoreData((prev) => ({ ...prev, orders: remoteOrders }));
      } catch (error) {
        console.error('Unable to load orders from Supabase:', error);
      }
    };
    void refreshOrders();
    const channel = supabase
      .channel('asatek-admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => void refreshOrders())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => void refreshOrders())
      .subscribe();
    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [session]);

  // Sync dynamic brand CSS theme variables, document title, and favicon
  useEffect(() => {
    const palette = deriveBrandPalette(siteSettings.primary_color);
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--color-primary', palette.primary);
    rootStyle.setProperty('--color-on-primary', palette.onPrimary);
    rootStyle.setProperty('--color-primary-container', palette.primaryContainer);
    rootStyle.setProperty('--color-surface-tint', palette.surfaceTint);
    rootStyle.setProperty('--color-on-primary-fixed-variant', palette.onPrimaryFixedVariant);
    rootStyle.setProperty('--color-primary-fixed', palette.primaryFixed);
    rootStyle.setProperty('--color-primary-fixed-dim', palette.primaryFixedDim);
    rootStyle.setProperty('--color-on-primary-fixed', palette.onPrimaryFixed);

    const siteName = siteSettings.site_name.trim() || 'ASATEK';
    const tagline = siteSettings.tagline.trim();
    document.title = tagline ? `${siteName} — ${tagline}` : siteName;

    let iconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    const faviconUrl = (siteSettings.favicon_url || siteSettings.logo_url || '').trim();
    if (faviconUrl) {
      iconLink.href = faviconUrl;
      if (faviconUrl.endsWith('.svg') || faviconUrl.startsWith('data:image/svg+xml')) {
        iconLink.type = 'image/svg+xml';
      } else {
        iconLink.removeAttribute('type');
      }
    }
  }, [siteSettings]);

  // Persist local fallback snapshot
  useEffect(() => {
    saveLocalStoreSnapshot(storeData);
  }, [storeData]);

  // Sync LTR / RTL direction & lang attribute
  useEffect(() => {
    const isRtl = storeData.language === 'ur' && !route.startsWith('admin-');
    document.documentElement.lang = storeData.language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [storeData.language, route]);

  // Handle browser back/forward and hash changes cleanly
  useEffect(() => {
    const syncFromWindow = () => {
      const resolved = resolveRouteFromLocation(window.location.pathname, window.location.hash);
      if (authLoading) {
        setRoute(resolved);
        return;
      }
      const guarded = applyAdminAuthGuard(resolved, hasSessionRef.current);
      if (guarded.postLoginRoute) {
        setPostLoginRoute(guarded.postLoginRoute);
      }
      setRoute(guarded.route);
      if (guarded.route !== resolved) {
        syncBrowserUrl(guarded.route, true);
      }
    };
    window.addEventListener('popstate', syncFromWindow);
    window.addEventListener('hashchange', syncFromWindow);
    return () => {
      window.removeEventListener('popstate', syncFromWindow);
      window.removeEventListener('hashchange', syncFromWindow);
    };
  }, [authLoading]);

  const navigate: StoreContextValue['navigate'] = (nextRoute, opts) => {
    const guarded = applyAdminAuthGuard(nextRoute, hasSessionRef.current);
    const targetRoute = guarded.route;
    if (guarded.postLoginRoute) {
      setPostLoginRoute(guarded.postLoginRoute);
    }
    if (opts?.productId !== undefined) {
      setSelectedProductId(opts.productId);
    }
    if (opts?.orderId !== undefined) {
      setSelectedOrderId(opts.orderId);
    }
    if (opts?.category !== undefined) {
      setCatalogCategoryFilter(opts.category);
    }
    if (opts?.voltage !== undefined) {
      setCatalogVoltageFilter(opts.voltage);
    }
    setRoute(targetRoute);
    syncBrowserUrl(targetRoute, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setLanguage = (lang: Language) => {
    setStoreData((prev) => ({ ...prev, language: lang }));
  };

  const loginWithPassword: StoreContextValue['loginWithPassword'] = async (email, password) => {
    if (!supabase) {
      return {
        error:
          'Supabase Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.session) {
      return { error: 'Invalid email or password' };
    }

    setSession(data.session);
    hasSessionRef.current = true;
    return { error: null };
  };

  const logoutAdmin = async (): Promise<void> => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Proceed with local session clearance
      }
    }
    setSession(null);
    hasSessionRef.current = false;
    setPostLoginRoute('admin-dashboard');
    setRoute('admin-login');
    syncBrowserUrl('admin-login', false);
  };

  const placeOrder: StoreContextValue['placeOrder'] = async (input) => {
    const product =
      storeData.products.find((p) => p.id === input.productId) || storeData.products[0];
    if (!product) throw new Error('This product is currently unavailable. Please refresh and try again.');
    const totals = calculateOrderTotals(product.price, input.quantity, STANDARD_COD_SHIPPING_PKR);
    const now = new Date().toISOString();
    const orderId = `#AST-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderId,
      customerName: input.customerName.trim(),
      phone: input.phone.trim(),
      whatsapp: input.whatsapp.trim() || input.phone.trim(),
      address: input.address.trim(),
      city: input.city.trim(),
      province: input.province.trim(),
      landmark: input.landmark?.trim(),
      instructions: input.instructions?.trim(),
      productId: product.id,
      productSku: product.sku,
      productName: product.name,
      quantity: totals.quantity,
      unitPrice: product.price,
      shippingFee: totals.shippingFee,
      totalAmount: totals.totalAmount,
      paymentMethod: input.paymentMethod ?? 'COD',
      status: input.status ?? 'Pending',
      courierName: 'Leopards Courier',
      trackingNumber: 'Pending Dispatch',
      serialNumber: `AST-${Date.now().toString().slice(-8)}`,
      expectedDelivery: '2–3 Working Days',
      createdAt: now,
      updatedAt: now,
      history: [{
        status: 'Order Received',
        timestamp: now,
        note: `Order placed (${input.paymentMethod ?? 'COD'}) for ${totals.quantity}× ${product.name}.`,
        actor: input.status ? 'Admin Manual Desk' : 'Storefront Checkout',
      }],
    };

    // Persist first. Do not show a confirmation or mutate local order state on failure.
    await createOrderRemote(newOrder);
    setStoreData((prev) => ({ ...prev, orders: [newOrder, ...prev.orders] }));
    setLastPlacedOrderId(newOrder.id);
    setSelectedOrderId(newOrder.id);
    setTrackingPrefillPhone(newOrder.phone);
    return newOrder;
  };

  const updateOrderStatus: StoreContextValue['updateOrderStatus'] = (
    orderId,
    newStatus,
    note,
    courierName,
    trackingNumber
  ) => {
    const nowStr = new Date().toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    setStoreData((prev) => ({
      ...prev,
      orders: prev.orders.map((order) => {
        if (order.id !== orderId) return order;
        const entryNote =
          note?.trim() ||
          (newStatus === 'Confirmed'
            ? 'Stock allocated & phone verification completed.'
            : newStatus === 'Shipped'
            ? `Dispatched via ${courierName || order.courierName || 'TCS Express'}${
                trackingNumber ? ` (CN: ${trackingNumber})` : ''
              }.`
            : newStatus === 'Delivered'
            ? 'Package delivered and COD settlement recorded.'
            : 'Order cancelled by operations desk.');

        const updatedOrder: Order = {
          ...order,
          status: newStatus,
          courierName: courierName ?? order.courierName,
          trackingNumber: trackingNumber ?? order.trackingNumber,
          updatedAt: `Today, ${nowStr}`,
          history: [
            {
              status: `Status -> ${newStatus}`,
              timestamp: `Today, ${nowStr}`,
              note: entryNote,
              actor: session?.user?.email || 'Admin',
            },
            ...order.history,
          ],
        };
        void updateOrderRemote(orderId, {
          status: updatedOrder.status,
          courierName: updatedOrder.courierName,
          trackingNumber: updatedOrder.trackingNumber,
          history: updatedOrder.history,
        });
        return updatedOrder;
      }),
    }));
  };

  const updateOrderAddress: StoreContextValue['updateOrderAddress'] = (
    orderId,
    address,
    city,
    province
  ) => {
    const nowStr = new Date().toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    setStoreData((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => {
        if (o.id !== orderId) return o;
        const nextHistory = [
          {
            status: 'Address Updated',
            timestamp: `Today, ${nowStr}`,
            note: `Updated destination to ${address}, ${city}, ${province}.`,
            actor: session?.user?.email || 'Admin',
          },
          ...o.history,
        ];
        void updateOrderRemote(orderId, { address, city, province, history: nextHistory });
        return {
          ...o,
          address,
          city,
          province,
          updatedAt: `Today, ${nowStr}`,
          history: nextHistory,
        };
      }),
    }));
  };

  const appendOrderNote: StoreContextValue['appendOrderNote'] = (orderId, note) => {
    if (!note.trim()) return;
    const nowStr = new Date().toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    setStoreData((prev) => ({
      ...prev,
      orders: prev.orders.map((o) => {
        if (o.id !== orderId) return o;
        const nextHistory = [
          {
            status: 'Audit Note',
            timestamp: `Today, ${nowStr}`,
            note: note.trim(),
            actor: session?.user?.email || 'Admin',
          },
          ...o.history,
        ];
        void updateOrderRemote(orderId, { history: nextHistory });
        return {
          ...o,
          updatedAt: `Today, ${nowStr}`,
          history: nextHistory,
        };
      }),
    }));
  };

  const saveProduct = (product: Product) => {
    setStoreData((prev) => {
      const exists = prev.products.some((p) => p.id === product.id);
      return {
        ...prev,
        products: exists
          ? prev.products.map((p) => (p.id === product.id ? product : p))
          : [product, ...prev.products],
      };
    });
    void upsertProductRemote(product);
  };

  const duplicateProduct = (productId: string) => {
    setStoreData((prev) => {
      const found = prev.products.find((p) => p.id === productId);
      if (!found) return prev;
      const copy: Product = {
        ...found,
        id: `${found.id}-copy-${Date.now().toString().slice(-4)}`,
        sku: `${found.sku}-COPY`,
        name: `${found.name} (Copy)`,
        isPublicVisible: false,
      };
      void upsertProductRemote(copy);
      return { ...prev, products: [copy, ...prev.products] };
    });
  };

  const deleteProduct = (productId: string) => {
    setStoreData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }));
    void deleteProductRemote(productId);
  };

  const toggleProductVisibility = (productId: string) => {
    setStoreData((prev) => ({
      ...prev,
      products: prev.products.map((p) => {
        if (p.id !== productId) return p;
        const updated = { ...p, isPublicVisible: !p.isPublicVisible };
        void upsertProductRemote(updated);
        return updated;
      }),
    }));
  };

  const addReview: StoreContextValue['addReview'] = (review) => {
    const newItem: ReviewItem = {
      ...review,
      id: `rev-${Date.now().toString().slice(-5)}`,
      createdAt: 'Just now',
    };
    setStoreData((prev) => ({ ...prev, reviews: [newItem, ...prev.reviews] }));
    void upsertReviewRemote(newItem);
  };

  const updateReview = (review: ReviewItem) => {
    setStoreData((prev) => ({
      ...prev,
      reviews: prev.reviews.map((r) => (r.id === review.id ? review : r)),
    }));
    void upsertReviewRemote(review);
  };

  const deleteReview = (reviewId: string) => {
    setStoreData((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((r) => r.id !== reviewId),
    }));
    void deleteReviewRemote(reviewId);
  };

  const saveServiceCenter = (center: ServiceCenter) => {
    setStoreData((prev) => {
      const exists = prev.serviceCenters.some((c) => c.id === center.id);
      return {
        ...prev,
        serviceCenters: exists
          ? prev.serviceCenters.map((c) => (c.id === center.id ? center : c))
          : [center, ...prev.serviceCenters],
      };
    });
    void upsertServiceCenterRemote(center);
  };

  const deleteServiceCenter = (centerId: string) => {
    setStoreData((prev) => ({
      ...prev,
      serviceCenters: prev.serviceCenters.filter((c) => c.id !== centerId),
    }));
    void deleteServiceCenterRemote(centerId);
  };

  const saveFaq = (faq: FaqItem) => {
    setStoreData((prev) => {
      const exists = prev.faqs.some((f) => f.id === faq.id);
      const nextList = exists
        ? prev.faqs.map((f) => (f.id === faq.id ? faq : f))
        : [...prev.faqs, faq];
      return {
        ...prev,
        faqs: nextList.sort((a, b) => a.orderIndex - b.orderIndex),
      };
    });
    void upsertFaqRemote(faq);
  };

  const deleteFaq = (faqId: string) => {
    setStoreData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((f) => f.id !== faqId),
    }));
    void deleteFaqRemote(faqId);
  };

  const moveFaqOrder = (faqId: string, direction: 'up' | 'down') => {
    setStoreData((prev) => {
      const sorted = [...prev.faqs].sort((a, b) => a.orderIndex - b.orderIndex);
      const idx = sorted.findIndex((f) => f.id === faqId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sorted.length) return prev;
      const swapped = [...sorted];
      const temp = swapped[idx];
      swapped[idx] = swapped[targetIdx];
      swapped[targetIdx] = temp;
      const reindexed = swapped.map((f, i) => {
        const updated = { ...f, orderIndex: i + 1 };
        void upsertFaqRemote(updated);
        return updated;
      });
      return { ...prev, faqs: reindexed };
    });
  };

  const submitContactInquiry: StoreContextValue['submitContactInquiry'] = (inquiry) => {
    const entry: ContactInquiry = {
      ...inquiry,
      id: `INQ-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toLocaleString('en-PK'),
    };
    setStoreData((prev) => ({ ...prev, inquiries: [entry, ...prev.inquiries] }));
  };

  const saveSiteSettings = async (next: SiteSettings): Promise<SiteSettings> => {
    setSiteSettingsSaving(true);
    try {
      const saved = await saveSiteSettingsRemoteOrLocal(next);
      setSiteSettings(saved);
      return saved;
    } finally {
      setSiteSettingsSaving(false);
    }
  };

  const resetSiteSettings = async (): Promise<SiteSettings> => {
    setSiteSettingsSaving(true);
    try {
      const reset = await resetSiteSettingsRemoteOrLocal();
      setSiteSettings(reset);
      return reset;
    } finally {
      setSiteSettingsSaving(false);
    }
  };

  const uploadSiteAsset = async (file: File, slot: SiteAssetSlot): Promise<string> => {
    return uploadSiteAssetService(file, slot);
  };

  return (
    <StoreContext.Provider
      value={{
        language: storeData.language,
        setLanguage,
        route,
        navigate,
        selectedProductId,
        setSelectedProductId,
        selectedOrderId,
        setSelectedOrderId,
        lastPlacedOrderId,
        catalogCategoryFilter,
        setCatalogCategoryFilter,
        catalogVoltageFilter,
        setCatalogVoltageFilter,
        checkoutQuantity,
        setCheckoutQuantity,
        trackingPrefillPhone,
        setTrackingPrefillPhone,
        products: storeData.products,
        orders: storeData.orders,
        reviews: storeData.reviews,
        serviceCenters: storeData.serviceCenters,
        faqs: storeData.faqs,
        inquiries: storeData.inquiries,
        isAdminAuthenticated,
        authLoading,
        adminEmail: session?.user?.email ?? null,
        loginWithPassword,
        logoutAdmin,
        placeOrder,
        updateOrderStatus,
        updateOrderAddress,
        appendOrderNote,
        saveProduct,
        duplicateProduct,
        deleteProduct,
        toggleProductVisibility,
        addReview,
        updateReview,
        deleteReview,
        saveServiceCenter,
        deleteServiceCenter,
        saveFaq,
        deleteFaq,
        moveFaqOrder,
        submitContactInquiry,
        siteSettings,
        siteSettingsSaving,
        saveSiteSettings,
        resetSiteSettings,
        uploadSiteAsset,
        postLoginRoute,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
