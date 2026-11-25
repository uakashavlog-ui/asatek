import React, { useEffect, useMemo, useState } from 'react';
import { ASSETS } from '../../data/seedData';
import { useStore } from '../../context/StoreContext';
import type { OrderStatus } from '../../types/asatek';
import { buildWhatsAppUrl, findOrdersByPhone, formatPkr } from '../../utils/storeLogic';

function getStatusBadgeClasses(status: OrderStatus): string {
  switch (status) {
    case 'Shipped':
    case 'Delivered':
      return 'bg-tertiary-fixed text-on-tertiary-fixed';
    case 'Confirmed':
      return 'bg-primary-fixed text-on-primary-fixed';
    case 'Cancelled':
      return 'bg-error-container text-on-error-container';
    default:
      return 'bg-secondary-fixed text-on-secondary-fixed';
  }
}

export const OrderTrackingPage: React.FC = () => {
  const { orders, products, trackingPrefillPhone, siteSettings, navigate } = useStore();
  const [phoneInput, setPhoneInput] = useState(trackingPrefillPhone || '0333-8877665');
  const [submittedQuery, setSubmittedQuery] = useState(trackingPrefillPhone || '0333-8877665');

  useEffect(() => {
    if (trackingPrefillPhone) {
      setPhoneInput(trackingPrefillPhone);
      setSubmittedQuery(trackingPrefillPhone);
    }
  }, [trackingPrefillPhone]);

  const matchedOrders = useMemo(
    () => findOrdersByPhone(orders, submittedQuery),
    [orders, submittedQuery]
  );

  const activeOrder = matchedOrders[0] ?? null;
  const activeProduct = activeOrder ? products.find((p) => p.id === activeOrder.productId) : null;

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(phoneInput.trim());
  };

  const quickSamples = ['0300-1234567', '0333-8877665', '0321-4567890', '0345-9122334'];

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-surface-container text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate('home')} className="hover:text-primary">
            Home
          </button>
          <span>/</span>
          <span className="text-primary font-bold">Track Order</span>
        </div>
        <span className="font-spec-code text-tertiary font-semibold">COURIER GATEWAYS: OPERATIONAL</span>
      </div>

      {/* Screen 6: Order Tracking Lookup Card matching Stitch code_544cea0d.html */}
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
            Enter your booking mobile number or #AST order reference to check real-time dispatch across Pakistan.
          </p>

          <form onSubmit={handleTrackSubmit} className="mt-5 flex flex-col gap-3 text-left">
            <label htmlFor="track-phone-input" className="text-xs font-semibold text-on-surface-variant">
              Customer Mobile Contact (Pakistan) or #AST Reference
            </label>
            <div className="flex items-center rounded-lg border border-outline-variant bg-surface-container-low overflow-hidden focus-within:ring-2 focus-within:ring-primary">
              <span className="px-3 py-2.5 bg-surface-container text-xs font-spec-code font-bold text-on-surface border-r border-outline-variant">
                PK +92
              </span>
              <input
                id="track-phone-input"
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0300-1234567 or #AST-2025-0042"
                className="flex-1 px-3.5 py-2.5 text-sm font-spec-code bg-transparent text-on-surface focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
              <span>Quick sample check:</span>
              {quickSamples.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setPhoneInput(sample);
                    setSubmittedQuery(sample);
                  }}
                  className="font-spec-code text-primary underline hover:text-on-primary-fixed-variant"
                >
                  {sample}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="mt-1 w-full py-3 px-5 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[19px]">radar</span>
              <span>Track Order</span>
            </button>

            <p className="text-[11px] text-on-surface-variant text-center">
              Use the same phone number provided during checkout or WhatsApp booking. Verification code is not required.
            </p>
          </form>
        </div>

        <div className="w-full max-w-xl grid grid-cols-3 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container text-xs">
            <span className="text-on-surface-variant block">Real-Time Sync</span>
            <strong className="text-on-surface font-semibold">TCS, Leopards, Trax</strong>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container text-xs">
            <span className="text-on-surface-variant block">Nationwide Reach</span>
            <strong className="text-on-surface font-semibold">150+ Pakistani Hubs</strong>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container text-xs">
            <span className="text-on-surface-variant block">Direct Helpline</span>
            <strong className="font-spec-code text-on-surface">{siteSettings.phone}</strong>
          </div>
        </div>
      </div>

      {/* Screen 7: Order Status Result & Telemetry Timeline */}
      {!activeOrder ? (
        <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-xl border border-surface-container p-8 text-center my-4">
          <span className="material-symbols-outlined text-[38px] text-on-surface-variant">search_off</span>
          <h2 className="text-headline-sm font-bold text-on-surface mt-2">No Orders Found for &ldquo;{submittedQuery}&rdquo;</h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Verify the 11-digit mobile number (e.g. 0300-1234567) used when placing your COD order, or message WhatsApp dispatch support.
          </p>
          <a
            href={buildWhatsAppUrl(
              `Assalam-o-Alaikum ${siteSettings.site_name}, I need tracking assistance for phone ${submittedQuery}.`,
              siteSettings.whatsapp_number
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-lg bg-[#28A745] text-white text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[17px]">chat</span>
            <span>Ask Dispatch Desk on WhatsApp</span>
          </a>
        </div>
      ) : (
        <div className="py-4 flex flex-col gap-6">
          {matchedOrders.length > 1 && (
            <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface">
              Found <strong>{matchedOrders.length}</strong> orders matching this contact. Showing latest order{' '}
              <span className="font-spec-code font-bold text-primary">{activeOrder.id}</span>.
            </div>
          )}

          {/* Top Dispatch Summary Banner */}
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px]">local_shipping</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded font-spec-code text-xs font-bold uppercase ${getStatusBadgeClasses(activeOrder.status)}`}>
                    {activeOrder.status}
                  </span>
                  <span className="font-spec-code text-xs text-on-surface-variant">
                    AWB: {activeOrder.trackingNumber || 'Pending Booking'} · {activeOrder.id}
                  </span>
                </div>
                <h2 className="text-headline-sm font-bold text-on-surface">
                  {activeOrder.status === 'Pending'
                    ? 'Awaiting Dispatch Phone Confirmation'
                    : activeOrder.status === 'Confirmed'
                    ? `Confirmed & Preparing via ${activeOrder.courierName || 'TCS Express'}`
                    : activeOrder.status === 'Shipped'
                    ? `Dispatched via ${activeOrder.courierName || 'Leopards Courier'}`
                    : activeOrder.status === 'Delivered'
                    ? `Delivered via ${activeOrder.courierName || 'Trax Logistics'}`
                    : 'Order Cancelled'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-on-surface-variant block">Expected Delivery</span>
                <strong className="font-spec-code text-sm text-tertiary">
                  {activeOrder.expectedDelivery || '2–3 Working Days'}
                </strong>
              </div>
              <div>
                <span className="text-on-surface-variant block">Destination</span>
                <strong className="text-sm text-on-surface">
                  {activeOrder.city}, {activeOrder.province}
                </strong>
              </div>
            </div>
          </div>

          {/* 2-Column Telemetry Timeline + Consignment Manifest */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <span className="material-symbols-outlined text-primary text-[20px]">route</span>
                <h3 className="text-headline-sm font-bold text-on-surface">Shipment Telemetry</h3>
              </div>

              <div className="flex flex-col gap-4">
                {activeOrder.history.map((step, index) => (
                  <div key={`${step.status}-${index}`} className="flex items-start gap-3.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        index === 0 ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </div>
                    <div className="flex-1 p-3.5 rounded-lg bg-surface-container-low border border-surface-container">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-sm text-on-surface">{step.status}</strong>
                        <span className="font-spec-code text-xs text-on-surface-variant">{step.timestamp}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
                  <h3 className="text-headline-sm font-bold text-on-surface">Consignment Manifest</h3>
                </div>

                <div className="p-3 rounded-lg bg-surface-container-low flex items-center gap-3">
                  {activeProduct && (
                    <img
                      src={activeProduct.images[0]}
                      alt={activeOrder.productName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-md object-cover bg-white border border-surface-container shrink-0"
                    />
                  )}
                  <div>
                    <span className="font-spec-code text-xs text-primary font-bold">
                      Order {activeOrder.id}
                    </span>
                    <div className="text-sm font-bold text-on-surface">{activeOrder.productName}</div>
                    <div className="font-spec-code text-xs text-on-surface-variant">
                      Qty: {activeOrder.quantity} · {activeOrder.productSku}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-xs font-spec-code border-t border-surface-container pt-3">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Serial Number</span>
                    <strong className="text-on-surface">{activeOrder.serialNumber || 'Assigned at Packing'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Total Payable / Paid</span>
                    <strong className="text-primary">{formatPkr(activeOrder.totalAmount)} ({activeOrder.paymentMethod})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Standard Warranty</span>
                    <strong className="text-tertiary">12 Months Official</strong>
                  </div>
                </div>

                <a
                  href={buildWhatsAppUrl(
                    `Assalam-o-Alaikum ${siteSettings.site_name}, I would like a live dispatch update for ${activeOrder.id} (${activeOrder.customerName}, ${activeOrder.city}).`,
                    siteSettings.whatsapp_number
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-lg bg-[#28A745] hover:bg-[#1e7e34] text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[17px]">chat</span>
                  <span>WhatsApp Inquiry for this Order</span>
                </a>
              </div>

              <div className="rounded-xl overflow-hidden border border-surface-container bg-surface-container-lowest relative h-44">
                <img
                  src={ASSETS.hubMap}
                  alt="Pakistan Logistics Transit Corridors"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 px-3 py-1.5 rounded-lg border border-surface-container text-xs flex items-center justify-between">
                  <span className="font-semibold text-on-surface">
                    Route: Lahore Plant → {activeOrder.city}
                  </span>
                  <span className="font-spec-code text-primary font-bold">{activeOrder.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Help & FAQs */}
      <div className="mt-8 pt-8 border-t border-surface-container grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <span className="text-xs font-bold text-primary uppercase">Need Help?</span>
          <h2 className="text-headline-md font-bold text-on-surface">Dispatch &amp; Tracking FAQs</h2>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
            <strong className="text-sm text-on-surface block">Can&apos;t find your order details?</strong>
            <p className="text-xs text-on-surface-variant mt-1">
              Courier tracking numbers sync within 3 hours after warehouse dispatch. Cross-check that you entered your 11-digit Pakistani booking number without spaces.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
            <strong className="text-sm text-on-surface block">Courier inspection &amp; warranty activation</strong>
            <p className="text-xs text-on-surface-variant mt-1">
              All ASATEK parcels carry tamper-evident red security tape. Inspect outer seal upon COD arrival; 1-Year Warranty activates automatically upon delivery.
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl border border-surface-container p-6">
          <h3 className="text-headline-sm font-bold text-on-surface mb-1">Urgent Dispatch Help</h3>
          <p className="text-xs text-on-surface-variant mb-4">
            Factory logistics coordinators are available Monday to Saturday (9:00 AM to 7:00 PM PKT).
          </p>
          <div className="rounded-lg bg-surface-container-low p-3.5 text-xs flex flex-col gap-2 font-spec-code">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Helpline Hotline</span>
              <strong className="text-primary">{siteSettings.phone}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Logistics Email</span>
              <strong className="text-on-surface">{siteSettings.email}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Factory Despatch</span>
              <strong className="text-on-surface">Sundar Industrial, LHE</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
