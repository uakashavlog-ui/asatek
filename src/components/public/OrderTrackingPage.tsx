import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { buildWhatsAppUrl, getOrderStatusBadgeClass, isValidPkPhone } from '../../utils/storeLogic';
import { fetchTrackedOrdersByPhone, type TrackedOrderStatus } from '../../services/storeDataService';

export const OrderTrackingPage: React.FC = () => {
  const { trackingPrefillPhone, siteSettings, navigate } = useStore();
  const [phoneInput, setPhoneInput] = useState(trackingPrefillPhone || '');
  const [trackedOrders, setTrackedOrders] = useState<TrackedOrderStatus[]>([]);
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackingPrefillPhone) setPhoneInput(trackingPrefillPhone);
  }, [trackingPrefillPhone]);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPkPhone(phoneInput)) {
      setError('Enter the same valid Pakistani mobile number used when placing your order.');
      setTrackedOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    setSubmittedQuery(phoneInput.trim());
    try {
      const results = await fetchTrackedOrdersByPhone(phoneInput.trim());
      setTrackedOrders(results);
    } catch {
      setTrackedOrders([]);
      setError('Order tracking is temporarily unavailable. Please contact our dispatch team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-surface-container text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate('home')} className="hover:text-primary">Home</button>
          <span>/</span>
          <span className="text-primary font-bold">Track Order</span>
        </div>
        <span className="font-spec-code text-tertiary font-semibold">COURIER GATEWAYS: OPERATIONAL</span>
      </div>

      <div className="py-8 flex flex-col items-center">
        <span className="px-3 py-1 rounded bg-surface-container text-primary font-spec-code text-xs font-bold mb-4">
          {siteSettings.site_name.toUpperCase()} DISPATCH &amp; TELEMETRY ENGINE
        </span>
        <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl border border-surface-container p-6 sm:p-8 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[26px]">local_shipping</span>
          </div>
          <h1 className="text-headline-lg font-extrabold text-on-surface">Track Your Order</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Enter the mobile number used at checkout to securely view the status of your orders.
          </p>
          <form onSubmit={handleTrackSubmit} className="mt-5 flex flex-col gap-3 text-left">
            <label htmlFor="track-phone-input" className="text-xs font-semibold text-on-surface-variant">
              Customer Mobile Contact (Pakistan)
            </label>
            <div className="flex items-center rounded-lg border border-outline-variant bg-surface-container-low overflow-hidden focus-within:ring-2 focus-within:ring-primary">
              <span className="px-3 py-2.5 bg-surface-container text-xs font-spec-code font-bold text-on-surface border-r border-outline-variant">PK +92</span>
              <input
                id="track-phone-input"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0300-1234567"
                className="min-w-0 flex-1 px-3.5 py-2.5 text-sm font-spec-code bg-transparent text-on-surface focus:outline-none"
              />
            </div>
            {error && <p role="alert" className="text-xs font-semibold text-error">{error}</p>}
            <button type="submit" disabled={loading} className="mt-1 w-full py-3 px-5 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-60">
              <span className="material-symbols-outlined text-[19px]">radar</span>
              <span>{loading ? 'Checking...' : 'Track Order'}</span>
            </button>
            <p className="text-[11px] text-on-surface-variant text-center">
              Your phone number is matched securely by the database. Other customers' details are never exposed.
            </p>
          </form>
        </div>

        {submittedQuery && !loading && !error && trackedOrders.length === 0 && (
          <div className="w-full max-w-3xl bg-surface-container-lowest rounded-xl border border-surface-container p-8 text-center mt-6">
            <span className="material-symbols-outlined text-[38px] text-on-surface-variant">search_off</span>
            <h2 className="text-headline-sm font-bold text-on-surface mt-2">No Orders Found</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">No order status matched that mobile number. Check the number or contact dispatch support.</p>
          </div>
        )}

        {trackedOrders.length > 0 && (
          <div className="w-full max-w-3xl flex flex-col gap-4 mt-6">
            {trackedOrders.map((order) => (
              <section key={order.order_number} className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-on-surface-variant block">Order Reference</span>
                    <strong className="font-spec-code text-primary">{order.order_number}</strong>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getOrderStatusBadgeClass(order.status)}`}>{order.status}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-surface-container text-xs">
                  <div><span className="text-on-surface-variant block">Last Updated</span><strong className="text-on-surface">{new Date(order.updated_at || order.created_at).toLocaleString()}</strong></div>
                  <div><span className="text-on-surface-variant block">Courier Tracking</span><strong className="text-on-surface">{order.tracking_number || 'Pending Dispatch'}</strong></div>
                  <div><span className="text-on-surface-variant block">Courier Partner</span><strong className="text-on-surface">{order.courier_name || 'To be assigned'}</strong></div>
                  <div><span className="text-on-surface-variant block">Expected Delivery</span><strong className="text-on-surface">{order.expected_delivery || 'To be confirmed'}</strong></div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-xl mx-auto mt-2 p-4 rounded-xl bg-surface-container-low border border-surface-container text-xs text-on-surface-variant text-center">
        Need help? <a href={buildWhatsAppUrl(`Assalam-o-Alaikum ${siteSettings.site_name}, I need order tracking assistance for phone ${submittedQuery || phoneInput}.`, siteSettings.whatsapp_number)} target="_blank" rel="noreferrer" className="font-bold text-primary underline">Contact dispatch on WhatsApp</a>
      </div>
    </div>
  );
};
