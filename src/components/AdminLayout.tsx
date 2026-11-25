import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import type { PageRoute } from '../types/asatek';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    route,
    navigate,
    orders,
    products,
    siteSettings,
    adminEmail,
    logoutAdmin,
    setSelectedOrderId,
    setSelectedProductId,
  } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === 'Pending').length,
    [orders]
  );

  const navItems: { route: PageRoute; icon: string; label: string; badge?: number }[] = [
    { route: 'admin-dashboard', icon: 'dashboard', label: 'Dashboard' },
    { route: 'admin-orders', icon: 'shopping_bag', label: 'Orders', badge: pendingCount },
    { route: 'admin-products', icon: 'inventory_2', label: 'Products' },
    { route: 'admin-reviews', icon: 'rate_review', label: 'Reviews' },
    { route: 'admin-service-centers', icon: 'home_repair_service', label: 'Service Centers' },
    { route: 'admin-faq', icon: 'help_center', label: 'FAQ' },
    { route: 'admin-settings', icon: 'settings', label: 'Site Settings' },
  ];

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = globalSearch.trim().toLowerCase();
    if (!q) return;

    const matchedOrder = orders.find(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q)
    );
    if (matchedOrder) {
      setSelectedOrderId(matchedOrder.id);
      navigate('admin-order-detail', { orderId: matchedOrder.id });
      return;
    }

    const matchedProduct = products.find(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
    if (matchedProduct) {
      setSelectedProductId(matchedProduct.id);
      navigate('admin-product-form', { productId: matchedProduct.id });
      return;
    }

    navigate('admin-orders');
  };

  const isNavActive = (itemRoute: PageRoute) => {
    if (itemRoute === 'admin-orders' && route === 'admin-order-detail') return true;
    if (itemRoute === 'admin-products' && route === 'admin-product-form') return true;
    return route === itemRoute;
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col">
        <div className="h-[72px] px-5 py-3 flex items-center gap-2.5 border-b border-surface-container">
          <img
            src={siteSettings.logo_url}
            alt={`${siteSettings.site_name} Logo`}
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-lg object-contain bg-white border border-surface-container shrink-0"
          />
          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-extrabold text-primary tracking-tight truncate">
                {siteSettings.site_name}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-semibold uppercase tracking-wider shrink-0">
                PK
              </span>
            </div>
            <span className="text-[11px] font-semibold uppercase text-on-surface-variant tracking-wider">
              Admin Portal
            </span>
          </div>
        </div>

        <nav aria-label="Admin Sidebar" className="flex flex-col gap-1 px-3 mt-4">
          {navItems.map((item) => {
            const active = isNavActive(item.route);
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => {
                  navigate(item.route);
                  setSidebarOpen(false);
                }}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  active
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                      active ? 'bg-white text-primary' : 'bg-secondary text-on-secondary'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 m-3 rounded-lg bg-surface-container-low border border-surface-container">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-on-surface truncate">Administrator</span>
            <span className="text-[11px] font-spec-code text-on-surface-variant truncate">
              {adminEmail || 'Authenticated Session'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logoutAdmin()}
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-md bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface text-on-surface" dir="ltr">
      {/* Fixed Left Desktop Sidebar matching Stitch code_df31525f.html */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-40 border-r border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-surface-container-lowest h-full shadow-2xl border-r border-surface-container">
            {sidebarContent}
          </div>
          <button
            type="button"
            aria-label="Close Sidebar"
            onClick={() => setSidebarOpen(false)}
            className="flex-1 bg-black/40"
          />
        </div>
      )}

      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 h-[72px] bg-surface-container-lowest/95 backdrop-blur-md z-30 border-b border-surface-container shadow-[0_1px_8px_rgba(0,0,0,0.04)] px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-4 no-print">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 lg:flex-initial">
            <button
              type="button"
              aria-label="Open Sidebar"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-surface-container-low text-on-surface shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 text-body-sm text-on-surface-variant min-w-0">
              <span className="material-symbols-outlined text-[18px] shrink-0">home</span>
              <span className="shrink-0">/</span>
              <span className="text-on-surface font-semibold truncate">
                {siteSettings.site_name} Management
              </span>
            </div>
          </div>

          <form onSubmit={handleGlobalSearchSubmit} className="hidden md:block flex-1 max-w-md">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                search
              </span>
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search #AST order, phone, or SKU..."
                aria-label="Global Admin Search"
                className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-surface-container-low border border-surface-container text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden xl:flex items-center gap-1.5 text-spec-code text-on-surface-variant bg-surface-container-low px-2.5 py-1 rounded">
              <span className="material-symbols-outlined text-[16px] text-tertiary-container">schedule</span>
              <span>PKT (UTC+5)</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-outline-variant text-primary hover:bg-primary-fixed text-xs font-semibold whitespace-nowrap transition-colors"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span className="hidden sm:inline">View Live Website</span>
              <span className="sm:hidden">Live Site</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
