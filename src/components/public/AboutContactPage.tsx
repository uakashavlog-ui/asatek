import React, { useState } from 'react';
import { ASSETS } from '../../data/seedData';
import { useStore } from '../../context/StoreContext';
import { buildWhatsAppUrl, formatDisplayIntlPhone, formatTelHref } from '../../utils/storeLogic';

export const AboutContactPage: React.FC = () => {
  const { submitContactInquiry, siteSettings, navigate } = useStore();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    subject: 'Product & Solar Sizing Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const hqAddress = siteSettings.address;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(hqAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    } catch {
      setCopiedAddress(true);
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) return;
    submitContactInquiry(form);
    setSubmitted(true);
    setForm({
      name: '',
      phone: '',
      city: '',
      subject: 'Product & Solar Sizing Inquiry',
      message: '',
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Crimson Hero Strip matching Stitch code_011c58f0.html */}
      <section className="bg-primary text-on-primary py-12 px-4 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <span className="font-spec-code text-xs uppercase tracking-widest text-on-primary-container">
            ABOUT {siteSettings.site_name.toUpperCase()} · EST. 2021
          </span>
          <h1 className="text-display-hero mt-2 text-white">
            Engineered in Pakistan. Built to Endure.
          </h1>
          <p className="text-body-lg text-on-primary-container max-w-2xl mt-2">
            Designing rugged solar charge controllers, pure sine wave UPS inverters, and industrial battery chargers built specifically for Pakistan&apos;s heat, dust, and power grid realities.
          </p>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-10 flex flex-col gap-10 w-full">
        {/* 2-Col Manufacturing Story & Sundar Facility */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-6 bg-surface-container-lowest rounded-2xl border border-surface-container p-6 lg:p-8 flex flex-col justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">OUR MANUFACTURING STORY</span>
              <h2 className="text-headline-md font-bold text-on-surface mt-1">
                Zero Compromises on Copper &amp; Heat Dissipation
              </h2>
              <p className="text-body-sm text-on-surface-variant mt-3 leading-relaxed">
                Generic imported controllers fail within months under 50°C Pakistani summers and sudden WAPDA voltage spikes. At ASATEK Lahore, we build with 1.2mm powder-coated steel chassis, oversized aluminum heatsink fins, 100% copper toroidal windings, and mechanical dual dial gauges.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-surface-container">
              <div className="p-3 rounded-lg bg-surface-container-low">
                <strong className="font-spec-code text-lg text-primary block tabular-nums">50,000+</strong>
                <span className="text-xs text-on-surface-variant">Units Deployed</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low">
                <strong className="font-spec-code text-lg text-tertiary block tabular-nums">15+</strong>
                <span className="text-xs text-on-surface-variant">Service Hubs</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-container-low">
                <strong className="font-spec-code text-lg text-on-surface block tabular-nums">1 Year</strong>
                <span className="text-xs text-on-surface-variant">Direct Warranty</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-surface-container min-h-[280px]">
            <img
              src={ASSETS.workshop}
              alt="ASATEK Lahore Assembly & Calibration Facility"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* 3 Direct Contact Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between gap-3">
            <div>
              <span className="material-symbols-outlined text-tertiary text-[28px]">chat</span>
              <h3 className="text-lg font-bold text-on-surface mt-2">WhatsApp Sales &amp; Support</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Fastest way to order, share wiring photos, or ask technician sizing advice.
              </p>
            </div>
            <a
              href={buildWhatsAppUrl(
                `Assalam-o-Alaikum ${siteSettings.site_name} Team!`,
                siteSettings.whatsapp_number
              )}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-4 rounded-lg bg-[#28A745] text-white text-xs font-bold text-center"
            >
              Chat on {formatDisplayIntlPhone(siteSettings.whatsapp_number)}
            </a>
          </div>

          <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between gap-3">
            <div>
              <span className="material-symbols-outlined text-primary text-[28px]">call</span>
              <h3 className="text-lg font-bold text-on-surface mt-2">Official Support Desk</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Monday – Saturday, 9:30 AM to 7:30 PM PKT for order &amp; wholesale support.
              </p>
            </div>
            <a
              href={formatTelHref(siteSettings.phone)}
              className="py-2.5 px-4 rounded-lg border border-outline-variant text-primary text-xs font-bold font-spec-code text-center hover:bg-surface-container-low"
            >
              Call {siteSettings.phone}
            </a>
          </div>

          <div className="p-6 rounded-xl bg-surface-container-lowest border border-surface-container shadow-sm flex flex-col justify-between gap-3">
            <div>
              <span className="material-symbols-outlined text-primary text-[28px]">mail</span>
              <h3 className="text-lg font-bold text-on-surface mt-2">Commercial &amp; Dealerships</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Bulk carton inquiries, solar installer supply rates, and B2B procurement.
              </p>
            </div>
            <a
              href={`mailto:${siteSettings.email}`}
              className="py-2.5 px-4 rounded-lg bg-surface-container-low text-on-surface hover:text-primary text-xs font-bold font-spec-code text-center"
            >
              {siteSettings.email}
            </a>
          </div>
        </section>

        {/* Sundar HQ + Consultation Form */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl border border-surface-container p-6 flex flex-col gap-4">
            <h2 className="text-headline-sm font-bold text-on-surface">Head Office &amp; Assembly Plant</h2>
            <p className="text-sm text-on-surface-variant">{hqAddress}</p>
            <button
              type="button"
              onClick={() => void handleCopyAddress()}
              className="self-start px-4 py-2 rounded-lg border border-outline-variant text-xs font-semibold text-primary hover:bg-surface-container-low flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>{copiedAddress ? 'Address Copied!' : 'Copy Factory Address'}</span>
            </button>
            <div className="rounded-lg overflow-hidden border border-surface-container h-52">
              <img
                src={ASSETS.hubMap}
                alt="ASATEK Logistics & Service Map"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => navigate('service-centers')}
              className="text-xs font-bold text-primary hover:underline text-left"
            >
              View All 15+ Authorized Service Centers →
            </button>
          </div>

          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm">
            <h2 className="text-headline-sm font-bold text-on-surface mb-1">
              Engineering Consultation &amp; Wholesale Form
            </h2>
            <p className="text-xs text-on-surface-variant mb-4">
              Send your inquiry directly to our Lahore engineering &amp; sales desk.
            </p>

            {submitted && (
              <div className="mb-4 p-3.5 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-sm font-medium">
                Inquiry received! An ASATEK specialist will call or WhatsApp you shortly.
              </div>
            )}

            <form onSubmit={handleInquirySubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="text-xs font-semibold block mb-1">
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Tariq Mahmood"
                    className="w-full rounded-lg border border-outline-variant px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="text-xs font-semibold block mb-1">
                    Mobile / WhatsApp
                  </label>
                  <input
                    id="contact-phone"
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full rounded-lg border border-outline-variant px-3.5 py-2 text-sm font-spec-code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-city" className="text-xs font-semibold block mb-1">
                    City
                  </label>
                  <input
                    id="contact-city"
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Lahore, Karachi, Multan..."
                    className="w-full rounded-lg border border-outline-variant px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="contact-subject" className="text-xs font-semibold block mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    id="contact-subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-lg border border-outline-variant px-3.5 py-2 text-sm"
                  >
                    <option value="Product & Solar Sizing Inquiry">Product &amp; Solar Sizing Inquiry</option>
                    <option value="Wholesale / Dealership Rates">Wholesale / Dealership Rates</option>
                    <option value="Warranty & Repair Support">Warranty &amp; Repair Support</option>
                    <option value="Courier / COD Dispatch Issue">Courier / COD Dispatch Issue</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-msg" className="text-xs font-semibold block mb-1">
                  Message / Requirements
                </label>
                <textarea
                  id="contact-msg"
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your setup, panel wattage, or bulk order quantity..."
                  className="w-full rounded-lg border border-outline-variant px-3.5 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                className="self-start px-6 py-2.5 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-sm font-bold"
              >
                Send Message to Lahore Desk
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
