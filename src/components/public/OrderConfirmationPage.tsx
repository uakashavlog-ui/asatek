import React from 'react';
import { useStore } from '../../context/StoreContext';
import { buildWhatsAppUrl, formatPkr } from '../../utils/storeLogic';

export const OrderConfirmationPage: React.FC = () => {
  const { orders, products, lastPlacedOrderId, siteSettings, setTrackingPrefillPhone, navigate } = useStore();
  const order = orders.find((o) => o.id === lastPlacedOrderId) || orders[0];

  if (!order) return null;

  const product = products.find((p) => p.id === order.productId);
  const waConfirmMsg = `Assalam-o-Alaikum ${siteSettings.site_name} Team! Please confirm my Cash on Delivery order ${order.id} for ${order.quantity}x ${order.productName} (${formatPkr(order.totalAmount)}). Name: ${order.customerName}, City: ${order.city}, Phone: ${order.phone}.`;

  return (
    <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-8">
      <div className="flex items-center justify-between pb-4 border-b border-surface-container text-xs text-on-surface-variant mb-8">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate('products')} className="hover:text-primary">
            Catalog
          </button>
          <span>/</span>
          <span>Checkout</span>
          <span>/</span>
          <span className="text-primary font-bold">Confirmation</span>
        </div>
        <span className="font-spec-code text-tertiary font-semibold">SYS STATUS: ORDER INGESTED</span>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-surface-container p-6 sm:p-10 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center mx-auto mb-4 shadow-md">
          <span className="material-symbols-outlined text-[36px]">check</span>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold mb-3">
          Verified Direct Booking
        </span>

        <h1 className="text-headline-lg font-extrabold text-on-surface">Order Placed Successfully!</h1>
        <p className="text-body-md text-on-surface-variant mt-2">
          Thank you for shopping with <strong className="text-primary">{siteSettings.site_name}</strong>. Your order{' '}
          <span className="font-spec-code font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface">
            {order.id}
          </span>{' '}
          has been received and queued for dispatch.
        </p>

        {/* Next Step Box */}
        <div className="mt-6 p-4 rounded-xl bg-surface-container-low border border-surface-container text-left flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">support_agent</span>
          <div>
            <div className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Dispatch Verification Protocol · Next Step
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              Our customer support team will contact you on WhatsApp / Phone within 2 hours to confirm dispatch and parcel booking from our Lahore assembly depot.
            </p>
          </div>
        </div>

        {/* Manifest Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <div className="p-5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-surface-container text-xs font-semibold">
                <span className="text-on-surface-variant">Order Manifest</span>
                <span className="text-tertiary font-spec-code">COD Authorized</span>
              </div>
              <div className="mt-3 flex flex-col gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Order Reference</span>
                  <strong className="font-spec-code text-on-surface">{order.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Booking Timestamp</span>
                  <span className="font-spec-code text-on-surface">{order.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Payment Method</span>
                  <strong className="text-tertiary">{order.paymentMethod}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Consignee Name</span>
                  <strong className="text-on-surface">{order.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Mobile Contact</span>
                  <span className="font-spec-code text-on-surface">{order.phone}</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-surface-container">
              <span className="text-[11px] text-on-surface-variant block mb-1">Destination Address</span>
              <p className="text-xs font-medium text-on-surface">
                {order.address}, {order.city}, {order.province}, Pakistan
              </p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-surface-container text-xs font-semibold">
                <span className="text-on-surface-variant">Item Specification</span>
                <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-spec-code font-bold">
                  QTY: {String(order.quantity).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                {product && (
                  <img
                    src={product.images[0]}
                    alt={order.productName}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-lg object-cover bg-white border border-surface-container"
                  />
                )}
                <div>
                  <div className="font-bold text-sm text-on-surface">{order.productName}</div>
                  <div className="font-spec-code text-xs text-on-surface-variant">{order.productSku}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Unit Price × {order.quantity}</span>
                  <span className="font-spec-code text-on-surface">
                    {formatPkr(order.unitPrice * order.quantity)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Standard Freight ({order.city})</span>
                  <span className="font-spec-code text-on-surface">{formatPkr(order.shippingFee)}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-surface-container flex items-center justify-between">
                  <span className="font-bold text-primary">Total Payable</span>
                  <span className="text-xl font-extrabold text-primary font-spec-code tabular-nums">
                    {formatPkr(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-[11px] font-spec-code text-tertiary pt-2 border-t border-surface-container">
              1-Year National Warranty · QC Seal Active
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={buildWhatsAppUrl(waConfirmMsg, siteSettings.whatsapp_number)}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-lg bg-[#28A745] hover:bg-[#1e7e34] text-white font-semibold text-sm flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[19px]">chat</span>
            <span>Confirm Now on WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setTrackingPrefillPhone(order.phone);
              navigate('track-order');
            }}
            className="px-5 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-primary font-semibold text-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[19px]">local_shipping</span>
            <span>Track My Order</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('products')}
            className="px-4 py-3 text-sm font-semibold text-on-surface-variant hover:text-primary"
          >
            ← Return to Shopping
          </button>
        </div>

        {/* Footer Info Cards */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="p-3.5 rounded-lg bg-surface-container-low text-xs text-on-surface-variant">
            <strong className="text-on-surface block mb-0.5">Tracking Lookup</strong>
            Save your phone number (<span className="font-spec-code">{order.phone}</span>) to track status anytime.
          </div>
          <div className="p-3.5 rounded-lg bg-surface-container-low text-xs text-on-surface-variant">
            <strong className="text-on-surface block mb-0.5">Need Immediate Assistance?</strong>
            Direct Helpline: <span className="font-spec-code text-primary font-bold">{siteSettings.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
