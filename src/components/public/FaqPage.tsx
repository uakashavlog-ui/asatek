import React, { useMemo, useState } from 'react';
import { ASSETS } from '../../data/seedData';
import { useStore } from '../../context/StoreContext';
import type { FaqCategory } from '../../types/asatek';
import { buildWhatsAppUrl } from '../../utils/storeLogic';
import { SafeImage } from '../common/SafeImage';

export const FaqPage: React.FC = () => {
  const { faqs, language, siteSettings, navigate } = useStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FaqCategory | 'All'>('All');
  const [openId, setOpenId] = useState<string>(faqs[0]?.id || '');

  const categories: (FaqCategory | 'All')[] = [
    'All',
    'Installation & Wiring',
    'Solar Compatibility',
    'Warranty & Claims',
    'COD & Shipping',
  ];

  const publishedFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...faqs]
      .filter((f) => f.published)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .filter((f) => {
        if (categoryFilter !== 'All' && f.category !== categoryFilter) return false;
        if (q) {
          const hay = `${f.questionEn} ${f.answerEn} ${f.questionUr} ${f.answerUr} ${f.category}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
  }, [faqs, search, categoryFilter]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8">
      <div className="mb-8 pb-6 border-b border-surface-container flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="font-spec-code text-xs font-bold text-primary uppercase tracking-wider">
            ASATEK KNOWLEDGE BASE · EN / اردو
          </span>
          <h1 className="text-display-hero text-on-surface mt-1">
            Technical Support &amp; <span className="text-primary">Frequently Asked Questions</span>
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-2xl mt-1">
            Wiring sequences, solar panel Voc compatibility, Cash on Delivery timelines, and 1-year warranty instructions.
          </p>
        </div>
      </div>

      {/* Search & Categories */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                categoryFilter === cat
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest border border-surface-container text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search wiring, Voc, COD, warranty..."
          aria-label="Search FAQs"
          className="w-full md:w-72 rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Accordion Column */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {publishedFaqs.length === 0 ? (
            <div className="p-8 rounded-xl bg-surface-container-lowest border border-surface-container text-center">
              <p className="text-sm font-semibold text-on-surface">No FAQ topics match your search.</p>
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('All');
                  setSearch('');
                }}
                className="mt-3 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold"
              >
                Show All Topics
              </button>
            </div>
          ) : (
            publishedFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? '' : faq.id)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-surface-container-low transition-colors"
                  >
                    <div>
                      <span className="font-spec-code text-[11px] font-bold text-primary uppercase block mb-1">
                        {faq.category}
                      </span>
                      <span className="text-base font-bold text-on-surface block">
                        {language === 'ur' ? faq.questionUr : faq.questionEn}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-primary shrink-0">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 border-t border-surface-container bg-surface-container-low/40 text-body-sm text-on-surface leading-relaxed">
                      <p>{language === 'ur' ? faq.answerUr : faq.answerEn}</p>
                      {language === 'en' && faq.answerUr && (
                        <p className="mt-3 pt-3 border-t border-surface-container text-right text-on-surface-variant" dir="rtl" lang="ur">
                          {faq.answerUr}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column Factory Assurance */}
        <aside className="lg:col-span-4 flex flex-col gap-5">
          <div className="rounded-xl overflow-hidden bg-surface-container-lowest border border-surface-container shadow-sm">
            <div className="w-full h-44 bg-surface-container-low">
              <SafeImage
                src={ASSETS.workshop}
                alt="ASATEK Factory QA Lab"
                className="w-full h-full object-cover"
                placeholderIcon="precision_manufacturing"
              />
            </div>
            <div className="p-5">
              <span className="font-spec-code text-xs text-tertiary font-bold uppercase block">
                FACTORY DIRECT ASSURANCE
              </span>
              <h3 className="text-headline-sm font-bold text-on-surface mt-1">
                Engineer Support on WhatsApp
              </h3>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                Unsure about panel Voc or cable thickness? Send a photo of your solar setup sticker to our Lahore engineering desk.
              </p>
              <a
                href={buildWhatsAppUrl(
                  `Assalam-o-Alaikum, I need technical guidance on ${siteSettings.site_name} wiring/compatibility.`,
                  siteSettings.whatsapp_number
                )}
                target="_blank"
                rel="noreferrer"
                className="mt-4 w-full py-2.5 px-4 rounded-lg bg-[#28A745] hover:bg-[#1e7e34] text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Message Technical Desk</span>
              </a>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface-container-low border border-surface-container">
            <h3 className="text-sm font-bold text-on-surface mb-2">Quick Navigation</h3>
            <div className="flex flex-col gap-2 text-xs">
              <button
                type="button"
                onClick={() => navigate('service-centers')}
                className="text-left text-primary font-semibold hover:underline"
              >
                → Locate Nearest Warranty Hub (15+ Cities)
              </button>
              <button
                type="button"
                onClick={() => navigate('track-order')}
                className="text-left text-primary font-semibold hover:underline"
              >
                → Track Cash on Delivery Parcel
              </button>
              <button
                type="button"
                onClick={() => navigate('products')}
                className="text-left text-primary font-semibold hover:underline"
              >
                → Browse Solar Charge Controllers
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
