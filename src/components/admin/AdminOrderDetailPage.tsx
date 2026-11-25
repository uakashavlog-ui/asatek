import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { OrderStatus } from '../../types/asatek';
import {
  buildAdminOrderWhatsAppMessage,
  buildWhatsAppUrl,
  formatOrderWhatsAppPhone,
  formatPkr,
  formatReadableOrderDate,
  formatTelHref,
  getOrderStatusBadgeClass,
  PRIMARY_ORDER_STATUSES,
} from '../../utils/storeLogic';
import { ConfirmDialog } from '../modals/ConfirmDialog';

export const AdminOrderDetailPage: React.FC = () => {
  const {
    orders,
    selectedOrderId,
    siteSettings,
    updateOrderStatus,
    navigate,
  } = useStore();

  const order = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const [saving, setSaving] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const savingRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  if (!order) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-8 text-center">
        <h1 className="text-headline-sm font-bold text-on-surface">Order not found</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Select an order from the orders list to view its details.
        </p>
        <button
          type="button"
          onClick={() => navigate('admin-orders')}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const orderNo = order.orderNumber || order.id;
  const formattedDate = formatReadableOrderDate(order.createdAtIso || order.createdAt);
  const itemsSubtotal = order.unitPrice * order.quantity;
  const whatsappTargetDisplay = (order.whatsapp || '').trim() || order.phone;
  const whatsappHref = buildWhatsAppUrl(
    buildAdminOrderWhatsAppMessage(order, siteSettings.site_name),
    formatOrderWhatsAppPhone(order.whatsapp, order.phone)
  );

  const showToast = (message: string) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3500);
  };

  const applyStatusChange = async (nextStatus: OrderStatus) => {
    if (savingRef.current || order.status === nextStatus) return;
    savingRef.current = true;
    setSaving(true);
    setErrorMessage(null);
    try {
      await updateOrderStatus(order.id, nextStatus);
      showToast(`Order status updated to ${nextStatus}.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save order status. Please try again.'
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleStatusClick = (nextStatus: OrderStatus) => {
    if (savingRef.current || saving || order.status === nextStatus) return;
    if (nextStatus === 'Cancelled') {
      setCancelModalOpen(true);
      return;
    }
    void applyStatusChange(nextStatus);
  };

  const getStatusButtonClasses = (status: OrderStatus, isActive: boolean) => {
    if (isActive) {
      if (status === 'Confirmed') {
        return 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-200';
      }
      if (status === 'Skipped') {
        return 'bg-slate-700 text-white border-slate-700 shadow-sm ring-2 ring-slate-300';
      }
      if (status === 'Cancelled') {
        return 'bg-error text-white border-error shadow-sm ring-2 ring-error/25';
      }
      return 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-200';
    }
    if (status === 'Cancelled') {
      return 'bg-surface-container-low text-error border-outline-variant hover:bg-error-container hover:border-error/40';
    }
    return 'bg-surface-container-low text-on-surface border-outline-variant hover:bg-surface-container';
  };

  return (
    <div className="flex flex-col gap-6">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs font-bold text-white shadow-lg"
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('admin-orders')}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          <span>← Back to Orders</span>
        </button>
      </div>

      {/* Order Header Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-headline-md font-extrabold font-spec-code text-on-surface">
              {orderNo}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${getOrderStatusBadgeClass(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1.5">
            Order Date: <span className="font-medium text-on-surface">{formattedDate}</span>
          </p>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-xs text-on-surface-variant block">Order Total</span>
          <strong className="text-xl font-extrabold font-spec-code text-primary tabular-nums">
            {formatPkr(order.totalAmount)}
          </strong>
        </div>
      </div>

      {/* Main Action Row: Simple Order Status Box + WhatsApp Customer Button */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <section className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-on-surface">Order Status</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Select a status below to update this order right away.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-on-surface-variant font-medium">Current:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getOrderStatusBadgeClass(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRIMARY_ORDER_STATUSES.map((statusOption) => {
              const isActive = order.status === statusOption;
              return (
                <button
                  key={statusOption}
                  type="button"
                  disabled={saving}
                  aria-pressed={isActive}
                  onClick={() => handleStatusClick(statusOption)}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${getStatusButtonClasses(
                    statusOption,
                    isActive
                  )}`}
                >
                  {saving && !isActive ? statusOption : statusOption}
                </button>
              );
            })}
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-lg bg-error-container px-3 py-2 text-xs font-semibold text-on-error-container"
            >
              {errorMessage}
            </p>
          )}
        </section>

        <section className="lg:col-span-5 bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm flex flex-col justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-on-surface">Contact Customer</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Message with the prefilled status update or place a quick call.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-5 rounded-lg bg-[#28A745] hover:bg-[#1e7e34] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              <span>WhatsApp Customer</span>
            </a>

            <a
              href={formatTelHref(order.phone)}
              className="w-full py-2 px-3 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container text-xs font-semibold flex items-center justify-center gap-1.5 text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">call</span>
              <span>Call ({whatsappTargetDisplay === order.phone ? order.phone : `${order.phone}`})</span>
            </a>
          </div>
        </section>
      </div>

      {/* Customer Details & Order Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-6 bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm">
          <h2 className="text-base font-bold text-on-surface pb-3 border-b border-surface-container mb-4">
            Customer Details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
            <div>
              <dt className="text-on-surface-variant">Name</dt>
              <dd className="font-semibold text-sm text-on-surface mt-0.5">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Phone</dt>
              <dd className="font-spec-code font-semibold text-on-surface mt-0.5">{order.phone}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">WhatsApp Number</dt>
              <dd className="font-spec-code font-semibold text-on-surface mt-0.5">
                {order.whatsapp || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">City</dt>
              <dd className="font-semibold text-on-surface mt-0.5">{order.city}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Province</dt>
              <dd className="font-semibold text-on-surface mt-0.5">{order.province}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Country</dt>
              <dd className="font-semibold text-on-surface mt-0.5">{order.country || 'Pakistan'}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">ZIP Code</dt>
              <dd className="font-spec-code font-semibold text-on-surface mt-0.5">
                {order.zipCode || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Location / Landmark</dt>
              <dd className="font-semibold text-on-surface mt-0.5">
                {order.location || order.landmark || '—'}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-on-surface-variant">Full Address</dt>
              <dd className="font-medium text-on-surface mt-0.5 leading-relaxed">{order.address}</dd>
            </div>
            {order.instructions && (
              <div className="sm:col-span-2 p-2.5 rounded-lg bg-surface-container-low">
                <dt className="text-on-surface-variant">Delivery Note</dt>
                <dd className="text-on-surface mt-0.5">{order.instructions}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="lg:col-span-6 bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm">
          <h2 className="text-base font-bold text-on-surface pb-3 border-b border-surface-container mb-4">
            Order Items
          </h2>
          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-sm text-on-surface">{order.productName}</div>
                <div className="text-on-surface-variant mt-0.5">
                  Quantity: <span className="font-spec-code font-bold text-on-surface">{order.quantity}</span>
                  {' · '}
                  Unit Price: <span className="font-spec-code font-semibold text-on-surface">{formatPkr(order.unitPrice)}</span>
                </div>
              </div>
              <span className="font-spec-code font-bold text-sm text-on-surface whitespace-nowrap">
                {formatPkr(itemsSubtotal)}
              </span>
            </div>

            <div className="flex justify-between text-on-surface-variant pt-1">
              <span>Price ({order.quantity} item{order.quantity > 1 ? 's' : ''})</span>
              <span className="font-spec-code font-semibold text-on-surface">{formatPkr(itemsSubtotal)}</span>
            </div>

            <div className="flex justify-between text-on-surface-variant">
              <span>Delivery Charges</span>
              <span className="font-spec-code font-semibold text-on-surface">{formatPkr(order.shippingFee)}</span>
            </div>

            <div className="flex justify-between text-on-surface-variant">
              <span>Payment Method</span>
              <span className="font-semibold text-on-surface">{order.paymentMethod}</span>
            </div>

            <div className="pt-3 mt-1 border-t border-surface-container flex items-center justify-between">
              <span className="font-bold text-sm text-on-surface">Total</span>
              <span className="text-lg font-extrabold font-spec-code text-primary tabular-nums">
                {formatPkr(order.totalAmount)}
              </span>
            </div>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={cancelModalOpen}
        title="Cancel Order"
        description="Are you sure you want to cancel this order?"
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
        variant="danger"
        onConfirm={() => {
          setCancelModalOpen(false);
          void applyStatusChange('Cancelled');
        }}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
};
