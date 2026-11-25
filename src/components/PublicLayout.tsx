import React, { useState } from 'react';
import { UI_TEXT } from '../data/seedData';
import { useStore } from '../context/StoreContext';
import type { PageRoute } from '../types/asatek';
import { buildWhatsAppUrl, formatDisplayIntlPhone, formatTelHref } from '../utils/storeLogic';
import { BrandLogo } from './common/BrandLogo';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    language,
    setLanguage,
    route,
    navigate,
    isAdminAuthenticated,
    siteSettings,
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = UI_TEXT[language];
  const socialLinks = [
    { key: 'facebook', label: 'Facebook', url: siteSettings.facebook_url.trim(), icon: 'public' },
    { key: 'instagram', label: 'Instagram', url: siteSettings.instagram_url.trim(), icon: 'photo_camera' },
    { key: 'youtube', label: 'YouTube', url: siteSettings.youtube_url.trim(), icon: 'smart_display' },
  ].filter((item) => item.url.length > 0);

  const navItems: { route: PageRoute; label: string }[] = [
    { route: 'home', label: t.navHome },
    { route: 'products', label: t.navProducts },
    { route: 'service-centers', label: t.navServiceCenters },
    { route: 'reviews', label: t.navReviews },
    { route: 'faq', label: t.navFaq },
    { route: 'contact', label: t.navContact },
    { route: 'track-order', label: t.navTrackOrder },
  ];

  const isNavActive = (itemRoute: PageRoute) => {
    if (itemRoute === 'products' && (route === 'product-detail' || route === 'order-form' || route === 'order-confirmation')) {
      return true;
    }
    return route === itemRoute;
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Top Bar Header matching Stitch code_a4b54438.html */}
      <header className="fixed top-0 left-0 right-0 w-full z-40 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.06)] border-b border-surface-container">
        <div className="h-20 max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0 shrink">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg min-w-0"
            >
              <BrandLogo
                src={siteSettings.logo_url}
                siteName={siteSettings.site_name}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-md object-contain bg-white border border-surface-container shrink-0"
              />
              <span className="font-headline-sm text-base sm:text-headline-sm text-primary tracking-tight font-extrabold truncate max-w-[120px] sm:max-w-[175px]">
                {siteSettings.site_name}
              </span>
            </button>
          </div>

          <nav aria-label="Primary Navigation" className="hidden xl:flex items-center gap-4">
            {navItems.map((item) => {
              const active = isNavActive(item.route);
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => navigate(item.route)}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap shrink-0 text-label-md transition-colors pb-0.5 border-b-2 ${
                    active
                      ? 'text-primary font-bold border-primary'
                      : 'text-on-surface-variant hover:text-on-surface border-transparent font-medium'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Switcher EN | اردو */}
            <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 sm:p-1 border border-surface-container">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors ${
                  language === 'en'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ur')}
                className={`px-2 py-1 rounded text-[11px] sm:text-xs font-semibold transition-colors ${
                  language === 'ur'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                اردو
              </button>
            </div>

            <a
              href={formatTelHref(siteSettings.phone)}
              className="hidden lg:flex items-center gap-1 text-on-surface hover:text-primary transition-colors text-label-md whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">call</span>
              <span className="font-spec-code text-xs">{siteSettings.phone}</span>
            </a>

            <button
              type="button"
              onClick={() => navigate(isAdminAuthenticated ? 'admin-dashboard' : 'admin-login')}
              aria-label="Admin Portal"
              title="ASATEK Admin Portal"
              className="w-9 h-9 rounded-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary flex items-center justify-center transition-colors shadow-sm shrink-0"
            >
              <span className="material-symbols-outlined text-[19px]">person</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle Menu"
              className="xl:hidden w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface"
            >
              <span className="material-symbols-outlined text-[22px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-surface-container-lowest border-t border-surface-container px-4 py-4 shadow-lg">
            <div className="flex flex-col gap-1.5">
              {navItems.map((item) => (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => {
                    navigate(item.route);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    isNavActive(item.route)
                      ? 'bg-primary-fixed text-primary'
                      : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="w-full pt-20 flex-1 bg-surface">{children}</main>

      {/* 4-Column White Architectural Footer matching Stitch screens */}
      <footer className="bg-surface-container-lowest border-t border-surface-container-high mt-12 no-print">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <BrandLogo
                  src={siteSettings.logo_url}
                  siteName={siteSettings.site_name}
                  className="h-8 w-8 rounded object-contain bg-white border border-surface-container shrink-0"
                />
                <span className="font-headline-sm text-headline-sm text-primary font-extrabold tracking-tight">
                  {siteSettings.site_name}
                </span>
              </div>
              <p className="text-body-sm text-on-surface-variant leading-relaxed">
                {siteSettings.footer_text}
              </p>
              <div className="flex items-center gap-1.5 text-tertiary font-spec-code text-xs">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>ISO 9001 Compliant QA</span>
              </div>
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {socialLinks.map((social) => (
                    <a
                      key={social.key}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-low border border-surface-container hover:border-primary hover:text-primary text-xs font-semibold text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">{social.icon}</span>
                      <span>{social.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-label-md font-bold text-on-surface mb-3">Quick Navigation</h3>
              <ul className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
                <li>
                  <button type="button" onClick={() => navigate('home')} className="hover:text-primary transition-colors">
                    Home Overview
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('products')} className="hover:text-primary transition-colors">
                    Hardware Catalog
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('reviews')} className="hover:text-primary transition-colors">
                    Customer Reviews
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('faq')} className="hover:text-primary transition-colors">
                    Technical Support FAQ
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('track-order')} className="hover:text-primary transition-colors">
                    Track Order
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-label-md font-bold text-on-surface mb-3">Customer Support</h3>
              <ul className="flex flex-col gap-2 text-body-sm text-on-surface-variant">
                <li>
                  <button type="button" onClick={() => navigate('service-centers')} className="hover:text-primary transition-colors">
                    Service Centers Network
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('order-form')} className="hover:text-primary transition-colors">
                    Cash on Delivery (COD) Order
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate('admin-login')}
                    className="hover:text-primary transition-colors"
                  >
                    Admin Login
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-label-md font-bold text-on-surface mb-3">Contact &amp; Assistance</h3>
              <ul className="flex flex-col gap-2.5 text-body-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">location_on</span>
                  <span>{siteSettings.address}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">call</span>
                  <a href={formatTelHref(siteSettings.phone)} className="font-spec-code hover:text-primary">
                    {formatDisplayIntlPhone(siteSettings.phone)}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">chat</span>
                  <a
                    href={buildWhatsAppUrl(
                      `Assalam-o-Alaikum ${siteSettings.site_name} Team, I need technical information.`,
                      siteSettings.whatsapp_number
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="font-spec-code hover:text-tertiary"
                  >
                    WhatsApp: {siteSettings.whatsapp_number}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">mail</span>
                  <a href={`mailto:${siteSettings.email}`} className="font-spec-code hover:text-primary">
                    {siteSettings.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-body-sm text-on-surface-variant">
            <span>© 2025 {siteSettings.site_name}. All rights reserved. Made in Pakistan.</span>
            <span className="flex items-center gap-1.5 font-spec-code text-xs">
              <span className="material-symbols-outlined text-tertiary text-[16px]">shield</span>
              1-Year Nationwide Warranty
            </span>
          </div>
        </div>
      </footer>

      {/* Floating Bottom-Right WhatsApp CTA matching Stitch */}
      <a
        href={buildWhatsAppUrl(
          `Assalam-o-Alaikum ${siteSettings.site_name}, I would like to inquire about a product.`,
          siteSettings.whatsapp_number
        )}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="no-print fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#28A745] hover:bg-[#1e7e34] text-white font-semibold text-sm shadow-[0_4px_12px_rgba(40,167,69,0.35)] transition-transform hover:-translate-y-0.5"
      >
        <span className="material-symbols-outlined text-[19px]">chat</span>
        <span>WhatsApp</span>
      </a>
    </div>
  );
};
