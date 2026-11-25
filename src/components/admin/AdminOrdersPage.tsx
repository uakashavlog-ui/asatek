import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { OrderStatus } from '../../types/asatek';
import { buildWhatsAppUrl, computeOrderStats, formatPkr } from '../../utils/storeLogic';

export const AdminOrdersPage: React.FC = () => {
  const { orders, products, placeOrder, updateOrderStatus, navigate, setSelectedOrderId } = useStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [provinceFilter, setProvinceFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualForm, setManualForm] = useState({
    productId: products[0]?.id || 'sc5-va1260',
    quantity: 1,
    customerName: '',
    phone: '',
    address: '',
    city: '',
    province: 'Punjab',
    paymentMethod: 'COD' as 'COD' | 'Bank Transfer',
  });

  const stats = useMemo(() => computeOrderStats(orders), [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      if (provinceFilter !== 'All' && !o.province.toLowerCase().includes(provinceFilter.toLowerCase())) {
        return false;
      }
      if (q) {
        const hay = `${o.id} ${o.customerName} ${o.phone} ${o.city} ${o.productName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter, provinceFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBulkConfirm = () => {
    for (const id of selectedIds) {
      updateOrderStatus(id, 'Confirmed', 'Batch verified from Orders queue.');
    }
    setSelectedIds([]);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.customerName.trim() || !manualForm.phone.trim() || !manualForm.city.trim()) return;
    try {
      await placeOrder({
        ...manualForm,
        whatsapp: manualForm.phone,
        address: manualForm.address || `${manualForm.city} Direct Phone Booking`,
        status: 'Confirmed',
      });
      setManualError(null);
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Could not save this order.');
      return;
    }
    setManualModalOpen(false);
    setManualForm({
      productId: products[0]?.id || 'sc5-va1260',
      quantity: 1,
      customerName: '',
      phone: '',
      address: '',
      city: '',
      province: 'Punjab',
      paymentMethod: 'COD',
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-extrabold text-on-surface">Orders Management</h1>
          <p className="text-body-sm text-on-surface-variant">
            Verify COD phone bookings, assign courier airway bills, and manage nationwide dispatches.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setManualError(null); setManualModalOpen(true); }}
          className="px-4 py-2.5 rounded-lg bg-primary hover:bg-secondary text-on-primary text-xs font-bold flex items-center gap-1.5 self-start"
        >
          <span className="material-symbols-outlined text-[18px]">add_call</span>
          <span>+ Create Manual Phone Order</span>
        </button>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
          <span className="text-xs text-on-surface-variant block">Total Queue</span>
          <strong className="text-2xl font-extrabold tabular-nums">{stats.totalOrders}</strong>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
          <span className="text-xs text-secondary font-semibold block">Pending Verification</span>
          <strong className="text-2xl font-extrabold text-secondary tabular-nums">{stats.pendingOrders}</strong>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
          <span className="text-xs text-tertiary font-semibold block">Confirmed</span>
          <strong className="text-2xl font-extrabold text-tertiary tabular-nums">{stats.confirmedOrShipped}</strong>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
          <span className="text-xs text-on-surface-variant block">Pipeline Value</span>
          <strong className="text-2xl font-extrabold font-spec-code text-primary tabular-nums">
            {formatPkr(stats.grossRevenue)}
          </strong>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by #AST order ID, customer name, 03XX phone, or city..."
            aria-label="Search Admin Orders"
            className="flex-1 rounded-lg border border-outline-variant px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            aria-label="Filter by province"
            className="rounded-lg border border-outline-variant px-3 py-2 text-sm bg-surface-container-lowest"
          >
            <option value="All">All Provinces</option>
            <option value="Punjab">Punjab</option>
            <option value="Sindh">Sindh</option>
            <option value="KPK">KPK</option>
            <option value="Balochistan">Balochistan</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('All');
              setProvinceFilter('All');
            }}
            className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold hover:bg-surface-container-low"
          >
            Reset Filters
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(['All', 'Pending', 'Confirmed', 'Skipped', 'Cancelled'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  statusFilter === st
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkConfirm}
              className="px-3.5 py-1.5 rounded-lg bg-tertiary text-on-tertiary text-xs font-bold"
            >
              Confirm Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-container-low text-xs font-semibold uppercase text-on-surface-variant border-b border-surface-container">
                <th className="py-3 px-3 w-10">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer &amp; Phone</th>
                <th className="py-3 px-4">City / Province</th>
                <th className="py-3 px-4">Hardware</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/60">
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      aria-label={`Select order ${order.id}`}
                      checked={selectedIds.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                      className="accent-[#9e0000]"
                    />
                  </td>
                  <td className="py-3 px-4 font-spec-code font-bold text-primary">{order.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-on-surface">{order.customerName}</div>
                    <div className="font-spec-code text-xs text-on-surface-variant">{order.phone}</div>
                    <a href={buildWhatsAppUrl(`Assalam o Alaikum ${order.customerName}, your ASATEK order ${order.orderNumber || order.id} for ${order.productName} x ${order.quantity} is ${order.status === 'Confirmed' ? 'confirmed' : order.status === 'Skipped' ? 'on hold' : order.status === 'Cancelled' ? 'cancelled' : 'pending'}. Thank you!`, order.whatsapp || order.phone)} target="_blank" rel="noreferrer" className="mt-1 inline-flex rounded-md bg-[#28A745] px-2 py-1 text-[11px] font-bold text-white">WhatsApp</a>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <div className="font-semibold text-on-surface">{order.city}</div>
                    <div className="text-on-surface-variant">{order.province}</div>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <div className="font-semibold text-on-surface">{order.productName}</div>
                    <div className="font-spec-code text-on-surface-variant">Qty: {order.quantity}</div>
                  </td>
                  <td className="py-3 px-4 font-spec-code font-bold whitespace-nowrap">
                    {formatPkr(order.totalAmount)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
                      className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Manual Phone Order Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest border border-surface-container p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-on-surface">Create Manual Phone / WhatsApp Order</h2>
              <button type="button" onClick={() => setManualModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {manualError && <p role="alert" className="text-xs text-error font-semibold">{manualError}</p>}
          <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
              <select
                value={manualForm.productId}
                onChange={(e) => setManualForm({ ...manualForm, productId: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatPkr(p.price)})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={manualForm.quantity}
                onChange={(e) => setManualForm({ ...manualForm, quantity: Math.max(1, Number(e.target.value)) })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
              />
              <input
                required
                type="text"
                placeholder="Customer Full Name"
                value={manualForm.customerName}
                onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <input
                required
                type="tel"
                placeholder="Mobile Number (03XX-XXXXXXX)"
                value={manualForm.phone}
                onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
              />
              <input
                required
                type="text"
                placeholder="City"
                value={manualForm.city}
                onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Street Address"
                value={manualForm.address}
                onChange={(e) => setManualForm({ ...manualForm, address: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <button type="submit" className="mt-1 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-bold">
                Save Confirmed Order
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
