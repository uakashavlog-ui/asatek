import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { SystemVoltage } from '../../types/asatek';
import { formatPkr } from '../../utils/storeLogic';
import { ConfirmDialog } from '../modals/ConfirmDialog';

export const AdminProductsPage: React.FC = () => {
  const {
    products,
    toggleProductVisibility,
    duplicateProduct,
    deleteProduct,
    navigate,
    setSelectedProductId,
  } = useStore();

  const [search, setSearch] = useState('');
  const [voltageFilter, setVoltageFilter] = useState<'ALL' | SystemVoltage>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'live' | 'hidden'>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (voltageFilter !== 'ALL' && !p.voltage.includes(voltageFilter)) return false;
      if (visibilityFilter === 'live' && !p.isPublicVisible) return false;
      if (visibilityFilter === 'hidden' && p.isPublicVisible) return false;
      if (q) {
        const hay = `${p.name} ${p.sku} ${p.category} ${p.amperageOrWatts}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, search, voltageFilter, visibilityFilter]);

  const deleteTarget = products.find((p) => p.id === deleteTargetId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-extrabold text-on-surface">Products &amp; Inventory Catalog</h1>
          <p className="text-body-sm text-on-surface-variant">
            Manage ASATEK power units, pricing in PKR, factory stock counts, and public storefront visibility.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedProductId('');
            navigate('admin-product-form', { productId: '' });
          }}
          className="px-4 py-2.5 rounded-lg bg-primary hover:bg-secondary text-on-primary text-xs font-bold flex items-center gap-1.5 self-start"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>+ Add New Hardware Unit</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
          <span className="text-xs text-on-surface-variant block">Total SKUs</span>
          <strong className="text-2xl font-extrabold tabular-nums">{products.length}</strong>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
          <span className="text-xs text-tertiary font-semibold block">Public Live</span>
          <strong className="text-2xl font-extrabold text-tertiary tabular-nums">
            {products.filter((p) => p.isPublicVisible).length}
          </strong>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
          <span className="text-xs text-on-surface-variant block">Hidden / Draft</span>
          <strong className="text-2xl font-extrabold tabular-nums">
            {products.filter((p) => !p.isPublicVisible).length}
          </strong>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
          <span className="text-xs text-on-surface-variant block">Total Units in Stock</span>
          <strong className="text-2xl font-extrabold font-spec-code text-primary tabular-nums">
            {products.reduce((s, p) => s + p.stockCount, 0)}
          </strong>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search model name or SKU..."
          aria-label="Search Products"
          className="flex-1 rounded-lg border border-outline-variant px-3.5 py-2 text-sm"
        />

        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', '12V', '24V', '48V'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVoltageFilter(v)}
              className={`px-3 py-1.5 rounded-lg font-spec-code text-xs font-bold ${
                voltageFilter === v
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface'
              }`}
            >
              {v}
            </button>
          ))}

          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as typeof visibilityFilter)}
            aria-label="Filter visibility"
            className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="live">Public Live</option>
            <option value="hidden">Hidden / Draft</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-container-low text-xs font-semibold uppercase text-on-surface-variant border-b border-surface-container">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Specs</th>
                <th className="py-3 px-4">Pricing (PKR)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Storefront Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-surface-container-low/60">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-white border border-surface-container shrink-0"
                      />
                      <div>
                        <div className="font-bold text-on-surface">{prod.name}</div>
                        <div className="font-spec-code text-xs text-primary">{prod.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs">
                    <div className="font-semibold text-on-surface">{prod.category}</div>
                    <div className="font-spec-code text-on-surface-variant">
                      {prod.voltage} · {prod.amperageOrWatts}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-spec-code text-xs">
                    <div className="font-bold text-on-surface">{formatPkr(prod.price)}</div>
                    <div className="text-on-surface-variant">Wholesale: {formatPkr(prod.wholesalePrice)}</div>
                  </td>
                  <td className="py-3 px-4 font-spec-code text-xs">
                    <strong className={prod.stockCount <= prod.lowStockThreshold ? 'text-error' : 'text-tertiary'}>
                      {prod.stockCount} pcs
                    </strong>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleProductVisibility(prod.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                        prod.isPublicVisible
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {prod.isPublicVisible ? 'Public Live' : 'Hidden'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductId(prod.id);
                          navigate('admin-product-form', { productId: prod.id });
                        }}
                        className="px-2.5 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateProduct(prod.id)}
                        className="px-2.5 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-xs font-semibold"
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(prod.id)}
                        className="px-2.5 py-1.5 rounded bg-error-container text-on-error-container text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.name || 'Product'}?`}
        description="Are you sure you want to permanently remove this product from the ASATEK catalog?"
        confirmLabel="Delete Product"
        variant="danger"
        onConfirm={() => {
          if (deleteTargetId) deleteProduct(deleteTargetId);
          setDeleteTargetId(null);
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
