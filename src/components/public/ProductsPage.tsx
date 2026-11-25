import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { ProductCategory, SystemVoltage } from '../../types/asatek';
import { filterProducts, formatPkr } from '../../utils/storeLogic';

export const ProductsPage: React.FC = () => {
  const {
    products,
    language,
    catalogCategoryFilter,
    setCatalogCategoryFilter,
    catalogVoltageFilter,
    setCatalogVoltageFilter,
    navigate,
    setCheckoutQuantity,
  } = useStore();

  const [maxBudget, setMaxBudget] = useState<number>(25000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock-desc'>('featured');

  const publicProducts = useMemo(() => products.filter((p) => p.isPublicVisible), [products]);

  const categories: (ProductCategory | 'All Categories')[] = [
    'All Categories',
    'Solar Charge Controllers',
    'UPS / Inverters',
    'Battery Chargers',
    'Parts & Accessories',
  ];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Categories': publicProducts.length };
    for (const c of categories.slice(1)) {
      counts[c] = publicProducts.filter((p) => p.category === c).length;
    }
    return counts;
  }, [publicProducts]);

  const filtered = useMemo(
    () =>
      filterProducts(products, {
        category: catalogCategoryFilter,
        voltage: catalogVoltageFilter,
        maxBudget,
        search: searchQuery,
        sort: sortBy,
        onlyPublic: true,
      }),
    [products, catalogCategoryFilter, catalogVoltageFilter, maxBudget, searchQuery, sortBy]
  );

  const resetFilters = () => {
    setCatalogCategoryFilter('All Categories');
    setCatalogVoltageFilter('ALL');
    setMaxBudget(25000);
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-6">
      {/* Breadcrumb Bar matching Stitch code_bd80c420.html */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-surface-container text-xs text-on-surface-variant">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigate('home')} className="hover:text-primary">
            Home
          </button>
          <span>/</span>
          <span className="text-primary font-semibold">Products Hardware Catalog</span>
        </div>
        <div className="flex items-center gap-2 font-spec-code text-tertiary">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>All Units Pakistan QC Tested · Direct Dispatch from Lahore Hub</span>
        </div>
      </div>

      {/* Header & Search */}
      <div className="py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="font-spec-code text-xs text-primary font-semibold uppercase tracking-wider">
            COMMERCIAL &amp; RESIDENTIAL · DOC-REF: ASTK-HW-06
          </span>
          <h1 className="text-headline-lg font-extrabold text-on-surface mt-1">
            Hardware Catalog &amp; Inventory
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model, wattage, SKU..."
              aria-label="Search Hardware Catalog"
              className="w-full sm:w-72 pl-9 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="px-3.5 py-2 rounded-lg bg-surface-container-low border border-surface-container font-spec-code text-xs text-on-surface">
            Showing <strong className="text-primary">{filtered.length}</strong> units
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout: Filters Sidebar + 3-Col Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container">
            <div className="flex items-center gap-2 font-bold text-on-surface">
              <span className="material-symbols-outlined text-[20px] text-primary">tune</span>
              <span>Hardware Filters</span>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">refresh</span>
              <span>Reset</span>
            </button>
          </div>

          {/* Category Radios */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant mb-2.5">
              <span>Category</span>
              <span className="text-tertiary font-spec-code">READY TO SHIP</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => {
                const active = catalogCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCatalogCategoryFilter(cat)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-primary-fixed border-primary text-primary font-bold'
                        : 'bg-surface-container-lowest border-surface-container text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className="font-spec-code tabular-nums">{categoryCounts[cat] ?? 0}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voltage Buttons */}
          <div>
            <span className="text-xs font-semibold text-on-surface-variant block mb-2">
              System Voltage (DC)
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['ALL', '12V', '24V', '48V'] as (SystemVoltage | 'ALL')[]).map((v) => {
                const active = catalogVoltageFilter === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setCatalogVoltageFilter(v)}
                    className={`py-2 rounded-lg font-spec-code text-xs font-bold transition-colors ${
                      active
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Range Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <label htmlFor="budget-slider" className="font-semibold text-on-surface-variant">
                Max Budget (PKR)
              </label>
              <span className="font-spec-code font-bold text-primary tabular-nums">
                {formatPkr(maxBudget)}
              </span>
            </div>
            <input
              id="budget-slider"
              type="range"
              min={2000}
              max={25000}
              step={500}
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-[#9e0000]"
            />
            <div className="flex justify-between font-spec-code text-[11px] text-on-surface-variant mt-1">
              <span>PKR 2,000</span>
              <span>PKR 25,000</span>
            </div>
          </div>

          {/* Sort Select */}
          <div>
            <label htmlFor="catalog-sort" className="text-xs font-semibold text-on-surface-variant block mb-2">
              Sort Architecture
            </label>
            <select
              id="catalog-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="featured">Featured Hardware</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-desc">Highest Factory Stock</option>
            </select>
          </div>

          <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-container text-xs text-on-surface-variant">
            <strong className="text-on-surface block mb-1">Industrial Grade Build</strong>
            Heavy copper transformers, aluminum thermal heatsinks, and anti-sulfation charging profiles.
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {filtered.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-12 text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-[42px] text-on-surface-variant">inventory_2</span>
              <h2 className="text-headline-sm font-bold text-on-surface">No Matching Hardware Found</h2>
              <p className="text-body-sm text-on-surface-variant max-w-md">
                Try increasing the PKR budget slider or resetting voltage &amp; category filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((product) => (
                <article
                  key={product.id}
                  className="bg-surface-container-lowest rounded-xl border border-surface-container p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5 text-xs">
                      <span className="font-spec-code font-bold text-primary uppercase">
                        {product.badge || product.category}
                      </span>
                      <span className="font-spec-code text-tertiary font-semibold">
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('product-detail', { productId: product.id })}
                      className="w-full h-48 rounded-lg overflow-hidden bg-surface-container mb-3 block"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </button>

                    <div className="flex items-center justify-between text-xs font-spec-code text-on-surface-variant mb-1">
                      <span className="text-primary font-semibold uppercase">{product.category}</span>
                      <span>
                        {product.voltage} / {product.amperageOrWatts}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-on-surface mb-2">
                      {language === 'ur' ? product.urduName : product.name}
                    </h2>

                    <div className="rounded-lg bg-surface-container-low p-2.5 text-xs flex flex-col gap-1 font-spec-code">
                      <div className="flex justify-between gap-2">
                        <span className="text-on-surface-variant">Control Tech:</span>
                        <span className="text-on-surface font-semibold text-right">{product.controlTech}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-on-surface-variant">Weight:</span>
                        <span className="text-on-surface font-semibold">{product.weightKg} kg</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-on-surface-variant">COD Ready:</span>
                        <span className="text-tertiary font-semibold">{product.codEligible ? 'Yes (All PK)' : 'Factory Pickup'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-container">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[11px] text-on-surface-variant block">Direct Trade Rate</span>
                        <span className="text-xl font-extrabold text-on-surface font-spec-code tabular-nums">
                          {formatPkr(product.price)}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed text-xs font-semibold">
                        {Math.round(product.warrantyMonths / 12)}-Yr Warranty
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCheckoutQuantity(1);
                          navigate('order-form', { productId: product.id });
                        }}
                        className="py-2 px-3 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">shopping_cart</span>
                        <span>Order Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('product-detail', { productId: product.id })}
                        className="py-2 px-3 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <span>Details</span>
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Dealership Quotation Callout */}
          <div className="rounded-xl bg-surface-container-low border border-surface-container p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">precision_manufacturing</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">
                  Need Bulk Distribution or Dealership Quotation?
                </h3>
                <p className="text-xs text-on-surface-variant">
                  We supply wholesale carton lots across all 4 provinces with certified commercial billing.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('contact')}
              className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-primary text-xs font-semibold whitespace-nowrap shrink-0"
            >
              Contact Commercial Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
