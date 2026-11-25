import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';

export const ReviewsPage: React.FC = () => {
  const { reviews, products, language, addReview, navigate } = useStore();
  const [modelFilter, setModelFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);
  const [formState, setFormState] = useState({
    customerName: '',
    city: '',
    productId: products[0]?.id || 'sc5-va1260',
    rating: 5,
    setupMetric: '',
    comment: '',
  });

  const publishedReviews = useMemo(
    () => reviews.filter((r) => r.status === 'Published'),
    [reviews]
  );

  const filterModels = ['All', 'SC5 VA-1260', 'SC5 VA-2460', 'SC6-1230', 'UPS 1000W', 'Charger 12V 20A'];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return publishedReviews.filter((r) => {
      if (modelFilter !== 'All' && !r.productName.toLowerCase().includes(modelFilter.toLowerCase())) {
        return false;
      }
      if (q) {
        const hay = `${r.customerName} ${r.city} ${r.productName} ${r.comment} ${r.setupMetric}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [publishedReviews, modelFilter, search]);

  const avgRating =
    publishedReviews.length > 0
      ? (publishedReviews.reduce((s, r) => s + r.rating, 0) / publishedReviews.length).toFixed(1)
      : '4.9';

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.customerName.trim() || !formState.comment.trim()) return;
    const prod = products.find((p) => p.id === formState.productId);
    addReview({
      customerName: formState.customerName.trim(),
      city: formState.city.trim() || 'Pakistan',
      productId: formState.productId,
      productName: prod?.name || 'ASATEK Unit',
      rating: formState.rating,
      comment: formState.comment.trim(),
      setupMetric: formState.setupMetric.trim() || 'Verified Field Setup',
      verifiedBuyer: true,
      status: 'Published',
    });
    setFormState({
      customerName: '',
      city: '',
      productId: products[0]?.id || 'sc5-va1260',
      rating: 5,
      setupMetric: '',
      comment: '',
    });
    setSubmitModalOpen(false);
    setSubmittedNotice(true);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-surface-container">
        <div>
          <span className="font-spec-code text-xs font-bold text-primary uppercase tracking-wider">
            VERIFIED FIELD INSTALLATIONS · PAKISTAN
          </span>
          <h1 className="text-display-hero text-on-surface mt-1">
            Customer Reviews &amp; <span className="text-primary">Real Setups</span>
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl mt-1">
            Authentic field performance reports from homes, dairy farms, and workshops across Punjab, Sindh, KPK, and Balochistan.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSubmitModalOpen(true)}
          className="px-5 py-3 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-sm font-semibold flex items-center gap-2 self-start"
        >
          <span className="material-symbols-outlined text-[18px]">rate_review</span>
          <span>Share Your Setup Review</span>
        </button>
      </div>

      {submittedNotice && (
        <div className="mt-4 p-3.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-sm flex items-center justify-between">
          <span>Thank you! Your installation review has been published to the field gallery.</span>
          <button type="button" onClick={() => setSubmittedNotice(false)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
          <span className="text-xs text-on-surface-variant block">Average Field Score</span>
          <strong className="text-2xl font-extrabold text-primary font-spec-code tabular-nums">
            {avgRating} / 5.0
          </strong>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
          <span className="text-xs text-on-surface-variant block">Verified Reviews</span>
          <strong className="text-2xl font-extrabold text-on-surface font-spec-code tabular-nums">
            {publishedReviews.length} Setups
          </strong>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
          <span className="text-xs text-on-surface-variant block">Thermal Survival</span>
          <strong className="text-2xl font-extrabold text-tertiary font-spec-code tabular-nums">55°C Tested</strong>
        </div>
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
          <span className="text-xs text-on-surface-variant block">Warranty Coverage</span>
          <strong className="text-2xl font-extrabold text-on-surface font-spec-code tabular-nums">15+ Cities</strong>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {filterModels.map((model) => (
            <button
              key={model}
              type="button"
              onClick={() => setModelFilter(model)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                modelFilter === model
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest border border-surface-container text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {model}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search city or review keyword..."
          aria-label="Search customer reviews"
          className="w-full md:w-64 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Review Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-10 rounded-xl bg-surface-container-lowest border border-surface-container text-center">
          <p className="text-sm font-semibold text-on-surface">No reviews match this filter.</p>
          <button
            type="button"
            onClick={() => {
              setModelFilter('All');
              setSearch('');
            }}
            className="mt-3 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((rev) => (
            <article
              key={rev.id}
              className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                {rev.image && (
                  <div className="h-44 w-full bg-surface-container overflow-hidden">
                    <img
                      src={rev.image}
                      alt={`${rev.productName} installation in ${rev.city}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-spec-code font-bold text-primary">{rev.rating}.0 ★ Verified</span>
                    <span className="text-on-surface-variant font-spec-code">{rev.createdAt}</span>
                  </div>
                  <h2 className="text-base font-bold text-on-surface">{rev.customerName}</h2>
                  <p className="text-xs text-on-surface-variant mb-3">{rev.city}</p>
                  <p className="text-body-sm text-on-surface leading-relaxed">
                    {language === 'ur' && rev.urduComment ? rev.urduComment : rev.comment}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 bg-surface-container-low border-t border-surface-container flex items-center justify-between gap-2 text-xs">
                <span className="font-spec-code text-on-surface-variant truncate">{rev.setupMetric}</span>
                <button
                  type="button"
                  onClick={() => navigate('product-detail', { productId: rev.productId })}
                  className="text-primary font-bold hover:underline shrink-0"
                >
                  View Unit →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {submitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest border border-surface-container p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-on-surface">Submit Installation Review</h3>
              <button type="button" onClick={() => setSubmitModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
              <input
                required
                type="text"
                placeholder="Your Full Name"
                value={formState.customerName}
                onChange={(e) => setFormState({ ...formState, customerName: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <input
                required
                type="text"
                placeholder="City (e.g. Multan, Lahore)"
                value={formState.city}
                onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <select
                value={formState.productId}
                onChange={(e) => setFormState({ ...formState, productId: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Setup Details (e.g. 2x 550W Panels, 180Ah)"
                value={formState.setupMetric}
                onChange={(e) => setFormState({ ...formState, setupMetric: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <select
                value={formState.rating}
                onChange={(e) => setFormState({ ...formState, rating: Number(e.target.value) })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              >
                <option value={5}>5 Stars — Excellent Performance</option>
                <option value={4}>4 Stars — Very Good</option>
                <option value={3}>3 Stars — Satisfactory</option>
              </select>
              <textarea
                required
                rows={3}
                placeholder="Share how the unit performs in your daily load-shedding or solar setup..."
                value={formState.comment}
                onChange={(e) => setFormState({ ...formState, comment: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <button type="submit" className="py-2.5 rounded-lg bg-primary text-on-primary text-sm font-bold">
                Publish Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
