import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { buildWhatsAppUrl, formatPkr } from '../../utils/storeLogic';
import { ConfirmDialog } from '../modals/ConfirmDialog';

export const AdminOrderDetailPage: React.FC = () => {
  const {
    orders,
    selectedOrderId,
    updateOrderStatus,
    updateOrderAddress,
    appendOrderNote,
    navigate,
  } = useStore();

  const order = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const [courierInput, setCourierInput] = useState(order?.courierName || 'Leopards Courier');
  const [trackingInput, setTrackingInput] = useState(order?.trackingNumber || '');
  const [noteInput, setNoteInput] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [editAddrOpen, setEditAddrOpen] = useState(false);
  const [addrForm, setAddrForm] = useState({
    address: order?.address || '',
    city: order?.city || '',
    province: order?.province || '',
  });

  if (!order) return null;

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.address.trim() || !addrForm.city.trim()) return;
    updateOrderAddress(order.id, addrForm.address, addrForm.city, addrForm.province);
    setEditAddrOpen(false);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    appendOrderNote(order.id, noteInput);
    setNoteInput('');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('admin-orders')}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>← Back to Orders Queue</span>
        </button>

        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs font-semibold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Dispatch Slip</span>
          </button>
        </div>
      </div>

      {/* Order Header Card matching Stitch code_bc3890b0.html */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h1 className="text-headline-md font-extrabold font-spec-code text-on-surface">{order.id}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.status === 'Pending'
                  ? 'bg-secondary-fixed text-on-secondary-fixed'
                  : order.status === 'Confirmed'
                  ? 'bg-primary-fixed text-on-primary-fixed'
                  : order.status === 'Cancelled'
                  ? 'bg-error-container text-on-error-container'
                  : 'bg-tertiary-fixed text-on-tertiary-fixed'
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant font-spec-code">
            Created: {order.createdAt} · Updated: {order.updatedAt} · Payment: {order.paymentMethod}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 no-print">
          <a
            href={buildWhatsAppUrl(
              `Assalam-o-Alaikum ${order.customerName}, regarding your ASATEK order ${order.id} (${order.productName}, ${formatPkr(order.totalAmount)}).`,
              order.whatsapp
            )}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-[#28A745] text-white text-xs font-bold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>WhatsApp Customer</span>
          </a>
          <a
            href={`tel:${order.phone}`}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs font-bold flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">call</span>
            <span>Call {order.phone}</span>
          </a>
        </div>
      </div>

      {/* Dispatch Operation Protocol Controls */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm no-print">
        <h2 className="text-base font-bold text-on-surface mb-3">Dispatch Operation Protocol</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label htmlFor="detail-courier" className="text-xs font-semibold text-on-surface-variant block mb-1">
              Courier Partner
            </label>
            <select
              id="detail-courier"
              value={courierInput}
              onChange={(e) => setCourierInput(e.target.value)}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold"
            >
              <option value="Leopards Courier">Leopards Courier</option>
              <option value="TCS Express">TCS Express</option>
              <option value="Trax Logistics">Trax Logistics</option>
              <option value="M&P Express">M&amp;P Express</option>
            </select>
          </div>
          <div>
            <label htmlFor="detail-awb" className="text-xs font-semibold text-on-surface-variant block mb-1">
              Airway Bill / Tracking CN
            </label>
            <input
              id="detail-awb"
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              placeholder="e.g. TC-88349105-LHE"
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-xs font-spec-code"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() =>
                updateOrderStatus(
                  order.id,
                  'Shipped',
                  `Dispatched via ${courierInput} (${trackingInput || 'AWB-GENERATED'}).`,
                  courierInput,
                  trackingInput || `AST-${Date.now().toString().slice(-6)}`
                )
              }
              className="w-full py-2 px-4 rounded-lg bg-tertiary hover:bg-tertiary-container text-on-tertiary text-xs font-bold"
            >
              Generate Waybill &amp; Mark Shipped
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-3 border-t border-surface-container">
          <button
            type="button"
            onClick={() => updateOrderStatus(order.id, 'Confirmed', 'Order confirmed & unit allocated from Lahore QA.')}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold"
          >
            Confirm Order &amp; Allocate Stock
          </button>
          <button
            type="button"
            onClick={() => setCancelModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-error-container text-on-error-container text-xs font-bold ml-auto"
          >
            Cancel Order
          </button>
        </div>
      </div>

      {/* 2-Column Manifest + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-on-surface">Consignee &amp; Shipping Destination</h2>
              <button
                type="button"
                onClick={() => {
                  setAddrForm({ address: order.address, city: order.city, province: order.province });
                  setEditAddrOpen(true);
                }}
                className="text-xs font-semibold text-primary hover:underline no-print"
              >
                Edit Address
              </button>
            </div>
            <div className="text-xs flex flex-col gap-1.5">
              <div>
                <strong className="text-sm text-on-surface block">{order.customerName}</strong>
                <span className="font-spec-code text-on-surface-variant">Mobile: {order.phone}</span>
              </div>
              <p className="text-on-surface mt-1">
                {order.address}, {order.city}, {order.province}
              </p>
              {order.landmark && (
                <p className="text-on-surface-variant">Landmark: {order.landmark}</p>
              )}
              {order.instructions && (
                <p className="p-2 rounded bg-surface-container-low text-on-surface-variant mt-1">
                  Note: {order.instructions}
                </p>
              )}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm">
            <h2 className="text-base font-bold text-on-surface mb-3">Hardware Manifest &amp; Bill</h2>
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-on-surface">
                  {order.quantity}× {order.productName}
                </span>
                <span className="font-spec-code">{formatPkr(order.unitPrice * order.quantity)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>SKU / Serial</span>
                <span className="font-spec-code">{order.productSku} · {order.serialNumber || 'Pending'}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Nationwide Freight</span>
                <span className="font-spec-code">{formatPkr(order.shippingFee)}</span>
              </div>
              <div className="pt-2 border-t border-surface-container flex justify-between font-bold text-sm">
                <span>Total {order.paymentMethod}</span>
                <span className="font-spec-code text-primary">{formatPkr(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Consignment Audit Log */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-bold text-on-surface">Consignment Audit Log</h2>

          <form onSubmit={handleNoteSubmit} className="flex gap-2 no-print">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Append internal verification or courier note..."
              aria-label="Internal audit note"
              className="flex-1 rounded-lg border border-outline-variant px-3 py-2 text-xs"
            />
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold">
              Append Note
            </button>
          </form>

          <div className="flex flex-col gap-3">
            {order.history.map((entry, idx) => (
              <div key={`${entry.status}-${idx}`} className="p-3 rounded-lg bg-surface-container-low border border-surface-container text-xs">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-on-surface">{entry.status}</span>
                  <span className="font-spec-code text-on-surface-variant">{entry.timestamp}</span>
                </div>
                <p className="text-on-surface-variant mt-1">{entry.note}</p>
                <span className="text-[11px] font-spec-code text-primary block mt-1">Actor: {entry.actor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Address Modal */}
      {editAddrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest border border-surface-container p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-on-surface mb-3">Update Shipping Destination</h3>
            <form onSubmit={handleSaveAddress} className="flex flex-col gap-3">
              <textarea
                required
                rows={2}
                value={addrForm.address}
                onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <input
                required
                type="text"
                value={addrForm.city}
                onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <input
                required
                type="text"
                value={addrForm.province}
                onChange={(e) => setAddrForm({ ...addrForm, province: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setEditAddrOpen(false)}
                  className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={cancelModalOpen}
        title={`Cancel Order ${order.id}?`}
        description="Are you sure you want to mark this order as Cancelled? This will record an audit entry and stop courier booking."
        confirmLabel="Confirm Cancellation"
        variant="danger"
        onConfirm={() => {
          updateOrderStatus(order.id, 'Cancelled', 'Cancelled by Admin Supervisor via Order Detail.');
          setCancelModalOpen(false);
        }}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
};
