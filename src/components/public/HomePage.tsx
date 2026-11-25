import React from 'react';
import { ASSETS, UI_TEXT } from '../../data/seedData';
import { useStore } from '../../context/StoreContext';
import type { ProductCategory } from '../../types/asatek';
import { buildWhatsAppUrl, formatPkr } from '../../utils/storeLogic';
import { SafeImage } from '../common/SafeImage';

export const HomePage: React.FC = () => {
  const {
    language,
    products,
    reviews,
    serviceCenters,
    siteSettings,
    navigate,
    setCheckoutQuantity,
  } = useStore();
  const t = UI_TEXT[language];

  const featuredProducts = products.filter((p) => p.isPublicVisible).slice(0, 3);
  const topReviews = reviews.filter((r) => r.status === 'Published').slice(0, 3);
  const topCenters = serviceCenters.filter((c) => c.active).slice(0, 3);

  const categories: {
    code: string;
    icon: string;
    title: string;
    category: ProductCategory;
    desc: string;
    cta: string;
  }[] = [
    {
      code: '01 / REGULATION',
      icon: 'solar_power',
      title: 'Solar Charge Controllers',
      category: 'Solar Charge Controllers',
      desc: 'PWM and high-efficiency MPPT models featuring physical analog ammeters and digital voltage telemetry.',
      cta: 'Explore Regulators',
    },
    {
      code: '02 / CONVERSION',
      icon: 'power',
      title: 'UPS & Pure Sine Inverters',
      category: 'UPS / Inverters',
      desc: 'Copper-wound toroidal and ferrite core power solutions engineered for continuous load-shedding cycles.',
      cta: 'Explore Inverters',
    },
    {
      code: '03 / CHARGING',
      icon: 'battery_charging_full',
      title: 'Industrial Battery Chargers',
      category: 'Battery Chargers',
      desc: 'Multi-stage automatic float and desulfation chargers designed for tubular, lead-acid, and AGM banks.',
      cta: 'Explore Chargers',
    },
    {
      code: '04 / COMPONENTS',
      icon: 'memory',
      title: 'Parts & Accessories',
      category: 'Parts & Accessories',
      desc: 'OEM panel meters, high-RPM dual-bearing fans, pure copper busbars, and high-amp blocking diodes.',
      cta: 'Explore Catalog',
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Top Technical Hero Section matching Stitch code_a4b54438.html */}
      <section className="relative w-full bg-surface-container-lowest overflow-hidden border-b border-surface-container">
        <div className="absolute inset-0 pointer-events-none opacity-35 bg-[radial-gradient(#926e69_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-10 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Value Prop & CTAs */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded bg-surface-container text-primary font-spec-code text-xs font-semibold">
                <span>{t.heroBadge}</span>
              </div>

              <h1 className="text-display-hero text-on-surface tracking-tight">
                {language === 'ur' ? (
                  <>
                    {t.heroTitlePrefix} <br className="hidden sm:inline" />
                    <span className="text-primary font-extrabold">{t.heroTitleHighlight}</span>
                  </>
                ) : (
                  siteSettings.hero_title
                )}
              </h1>

              <p className="text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
                {language === 'ur' ? t.heroSubtitle : siteSettings.hero_subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('products', { category: 'All Categories' })}
                  className="bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-sm font-semibold px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <span>{t.shopCatalog}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('product-detail', { productId: 'sc5-va1260' })}
                  className="bg-surface-container-lowest hover:bg-surface-container border border-outline-variant text-on-surface text-sm font-semibold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[18px] text-primary">menu_book</span>
                  <span>{t.engineeringSpecs}</span>
                </button>
              </div>

              {/* Micro Metric Chips */}
              <div className="pt-4 grid grid-cols-3 gap-3 max-w-lg">
                <div className="bg-surface-container-low p-3 rounded-lg border border-surface-container">
                  <span className="text-headline-sm font-bold text-primary block tabular-nums">15+</span>
                  <span className="font-spec-code text-xs text-on-surface-variant">Service Centers</span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-surface-container">
                  <span className="text-headline-sm font-bold text-tertiary block tabular-nums">100%</span>
                  <span className="font-spec-code text-xs text-on-surface-variant">Copper Core</span>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-surface-container">
                  <span className="text-headline-sm font-bold text-on-surface block tabular-nums">PKR 0</span>
                  <span className="font-spec-code text-xs text-on-surface-variant">Warranty Claims Fee</span>
                </div>
              </div>
            </div>

            {/* Right Column: Industrial Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-surface-container-low rounded-xl p-5 shadow-md border border-surface-container">
                <div className="w-full h-72 rounded-lg overflow-hidden bg-surface-container-lowest relative flex items-center justify-center">
                  <SafeImage
                    src={siteSettings.hero_image_url}
                    alt={`${siteSettings.site_name} Hero Showcase`}
                    className="w-full h-full object-cover"
                    placeholderIcon="solar_power"
                    placeholderLabel={siteSettings.site_name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <p className="text-xs font-semibold uppercase tracking-wider text-inverse-primary">
                        Flagship Controller
                      </p>
                      <p className="text-lg font-bold text-white">SC5 VA-1260 Solar Controller</p>
                      <p className="font-spec-code text-xs text-white/85">
                        PWM High Surge · 12V 60A · Dual Dial Meters
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-surface-container-lowest p-3.5 rounded-lg border border-surface-container flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
                      Factory Tested Tolerances
                    </span>
                    <span className="font-spec-code text-xs text-on-surface font-bold">
                      Ambient: 55°C | Continuous Duty
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('product-detail', { productId: 'sc5-va1260' })}
                    className="px-3 py-1.5 rounded-md bg-primary text-on-primary text-xs font-semibold whitespace-nowrap"
                  >
                    Inspect Unit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horizontal Trust Engine Strip */}
      <section className="w-full bg-surface-container-low border-b border-surface-container py-5">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: 'storefront', title: '15+ Service Hubs', sub: 'Nationwide Reach', tone: 'text-primary' },
              { icon: 'engineering', title: 'Made in Pakistan', sub: 'Lahore Engineering', tone: 'text-tertiary' },
              { icon: 'verified_user', title: 'Official Warranty', sub: '1-Yr Direct Claims', tone: 'text-primary' },
              { icon: 'local_shipping', title: 'Express COD', sub: '48-Hr City Dispatch', tone: 'text-primary' },
              { icon: 'support_agent', title: 'WhatsApp Desk', sub: 'Engineer Assisted', tone: 'text-tertiary' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-lowest border border-surface-container flex items-center justify-center shrink-0">
                  <span className={`material-symbols-outlined text-[22px] ${item.tone}`}>{item.icon}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-on-surface block leading-tight">{item.title}</span>
                  <span className="text-xs text-on-surface-variant">{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Industrial Category Grid */}
      <section className="w-full py-12">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
            <div>
              <span className="text-label-uppercase text-primary block">HARDWARE DIVISIONS</span>
              <h2 className="text-headline-lg text-on-surface font-bold tracking-tight mt-1">
                Heavy Duty Product Categories
              </h2>
            </div>
            <p className="text-body-sm text-on-surface-variant max-w-md">
              Built with high-gauge sheet metal, oversized cooling sinks, and transient suppression for volatile utility lines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <button
                key={cat.code}
                type="button"
                onClick={() => navigate('products', { category: cat.category })}
                className="group text-left bg-surface-container-lowest hover:bg-surface-container-low rounded-xl p-6 border border-surface-container shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[26px]">{cat.icon}</span>
                  </div>
                  <span className="font-spec-code text-xs text-on-surface-variant block mb-1">{cat.code}</span>
                  <h3 className="text-headline-sm text-on-surface font-bold mb-2 group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">{cat.desc}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-surface-container flex items-center justify-between text-primary text-sm font-semibold">
                  <span>{cat.cta}</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Featured Products Grid */}
      <section className="w-full py-12 bg-surface-container-low border-y border-surface-container">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
            <div>
              <span className="text-label-uppercase text-on-surface-variant block">FACTORY DIRECT INVENTORY</span>
              <h2 className="text-headline-lg text-on-surface font-bold tracking-tight mt-1">
                Best-Selling Power Units
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('products')}
              className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 self-start md:self-auto"
            >
              <span>View Full Hardware Catalog ({products.filter((p) => p.isPublicVisible).length})</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-surface-container-lowest rounded-xl p-4 border border-surface-container flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => navigate('product-detail', { productId: product.id })}
                    className="relative w-full h-56 rounded-lg bg-surface-container overflow-hidden mb-4 block"
                  >
                    <SafeImage
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      placeholderIcon="inventory_2"
                      placeholderLabel={product.sku}
                    />
                  </button>

                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-spec-code">
                    <span className="text-primary font-bold">{product.sku}</span>
                    <span aria-hidden="true">·</span>
                    <span>{product.voltage}</span>
                    <span aria-hidden="true">·</span>
                    <span>{product.amperageOrWatts}</span>
                  </div>

                  <h3 className="text-headline-sm text-on-surface font-bold mb-1.5">
                    {language === 'ur' ? product.urduName : product.name}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant mb-4 line-clamp-2">{product.subtitle}</p>
                </div>

                <div className="pt-3 border-t border-surface-container flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-on-surface-variant block">Direct Factory Price</span>
                      <span className="text-xl font-extrabold text-primary font-spec-code tabular-nums">
                        {formatPkr(product.price)}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-tertiary bg-tertiary-fixed px-2.5 py-1 rounded-md">
                      {product.stockCount} in stock
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutQuantity(1);
                        navigate('order-form', { productId: product.id });
                      }}
                      className="py-2 px-3 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                      <span>Order COD</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('product-detail', { productId: product.id })}
                      className="py-2 px-3 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <span>{t.details}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Lahore Stress-Test Quality Story */}
      <section className="w-full py-12">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-surface-container-lowest rounded-2xl border border-surface-container overflow-hidden shadow-sm">
            <div className="lg:col-span-6 p-6 lg:p-10 flex flex-col justify-center gap-4">
              <span className="text-label-uppercase text-primary">LAHORE BURN-IN &amp; QA LAB</span>
              <h2 className="text-headline-lg font-bold text-on-surface">
                Built for 55°C Roofs &amp; Voltage Fluctuations
              </h2>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                Every ASATEK charge controller, toroidal UPS, and copper battery charger undergoes oscilloscope load-waveform inspection and thermal soak testing at our Sundar Industrial Estate facility in Lahore before receiving its tamper-evident QC seal.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-surface-container-low">
                  <span className="font-spec-code text-lg font-bold text-primary block tabular-nums">96.5%</span>
                  <span className="text-xs text-on-surface-variant">Peak Regulation Efficiency</span>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low">
                  <span className="font-spec-code text-lg font-bold text-tertiary block tabular-nums">48 Hrs</span>
                  <span className="text-xs text-on-surface-variant">Avg Warranty Turnaround</span>
                </div>
              </div>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('contact')}
                  className="px-5 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold"
                >
                  About Our Factory
                </button>
                <a
                  href={buildWhatsAppUrl(
                    `Assalam-o-Alaikum ${siteSettings.site_name}, I want to request wholesale dealer rates.`,
                    siteSettings.whatsapp_number
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container"
                >
                  Dealership Inquiry
                </a>
              </div>
            </div>
            <div className="lg:col-span-6 min-h-[280px]">
              <SafeImage
                src={ASSETS.workshop}
                alt="ASATEK Lahore Electronics QA Workbench"
                className="w-full h-full object-cover"
                placeholderIcon="precision_manufacturing"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Verified Reviews & Service Hubs Preview */}
      <section className="w-full pb-12">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-label-uppercase text-primary block">FIELD PROOF</span>
                  <h3 className="text-headline-sm font-bold text-on-surface">Verified Customer Reviews</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('reviews')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  All Reviews →
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {topReviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-lg bg-surface-container-low border border-surface-container">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <strong className="text-on-surface">{rev.customerName} · {rev.city}</strong>
                      <span className="font-spec-code text-primary font-bold">{rev.rating}.0 ★</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-label-uppercase text-tertiary block">NATIONWIDE SUPPORT</span>
                  <h3 className="text-headline-sm font-bold text-on-surface">15+ Authorized Service Centers</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('service-centers')}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Find Nearest Hub →
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {topCenters.map((center) => (
                  <div key={center.id} className="p-3.5 rounded-lg bg-surface-container-low border border-surface-container flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-on-surface">
                        {center.city} — {center.name}
                      </div>
                      <div className="text-xs text-on-surface-variant">{center.address}</div>
                    </div>
                    <a
                      href={`tel:${center.phone}`}
                      className="font-spec-code text-xs font-bold text-primary whitespace-nowrap shrink-0 hover:underline"
                    >
                      {center.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
