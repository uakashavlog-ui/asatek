import React, { useState } from 'react';
import { ASSETS } from '../../data/seedData';
import { useStore } from '../../context/StoreContext';
import type { Product, ProductCategory, SystemVoltage } from '../../types/asatek';
import { SafeImage } from '../common/SafeImage';
import { ImageInputControl } from './ImageInputControl';

export const AdminProductFormPage: React.FC = () => {
  const { products, selectedProductId, saveProduct, navigate } = useStore();
  const existing = products.find((p) => p.id === selectedProductId);

  const [form, setForm] = useState<Product>(() =>
    existing
      ? {
          ...existing,
          name: existing.name ?? '',
          sku: existing.sku ?? '',
          urduName: existing.urduName ?? '',
          subtitle: existing.subtitle ?? '',
          amperageOrWatts: existing.amperageOrWatts ?? '',
          description: existing.description ?? '',
          urduDescription: existing.urduDescription ?? '',
          warehouseLocation: existing.warehouseLocation ?? '',
          price: Number.isFinite(existing.price) ? existing.price : 0,
          msrp: Number.isFinite(existing.msrp) ? existing.msrp : 0,
          wholesalePrice: Number.isFinite(existing.wholesalePrice) ? existing.wholesalePrice : 0,
          stockCount: Number.isFinite(existing.stockCount) ? existing.stockCount : 0,
          weightKg: Number.isFinite(existing.weightKg) ? existing.weightKg : 0,
          codEligible: Boolean(existing.codEligible),
          specs: Array.isArray(existing.specs)
            ? existing.specs.map((s) => ({ parameter: s.parameter ?? '', value: s.value ?? '' }))
            : [],
          features: Array.isArray(existing.features)
            ? existing.features.map((f) => f ?? '')
            : [],
          images: Array.isArray(existing.images) ? [...existing.images] : [],
        }
      : {
          id: `ast-${Date.now().toString().slice(-5)}`,
          sku: `AST-NEW-${Date.now().toString().slice(-4)}`,
          name: '',
          urduName: '',
          subtitle: '',
          category: 'Solar Charge Controllers',
          voltage: '12V',
          amperageOrWatts: '60A',
          controlTech: '12V 60A PWM',
          price: 4500,
          msrp: 5200,
          wholesalePrice: 3900,
          badge: 'NEW RELEASE',
          inStock: true,
          stockCount: 50,
          lowStockThreshold: 10,
          warehouseLocation: 'Lahore Plant 2 — Sundar Industrial',
          weightKg: 3.0,
          dimensionsMm: '250 x 200 x 110',
          warrantyMonths: 12,
          codEligible: true,
          urduManualIncluded: true,
          isPublicVisible: true,
          images: [ASSETS.sc5_1260],
          description: '',
          urduDescription: '',
          features: ['100% Genuine ASATEK Pakistan Assembly'],
          specs: [{ parameter: 'System Voltage', value: '12V DC' }],
          wiringSteps: [
            { title: 'Connect Battery First', detail: 'Attach battery terminals before solar array.' },
          ],
          quickStats: { currentLoad: '60A Cont.', maxArray: '1000W PV', coverage: '1 Yr Direct' },
        }
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imageLinkError, setImageLinkError] = useState<string | null>(null);

  const handlePrimaryImageChange = (newUrl: string) => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    setForm((prev) => ({
      ...prev,
      images: [trimmed, ...prev.images.filter((img) => img !== trimmed)],
    }));
  };

  const handleSave = (publishVisible: boolean) => {
    if (imageLinkError) {
      setErrorMsg(imageLinkError);
      return;
    }
    if (!form.name.trim() || !form.sku.trim()) {
      setErrorMsg('Product Name and SKU are required.');
      return;
    }
    saveProduct({
      ...form,
      isPublicVisible: publishVisible,
      inStock: form.stockCount > 0,
      urduName: form.urduName.trim() || form.name.trim(),
      urduDescription: form.urduDescription.trim() || form.description.trim(),
    });
    navigate('admin-products');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('admin-products')}
            className="text-xs font-bold text-primary hover:underline mb-1 block"
          >
            ← Back to Products Inventory
          </button>
          <h1 className="text-headline-md font-extrabold text-on-surface">
            {existing ? `Edit Hardware: ${existing.name}` : 'Add New Hardware Unit'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('admin-products')}
            className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-bold"
          >
            Save as Hidden Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="px-5 py-2 rounded-lg bg-primary hover:bg-secondary text-on-primary text-xs font-bold shadow-sm"
          >
            Publish &amp; Save Product
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-error-container text-on-error-container text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-base font-bold text-on-surface">Basic Hardware Identification</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Product Name (EN) *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. ASATEK SC5 VA-1260"
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">SKU Code *</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Short Catalog Subtitle</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Heavy-Duty 12V 60A PWM Solar Controller with Dual Analog Meters"
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
                >
                  <option value="Solar Charge Controllers">Solar Charge Controllers</option>
                  <option value="UPS / Inverters">UPS / Inverters</option>
                  <option value="Battery Chargers">Battery Chargers</option>
                  <option value="Parts & Accessories">Parts &amp; Accessories</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">System Voltage</label>
                <select
                  value={form.voltage}
                  onChange={(e) => setForm({ ...form, voltage: e.target.value as SystemVoltage })}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
                >
                  <option value="12V">12V</option>
                  <option value="24V">24V</option>
                  <option value="48V">48V</option>
                  <option value="12V/24V">12V/24V</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Rating (Amps / Watts)</label>
                <input
                  type="text"
                  value={form.amperageOrWatts}
                  onChange={(e) => setForm({ ...form, amperageOrWatts: e.target.value })}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Technical Description (EN)</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
            </div>
          </section>

          {/* Specifications Builder */}
          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-on-surface">Hardware Specifications Builder</h2>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    specs: [...prev.specs, { parameter: '', value: '' }],
                  }))
                }
                className="px-3 py-1.5 rounded-lg bg-primary-fixed text-primary text-xs font-bold"
              >
                + Add Specification Parameter
              </button>
            </div>
            {form.specs.map((spec, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Parameter"
                  value={spec.parameter}
                  onChange={(e) => {
                    const next = [...form.specs];
                    next[idx] = { ...next[idx], parameter: e.target.value };
                    setForm({ ...form, specs: next });
                  }}
                  className="col-span-5 rounded-lg border border-outline-variant px-3 py-1.5 text-xs"
                />
                <input
                  type="text"
                  placeholder="Nominal Value"
                  value={spec.value}
                  onChange={(e) => {
                    const next = [...form.specs];
                    next[idx] = { ...next[idx], value: e.target.value };
                    setForm({ ...form, specs: next });
                  }}
                  className="col-span-6 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-spec-code"
                />
                <button
                  type="button"
                  aria-label="Remove spec row"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      specs: prev.specs.filter((_, i) => i !== idx),
                    }))
                  }
                  className="col-span-1 text-error hover:bg-error-container rounded p-1 flex justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))}
          </section>

          {/* Engineering Features */}
          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-on-surface">Key Engineering Highlights</h2>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, features: [...prev.features, ''] }))
                }
                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-bold"
              >
                + Add Feature Bullet
              </button>
            </div>
            {form.features.map((feat, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={feat}
                  onChange={(e) => {
                    const next = [...form.features];
                    next[idx] = e.target.value;
                    setForm({ ...form, features: next });
                  }}
                  className="flex-1 rounded-lg border border-outline-variant px-3 py-1.5 text-xs"
                />
                <button
                  type="button"
                  aria-label="Delete feature"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      features: prev.features.filter((_, i) => i !== idx),
                    }))
                  }
                  className="text-error hover:bg-error-container rounded p-1"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            ))}
          </section>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm flex flex-col gap-3">
            <h2 className="text-base font-bold text-on-surface">Commercials &amp; Pricing (PKR)</h2>
            <div>
              <label className="text-xs font-semibold block mb-1">Direct Retail Price (PKR)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">MSRP</label>
                <input
                  type="number"
                  value={form.msrp}
                  onChange={(e) => setForm({ ...form, msrp: Number(e.target.value) })}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Wholesale</label>
                <input
                  type="number"
                  value={form.wholesalePrice}
                  onChange={(e) => setForm({ ...form, wholesalePrice: Number(e.target.value) })}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold pt-1">
              <input
                type="checkbox"
                checked={form.codEligible}
                onChange={(e) => setForm({ ...form, codEligible: e.target.checked })}
                className="accent-[#005a1d]"
              />
              <span>Cash on Delivery (COD) Nationwide Eligible</span>
            </label>
          </section>

          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm flex flex-col gap-3">
            <h2 className="text-base font-bold text-on-surface">Inventory &amp; Logistics</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Stock Qty</label>
                <input
                  type="number"
                  value={form.stockCount}
                  onChange={(e) => setForm({ ...form, stockCount: Number(e.target.value) })}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
                  className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">Warehouse Location</label>
              <input
                type="text"
                value={form.warehouseLocation}
                onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-xs"
              />
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm flex flex-col gap-3">
            <h2 className="text-base font-bold text-on-surface">Product Gallery &amp; Media</h2>
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {form.images.map((img, i) => (
                  <div key={`${img}-${i}`} className="relative h-20 rounded-lg overflow-hidden border border-surface-container group bg-surface-container-low">
                    <SafeImage src={img} alt="Product preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove product image ${i + 1}`}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-[11px] flex items-center justify-center opacity-90 hover:bg-error"
                    >
                      ×
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-primary text-on-primary text-[9px] font-bold">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <ImageInputControl
              label="Primary Product Image"
              value={form.images[0] || ''}
              onChange={handlePrimaryImageChange}
              onValidityChange={(valid, err) => setImageLinkError(valid ? null : err || 'Invalid image link')}
              uploadFolder="products"
              allowSvg={false}
              previewClassName="w-16 h-16 rounded-lg overflow-hidden bg-white border border-outline-variant shrink-0"
              previewImageClassName="w-full h-full object-cover"
              previewAlt="Primary product image preview"
              inputIdPrefix="product-primary-image"
              compact={true}
            />
          </section>

          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm flex flex-col gap-3">
            <h2 className="text-base font-bold text-on-surface">Urdu Localization (اردو)</h2>
            <input
              type="text"
              dir="rtl"
              placeholder="اردو پروڈکٹ ٹائٹل"
              value={form.urduName}
              onChange={(e) => setForm({ ...form, urduName: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
            />
            <textarea
              rows={2}
              dir="rtl"
              placeholder="اردو تفصیل"
              value={form.urduDescription}
              onChange={(e) => setForm({ ...form, urduDescription: e.target.value })}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
            />
          </section>
        </div>
      </div>
    </div>
  );
};
