import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ASSETS } from '../../data/seedData';
import { buildWhatsAppUrl, formatDisplayIntlPhone, formatPkr } from '../../utils/storeLogic';

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    selectedProductId,
    language,
    siteSettings,
    navigate,
    setCheckoutQuantity,
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId) || products[0];
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [videoOpen, setVideoOpen] = useState(false);
  const [schematicOpen, setSchematicOpen] = useState(false);

  useEffect(() => {
    setActiveImgIdx(0);
    setQty(1);
    setVideoOpen(false);
  }, [product?.id]);

  if (!product) return null;

  const related = products.filter((p) => p.id !== product.id && p.isPublicVisible).slice(0, 3);
  const discountPct =
    product.msrp > product.price
      ? Math.round(((product.msrp - product.price) / product.msrp) * 100)
      : 0;

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-6">
      {/* Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-surface-container text-xs text-on-surface-variant">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => navigate('home')} className="hover:text-primary">
            Home
          </button>
          <span>/</span>
          <button type="button" onClick={() => navigate('products')} className="hover:text-primary">
            Products
          </button>
          <span>/</span>
          <span className="text-primary font-bold">{product.name}</span>
        </div>
        <div className="flex items-center gap-3 font-spec-code">
          <span className="text-tertiary font-semibold">Official Direct Store</span>
          <span>SKU: {product.sku}</span>
        </div>
      </div>

      {/* Main 2-Column Purchase Showcase matching Stitch code_aecf3df0.html */}
      <div className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Gallery */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="rounded-xl bg-surface-container-lowest border border-surface-container p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-spec-code font-bold text-primary">
                {product.badge || product.controlTech}
              </span>
              <span className="font-spec-code text-tertiary font-semibold">
                {product.inStock ? 'In Stock (Direct Dispatch)' : 'Made to Order'}
              </span>
            </div>
            <div className="w-full h-80 sm:h-96 rounded-lg overflow-hidden bg-surface-container-low">
              <img
                src={product.images[activeImgIdx] || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5 mt-3">
                {product.images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`h-18 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImgIdx === idx ? 'border-primary' : 'border-surface-container opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container">
              <span className="text-[11px] uppercase font-semibold text-on-surface-variant block">
                Current / Load
              </span>
              <span className="font-spec-code text-base font-bold text-on-surface">
                {product.quickStats.currentLoad}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container">
              <span className="text-[11px] uppercase font-semibold text-on-surface-variant block">
                Capacity / Spec
              </span>
              <span className="font-spec-code text-base font-bold text-on-surface">
                {product.quickStats.maxArray}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-surface-container">
              <span className="text-[11px] uppercase font-semibold text-on-surface-variant block">
                Coverage
              </span>
              <span className="font-spec-code text-base font-bold text-tertiary">
                {product.quickStats.coverage}
              </span>
            </div>
          </div>
        </div>

        {/* Right Purchase & Spec Column */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
              <span className="font-semibold text-primary uppercase tracking-wider">{product.category}</span>
              <span className="font-spec-code">{product.warehouseLocation}</span>
            </div>
            <h1 className="text-headline-lg font-extrabold text-on-surface">
              {language === 'ur' ? product.urduName : product.name}
            </h1>
            <p className="text-body-md text-on-surface-variant mt-1">{product.subtitle}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
              <span className="font-spec-code font-bold text-primary">4.9 ★ Verified Rating</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => navigate('reviews')}
                className="underline hover:text-primary"
              >
                Read Field Reviews
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => navigate('service-centers')}
                className="underline hover:text-primary"
              >
                15+ Service Hubs
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-primary font-spec-code tabular-nums">
                  {formatPkr(product.price)}
                </span>
                {product.msrp > product.price && (
                  <span className="text-sm text-on-surface-variant line-through font-spec-code">
                    {formatPkr(product.msrp)}
                  </span>
                )}
              </div>
              <span className="text-xs text-tertiary font-medium flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                Cash on Delivery Available (Nationwide 24–72h)
              </span>
            </div>
            {discountPct > 0 && (
              <span className="px-3 py-1 rounded-md bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold">
                Save {discountPct}%
              </span>
            )}
          </div>

          <p className="text-body-sm text-on-surface leading-relaxed">
            {language === 'ur' ? product.urduDescription : product.description}
          </p>

          <ul className="flex flex-col gap-2">
            {product.features.map((feat) => (
              <li key={feat} className="flex items-start gap-2 text-body-sm text-on-surface">
                <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5 shrink-0">
                  check_circle
                </span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          {/* Quantity + Primary CTAs */}
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container flex flex-col gap-3 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center border border-outline-variant rounded-lg bg-surface-container-low shrink-0">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2.5 text-on-surface hover:bg-surface-container font-bold"
                >
                  −
                </button>
                <span className="px-4 font-spec-code font-bold text-on-surface tabular-nums">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                  className="px-3.5 py-2.5 text-on-surface hover:bg-surface-container font-bold"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCheckoutQuantity(qty);
                  navigate('order-form', { productId: product.id });
                }}
                className="flex-1 py-3 px-5 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="material-symbols-outlined text-[19px]">shopping_cart</span>
                <span>Order Now (Cash on Delivery)</span>
              </button>
            </div>

            <a
              href={buildWhatsAppUrl(
                `Assalam-o-Alaikum ${siteSettings.site_name}, I want to order ${qty}x ${product.name} (${product.sku}) at ${formatPkr(product.price * qty)}.`,
                siteSettings.whatsapp_number
              )}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 rounded-lg bg-[#28A745] hover:bg-[#1e7e34] text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Order via WhatsApp ({formatDisplayIntlPhone(siteSettings.whatsapp_number)})</span>
            </a>

            <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
              <span>100% Genuine ASATEK</span>
              <span>Urdu &amp; English Manual Included</span>
              <span>7-Day Inspection Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hands-On Field Guide & Safe Wiring Sequence */}
      <section className="py-8 border-t border-surface-container">
        <div className="mb-5">
          <span className="text-label-uppercase text-primary block">HANDS-ON FIELD GUIDE</span>
          <h2 className="text-headline-md font-bold text-on-surface mt-1">
            Product Demonstration &amp; Safe Wiring Sequence
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 rounded-xl overflow-hidden bg-surface-container-lowest border border-surface-container relative min-h-[280px] flex flex-col justify-between">
            {videoOpen ? (
              <div className="p-6 bg-[#1c1b1b] text-white h-full flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-spec-code text-xs text-tertiary-fixed">
                    ASATEK QA LAB WALKTHROUGH · {product.sku}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVideoOpen(false)}
                    className="px-2.5 py-1 rounded bg-white/15 text-xs"
                  >
                    Close Player
                  </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-4">
                  <img
                    src={ASSETS.workshop}
                    alt="Technician walkthrough"
                    referrerPolicy="no-referrer"
                    className="w-full max-w-md h-44 object-cover rounded-lg border border-white/20"
                  />
                  <p className="text-sm text-white/90 max-w-md">
                    Step-by-Step Technician Guide: Connect battery bank first, verify voltage gauge deflection, attach solar PV terminals using pure copper cable, then engage DC load.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative h-full min-h-[280px]">
                <img
                  src={ASSETS.workshop}
                  alt="ASATEK installation tutorial"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <button
                    type="button"
                    onClick={() => setVideoOpen(true)}
                    className="w-16 h-16 rounded-full bg-primary hover:bg-primary-container text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                    aria-label="Play Installation Walkthrough"
                  >
                    <span className="material-symbols-outlined text-[34px]">play_arrow</span>
                  </button>
                  <div className="text-white">
                    <div className="font-bold text-base">Step-by-Step Installation: {product.name}</div>
                    <div className="font-spec-code text-xs text-white/80">Urdu &amp; English Walkthrough · 4:42</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 rounded-xl bg-surface-container-lowest border border-surface-container p-6 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface mb-1">Safe Wiring Sequence</h3>
              <p className="text-xs text-on-surface-variant mb-4">
                Follow this exact sequence to prevent high-voltage arcing across terminal gates.
              </p>
              <div className="flex flex-col gap-3">
                {product.wiringSteps.map((step, i) => (
                  <div key={step.title} className="p-3 rounded-lg bg-surface-container-low flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-on-surface">{step.title}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">{step.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSchematicOpen((v) => !v)}
              className="w-full py-2.5 px-4 rounded-lg border border-outline-variant hover:bg-surface-container-low text-primary text-xs font-semibold flex items-center justify-between"
            >
              <span>PDF Manual &amp; Wiring Schematics Included</span>
              <span className="material-symbols-outlined text-[18px]">
                {schematicOpen ? 'expand_less' : 'download'}
              </span>
            </button>
            {schematicOpen && (
              <div className="p-3 rounded-lg bg-surface-container-low font-spec-code text-xs text-on-surface">
                Wiring Diagram ({product.sku}): Battery (+) → Terminal B+ (10mm² Cu) | Solar (+) → PV+ | Load (+) → L+. Torque: 2.2 Nm.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Full Technical Specifications Table */}
      <section className="py-8 border-t border-surface-container">
        <span className="text-label-uppercase text-primary block">VERIFIED LABORATORY RATINGS</span>
        <h2 className="text-headline-md font-bold text-on-surface mt-1 mb-4">Full Technical Specifications</h2>
        <div className="rounded-xl border border-surface-container overflow-hidden bg-surface-container-lowest">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-xs font-semibold uppercase text-on-surface-variant border-b border-surface-container">
                <th className="py-3 px-4">Engineering Parameter</th>
                <th className="py-3 px-4 text-right">Standard Nominal Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-sm">
              {product.specs.map((spec, idx) => (
                <tr key={spec.parameter} className={idx % 2 === 1 ? 'bg-surface-container-low/50' : ''}>
                  <td className="py-3 px-4 font-medium text-on-surface">{spec.parameter}</td>
                  <td className="py-3 px-4 text-right font-spec-code text-on-surface font-semibold">
                    {spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Related Hardware */}
      <section className="py-8 border-t border-surface-container">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-label-uppercase text-primary block">HARDWARE LINEUP</span>
            <h2 className="text-headline-md font-bold text-on-surface">Related Power Electronics</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('products')}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Explore All Hardware →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate('product-detail', { productId: item.id })}
              className="text-left bg-surface-container-lowest rounded-xl border border-surface-container p-4 hover:shadow-md transition-all"
            >
              <div className="w-full h-44 rounded-lg overflow-hidden bg-surface-container mb-3">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-spec-code text-primary uppercase font-semibold">
                {item.voltage} · {item.amperageOrWatts}
              </span>
              <h3 className="text-base font-bold text-on-surface mt-0.5">{item.name}</h3>
              <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{item.subtitle}</p>
              <div className="mt-3 pt-2 border-t border-surface-container flex items-center justify-between">
                <span className="font-spec-code font-bold text-primary">{formatPkr(item.price)}</span>
                <span className="material-symbols-outlined text-primary text-[18px]">arrow_forward</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
