import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  DEFAULT_SITE_SETTINGS,
  SITE_ASSETS_BUCKET,
  isSupabaseConfigured,
  type SiteAssetSlot,
} from '../../services/siteSettingsService';
import type { SiteSettings } from '../../types/asatek';
import { deriveBrandPalette, validateSiteSettings } from '../../utils/storeLogic';
import { ConfirmDialog } from '../modals/ConfirmDialog';

type SectionTab = 'all' | 'branding' | 'contact' | 'homepage' | 'footer';

interface ToastState {
  type: 'success' | 'error';
  message: string;
}

const BRAND_SWATCHES = ['#9e0000', '#b91c1c', '#0f766e', '#1d4ed8', '#1f2937'];

export const AdminSettingsPage: React.FC = () => {
  const {
    siteSettings,
    siteSettingsSaving,
    saveSiteSettings,
    resetSiteSettings,
    uploadSiteAsset,
    navigate,
  } = useStore();

  const [draft, setDraft] = useState<SiteSettings>(() => ({ ...siteSettings }));
  const [activeTab, setActiveTab] = useState<SectionTab>('all');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingSlot, setUploadingSlot] = useState<SiteAssetSlot | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    setDraft({ ...siteSettings });
  }, [siteSettings]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(siteSettings);
  const supabaseReady = isSupabaseConfigured();
  const previewPalette = deriveBrandPalette(draft.primary_color);

  const updateField = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleAssetUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: SiteAssetSlot
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadingSlot(slot);
    setToast(null);
    try {
      const uploadedUrl = await uploadSiteAsset(file, slot);
      if (slot === 'logo') updateField('logo_url', uploadedUrl);
      if (slot === 'favicon') updateField('favicon_url', uploadedUrl);
      if (slot === 'hero') updateField('hero_image_url', uploadedUrl);

      setToast({
        type: 'success',
        message: `${
          slot === 'logo' ? 'Logo' : slot === 'favicon' ? 'Favicon' : 'Hero banner'
        } uploaded (${file.name}). Click Save Changes to publish.`,
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Image upload failed.',
      });
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateSiteSettings(draft);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setToast({
        type: 'error',
        message: Object.values(validationErrors)[0],
      });
      return;
    }

    setErrors({});
    try {
      const saved = await saveSiteSettings(draft);
      setDraft({ ...saved });
      setToast({
        type: 'success',
        message: 'Site settings saved and published across the live storefront.',
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Unable to save site settings.',
      });
    }
  };

  const handleConfirmReset = async () => {
    setResetDialogOpen(false);
    setErrors({});
    try {
      const defaults = await resetSiteSettings();
      setDraft({ ...defaults });
      setToast({
        type: 'success',
        message: 'Settings restored to official ASATEK Pakistan defaults.',
      });
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to reset site settings.',
      });
    }
  };

  const showSection = (section: Exclude<SectionTab, 'all'>) =>
    activeTab === 'all' || activeTab === section;

  const tabs: { id: SectionTab; label: string; icon: string }[] = [
    { id: 'all', label: 'All Settings', icon: 'tune' },
    { id: 'branding', label: 'Branding', icon: 'palette' },
    { id: 'contact', label: 'Contact Info', icon: 'call' },
    { id: 'homepage', label: 'Homepage', icon: 'web' },
    { id: 'footer', label: 'Footer & Social Links', icon: 'share' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="font-spec-code text-xs font-bold text-primary uppercase tracking-wider">
            SYSTEM CONFIGURATION · /ADMIN/SETTINGS
          </span>
          <h1 className="text-headline-md font-extrabold text-on-surface mt-0.5">
            Site Settings &amp; Storefront Branding
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Manage brand identity, primary theme color, WhatsApp hotline, homepage hero, and footer links without touching code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-spec-code font-semibold border ${
              supabaseReady
                ? 'bg-tertiary-fixed border-tertiary text-on-tertiary-fixed'
                : 'bg-surface-container-low border-surface-container text-on-surface-variant'
            }`}
          >
            {supabaseReady
              ? `Supabase Sync (${SITE_ASSETS_BUCKET})`
              : `Local Persistence · Bucket "${SITE_ASSETS_BUCKET}" Ready`}
          </span>
          <button
            type="button"
            onClick={() => navigate('home')}
            className="px-3.5 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-primary flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Preview Storefront</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <div
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`rounded-xl px-4 py-3 border flex items-center justify-between gap-3 shadow-sm ${
            toast.type === 'error'
              ? 'bg-error-container border-error text-on-error-container'
              : 'bg-tertiary-fixed border-tertiary text-on-tertiary-fixed'
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-semibold">
            <span className="material-symbols-outlined text-[20px]">
              {toast.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
            className="p-1 rounded hover:bg-black/10"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Section Filter Tabs */}
      <div
        role="tablist"
        aria-label="Site Settings Sections"
        className="flex flex-wrap gap-2 bg-surface-container-lowest rounded-xl border border-surface-container p-2.5 shadow-sm"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                active
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} noValidate className="flex flex-col gap-6">
        {/* Sticky Top Action Bar (docks cleanly below 72px header without overlapping form cards) */}
        <div className="sticky top-[72px] z-20 bg-surface-container-lowest/95 backdrop-blur-md border border-surface-container rounded-xl px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-on-surface-variant flex items-center gap-2 min-w-0">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${isDirty ? 'bg-secondary' : 'bg-tertiary'}`}
              aria-hidden="true"
            />
            <span className="font-medium text-on-surface truncate">
              {isDirty ? 'Unsaved changes ready to publish' : 'All site settings are up to date'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto shrink-0">
            <button
              type="button"
              disabled={siteSettingsSaving || uploadingSlot !== null}
              onClick={() => setResetDialogOpen(true)}
              className="px-3.5 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs font-bold disabled:opacity-60 flex items-center gap-1.5"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset</span>
            </button>
            <button
              type="submit"
              disabled={siteSettingsSaving || uploadingSlot !== null}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-xs font-bold shadow-sm disabled:opacity-60 flex items-center gap-1.5"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[17px]">
                {siteSettingsSaving ? 'hourglass_top' : 'save'}
              </span>
              <span>{siteSettingsSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Section A: Branding */}
        {showSection('branding') && (
          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-surface-container">
              <div>
                <span className="font-spec-code text-[11px] font-bold text-primary uppercase">
                  SECTION 01 · IDENTITY &amp; THEME
                </span>
                <h2 className="text-headline-sm font-bold text-on-surface">Branding</h2>
              </div>
              <span className="text-xs text-on-surface-variant font-spec-code">
                PNG, JPG, WebP, SVG, ICO · Max 2 MB
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Logo + Favicon Uploaders */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">Website Logo</span>
                    <button
                      type="button"
                      onClick={() => updateField('logo_url', DEFAULT_SITE_SETTINGS.logo_url)}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Use Default Logo
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-white border border-outline-variant p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={draft.logo_url}
                        alt="Brand logo preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <label
                        htmlFor="settings-logo-upload"
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-on-surface cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">upload</span>
                        <span>
                          {uploadingSlot === 'logo' ? 'Uploading...' : 'Upload Logo Image'}
                        </span>
                      </label>
                      <input
                        id="settings-logo-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        disabled={uploadingSlot !== null}
                        onChange={(e) => void handleAssetUpload(e, 'logo')}
                        className="sr-only"
                      />
                      <span className="text-[11px] text-on-surface-variant truncate">
                        Shown in header, footer, admin sidebar &amp; login.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface">Browser Favicon</span>
                    <button
                      type="button"
                      onClick={() => updateField('favicon_url', DEFAULT_SITE_SETTINGS.favicon_url)}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Use Default Favicon
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white border border-outline-variant p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={draft.favicon_url}
                        alt="Favicon preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <label
                        htmlFor="settings-favicon-upload"
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-on-surface cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">upload</span>
                        <span>
                          {uploadingSlot === 'favicon' ? 'Uploading...' : 'Upload Favicon'}
                        </span>
                      </label>
                      <input
                        id="settings-favicon-upload"
                        type="file"
                        accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/webp"
                        disabled={uploadingSlot !== null}
                        onChange={(e) => void handleAssetUpload(e, 'favicon')}
                        className="sr-only"
                      />
                      <span className="text-[11px] text-on-surface-variant">
                        Updates the browser tab icon immediately on save.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Site Name, Tagline & Primary Color */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div>
                  <label htmlFor="settings-site-name" className="text-xs font-semibold text-on-surface block mb-1">
                    Website Name <span className="text-error">*</span>
                  </label>
                  <input
                    id="settings-site-name"
                    type="text"
                    value={draft.site_name}
                    onChange={(e) => updateField('site_name', e.target.value)}
                    placeholder="e.g. ASATEK"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                      errors.site_name ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                    }`}
                  />
                  {errors.site_name && <p className="text-xs text-error mt-1">{errors.site_name}</p>}
                </div>

                <div>
                  <label htmlFor="settings-tagline" className="text-xs font-semibold text-on-surface block mb-1">
                    Brand Tagline <span className="text-error">*</span>
                  </label>
                  <input
                    id="settings-tagline"
                    type="text"
                    value={draft.tagline}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    placeholder="e.g. Power Electronics, Solar Controllers & Inverters"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                      errors.tagline ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                    }`}
                  />
                  {errors.tagline && <p className="text-xs text-error mt-1">{errors.tagline}</p>}
                </div>

                <div>
                  <label htmlFor="settings-primary-color-hex" className="text-xs font-semibold text-on-surface block mb-1">
                    Primary Brand Color <span className="text-error">*</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      id="settings-primary-color-picker"
                      type="color"
                      aria-label="Primary Brand Color Picker"
                      value={/^#[0-9a-fA-F]{6}$/.test(draft.primary_color) ? draft.primary_color : '#9e0000'}
                      onChange={(e) => updateField('primary_color', e.target.value)}
                      className="w-11 h-10 rounded-lg border border-outline-variant cursor-pointer bg-white p-0.5"
                    />
                    <input
                      id="settings-primary-color-hex"
                      type="text"
                      value={draft.primary_color}
                      onChange={(e) => updateField('primary_color', e.target.value)}
                      placeholder="#9e0000"
                      className={`w-36 rounded-lg border px-3 py-2 text-sm font-spec-code bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                        errors.primary_color ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                      }`}
                    />
                    <div className="flex items-center gap-1.5">
                      {BRAND_SWATCHES.map((swatch) => (
                        <button
                          key={swatch}
                          type="button"
                          aria-label={`Select color ${swatch}`}
                          onClick={() => updateField('primary_color', swatch)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                            draft.primary_color.toLowerCase() === swatch ? 'border-on-surface scale-110' : 'border-white shadow'
                          }`}
                          style={{ backgroundColor: swatch }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-on-surface-variant">
                    <span
                      className="px-2.5 py-1 rounded font-semibold"
                      style={{ backgroundColor: previewPalette.primary, color: previewPalette.onPrimary }}
                    >
                      Button Preview
                    </span>
                    <span
                      className="px-2.5 py-1 rounded font-semibold"
                      style={{ backgroundColor: previewPalette.primaryFixed, color: previewPalette.onPrimaryFixed }}
                    >
                      Badge Tint Preview
                    </span>
                  </div>
                  {errors.primary_color && <p className="text-xs text-error mt-1">{errors.primary_color}</p>}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section B: Contact Info */}
        {showSection('contact') && (
          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm">
            <div className="pb-4 mb-5 border-b border-surface-container">
              <span className="font-spec-code text-[11px] font-bold text-primary uppercase">
                SECTION 02 · WHATSAPP, HOTLINE &amp; LOCATION
              </span>
              <h2 className="text-headline-sm font-bold text-on-surface">Contact Info</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="settings-whatsapp" className="text-xs font-semibold text-on-surface block mb-1">
                  Official WhatsApp Number <span className="text-error">*</span>
                </label>
                <input
                  id="settings-whatsapp"
                  type="tel"
                  value={draft.whatsapp_number}
                  onChange={(e) => updateField('whatsapp_number', e.target.value)}
                  placeholder="0300-1234567"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm font-spec-code bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                    errors.whatsapp_number ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                  }`}
                />
                <span className="text-[11px] text-on-surface-variant">
                  Used across every WhatsApp order button, inquiry link, and floating widget.
                </span>
                {errors.whatsapp_number && <p className="text-xs text-error mt-1">{errors.whatsapp_number}</p>}
              </div>

              <div>
                <label htmlFor="settings-phone" className="text-xs font-semibold text-on-surface block mb-1">
                  Support Phone / Helpline <span className="text-error">*</span>
                </label>
                <input
                  id="settings-phone"
                  type="tel"
                  value={draft.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="0300-1234567"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm font-spec-code bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                    errors.phone ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                  }`}
                />
                {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="settings-email" className="text-xs font-semibold text-on-surface block mb-1">
                  Support Email <span className="text-error">*</span>
                </label>
                <input
                  id="settings-email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="support@asatek.pk"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm font-spec-code bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                    errors.email ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                  }`}
                />
                {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="settings-address" className="text-xs font-semibold text-on-surface block mb-1">
                  Head Office / Factory Address <span className="text-error">*</span>
                </label>
                <input
                  id="settings-address"
                  type="text"
                  value={draft.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Sundar Industrial Estate, Lahore, Pakistan"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                    errors.address ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                  }`}
                />
                {errors.address && <p className="text-xs text-error mt-1">{errors.address}</p>}
              </div>
            </div>
          </section>
        )}

        {/* Section C: Homepage */}
        {showSection('homepage') && (
          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm">
            <div className="pb-4 mb-5 border-b border-surface-container">
              <span className="font-spec-code text-[11px] font-bold text-primary uppercase">
                SECTION 03 · STOREFRONT HERO BANNER
              </span>
              <h2 className="text-headline-sm font-bold text-on-surface">Homepage</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div>
                  <label htmlFor="settings-hero-title" className="text-xs font-semibold text-on-surface block mb-1">
                    Hero Title <span className="text-error">*</span>
                  </label>
                  <input
                    id="settings-hero-title"
                    type="text"
                    value={draft.hero_title}
                    onChange={(e) => updateField('hero_title', e.target.value)}
                    placeholder="Pakistan's Trusted Power Electronics Brand"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                      errors.hero_title ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                    }`}
                  />
                  {errors.hero_title && <p className="text-xs text-error mt-1">{errors.hero_title}</p>}
                </div>

                <div>
                  <label htmlFor="settings-hero-subtitle" className="text-xs font-semibold text-on-surface block mb-1">
                    Hero Subtitle <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="settings-hero-subtitle"
                    rows={3}
                    value={draft.hero_subtitle}
                    onChange={(e) => updateField('hero_subtitle', e.target.value)}
                    placeholder="Rugged solar charge controllers, pure sine wave inverters..."
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                      errors.hero_subtitle ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                    }`}
                  />
                  {errors.hero_subtitle && <p className="text-xs text-error mt-1">{errors.hero_subtitle}</p>}
                </div>
              </div>

              <div className="lg:col-span-5 p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">Hero Banner Image</span>
                  <button
                    type="button"
                    onClick={() => updateField('hero_image_url', DEFAULT_SITE_SETTINGS.hero_image_url)}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Use Default Image
                  </button>
                </div>
                <div className="w-full h-44 rounded-lg overflow-hidden bg-white border border-outline-variant">
                  <img
                    src={draft.hero_image_url}
                    alt="Hero banner preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label
                  htmlFor="settings-hero-upload"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">add_photo_alternate</span>
                  <span>
                    {uploadingSlot === 'hero' ? 'Uploading...' : 'Upload Hero Banner Image'}
                  </span>
                </label>
                <input
                  id="settings-hero-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  disabled={uploadingSlot !== null}
                  onChange={(e) => void handleAssetUpload(e, 'hero')}
                  className="sr-only"
                />
              </div>
            </div>
          </section>
        )}

        {/* Section D: Footer & Social Links */}
        {showSection('footer') && (
          <section className="bg-surface-container-lowest rounded-xl border border-surface-container p-6 shadow-sm">
            <div className="pb-4 mb-5 border-b border-surface-container">
              <span className="font-spec-code text-[11px] font-bold text-primary uppercase">
                SECTION 04 · STOREFRONT FOOTER &amp; CHANNELS
              </span>
              <h2 className="text-headline-sm font-bold text-on-surface">Footer &amp; Social Links</h2>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="settings-footer-text" className="text-xs font-semibold text-on-surface block mb-1">
                  Footer Brand Summary Text <span className="text-error">*</span>
                </label>
                <textarea
                  id="settings-footer-text"
                  rows={2}
                  value={draft.footer_text}
                  onChange={(e) => updateField('footer_text', e.target.value)}
                  placeholder="Pakistan's trusted power electronics brand since 2021..."
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                    errors.footer_text ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                  }`}
                />
                {errors.footer_text && <p className="text-xs text-error mt-1">{errors.footer_text}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="settings-facebook" className="text-xs font-semibold text-on-surface block mb-1">
                    Facebook Page URL
                  </label>
                  <input
                    id="settings-facebook"
                    type="url"
                    value={draft.facebook_url}
                    onChange={(e) => updateField('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/asatek.pk"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm font-spec-code bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                      errors.facebook_url ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                    }`}
                  />
                  {errors.facebook_url && <p className="text-xs text-error mt-1">{errors.facebook_url}</p>}
                </div>

                <div>
                  <label htmlFor="settings-instagram" className="text-xs font-semibold text-on-surface block mb-1">
                    Instagram Profile URL
                  </label>
                  <input
                    id="settings-instagram"
                    type="url"
                    value={draft.instagram_url}
                    onChange={(e) => updateField('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/asatek.pk"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm font-spec-code bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                      errors.instagram_url ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                    }`}
                  />
                  {errors.instagram_url && <p className="text-xs text-error mt-1">{errors.instagram_url}</p>}
                </div>

                <div>
                  <label htmlFor="settings-youtube" className="text-xs font-semibold text-on-surface block mb-1">
                    YouTube Channel URL
                  </label>
                  <input
                    id="settings-youtube"
                    type="url"
                    value={draft.youtube_url}
                    onChange={(e) => updateField('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/@asatek"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm font-spec-code bg-surface-container-lowest focus:outline-none focus:ring-2 ${
                      errors.youtube_url ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
                    }`}
                  />
                  {errors.youtube_url && <p className="text-xs text-error mt-1">{errors.youtube_url}</p>}
                </div>
              </div>
            </div>
          </section>
        )}

      </form>

      <ConfirmDialog
        open={resetDialogOpen}
        title="Reset Site Settings to ASATEK Defaults?"
        description="This restores the default ASATEK branding, crimson color (#9e0000), WhatsApp/phone numbers, hero banner, and footer settings on the live website."
        confirmLabel="Reset to Defaults"
        variant="danger"
        onConfirm={() => void handleConfirmReset()}
        onCancel={() => setResetDialogOpen(false)}
      />
    </div>
  );
};
