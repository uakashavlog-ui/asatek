import { ASSETS } from '../data/seedData';
import {
  SITE_ASSETS_BUCKET,
  SUPABASE_TABLES,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabaseClient';
import type { SiteSettings } from '../types/asatek';
import {
  SITE_ASSET_MAX_BYTES,
  STANDARD_IMAGE_MIME_TYPES,
  SVG_IMAGE_MIME_TYPES,
  normalizeSiteSettings,
  validateSiteAssetFile,
  validateSiteSettings,
} from '../utils/storeLogic';

export { SITE_ASSETS_BUCKET, isSupabaseConfigured };

export const SITE_SETTINGS_STORAGE_KEY = 'asatek_site_settings_v1';
export const SITE_SETTINGS_TABLE = SUPABASE_TABLES.siteSettings;
export const SITE_SETTINGS_ROW_ID = 'default';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: SITE_SETTINGS_ROW_ID,
  site_name: 'ASATEK',
  tagline: 'Power Electronics, Solar Controllers & Inverters',
  logo_url: ASSETS.logo,
  favicon_url: ASSETS.logo,
  primary_color: '#9e0000',
  whatsapp_number: '0300-1234567',
  phone: '0300-1234567',
  email: 'support@asatek.pk',
  address: 'Sundar Industrial Estate, Lahore, Pakistan',
  hero_title: "Pakistan's Trusted Power Electronics Brand",
  hero_subtitle:
    'Rugged solar charge controllers, pure sine wave inverters, and heavy-duty industrial battery chargers engineered specifically for the harsh grid and climate conditions of Pakistan.',
  hero_image_url: ASSETS.sc5_1260,
  footer_text:
    "Pakistan's trusted power electronics brand since 2021. Designing rugged solar charge controllers, pure sine wave inverters, and high-efficiency chargers.",
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  updated_at: new Date().toISOString(),
};

export type SiteAssetSlot = 'logo' | 'favicon' | 'hero' | 'products' | 'reviews';

export function loadLocalSiteSettings(): SiteSettings {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_SITE_SETTINGS };
  }
  try {
    const raw = window.localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SITE_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;
    return normalizeSiteSettings(parsed, DEFAULT_SITE_SETTINGS);
  } catch {
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export function persistLocalSiteSettings(settings: SiteSettings): SiteSettings {
  const normalized = normalizeSiteSettings(
    { ...settings, id: SITE_SETTINGS_ROW_ID, updated_at: new Date().toISOString() },
    DEFAULT_SITE_SETTINGS
  );
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!supabase) {
    return loadLocalSiteSettings();
  }

  try {
    const { data, error } = await supabase
      .from(SITE_SETTINGS_TABLE)
      .select('*')
      .eq('id', SITE_SETTINGS_ROW_ID)
      .maybeSingle();

    if (error || !data) {
      return loadLocalSiteSettings();
    }

    const normalized = normalizeSiteSettings(data as Partial<SiteSettings>, DEFAULT_SITE_SETTINGS);
    persistLocalSiteSettings(normalized);
    return normalized;
  } catch {
    return loadLocalSiteSettings();
  }
}

