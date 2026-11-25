import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import type { SiteAssetSlot } from '../../services/siteSettingsService';
import { isValidImageUrlSyntax, validateSiteAssetFile } from '../../utils/storeLogic';

export type ImageInputMode = 'upload' | 'url';

interface ImageInputControlProps {
  label: string;
  value: string;
  onChange: (nextUrl: string) => void;
  onValidityChange?: (isValid: boolean, errorMessage?: string) => void;
  uploadFolder: SiteAssetSlot;
  allowSvg?: boolean;
  defaultUrl?: string;
  defaultButtonLabel?: string;
  previewClassName?: string;
  previewImageClassName?: string;
  previewAlt?: string;
  helperText?: string;
  inputIdPrefix: string;
  compact?: boolean;
  allowClear?: boolean;
}

export const ImageInputControl: React.FC<ImageInputControlProps> = ({
  label,
  value,
  onChange,
  onValidityChange,
  uploadFolder,
  allowSvg = false,
  defaultUrl,
  defaultButtonLabel = 'Use Default',
  previewAlt,
  helperText,
  inputIdPrefix,
  allowClear = false,
}) => {
  const { uploadSiteAsset } = useStore();
  const [urlInput, setUrlInput] = useState(value && !value.startsWith('data:') ? value : '');
  const [uploading, setUploading] = useState(false);
  const [checkingUrl, setCheckingUrl] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const checkSeqRef = useRef(0);

  useEffect(() => {
    setPreviewFailed(false);
    if (!value || !value.startsWith('data:')) setUrlInput(value || '');
  }, [value]);

  useEffect(() => () => {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
  }, [localPreviewUrl]);

  const notifyValid = (valid: boolean, err?: string) => onValidityChange?.(valid, err);

  const uploadFile = async (file?: File) => {
    if (!file) return;
    setErrorMsg(null);
    setStatusMsg(null);
    const validationError = validateSiteAssetFile(
      { name: file.name, type: file.type, size: file.size },
      { allowSvg }
    );
    if (validationError) {
      setErrorMsg(validationError);
      notifyValid(false, validationError);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return objectUrl;
    });
    setPreviewFailed(false);
    setUploading(true);
    try {
      const publicUrl = await uploadSiteAsset(file, uploadFolder);
      onChange(publicUrl);
      setUrlInput(publicUrl.startsWith('data:') ? '' : publicUrl);
      setLocalPreviewUrl(null);
      URL.revokeObjectURL(objectUrl);
      setStatusMsg(`Uploaded ${file.name}`);
      notifyValid(true);
    } catch (err) {
      setLocalPreviewUrl(null);
      URL.revokeObjectURL(objectUrl);
      const message = err instanceof Error ? err.message : 'Image upload failed.';
      setErrorMsg(message);
      notifyValid(false, message);
    } finally {
      setUploading(false);
    }
  };

  const applyUrl = (raw = urlInput) => {
    const trimmed = raw.trim();
    setStatusMsg(null);
    if (!trimmed) {
      setErrorMsg(null);
      setCheckingUrl(false);
      if (allowClear) onChange('');
      notifyValid(true);
      return;
    }
    if (!isValidImageUrlSyntax(trimmed, { allowSvg })) {
      setErrorMsg('Invalid image link');
      setCheckingUrl(false);
      notifyValid(false, 'Invalid image link');
      return;
    }

    const seq = ++checkSeqRef.current;
    setCheckingUrl(true);
    setErrorMsg(null);
    notifyValid(false, 'Checking image link...');
    const probe = new Image();
    probe.referrerPolicy = 'no-referrer';
    probe.onload = () => {
      if (checkSeqRef.current !== seq) return;
      setCheckingUrl(false);
      setPreviewFailed(false);
      setErrorMsg(null);
      onChange(trimmed);
      setStatusMsg('Image link applied');
      notifyValid(true);
    };
    probe.onerror = () => {
      if (checkSeqRef.current !== seq) return;
      setCheckingUrl(false);
      setErrorMsg('Invalid image link');
      notifyValid(false, 'Invalid image link');
    };
    probe.src = trimmed;
  };

  const handleUrlInput = (raw: string) => {
    setUrlInput(raw);
    setStatusMsg(null);
    setErrorMsg(null);
    setPreviewFailed(false);
    if (!raw.trim()) {
      checkSeqRef.current += 1;
      setCheckingUrl(false);
      return;
    }
    if (!isValidImageUrlSyntax(raw.trim(), { allowSvg })) {
      checkSeqRef.current += 1;
      setErrorMsg('Invalid image link');
      notifyValid(false, 'Invalid image link');
      return;
    }
    applyUrl(raw);
  };

  const acceptAttr = allowSvg
    ? '.jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml'
    : '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
  const previewSrc = localPreviewUrl || (
    urlInput.trim() && !errorMsg ? urlInput.trim() : value
  );

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-xl border border-surface-container bg-surface-container-low p-3 sm:p-4 flex flex-col gap-3">
      <div className="w-full min-w-0 flex items-center justify-between gap-3">
        <span className="min-w-0 break-words text-xs font-bold text-on-surface">{label}</span>
        <div className="flex shrink-0 items-center gap-3">
          {allowClear && value && (
            <button type="button" onClick={() => {
              setUrlInput('');
              setErrorMsg(null);
              setStatusMsg(null);
              onChange('');
              notifyValid(true);
            }} className="text-[11px] font-semibold text-on-surface-variant hover:text-error">
              Clear
            </button>
          )}
          {defaultUrl && (
            <button type="button" onClick={() => {
              setErrorMsg(null);
              setStatusMsg(null);
              setPreviewFailed(false);
              setUrlInput(defaultUrl);
              onChange(defaultUrl);
              notifyValid(true);
            }} className="text-[11px] font-semibold text-primary hover:underline whitespace-nowrap">
              {defaultButtonLabel}
            </button>
          )}
        </div>
      </div>

      <div className="w-full min-w-0 aspect-[16/9] max-h-64 overflow-hidden rounded-lg border border-outline-variant bg-white flex items-center justify-center p-3">
        {previewSrc && !previewFailed ? (
          <img
            src={previewSrc}
            alt={previewAlt || `${label} preview`}
            referrerPolicy="no-referrer"
            onError={() => setPreviewFailed(true)}
            onLoad={() => setPreviewFailed(false)}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-on-surface-variant/60">
            <span aria-hidden="true" className="material-symbols-outlined text-3xl">image</span>
            <span className="text-xs font-medium">{previewFailed ? 'Image preview unavailable' : 'No image selected'}</span>
          </div>
        )}
      </div>

      <div className="w-full min-w-0 flex flex-col gap-2">
        <label
          htmlFor={`${inputIdPrefix}-file`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void uploadFile(event.dataTransfer.files?.[0]);
          }}
          className="w-full min-w-0 overflow-hidden cursor-pointer rounded-lg border-2 border-dashed border-outline-variant bg-white px-3 py-4 sm:px-4 text-center hover:border-primary hover:bg-surface-container-low transition-colors"
        >
          <span className="flex flex-col items-center gap-1.5">
            <span aria-hidden="true" className="material-symbols-outlined text-2xl text-primary">cloud_upload</span>
            <span className="text-sm font-semibold text-on-surface">{uploading ? 'Uploading image...' : 'Click to upload or drag and drop'}</span>
            <span className="w-full text-[11px] leading-relaxed text-on-surface-variant break-words">
              JPG, PNG, WEBP{allowSvg ? ', SVG' : ''} (SVG for logo and favicon only)
            </span>
          </span>
        </label>
        <input
          id={`${inputIdPrefix}-file`}
          type="file"
          accept={acceptAttr}
          disabled={uploading}
          onChange={(event) => {
            void uploadFile(event.target.files?.[0]);
            event.target.value = '';
          }}
          className="sr-only"
        />
      </div>

      <div className="flex w-full min-w-0 items-center gap-3 text-[10px] font-bold tracking-widest text-on-surface-variant">
        <span className="h-px flex-1 bg-outline-variant" />
        <span>OR</span>
        <span className="h-px flex-1 bg-outline-variant" />
      </div>

      <div className="w-full min-w-0 flex flex-col gap-1.5">
        <label htmlFor={`${inputIdPrefix}-url`} className="text-xs font-semibold text-on-surface">Image URL</label>
        <div className="flex w-full min-w-0 flex-col sm:flex-row gap-2">
          <input
            id={`${inputIdPrefix}-url`}
            type="url"
            value={urlInput}
            onChange={(event) => handleUrlInput(event.target.value)}
            onBlur={() => {
              if (urlInput.trim() && !errorMsg) applyUrl();
            }}
            placeholder="https://example.com/image.png"
            className={`w-full min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 ${
              errorMsg ? 'border-error focus:ring-error/30' : 'border-outline-variant focus:ring-primary'
            }`}
          />
          <button
            type="button"
            onClick={() => applyUrl()}
            disabled={checkingUrl || !urlInput.trim()}
            className="w-full sm:w-auto shrink-0 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkingUrl ? 'Checking...' : 'Apply'}
          </button>
        </div>
        {checkingUrl && <span className="text-[11px] text-on-surface-variant">Checking image link...</span>}
        {errorMsg && <span role="alert" className="text-[11px] font-semibold text-error">{errorMsg}</span>}
        {statusMsg && !errorMsg && <span className="text-[11px] font-semibold text-tertiary">{statusMsg}</span>}
        {helperText && !errorMsg && !statusMsg && <span className="text-[11px] text-on-surface-variant">{helperText}</span>}
      </div>
    </section>
  );
};
