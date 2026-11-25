import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { OrderStatus } from '../../types/asatek';
import { buildWhatsAppUrl, computeOrderStats, formatPkr } from '../../utils/storeLogic';

export const AdminDashboardPage: React.FC = () => {
  const { orders, products, serviceCenters, siteSettings, navigate, setSelectedOrderId, setSelectedProductId } =
    useStore();
  const [statusTab, setStatusTab] = useState<'all' | OrderStatus>('all');
  const [syncMessage, setSyncMessage] = useState('Just now');

  const stats = useMemo(() => computeOrderStats(orders), [orders]);

  const filteredOrders = useMemo(() => {
    if (statusTab === 'all') return orders;
    return orders.filter((o) => o.status === statusTab);
  }, [orders, statusTab]);

  const handleExportCsv = () => {
    const headers = ['OrderID', 'Customer', 'Phone', 'City', 'Province', 'Product', 'Qty', 'TotalPKR', 'Payment', 'Status'];
    const rows = orders.map((o) => [
      o.id,
      `"${o.customerName}"`,
      o.phone,
      `"${o.city}"`,
      `"${o.province}"`,
      `"${o.productName}"`,
      o.quantity,
      o.totalAmount,
      o.paymentMethod,
      o.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ASATEK_COD_Manifest_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const velocityBars = [
    { label: '01-05', height: 42 },
    { label: '06-10', height: 58 },
    { label: '11-15', height: 75 },
    { label: '16-20', height: 64 },
    { label: '21-25', height: 92 },
    { label: '26-30', height: 80 },
  ];

  const regionalStats = useMemo(() => {
    const total = Math.max(1, orders.length);
    const countProv = (keyword: string) =>
      orders.filter((o) => o.province.toLowerCase().includes(keyword)).length;
    const punjab = countProv('punjab');
    const sindh = countProv('sindh');
    const kpk = countProv('kpk') + countProv('khyber');
    const other = Math.max(0, total - punjab - sindh - kpk);
    return [
      { label: 'Punjab (Lahore, RWP, Multan)', count: punjab, pct: Math.round((punjab / total) * 100), color: 'bg-primary' },
      { label: 'Sindh (Karachi, Larkana, Sanghar)', count: sindh, pct: Math.round((sindh / total) * 100), color: 'bg-secondary' },
      { label: 'Khyber Pakhtunkhwa (Peshawar, Mardan)', count: kpk, pct: Math.round((kpk / total) * 100), color: 'bg-tertiary' },
      { label: 'Balochistan & ICT', count: other, pct: Math.round((other / total) * 100), color: 'bg-on-surface-variant' },
    ];
  }, [orders]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Header matching Stitch code_df31525f.html */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-extrabold text-on-surface">Operations Dashboard</h1>
          <p className="text-body-sm text-on-surface-variant">
            Real-time dispatch overview, nationwide sales telemetry, and pending customer orders across Pakistan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSyncMessage(new Date().toLocaleTimeString('en-PK'))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low border border-surface-container font-spec-code text-xs text-on-surface"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">sync</span>
            <span>Synced: {syncMessage}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedProductId('');
              navigate('admin-product-form', { productId: '' });
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant text-primary hover:bg-surface-container-low text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[17px]">add_circle</span>
            <span>Quick Add Product</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-secondary text-on-primary text-xs font-bold shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px]">sim_card_download</span>
            <span>Export Daily COD Manifest</span>
          </button>
        </div>
      </div>

      {/* 4 Live KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="rounded-xl bg-surface-container-lowest border border-surface-container p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-uppercase text-on-surface-variant block">Total Orders</span>
              <span className="text-headline-lg font-extrabold text-on-surface tabular-nums mt-1 block">
                {stats.totalOrders}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]">inventory</span>
            </div>
          </div>
          <div className="mt-3 text-xs font-spec-code text-on-surface-variant">
            {formatPkr(stats.grossRevenue)} Active Volume
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest border border-surface-container p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-uppercase text-on-surface-variant block">Pending Confirmation</span>
              <span className="text-headline-lg font-extrabold text-secondary tabular-nums mt-1 block">
                {stats.pendingOrders}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[22px]">contact_phone</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-secondary font-semibold">Requires WhatsApp verification call</div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest border border-surface-container p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-uppercase text-on-surface-variant block">Confirmed</span>
              <span className="text-headline-lg font-extrabold text-tertiary tabular-nums mt-1 block">
                {stats.confirmedOrShipped}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[22px]">local_shipping</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-on-surface-variant">Via TCS, Leopards &amp; Trax Express</div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest border border-surface-container p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-uppercase text-on-surface-variant block">Skipped</span>
              <span className="text-headline-lg font-extrabold text-slate-600 tabular-nums mt-1 block">{stats.skippedOrders}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <span className="material-symbols-outlined text-[22px]">pause_circle</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-on-surface-variant">Orders on hold</div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest border border-surface-container p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-label-uppercase text-on-surface-variant block">Cancelled</span>
              <span className="text-headline-lg font-extrabold text-error tabular-nums mt-1 block">
                {stats.cancelledOrders}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[22px]">assignment_return</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-on-surface-variant">
            {serviceCenters.filter((c) => c.active).length} Service Centers Active
          </div>
        </div>
      </div>

      {/* Charts + Regional Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-container gap-2">
            <div>
              <h2 className="text-headline-sm font-bold text-on-surface">Revenue &amp; Dispatch Volume Velocity</h2>
              <p className="text-xs text-on-surface-variant">30-day nationwide commercial and residential hardware orders</p>
            </div>
            <span className="font-spec-code text-xs font-bold text-primary bg-surface-container-low px-2.5 py-1 rounded">
              +18.4% MoM
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 py-4 px-2">
            {velocityBars.map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-full max-w-[34px] bg-primary/20 rounded-t flex flex-col justify-end"
                  style={{ height: `${bar.height}%` }}
                >
                  <div className="w-full bg-primary rounded-t" style={{ height: '74%' }} />
                </div>
                <span className="font-spec-code text-[11px] text-on-surface-variant">{bar.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-surface-container text-xs">
            <div className="p-2.5 rounded bg-surface-container-low">
              <span className="text-on-surface-variant block">Active Volume</span>
              <strong className="font-spec-code text-on-surface">{formatPkr(stats.grossRevenue)}</strong>
            </div>
            <div className="p-2.5 rounded bg-surface-container-low">
              <span className="text-on-surface-variant block">COD Pipeline</span>
              <strong className="font-spec-code text-primary">{formatPkr(stats.codRevenue)}</strong>
            </div>
            <div className="p-2.5 rounded bg-surface-container-low">
              <span className="text-on-surface-variant block">Prepaid Bank</span>
              <strong className="font-spec-code text-tertiary">{formatPkr(stats.prepaidRevenue)}</strong>
            </div>
            <div className="p-2.5 rounded bg-surface-container-low">
              <span className="text-on-surface-variant block">Live Products</span>
              <strong className="font-spec-code text-on-surface">
                {products.filter((p) => p.isPublicVisible).length} / {products.length}
              </strong>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-5">
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-on-surface">Order Lifecycle</h2>
              <span className="font-spec-code text-xs text-on-surface-variant">{stats.totalOrders} Total</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-surface-container-high"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4.2"
                  />
                  <path
                    className="text-tertiary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${Math.round((stats.confirmedOrShipped / Math.max(1, stats.totalOrders)) * 100)}, 100`}
                    strokeWidth="4.2"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-spec-code text-sm font-bold text-on-surface tabular-nums">
                    {Math.round((stats.confirmedOrShipped / Math.max(1, stats.totalOrders)) * 100)}%
                  </span>
                  <span className="text-[10px] text-on-surface-variant">Fulfilled</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-xs font-spec-code flex-1">
                <div className="flex justify-between">
                  <span>Pending</span>
                  <strong className="text-secondary">{stats.pendingOrders}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Confirmed</span>
                  <strong className="text-tertiary">{stats.confirmedOrShipped}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Cancelled</span>
                  <strong className="text-error">{stats.cancelledOrders}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm">
            <h2 className="text-base font-bold text-on-surface mb-3">Regional Telemetry</h2>
            <div className="flex flex-col gap-2.5">
              {regionalStats.map((reg) => (
                <div key={reg.label} className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-on-surface">{reg.label}</span>
                    <strong className="font-spec-code">{reg.pct}% ({reg.count})</strong>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
                    <div className={`h-full ${reg.color}`} style={{ width: `${reg.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Customer Orders Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">Recent Customer Orders</h2>
            <p className="text-xs text-on-surface-variant">Live orders from ASATEK E-store &amp; WhatsApp COD direct</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('admin-orders')}
            className="text-xs font-bold text-primary hover:underline self-start sm:self-auto"
          >
            View All Orders →
          </button>
        </div>

        <div className="px-5 py-3 bg-surface-container-low/50 flex flex-wrap items-center gap-1.5 border-b border-surface-container">
          {(['all', 'Pending', 'Confirmed', 'Skipped', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                statusTab === tab
                  ? 'bg-surface-container-lowest text-primary shadow-sm border border-surface-container'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab === 'all' ? `All (${orders.length})` : tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-container-low text-xs font-semibold uppercase text-on-surface-variant border-b border-surface-container">
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Customer &amp; City</th>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/60 transition-colors">
                  <td className="py-3 px-4 font-spec-code font-bold text-on-surface">
                    {order.id}
                    <div className="text-[11px] font-normal text-on-surface-variant">{order.paymentMethod}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-on-surface">{order.customerName}</div>
                    <div className="font-spec-code text-xs text-on-surface-variant">
                      {order.city}, {order.province}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-on-surface">{order.productName}</div>
                    <div className="font-spec-code text-xs text-on-surface-variant">Qty: {order.quantity}</div>
                  </td>
                  <td className="py-3 px-4 font-spec-code font-bold text-on-surface whitespace-nowrap">
                    {formatPkr(order.totalAmount)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        order.status === 'Pending'
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : order.status === 'Confirmed'
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : order.status === 'Skipped'
                          ? 'bg-slate-100 text-slate-700'
                          : order.status === 'Cancelled'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-tertiary-fixed text-on-tertiary-fixed'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        navigate('admin-order-detail', { orderId: order.id });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-secondary text-on-primary text-xs font-semibold"
                    >
                      View &amp; Process
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Dispatch Outreach Strip */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-on-surface">WhatsApp Dispatch Outreach Queue</h3>
          <p className="text-xs text-on-surface-variant">
            {stats.pendingOrders} pending order(s) awaiting customer call/WhatsApp address confirmation before TCS booking.
          </p>
        </div>
        <a
          href={buildWhatsAppUrl(
            `${siteSettings.site_name} Dispatch Queue Check — Lahore Plant 2`,
            siteSettings.whatsapp_number
          )}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2.5 rounded-lg bg-[#28A745] text-white text-xs font-bold flex items-center gap-2 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[17px]">chat</span>
          <span>Launch WhatsApp Outreach</span>
        </a>
      </div>
    </div>
  );
};
