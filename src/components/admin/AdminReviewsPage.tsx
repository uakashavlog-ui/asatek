import React, { useMemo, useState } from 'react';
import { ASSETS } from '../../data/seedData';
import { useStore } from '../../context/StoreContext';
import type { ReviewStatus } from '../../types/asatek';
import { ConfirmDialog } from '../modals/ConfirmDialog';
import { SafeImage } from '../common/SafeImage';
import { ImageInputControl } from './ImageInputControl';

export const AdminReviewsPage: React.FC = () => {
  const { reviews, products, addReview, updateReview, deleteReview } = useStore();
  const [statusTab, setStatusTab] = useState<'All' | ReviewStatus>('All');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [imageLinkError, setImageLinkError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [newForm, setNewForm] = useState({
    customerName: '',
    city: '',
    productId: products[0]?.id || 'sc5-va1260',
    rating: 5,
    setupMetric: '',
    comment: '',
    image: ASSETS.tubewell,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reviews.filter((r) => {
      if (statusTab !== 'All' && r.status !== statusTab) return false;
      if (q) {
        const hay = `${r.customerName} ${r.city} ${r.productName} ${r.comment}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [reviews, statusTab, search]);

  const handleIngestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageLinkError) {
      setFormError(imageLinkError);
      return;
    }
    if (!newForm.customerName.trim() || !newForm.comment.trim()) return;
    setFormError(null);
    const prod = products.find((p) => p.id === newForm.productId);
    addReview({
      customerName: newForm.customerName.trim(),
      city: newForm.city.trim() || 'Lahore, Punjab',
      productId: newForm.productId,
      productName: prod?.name || 'ASATEK Unit',
      rating: newForm.rating,
      setupMetric: newForm.setupMetric.trim() || 'Verified Field Setup',
      comment: newForm.comment.trim(),
      image: newForm.image.trim() || undefined,
      verifiedBuyer: true,
      status: 'Published',
    });
    setNewForm({
      customerName: '',
      city: '',
      productId: products[0]?.id || 'sc5-va1260',
      rating: 5,
      setupMetric: '',
      comment: '',
      image: ASSETS.tubewell,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-headline-md font-extrabold text-on-surface">Customer Reviews &amp; Field Media Manager</h1>
        <p className="text-body-sm text-on-surface-variant">
          Approve WhatsApp field installation testimonials, moderate pending reviews, or upload new customer photos.
        </p>
      </div>

      {/* Fast Ingestion Form matching Stitch code_15935a4c.html */}
      <form
        onSubmit={handleIngestSubmit}
        className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-3 items-end"
      >
        <div className="md:col-span-2">
          <label className="text-xs font-semibold block mb-1">Customer / Tech Name</label>
          <input
            required
            type="text"
            value={newForm.customerName}
            onChange={(e) => setNewForm({ ...newForm, customerName: e.target.value })}
            placeholder="e.g. Haji Ashraf"
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">City / Tehsil</label>
          <input
            required
            type="text"
            value={newForm.city}
            onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
            placeholder="Sargodha"
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">Hardware Model</label>
          <select
            value={newForm.productId}
            onChange={(e) => setNewForm({ ...newForm, productId: e.target.value })}
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-xs"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1">Setup Metric</label>
          <input
            type="text"
            value={newForm.setupMetric}
            onChange={(e) => setNewForm({ ...newForm, setupMetric: e.target.value })}
            placeholder="12V · 600W PV"
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-xs font-spec-code"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg bg-primary hover:bg-secondary text-on-primary text-xs font-bold"
          >
            + Publish Field Review
          </button>
        </div>
        <div className="md:col-span-6">
          <input
            required
            type="text"
            value={newForm.comment}
            onChange={(e) => setNewForm({ ...newForm, comment: e.target.value })}
            placeholder="Customer field quote or technician installation note..."
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-xs"
          />
        </div>
        <div className="md:col-span-6">
          <ImageInputControl
            label="Customer Field Installation Photo"
            value={newForm.image}
            onChange={(url) => setNewForm((prev) => ({ ...prev, image: url }))}
            onValidityChange={(valid, err) => {
              setImageLinkError(valid ? null : err || 'Invalid image link');
              if (valid) setFormError(null);
            }}
            uploadFolder="reviews"
            allowSvg={false}
            allowClear={true}
            previewClassName="w-16 h-14 rounded-lg overflow-hidden bg-white border border-outline-variant shrink-0"
            previewImageClassName="w-full h-full object-cover"
            previewAlt="Review installation preview"
            inputIdPrefix="review-image"
            compact={true}
          />
          {formError && (
            <p role="alert" className="text-xs text-error font-semibold mt-1.5">
              {formError}
            </p>
          )}
        </div>
      </form>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(['All', 'Published', 'Pending', 'Hidden'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusTab(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
                statusTab === st
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest border border-surface-container text-on-surface'
              }`}
            >
              {st} ({st === 'All' ? reviews.length : reviews.filter((r) => r.status === st).length})
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer or city..."
          className="w-full sm:w-64 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs"
        />
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((rev) => (
          <div
            key={rev.id}
            className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="w-full h-36 bg-surface-container-low overflow-hidden">
                <SafeImage
                  src={rev.image}
                  alt={rev.productName}
                  className="w-full h-full object-cover"
                  placeholderLabel={rev.productName}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      rev.status === 'Published'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : rev.status === 'Pending'
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {rev.status}
                  </span>
                  <span className="font-spec-code text-primary font-bold">{rev.rating}.0 ★</span>
                </div>
                <strong className="text-sm text-on-surface block">
                  {rev.customerName} · {rev.city}
                </strong>
                <span className="font-spec-code text-[11px] text-on-surface-variant block mb-2">
                  {rev.productName}
                </span>
                <p className="text-xs text-on-surface leading-relaxed">{rev.comment}</p>
              </div>
            </div>

            <div className="p-3 bg-surface-container-low border-t border-surface-container flex items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {rev.status !== 'Published' && (
                  <button
                    type="button"
                    onClick={() => updateReview({ ...rev, status: 'Published' })}
                    className="px-2.5 py-1 rounded bg-tertiary text-on-tertiary text-xs font-semibold"
                  >
                    Approve
                  </button>
                )}
                {rev.status === 'Published' && (
                  <button
                    type="button"
                    onClick={() => updateReview({ ...rev, status: 'Hidden' })}
                    className="px-2.5 py-1 rounded bg-surface-container text-on-surface text-xs font-semibold"
                  >
                    Hide
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setDeleteId(rev.id)}
                className="px-2.5 py-1 rounded bg-error-container text-on-error-container text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Customer Review?"
        description="This review will be permanently removed from both the Admin Manager and the Public Reviews gallery."
        confirmLabel="Delete Review"
        variant="danger"
        onConfirm={() => {
          if (deleteId) deleteReview(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