export async function saveSiteSettingsRemoteOrLocal(
  candidate: SiteSettings
): Promise<SiteSettings> {
  const validationErrors = validateSiteSettings(candidate);
  const firstError = Object.values(validationErrors)[0];
  if (firstError) {
    throw new Error(firstError);
  }

  const payload: SiteSettings = {
    ...candidate,
    id: SITE_SETTINGS_ROW_ID,
    primary_color: candidate.primary_color.trim().toLowerCase(),
    site_name: candidate.site_name.trim(),
    tagline: candidate.tagline.trim(),
    whatsapp_number: candidate.whatsapp_number.trim(),
    phone: candidate.phone.trim(),
    email: candidate.email.trim(),
    address: candidate.address.trim(),
    hero_title: candidate.hero_title.trim(),
    hero_subtitle: candidate.hero_subtitle.trim(),
    footer_text: candidate.footer_text.trim(),
    facebook_url: candidate.facebook_url.trim(),
    instagram_url: candidate.instagram_url.trim(),
    youtube_url: candidate.youtube_url.trim(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    const { data, error } = await supabase
      .from(SITE_SETTINGS_TABLE)
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to save settings to Supabase: ${error.message}`);
    }

    if (data) {
      return persistLocalSiteSettings(data as SiteSettings);
    }
  }

  return persistLocalSiteSettings(payload);
}

export async function resetSiteSettingsRemoteOrLocal(): Promise<SiteSettings> {
  const resetPayload: SiteSettings = {
    ...DEFAULT_SITE_SETTINGS,
    updated_at: new Date().toISOString(),
  };
  return saveSiteSettingsRemoteOrLocal(resetPayload);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read uploaded image data.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });
}

async function optimizeRasterImage(file: File): Promise<File> {
  const extensionHint = file.name.split('.').pop()?.toLowerCase();
  if (file.type === 'image/svg+xml' || extensionHint === 'svg') return file;

  const bitmap = await createImageBitmap(file);
  // Re-encode raster images for smaller uploads; SVG files bypass this path.
  const scale = Math.min(1, 1920 / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    throw new Error('Your browser could not prepare this image for upload. Please try another image.');
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const outputType = file.type === 'image/png' || extensionHint === 'png'
    ? 'image/png'
    : file.type === 'image/webp' || extensionHint === 'webp'
      ? 'image/webp'
      : 'image/jpeg';
  const quality = outputType === 'image/png' ? undefined : 0.85;
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error('Image compression failed. Please try a different image.')),
      outputType,
      quality
    );
  });
  const dot = file.name.lastIndexOf('.');
  const baseName = dot > 0 ? file.name.slice(0, dot) : file.name;
  const extension = outputType === 'image/png' ? 'png' : outputType === 'image/webp' ? 'webp' : 'jpg';
  return new File([blob], baseName + '.' + extension, { type: outputType, lastModified: Date.now() });
}

export async function uploadSiteAsset(
  file: File,
  slot: SiteAssetSlot
): Promise<string> {
  const allowSvg = slot === 'logo' || slot === 'favicon';
  const fileError = validateSiteAssetFile(
    { name: file.name, type: file.type, size: file.size },
    { allowSvg }
  );
  if (fileError) throw new Error(fileError);

  const optimizedFile = await optimizeRasterImage(file);

  if (supabase) {
    const safeExt = (optimizedFile.name.split('.').pop() || 'png')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const objectPath = `${slot}/${slot}-${uniqueSuffix}.${safeExt || 'png'}`;
    const uploadOptions = {
      cacheControl: '3600',
      upsert: true,
      contentType: optimizedFile.type || 'application/octet-stream',
    };

    let { error } = await supabase.storage
      .from(SITE_ASSETS_BUCKET)
      .upload(objectPath, optimizedFile, uploadOptions);

    if (error && /bucket.*not.*found/i.test(error.message)) {
      const { error: createErr } = await supabase.storage.createBucket(SITE_ASSETS_BUCKET, {
        public: true,
        fileSizeLimit: SITE_ASSET_MAX_BYTES,
        allowedMimeTypes: [...STANDARD_IMAGE_MIME_TYPES, ...SVG_IMAGE_MIME_TYPES],
      });
      if (!createErr) {
        const retry = await supabase.storage
          .from(SITE_ASSETS_BUCKET)
          .upload(objectPath, file, uploadOptions);
        error = retry.error;
      } else {
        throw new Error(
          `Supabase Storage bucket "${SITE_ASSETS_BUCKET}" does not exist yet and could not be auto-created (${createErr.message}). Create the public "${SITE_ASSETS_BUCKET}" bucket in Supabase Storage and try again.`
        );
      }
    }

    if (error) {
      throw new Error(`Upload to "${SITE_ASSETS_BUCKET}" failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(SITE_ASSETS_BUCKET)
      .getPublicUrl(objectPath);

    return publicUrlData.publicUrl;
  }

  return readFileAsDataUrl(optimizedFile);
}
