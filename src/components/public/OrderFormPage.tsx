import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  calculateOrderTotals,
  formatPkr,
  formatTelHref,
  isValidPkPhone,
  STANDARD_COD_SHIPPING_PKR,
} from '../../utils/storeLogic';
import { SafeImage } from '../common/SafeImage';

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa (KPK)',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir / Gilgit-Baltistan',
];

export const OrderFormPage: React.FC = () => {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    checkoutQuantity,
    setCheckoutQuantity,
    placeOrder,
    siteSettings,
    navigate,
  } = useStore();

  const publicProducts = products.filter((p) => p.isPublicVisible);
  const selectedProduct =
    publicProducts.find((p) => p.id === selectedProductId) || publicProducts[0] || products[0];

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [sameAsMobile, setSameAsMobile] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [landmark, setLandmark] = useState('');
  const [instructions, setInstructions] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!selectedProduct) return null;

  const totals = calculateOrderTotals(selectedProduct.price, checkoutQuantity, STANDARD_COD_SHIPPING_PKR);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      nextErrors.customerName = 'Please enter your full name for the courier parcel.';
    }
    if (!isValidPkPhone(phone)) {
      nextErrors.phone = 'Enter a valid 11-digit Pakistani mobile number (e.g. 0300-1234567).';
    }
    const effectiveWa = sameAsMobile ? phone : whatsapp;
    if (!isValidPkPhone(effectiveWa)) {
      nextErrors.whatsapp = 'Enter a valid 11-digit WhatsApp number.';
    }
    if (!address.trim() || address.trim().length < 6) {
      nextErrors.address = 'Please enter complete house/shop number and street address.';
    }
    if (!city.trim()) {
      nextErrors.city = 'City / Tehsil is required.';
    }
    if (!province.trim()) {
      nextErrors.province = 'Please select your province or region.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    placeOrder({
      productId: selectedProduct.id,
      quantity: totals.quantity,
      customerName,
      phone,
      whatsapp: effectiveWa,
      address,
      city,
      province,
      landmark,
      instructions,
      paymentMethod: 'COD',
    });

    navigate('order-confirmation');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-6">
      <div className="flex items-center gap-2 pb-4 border-b border-surface-container text-xs text-on-surface-variant">
        <button type="button" onClick={() => navigate('home')} className="hover:text-primary">
          Home
        </button>
        <span>/</span>
        <button type="button" onClick={() => navigate('products')} className="hover:text-primary">
          Catalog
        </button>
        <span>/</span>
        <span className="text-primary font-semibold">Cash on Delivery Checkout</span>
      </div>

      <div className="py-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed font-spec-code text-xs font-bold mb-2">
            EXPRESS DISPATCH · ALL PAKISTAN COD
          </span>
          <h1 className="text-headline-lg font-extrabold text-on-surface">Place Your Order</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Fast Cash on Delivery across Pakistan. No account or pre-payment required.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-lg border border-surface-container">
            <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
            <div>
              <strong className="block text-on-surface">100% Genuine</strong>
              <span className="text-on-surface-variant">Factory Inspected</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-lg border border-surface-container">
            <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
            <div>
              <strong className="block text-on-surface">Pay on Delivery</strong>
              <span className="text-on-surface-variant">Check Package First</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Section 1: Hardware Details */}
          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-headline-sm font-bold text-on-surface">Hardware Details</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold">
                In Stock
              </span>
            </div>

            <label htmlFor="checkout-product-select" className="text-xs font-semibold text-on-surface-variant block mb-1.5">
              Choose ASATEK Power Unit
            </label>
            <select
              id="checkout-product-select"
              value={selectedProduct.id}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-sm font-semibold text-on-surface mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {publicProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatPkr(p.price)} ({p.voltage} / {p.amperageOrWatts})
                </option>
              ))}
            </select>

            <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-14 h-14 rounded-md overflow-hidden bg-white border border-surface-container shrink-0">
                  <SafeImage
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    placeholderIcon="inventory_2"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-on-surface truncate">{selectedProduct.name}</div>
                  <div className="font-spec-code text-xs text-primary font-semibold">SKU: {selectedProduct.sku}</div>
                  <div className="font-spec-code text-xs text-on-surface-variant">
                    Unit Price: {formatPkr(selectedProduct.price)}
                  </div>
                </div>
              </div>
              <div className="flex items-center border border-outline-variant rounded-lg bg-surface-container-lowest shrink-0">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setCheckoutQuantity(Math.max(1, checkoutQuantity - 1))}
                  className="px-3 py-1.5 font-bold hover:bg-surface-container"
                >
                  −
                </button>
                <span className="px-3 font-spec-code font-bold tabular-nums">{totals.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setCheckoutQuantity(Math.min(20, checkoutQuantity + 1))}
                  className="px-3 py-1.5 font-bold hover:bg-surface-container"
                >
                  +
                </button>
              </div>
            </div>
          </section>

          {/* Section 2: Customer Contact Information */}
          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-headline-sm font-bold text-on-surface">Customer Contact Information</h2>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">Required for courier verification and dispatch call.</p>

            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="order-full-name" className="text-xs font-semibold text-on-surface block mb-1">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  id="order-full-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setErrors((prev) => ({ ...prev, customerName: '' }));
                  }}
                  placeholder="e.g., Muhammad Ali"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                    errors.customerName ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                  }`}
                />
                {errors.customerName && <p className="text-xs text-error mt-1">{errors.customerName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="order-phone" className="text-xs font-semibold text-on-surface block mb-1">
                    Mobile / Phone Number <span className="text-error">*</span>
                  </label>
                  <input
                    id="order-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    placeholder="0300-1234567"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm font-spec-code bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                      errors.phone ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                    }`}
                  />
                  <span className="text-[11px] text-on-surface-variant">We will call this number before packing.</span>
                  {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="order-whatsapp" className="text-xs font-semibold text-on-surface block mb-1">
                    WhatsApp Contact Number <span className="text-error">*</span>
                  </label>
                  <input
                    id="order-whatsapp"
                    type="tel"
                    disabled={sameAsMobile}
                    value={sameAsMobile ? phone : whatsapp}
                    onChange={(e) => {
                      setWhatsapp(e.target.value);
                      setErrors((prev) => ({ ...prev, whatsapp: '' }));
                    }}
                    placeholder="0300-1234567"
                    className="w-full rounded-lg border border-outline-variant px-3.5 py-2.5 text-sm font-spec-code bg-surface-container-lowest disabled:bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <label className="mt-1.5 inline-flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsMobile}
                      onChange={(e) => setSameAsMobile(e.target.checked)}
                      className="accent-[#005a1d]"
                    />
                    <span>Same as mobile phone number</span>
                  </label>
                  {errors.whatsapp && <p className="text-xs text-error mt-1">{errors.whatsapp}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Delivery Address */}
          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="w-7 h-7 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-headline-sm font-bold text-on-surface">Delivery Address &amp; Location</h2>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">Dispatched via TCS, Leopards, or Trax Express.</p>

            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="order-address" className="text-xs font-semibold text-on-surface block mb-1">
                  Complete Street Address / House / Shop No. <span className="text-error">*</span>
                </label>
                <textarea
                  id="order-address"
                  rows={2}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  placeholder="House/Shop No., Street Number, Sector/Mohalla, Industrial Area"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                    errors.address ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                  }`}
                />
                {errors.address && <p className="text-xs text-error mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="order-city" className="text-xs font-semibold text-on-surface block mb-1">
                    City / Tehsil <span className="text-error">*</span>
                  </label>
                  <input
                    id="order-city"
                    type="text"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setErrors((prev) => ({ ...prev, city: '' }));
                    }}
                    placeholder="e.g. Lahore, Karachi, Multan"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                      errors.city ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                    }`}
                  />
                  {errors.city && <p className="text-xs text-error mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label htmlFor="order-province" className="text-xs font-semibold text-on-surface block mb-1">
                    Province / Region <span className="text-error">*</span>
                  </label>
                  <select
                    id="order-province"
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setErrors((prev) => ({ ...prev, province: '' }));
                    }}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                      errors.province ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                    }`}
                  >
                    <option value="">Select Province</option>
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                  {errors.province && <p className="text-xs text-error mt-1">{errors.province}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="order-landmark" className="text-xs font-semibold text-on-surface block mb-1">
                  Nearest Landmark or Google Maps Pin URL (Optional)
                </label>
                <input
                  id="order-landmark"
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Shell Pump, Hall Road"
                  className="w-full rounded-lg border border-outline-variant px-3.5 py-2.5 text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="order-instructions" className="text-xs font-semibold text-on-surface block mb-1">
                  Special Delivery Instructions / Time Preference
                </label>
                <textarea
                  id="order-instructions"
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Please deliver after 2 PM, or leave with security gate"
                  className="w-full rounded-lg border border-outline-variant px-3.5 py-2.5 text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sticky Order Summary Sidebar */}
        <aside className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2 font-bold text-on-surface text-lg">
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                <span>Order Summary</span>
              </div>
              <span className="font-spec-code text-xs font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                COD PK
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-container-low flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-on-surface">{selectedProduct.name}</div>
                <div className="font-spec-code text-xs text-on-surface-variant">
                  Qty: {totals.quantity} · {selectedProduct.voltage}
                </div>
              </div>
              <span className="font-spec-code font-bold text-on-surface tabular-nums">
                {formatPkr(totals.subtotal)}
              </span>
            </div>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span className="font-spec-code text-on-surface tabular-nums">{formatPkr(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Nationwide Courier Fee</span>
                <span className="font-spec-code text-on-surface tabular-nums">{formatPkr(totals.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-tertiary">
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                  Transit Insurance Included
                </span>
                <span className="font-spec-code text-xs font-bold">FREE</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-on-surface block">Total Payable</span>
                <span className="text-[11px] text-on-surface-variant">Pay courier when package arrives</span>
              </div>
              <span className="text-2xl font-extrabold text-primary font-spec-code tabular-nums">
                {formatPkr(totals.totalAmount)}
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-on-surface-variant block mb-1.5">Payment Method</span>
              <div className="p-3 rounded-lg border-2 border-primary bg-primary-fixed/25 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-on-surface">Cash on Delivery (COD)</div>
                  <div className="text-xs text-on-surface-variant">
                    Safe, easy, and reliable delivery across Pakistan
                  </div>
                </div>
                <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
              <span>Place Order (Cash on Delivery)</span>
            </button>

            <div className="p-3 rounded-lg bg-surface-container-low text-xs text-on-surface-variant leading-relaxed">
              After placing your order, a {siteSettings.site_name} technician will call or message your WhatsApp within 2 hours to confirm your address before handing the parcel to the courier.
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-tertiary text-[22px]">call</span>
              <div>
                <span className="text-xs text-on-surface-variant block">Need Help Ordering?</span>
                <strong className="font-spec-code text-sm text-on-surface">Call {siteSettings.phone}</strong>
              </div>
            </div>
            <a
              href={formatTelHref(siteSettings.phone)}
              className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container"
            >
              Direct Dial
            </a>
          </div>
        </aside>
      </form>
    </div>
  );
};
