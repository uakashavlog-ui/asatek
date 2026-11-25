import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { buildWhatsAppUrl, formatPkr } from '../../utils/storeLogic';

const statusClass = (status: string) => {
  switch (status) {
    case 'Pending': return 'bg-amber-100 text-amber-800';
    case 'Confirmed': return 'bg-red-100 text-red-800';
    case 'Skipped': return 'bg-slate-100 text-slate-700';
    case 'Cancelled': return 'bg-rose-100 text-rose-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const statusMessage = (status: string) => {
  switch (status) {
    case 'Confirmed': return 'confirmed';
    case 'Skipped': return 'on hold';
    case 'Cancelled': return 'cancelled';
    default: return 'pending';
  }
};

export const AdminOrderDetailPage: React.FC = () => {
  const { orders, selectedOrderId, updateOrderStatus, navigate } = useStore();
  const order = orders.find((item) => item.id === selectedOrderId);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  if (!order) return <div className="p-6"><button onClick={() => navigate('admin-orders')} className="text-sm font-bold text-primary hover:underline">← Back to Orders</button><p className="mt-4 text-sm text-on-surface-variant">Order not found.</p></div>;

  const date = new Date(order.createdAt);
  const readableDate = Number.isNaN(date.getTime()) ? order.createdAt : date.toLocaleString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  const whatsappNumber = order.whatsapp?.trim() || order.phone;
  const message = `Assalam o Alaikum ${order.customerName}, your ASATEK order ${order.orderNumber || order.id} for ${order.productName} x ${order.quantity} is ${statusMessage(order.status)}. Thank you!`;
  const statusOptions = ['Pending', 'Confirmed', 'Skipped', 'Cancelled'] as const;

  const changeStatus = async (nextStatus: typeof statusOptions[number]) => {
    if (saving || order.status === nextStatus) return;
    if (nextStatus === 'Cancelled' && !window.confirm('Are you sure you want to cancel this order?')) return;
    setSaving(true);
    setToast('');
    try {
      await updateOrderStatus(order.id, nextStatus);
      setToast(`Order status updated to ${nextStatus}.`);
    } catch (error) {
      setToast(error instanceof Error ? error.message : 'Could not update order status.');
    } finally {
      setSaving(false);
    }
  };

  const Detail = ({ label, value }: { label: string; value?: string }) => (
    <div><dt className="text-xs text-on-surface-variant">{label}</dt><dd className="mt-0.5 text-sm font-semibold text-on-surface break-words">{value?.trim() || '—'}</dd></div>
  );

  return (
    <div className="flex flex-col gap-5">
      <button type="button" onClick={() => navigate('admin-orders')} className="self-start text-sm font-bold text-primary hover:underline">← Back to Orders</button>
      <section className="rounded-xl border border-surface-container bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-extrabold text-on-surface">{order.orderNumber || order.id}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(order.status)}`}>{order.status}</span>
        </div>
        <p className="mt-2 text-sm text-on-surface-variant">{readableDate}</p>
      </section>

      <section className="rounded-xl border border-surface-container bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-on-surface">Customer Details</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Name" value={order.customerName} />
          <Detail label="Phone" value={order.phone} />
          <Detail label="WhatsApp" value={order.whatsapp || order.phone} />
          <Detail label="Full Address" value={order.address} />
          <Detail label="City" value={order.city} />
          <Detail label="Province" value={order.province} />
          <Detail label="Country" value={order.country || 'Pakistan'} />
          <Detail label="ZIP Code" value={order.zipCode} />
          <Detail label="Location / Landmark" value={[order.location, order.landmark].filter(Boolean).join(' · ')} />
        </dl>
      </section>

      <section className="rounded-xl border border-surface-container bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-bold text-on-surface">Order Items</h2>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-container pb-3">
          <div><p className="text-sm font-semibold text-on-surface">{order.productName}</p><p className="text-xs text-on-surface-variant">Quantity: {order.quantity}</p></div>
          <p className="text-sm font-semibold">{formatPkr(order.unitPrice * order.quantity)}</p>
        </div>
        <div className="mt-3 flex justify-between text-sm"><span className="text-on-surface-variant">Delivery charges</span><span>{formatPkr(order.shippingFee)}</span></div>
        <div className="mt-3 flex justify-between border-t border-surface-container pt-3 text-base font-extrabold"><span>Total</span><span className="text-primary">{formatPkr(order.totalAmount)}</span></div>
      </section>

      <section className="rounded-xl border border-red-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-bold text-on-surface">Order Status</h2>
        <div className="mb-4 flex flex-wrap items-center gap-2"><span className="text-sm text-on-surface-variant">Current status:</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(order.status)}`}>{order.status}</span></div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => <button key={status} type="button" disabled={saving || order.status === status} onClick={() => void changeStatus(status)} className={`rounded-lg border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${order.status === status ? 'border-red-700 bg-red-700 text-white' : 'border-red-200 bg-white text-red-800 hover:bg-red-50'}`}>{status}</button>)}
        </div>
        {toast && <p role="status" className={`mt-3 text-sm font-semibold ${toast.startsWith('Could not') ? 'text-red-700' : 'text-green-700'}`}>{toast}</p>}
      </section>

      <div className="flex flex-wrap gap-3">
        <a href={buildWhatsAppUrl(message, whatsappNumber)} target="_blank" rel="noreferrer" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#28A745] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#218838]"><span className="material-symbols-outlined">chat</span>WhatsApp Customer</a>
        <a href={`tel:${order.phone}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-800"><span className="material-symbols-outlined">call</span>Call</a>
      </div>
    </div>
  );
};
