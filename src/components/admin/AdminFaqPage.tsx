import React, { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { FaqCategory, FaqItem } from '../../types/asatek';
import { ConfirmDialog } from '../modals/ConfirmDialog';

export const AdminFaqPage: React.FC = () => {
  const { faqs, saveFaq, deleteFaq, moveFaqOrder } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FaqCategory | 'All'>('All');
  const [reorderMode, setReorderMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqItem>({
    id: '',
    orderIndex: faqs.length + 1,
    category: 'Installation & Wiring',
    questionEn: '',
    answerEn: '',
    questionUr: '',
    answerUr: '',
    published: true,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...faqs]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .filter((f) => {
        if (categoryFilter !== 'All' && f.category !== categoryFilter) return false;
        if (q) {
          const hay = `${f.questionEn} ${f.answerEn} ${f.questionUr} ${f.category}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
  }, [faqs, search, categoryFilter]);

  const openNew = () => {
    setForm({
      id: `faq-${Date.now().toString().slice(-4)}`,
      orderIndex: faqs.length + 1,
      category: 'Installation & Wiring',
      questionEn: '',
      answerEn: '',
      questionUr: '',
      answerUr: '',
      published: true,
    });
    setModalOpen(true);
  };

  const openEdit = (item: FaqItem) => {
    setForm({
      ...item,
      questionEn: item.questionEn ?? '',
      answerEn: item.answerEn ?? '',
      questionUr: item.questionUr ?? '',
      answerUr: item.answerUr ?? '',
      published: Boolean(item.published),
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.questionEn.trim() || !form.answerEn.trim()) return;
    saveFaq({
      ...form,
      questionUr: form.questionUr.trim() || form.questionEn.trim(),
      answerUr: form.answerUr.trim() || form.answerEn.trim(),
    });
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-extrabold text-on-surface">FAQ Knowledge Base Manager</h1>
          <p className="text-body-sm text-on-surface-variant">
            Manage English &amp; Urdu support questions and reorder display priority on the public storefront.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReorderMode((v) => !v)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold border ${
              reorderMode
                ? 'bg-tertiary-fixed border-tertiary text-on-tertiary-fixed'
                : 'border-outline-variant bg-surface-container-lowest text-on-surface'
            }`}
          >
            {reorderMode ? 'Reorder Mode: ON' : 'Reorder Mode'}
          </button>
          <button
            type="button"
            onClick={openNew}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-secondary text-on-primary text-xs font-bold"
          >
            + Add FAQ Entry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-4 flex flex-col md:flex-row gap-3 justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(['All', 'Installation & Wiring', 'Solar Compatibility', 'Warranty & Claims', 'COD & Shipping'] as const).map(
            (cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  categoryFilter === cat
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search FAQ text..."
          className="w-full md:w-64 rounded-lg border border-outline-variant px-3 py-1.5 text-xs"
        />
      </div>

      {/* FAQ Cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((faq) => (
          <div
            key={faq.id}
            className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="font-spec-code font-bold text-primary">#{faq.orderIndex}</span>
                <span className="font-semibold text-on-surface-variant">{faq.category}</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    faq.published
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {faq.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <h2 className="text-base font-bold text-on-surface">{faq.questionEn}</h2>
              <p className="text-xs text-on-surface-variant mt-1">{faq.answerEn}</p>
              <p className="text-xs text-on-surface-variant mt-2 text-right" dir="rtl" lang="ur">
                {faq.questionUr}
              </p>
            </div>

            <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
              {reorderMode && (
                <div className="flex gap-1 mb-1">
                  <button
                    type="button"
                    aria-label="Move FAQ up"
                    onClick={() => moveFaqOrder(faq.id, 'up')}
                    className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Move FAQ down"
                    onClick={() => moveFaqOrder(faq.id, 'down')}
                    className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </button>
                </div>
              )}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(faq)}
                  className="px-3 py-1.5 rounded bg-surface-container text-xs font-semibold"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(faq.id)}
                  className="px-3 py-1.5 rounded bg-error-container text-on-error-container text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-xl bg-surface-container-lowest border border-surface-container p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-on-surface">Bilingual FAQ Entry</h2>
              <button type="button" onClick={() => setModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as FaqCategory })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              >
                <option value="Installation & Wiring">Installation &amp; Wiring</option>
                <option value="Solar Compatibility">Solar Compatibility</option>
                <option value="Warranty & Claims">Warranty &amp; Claims</option>
                <option value="COD & Shipping">COD &amp; Shipping</option>
              </select>
              <input
                required
                type="text"
                placeholder="Question (English)"
                value={form.questionEn}
                onChange={(e) => setForm({ ...form, questionEn: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <textarea
                required
                rows={2}
                placeholder="Answer (English)"
                value={form.answerEn}
                onChange={(e) => setForm({ ...form, answerEn: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <input
                type="text"
                dir="rtl"
                placeholder="سوال (اردو)"
                value={form.questionUr}
                onChange={(e) => setForm({ ...form, questionUr: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <textarea
                rows={2}
                dir="rtl"
                placeholder="جواب (اردو)"
                value={form.answerUr}
                onChange={(e) => setForm({ ...form, answerUr: e.target.value })}
                className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="accent-[#005a1d]"
                />
                <span>Published on Public FAQ Page</span>
              </label>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-primary text-on-primary text-xs font-bold">
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete FAQ Entry?"
        description="This FAQ will be removed from the public Knowledge Base."
        confirmLabel="Delete FAQ"
        variant="danger"
        onConfirm={() => {
          if (deleteId) deleteFaq(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
