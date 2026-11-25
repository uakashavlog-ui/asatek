import React, { useMemo, useState } from 'react';
import { ASSETS } from '../../data/seedData';
import { useStore } from '../../context/StoreContext';
import { buildWhatsAppUrl } from '../../utils/storeLogic';
import { SafeImage } from '../common/SafeImage';

export const ServiceCentersPage: React.FC = () => {
  const { serviceCenters, submitContactInquiry, siteSettings, navigate } = useStore();
  const [search, setSearch] = useState('');
  const [cityChip, setCityChip] = useState('All');
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ name: '', phone: '', city: '', workshop: '' });
  const [partnerSent, setPartnerSent] = useState(false);

  const activeCenters = useMemo(() => serviceCenters.filter((c) => c.active), [serviceCenters]);

  const filterChips = ['All', 'Karachi', 'Lahore', 'Rawalpindi', 'Peshawar', 'Multan', 'Quetta', 'Sindh', 'KPK'];

  const filteredCenters = useMemo(() => {
    const q = search.trim().toLowerCase();
    return activeCenters.filter((c) => {
      if (cityChip !== 'All') {
        const hayChip = `${c.city} ${c.province}`.toLowerCase();
        if (!hayChip.includes(cityChip.toLowerCase())) return false;
      }
      if (q) {
        const hay = `${c.city} ${c.name} ${c.address} ${c.leadEngineer} ${c.specialization} ${c.province}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activeCenters, cityChip, search]);

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.name.trim() || !partnerForm.phone.trim()) return;
    submitContactInquiry({
      name: partnerForm.name,
      phone: partnerForm.phone,
      city: partnerForm.city || 'Pakistan',
      subject: `Service Center Dealership Application (${partnerForm.workshop})`,
      message: `Workshop: ${partnerForm.workshop}, City: ${partnerForm.city}`,
    });
    setPartnerSent(true);
    setPartnerForm({ name: '', phone: '', city: '', workshop: '' });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-8">
      {/* Header & KPIs matching Stitch code_b4a1f9fb.html */}
      <div className="mb-8">
        <span className="font-spec-code text-xs font-bold text-tertiary uppercase tracking-wider">
          NATIONWIDE TECHNICAL PRESENCE · LIVE NETWORK
        </span>
        <h1 className="text-display-hero text-on-surface mt-1">
          Authorized Service <span className="text-primary">Centers Network</span>
        </h1>
        <p className="text-body-md text-on-surface-variant max-w-2xl mt-2">
          15+ factory-trained engineering hubs across Pakistan offering on-the-spot component replacement, oscilloscope waveform testing, and authorized warranty support.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm">
            <span className="text-xs text-on-surface-variant block">Hub Network</span>
            <strong className="text-2xl font-extrabold text-on-surface tabular-nums">
              {activeCenters.length}+ Facilities
            </strong>
            <span className="text-xs text-tertiary block mt-0.5">100% Factory Certified</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm">
            <span className="text-xs text-on-surface-variant block">Turnaround SLA</span>
            <strong className="text-2xl font-extrabold text-on-surface tabular-nums">&lt; 48 Hours Avg</strong>
            <span className="text-xs text-tertiary block mt-0.5">Same-Day MOSFET Swap</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm">
            <span className="text-xs text-on-surface-variant block">OEM Parts Reserve</span>
            <strong className="text-2xl font-extrabold text-on-surface tabular-nums">10,000+ Units</strong>
            <span className="text-xs text-on-surface-variant block mt-0.5">Pure Sine Inverter &amp; Control Chips</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm">
            <span className="text-xs text-on-surface-variant block">Direct Hotline</span>
            <strong className="text-2xl font-extrabold text-primary font-spec-code tabular-nums">042-37254321</strong>
            <span className="text-xs text-on-surface-variant block mt-0.5">Mon-Sat 10AM–7PM</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Chips */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-4 mb-6 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city, market name (Hall Road, Regal, Saddar), or engineer..."
              aria-label="Search Service Centers"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCityChip('All');
            }}
            className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Clear Filter</span>
          </button>
          <a
            href={buildWhatsAppUrl(
              `Assalam-o-Alaikum ${siteSettings.site_name} Emergency Technical Desk, I need warranty repair guidance.`,
              siteSettings.whatsapp_number
            )}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            <span>Emergency Desk</span>
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterChips.map((chip) => {
            const active = cityChip === chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setCityChip(chip)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                {chip === 'All' ? `All (${activeCenters.length})` : chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Service Center Cards Grid */}
      {filteredCenters.length === 0 ? (
        <div className="p-10 rounded-xl bg-surface-container-lowest border border-surface-container text-center mb-8">
          <p className="text-sm font-semibold text-on-surface">No service hubs match your filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCityChip('All');
            }}
            className="mt-3 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold"
          >
            Show All Hubs
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {filteredCenters.map((center) => (
            <article
              key={center.id}
              className="bg-surface-container-lowest rounded-xl border border-surface-container p-5 shadow-sm flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px] mb-1.5">
                  <span className="font-spec-code text-on-surface-variant">{center.hubCode}</span>
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-semibold">
                    {center.facilityType}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-primary">{center.city}</h2>
                <h3 className="text-sm font-bold text-on-surface mb-1">{center.name}</h3>
                <p className="text-xs text-on-surface-variant flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[15px] mt-0.5 shrink-0">location_on</span>
                  <span>{center.address}</span>
                </p>

                <div className="mt-3 p-3 rounded-lg bg-surface-container-low text-xs flex flex-col gap-1 font-spec-code">
                  <div className="flex justify-between gap-2">
                    <span className="text-on-surface-variant">Lead Tech:</span>
                    <strong className="text-on-surface text-right">{center.leadEngineer}</strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-on-surface-variant">Specialty:</span>
                    <strong className="text-on-surface text-right">{center.specialization}</strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-on-surface-variant">Diagnostics:</span>
                    <strong className="text-tertiary text-right">{center.diagnostics}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-container flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-spec-code">
                  <span className="material-symbols-outlined text-[15px]">schedule</span>
                  <span>{center.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${center.phone}`}
                    className="flex-1 py-2 px-3 rounded-lg border border-outline-variant hover:bg-surface-container text-center font-spec-code text-xs font-bold text-on-surface flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                    <span>{center.phone}</span>
                  </a>
                  <a
                    href={buildWhatsAppUrl(
                      `Assalam-o-Alaikum ASATEK ${center.city} Hub (${center.name}), I need support.`,
                      center.whatsapp
                    )}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`WhatsApp ${center.city} Hub`}
                    className="px-3.5 py-2 rounded-lg bg-[#28A745] hover:bg-[#1e7e34] text-white flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Walk-In Warranty Protocol */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-surface-container-lowest rounded-2xl border border-surface-container p-6 mb-10 shadow-sm">
        <div className="lg:col-span-5 rounded-xl overflow-hidden relative min-h-[240px] bg-surface-container-low">
          <SafeImage
            src={ASSETS.workshop}
            alt="Standardized ASATEK Diagnostic Benches"
            className="w-full h-full object-cover"
            placeholderIcon="precision_manufacturing"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-4 text-white">
            <div>
              <span className="text-[11px] font-spec-code text-tertiary-fixed block">ISO 9001:2015 PROCESS CONTROL</span>
              <strong className="text-base">Standardized Diagnostic Benches</strong>
            </div>
          </div>
        </div>
        <div className="lg:col-span-7 flex flex-col justify-center gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase">FAST-TRACK RMA PROTOCOL</span>
            <h2 className="text-headline-md font-bold text-on-surface">How Walk-In Warranty Claims Work</h2>
          </div>
          <div className="flex flex-col gap-3">
            {[
              {
                num: '01',
                title: 'Instant Serial Scan & Load Test',
                desc: 'Technician scans unit barcode to verify warranty record and performs immediate DC bench load test.',
              },
              {
                num: '02',
                title: 'Component Modular Swap',
                desc: 'Pre-tested factory sub-boards, genuine high-temp MOSFET arrays, and original copper relays are installed.',
              },
              {
                num: '03',
                title: 'Final Burn-In & Handover',
                desc: '30-minute stress cycle under nominal rated current before handover with digital warranty stamp.',
              },
            ].map((step) => (
              <div key={step.num} className="p-3.5 rounded-lg bg-surface-container-low flex items-start gap-3">
                <span className="font-spec-code font-extrabold text-primary text-base">{step.num}</span>
                <div>
                  <strong className="text-sm text-on-surface block">{step.title}</strong>
                  <span className="text-xs text-on-surface-variant">{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Geographic Coverage Card */}
      <section className="bg-surface-container-lowest rounded-2xl border border-surface-container p-6 mb-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">Interactive Geographic Coverage</h2>
            <p className="text-xs text-on-surface-variant">
              Major regional testing depots along main transit corridors across all 4 provinces.
            </p>
          </div>
          <span className="font-spec-code text-xs text-primary font-semibold">Lahore Central Hub + 14 Regional Depots</span>
        </div>
        <div className="rounded-xl overflow-hidden border border-surface-container relative h-72 bg-surface-container-low">
          <SafeImage
            src={ASSETS.hubMap}
            alt="ASATEK Pakistan Authorized Service Hubs Map"
            className="w-full h-full object-cover"
            placeholderIcon="map"
          />
          <div className="absolute bottom-4 left-4 bg-white/95 rounded-xl p-4 border border-surface-container shadow-md max-w-xs">
            <span className="text-[11px] font-bold text-primary uppercase block">ASATEK GPS Routing</span>
            <p className="text-xs text-on-surface-variant mt-1">
              Need help finding the nearest technician? Message our central coordinator on WhatsApp.
            </p>
            <a
              href={buildWhatsAppUrl(
                `Assalam-o-Alaikum, please share the Google Pin for my nearest ${siteSettings.site_name} Service Center.`,
                siteSettings.whatsapp_number
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-2 text-xs font-bold text-primary hover:underline"
            >
              Send Location Request on WhatsApp →
            </a>
          </div>
        </div>
      </section>

      {/* Dealership CTA Banner */}
      <section className="bg-surface-container-low rounded-2xl border border-surface-container p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase">Dealership &amp; Engineering Expansion</span>
          <h2 className="text-headline-sm font-bold text-on-surface mt-0.5">
            Are you an electronics technician or workshop owner?
          </h2>
          <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
            Apply for an Authorized Service Center Partnership for direct wholesale access to OEM ASATEK circuit boards and national directory listing.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setPartnerModalOpen(true)}
            className="px-5 py-3 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-xs font-bold"
          >
            Apply for Partnership
          </button>
          <button
            type="button"
            onClick={() => navigate('contact')}
            className="px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs font-semibold"
          >
            Contact HQ
          </button>
        </div>
      </section>

      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl bg-surface-container-lowest border border-surface-container p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-on-surface">Authorized Hub Application</h3>
              <button type="button" onClick={() => { setPartnerModalOpen(false); setPartnerSent(false); }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {partnerSent ? (
              <div className="p-4 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-sm">
                Application logged! Our Lahore dealership engineering coordinator will contact you within 24 hours.
              </div>
            ) : (
              <form onSubmit={handlePartnerSubmit} className="flex flex-col gap-3">
                <input
                  required
                  type="text"
                  placeholder="Engineer / Owner Name"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                  className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
                />
                <input
                  required
                  type="tel"
                  placeholder="Mobile / WhatsApp (03XX-XXXXXXX)"
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                  className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-spec-code"
                />
                <input
                  required
                  type="text"
                  placeholder="City & Electronics Market"
                  value={partnerForm.city}
                  onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                  className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
                />
                <input
                  required
                  type="text"
                  placeholder="Workshop Name & Years of Experience"
                  value={partnerForm.workshop}
                  onChange={(e) => setPartnerForm({ ...partnerForm, workshop: e.target.value })}
                  className="rounded-lg border border-outline-variant px-3 py-2 text-sm"
                />
                <button type="submit" className="mt-2 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-bold">
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
